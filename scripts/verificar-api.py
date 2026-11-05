"""Verificaciones REST de integración, separadas de las 14 pruebas Vitest.
Ejecutar solo contra la base académica local. Crea usuarios/pedidos de prueba.
Usa .local/config.json o ADMIN_EMAIL / ADMIN_PASSWORD del entorno.
"""
import concurrent.futures
import http.cookiejar
import json
import os
from pathlib import Path
import secrets
import sys
import urllib.error
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('API_URL', 'http://127.0.0.1:8080/api')
config_path = ROOT / '.local/config.json'
CONFIG = json.loads(config_path.read_text()) if config_path.exists() else os.environ
results = []


class Client:
    def __init__(self):
        self.cookies = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))

    def request(self, method, path, data=None, csrf=True):
        headers = {'Content-Type': 'application/json'}
        if method != 'GET' and csrf:
            _, token = self.request('GET', '/auth/csrf')
            headers[token['headerName']] = token['token']
        req = urllib.request.Request(BASE + path, method=method, headers=headers,
                                     data=json.dumps(data).encode() if data is not None else None)
        try:
            response = self.opener.open(req, timeout=20)
        except urllib.error.HTTPError as error:
            response = error
        body = response.read()
        return response.status, json.loads(body) if body else None


def check(name, condition):
    results.append({'caso': name, 'resultado': 'PASS' if condition else 'FAIL'})
    print(('PASS ' if condition else 'FAIL ') + name, flush=True)
    if not condition:
        raise AssertionError(name)


