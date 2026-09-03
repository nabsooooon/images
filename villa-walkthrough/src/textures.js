import * as THREE from 'three';

export function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function tex(w,h,draw,opts={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const ctx=c.getContext('2d');draw(ctx,w,h);
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=opts.linear?THREE.NoColorSpace:THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=opts.clamp?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;
  t.anisotropy=opts.aniso||4;
  t.needsUpdate=true;
  return t;
}
function noise(ctx,w,h,amp,r){
  const img=ctx.getImageData(0,0,w,h),d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(r()-0.5)*2*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}
  ctx.putImageData(img,0,0);
}
function grid(ctx,w,h,nx,ny,style,lw){
  ctx.strokeStyle=style;ctx.lineWidth=lw;
  for(let i=0;i<=nx;i++){ctx.beginPath();ctx.moveTo(i*w/nx,0);ctx.lineTo(i*w/nx,h);ctx.stroke();}
  for(let i=0;i<=ny;i++){ctx.beginPath();ctx.moveTo(0,i*h/ny);ctx.lineTo(w,i*h/ny);ctx.stroke();}
}

// ---------- floors / walls ----------
export function marble(seed=1){return tex(1024,1024,(ctx,w,h)=>{
  const r=rng(seed);
  ctx.fillStyle='#ecebe6';ctx.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){const x=r()*w,y=r()*h,rad=80+r()*240;const g=ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(150,150,160,${0.05+r()*0.09})`);g.addColorStop(1,'rgba(150,150,160,0)');ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);}
  ctx.lineCap='round';
  for(let i=0;i<30;i++){let x=r()*w,y=r()*h,a=r()*Math.PI*2;ctx.beginPath();ctx.moveTo(x,y);const len=40+r()*100;
    for(let k=0;k<len;k++){a+=(r()-0.5)*0.7;x+=Math.cos(a)*8;y+=Math.sin(a)*8;ctx.lineTo(x,y);}
    ctx.strokeStyle=`rgba(105,108,120,${0.1+r()*0.25})`;ctx.lineWidth=0.6+r()*2.4;ctx.stroke();}
  noise(ctx,w,h,5,r);
  grid(ctx,w,h,4,4,'rgba(70,70,75,0.4)',2);
});}

export function terrace(seed=11){return tex(1024,1024,(ctx,w,h)=>{
  const r=rng(seed);
  ctx.fillStyle='#d3cbbd';ctx.fillRect(0,0,w,h);
  for(let i=0;i<50;i++){const x=r()*w,y=r()*h,rad=100+r()*200;const g=ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(120,110,95,${0.04+r()*0.08})`);g.addColorStop(1,'rgba(120,110,95,0)');ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);}
  noise(ctx,w,h,7,r);
  grid(ctx,w,h,2,2,'rgba(60,55,50,0.5)',3);
});}

export function travertine(seed=2){return tex(1024,1024,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#c8b697';ctx.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=3+r()*6){ctx.strokeStyle=`rgba(${120+r()*40|0},${100+r()*30|0},${70+r()*30|0},${0.05+r()*0.2})`;ctx.lineWidth=1+r()*3;
    ctx.beginPath();ctx.moveTo(0,y);const ph=r()*6;for(let x=0;x<=w;x+=32)ctx.lineTo(x,y+Math.sin(x*0.02+ph)*2);ctx.stroke();}
  for(let i=0;i<800;i++){ctx.fillStyle=`rgba(80,62,45,${0.15+r()*0.3})`;ctx.beginPath();ctx.ellipse(r()*w,r()*h,1+r()*6,0.5+r()*2,0,0,Math.PI*2);ctx.fill();}
  noise(ctx,w,h,5,r);
  grid(ctx,w,h,2,4,'rgba(70,60,50,0.6)',3);
});}

