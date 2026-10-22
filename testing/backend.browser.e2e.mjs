/** E2E con API real, puertos temporales y datos aislados. No modifica server/.data. */
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import {createServer,mergeConfig} from 'vite';
import config from '../vite.config.js';
import {chromium} from 'playwright';

const out='testing/evidence/backend-browser';
await mkdir(out,{recursive:true});
const dataDir=await mkdtemp(join(tmpdir(),'mm-api-e2e-'));
const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const apiBase=`http://127.0.0.1:${port}`;
let api,vite,browser;
const results=[],errors=[],requests=[];
async function check(name,fn){await fn();results.push({name,passed:true});console.log('PASS',name);}
async function stopApi(){if(api&&!api.killed){const ended=new Promise(resolve=>api.once('exit',resolve));api.kill();await ended;}}
async function apiData(path){const r=await fetch(apiBase+'/api'+path);assert.ok(r.ok);return r.json();}
try{
 api=spawn(process.execPath,['server/api.mjs'],{env:{...process.env,PORT:String(port),MM_DATA_DIR:dataDir},windowsHide:true,stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('API no inició')),15000);api.stdout.on('data',buf=>{if(buf.toString().includes('API demo lista')){clearTimeout(t);resolve();}});api.once('error',reject);});
 vite=await createServer(mergeConfig(config,{configFile:false,define:{'import.meta.env.VITE_USE_BACKEND':JSON.stringify('true')},server:{host:'127.0.0.1',port:0,proxy:{'/api':apiBase}}}));
 await vite.listen();const base=`http://127.0.0.1:${vite.httpServer.address().port}`;
 browser=await chromium.launch({headless:true,...(!process.env.CI?{channel:'chrome'}:{})});
 const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1366,height:900}});
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/api/'))requests.push({method:r.method(),url:new URL(r.url()).pathname});});
 async function login(email,password){await page.goto(base+'/login');await page.locator('.form-panel').getByLabel('Correo electrónico',{exact:true}).fill(email);await page.getByLabel('Contraseña',{exact:true}).fill(password);await page.getByRole('button',{name:'Entrar a mi cuenta'}).click();await page.waitForURL(email.startsWith('admin')?'**/admin':'**/mi-cuenta');}
 async function fields(){for(const [label,value] of Object.entries({'Nombre completo *':'Ana Pérez','RUN *':'12.345.678-5','Correo electrónico *':'cliente@demo.cl','Teléfono *':'+56912345678','Dirección de entrega *':'Calle Prueba 123'}))await page.getByLabel(label,{exact:true}).fill(value);await page.getByLabel('Región *',{exact:true}).selectOption('Metropolitana de Santiago');await page.getByLabel('Comuna *',{exact:true}).selectOption('Santiago');}
 await check('B01 carga catálogo desde API real',async()=>{
  await page.goto(base+'/catalogo');await page.waitForFunction(()=>window.__MM_API_ENABLED__===true&&document.querySelectorAll('[data-testid=product-card]').length===12);
  assert.equal((await apiData('/products')).length,12);
  assert.ok(requests.some(r=>r.method==='GET'&&r.url==='/api/products'));
 });
 await check('B02 rechazo y compra real vía API, stock e historial tras recarga',async()=>{
  await login('cliente@demo.cl','Cliente123');await page.goto(base+'/producto/MM-001');
  await page.getByRole('button',{name:'Añadir al carrito',exact:true}).click();
  await page.getByRole('link',{name:'Carrito con 1 productos'}).waitFor();
  await page.goto(base+'/checkout');await fields();await page.getByLabel('Simular pago rechazado').check();
  await page.getByRole('button',{name:/Confirmar pedido/}).click();await page.waitForURL('**/compra-rechazada');
  assert.deepEqual(await apiData('/orders'),[]);assert.equal((await apiData('/products'))[0].stock,25);
  await page.getByRole('link',{name:'Volver a checkout'}).click();await fields();
  await page.getByRole('button',{name:/Confirmar pedido/}).click();await page.waitForURL('**/compra-exitosa/**');
  const orders=await apiData('/orders');assert.equal(orders.length,1);assert.equal(orders[0].userId,'cliente@demo.cl');
  assert.equal((await apiData('/products'))[0].stock,24);assert.ok(requests.some(r=>r.method==='POST'&&r.url==='/api/checkout'));
  await page.reload();await page.getByRole('heading',{name:'¡Tu pedido fue confirmado!'}).waitFor();
  await page.goto(base+'/mi-cuenta');await page.getByText(orders[0].id,{exact:true}).waitFor();
  await page.screenshot({path:out+'/pedido-api.png',fullPage:true});
 });
 await check('B03 CRUD de interfaz persiste en API real',async()=>{
  await login('admin@demo.cl','Admin123');await page.getByRole('button',{name:'Nuevo producto'}).click();
  for(const [label,value] of Object.entries({'Código SKU *':'API-E2E','Nombre *':'Producto API navegador','Precio CLP *':'2500','Stock *':'3'}))await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Guardar producto'}).click();await page.getByText('Producto creado correctamente.').waitFor();
  assert.ok((await apiData('/products')).some(p=>p.id==='API-E2E'));
  await page.getByRole('button',{name:'Editar Producto API navegador'}).click();await page.getByLabel('Precio CLP *',{exact:true}).fill('3100');
  await page.getByRole('button',{name:'Guardar producto'}).click();await page.getByText('Producto actualizado.').waitFor();await page.reload();
  await page.getByRole('button',{name:'Editar Producto API navegador'}).waitFor();assert.equal((await apiData('/products')).find(p=>p.id==='API-E2E').price,3100);
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Eliminar Producto API navegador'}).click();await page.getByText('Producto eliminado.').waitFor();
  assert.ok(!(await apiData('/products')).some(p=>p.id==='API-E2E'));
 });
 await check('B04 restauración sincroniza pedidos y catálogo sin necesitar recarga',async()=>{
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reiniciar catálogo'}).click();
  await page.getByText('Catálogo de demostración restaurado.').waitFor();
  await page.getByRole('button',{name:'Pedidos',exact:true}).click();await page.getByText('Aún no hay pedidos. Finaliza un checkout de prueba.').waitFor();
  assert.deepEqual(await apiData('/orders'),[]);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mm-ep2-orders'))),[]);
  assert.equal((await apiData('/products'))[0].stock,25);
  await page.screenshot({path:out+'/reset-api.png',fullPage:true});
 });
 await check('B05 caída real del backend se informa sin pantalla vacía',async()=>{
  await stopApi();await page.goto(base+'/catalogo');
  await page.getByRole('alert').filter({hasText:'API no disponible:'}).waitFor();
  assert.equal(await page.getByTestId('product-card').count(),12);
  await page.screenshot({path:out+'/api-no-disponible.png',fullPage:true});
 });
 assert.deepEqual(errors,[]);
}catch(error){results.push({name:'Fallo de ejecución',passed:false,error:error.stack});console.error(error);process.exitCode=1;}
finally{
 await writeFile(out+'/results.json',JSON.stringify({date:new Date().toISOString(),results,errors,requests},null,2));
 await browser?.close();await vite?.close();await stopApi();
 // Únicamente el directorio temporal creado para esta ejecución.
 assert.equal(dirname(resolve(dataDir)),resolve(tmpdir()));
 assert.ok(basename(dataDir).startsWith('mm-api-e2e-'));
 await rm(dataDir,{recursive:true,force:true});
}
