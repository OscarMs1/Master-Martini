// Pruebas rápidas de reglas JS ejecutables sin dependencias npm (NO sustituyen Jasmine+Karma).
import assert from 'node:assert/strict';
import {initialProducts} from '../src/data/catalog.js';
import {money,netPrice,subtotal,shipping,orderTotal,filteredProducts,addCart,setCartQuantity,validRun,validateCheckout,validateProduct} from '../src/utils/commerce.js';
import {createProduct,updateProduct,deleteProduct} from '../src/utils/storage.js';
const tests=[
 ['Precio con descuento',()=>assert.equal(netPrice(initialProducts[0]),5391)],
 ['Subtotal carrito',()=>assert.equal(subtotal([{id:'MM-001',qty:2}],initialProducts),10782)],
 ['Costo envío bajo umbral',()=>assert.equal(shipping(10782),3990)],
 ['Envío sin costo umbral',()=>assert.equal(shipping(50000),0)],
 ['Filtro por categoría',()=>assert.equal(filteredProducts(initialProducts,'','gelateria').length,2)],
 ['Filtro de ofertas',()=>assert.ok(filteredProducts(initialProducts,'','all',true).every(p=>p.discount>0))],
 ['Agregar al carrito',()=>assert.equal(addCart([],initialProducts[0],1)[0].qty,1)],
 ['Tope de stock',()=>assert.equal(addCart([{id:'MM-001',qty:25}],initialProducts[0],1)[0].qty,25)],
 ['Actualizar cantidad',()=>assert.equal(setCartQuantity([{id:'MM-001',qty:1}],'MM-001',3,initialProducts)[0].qty,3)],
 ['Eliminar cantidad cero',()=>assert.equal(setCartQuantity([{id:'MM-001',qty:1}],'MM-001',0,initialProducts).length,0)],
 ['RUN chileno',()=>{assert.equal(validRun('12.345.678-5'),true);assert.equal(validRun('12.345.678-6'),false)}],
 ['Checkout incompleto',()=>assert.ok(validateCheckout({}).name)],
 ['Datos producto invalidos',()=>assert.ok(validateProduct({...initialProducts[0],price:-1}).price)],
 ['Crear registro JS',()=>assert.equal(createProduct(initialProducts,{...initialProducts[0],id:'NEW'}).length,13)],
 ['Actualizar registro JS',()=>assert.equal(updateProduct(initialProducts,'MM-001',{name:'Nuevo'})[0].name,'Nuevo')],
 ['Eliminar registro JS',()=>assert.equal(deleteProduct(initialProducts,'MM-001').length,11)]
];
let passed=0;for(const [label,run] of tests){try{run();passed++;console.log('PASS',label)}catch(e){console.error('FAIL',label,e.message)}}
console.log(`Resultado smoke Node: ${passed}/${tests.length}`);if(passed!==tests.length)process.exitCode=1;