export function concrete(seed=12){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#d6d3cc';ctx.fillRect(0,0,w,h);
  for(let i=0;i<30;i++){const x=r()*w,y=r()*h,rad=60+r()*160;const g=ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(90,90,90,${0.04+r()*0.08})`);g.addColorStop(1,'rgba(90,90,90,0)');ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);}
  noise(ctx,w,h,6,r);
});}

export function wood(base='#3a2a20',light='#5c4230',dark='#1c130f',seed=3,vertical=false){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
  ctx.save();if(vertical){ctx.translate(w,0);ctx.rotate(Math.PI/2);}
  for(let i=0;i<340;i++){const y=r()*h;ctx.strokeStyle=r()<0.5?light:dark;ctx.globalAlpha=0.05+r()*0.22;ctx.lineWidth=0.5+r()*2.5;
    ctx.beginPath();ctx.moveTo(-4,y);const ph=r()*9;for(let x=0;x<=w+8;x+=24)ctx.lineTo(x,y+Math.sin(x*0.01+ph)*1.5);ctx.stroke();}
  ctx.restore();ctx.globalAlpha=1;noise(ctx,w,h,4,r);
});}

export function toile(seed=4){return tex(1024,1024,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#e8e5dc';ctx.fillRect(0,0,w,h);
  const ink='#3d4b6b';ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineCap='round';
  const cell=256;
  for(let cy=0;cy<4;cy++)for(let cx=0;cx<4;cx++){
    ctx.save();ctx.translate(cx*cell,cy*cell);if((cx+cy)%2){ctx.translate(cell,0);ctx.scale(-1,1);}
    const tx=60+r()*40,ty=205;
    ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+8,ty-60,tx+4,ty-110);ctx.stroke();
    ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx+5,ty-70);ctx.quadraticCurveTo(tx+25,ty-85,tx+32,ty-105);ctx.stroke();
    ctx.lineWidth=1.9;
    for(let i=0;i<26;i++){const a=r()*Math.PI*2,d=r()*42;const x=tx+6+Math.cos(a)*d,y=ty-128+Math.sin(a)*d*0.7;ctx.globalAlpha=0.45+r()*0.55;
      ctx.beginPath();ctx.arc(x,y,5+r()*10,0,Math.PI*2);ctx.stroke();}
    ctx.globalAlpha=1;
    for(let i=0;i<7;i++){ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx-45+r()*20,ty+2+i*3);ctx.lineTo(tx+45+r()*30,ty+4+i*3);ctx.stroke();}
    const px=150+r()*40,py=150;ctx.lineWidth=1.6;ctx.strokeRect(px,py,50,45);
    ctx.beginPath();ctx.moveTo(px-6,py);ctx.lineTo(px+25,py-28);ctx.lineTo(px+56,py);ctx.stroke();ctx.strokeRect(px+18,py+18,14,27);
    ctx.lineWidth=1;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(px+2,py+8+i*7);ctx.lineTo(px+48,py+8+i*7);ctx.stroke();}
    const fx=px+80,fy=py+45;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(fx,fy-40,5,0,Math.PI*2);ctx.stroke();ctx.lineWidth=2.2;
    ctx.beginPath();ctx.moveTo(fx,fy-35);ctx.lineTo(fx,fy-12);ctx.lineTo(fx-6,fy);ctx.moveTo(fx,fy-12);ctx.lineTo(fx+6,fy);ctx.moveTo(fx-9,fy-25);ctx.lineTo(fx+9,fy-22);ctx.stroke();
    for(let i=0;i<8;i++){ctx.lineWidth=1;ctx.globalAlpha=0.55;ctx.beginPath();ctx.arc(r()*cell,r()*cell,3+r()*6,0,Math.PI*2);ctx.stroke();}
    ctx.globalAlpha=1;ctx.restore();
  }
  noise(ctx,w,h,3,r);
});}

// ---------- fabrics ----------
export function palm(seed=5){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#f6f1e7';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c65b28';ctx.lineCap='round';
  for(let i=0;i<10;i++){const cx=r()*w,cy=r()*h,rot=r()*Math.PI*2,n=7+(r()*3|0);
    for(let f=0;f<n;f++){const a=rot+(f/(n-1)-0.5)*2.3,len=45+r()*35;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);ctx.stroke();ctx.lineWidth=1.5;
      for(let k=0.18;k<1;k+=0.075){const px=cx+Math.cos(a)*len*k,py=cy+Math.sin(a)*len*k,ll=10*(1-k)+3;
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a+0.95)*ll,py+Math.sin(a+0.95)*ll);ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a-0.95)*ll,py+Math.sin(a-0.95)*ll);ctx.stroke();}}
  }
  noise(ctx,w,h,3,r);
});}

export function stripes(seed=6){return tex(256,256,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#b4542a';ctx.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=24){ctx.fillStyle='#efe3cf';ctx.fillRect(0,y,w,5);ctx.fillStyle='#3a2318';ctx.fillRect(0,y+8,w,2);ctx.fillStyle='#d97a45';ctx.fillRect(0,y+14,w,3);}
  noise(ctx,w,h,5,r);
});}

export function checker(seed=7){return tex(256,256,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#e9e2d2';ctx.fillRect(0,0,w,h);const s=16;ctx.fillStyle='#2d2b26';
  for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s){const on=((x/s+y/s)%2)===0;if(on){ctx.fillRect(x,y,s,s);}else{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s,y);ctx.lineTo(x,y+s);ctx.closePath();ctx.fill();}}
  noise(ctx,w,h,6,r);
});}

export function floral(seed=8){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#1f5f66';ctx.fillRect(0,0,w,h);
  const cols=['#e07b3a','#f0c27a','#d9455f','#7fb069','#f6e2b5','#3a8f8a'];
  for(let i=0;i<70;i++){const x=r()*w,y=r()*h,rad=8+r()*22;ctx.fillStyle=cols[i%cols.length];ctx.globalAlpha=0.85;
    for(let p=0;p<6;p++){const a=p/6*Math.PI*2;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*rad*0.6,y+Math.sin(a)*rad*0.6,rad*0.45,rad*0.25,a,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#f7e6a0';ctx.beginPath();ctx.arc(x,y,rad*0.22,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;ctx.strokeStyle='#8fc7a0';ctx.lineWidth=2;
  for(let i=0;i<60;i++){const x=r()*w,y=r()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+20,y-30,x+40+r()*20,y-10);ctx.stroke();}
  noise(ctx,w,h,4,r);
});}

export function fabric(base='#f1eee8',seed=9){return tex(256,256,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle=base;ctx.fillRect(0,0,w,h);ctx.globalAlpha=0.08;ctx.strokeStyle='#000';ctx.lineWidth=1;
  for(let y=0;y<h;y+=3){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(let x=0;x<w;x+=3){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  ctx.globalAlpha=1;noise(ctx,w,h,7,r);
});}

export function rug(seed=10){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#c9b48e';ctx.fillRect(0,0,w,h);ctx.globalAlpha=0.16;ctx.strokeStyle='#5a4527';ctx.lineWidth=1.5;
  for(let y=0;y<h;y+=5){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(let x=0;x<w;x+=5){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  ctx.globalAlpha=1;noise(ctx,w,h,12,r);
});}

export function cane(seed=13){return tex(256,256,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#d9b985';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#5a3e1e';ctx.lineWidth=3;ctx.globalAlpha=0.7;
  for(let y=0;y<=h;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(let x=0;x<=w;x+=16){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let x=-w;x<=w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w,h);ctx.stroke();}
  ctx.globalAlpha=1;noise(ctx,w,h,6,r);
});}

// ---------- garden ----------
export function grass(seed=14){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#365f24';ctx.fillRect(0,0,w,h);
  for(let i=0;i<5000;i++){ctx.strokeStyle=r()<0.5?'#5c8f3a':'#2e5220';ctx.globalAlpha=0.5;ctx.lineWidth=1;
    const x=r()*w,y=r()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(r()-0.5)*5,y-3-r()*7);ctx.stroke();}
  ctx.globalAlpha=1;noise(ctx,w,h,10,r);
});}

export function hedge(seed=15){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  ctx.fillStyle='#24461a';ctx.fillRect(0,0,w,h);
  const cols=['#2b5522','#3a6b2a','#4f8a36','#63a043','#1f3d16'];
  for(let i=0;i<3500;i++){ctx.fillStyle=cols[(r()*cols.length)|0];ctx.globalAlpha=0.85;
    ctx.beginPath();ctx.ellipse(r()*w,r()*h,2+r()*7,1.5+r()*4,r()*3,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;noise(ctx,w,h,6,r);
});}

export function mosaic(seed=16){return tex(512,512,(ctx,w,h)=>{const r=rng(seed);
  const cols=['#3aa9c9','#2f9ab9','#4bb9d7','#2b88a9','#5cc5df'];const s=32;
  for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s){ctx.fillStyle=cols[(r()*cols.length)|0];ctx.fillRect(x,y,s,s);}
  ctx.strokeStyle='rgba(235,245,250,0.9)';ctx.lineWidth=2;
  for(let i=0;i<=w/s;i++){ctx.beginPath();ctx.moveTo(i*s,0);ctx.lineTo(i*s,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*s);ctx.lineTo(w,i*s);ctx.stroke();}
  noise(ctx,w,h,4,r);
});}

export function waterNormal(){return tex(512,512,(ctx,w,h)=>{
  const img=ctx.createImageData(w,h),d=img.data;const H=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w*Math.PI*2,v=y/h*Math.PI*2;
    H[y*w+x]=Math.sin(u*3+v*2)*0.5+Math.sin(u*7-v*5+1)*0.25+Math.sin(u*13+v*11+2)*0.15+Math.sin(-u*5+v*17)*0.1+Math.sin(u*23-v*19+4)*0.05;}
  const s=5;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const l=H[y*w+(x-1+w)%w],rr=H[y*w+(x+1)%w],up=H[((y-1+h)%h)*w+x],dn=H[((y+1)%h)*w+x];
    const nx=(l-rr)*s,ny=(up-dn)*s,nz=1;const L=Math.hypot(nx,ny,nz);const i=(y*w+x)*4;
    d[i]=(nx/L*0.5+0.5)*255;d[i+1]=(ny/L*0.5+0.5)*255;d[i+2]=(nz/L*0.5+0.5)*255;d[i+3]=255;}
  ctx.putImageData(img,0,0);
},{linear:true});}

export function frond(){return tex(256,512,(ctx,w,h)=>{
  ctx.clearRect(0,0,w,h);
  for(let y=26;y<h-14;y+=11){const t=y/h,len=(w/2-4)*(0.3+0.7*Math.sin(t*Math.PI*0.92+0.12)),wd=7+4*Math.sin(t*Math.PI);
    ctx.fillStyle=t<0.45?'#3d8a34':(t<0.8?'#337a2c':'#2a6424');
    for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(w/2,y-wd/2);ctx.lineTo(w/2+s*len,y+26);ctx.lineTo(w/2+s*len*0.92,y+31);ctx.lineTo(w/2,y+wd/2);ctx.closePath();ctx.fill();}}
  ctx.strokeStyle='#5a4a2a';ctx.lineCap='round';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(w/2,h);ctx.lineTo(w/2,12);ctx.stroke();
},{clamp:true});}

export function leaf(){return tex(256,256,(ctx,w,h)=>{
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#2f6f2f';
  ctx.beginPath();ctx.moveTo(w/2,h-4);ctx.bezierCurveTo(w*0.02,h*0.75,w*0.02,h*0.2,w/2,6);ctx.bezierCurveTo(w*0.98,h*0.2,w*0.98,h*0.75,w/2,h-4);ctx.fill();
  ctx.strokeStyle='#5a9a4a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w/2,h-6);ctx.lineTo(w/2,12);ctx.stroke();
  for(let i=0;i<7;i++){const y=30+i*30;ctx.beginPath();ctx.moveTo(w/2,y);ctx.lineTo(w*0.15,y+35);ctx.moveTo(w/2,y);ctx.lineTo(w*0.85,y+35);ctx.stroke();}
},{clamp:true});}

export function glow(){return tex(128,128,(ctx,w,h)=>{
  const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.25,'rgba(255,250,235,0.9)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
},{clamp:true});}

export function bookColors(seed=17){const r=rng(seed);const pal=['#b23a2a','#e3d8c2','#1f2a44','#d8a03c','#3f6b4a','#f1f1ec','#2b2b2b','#8b5a2b','#c9c0b0','#6b3e8a'];
  return n=>{const out=[];for(let i=0;i<n;i++)out.push(pal[(r()*pal.length)|0]);return out;};}
