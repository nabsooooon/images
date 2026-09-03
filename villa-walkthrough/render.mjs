import { chromium } from 'playwright-core';
import fs from 'node:fs';
const a=Object.fromEntries(process.argv.slice(2).map(s=>{const [k,v]=s.replace(/^--/,'').split('=');return [k,v??'1'];}));
const W=+(a.w||1080),H=+(a.h||1920),FPS=+(a.fps||24),DUR=+(a.dur||22);
const total=Math.round(FPS*DUR);
const start=+(a.start||0),end=Math.min(+(a.end||total),total);
const out=a.out||'frames';const fmt=a.fmt||'jpeg';
const times=a.times?a.times.split(',').map(Number):null;   // explicit seconds list for stills
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',headless:true,
  args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--headless=new']});
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
page.on('console',m=>{if(m.type()==='error'||a.verbose)console.log('[page]',m.text());});
page.on('pageerror',e=>console.log('[pageerror]',e.message));
const t0=Date.now();
await page.goto(`http://127.0.0.1:8765/render.html?mode=render&w=${W}&h=${H}&q=${a.q||'high'}`,{waitUntil:'load'});
await page.waitForFunction(()=>window.__villa&&window.__villa.ready===true,null,{timeout:300000});
console.log('scene ready in',Date.now()-t0,'ms');
if(a.diag){const r=a.diag.split(',').map(Number);const res=await page.evaluate((r)=>{const out=[];window.__villa.scene.updateMatrixWorld(true);window.__villa.scene.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
  if(bb.max.x<r[0]||bb.min.x>r[1]||bb.max.y<r[2]||bb.min.y>r[3]||bb.max.z<r[4]||bb.min.z>r[5])return;
  const m=o.material;out.push(`${o.geometry.type} mat=${m.type} col=${m.color?m.color.getHexString():'-'} map=${m.map?'y':'n'} op=${m.opacity} bb=[${[bb.min.x,bb.min.y,bb.min.z,bb.max.x,bb.max.y,bb.max.z].map(v=>v.toFixed(2)).join(',')}]`);});return out;},r);
  console.log(res.join('\n'));await browser.close();process.exit(0);}
if(a.view){const v=a.view.split(',').map(Number);const url=await page.evaluate((v)=>window.__villa.renderView(...v),v);fs.writeFileSync(`${out}/view_${a.name||'dbg'}.png`,Buffer.from(url.split(',')[1],'base64'));console.log('view written');await browser.close();process.exit(0);}
const jobs=times?times.map((s,i)=>({u:s/DUR,i:Math.round(s*FPS),name:`still_${String(s).replace('.','_')}s`})):Array.from({length:end-start},(_,k)=>({u:(start+k)/total,i:start+k,name:`f${String(start+k).padStart(4,'0')}`}));
for(const j of jobs){const t1=Date.now();
  const url=await page.evaluate(([u,i,f])=>window.__villa.renderFrame(u,i,f,0.94),[j.u,j.i,fmt]);
  fs.writeFileSync(`${out}/${j.name}.${fmt==='png'?'png':'jpg'}`,Buffer.from(url.split(',')[1],'base64'));
  console.log(j.name,Date.now()-t1,'ms');}
await browser.close();
console.log('done',jobs.length,'frames in',((Date.now()-t0)/1000).toFixed(1),'s');
