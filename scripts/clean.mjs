import { rm } from 'node:fs/promises';
for (const path of ['node_modules','.turbo']) await rm(path,{recursive:true,force:true});
console.log('Workspace cache cleaned.');