def run():
    guest, admin, client, other = Client(), Client(), Client(), Client()
    status, products = guest.request('GET', '/productos')
    check('Lectura pública de al menos 12 productos desde API', status == 200 and len(products) >= 12)
    check('Producto inexistente devuelve 404', guest.request('GET', '/productos/99999999')[0] == 404)
    check('Mi cuenta sin autenticación devuelve 401', guest.request('GET', '/auth/me')[0] == 401)
    check('Escritura sin CSRF devuelve 403', guest.request('POST', '/contactos', {}, csrf=False)[0] == 403)
    check('Inscripción sin sesión devuelve 401', guest.request('POST', '/inscripciones', {'claseId': 1})[0] == 401)
    delivery = {'nombre': 'Cliente de verificación', 'email': f'qa-{uuid.uuid4().hex[:10]}@demo.local',
                'run': '12.345.678-5', 'telefono': '+56912345678', 'region': 'Metropolitana',
                'comuna': 'Santiago', 'direccion': 'Dirección de prueba 123'}
    password = secrets.token_urlsafe(16) + '9a'
    registration = dict(delivery, password=password)
    check('El registro rechaza inyección de rol administrador', client.request('POST', '/auth/registro', dict(registration, rol='ADMINISTRADOR'))[0] == 400)
    status, profile = client.request('POST', '/auth/registro', registration)
    check('Registro crea cliente real sin exponer hash', status == 201 and profile['rol'] == 'CLIENTE' and 'passwordHash' not in profile)
    check('Correo duplicado devuelve 409', client.request('POST', '/auth/registro', registration)[0] == 409)
    check('Login incorrecto devuelve 401', client.request('POST', '/auth/login', {'email': delivery['email'], 'password': 'incorrecta123'})[0] == 401)
    check('Login válido crea sesión real', client.request('POST', '/auth/login', {'email': delivery['email'], 'password': password})[0] == 200)
    check('Sesión permite consultar perfil', client.request('GET', '/auth/me')[1]['id'] == profile['id'])
    check('Cookie de sesión HttpOnly', any(c.name == 'JSESSIONID' and c.has_nonstandard_attr('HttpOnly') for c in client.cookies))
    check('Cliente no accede a administración', client.request('GET', '/admin/usuarios')[0] == 403)
    fixture = {'nombre': 'Producto QA temporal', 'categoria': 'panaderia', 'formato': '1 kg', 'descripcion': 'Producto aislado para verificar CRUD y stock.', 'precio': 10000, 'descuento': 15, 'stock': 3, 'imagen': '/assets/images/panaderia.jpg', 'destacado': False}
    check('Cliente no crea productos por petición directa', client.request('POST', '/productos', fixture)[0] == 403)
    check('Login administrador', admin.request('POST', '/auth/login', {'email': CONFIG['ADMIN_EMAIL'], 'password': CONFIG['ADMIN_PASSWORD']})[0] == 200)
    status, product = admin.request('POST', '/productos', fixture)
    check('CREATE producto devuelve 201', status == 201)
    pid = product['id']
    check('UPDATE producto devuelve 200', admin.request('PUT', f'/productos/{pid}', dict(fixture, nombre='Producto QA editado'))[0] == 200)
    check('Stock negativo rechazado en backend', admin.request('PUT', f'/productos/{pid}', dict(fixture, stock=-1))[0] == 400)
    check('Imagen ajena a recursos autorizados rechazada', admin.request('PUT', f'/productos/{pid}', dict(fixture, imagen='https://invalid.example/photo.jpg'))[0] == 400)
    def order(payment='APROBADO', quantity=1):
        return dict(delivery, requestKey=str(uuid.uuid4()), entrega='domicilio', pago=payment, items=[{'id': pid, 'cantidad': quantity}])
    check('Cantidad negativa rechazada', client.request('POST', '/pedidos', order(quantity=-1))[0] == 400)
    check('Sobreventa rechazada con 409', client.request('POST', '/pedidos', order(quantity=4))[0] == 409)
    check('Precio enviado por navegador no aceptado', client.request('POST', '/pedidos', dict(order(), total=1))[0] == 400)
    status, rejected = client.request('POST', '/pedidos', order('RECHAZADO'))
    check('Pago rechazado guardado sin descontar stock', status == 201 and rejected['estado'] == 'RECHAZADO' and guest.request('GET', f'/productos/{pid}')[1]['stock'] == 3)
    payload = order(quantity=2)
    status, approved = client.request('POST', '/pedidos', payload)
    check('Pago aprobado recalcula totales en servidor y descuenta stock', status == 201 and approved['subtotal'] == 20000 and approved['descuento'] == 3000 and approved['total'] == 20990 and guest.request('GET', f'/productos/{pid}')[1]['stock'] == 1)
    check('Doble envío del mismo pedido devuelve 409', client.request('POST', '/pedidos', payload)[0] == 409)
    check('Historial del cliente contiene sus dos pedidos', len(client.request('GET', '/pedidos/mis-pedidos')[1]) == 2)
    second_registration = dict(registration, email=f'otro-{uuid.uuid4().hex[:10]}@demo.local')
    other.request('POST', '/auth/registro', second_registration)
    other.request('POST', '/auth/login', {'email': second_registration['email'], 'password': password})
    check('Historial aislado: otro usuario no ve pedidos ajenos', other.request('GET', '/pedidos/mis-pedidos')[1] == [])
    # Dos sesiones compiten por la última unidad del producto temporal.
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda c: c.request('POST', '/pedidos', order())[0], [client, other]))
    check('Concurrencia: una compra aprobada y una rechazada por stock', sorted(outcomes) == [201, 409] and guest.request('GET', f'/productos/{pid}')[1]['stock'] == 0)
    classes = client.request('GET', '/clases')[1]
    available = next(c for c in classes if c['cuposDisponibles'] > 0)
    cid = available['id']
    status, enrolled = client.request('POST', '/inscripciones', {'claseId': cid})
    check('Inscripción persistida y asociada al usuario', status == 201 and enrolled['usuarioId'] == profile['id'])
    check('Inscripción duplicada devuelve 409', client.request('POST', '/inscripciones', {'claseId': cid})[0] == 409)
    updated = next(c for c in client.request('GET', '/clases')[1] if c['id'] == cid)
    check('Cupo descontado y visible en Mi cuenta', updated['cuposDisponibles'] == available['cuposDisponibles'] - 1 and len(client.request('GET', '/inscripciones/mis-inscripciones')[1]) == 1)
    check('Contacto validado en servidor', guest.request('POST', '/contactos', {'nombre': 'A', 'email': 'incorrecto', 'asunto': '', 'mensaje': ''})[0] == 400)
    check('Contacto guardado sin fingir correo', guest.request('POST', '/contactos', {'nombre': 'QA Demo', 'email': 'qa@demo.local', 'asunto': 'Verificación', 'mensaje': 'Mensaje académico de integración.'})[0] == 201)
    check('Admin consulta usuarios sin hashes', all('passwordHash' not in u for u in admin.request('GET', '/admin/usuarios')[1]))
    check('Admin consulta pedidos e inscripciones', admin.request('GET', '/admin/pedidos')[0] == 200 and admin.request('GET', '/admin/inscripciones')[0] == 200)
    check('DELETE producto devuelve 204', admin.request('DELETE', f'/productos/{pid}')[0] == 204)
    check('Pedido conserva detalle tras eliminar producto', any(p['lineas'][0]['productoId'] == pid for p in client.request('GET', '/pedidos/mis-pedidos')[1]))
    check('Producto eliminado devuelve 404', guest.request('GET', f'/productos/{pid}')[0] == 404)
    check('Logout invalida sesión en servidor', client.request('POST', '/auth/logout')[0] == 204 and client.request('GET', '/auth/me')[0] == 401)
    # Datos de acceso de demostración quedan solo en la carpeta ignorada.
    local = ROOT / '.local'
    local.mkdir(exist_ok=True)
    (local / 'cliente-demo.json').write_text(json.dumps({'email': delivery['email'], 'password': password, 'id': profile['id']}, indent=2))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    try:
        run()
    finally:
        evidence = ROOT / '.local/verificacion/api-resultados.json'
        evidence.parent.mkdir(parents=True, exist_ok=True)
        evidence.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
