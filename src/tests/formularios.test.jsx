import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {ShopProvider} from '../contexts/ShopContext';
import {Admin} from '../pages/AccountAdmin';
import {Checkout,PurchaseResult} from '../pages/CartCheckout';
import {About} from '../pages/InfoPages';
const change=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
const click=name=>fireEvent.click(screen.getByRole('button',{name}));
const store=(key,value)=>localStorage.setItem('mm-ep2-'+key,JSON.stringify(value));
const read=key=>JSON.parse(localStorage.getItem('mm-ep2-'+key));
const mount=element=>render(<MemoryRouter><ShopProvider>{element}</ShopProvider></MemoryRouter>);
const p={id:'QA-FORM',name:'Producto',category:'retail',price:1000,discount:0,stock:5};
describe('Formularios completos y errores de operaciones',()=>{
 it('F01 guarda todos los campos de producto y permite cancelar sin cambios',async()=>{
  store('user',{name:'Admin',role:'admin'});mount(<Admin />);click('Nuevo producto');
  for(const [label,value] of Object.entries({'Código SKU *':'QA-FORM','Nombre *':'Producto formulario','Marca':'Marca QA','Categoría *':'retail','Precio CLP *':'1234','Stock *':'7','Descuento %':'15','Formato':'500 ml','Descripción':'Descripción comprobable','Ruta de imagen / URL':'/assets/producto-respaldo.svg'}))change(label,value);
  fireEvent.click(screen.getByLabelText('Producto destacado'));click('Guardar producto');
  await screen.findByText('Producto creado correctamente.');
  expect(read('products').find(x=>x.id==='QA-FORM')).toMatchObject({name:'Producto formulario',brand:'Marca QA',category:'retail',price:1234,stock:7,discount:15,format:'500 ml',description:'Descripción comprobable',image:'/assets/producto-respaldo.svg',featured:true});
  click('Editar Producto formulario');change('Nombre *','Cambio descartado');click('Cancelar');
  expect(read('products').find(x=>x.id==='QA-FORM').name).toBe('Producto formulario');
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);click('Reiniciar catálogo');
  expect(read('products').some(x=>x.id==='QA-FORM')).toBe(true);
  confirm.mockReturnValue(true);click('Reiniciar catálogo');
  await waitFor(()=>expect(read('products')).toHaveLength(12));
 });
 it('F02 checkout permite corregir todos los campos y elegir despacho tras retiro',async()=>{
  store('products',[p]);store('cart',[{id:p.id,qty:1}]);mount(<Checkout />);
  click(/Confirmar pedido/);
  for(const [label,value] of Object.entries({'Nombre completo *':'Ana Pérez','RUN *':'12.345.678-5','Correo electrónico *':'ana@example.cl','Teléfono *':'+56912345678','Región *':'Metropolitana de Santiago','Comuna *':'Santiago','Dirección de entrega *':'Calle Prueba 123'}))change(label,value);
  fireEvent.click(screen.getByLabelText('Retiro coordinado (demo)'));expect(screen.getByText('Gratis')).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Despacho a domicilio'));expect(screen.getByText('$4.990')).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Simular pago rechazado'));fireEvent.click(screen.getByLabelText('Simular pago aprobado'));
  click(/Confirmar pedido/);
  await waitFor(()=>expect(read('orders')).toHaveLength(1));
  expect(read('orders')[0].total).toBe(4990);expect(read('orders')[0].details.email).toBe('ana@example.cl');
 });
 it('F03 error de compra remota se muestra sin perder carrito ni stock',async()=>{
  store('products',[p]);store('cart',[{id:p.id,qty:1}]);
  store('user',{name:'Ana Pérez',run:'12.345.678-5',email:'ana@example.cl',phone:'+56912345678',region:'Metropolitana de Santiago',commune:'Santiago',address:'Calle Prueba 123'});
  window.__MM_API_ENABLED__=true;
  const fetchMock=vi.fn((url,options)=>Promise.resolve({ok:options.method==='GET',json:()=>Promise.resolve(options.method==='GET'?(url==='/api/products'?[p]:[]):{error:'Stock cambió en el servidor'})}));
  vi.stubGlobal('fetch',fetchMock);mount(<Checkout />);
  await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
  // Esperar a que se aplique la carga antes de confirmar.
  await waitFor(()=>expect(read('products')).toEqual([p]));
  click(/Confirmar pedido/);
  expect(await screen.findByText('Stock cambió en el servidor')).toBeTruthy();
  expect(read('cart')).toEqual([{id:p.id,qty:1}]);expect(read('orders')).toEqual([]);
  expect(screen.getByRole('button',{name:/Confirmar pedido/}).disabled).toBe(false);
 });
 it('F04 resultado inexistente ofrece volver al catálogo y Nosotros enlaza a productos',()=>{
  const view=mount(<PurchaseResult success />);
  expect(screen.getByText('No existe el pedido solicitado.')).toBeTruthy();
  expect(screen.getByRole('link',{name:'Volver al catálogo'}).getAttribute('href')).toBe('/catalogo');
  view.unmount();mount(<About />);
  expect(screen.getByRole('link',{name:/Explorar soluciones/}).getAttribute('href')).toBe('/catalogo');
 });
});
