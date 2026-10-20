import React from 'react';
import {render,screen,fireEvent,cleanup,within,waitFor,act} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import App from '../App';
import {ShopProvider,useShop} from '../contexts/ShopContext';
import {Admin,Register,Login,MyAccount,ProtectedAdmin} from '../pages/AccountAdmin';
import {Cart,Checkout,PurchaseResult} from '../pages/CartCheckout';
import {Catalog,ProductDetail} from '../pages/ShopPages';
import {Contact,Blog,BlogDetail,About,NotFound} from '../pages/InfoPages';
import {Header,Layout} from '../components/SiteLayout';
import ProductMedia from '../components/ProductMedia';
import ErrorBoundary from '../components/ErrorBoundary';
import Home from '../pages/Home';
import {initialProducts,regions} from '../data/catalog';
import * as commerce from '../utils/commerce';
import {readStore,writeStore,createProduct,updateProduct} from '../utils/storage';

const p=initialProducts[0];
const admin={name:'Admin prueba',email:'admin@demo.cl',role:'admin'};
const details={name:'Ana Pérez',run:'12.345.678-5',email:'ana@example.cl',phone:'+56912345678',region:'Metropolitana de Santiago',commune:'Santiago',address:'Calle Prueba 123',delivery:'retiro'};
const mount=(child,path='/')=>render(<MemoryRouter initialEntries={[path]} future={{v7_startTransition:true,v7_relativeSplatPath:true}}><ShopProvider>{child}</ShopProvider></MemoryRouter>);
const fill=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
const stored=(key)=>JSON.parse(localStorage.getItem('mm-ep2-'+key));
const seed=(key,value)=>localStorage.setItem('mm-ep2-'+key,JSON.stringify(value));
// Jasmine expect reports failures without throwing. Testing Library retries only throws.
async function until(predicate){await waitFor(()=>{if(!predicate())throw new Error('Condición asíncrona pendiente');});}
let shop;
function Probe(){shop=useShop();return <output data-testid="probe">{JSON.stringify({products:shop.products,cart:shop.cart,toast:shop.toast,loading:shop.loading,apiError:shop.apiError})}</output>}
describe('Regresión funcional y cobertura EP2',()=>{
 beforeEach(()=>{localStorage.clear();delete window.__MM_API_ENABLED__;shop=null;});
 afterEach(()=>{cleanup();localStorage.clear();delete window.__MM_API_ENABLED__;});

 it('R01 CRUD administrativo DOM conserva edición y eliminación después de remontar',async()=>{
  seed('user',admin);const view=mount(<Admin/>);
  fireEvent.click(screen.getByRole('button',{name:/Nuevo producto/}));
  fill('Código SKU *','QA-001');fill('Nombre *','Producto QA');fill('Precio CLP *','1000');fill('Stock *','6');
  fill('Marca','Marca QA');fill('Formato','500 g');fill('Descripción','Descripción de prueba');fill('Ruta de imagen / URL','/assets/producto-respaldo.svg');
  fireEvent.click(screen.getByLabelText('Producto destacado'));
  fireEvent.click(screen.getByRole('button',{name:'Guardar producto'}));
  await screen.findByText('Producto creado correctamente.');
  expect(stored('products').find(p=>p.id==='QA-001').stock).toBe(6);
  fireEvent.click(screen.getByRole('button',{name:'Editar Producto QA'}));
  fill('Nombre *','Producto editado');fill('Precio CLP *','1500');fill('Descuento %','10');
  fireEvent.click(screen.getByRole('button',{name:'Guardar producto'}));
  await screen.findByText('Producto actualizado.');
  expect(stored('products').find(p=>p.id==='QA-001').price).toBe(1500);
  const confirm=spyOn(window,'confirm').and.returnValue(true);
  fireEvent.click(screen.getByRole('button',{name:'Eliminar Gran Master Hoja'}));
  await screen.findByText('Producto eliminado.');
  expect(confirm).toHaveBeenCalled();
  view.unmount();mount(<Admin/>);
  expect(screen.queryByRole('button',{name:'Editar Gran Master Hoja'})).toBeNull();
  expect(screen.getByRole('button',{name:'Editar Producto editado'})).toBeTruthy();
 });
 it('R02 administración valida entradas vacías y SKU duplicado sin alterar catálogo',async()=>{
  seed('user',admin);mount(<Admin/>);
  fireEvent.click(screen.getByRole('button',{name:/Nuevo producto/}));
  fill('Código SKU *',p.id);fill('Precio CLP *','');fill('Stock *','');
  fireEvent.click(screen.getByRole('button',{name:'Guardar producto'}));
  expect(screen.getByText('Ingresa un nombre.')).toBeTruthy();
  expect(screen.getByText('El precio debe ser 0 o superior.')).toBeTruthy();
  fill('Nombre *','Duplicado');fill('Precio CLP *','10');fill('Stock *','1');
  fireEvent.click(screen.getByRole('button',{name:'Guardar producto'}));
  await screen.findByText('El SKU ya existe.');
  fireEvent.click(screen.getByRole('button',{name:'Cancelar'}));
  fill('Buscar productos en administración','Bravo');
  expect(screen.getAllByRole('row').length).toBe(2);
 });
 it('R03 pestañas de pedidos y usuarios y reinicio del catálogo',async()=>{
  seed('user',admin);seed('orders',[{id:'PED-QA',details,status:'Aprobado',total:1234}]);seed('clients',[{...details,role:'cliente'}]);
  mount(<Admin/>);fireEvent.click(screen.getByRole('button',{name:'Pedidos'}));
  expect(screen.getByText('PED-QA')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Usuarios'}));expect(screen.getByText(details.email)).toBeTruthy();
  spyOn(window,'confirm').and.returnValue(true);fireEvent.click(screen.getByRole('button',{name:'Reiniciar catálogo'}));
  await until(()=>stored('products').length===initialProducts.length);
  expect(stored('cart')).toEqual([]);
 });
 it('R04 vendedor consulta y edita pero no tiene botón eliminar',()=>{
  seed('user',{...admin,role:'vendedor'});mount(<ProtectedAdmin><Admin/></ProtectedAdmin>);
  expect(screen.getByRole('button',{name:'Editar '+p.name})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Eliminar '+p.name})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Pedidos'}));expect(screen.getByText(/Aún no hay pedidos/)).toBeTruthy();
 });
 it('R05 registro inválido expone errores y no crea sesión',()=>{
  mount(<Register/>);fireEvent.click(screen.getByRole('button',{name:'Registrarme'}));
  expect(screen.getAllByRole('alert').length).toBeGreaterThan(5);expect(stored('user')).toBeNull();
  fill('Contraseña (4 a 10 caracteres) *','abcd');fill('Confirmar contraseña *','xxxx');
  fireEvent.click(screen.getByRole('button',{name:'Registrarme'}));
  expect(screen.getByText('Las contraseñas deben coincidir.')).toBeTruthy();
 });
 it('R06 registro válido conserva perfil sin contraseña y precarga checkout',()=>{
  seed('cart',[{id:p.id,qty:1}]);mount(<Routes><Route path="/" element={<Register/>}/><Route path="/mi-cuenta" element={<Checkout/>}/></Routes>);
  fill('Nombre *','Ana');fill('Apellido *','Pérez');fill('RUN *',details.run);fill('Correo *',details.email);fill('Teléfono',details.phone);
  fill('Región *',details.region);fill('Comuna *',details.commune);fill('Dirección *',details.address);
  fill('Contraseña (4 a 10 caracteres) *','Demo123');fill('Confirmar contraseña *','Demo123');
  fireEvent.click(screen.getByRole('button',{name:'Registrarme'}));
  expect(screen.getByLabelText('Nombre completo *').value).toBe('Ana Pérez');
  expect(screen.getByLabelText('Dirección de entrega *').value).toBe(details.address);
  expect(stored('clients')[0].password).toBeUndefined();
 });
 it('R07 login administrador navega al panel y permite cerrar sesión',()=>{
  mount(<Routes><Route path="/" element={<Login/>}/><Route path="/login" element={<Login/>}/><Route path="/admin" element={<MyAccount/>}/></Routes>);
  fill('Correo electrónico','admin@demo.cl');fill('Contraseña','Admin123');
  fireEvent.click(screen.getByRole('button',{name:'Entrar a mi cuenta'}));
  expect(screen.getByRole('link',{name:'Abrir administración'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/Cerrar sesión/}));
  expect(stored('user')).toBeNull();expect(screen.getByRole('heading',{name:'Bienvenido de nuevo'})).toBeTruthy();
 });
 it('R08 cuenta muestra solamente pedidos del usuario y protege acceso anónimo',()=>{
  seed('user',{...details,role:'cliente'});seed('orders',[{id:'MIO',userId:details.email,date:'2026-10-20',status:'Aprobado',total:100},{id:'AJENO',userId:'other@example.cl',date:'2026-10-20',total:2}]);
  const view=mount(<MyAccount/>);expect(screen.getByText('MIO')).toBeTruthy();expect(screen.queryByText('AJENO')).toBeNull();
  view.unmount();localStorage.clear();mount(<Routes><Route path="/" element={<MyAccount/>}/><Route path="/login" element={<p>Acceso requerido</p>}/></Routes>);
  expect(screen.getByText('Acceso requerido')).toBeTruthy();
 });
 it('R09 formulario contacto valida y confirma envío simulado',()=>{
  mount(<Contact/>);fireEvent.click(screen.getByRole('button',{name:/Enviar consulta/}));
  expect(screen.getAllByRole('alert').length).toBe(4);
  fill('Nombre *','Ana');fill('Correo *',details.email);fill('Asunto *','Catálogo');fill('Mensaje *','Solicito información de productos.');
  fireEvent.click(screen.getByRole('button',{name:/Enviar consulta/}));
  expect(screen.getByRole('alert').textContent).toContain('No se envió correo real');
 });
 it('R10 detalle aumenta y reduce cantidad y añade producto al carrito',()=>{
  mount(<Routes><Route path="/producto/:id" element={<ProductDetail/>}/></Routes>,'/producto/'+p.id);
  fireEvent.click(screen.getByRole('button',{name:'Aumentar cantidad'}));fireEvent.click(screen.getByRole('button',{name:'Aumentar cantidad'}));
  fireEvent.click(screen.getByRole('button',{name:'Reducir cantidad'}));fireEvent.click(screen.getByRole('button',{name:'Añadir al carrito'}));
  expect(stored('cart')).toEqual([{id:p.id,qty:2}]);
 });
 it('R11 catálogo filtra categoría y ofertas y ordena por precio y nombre',()=>{
  mount(<Catalog onlyOffers/>);
  const names=()=>screen.getAllByTestId('product-card').map(e=>e.querySelector('.product-name').textContent);
  expect(names().length).toBe(initialProducts.filter(p=>p.discount>0).length);
  fireEvent.change(screen.getByLabelText('Ordenar productos'),{target:{value:'low'}});
  expect(names()[0]).toBe('OraSì Barista Avena');
  fireEvent.change(screen.getByLabelText('Ordenar productos'),{target:{value:'high'}});
  expect(names()[0]).toBe('Casa Gianni Croissant');
  fireEvent.change(screen.getByLabelText('Ordenar productos'),{target:{value:'az'}});
  expect(names()[0]).toBe('Base Gelato Blanca UHT');
  fireEvent.click(screen.getByRole('button',{name:'Gelatería'}));expect(names()).toEqual(['Base Gelato Blanca UHT']);
  fireEvent.click(screen.getByRole('button',{name:'Todos'}));expect(names().length).toBeGreaterThan(1);
 });
 it('R12 imágenes agotando ambos respaldos muestran estado accesible',()=>{
  const view=mount(<ProductMedia product={{id:'x',name:'QA',image:'/bad.png',remoteImage:'/remote.png'}} variant="detail"/>);
  let img=screen.getByRole('img',{name:'QA'});fireEvent.error(img);expect(img.getAttribute('src')).toBe('/bad.png');
  fireEvent.error(img);expect(img.getAttribute('src')).toBe('/assets/producto-respaldo.svg');
  expect(screen.getByText('Fotografía no disponible temporalmente.')).toBeTruthy();
  fireEvent.error(img);expect(screen.getByRole('img',{name:'Imagen temporalmente no disponible'})).toBeTruthy();
  view.rerender(<ProductMedia product={{id:'new',name:'Nueva',image:'/assets/prod-bravo.png'}}/>);
  expect(screen.getByRole('img',{name:'Nueva'}).getAttribute('src')).toBe('/assets/prod-bravo.png');
 });
 it('R13 contexto respeta catálogo vacío guardado y carrito corrupto',()=>{
  seed('products',[]);seed('cart',[{id:p.id,qty:'2'}]);seed('user',[]);seed('orders',{bad:true});
  mount(<Probe/>);expect(shop.products).toEqual([]);expect(shop.cart).toEqual([]);expect(shop.user).toBeNull();expect(shop.orders).toEqual([]);
 });
 it('R14 JSON roto y acceso denegado a storage tienen respaldo',()=>{
  localStorage.setItem('bad','{');expect(readStore('bad',42)).toBe(42);expect(readStore('missing',24)).toBe(24);
  spyOn(Storage.prototype,'setItem').and.throwError('QuotaExceededError');
  expect(()=>writeStore('test',{value:1})).not.toThrow();
 });
 it('R15 checkout guarda precio neto, total, stock y limpia carrito',async()=>{
  seed('cart',[{id:p.id,qty:2}]);mount(<Probe/>);
  let result;await act(async()=>{result=await shop.checkout(details)});
  expect(result.success).toBeTrue();expect(shop.orders[0].items[0].price).toBe(commerce.netPrice(p));
  expect(shop.orders[0].total).toBe(commerce.netPrice(p)*2);
  expect(shop.products[0].stock).toBe(p.stock-2);expect(shop.cart).toEqual([]);
 });
 it('R16 contexto bloquea datos inválidos, stock insuficiente y rechazo',async()=>{
  seed('cart',[{id:p.id,qty:p.stock+1}]);mount(<Probe/>);
  let result;await act(async()=>{result=await shop.checkout({})});expect(result.success).toBeFalse();
  await act(async()=>{result=await shop.checkout(details)});expect(result.success).toBeFalse();
  await act(async()=>{result=await shop.checkout(details,true)});expect(result.success).toBeFalse();expect(shop.orders).toEqual([]);
 });
 it('R17 checkout muestra la causa de stock inválido y ruta falsa no confirma pedido',()=>{
  seed('cart',[{id:p.id,qty:p.stock+1}]);seed('user',details);const view=mount(<Checkout/>);
  fireEvent.click(screen.getByRole('button',{name:/Confirmar pedido/}));
  expect(screen.getByRole('alert').textContent).toContain('cantidades sin stock');
  view.unmount();mount(<PurchaseResult success/>);expect(screen.getByText('No existe el pedido solicitado.')).toBeTruthy();
 });
 it('R18 carrito se vacía mediante botón y checkout vacío ofrece catálogo',()=>{
  seed('cart',[{id:p.id,qty:1}]);const view=mount(<Cart/>);fireEvent.click(screen.getByRole('button',{name:'Vaciar carrito'}));
  expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();view.unmount();mount(<Checkout/>);
  expect(screen.getByText('No hay productos para comprar')).toBeTruthy();
 });
 it('R19 límite de stock y producto agotado generan mensajes sin insertar filas',()=>{
  mount(<Probe/>);act(()=>shop.add({...p,stock:0}));expect(shop.toast).toContain('No hay stock');
  act(()=>shop.add(p,p.stock));act(()=>shop.add(p));expect(shop.toast).toContain('Alcanzaste');
  expect(shop.cart.length).toBe(1);
 });
 it('R20 CRUD contexto rechaza datos y edición inexistente y conserva imagen editada',async()=>{
  const view=mount(<Probe/>);
  await expectAsync(shop.saveProduct({...p,price:-1})).toBeRejectedWithError('Datos de producto inválidos.');
  await expectAsync(shop.saveProduct({...p,id:'missing'},true)).toBeRejectedWithError('Producto inexistente.');
  await act(async()=>shop.saveProduct({...p,image:'/assets/prod-bravo.png',remoteImage:undefined},true));
  view.unmount();mount(<Probe/>);expect(shop.products[0].image).toBe('/assets/prod-bravo.png');
 });
 it('R21 API carga catálogo y pedidos y expone estado de carga',async()=>{
  window.__MM_API_ENABLED__=true;let release;
  const pending=new Promise(resolve=>release=resolve);
  spyOn(window,'fetch').and.callFake(url=>url.endsWith('/orders')?Promise.resolve({ok:true,json:async()=>[]}):pending);
  mount(<Probe/>);expect(shop.loading).toBeTrue();
  await act(async()=>release({ok:true,json:async()=>[p]}));await until(()=>!shop.loading);
  expect(shop.products).toEqual([p]);expect(shop.apiError).toBe('');
 });
 it('R22 API rechaza datos malformados sin reemplazar catálogo válido',async()=>{
  window.__MM_API_ENABLED__=true;spyOn(window,'fetch').and.resolveTo({ok:true,json:async()=>({wrong:true})});
  mount(<Probe/>);await until(()=>!shop.loading);expect(shop.apiError).toContain('inválida');expect(shop.products.length).toBe(12);
 });
 it('R23 API CRUD usa métodos correctos y mantiene estado si el servidor falla',async()=>{
  window.__MM_API_ENABLED__=true;
  const mock=spyOn(window,'fetch').and.callFake((url,opts)=>Promise.resolve({ok:true,json:async()=>url.endsWith('/orders')?[]:opts.method==='GET'?[p]:{}}));
  mount(<Probe/>);await until(()=>!shop.loading);
  await act(async()=>shop.saveProduct({...p,id:'QA-API'}));expect(mock.calls.mostRecent().args[1].method).toBe('POST');
  await act(async()=>shop.saveProduct({...p,price:900},true));expect(mock.calls.mostRecent().args[1].method).toBe('PUT');
  mock.and.resolveTo({ok:false,json:async()=>({error:'Servidor rechazó eliminación'})});
  await expectAsync(shop.eraseProduct(p.id)).toBeRejectedWithError('Servidor rechazó eliminación');
  expect(shop.products.some(x=>x.id===p.id)).toBeTrue();
  mock.and.resolveTo({ok:true,json:async()=>({})});await act(async()=>shop.eraseProduct(p.id));expect(mock.calls.mostRecent().args[1].method).toBe('DELETE');
  await act(async()=>shop.resetCatalog());expect(shop.products.length).toBe(initialProducts.length);
 });
 it('R24 error HTTP con cuerpo no JSON se informa y bloquea checkout',async()=>{
  window.__MM_API_ENABLED__=true;spyOn(window,'fetch').and.resolveTo({ok:false,json:()=>Promise.reject(new Error('html'))});
  seed('cart',[{id:p.id,qty:1}]);mount(<Probe/>);await until(()=>!shop.loading);
  expect(shop.apiError).toContain('Error al conectar');
  let result;await act(async()=>{result=await shop.checkout(details)});expect(result.error).toContain('API');
 });
 it('R25 checkout API incorpora respuesta del servidor en pedidos y stock',async()=>{
  window.__MM_API_ENABLED__=true;seed('cart',[{id:p.id,qty:1}]);
  const order={id:'API-PED',items:[{id:p.id,qty:1}],total:5391,details};
  const mock=spyOn(window,'fetch').and.callFake(url=>Promise.resolve({ok:true,json:async()=>url.endsWith('/checkout')?{order,products:[{...p,stock:24}]}:url.endsWith('/orders')?[]:[p]}));
  mount(<Probe/>);await until(()=>!shop.loading);let result;await act(async()=>{result=await shop.checkout(details)});
  expect(result.id).toBe('API-PED');expect(shop.cart).toEqual([]);expect(shop.products[0].stock).toBe(24);
  expect(JSON.parse(mock.calls.mostRecent().args[1].body).cart).toEqual([{id:p.id,qty:1}]);
 });
 it('R26 navegación App completa conserva SPA y llega al 404',()=>{
  window.history.replaceState({},'','/');render(<App/>);
  fireEvent.click(screen.getAllByRole('link',{name:'Ver catálogo'})[0]);expect(screen.getByRole('heading',{level:1,name:'Catálogo de productos'})).toBeTruthy();
  fireEvent.click(screen.getByRole('link',{name:'Ver '+p.name}));
  expect(screen.getByRole('heading',{level:1,name:p.name})).toBeTruthy();
  cleanup();window.history.replaceState({},'','/ruta-inexistente');render(<App/>);
  expect(screen.getByText('Esta página no existe')).toBeTruthy();window.history.replaceState({},'','/');
 });
 it('R27 búsqueda navbar navega y Escape cierra panel',()=>{
  mount(<><Header/><Routes><Route path="/catalogo" element={<Catalog/>}/></Routes></>);
  fireEvent.click(screen.getByRole('button',{name:'Abrir búsqueda'}));fill('Buscar productos','Bravo');
  fireEvent.click(screen.getByRole('button',{name:'Buscar'}));expect(screen.getByText('Bravo Crem')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Abrir búsqueda'}));fireEvent.keyDown(window,{key:'Escape'});
  expect(screen.queryByRole('button',{name:'Cerrar búsqueda'})).toBeNull();
 });
 it('R28 portada cambia tercer slide y muestra diálogo de historia',()=>{
  mount(<Home/>);fireEvent.click(screen.getByRole('button',{name:/Ir a diapositiva 3:/}));
  expect(screen.getByRole('heading',{name:'Una solución para cada especialidad'})).toBeTruthy();
  fireEvent.keyDown(screen.getByRole('region',{name:'Presentación de Master Martini'}),{key:'ArrowLeft'});
  expect(screen.getByRole('heading',{name:'Pasión por la panadería profesional'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Conocer la historia de Master Martini'}));expect(screen.getByRole('dialog')).toBeTruthy();
  fireEvent.keyDown(window,{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();
 });
 it('R29 oferta del mes agrega el producto mostrado y filtros vacíos se explican',()=>{
  seed('products',[p]);mount(<Home/>);
  fireEvent.click(screen.getByRole('button',{name:'Retail'}));expect(screen.getByText('No hay productos en esta categoría.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Añadir al carrito'}));expect(stored('cart')[0].id).toBe(p.id);
 });
 it('R30 blog navega al artículo y muestra error para slug inexistente',()=>{
  const view=mount(<Routes><Route path="/" element={<Blog/>}/><Route path="/blog/:slug" element={<BlogDetail/>}/></Routes>);
  fireEvent.click(screen.getByRole('link',{name:/Croissants de hojaldre/}));expect(screen.getByText(/El secreto del hojaldre/)).toBeTruthy();
  view.unmount();mount(<BlogDetail/>);expect(screen.getByRole('heading',{name:'Artículo no encontrado'})).toBeTruthy();
 });
 it('R31 página Nosotros expone alcance educativo y enlace al catálogo',()=>{
  mount(<About/>);expect(screen.getByText('demostración educativa no oficial')).toBeTruthy();expect(screen.getByRole('link',{name:/Explorar soluciones/}).getAttribute('href')).toBe('/catalogo');
 });
 it('R32 ErrorBoundary ofrece recuperación ante error de render',async()=>{
  spyOn(console,'error');function Broken(){throw new Error('Error QA controlado')}
  await jasmine.spyOnGlobalErrorsAsync(async(globalError)=>{
   render(<ErrorBoundary><Broken/></ErrorBoundary>);
   expect(screen.getByRole('alert').textContent).toContain('Error QA controlado');
   expect(screen.getByRole('button',{name:'Recargar página'})).toBeTruthy();
   expect(console.error).toHaveBeenCalled();
  });
 });
 it('R33 reglas de carrito rechazan duplicados y entradas fuera de rango',()=>{
  expect(commerce.cartIsAvailable([{id:p.id,qty:1},{id:p.id,qty:1}],[p])).toBeFalse();
  for(const qty of [0,-1,1.5,NaN])expect(commerce.addCart([],p,qty)).toEqual([]);
  expect(commerce.addCart([],null)).toEqual([]);
  expect(commerce.setCartQuantity([{id:p.id,qty:1}],p.id,0,[p])).toEqual([]);
  expect(commerce.setCartQuantity([{id:p.id,qty:1}],p.id,1,[])).toEqual([]);
  expect(commerce.setCartQuantity([{id:p.id,qty:1}],p.id,1,[{...p,stock:0}])).toEqual([]);
  expect(commerce.shipping(50000)).toBe(0);expect(commerce.shipping(0)).toBe(0);expect(commerce.orderTotal([],[])).toBe(0);
 });
 it('R34 validación cubre precios, descuentos, correo y entrega inválidos',()=>{
  const errors=commerce.validateProduct({});expect(Object.keys(errors).length).toBeGreaterThan(4);
  expect(commerce.validateProduct({...p,discount:101}).discount).toBeTruthy();
  expect(commerce.validateProduct({...p,discount:-1}).discount).toBeTruthy();
  expect(commerce.validateCheckout({...details,delivery:'otro'}).delivery).toBeTruthy();
  expect(commerce.validateCheckout(details)).toEqual({});
  expect(commerce.validRun(null)).toBeFalse();expect(commerce.validEmail('')).toBeFalse();
  expect(()=>createProduct([p],p)).toThrowError('El SKU ya existe.');
  expect(()=>updateProduct([],p.id,{})).toThrowError('Producto inexistente.');
 });
});
