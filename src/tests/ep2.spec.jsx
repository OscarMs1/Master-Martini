/** EP2 DSY1104: pruebas de renderizado, props, estado, eventos, DOM, formularios, CRUD y mocks. */
import React from 'react';
import {render,screen,fireEvent,cleanup,within,act,waitFor} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {ShopProvider,useShop} from '../contexts/ShopContext';
import ProductCard,{ProductGrid} from '../components/ProductCard';
import Home from '../pages/Home';
import {Footer,Header} from '../components/SiteLayout';
import {Catalog,ProductDetail} from '../pages/ShopPages';
import {Cart,Checkout,PurchaseResult} from '../pages/CartCheckout';
import {initialProducts} from '../data/catalog';
import {Field} from '../components/FormFields';
import ProductMedia from '../components/ProductMedia';
import {Login,ProtectedAdmin,Admin} from '../pages/AccountAdmin';
import {addCart,filteredProducts,netPrice,subtotal,validRun,validateCheckout,validateProduct,cartIsAvailable,shipping} from '../utils/commerce';
import {createProduct,updateProduct,deleteProduct} from '../utils/storage';
const p=initialProducts[0];
const wrapper=children=><MemoryRouter><ShopProvider>{children}</ShopProvider></MemoryRouter>;
const withCart=()=>localStorage.setItem('mm-ep2-cart',JSON.stringify([{id:p.id,qty:1}]));
describe('EP2 — React frontend con Jasmine y Karma',()=>{
 beforeEach(()=>{localStorage.clear();delete window.__MM_API_ENABLED__;});
 afterEach(()=>{cleanup();delete window.__MM_API_ENABLED__;});
 it('T01 — ProductCard renderiza nombre y formato usando props',()=>{
  render(<MemoryRouter><ProductCard product={p} onAdd={()=>{}}/></MemoryRouter>);
  expect(screen.getByText(p.name)).toBeTruthy();
  expect(screen.getByText(new RegExp(p.format))).toBeTruthy();
  expect(screen.getByRole('img',{name:p.name})).toBeTruthy();
 });
 it('T02 — ProductGrid presenta una tarjeta por cada producto recibido',()=>{
  render(<MemoryRouter><ProductGrid products={initialProducts.slice(0,4)} onAdd={()=>{}}/></MemoryRouter>);
  expect(screen.getAllByTestId('product-card').length).toBe(4);
 });
 it('T03 — Filtro por categoría devuelve exclusivamente elementos correspondientes',()=>{
  const result=filteredProducts(initialProducts,'','gelateria');
  expect(result.length).toBeGreaterThan(0);
  expect(result.every(x=>x.category==='gelateria')).toBeTrue();
 });
 it('T04 — Catálogo muestra mensaje condicional si la búsqueda no tiene resultados',()=>{
  render(<MemoryRouter initialEntries={['/catalogo?q=zzzzNoExisteXYZ']}><ShopProvider><Routes><Route path="/catalogo" element={<Catalog/>}/></Routes></ShopProvider></MemoryRouter>);
  expect(screen.getByText('No encontramos productos')).toBeTruthy();
  expect(screen.queryByTestId('product-card')).toBeNull();
 });
 it('T05 — Evento de click ejecuta la función onAdd recibida por props',()=>{
  const spy=jasmine.createSpy('onAdd');
  render(<MemoryRouter><ProductCard product={p} onAdd={spy}/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:`Agregar ${p.name} al carrito`}));
  expect(spy).toHaveBeenCalledOnceWith(p);
 });
 it('T06 — addCart respeta el stock y aumenta la cantidad sin duplicar filas',()=>{
  let cart=addCart([],p,1);cart=addCart(cart,p,2);
  expect(cart.length).toBe(1);expect(cart[0].qty).toBe(3);
  expect(addCart(cart,{...p,stock:3},1)).toEqual(cart);
 });
 it('T07 — DOM carrito: aumentar cantidad actualiza el subtotal',()=>{
  withCart();render(wrapper(<Cart/>));
  const old=subtotal([{id:p.id,qty:1}],initialProducts);
  expect(screen.getAllByText(/\$5\.391/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button',{name:`Aumentar ${p.name}`}));
  expect(screen.getAllByText(/\$10\.782/).length).toBeGreaterThan(0);
 });
 it('T08 — DOM carrito: eliminar artículo activa estado vacío',()=>{
  withCart();render(wrapper(<Cart/>));
  fireEvent.click(screen.getByRole('button',{name:/Eliminar/i}));
  expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
 });
 it('T09 — Validación RUN usa dígito verificador y rechaza casos inválidos',()=>{
  expect(validRun('12.345.678-5')).toBeTrue();
  expect(validRun('12.345.678-6')).toBeFalse();
  expect(validRun('cualquier cosa')).toBeFalse();
 });
 it('T10 — Formulario checkout rechaza datos inválidos antes de finalizar',()=>{
  withCart();render(wrapper(<Checkout/>));
  fireEvent.click(screen.getByRole('button',{name:/Confirmar pedido/i}));
  expect(screen.getByText(/RUN inválido/i)).toBeTruthy();
  expect(screen.getByText(/Revisa los campos resaltados/i)).toBeTruthy();
 });
 it('T11 — CRUD crear, modificar y eliminar devuelve listas inmutables',()=>{
  const nuevo={...p,id:'TEST-100',name:'Nuevo producto'};
  const added=createProduct(initialProducts,nuevo);
  expect(added.length).toBe(initialProducts.length+1);
  const changed=updateProduct(added,'TEST-100',{name:'Renombrado',price:777});
  expect(changed.find(x=>x.id==='TEST-100').name).toBe('Renombrado');
  expect(deleteProduct(changed,'TEST-100').some(x=>x.id==='TEST-100')).toBeFalse();
 });
 it('T12 — Validaciones impiden precio/stock negativos y checkout sin dirección',()=>{
  expect(validateProduct({...p,price:-1,stock:-10}).price).toBeTruthy();
  expect(validateProduct({...p,price:-1,stock:-10}).stock).toBeTruthy();
  expect(validateCheckout({name:'Ana Pérez',run:'12.345.678-5',email:'ana@mail.cl',phone:'+56912345678',region:'Metropolitana de Santiago',commune:'Santiago',address:'',delivery:'domicilio'}).address).toBeTruthy();
 });
 it('T13 — Slider de inicio: punto 2 cambia el título activo',()=>{
  render(wrapper(<Home/>));
  expect(screen.getByText('Ingredientes para')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/Ir a diapositiva 2:/}));
  expect(screen.getByRole('heading',{name:'Pasión por la panadería profesional'})).toBeTruthy();
 });
 it('T14 — Filtros React de portada cambian tarjetas sin recargar',()=>{
  render(wrapper(<Home/>));
  expect(screen.getAllByTestId('product-card').length).toBe(3);
  fireEvent.click(screen.getByRole('button',{name:'Gelatería'}));
  expect(screen.getAllByTestId('product-card').length).toBe(2);
  expect(screen.getByText('Base Gelato Blanca UHT')).toBeTruthy();
 });
 it('T15 — Newsletter de muestra confirma suscripción',()=>{
  render(wrapper(<Footer/>));
  fireEvent.change(screen.getByLabelText('Correo electrónico'),{target:{value:'academico@example.com'}});
  fireEvent.click(screen.getByRole('button',{name:/Suscribirme/i}));
  expect(screen.getByRole('status').textContent).toContain('quedó registrado');
 });
 it('T16 — Campo accesible expone error y aria-invalid',()=>{
  render(<Field name="demo" label="Campo de prueba" value="" onChange={()=>{}} error="Obligatorio"/>);
  expect(screen.getByLabelText('Campo de prueba').getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByRole('alert').textContent).toBe('Obligatorio');
 });
 it('T17 — Campo correcto no presenta error',()=>{
  render(<Field name="demo" label="Campo de prueba" value="OK" onChange={()=>{}}/>);
  expect(screen.getByLabelText('Campo de prueba').getAttribute('aria-invalid')).toBe('false');
  expect(screen.queryByRole('alert')).toBeNull();
 });
 it('T18 — Imagen de producto usa respaldo local cuando falla la URL remota',()=>{
  render(<ProductMedia product={{...p,remoteImage:'https://test.invalid/producto.jpg',image:'/assets/prod-gran-master.png'}}/>);
  const photo=screen.getByRole('img',{name:p.name});
  fireEvent.error(photo);
  expect(photo.getAttribute('src')).toBe('/assets/prod-gran-master.png');
 });
 it('T19 — Producto agotado deshabilita botón añadir',()=>{
  render(<MemoryRouter><ProductCard product={{...p,stock:0}} onAdd={()=>{}}/></MemoryRouter>);
  expect(screen.getByRole('button',{name:`Agregar ${p.name} al carrito`}).disabled).toBeTrue();
 });
 it('T20 — La navbar muestra enlace de inicio y lista de categorías',()=>{
  render(wrapper(<Header/>));
  expect(screen.getByRole('link',{name:'Inicio'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Nuestras líneas'}));
  expect(screen.getByRole('button',{name:'Nuestras líneas'}).getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('link',{name:'Catálogo completo'})).toBeTruthy();
 });
 it('T21 — Navbar móvil abre y cierra menú con estado React',()=>{
  const {container}=render(wrapper(<Header/>));
  const button=container.querySelector('button.mobile-only');
  expect(button).toBeTruthy();
  fireEvent.click(button);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(button);
  expect(button.getAttribute('aria-expanded')).toBe('false');
 });
 it('T22 — El catálogo filtra por nombre desde un input controlado',()=>{
  render(<MemoryRouter initialEntries={['/catalogo']}><ShopProvider><Routes><Route path="/catalogo" element={<Catalog/>}/></Routes></ShopProvider></MemoryRouter>);
  fireEvent.change(screen.getByRole('searchbox',{name:'Buscar productos'}),{target:{value:'Bravo Crem'}});
  expect(screen.getAllByTestId('product-card').length).toBe(1);
  expect(screen.getByText('Bravo Crem')).toBeTruthy();
 });
 it('T23 — Detalle de SKU inexistente entrega mensaje de error',()=>{
  render(<MemoryRouter initialEntries={['/producto/INVALIDO']}><ShopProvider><Routes><Route path="/producto/:id" element={<ProductDetail/>}/></Routes></ShopProvider></MemoryRouter>);
  expect(screen.getByText('No existe el producto solicitado.')).toBeTruthy();
 });
 it('T24 — ProtectedAdmin rechaza usuarios anónimos y redirige a login',()=>{
  render(<MemoryRouter initialEntries={['/admin']}><ShopProvider><Routes><Route path="/admin" element={<ProtectedAdmin><p>SECRETO</p></ProtectedAdmin>}/><Route path="/login" element={<p>Login protegido</p>}/></Routes></ShopProvider></MemoryRouter>);
  expect(screen.getByText('Login protegido')).toBeTruthy();
  expect(screen.queryByText('SECRETO')).toBeNull();
 });
 it('T25 — Inicio de sesión inválido informa error de credenciales',()=>{
  render(wrapper(<Login/>));
  fireEvent.change(screen.getByLabelText('Correo electrónico'),{target:{value:'invalido@correo.cl'}});
  fireEvent.change(screen.getByLabelText('Contraseña'),{target:{value:'error'}});
  fireEvent.click(screen.getByRole('button',{name:'Entrar a mi cuenta'}));
  expect(screen.getByRole('alert').textContent).toContain('Credenciales inválidas');
 });
 it('T26 — Context API: clic modifica cartCount y persiste en almacenamiento',async()=>{
  function Consumer(){const s=useShop();return <><output data-testid="counter">{s.cartCount}</output><button onClick={()=>s.add(p,1)}>Añadir uno</button></>}
  render(wrapper(<Consumer/>));
  expect(screen.getByTestId('counter').textContent).toBe('0');
  fireEvent.click(screen.getByRole('button',{name:'Añadir uno'}));
  expect(screen.getByTestId('counter').textContent).toBe('1');
  await waitFor(()=>expect(JSON.parse(localStorage.getItem('mm-ep2-cart'))[0].id).toBe(p.id));
 });
 it('T27 — Context API no agrega más del stock existente',()=>{
  function Consumer(){const s=useShop();return <><output>{s.cartCount}</output><button onClick={()=>s.add({...p,stock:1},3)}>Añadir</button></>}
  render(wrapper(<Consumer/>));
  fireEvent.click(screen.getByRole('button',{name:'Añadir'}));
  expect(screen.getByText('1')).toBeTruthy();
 });
 it('T28 — Carrito inválido o agotado no puede completar pedido',()=>{
  expect(cartIsAvailable([{id:p.id,qty:p.stock+1}],initialProducts)).toBeFalse();
  expect(cartIsAvailable([{id:p.id,qty:1}],initialProducts)).toBeTrue();
 });
 it('T29 — Resumen: entrega retiro reduce costo de envío',()=>{
  expect(shipping(10000,'domicilio')).toBe(3990);
  expect(shipping(10000,'retiro')).toBe(0);
 });
 it('T30 — Checkout valida correo con un mensaje accesible',()=>{
  withCart();render(wrapper(<Checkout/>));
  fireEvent.change(screen.getByLabelText('Correo electrónico *'),{target:{value:'sin-arroba'}});
  fireEvent.click(screen.getByRole('button',{name:/Confirmar pedido/i}));
  expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
  expect(screen.getByLabelText('Correo electrónico *').getAttribute('aria-invalid')).toBe('true');
 });
 it('T31 — Checkout tiene campos dependientes de región y comuna',()=>{
  withCart();render(wrapper(<Checkout/>));
  fireEvent.change(screen.getByLabelText('Región *'),{target:{value:'Metropolitana de Santiago'}});
  expect(screen.getByRole('option',{name:'Santiago'})).toBeTruthy();
 });
 it('T32 — Header carrito expone cantidad agregada',()=>{
  withCart();render(wrapper(<Header/>));
  expect(screen.getByRole('link',{name:'Carrito con 1 productos'})).toBeTruthy();
 });
 it('T33 — Botón secundario de portada dice Contáctanos en español',()=>{
  render(wrapper(<Home/>));
  expect(screen.getByRole('link',{name:'Contáctanos'})).toBeTruthy();
 });

 it('T34 — checkout válido registra compra simulada exitosa',async()=>{
  withCart();
  render(<MemoryRouter initialEntries={['/checkout']}><ShopProvider><Routes><Route path="/checkout" element={<Checkout/>}/><Route path="/compra-exitosa/:id" element={<PurchaseResult success/>}/></Routes></ShopProvider></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Nombre completo *'),{target:{value:'Ana María Pérez'}});
  fireEvent.change(screen.getByLabelText('RUN *'),{target:{value:'12.345.678-5'}});
  fireEvent.change(screen.getByLabelText('Correo electrónico *'),{target:{value:'ana@correo.cl'}});
  fireEvent.change(screen.getByLabelText('Teléfono *'),{target:{value:'+56912345678'}});
  fireEvent.change(screen.getByLabelText('Región *'),{target:{value:'Metropolitana de Santiago'}});
  fireEvent.change(screen.getByLabelText('Comuna *'),{target:{value:'Santiago'}});
  fireEvent.change(screen.getByLabelText('Dirección de entrega *'),{target:{value:'Av. Principal 123'}});
  fireEvent.click(screen.getByRole('button',{name:/Confirmar pedido/i}));
  await waitFor(()=>expect(screen.getByRole('heading',{name:'¡Tu pedido fue confirmado!'})).toBeTruthy());
  expect(JSON.parse(localStorage.getItem('mm-ep2-cart'))).toEqual([]);
  expect(JSON.parse(localStorage.getItem('mm-ep2-orders')).length).toBe(1);
 });
 it('T35 — pago rechazado no crea pedido ni cambia el inventario',async()=>{
  withCart();
  render(<MemoryRouter initialEntries={['/checkout']}><ShopProvider><Routes><Route path="/checkout" element={<Checkout/>}/><Route path="/compra-rechazada" element={<PurchaseResult success={false}/>}/></Routes></ShopProvider></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Nombre completo *'),{target:{value:'Ana María Pérez'}});
  fireEvent.change(screen.getByLabelText('RUN *'),{target:{value:'12.345.678-5'}});
  fireEvent.change(screen.getByLabelText('Correo electrónico *'),{target:{value:'ana@correo.cl'}});
  fireEvent.change(screen.getByLabelText('Teléfono *'),{target:{value:'+56912345678'}});
  fireEvent.change(screen.getByLabelText('Región *'),{target:{value:'Metropolitana de Santiago'}});
  fireEvent.change(screen.getByLabelText('Comuna *'),{target:{value:'Santiago'}});
  fireEvent.change(screen.getByLabelText('Dirección de entrega *'),{target:{value:'Av. Principal 123'}});
  fireEvent.click(screen.getByLabelText(/Simular pago rechazado/i));
  fireEvent.click(screen.getByRole('button',{name:/Confirmar pedido/i}));
  await waitFor(()=>expect(screen.getByRole('heading',{name:'Pago rechazado'})).toBeTruthy());
  expect(JSON.parse(localStorage.getItem('mm-ep2-orders'))).toEqual([]);
  expect(JSON.parse(localStorage.getItem('mm-ep2-cart'))).toEqual([{id:p.id,qty:1}]);
 });

 it('T36 — Mock de fetch: carga datos simulados desde API sin red real',async()=>{
  window.__MM_API_ENABLED__=true;
  const fetchMock=spyOn(window,'fetch').and.returnValue(Promise.resolve({ok:true,json:()=>Promise.resolve([p])}));
  function CountProducts(){const {products}=useShop();return <output data-testid="number-of-products">{products.length}</output>}
  render(wrapper(<CountProducts/>));
  await waitFor(()=>{if(screen.getByTestId('number-of-products').textContent!=='1')throw new Error('Carga pendiente');});
  expect(screen.getByTestId('number-of-products').textContent).toBe('1');
  expect(fetchMock).toHaveBeenCalled();
 });
 it('T37 — Mock de error API: presenta advertencia sin bloquear la app',async()=>{
  window.__MM_API_ENABLED__=true;
  spyOn(window,'fetch').and.returnValue(Promise.reject(new Error('Conexión simulada fallida')));
  function ShowToast(){const {toast,products}=useShop();return <><output data-testid="error-api">{toast}</output><output data-testid="products-available">{products.length}</output></>}
  render(wrapper(<ShowToast/>));
  await waitFor(()=>{if(!screen.getByTestId('error-api').textContent.includes('API no disponible'))throw new Error('Error pendiente');});
  expect(screen.getByTestId('error-api').textContent).toContain('API no disponible');
  expect(screen.getByTestId('products-available').textContent).toBe(String(initialProducts.length));
 });

});
