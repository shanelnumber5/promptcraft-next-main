const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const name of ['workspace-layout','scenario-studio']) {
  const result=spawnSync(process.execPath,[path.join(__dirname,name+'.test.cjs')],{stdio:'inherit'});
  if(result.error || result.status!==0) {if(result.error) console.error(result.error.message);process.exit(result.status || 1);}
}
