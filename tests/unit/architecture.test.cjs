const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
function files(folder) {
 return fs.readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(folder,e.name)):[path.join(folder,e.name)]);
}
const reached=new Set();
function walk(file) {
 if(reached.has(file))return;
 reached.add(file);
 const text=fs.readFileSync(file,'utf8');
 for(const m of text.matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g)) if(m[1].startsWith('.'))walk(path.resolve(path.dirname(file),m[1]));
}
walk(path.join(root,'src/app/entry.js'));
for(const file of files(path.join(root,'src')).filter(p=>p.endsWith('.js')))assert(reached.has(file),`Unreachable app module: ${path.relative(root,file)}`);
const styles=new Set();
function css(file){
 if(styles.has(file))return;styles.add(file);
 const text=fs.readFileSync(file,'utf8');
 for(const m of text.matchAll(/@import\s+url\(['"]([^'"]+)['"]\)/g))css(path.resolve(path.dirname(file),m[1].split('?')[0]));
}
css(path.join(root,'src/styles/styles.css'));
for(const file of files(path.join(root,'src/styles')))assert(styles.has(file),`Unimported stylesheet: ${path.relative(root,file)}`);
for(const file of files(path.join(root,'tests')).filter(p=>p.endsWith('.cjs'))) {
 for(const m of fs.readFileSync(file,'utf8').matchAll(/require\(['"](\.[^'"]+)['"]\)/g))assert(fs.existsSync(path.resolve(path.dirname(file),m[1])),`Missing test helper in ${file}: ${m[1]}`);
}
(async()=>{
 const {freshWorkspace}=await import('../../src/features/workspace/storage.js');
 const {renderWorkspace}=await import('../../src/features/workspace/screen.js');
 const {designRoute}=await import('../../src/features/workspace/routes.js');
 for(const experience of ['workspace','scenario']){
  const state=freshWorkspace();state.experience=experience;state.designPanel='revision';
  const html=renderWorkspace(state,{pending:false,configured:true});
  assert(html.includes(designRoute(experience).heading));assert(html.includes('data-design-page="subject"'));
  assert(!html.includes('data-setup-live-preview'));
 }
 console.log('PASS: app and stylesheet reachability, test helper references, shared route rendering. Offline only.');
})().catch(error=>{console.error(error);process.exitCode=1;});
