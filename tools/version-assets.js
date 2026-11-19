// GitHub Pages caches assets. Resolve each browser module to the version shipped with this HTML.
import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';

const modules=(await readdir('scripts')).filter(name=>name.endsWith('.js')).sort().map(name=>'scripts/'+name);
modules.push('assets/vendor/three-museum.js');
async function version(path) {
  const hash=createHash('sha256').update(await readFile(path)).digest('hex').slice(0,12);
  return './'+path+'?v='+hash;
}
const imports=Object.fromEntries(await Promise.all(modules.map(async path=>['./'+path,await version(path)])));
const map='<script type="importmap">'+JSON.stringify({imports},null,2)+'</script>';
let html=await readFile('index.html','utf8');
html=html.replace(/  <script type="importmap">[\s\S]*?<\/script>\n/,'');
html=html.replace(/href="(?:\.\/)?museum\.css(?:\?v=[\w]+)?"/,'href="'+await version('museum.css')+'"');
html=html.replace(/  <script type="module" src="(?:\.\/)?scripts\/museum\.js(?:\?v=[\w]+)?"><\/script>/,
  '  '+map+'\n  <script type="module" src="'+imports['./scripts/museum.js']+'"></script>');
await writeFile('index.html',html);
