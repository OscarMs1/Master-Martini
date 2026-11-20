#!/usr/bin/env bash
# Levanta AWS Emulator en Docker, crea el bucket y arranca la página usando ese S3 local.
# El emulador guarda todo en memoria: al detenerlo se borran los archivos subidos.
#
#   ./emulador/iniciar.sh                  modo página: las imágenes se ven en el navegador.
#   ./emulador/iniciar.sh --verificar-firmas  el emulador exige firma SigV4 en todo.
#
# El emulador no aplica bucket policies y rechaza toda lectura sin firma, así que con
# --verificar-firmas las imágenes no se pueden ver (en AWS sí, por la política pública). En modo
# página el emulador no revisa firmas y nginx (emulador/s3.conf) bloquea las escrituras sin firma.
set -euo pipefail
export MSYS_NO_PATHCONV=1  # Git Bash en Windows: no convertir rutas de contenedor
cd "$(dirname "$0")/.."
PUERTO=9297
AUTH=off
[ "${1:-}" = "--verificar-firmas" ] && AUTH=on
docker build -q -t aws-emulator emulador >/dev/null
docker network create aws-emulator >/dev/null 2>&1 || true
docker rm -f aws-emulator >/dev/null 2>&1 || true
# Volumen nuevo en cada arranque: así no quedan el certificado ni las claves de la ejecución anterior.
docker volume rm aws-emulator-$PUERTO >/dev/null 2>&1 || true
docker volume create aws-emulator-$PUERTO >/dev/null
docker run --rm -v aws-emulator-$PUERTO:/v alpine chown 1000 /v
docker run -d --name aws-emulator --network aws-emulator \
  --cap-drop ALL --security-opt no-new-privileges --read-only \
  -e EMULATOR_TELEMETRY=off -p 127.0.0.1:$PUERTO:$PUERTO \
  -v aws-emulator-$PUERTO:/home/emulator/.aws/emulator/$PUERTO aws-emulator -a $AUTH >/dev/null
DIR=emulador/.local
mkdir -p "$DIR"
# Espera a que el emulador responda con el certificado de esta ejecución.
LISTO=0
for i in $(seq 30); do
  if docker cp aws-emulator:/home/emulator/.aws/emulator/$PUERTO/ca.pem "$DIR/ca.pem" >/dev/null 2>&1      && curl -sf --cacert "$DIR/ca.pem" https://127.0.0.1:$PUERTO/__admin/health >/dev/null 2>&1; then
    LISTO=1; break
  fi
  sleep 1
done
[ "$LISTO" = 1 ] || { echo "El emulador no respondió. Revisa: docker logs aws-emulator"; exit 1; }
if [ "$AUTH" = on ]; then
  docker cp aws-emulator:/home/emulator/.aws/emulator/$PUERTO/emulator_credentials "$DIR/credentials" >/dev/null
else
  # Sin verificación de firmas el emulador no genera claves y acepta cualquiera: se usan claves locales.
  printf '[default]
aws_access_key_id = AKIAEMULADORLOCAL000
aws_secret_access_key = emulador-sin-firmas
' > "$DIR/credentials"
fi
chmod 644 "$DIR/ca.pem"
# Claves que el emulador genera en cada arranque (cuenta 000000000000, no son claves de AWS).
awk -F' *= *' '/aws_access_key_id/{print "AWS_ACCESS_KEY_ID="$2} /aws_secret_access_key/{print "AWS_SECRET_ACCESS_KEY="$2}' \
  "$DIR/credentials" > .env.emulador
export AWS_ENDPOINT_URL=https://127.0.0.1:$PUERTO AWS_CA_BUNDLE="$DIR/ca.pem" \
  AWS_SHARED_CREDENTIALS_FILE="$DIR/credentials" AWS_REGION=us-east-1 AWS_EC2_METADATA_DISABLED=true
unset AWS_PROFILE AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
aws sts get-caller-identity --query Account --output text
aws s3api create-bucket --bucket mm-media >/dev/null
# Igual que en AWS (docs/DESPLIEGUE-AWS.md, paso 3): lectura pública solo de imagenes/ y videos/.
aws s3api put-public-access-block --bucket mm-media --public-access-block-configuration   BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
aws s3api put-bucket-policy --bucket mm-media --policy '{"Version":"2012-10-17","Statement":[{"Sid":"LecturaPublicaMedios","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":["arn:aws:s3:::mm-media/imagenes/*","arn:aws:s3:::mm-media/videos/*"]}]}'
docker compose -f compose.yaml -f compose.emulador.yaml up -d --build catalogo frontend
docker compose restart frontend >/dev/null   # nginx vuelve a leer el certificado nuevo del emulador
echo "Firmas verificadas por el emulador: $AUTH"
echo "Listo: http://localhost:8095 con imágenes en el bucket mm-media del emulador."
