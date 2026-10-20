/** Pruebas ejecutables con Node nativo: evidencia complementaria, NO Jasmine/Karma. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProducts} from '../src/data/catalog.js';
import {money,netPrice,subtotal,shipping,orderTotal,filteredProducts,addCart,setCartQuantity,calculateDV,validRun,validEmail,validateCheckout,validateProduct,cartIsAvailable} from '../src/utils/commerce.js';
import {readStore,writeStore,createProduct,updateProduct,deleteProduct} from '../src/utils/storage.js';
const p=initialProducts[0],q=initialProducts[3], c=id=>[{id,qty:1}];
test('01 precio neto CLP redondeado',()=>assert.equal(netPrice(p),5391));
test('02 precios sin descuento',()=>assert.equal(netPrice({...p,discount:0}),5990));
test('03 precio 15% de descuento',()=>assert.equal(netPrice(q),2542));
test('04 moneda CLP',()=>assert.match(money(1500),/1.500/));
test('05 subtotal dos unidades',()=>assert.equal(subtotal([{id:p.id,qty:2}],initialProducts),10782));
test('06 subtotal con un producto que fue eliminado',()=>assert.equal(subtotal(c('NO-EXISTE'),initialProducts),0));
test('07 retiro sin cargo',()=>assert.equal(shipping(100,'retiro'),0));
test('08 delivery bajo umbral',()=>assert.equal(shipping(49999),3990));
test('09 delivery desde 50000 gratis',()=>assert.equal(shipping(50000),0));
test('10 total de la orden suma despacho',()=>assert.equal(orderTotal(c(p.id),initialProducts),9381));
test('11 búsqueda acentos / mayúsculas',()=>assert.ok(filteredProducts(initialProducts,'GRAN MASTER').length>=1));
test('12 filtrado categoría',()=>assert.ok(filteredProducts(initialProducts,'','gelateria').every(x=>x.category==='gelateria')));
test('13 filtrado de ofertas',()=>assert.ok(filteredProducts(initialProducts,'','all',true).every(x=>x.discount>0)));
test('14 agregar a carrito',()=>assert.deepEqual(addCart([],p,1),c(p.id)));
test('15 sumar en una sola línea',()=>assert.deepEqual(addCart(c(p.id),p,2),[{id:p.id,qty:3}]));
test('16 stock límite máximo',()=>assert.deepEqual(addCart(c(p.id),{...p,stock:2},12),[{id:p.id,qty:2}]));
test('17 agregar cantidades no válidas no altera carrito',()=>{
 for(const qty of [0,-1,1.2,NaN])assert.deepEqual(addCart(c(p.id),p,qty),c(p.id));
});
test('18 producto sin stock no se agrega',()=>assert.deepEqual(addCart([], {...p,stock:0}),[]));
test('19 aumentar cantidad dentro del stock',()=>assert.equal(setCartQuantity(c(p.id),p.id,3,initialProducts)[0].qty,3));
test('20 quitar elemento al poner cero',()=>assert.deepEqual(setCartQuantity(c(p.id),p.id,0,initialProducts),[]));
test('21 si disminuye stock a cero, vacía el artículo',()=>assert.deepEqual(setCartQuantity(c(p.id),p.id,2,[{...p,stock:0}]),[]));
test('22 carrito no permite checkout con SKU inexistente',()=>assert.equal(cartIsAvailable(c('INEXISTENTE'),initialProducts),false));
test('23 carrito no permite checkout con más unidades que stock',()=>assert.equal(cartIsAvailable([{id:p.id,qty:300}],initialProducts),false));
test('24 carrito permite checkout válido',()=>assert.equal(cartIsAvailable(c(p.id),initialProducts),true));
test('25 carrito vacío no permite compra',()=>assert.equal(cartIsAvailable([],initialProducts),false));
test('26 dígito verificador RUN',()=>assert.equal(calculateDV('12345678'),'5'));
test('27 RUN válido con puntos',()=>assert.equal(validRun('12.345.678-5'),true));
test('28 RUN inválido se rechaza',()=>assert.equal(validRun('12.345.678-6'),false));
test('29 correos válidos/inválidos',()=>{assert.equal(validEmail('alguien@correo.cl'),true);assert.equal(validEmail('abc'),false)});
test('30 checkout incompleto tiene errores',()=>assert.ok(Object.keys(validateCheckout({})).length>=7));
test('31 checkout válido no da errores',()=>{
 assert.deepEqual(validateCheckout({name:'Ana María',run:'12.345.678-5',email:'ana@correo.cl',phone:'+56912345678',region:'Metropolitana de Santiago',commune:'Santiago',address:'Av. Santiago 123',delivery:'domicilio'}),{});
});
test('32 validaciones de producto rechazan stock, precio y descuento',()=>{
 const errors=validateProduct({...p,price:-2,stock:0.6,discount:101});assert.ok(errors.price&&errors.stock&&errors.discount);
});
test('33 crear nuevo producto inmutable',()=>{
 const next=createProduct(initialProducts,{...p,id:'SKU-NUEVO'});assert.equal(initialProducts.length,12);assert.equal(next.length,13);
});
test('34 SKU duplicado produce error',()=>assert.throws(()=>createProduct(initialProducts,p),/SKU ya existe/));
test('35 update actualiza solo SKU elegido sin mutar entrada',()=>{
 const updated=updateProduct(initialProducts,p.id,{name:'Nuevo nombre'});assert.equal(updated[0].name,'Nuevo nombre');assert.equal(initialProducts[0].name,p.name);
});
test('36 update SKU inexistente lanza error',()=>assert.throws(()=>updateProduct(initialProducts,'XYZ',{name:'X'}),/inexistente/));
test('37 delete no afecta lista original',()=>{
 const updated=deleteProduct(initialProducts,p.id);assert.equal(updated.length,11);assert.equal(initialProducts.length,12);
});
test('38 persistencia serializa y lee array',()=>{
 const map=new Map();globalThis.window={localStorage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)}};
 try{writeStore('demo',[1,2]);assert.deepEqual(readStore('demo',[]),[1,2]);}finally{delete globalThis.window}
});
test('39 persistencia corrupta usa fallback',()=>{
 globalThis.window={localStorage:{getItem:()=>'{invalido',setItem:()=>{}}};
 try{assert.deepEqual(readStore('demo',[]),[]);}finally{delete globalThis.window}
});
