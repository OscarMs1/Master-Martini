/** API educativa opcional, ejecutable con Node.js sin dependencias extra.
 * No usar en producción; sin autenticación ni protecciones de seguridad.
 */
import http from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {initialProducts,refreshCatalogProductMedia} from '../src/data/catalog.js';
import {validateProduct,validateCheckout,cartIsAvailable,orderTotal,netPrice} from '../src/utils/commerce.js';
const here=path.dirname(fileURLToPath(import.meta.url));const dataDir=process.env.MM_DATA_DIR||path.join(here,'.data');
const file=path.join(dataDir,'store.json');
let state={products:structuredClone(initialProducts),orders:[]};
async function load(){try{const saved=JSON.parse(await readFile(file,'utf8'));if(Array.isArray(saved.products))state={...saved,products:refreshCatalogProductMedia(saved.products)};}catch{}}
async function save(){await mkdir(dataDir,{recursive:true});await writeFile(file,JSON.stringify(state,null,2));}
function respond(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'http://localhost:5173','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
async function body(req){let s='';for await(const buf of req){s+=buf;if(s.length>100_000)throw new Error('Payload demasiado grande');}return JSON.parse(s||'{}')}
await load();
const port=Number(process.env.PORT||3001);
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');const r=u.pathname;
 if(req.method==='OPTIONS')return respond(res,204,{});
 try {
  if(r==='/api/health'&&req.method==='GET')return respond(res,200,{ok:true,mode:'demo',products:state.products.length});
  if(r==='/api/products'&&req.method==='GET')return respond(res,200,state.products);
  if(r==='/api/orders'&&req.method==='GET')return respond(res,200,state.orders);
  if(r==='/api/products'&&req.method==='POST'){
   const p=await body(req),errors=validateProduct(p);
   if(Object.keys(errors).length)return respond(res,422,{errors});
   if(state.products.some(x=>x.id===p.id))return respond(res,409,{error:'SKU duplicado'});
   state.products.push(p);await save();return respond(res,201,p);
  }
  const match=r.match(/^\/api\/products\/([^/]+)$/);
  if(match){const id=decodeURIComponent(match[1]),ix=state.products.findIndex(x=>x.id===id);
   if(ix<0)return respond(res,404,{error:'Producto inexistente'});
   if(req.method==='DELETE'){state.products.splice(ix,1);await save();return respond(res,200,{deleted:id})}
   if(req.method==='PUT'){const p={...state.products[ix],...await body(req),id},errors=validateProduct(p);
    if(Object.keys(errors).length)return respond(res,422,{errors});state.products[ix]=p;await save();return respond(res,200,p)}
  }
  if(r==='/api/checkout'&&req.method==='POST'){
   const {details,cart,userId,forceFail}=await body(req);
   const errors=validateCheckout(details||{});
   if(Object.keys(errors).length)return respond(res,422,{error:'Datos de entrega inválidos',errors});
   if(forceFail)return respond(res,402,{error:'Pago rechazado en la simulación'});
   if(!cartIsAvailable(cart,state.products))return respond(res,409,{error:'Stock insuficiente o carrito inválido'});
   const order={id:'PED-'+crypto.randomUUID(),date:new Date().toISOString(),details,userId:userId||null,status:'Aprobado (simulado)',total:orderTotal(cart,state.products,details.delivery),items:cart.map(item=>{const p=state.products.find(p=>p.id===item.id);return {...item,name:p.name,price:netPrice(p)}})};
   state.products=state.products.map(p=>({...p,stock:p.stock-(cart.find(i=>i.id===p.id)?.qty||0)}));
   state.orders.unshift(order);await save();return respond(res,201,{order,products:state.products});
  }
  if(r==='/api/reset'&&req.method==='POST'){state={products:structuredClone(initialProducts),orders:[]};await save();return respond(res,200,{ok:true});}
  return respond(res,404,{error:'Ruta API no existe'});
 }catch(err){return respond(res,400,{error:err.message})}
});
server.listen(port,'127.0.0.1',()=>console.log(`API demo lista en http://127.0.0.1:${port}/api/health`));
