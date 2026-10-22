import { act, renderHook, waitFor } from '@testing-library/react';
import { ShopProvider, useShop } from '../contexts/ShopContext';
import { initialProducts } from '../data/catalog';
const product={id:'API-QA',name:'Producto API',category:'retail',price:1000,stock:4,discount:0};
const details={name:'Ana Pérez',run:'12.345.678-5',email:'ana@example.cl',phone:'+56912345678',region:'Metropolitana de Santiago',commune:'Santiago',address:'Calle 123',delivery:'retiro'};
const reply=(value,ok=true)=>Promise.resolve({ok,json:()=>Promise.resolve(value)});
async function apiHook() {
  window.__MM_API_ENABLED__=true;
  const fetchMock=vi.fn(url=>reply(url==='/api/products'?[product]:[]));
  vi.stubGlobal('fetch',fetchMock);
  const hook=renderHook(()=>useShop(),{wrapper:ShopProvider});
  await waitFor(()=>expect(hook.result.current.loading).toBe(false));
  return {...hook,fetchMock};
}
describe('Contrato del contexto con API y persistencia',()=>{
 it('P01 CRUD remoto solo actualiza estado tras respuesta correcta; elimina del carrito',async()=>{
  const {result,fetchMock}=await apiHook();
  const p={...product,id:'NUEVO'};
  await act(()=>result.current.saveProduct(p));
  expect(fetchMock).toHaveBeenLastCalledWith('/api/products',expect.objectContaining({method:'POST',body:JSON.stringify(p)}));
  await act(()=>result.current.saveProduct({...p,price:2000},true));
  expect(result.current.products.find(x=>x.id==='NUEVO').price).toBe(2000);
  expect(fetchMock).toHaveBeenLastCalledWith('/api/products/NUEVO',expect.objectContaining({method:'PUT'}));
  act(()=>result.current.add(p));
  await act(()=>result.current.eraseProduct(p.id));
  expect(result.current.cart).toEqual([]); expect(result.current.products).toEqual([product]);
  expect(fetchMock).toHaveBeenLastCalledWith('/api/products/NUEVO',expect.objectContaining({method:'DELETE'}));
 });
 it('P02 checkout remoto conserva identidad y adopta stock/pedido devueltos por servidor',async()=>{
  const {result,fetchMock}=await apiHook();
  act(()=>{result.current.add(product,2);result.current.setUser({email:details.email});});
  const order={id:'PED-API',userId:details.email,items:[{id:product.id,qty:2}],total:2000};
  fetchMock.mockImplementationOnce(()=>reply({order,products:[{...product,stock:2}]}));
  let response;await act(async()=>{response=await result.current.checkout(details);});
  expect(response).toEqual({success:true,id:'PED-API'});
  expect(JSON.parse(fetchMock.mock.lastCall[1].body)).toEqual({details,cart:[{id:product.id,qty:2}],userId:details.email});
  expect(result.current.orders).toEqual([order]); expect(result.current.products[0].stock).toBe(2);expect(result.current.cart).toEqual([]);
 });
 it('P03 error HTTP conserva catálogo y comunica el error; respuesta no JSON también se maneja',async()=>{
  const {result,fetchMock}=await apiHook();
  fetchMock.mockImplementationOnce(()=>reply({error:'SKU duplicado'},false));
  await expect(result.current.saveProduct({...product,id:'OTRO'})).rejects.toThrow('SKU duplicado');
  expect(result.current.products).toEqual([product]);
  fetchMock.mockResolvedValueOnce({ok:false,json:()=>Promise.reject(new Error('HTML'))});
  await expect(result.current.eraseProduct(product.id)).rejects.toThrow('Error al conectar con la API local.');
  expect(result.current.products).toEqual([product]);
 });
 it('P04 validaciones rechazan entradas inválidas, duplicadas e inexistentes antes de llamar API',async()=>{
  const {result,fetchMock}=await apiHook();const calls=fetchMock.mock.calls.length;
  await expect(result.current.saveProduct({...product,name:''})).rejects.toThrow('Datos de producto inválidos');
  await expect(result.current.saveProduct(product)).rejects.toThrow('SKU ya existe');
  await expect(result.current.saveProduct({...product,id:'NO'},true)).rejects.toThrow('Producto inexistente');
  expect(await result.current.checkout({})).toMatchObject({success:false,error:'Revisa los datos de entrega.'});
  await act(async()=>expect(await result.current.checkout(details)).toEqual({success:false,id:null}));
  expect(fetchMock).toHaveBeenCalledTimes(calls);
 });
 it('P05 reset remoto limpia pedidos, productos y carrito de forma coherente con servidor',async()=>{
  const {result,fetchMock}=await apiHook();
  act(()=>result.current.add(product));
  const order={id:'PED-RESET',total:1000};fetchMock.mockImplementationOnce(()=>reply({order,products:[{...product,stock:3}]}));
  await act(()=>result.current.checkout(details));act(()=>result.current.add(product));
  await act(()=>result.current.resetCatalog());
  expect(result.current.products).toEqual(initialProducts);expect(result.current.cart).toEqual([]);
  expect(result.current.orders).toEqual([]);
  expect(fetchMock).toHaveBeenLastCalledWith('/api/reset',expect.objectContaining({method:'POST'}));
 });
 it.each([null,[{...product,price:-1}], [null]])('P06 respuesta API malformada %j muestra error sin reemplazar catálogo',async catalog=>{
  window.__MM_API_ENABLED__=true;vi.stubGlobal('fetch',vi.fn(url=>reply(url==='/api/products'?catalog:[])));
  const {result}=renderHook(()=>useShop(),{wrapper:ShopProvider});
  await waitFor(()=>expect(result.current.loading).toBe(false));
  expect(result.current.apiError).toBe('Respuesta API inválida.');expect(result.current.products).toEqual(initialProducts);
 });
 it('P07 sin stock no agrega; mensajes caducan y almacenamiento lleno no rompe estado',()=>{
  vi.useFakeTimers();const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('QuotaExceededError');});
  const {result,unmount}=renderHook(()=>useShop(),{wrapper:ShopProvider});
  act(()=>result.current.add({...product,stock:0}));expect(result.current.cart).toEqual([]);
  expect(result.current.toast).toBe('No hay stock disponible.');
  act(()=>vi.advanceTimersByTime(3800));expect(result.current.toast).toBe('');
  expect(spy).toHaveBeenCalled();unmount();vi.useRealTimers();
 });
});
