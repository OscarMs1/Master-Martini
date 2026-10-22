import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { ShopProvider } from '../contexts/ShopContext';
import ProductCard from '../components/ProductCard';
import ProductMedia from '../components/ProductMedia';
import { Header, Footer } from '../components/SiteLayout';
import { Catalog, ProductDetail } from '../pages/ShopPages';
import { Cart, Checkout, PurchaseResult } from '../pages/CartCheckout';
import { Login, Register, MyAccount, Admin, ProtectedAdmin } from '../pages/AccountAdmin';
import { Contact } from '../pages/InfoPages';
import Clases from '../pages/Clases';
import { clases } from '../data/clases';

const product = { id: 'QA-1', name: 'Crema QA', price: 10000, discount: 10, stock: 2, category: 'retail', image: '/assets/producto-respaldo.svg' };
const client = { name: 'Ana Pérez', run: '12.345.678-5', email: 'cliente@demo.cl', phone: '+56912345678', region: 'Metropolitana de Santiago', commune: 'Santiago', address: 'Calle Prueba 123', role: 'cliente' };
const store = (key, data) => localStorage.setItem('mm-ep2-' + key, JSON.stringify(data));
const read = key => JSON.parse(localStorage.getItem('mm-ep2-' + key));
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = name => fireEvent.click(screen.getByRole('button', { name }));
function Location() { const l = useLocation(); return <output aria-label="Ruta actual">{l.pathname + l.search}</output>; }
function mount(element, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><ShopProvider>{element}<Location /></ShopProvider></MemoryRouter>);
}
function checkoutPage() {
  return mount(<Routes>
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/compra-exitosa/:id" element={<PurchaseResult success />} />
    <Route path="/compra-rechazada" element={<PurchaseResult success={false} />} />
  </Routes>, '/checkout');
}
function seedCart() { store('products', [product]); store('cart', [{ id: product.id, qty: 1 }]); }

