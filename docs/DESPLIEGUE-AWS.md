# Despliegue en AWS Academy (Learner Lab)

Arquitectura:

```
Web y app del teléfono ──► CloudFront (HTTPS)
                              ├── /imagenes/* y /videos/*  ──► S3 (archivos)
                              └── todo lo demás            ──► EC2 con docker compose
                                                               (nginx + servicios + MySQL)
```

- **S3** guarda imágenes y videos. La web y la app usan las mismas URL.
- **EC2** corre el proyecto tal como en tu PC (`docker compose`).
- **CloudFront** entrega HTTPS gratis (`https://xxxx.cloudfront.net`). Las apps de Android e iOS
  bloquean `http://`, así que sin esto la app del teléfono no podría conectarse.

Todo se hace en la región **us-east-1 (N. Virginia)**.

---

## 1. Bucket S3

1. Ve a **S3 → Create bucket**. Usa un nombre único, por ejemplo `master-martini-medios-tunombre`, en la región us-east-1.
2. En **Block Public Access**, desmarca *Block all public access* y confirma.
   Sin esto los archivos no se pueden leer públicamente.
3. Crea el bucket. Luego ve a **Permissions → Bucket policy** y pega esta política
   (cambia `TU-BUCKET` por el nombre del bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "LecturaPublicaMedios",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": ["arn:aws:s3:::TU-BUCKET/imagenes/*", "arn:aws:s3:::TU-BUCKET/videos/*"]
  }]
}
```

4. Ve a **Permissions → CORS** y pega esta configuración. Es necesaria para que el navegador pueda
   subir videos directo a S3. Cuando tengas la URL de CloudFront (paso 5), cámbiala aquí:

```json
[{
  "AllowedMethods": ["GET", "HEAD", "PUT"],
  "AllowedOrigins": ["https://xxxx.cloudfront.net", "http://localhost:8095"],
  "AllowedHeaders": ["Content-Type"],
  "MaxAgeSeconds": 3000
}]
```

## 2. Instancia EC2

En **EC2 → Launch instance**:

| Campo | Valor |
|---|---|
| AMI | Amazon Linux 2023 |
| Tipo | `t3.large` (8 GB; con menos memoria los 4 servicios Java no caben) |
| Key pair | `vockey` (la del lab; descarga `labsuser.pem` desde *AWS Details*) |
| Security group | SSH (22) solo desde *My IP*, y HTTP (80) desde *Anywhere* |
| Almacenamiento | 30 GB gp3 |
| Advanced → IAM instance profile | **LabInstanceProfile** |
| Advanced → Metadata response hop limit | **2** |

> **El hop limit en 2 es obligatorio.** Los contenedores Docker obtienen los permisos de S3 desde
> la instancia. Con el valor 1, que viene por defecto, el servicio falla con
> *"Unable to load credentials"*.
> Si ya creaste la instancia, cámbialo en **Actions → Instance settings → Modify instance metadata options**.

Después ve a **Elastic IPs → Allocate** y asóciala a la instancia. Así la dirección no cambia cada
vez que reinicias el lab.

## 3. Preparar el servidor

Conéctate por SSH:

```bash
ssh -i labsuser.pem ec2-user@TU-ELASTIC-IP
```

Instala Docker, Compose, Buildx y git:

```bash
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo curl -SL https://github.com/docker/buildx/releases/download/v0.17.1/buildx-v0.17.1.linux-amd64 -o /usr/local/lib/docker/cli-plugins/docker-buildx
sudo chmod +x /usr/local/lib/docker/cli-plugins/*
```

Agrega 4 GB de swap, porque compilar los servicios Java consume mucha memoria:

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=4096 && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Sal con `exit` y vuelve a entrar por SSH, para que tome el grupo `docker`.

## 4. Subir y levantar el proyecto

```bash
git clone -b Felipe https://github.com/OscarMs1/Master-Martini.git
cd Master-Martini
cp .env.example .env
nano .env
```

En `.env` completa lo siguiente:

- **Todas las contraseñas** (`DB_PASSWORD`, `SERVICE_KEY`, etc.). Usa contraseñas nuevas, no las de tu PC.
  `SERVICE_KEY` debe tener al menos 32 caracteres; puedes generar una con `openssl rand -hex 32`.
- `S3_BUCKET=master-martini-medios-tunombre`
- `AWS_REGION=us-east-1`
- `MEDIA_BASE_URL=https://xxxx.cloudfront.net` y `FRONTEND_ORIGIN=https://xxxx.cloudfront.net`.
  Déjalos vacíos hasta el paso 5.
- `JWT_SECRET`: genera uno nuevo con `openssl rand -hex 32`. Firma los tokens de la web y de la app
  (ver [API.md](API.md)).
- `COOKIE_SECURE=true`, porque con CloudFront todo va por HTTPS.
- `FRONTEND_ORIGIN`: el login de la web solo funciona desde los dominios de esta lista. Si quieres
  probar antes del paso 5 entrando por `http://TU-ELASTIC-IP`, pon `FRONTEND_ORIGIN=http://TU-ELASTIC-IP`
  y `COOKIE_SECURE=false`. Cuando tengas CloudFront, vuelve a los valores de HTTPS.
- `SWAGGER_ENABLED=true` deja Swagger visible en `/swagger-ui.html`. Ponlo en `false` si no quieres
  que sea público.
- `ANTHROPIC_API_KEY=` es opcional (para el asistente).
- **No pongas** `AWS_ACCESS_KEY_ID` ni `AWS_SECRET_ACCESS_KEY`. Los permisos vienen de `LabInstanceProfile`.

Levanta el proyecto. La primera vez demora entre 10 y 15 minutos:

```bash
docker compose -f compose.yaml -f compose.aws.yaml up -d --build
```

Prueba en el navegador: `http://TU-ELASTIC-IP`.

## 5. CloudFront (HTTPS)

En **CloudFront → Create distribution**:

1. **Origen 1 (EC2):** el DNS público de la instancia (`ec2-xx-xx-xx-xx.compute-1.amazonaws.com`).
   Configura el protocolo en *HTTP only*, puerto 80.
   - **Comportamiento por defecto:** *Redirect HTTP to HTTPS*. En métodos permitidos elige *GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE*.
   - Cache policy: **CachingDisabled**. Origin request policy: **AllViewer**. Sin esto, el login y el carrito no funcionan.
2. **Origen 2 (S3):** agrega el bucket como origen.
   - Crea dos **behaviors**, `imagenes/*` y `videos/*`, que apunten al origen S3.
     Usa *Redirect HTTP to HTTPS* y la cache policy **CachingOptimized**.
3. Espera a que el estado diga *Deployed*. Esto tarda unos minutos. Copia el dominio (`https://dxxxx.cloudfront.net`).

Luego vuelve a la EC2 y aplica el dominio:

```bash
nano .env   # MEDIA_BASE_URL=https://dxxxx.cloudfront.net  y  FRONTEND_ORIGIN=https://dxxxx.cloudfront.net
docker compose -f compose.yaml -f compose.aws.yaml up -d
```

Por último, actualiza el CORS del bucket (paso 1.4) con ese mismo dominio.

## 6. Cómo funcionan los medios

| Qué | Cómo |
|---|---|
| Subir imagen (admin) | `POST /api/v1/admin/imagenes` con multipart `archivo`. Responde `{"url": "/api/v1/imagenes/<id>.png"}` |
| Ver imagen | `GET /api/v1/imagenes/<id>.png` responde `302` al archivo en CloudFront o S3 |
| Subir video (admin) | 1) `POST /api/v1/admin/videos` con `{"tipo": "video/mp4", "tamano": 12345678}`. 2) Haz `PUT` del archivo a la URL de `subida`, con la cabecera `Content-Type` indicada. 3) Guarda la `url` (`/api/v1/videos/<id>.mp4`) |
| Ver video | `GET /api/v1/videos/<id>.mp4` responde `302` al archivo en CloudFront o S3 |

- Los videos pueden ser MP4, WEBM o MOV, de hasta 200 MB. La URL firmada dura 15 minutos.
- **App del teléfono:** inicia sesión con `POST /api/v1/auth/token` y envía `Authorization: Bearer <token>`
  (ver [API.md](API.md)). Usa `https://dxxxx.cloudfront.net` como base. Las referencias `/api/...` se
  anteponen con ese dominio. Las librerías de imágenes y video siguen la redirección `302` solas.
- En tu PC, con `S3_BUCKET` vacío, todo sigue igual: las imágenes quedan en el volumen `uploads`
  y la subida de videos responde *"requiere S3"*.

## 7. Cada vez que abras el lab

- Las sesiones del Learner Lab duran unas 4 horas. Al terminar, la EC2 se **apaga** pero no se borra.
- Para volver a usarla: **Start Lab → EC2 → Start instance**. Los contenedores arrancan solos
  (`restart: unless-stopped`). La Elastic IP y CloudFront se mantienen.
- **Cuida los créditos.** Apaga la EC2 cuando no la uses. Si los créditos se acaban, el lab se borra con todo.

## 8. Actualizar el código

```bash
cd Master-Martini && git pull
docker compose -f compose.yaml -f compose.aws.yaml up -d --build
```

## Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| Al subir una imagen: *Unable to load credentials* en `docker compose logs catalogo` | Falta el **LabInstanceProfile** o el hop limit no es 2 (paso 2) |
| Al subir una imagen: *Access Denied* | El bucket está en otra región o tiene otro nombre que `S3_BUCKET` |
| Las imágenes no cargan (403) | Falta la bucket policy o *Block Public Access* sigue activado |
| La subida de video falla en el navegador por CORS | El CORS del bucket no incluye tu dominio de CloudFront |
| Login responde *"Origen no permitido"* (403) | `FRONTEND_ORIGIN` no tiene el dominio exacto con el que entras (`https://dxxxx.cloudfront.net`) |
| La sesión se pierde al recargar la página | `COOKIE_SECURE=true` pero entras por `http://`, o la cache policy no es *CachingDisabled* y *AllViewer* |
| La compilación se cae por memoria | Falta el swap del paso 3, o la instancia es más chica que `t3.large` |
