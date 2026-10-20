/** Sintaxis con TypeScript (si está disponible) o Babel tras npm install.
 * No reemplaza npm run build, ya que no resuelve imports ni renderiza DOM.
 */
const fs=require('node:fs'), path=require('node:path');
function scan(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(f=>f.isDirectory()?scan(path.join(folder,f.name)):/\.(m?js|jsx|cjs)$/.test(f.name)?[path.join(folder,f.name)]:[])}
const files=['src','server','testing'].flatMap(scan);
let ts=null,babel=null;
try{ts=require('typescript')}catch{}
if(!ts){try{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}catch{}}
if(!ts){try{babel=require('@babel/core')}catch{}}
if(!ts&&!babel){console.error('Instala dependencias con npm install para analizar JSX.');process.exit(2)}
let errors=0;
for(const f of files){
 const text=fs.readFileSync(f,'utf8');
 try{
  if(ts){const parsed=ts.createSourceFile(f,text,ts.ScriptTarget.Latest,true,f.endsWith('.jsx')?ts.ScriptKind.JSX:ts.ScriptKind.JS);if(parsed.parseDiagnostics.length)throw new Error(parsed.parseDiagnostics.map(x=>String(x.messageText)).join('; '))}
  else babel.parseSync(text,{filename:path.resolve(f),sourceType:'unambiguous',presets:['@babel/preset-react']});
 }catch(e){errors++;console.error('FALLO',f,e.message)}
}
console.log(`Sintaxis ${files.length} archivos JS/JSX: ${errors} errores`);
if(errors)process.exitCode=1;
