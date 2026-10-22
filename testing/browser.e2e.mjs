/** Navegador real. Iniciar npm run dev antes de ejecutar npm run test:e2e. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {clases} from '../src/data/clases.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
const out='testing/evidence/browser';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[],errors=[],failedResources=[];
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)failedResources.push({url:r.url(),status:r.status()})});
async function check(name,fn){await fn();results.push({name,passed:true});console.log('PASS',name)}
async function shot(name){await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:`${out}/${name}.png`,fullPage:false})}
async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Desbordamiento horizontal')}
const details={'Nombre completo *':'Ana María Pérez','RUN *':'12.345.678-5','Correo electrónico *':'ana@example.cl','Teléfono *':'+56912345678','Dirección de entrega *':'Calle Prueba 123'};
async function checkoutFields(){
 for(const [label,value] of Object.entries(details))await page.getByLabel(label,{exact:true}).fill(value);
 await page.getByLabel('Región *',{exact:true}).selectOption('Metropolitana de Santiago');
 await page.getByLabel('Comuna *',{exact:true}).selectOption('Santiago');
}
try{
 for(const [width,height] of [[390,844],[768,1024],[1366,768],[1440,900],[1920,1080]]){
  await page.setViewportSize({width,height});
  await check(`Inicio y carrusel ${width}x${height}`,async()=>{
   await page.goto(base);await page.locator('.fk-hero-image.active').waitFor();await page.evaluate(()=>document.fonts.ready);
   await noOverflow();
   const bounds=await page.locator('.fk-hero').boundingBox();assert.equal(Math.round(bounds.height),height);
   assert.equal(await page.locator('.fk-hero-dots button').count(),3);
   await shot(`inicio-${width}`);
   await page.getByRole('button',{name:/Ir a diapositiva 3:/}).click();
   await shot(`gelato-${width}`);
   await page.evaluate(()=>window.scrollTo(0,850));
   await page.locator('.site-header.is-scrolled').waitFor();
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.site-header')).backgroundColor==='rgb(5, 25, 34)');
   assert.equal(await page.locator('.site-header').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(5, 25, 34)');
   if(width<=900){await page.getByRole('button',{name:'Abrir menú',exact:true}).click();await page.getByRole('navigation').getByRole('link',{name:'Tienda',exact:true}).click();}
   else await page.getByRole('navigation').getByRole('link',{name:'Tienda',exact:true}).click();
   await page.waitForURL('**/catalogo');await page.getByRole('heading',{name:'Catálogo de productos',level:1}).waitFor();
   if(width<=900)await page.getByRole('button',{name:'Abrir menú',exact:true}).waitFor();
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.product-photo img')).filter(i=>i.getBoundingClientRect().top<innerHeight).every(i=>i.complete&&i.naturalWidth>0));
   await noOverflow();await shot(`catalogo-${width}`);
  });
  await check(`Rutas y formularios ${width}x${height}`,async()=>{
   for(const route of ['/clases','/ofertas','/categorias/gelateria','/producto/MM-006','/carrito','/checkout','/compra-rechazada','/login','/registro','/contacto','/nosotros','/blog','/blog/gelato-artesanal','/no-existe']){
    await page.goto(base+route);await page.locator('h1').waitFor();await noOverflow();
   }
  });
 }
 await page.setViewportSize({width:1366,height:768});
 await check('Filtro, búsqueda, detalle, carrito, cantidades y eliminación',async()=>{
  await page.goto(base+'/catalogo');
  await page.getByRole('button',{name:'Gelatería',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid=product-card]').length===2);
  assert.equal(await page.getByTestId('product-card').count(),2);
  await page.getByRole('button',{name:'Todos',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid=product-card]').length===12);
  await page.getByRole('searchbox',{name:'Buscar productos',exact:true}).fill('Gran Master Hoja');
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid=product-card]').length===1);
  assert.equal(await page.getByTestId('product-card').count(),1);
  await page.getByRole('link',{name:'Ver Gran Master Hoja',exact:true}).click();
  await page.getByRole('button',{name:'Añadir al carrito',exact:true}).click();
  await page.getByRole('link',{name:'Carrito con 1 productos'}).click();
  await page.getByRole('button',{name:'Aumentar Gran Master Hoja'}).click();
  await page.waitForFunction(()=>document.querySelector('.qty-control output')?.textContent==='2');
  assert.match(await page.locator('.summary').innerText(),/10\.782/);
  await page.reload();await page.waitForFunction(()=>document.querySelector('.qty-control output')?.textContent==='2');assert.equal(await page.locator('.qty-control output').innerText(),'2');
  await page.getByRole('button',{name:'Reducir Gran Master Hoja'}).click();
  await page.getByRole('button',{name:'Eliminar',exact:true}).click();await page.getByText('Tu carrito está vacío').waitFor();
  assert.equal(await page.getByText('Tu carrito está vacío').count(),1);
 });
 await check('Checkout inválido, rechazo y aprobación con persistencia',async()=>{
  await page.goto(base+'/producto/MM-001');await page.getByRole('button',{name:'Añadir al carrito',exact:true}).click();
  await page.goto(base+'/checkout');await page.getByRole('button',{name:/Confirmar pedido/}).click();
  assert.equal(await page.getByText(/RUN inválido/).count(),1);await shot('checkout-invalido');
  await checkoutFields();await page.getByLabel('Simular pago rechazado').check();
  await page.getByRole('button',{name:/Confirmar pedido/}).click();await page.waitForURL('**/compra-rechazada');await shot('compra-rechazada');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mm-ep2-orders'))),[]);
  await page.getByRole('link',{name:'Volver a checkout'}).click();await checkoutFields();
  await page.getByRole('button',{name:/Confirmar pedido/}).click();await page.waitForURL('**/compra-exitosa/**');
  await shot('compra-exitosa');await page.reload();
  assert.equal(await page.getByRole('heading',{name:'¡Tu pedido fue confirmado!'}).count(),1);
  const store=await page.evaluate(()=>({cart:JSON.parse(localStorage.getItem('mm-ep2-cart')),orders:JSON.parse(localStorage.getItem('mm-ep2-orders')),products:JSON.parse(localStorage.getItem('mm-ep2-products'))}));
  assert.deepEqual(store.cart,[]);assert.equal(store.orders.length,1);assert.equal(store.products[0].stock,24);
 });
 await check('Login y CRUD administrativo con recarga',async()=>{
  await page.goto(base+'/login');await page.locator('.form-panel').getByLabel('Correo electrónico',{exact:true}).fill('admin@demo.cl');await page.getByLabel('Contraseña',{exact:true}).fill('Admin123');
  await page.getByRole('button',{name:'Entrar a mi cuenta'}).click();await page.waitForURL('**/admin');
  await page.getByRole('button',{name:'Nuevo producto'}).click();
  await page.getByLabel('Código SKU *',{exact:true}).fill('QA-E2E');await page.getByLabel('Nombre *',{exact:true}).fill('Producto navegador');
  await page.getByLabel('Precio CLP *',{exact:true}).fill('1500');await page.getByLabel('Stock *',{exact:true}).fill('4');
  await page.getByRole('button',{name:'Guardar producto'}).click();await page.getByText('Producto creado correctamente.').waitFor();
  await page.getByRole('button',{name:'Editar Producto navegador'}).click();await page.getByLabel('Nombre *',{exact:true}).fill('Producto actualizado navegador');
  await page.getByRole('button',{name:'Guardar producto'}).click();await page.getByText('Producto actualizado.').waitFor();await page.reload();
  await page.getByRole('button',{name:'Editar Producto actualizado navegador'}).waitFor();
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Eliminar Producto actualizado navegador'}).click();
  await page.getByText('Producto eliminado.').waitFor();await page.reload();assert.equal(await page.getByRole('button',{name:'Editar Producto actualizado navegador'}).count(),0);
  for(const width of [390,768,1366,1440,1920]){await page.setViewportSize({width,height:width===390?844:900});await noOverflow();await shot(`admin-${width}`);}
 });
 await check('Clases, inscripción, insumos y cuenta con persistencia',async()=>{
  await page.goto(base+'/login');
  await page.locator('.form-panel').getByLabel('Correo electrónico',{exact:true}).fill('cliente@demo.cl');
  await page.getByLabel('Contraseña',{exact:true}).fill('Cliente123');
  await page.getByRole('button',{name:'Entrar a mi cuenta'}).click();await page.waitForURL('**/mi-cuenta');
  await page.goto(base+'/clases');await page.getByRole('button',{name:'Online',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid=clase-card]').length===2);
  await page.getByRole('button',{name:'Todas',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid=clase-card]').length===4);
  const card=page.getByTestId('clase-card').first();
  await card.getByRole('button',{name:'Inscribirme',exact:true}).click();
  await card.getByText('¡Estás inscrito en esta clase!').waitFor();
  assert.equal(await card.getByText(`${clases[0].cupos-1} cupos disponibles`).count(),1);
  await card.getByRole('button',{name:'Agregar insumos al carrito'}).click();await page.reload();
  await page.getByTestId('clase-card').first().getByText('¡Estás inscrito en esta clase!').waitFor();
  await page.goto(base+'/mi-cuenta');await page.getByText(clases[0].titulo,{exact:true}).waitFor();
  for(const width of [390,768,1366,1920]){
    await page.setViewportSize({width,height:900});
    for(const route of ['/clases','/carrito','/checkout']){
      await page.goto(base+route);await page.locator('h1').waitFor();await noOverflow();
      await shot(`${route.slice(1)}-${width}`);
    }
  }
  await checkoutFields();await page.getByRole('button',{name:/Confirmar pedido/}).click();
  await page.waitForURL('**/compra-exitosa/**');
  const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('mm-ep2-orders'))[0].id);
  await page.goto(base+'/mi-cuenta');await page.getByText(id,{exact:true}).waitFor();
 });
 await check('Nueva sesión de navegador tiene datos iniciales independientes',async()=>{
  const fresh=await browser.newContext();const tab=await fresh.newPage();await tab.goto(base+'/catalogo');
  assert.equal(await tab.getByTestId('product-card').count(),12);
  assert.equal(await tab.getByRole('link',{name:'Carrito con 0 productos'}).count(),1);await fresh.close();
 });
 await check('Recursos locales de catálogo cargan y mantienen proporción',async()=>{
  await page.goto(base+'/catalogo');
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('.product-photo img')).every(i=>i.complete&&i.naturalWidth>0));
  const images=await page.locator('.product-photo img').evaluateAll(imgs=>imgs.map(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight,fit:getComputedStyle(i).objectFit})));
  assert.ok(images.every(i=>i.fit==='contain'));await writeFile(`${out}/images.json`,JSON.stringify(images,null,2));
 });
 assert.deepEqual(errors,[]);assert.deepEqual(failedResources,[]);
}catch(e){results.push({name:'Fallo de ejecución',passed:false,error:e.stack});console.error(e);process.exitCode=1;}
finally{await writeFile(`${out}/results.json`,JSON.stringify({results,errors,failedResources,date:new Date().toISOString()},null,2));await browser.close();}
