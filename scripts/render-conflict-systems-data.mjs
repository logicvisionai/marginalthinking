import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(),out=path.join(root,'dist','data');
const source=path.join(root,'data','conflict-systems.json');
if(!fs.existsSync(source))throw new Error('data/conflict-systems.json ausente');
fs.mkdirSync(out,{recursive:true});
fs.copyFileSync(source,path.join(out,'conflict-systems.json'));
console.log('Conflict Systems dataset published.');
