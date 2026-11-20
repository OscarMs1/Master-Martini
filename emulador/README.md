# Probar S3 sin AWS (AWS Emulator)

[AWS Emulator](https://github.com/aws/aws-emulator) imita la API de S3 en tu computador, así se
pueden probar la subida de imágenes y videos sin una cuenta de AWS. Corre en Docker.

```bash
./emulador/iniciar.sh                     # página con imágenes en el S3 local
./emulador/iniciar.sh --verificar-firmas  # el emulador revisa todas las firmas SigV4
./emulador/detener.sh                     # vuelve a guardar las imágenes en disco
```

`iniciar.sh` hace todo:

1. Construye la imagen del emulador.
2. Lo inicia en `127.0.0.1:9297` con la telemetría desactivada.
3. Crea el bucket `mm-media` con la misma política pública que en AWS.
4. Reinicia `catalogo` y `frontend` con `compose.emulador.yaml`.

Las claves del emulador se generan en cada arranque y quedan en `.env.emulador` y
`emulador/.local/`. Ninguno de los dos se sube a git. No son claves de AWS.

## Cómo se conecta

- El catálogo usa `S3_ENDPOINT` y el navegador usa `S3_ENDPOINT_PUBLICO`. Los dos llegan al bucket
  por nginx (`emulador/s3.conf`), en la misma dirección que la página. Así no hace falta CORS y la
  CSP queda igual.
- nginx verifica el certificado del emulador.
- En AWS, `S3_ENDPOINT` queda vacío y nada de esto se usa.

## Límites del emulador

- **Los archivos viven en memoria.** Al detener el emulador se borran. Si después se vuelve al modo
  normal, los productos que usaban esas imágenes quedan sin foto.
- **No aplica *bucket policies* y rechaza toda lectura sin firma.**
  - Con `--verificar-firmas` las imágenes no se pueden ver en el navegador. En AWS sí se ven, gracias
    a la política pública.
  - En el modo normal el emulador no revisa firmas. nginx bloquea las escrituras, borrados y
    listados que no traen firma, pero no comprueba que la firma sea válida. Esa prueba se hace con
    `--verificar-firmas`.
