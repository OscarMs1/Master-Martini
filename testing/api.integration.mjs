/** API local demo - integración sin npm; complementaria a las pruebas frontend Vitest. */
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const base='http://127.0.0.1:3107/api';
const dataDir=await mkdtemp(join(tmpdir(),'mm-api-test-'));
const proc=spawn(process.execPath,['server/api.mjs'],{env:{...process.env,PORT:'3107',MM_DATA_DIR:dataDir},stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',x=>stderr+=x);
const checks=[];
async function request(path,opts={}){let r=await fetch(base+path,{...opts,headers:{'Content-Type':'application/json',...opts.headers}});return {status:r.status,data:await r.json().catch(()=>({}))}}
async function check(name,test){try{await test();checks.push({name,ok:true});console.log('PASS',name)}catch(e){checks.push({name,ok:false});console.error('FAIL',name,e.message)}}
try {
 let connected=false;
 for(let i=0;i<35;i++){try{const r=await request('/health');if(r.status===200){connected=true;break}}catch{}await sleep(150)}
 if(!connected)throw new Error('API no inicia; quizá puerto 3001 ocupado. '+stderr);
 await check('GET /api/health',async()=>{const r=await request('/health');assert.equal(r.data.ok,true)});
 await check('GET /api/products',async()=>{const r=await request('/products');assert.ok(r.data.length>=12)});
 await check('POST /api/products crea SKU',async()=>{const r=await request('/products',{method:'POST',body:JSON.stringify({id:'V9-API-TEST',name:'Producto test',category:'panaderia',price:1200,stock:3,discount:0,image:'/assets/producto-respaldo.svg'})});assert.equal(r.status,201)});
 await check('POST duplicado retorna 409',async()=>{const r=await request('/products',{method:'POST',body:JSON.stringify({id:'V9-API-TEST',name:'Producto test',category:'panaderia',price:1200,stock:3,discount:0})});assert.equal(r.status,409)});
 await check('PUT /api/products/:id actualiza',async()=>{const r=await request('/products/V9-API-TEST',{method:'PUT',body:JSON.stringify({price:2000})});assert.equal(r.data.price,2000)});
 await check('GET visualiza SKU modificado',async()=>{const r=await request('/products');assert.equal(r.data.find(p=>p.id==='V9-API-TEST').price,2000)});
 await check('DELETE producto',async()=>{const r=await request('/products/V9-API-TEST',{method:'DELETE'});assert.equal(r.status,200)});
 await check('DELETE inexistente devuelve 404',async()=>{const r=await request('/products/V9-API-TEST',{method:'DELETE'});assert.equal(r.status,404)});
 const details={name:'Ana Pérez',run:'12.345.678-5',email:'ana@example.cl',phone:'+56912345678',region:'Metropolitana de Santiago',commune:'Santiago',address:'Calle Prueba 123',delivery:'retiro'};
 const purchase={details,cart:[{id:'MM-001',qty:2}]};
 await check('POST checkout inválido retorna 422',async()=>{const r=await request('/checkout',{method:'POST',body:JSON.stringify({})});assert.equal(r.status,422)});
 await check('POST checkout rechazado no registra pedido',async()=>{const r=await request('/checkout',{method:'POST',body:JSON.stringify({...purchase,forceFail:true})});assert.equal(r.status,402);assert.equal((await request('/orders')).data.length,0)});
 await check('POST checkout aprobado registra precio neto y stock',async()=>{const r=await request('/checkout',{method:'POST',body:JSON.stringify(purchase)});assert.equal(r.status,201);assert.equal(r.data.order.total,10782);assert.equal(r.data.order.items[0].price,5391);assert.equal(r.data.products[0].stock,23)});
 await check('POST checkout stock insuficiente retorna 409',async()=>{const r=await request('/checkout',{method:'POST',body:JSON.stringify({...purchase,cart:[{id:'MM-001',qty:100}]})});assert.equal(r.status,409);assert.equal((await request('/orders')).data.length,1)});
 await check('POST reset restaura semilla y pedidos',async()=>{await request('/reset',{method:'POST'});assert.equal((await request('/products')).data[0].stock,25);assert.equal((await request('/orders')).data.length,0)});
 await check('POST producto inválido retorna 422',async()=>{assert.equal((await request('/products',{method:'POST',body:'{}'})).status,422)});
 await check('GET ruta desconocida retorna 404',async()=>{assert.equal((await request('/desconocida')).status,404)});
}finally{
 proc.kill('SIGTERM');
 await new Promise(resolve=>{if(proc.exitCode!==null||proc.signalCode!==null)return resolve();proc.once('exit',resolve);setTimeout(resolve,2000)});
 await rm(dataDir,{recursive:true,force:true});
}
const good=checks.filter(x=>x.ok).length;console.log(`Resultado API: ${good}/${checks.length}`);if(good!==checks.length)process.exitCode=1;
