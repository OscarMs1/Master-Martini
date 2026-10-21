import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {initialProducts, categories, posts, refreshCatalogProductMedia} from '../src/data/catalog.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const asset=file=>resolve(root,'public',file.slice(1));

test('A01: toda imagen local de producto tiene un archivo real',()=>{
 const missing=initialProducts.filter(p=>!p.image||!p.image.startsWith('/assets/')||!existsSync(asset(p.image))).map(p=>p.id);
 assert.deepEqual(missing,[]);
});

test('A02: imágenes de categorías y publicaciones se encuentran localmente',()=>{
 const missing=[...categories,...posts].filter(x=>!existsSync(asset(x.image))).map(x=>x.name);
 assert.deepEqual(missing,[]);
});

test('A03: OraSì Soya tiene una imagen propia y alternativa accesible',()=>{
 const p=initialProducts.find(x=>x.id==='MM-011');
 assert.ok(p);
 assert.equal(p.image,'/assets/catalog-MM-011.webp');
 assert.ok(existsSync(asset(p.image)));
 assert.ok(p.sourceUrl.startsWith('https://aldeanativa.cl/'));
});

test('A04: el HTML inicia sin pantalla provisional de carga',()=>{
 const html=readFileSync(resolve(root,'index.html'),'utf8');
 assert.match(html,/<div id="root"><\/div>/);
 assert.doesNotMatch(html,/Cargando Master Martini/);
 assert.doesNotMatch(html,/Si este mensaje no desaparece/);
});


test('A05: las tres nuevas fotos son independientes y se cargan desde archivos locales',()=>{
 const expected={ 'MM-007':'/assets/prod-base-gelato-uht-v2.jpg', 'MM-008':'/assets/prod-pasta-pistacho-v2.jpg', 'MM-009':'/assets/prod-master-gourmet-encuadrado.png' };
 for(const [id,image] of Object.entries(expected)){
  assert.equal(initialProducts.find(p=>p.id===id).image,image);
  assert.ok(existsSync(asset(image)),`No existe ${image}`);
 }
});

test('A06: los productos antiguos guardados renuevan sus fotos sin perder cambios comerciales',()=>{
 const historical=[
  {id:'MM-007',image:'/assets/cat-gelateria.jpg',price:123,stock:4},
  {id:'MM-008',image:'/assets/cat-gelateria.jpg',price:456},
  {id:'MM-009',image:'/assets/blog-pastel.jpg',stock:2},
  {id:'MM-001',image:'/assets/catalog-MM-001.webp'},
  {id:'EDIT-01',image:'/assets/producto-respaldo.svg'}
 ];
 const migrated=refreshCatalogProductMedia(historical);
 assert.deepEqual(migrated.slice(0,3).map(p=>p.image),['/assets/prod-base-gelato-uht-v2.jpg','/assets/prod-pasta-pistacho-v2.jpg','/assets/prod-master-gourmet-encuadrado.png']);
 assert.equal(migrated[0].price,123);assert.equal(migrated[0].stock,4);
 assert.deepEqual(migrated[3],historical[3]);assert.deepEqual(migrated[4],historical[4]);
 const custom=[{id:'MM-007',image:'/assets/admin-subio-foto.jpg',price:777}];
 assert.deepEqual(refreshCatalogProductMedia(custom),custom);
});

// La nueva fotografía para tarjetas se usa en Inicio y Novedades sin alterar la imagen de artículo.
test('A07: Tendencias en pastelería utiliza encuadre local diferenciado para tarjetas',()=>{
 const p=posts.find(x=>x.slug==='tendencias-en-pasteleria');
 assert.ok(p);
 assert.equal(p.cardImage,'/assets/blog-pastel-tarjetas-centrado.webp');
 assert.ok(existsSync(asset(p.cardImage)));
 assert.ok(existsSync(asset(p.image)));
 const home=readFileSync(resolve(root,'src/pages/Home.jsx'),'utf8');
 const blog=readFileSync(resolve(root,'src/pages/InfoPages.jsx'),'utf8');
 assert.match(home,/post\.cardImage\s*\|\|\s*post\.image/);
 assert.match(blog,/p\.cardImage\s*\|\|\s*p\.image/);
});