describe('Props, eventos y recursos', () => {
  it('C01 actualiza precio, descuento, enlace y callback al cambiar props', () => {
    const onAdd = vi.fn();
    const view = render(<MemoryRouter><ProductCard product={product} onAdd={onAdd} /></MemoryRouter>);
    expect(screen.getByText('-10%')).toBeTruthy();
    expect(screen.getByText('$9.000', { exact: false })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver Crema QA' }).getAttribute('href')).toBe('/producto/QA-1');
    click('Agregar Crema QA al carrito');
    expect(onAdd).toHaveBeenCalledWith(product);
    view.rerender(<MemoryRouter><ProductCard product={{ ...product, name: 'Crema nueva', discount: 0, stock: 0 }} onAdd={onAdd} /></MemoryRouter>);
    expect(screen.queryByText('-10%')).toBeNull();
    expect(screen.getByRole('button').disabled).toBe(true);
    fireEvent.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
  it('C02 utiliza respaldos tras errores de imagen y se recupera con nuevas props', () => {
    const view = render(<ProductMedia product={{ ...product, remoteImage: 'https://example.invalid/photo.jpg', image: '/local.jpg' }} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img').getAttribute('src')).toBe('/local.jpg');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img').getAttribute('src')).toBe('/assets/producto-respaldo.svg');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Imagen temporalmente no disponible');
    view.rerender(<ProductMedia product={product} variant="detail" />);
    expect(screen.getByRole('img').getAttribute('src')).toBe(product.image);
    expect(screen.getByRole('img').getAttribute('loading')).toBe('eager');
  });
});

describe('Catálogo, navegación y estado compartido', () => {
  it('C03 busca, combina categoría y recupera resultados vacíos', () => {
    mount(<Catalog />);
    expect(screen.getAllByTestId('product-card')).toHaveLength(12);
    click('Gelatería');
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    change('Buscar productos', 'imposible-qa');
    expect(screen.queryAllByTestId('product-card')).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'No encontramos productos' })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Ver catálogo completo' }));
    expect(screen.getAllByTestId('product-card')).toHaveLength(12);
    change('Buscar productos', 'Gran Master Hoja');
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);
  });
  it('C04 ordena precios con descuento y nombres sin alterar el catálogo', () => {
    store('products', [product, { ...product, id: 'QA-2', name: 'Alfa', price: 9500, discount: 0 }]);
    mount(<Catalog />);
    change('Ordenar productos', 'low');
    expect(within(screen.getAllByTestId('product-card')[0]).getByText('Crema QA')).toBeTruthy();
    change('Ordenar productos', 'high');
    expect(within(screen.getAllByTestId('product-card')[0]).getByText('Alfa')).toBeTruthy();
    change('Ordenar productos', 'az');
    expect(within(screen.getAllByTestId('product-card')[0]).getByText('Alfa')).toBeTruthy();
    expect(read('products')[0].id).toBe('QA-1');
  });
  it('C05 las ofertas excluyen productos sin descuento', () => {
    store('products', [product, { ...product, id: 'QA-2', name: 'Sin oferta', discount: 0 }]);
    mount(<Catalog onlyOffers />);
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    expect(screen.queryByText('Sin oferta')).toBeNull();
  });
  it('C06 detalle limita cantidad al stock y actualiza el contador compartido', () => {
    store('products', [product]);
    mount(<><Header /><Routes><Route path="/producto/:id" element={<ProductDetail />} /></Routes></>, '/producto/QA-1');
    click('Reducir cantidad'); click('Aumentar cantidad'); click('Aumentar cantidad');
    click('Añadir al carrito');
    expect(read('cart')).toEqual([{ id: 'QA-1', qty: 2 }]);
    expect(screen.getByRole('link', { name: 'Carrito con 2 productos' })).toBeTruthy();
    click('Añadir al carrito');
    expect(read('cart')[0].qty).toBe(2);
  });
  it('C07 menú móvil y búsqueda navegan y cierran sus estados', () => {
    mount(<Header />);
    click('Abrir menú');
    expect(screen.getByRole('button', { name: 'Cerrar menú' }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('link', { name: 'Tienda', exact: true }));
    expect(screen.getByLabelText('Ruta actual').textContent).toBe('/catalogo');
    expect(screen.getByRole('button', { name: 'Abrir menú' }).getAttribute('aria-expanded')).toBe('false');
    click('Abrir búsqueda'); change('Buscar productos', ' crema '); click('Buscar');
    expect(screen.getByLabelText('Ruta actual').textContent).toBe('/catalogo?q=crema');
    expect(screen.queryByRole('searchbox')).toBeNull();
    click('Nuestras líneas'); fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Nuestras líneas' }).getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Carrito y checkout reales', () => {
  it('C08 cambia cantidades, totales, stock y elimina el último artículo', () => {
    seedCart(); mount(<Cart />);
    click('Aumentar Crema QA'); click('Aumentar Crema QA');
    expect(read('cart')[0].qty).toBe(2);
    expect(screen.getByText('$21.990')).toBeTruthy();
    click('Reducir Crema QA');
    expect(read('cart')[0].qty).toBe(1);
    expect(screen.getByText('$12.990')).toBeTruthy();
    click('Eliminar');
    expect(read('cart')).toEqual([]);
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeTruthy();
  });
  it('C09 vacía el carrito completo', () => {
    seedCart(); mount(<Cart />); click('Vaciar carrito');
    expect(read('cart')).toEqual([]);
    expect(screen.getByRole('link', { name: /Explorar catálogo/ }).getAttribute('href')).toBe('/catalogo');
  });
  it('C10 bloquea campos inválidos y limpia comuna al cambiar región', () => {
    seedCart(); checkoutPage(); click(/Confirmar pedido/);
    expect(screen.getByLabelText('RUN *').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Dirección de entrega *').getAttribute('aria-invalid')).toBe('true');
    expect(read('orders')).toEqual([]);
    expect(screen.getByLabelText('Ruta actual').textContent).toBe('/checkout');
    change('Región *', client.region); change('Comuna *', client.commune);
    change('Región *', '');
    expect(screen.getByLabelText('Comuna *').value).toBe('');
  });
  it('C11 precarga cliente, aplica retiro y aprueba guardando pedido y stock', async () => {
    seedCart(); store('user', client); checkoutPage();
    expect(screen.getByLabelText('Nombre completo *').value).toBe(client.name);
    fireEvent.click(screen.getByLabelText('Retiro coordinado (demo)'));
    expect(screen.getByText('Gratis')).toBeTruthy();
    click(/Confirmar pedido/);
    expect(await screen.findByRole('heading', { name: '¡Tu pedido fue confirmado!' })).toBeTruthy();
    expect(read('cart')).toEqual([]);
    expect(read('products')[0].stock).toBe(1);
    expect(read('orders')).toHaveLength(1);
    expect(read('orders')[0]).toMatchObject({ userId: client.email, total: 9000, details: { delivery: 'retiro' } });
  });
  it('C12 rechazo conserva carrito y stock sin crear un pedido', async () => {
    seedCart(); store('user', client); checkoutPage();
    fireEvent.click(screen.getByLabelText('Simular pago rechazado')); click(/Confirmar pedido/);
    expect(await screen.findByRole('heading', { name: 'Pago rechazado' })).toBeTruthy();
    expect(read('cart')).toEqual([{ id: product.id, qty: 1 }]);
    expect(read('orders')).toEqual([]);
    expect(read('products')[0].stock).toBe(2);
  });
  it('C13 impide confirmar stock insuficiente y carrito vacío', () => {
    seedCart(); store('cart', [{ id: product.id, qty: 3 }]); store('user', client);
    const view = checkoutPage(); click(/Confirmar pedido/);
    expect(screen.getByRole('alert').textContent).toMatch(/sin stock/);
    expect(read('orders')).toEqual([]);
    view.unmount(); store('cart', []); checkoutPage();
    expect(screen.getByRole('heading', { name: 'No hay productos para comprar' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Confirmar pedido/ })).toBeNull();
  });
});

describe('Cuentas, formularios y administración', () => {
  it('C14 login rechaza credenciales incorrectas y acepta perfil cliente', () => {
    mount(<Login />); change('Correo electrónico', client.email); change('Contraseña', 'incorrecta'); click('Entrar a mi cuenta');
    expect(screen.getByRole('alert').textContent).toMatch(/Credenciales inválidas/);
    expect(read('user')).toBeNull();
    change('Contraseña', 'Cliente123'); click('Entrar a mi cuenta');
    expect(read('user').role).toBe('cliente');
    expect(read('user').password).toBeUndefined();
    expect(screen.getByLabelText('Ruta actual').textContent).toBe('/mi-cuenta');
  });
  it('C15 login administrador navega al panel y no persiste contraseña', () => {
    mount(<Login />); change('Correo electrónico', 'admin@demo.cl'); change('Contraseña', 'Admin123'); click('Entrar a mi cuenta');
    expect(read('user')).toMatchObject({ role: 'admin', email: 'admin@demo.cl' });
    expect(read('user').password).toBeUndefined();
    expect(screen.getByLabelText('Ruta actual').textContent).toBe('/admin');
  });
  it('C16 registro valida, confirma contraseña y guarda perfil sin contraseña', () => {
    mount(<Register />); click('Registrarme');
    expect(screen.getByLabelText('RUN *').getAttribute('aria-invalid')).toBe('true');
    for (const [label,value] of Object.entries({ 'Nombre *':'Ana', 'Apellido *':'Pérez', 'RUN *':client.run, 'Correo *':client.email, 'Teléfono':client.phone, 'Dirección *':client.address, 'Región *':client.region, 'Comuna *':client.commune, 'Contraseña (4 a 10 caracteres) *':'Clave123', 'Confirmar contraseña *':'Otra123' })) change(label,value);
    click('Registrarme'); expect(screen.getByText('Las contraseñas deben coincidir.')).toBeTruthy();
    change('Confirmar contraseña *','Clave123'); click('Registrarme');
    expect(read('clients')[0]).toMatchObject({ name:'Ana Pérez', role:'cliente' });
    expect(read('clients')[0].password).toBeUndefined();
    expect(screen.getByLabelText('Ruta actual').textContent).toBe('/mi-cuenta');
  });
  it('C17 protege administración contra visitantes y clientes', () => {
    const view = mount(<ProtectedAdmin><p>Contenido privado</p></ProtectedAdmin>);
    expect(screen.queryByText('Contenido privado')).toBeNull();
    expect(screen.getByLabelText('Ruta actual').textContent).toBe('/login');
    view.unmount(); store('user', client);
    mount(<ProtectedAdmin><p>Contenido privado</p></ProtectedAdmin>);
    expect(screen.queryByText('Contenido privado')).toBeNull();
  });
  it('C18 CRUD valida, crea, edita y elimina con persistencia', async () => {
    store('user', { ...client, role:'admin' }); mount(<Admin />);
    click('Nuevo producto'); change('Código SKU *','QA-CRUD'); click('Guardar producto');
    expect(screen.getByText('Ingresa un nombre.')).toBeTruthy();
    change('Nombre *','Producto CRUD'); change('Precio CLP *','1500'); change('Stock *','4');
    click('Guardar producto'); await screen.findByText('Producto creado correctamente.');
    expect(read('products').find(p=>p.id==='QA-CRUD')).toMatchObject({ price:1500, stock:4 });
    click('Editar Producto CRUD'); expect(screen.getByLabelText('Código SKU *').disabled).toBe(true);
    change('Nombre *','Producto editado'); click('Guardar producto'); await screen.findByText('Producto actualizado.');
    expect(read('products').find(p=>p.id==='QA-CRUD').name).toBe('Producto editado');
    const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);
    click('Eliminar Producto editado'); expect(read('products').some(p=>p.id==='QA-CRUD')).toBe(true);
    confirm.mockReturnValue(true); click('Eliminar Producto editado'); await screen.findByText('Producto eliminado.');
    expect(read('products').some(p=>p.id==='QA-CRUD')).toBe(false);
  });
  it('C19 vendedor puede editar pero no ve eliminar; consulta pestañas', () => {
    store('user', { ...client, role:'vendedor' }); mount(<Admin />);
    expect(screen.queryByRole('button', { name:/^Eliminar / })).toBeNull();
    change('Buscar productos en administración', 'inexistente');
    expect(screen.queryByRole('button', { name:/^Editar / })).toBeNull();
    click('Pedidos'); expect(screen.getByText('Aún no hay pedidos. Finaliza un checkout de prueba.')).toBeTruthy();
    click('Usuarios'); expect(screen.getByText('admin@demo.cl')).toBeTruthy();
  });
  it('C20 cuenta filtra pedidos por cliente y permite cerrar sesión', () => {
    store('user',client);
    store('orders',[{id:'MIO',userId:client.email,total:9000,status:'Aprobado',date:'2026-10-22'}, {id:'AJENO',userId:'otro@demo.cl',total:1,status:'Aprobado'}]);
    mount(<Routes><Route path="/mi-cuenta" element={<MyAccount />} /><Route path="/" element={<p>Inicio</p>} /><Route path="/login" element={<Login />} /></Routes>, "/mi-cuenta");
    expect(screen.getByText('MIO')).toBeTruthy(); expect(screen.queryByText('AJENO')).toBeNull();
    click('Cerrar sesión'); expect(read('user')).toBeNull();
    expect(screen.queryByText('MIO')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
  });
  it('C21 contacto no confirma campos inválidos y confirma datos válidos', () => {
    mount(<Contact />); click(/Enviar consulta/);
    expect(screen.getByText('Escribe al menos 10 caracteres.')).toBeTruthy();
    change('Nombre *','Ana'); change('Correo *','ana@example.cl'); change('Asunto *','Consulta'); change('Mensaje *','Quiero información sobre productos');
    click(/Enviar consulta/); expect(screen.getByRole('alert').textContent).toMatch(/Mensaje simulado enviado/);
    expect(screen.queryByRole('textbox',{name:'Mensaje *'})).toBeNull();
  });
  it('C22 suscripción cambia a confirmación local', () => {
    mount(<Footer />); change('Correo electrónico','ana@example.cl'); click('Suscribirme');
    expect(screen.getByText(/¡Gracias! Tu correo/).getAttribute('role')).toBe('status');
    expect(screen.queryByRole('button', {name:'Suscribirme'})).toBeNull();
  });
});

describe('Clases y recuperación de datos', () => {
  it('C23 inscribe una sola vez, persiste cupos y muestra clase en Mi cuenta', () => {
    store('user',client);
    const view=mount(<Clases />);
    const card=screen.getAllByTestId('clase-card')[0];
    fireEvent.click(within(card).getByRole('button',{name:'Inscribirme'}));
    expect(within(card).queryByRole('button',{name:'Inscribirme'})).toBeNull();
    expect(read('clases')).toEqual([clases[0].id]);
    expect(within(card).getByText(`${clases[0].cupos-1} cupos disponibles`)).toBeTruthy();
    view.unmount(); const account=mount(<MyAccount />);
    expect(screen.getByText(clases[0].titulo)).toBeTruthy();
    account.unmount(); mount(<Clases />);
    expect(within(screen.getAllByTestId('clase-card')[0]).queryByRole('button',{name:'Inscribirme'})).toBeNull();
  });
  it('C24 agrega todos los insumos y respeta stock al repetir', () => {
    mount(<Clases />);
    const card=screen.getAllByTestId('clase-card')[0];
    fireEvent.click(within(card).getByRole('button',{name:'Agregar insumos al carrito'}));
    for (const i of clases[0].insumos) expect(read('cart').find(p=>p.id===i.id).qty).toBe(i.cantidad);
    for(let n=0;n<30;n++) fireEvent.click(within(card).getByRole('button',{name:'Agregar insumos al carrito'}));
    for(const line of read('cart')) expect(line.qty).toBeLessThanOrEqual(read('products').find(p=>p.id===line.id).stock);
    click('Presencial');
    expect(screen.getAllByTestId('clase-card')).toHaveLength(clases.filter(c=>c.modalidad==='Presencial').length);
  });
  it('C25 recupera datos inválidos de almacenamiento sin pantalla vacía', () => {
    localStorage.setItem('mm-ep2-products','{roto'); store('cart',[{id:'QA',qty:-1}]); store('user',[]); store('orders',{}); store('clases',{});
    mount(<><Catalog /><Header /></>);
    expect(screen.getAllByTestId('product-card')).toHaveLength(12);
    expect(read('cart')).toEqual([]); expect(read('user')).toBeNull();
  });
  it('C26 fallo de API bloquea checkout sin mutar stock ni pedidos', async () => {
    seedCart(); store('user',client); window.__MM_API_ENABLED__=true;
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('Servidor caído')));
    checkoutPage();
    await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(2));
    click(/Confirmar pedido/);
    expect(await screen.findByText('La API no está disponible para confirmar el pedido.')).toBeTruthy();
    expect(read('orders')).toEqual([]); expect(read('products')[0].stock).toBe(2);
  });
});
