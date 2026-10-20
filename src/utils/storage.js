export function readStore(key,fallback) {
 try { const raw=window.localStorage.getItem(key); return raw===null?fallback:JSON.parse(raw); }
 catch {return fallback;}
}
export function writeStore(key,value) {try{window.localStorage.setItem(key,JSON.stringify(value));}catch{ /* navegación privada */ }}
export function createProduct(list,product){ if(list.some(x=>x.id===product.id)) throw new Error('El SKU ya existe.'); return [...list,product]; }
export function updateProduct(list,id,changes){ if(!list.some(p=>p.id===id)) throw new Error('Producto inexistente.');return list.map(p=>p.id===id?{...p,...changes,id}:p); }
export function deleteProduct(list,id){return list.filter(p=>p.id!==id);}
