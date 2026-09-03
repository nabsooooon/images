import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as T from './textures.js';

// ---------- helpers ----------
function boxGeo(w,h,d,ts){
  const g=new THREE.BoxGeometry(w,h,d);
  if(ts){const uv=g.attributes.uv;const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
    for(let f=0;f<6;f++){const [su,sv]=dims[f];for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*su/ts,uv.getY(i)*sv/ts);}}}
  return g;
}
function slab(x1,x2,y1,y2,z1,z2,mat,o={}){
  const m=new THREE.Mesh(boxGeo(x2-x1,y2-y1,z2-z1,o.ts!==undefined?o.ts:(mat.userData.ts||0)),mat);
  m.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
  m.castShadow=o.cast!==false;m.receiveShadow=o.receive!==false;
  return m;
}
function plane(w,h,mat,ts){
  const g=new THREE.PlaneGeometry(w,h);
  if(ts){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/ts,uv.getY(i)*h/ts);}
  const m=new THREE.Mesh(g,mat);m.receiveShadow=true;return m;
}
function rbox(w,h,d,mat,r=0.05){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),mat);m.castShadow=m.receiveShadow=true;return m;}
function cyl(rt,rb,h,mat,seg=20){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);m.castShadow=m.receiveShadow=true;return m;}
function sph(r,mat,seg=16){const m=new THREE.Mesh(new THREE.SphereGeometry(r,seg,seg),mat);m.castShadow=m.receiveShadow=true;return m;}
function at(m,x,y,z,ry=0){m.position.set(x,y,z);if(ry)m.rotation.y=ry;return m;}

function makeMaterials(){
  const std=o=>new THREE.MeshStandardMaterial(o),phys=o=>new THREE.MeshPhysicalMaterial(o);
  const mk=(mat,ts)=>{mat.userData.ts=ts;return mat;};
  const M={};
  M.plaster=mk(std({color:0xf2f1ec,roughness:0.95,envMapIntensity:0.35}),0);
  M.plasterExt=mk(std({color:0xe6e4de,roughness:0.9,envMapIntensity:0.18}),0);
  M.concrete=mk(std({map:T.concrete(),roughness:0.9,envMapIntensity:0.18}),2);
  M.stone=mk(std({map:T.travertine(),roughness:0.85,envMapIntensity:0.2}),2);
  M.marble=mk(std({map:T.marble(),roughness:0.2,metalness:0,envMapIntensity:0.7}),2.4);
  M.terrace=mk(std({map:T.terrace(),roughness:0.85,envMapIntensity:0.2}),1.6);
  M.woodDark=mk(std({map:T.wood('#3a2a20','#5c4230','#1c130f',3,false),roughness:0.55,envMapIntensity:0.5}),1);
  M.woodDarkV=mk(std({map:T.wood('#3a2a20','#5c4230','#1c130f',3,true),roughness:0.55,envMapIntensity:0.5}),1);
  M.woodWarm=mk(std({map:T.wood('#6e4a2b','#93673f','#3f2614',21,false),roughness:0.6,envMapIntensity:0.3}),1);
  M.woodWarmV=mk(std({map:T.wood('#6e4a2b','#93673f','#3f2614',21,true),roughness:0.6,envMapIntensity:0.3}),1);
  M.oak=mk(std({map:T.wood('#c9a26f','#dcb887','#9c7a4d',22,false),roughness:0.6,envMapIntensity:0.5}),1);
  M.toile=mk(std({map:T.toile(),roughness:0.9,envMapIntensity:0.4}),1.6);
  M.glass=phys({color:0xdfeeff,roughness:0.03,metalness:0,transparent:true,opacity:0.16,envMapIntensity:1.2,side:THREE.DoubleSide,depthWrite:false});
  M.frame=std({color:0x1a1a1a,roughness:0.45,metalness:0.6,envMapIntensity:0.5});
  M.black=std({color:0x121212,roughness:0.4,metalness:0.2,envMapIntensity:0.6});
  M.blackMatte=std({color:0x1a1a1a,roughness:0.9,envMapIntensity:0.3});
  M.copper=std({color:0xb87545,roughness:0.28,metalness:0.95,envMapIntensity:1.0});
  M.brass=std({color:0xc9a55a,roughness:0.3,metalness:0.9,envMapIntensity:1.0});
  M.white=mk(std({map:T.fabric('#f1eee8'),roughness:0.9,envMapIntensity:0.5}),0.4);
  M.cream=std({color:0xe8dcc6,roughness:0.9,envMapIntensity:0.5});
  M.rust=std({color:0xb2512a,roughness:0.85,envMapIntensity:0.4});
  M.mustard=std({color:0xd4a23a,roughness:0.85,envMapIntensity:0.4});
  M.velvet=phys({color:0x4a6a1f,roughness:0.7,sheen:1,sheenColor:new THREE.Color(0x9cc45a),sheenRoughness:0.5,envMapIntensity:0.5});
  M.palm=mk(std({map:T.palm(),roughness:0.9,envMapIntensity:0.5}),0.5);
  M.stripes=mk(std({map:T.stripes(),roughness:0.9,envMapIntensity:0.5}),0.4);
  M.checker=mk(std({map:T.checker(),roughness:0.9,envMapIntensity:0.5}),0.25);
  M.floral=mk(std({map:T.floral(),roughness:0.9,envMapIntensity:0.5}),0.5);
  M.rug=mk(std({map:T.rug(),roughness:1,envMapIntensity:0.3}),1);
  M.cane=mk(std({map:T.cane(),roughness:0.8,envMapIntensity:0.4}),0.3);
  M.curtain=phys({color:0xffffff,roughness:1,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false,envMapIntensity:0.4});
  M.grass=mk(std({map:T.grass(),roughness:1,envMapIntensity:0.15}),2.5);
  M.hedge=mk(std({map:T.hedge(),roughness:1,envMapIntensity:0.15}),1.5);
  M.mosaic=mk(std({map:T.mosaic(),roughness:0.5,emissive:0x2a9fc0,emissiveIntensity:0.8,envMapIntensity:0.3}),0.8);
  const wn=T.waterNormal();wn.repeat.set(3,3);
  M.water=phys({color:0x2fb3d6,roughness:0.08,metalness:0,transparent:true,opacity:0.4,normalMap:wn,normalScale:new THREE.Vector2(0.35,0.35),envMapIntensity:1.0,emissive:0x14809f,emissiveIntensity:0.9});
  const emit=(c,i)=>std({color:0x000000,emissive:c,emissiveIntensity:i,roughness:1});
  M.emit=emit;
  M.warmEmit=emit(0xffd6a0,3.5);
  M.warmEmitSoft=emit(0xffd9ad,1.8);
  M.coolEmit=emit(0xdfe9ff,2.5);
  M.tv=std({color:0x0a0a0c,roughness:0.3,metalness:0.4,emissive:0x1a2230,emissiveIntensity:0.6});
  M.leaf=std({map:T.leaf(),transparent:true,alphaTest:0.5,side:THREE.DoubleSide,roughness:0.8,envMapIntensity:0.3});
  M.frond=std({map:T.frond(),transparent:true,alphaTest:0.4,side:THREE.DoubleSide,roughness:0.85,envMapIntensity:0.2});
  M.trunk=std({color:0x4a3a2a,roughness:1});
  M.pot=std({color:0x151515,roughness:0.7});
  M.terracotta=std({color:0xc4693f,roughness:0.9});
  M.peach=std({color:0xf0a888,roughness:0.6});
  M.green=std({color:0x3e7a3e,roughness:0.8});
  M.tan=std({color:0xd8c39a,roughness:1});
  M.bookColors=T.bookColors();
  return M;
}

function makeSky(moonDir){
  const mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{moonDir:{value:moonDir}},
    vertexShader:`varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec3 vDir;uniform vec3 moonDir;
      float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      void main(){vec3 d=normalize(vDir);float h=clamp(d.y,0.0,1.0);
        vec3 horizon=vec3(0.12,0.26,0.62);vec3 zenith=vec3(0.02,0.05,0.24);
        vec3 col=mix(horizon,zenith,pow(h,0.5));
        float m=max(dot(d,moonDir),0.0);
        col+=vec3(1.0,0.95,0.85)*pow(m,90.0)*1.6+vec3(0.55,0.6,0.75)*pow(m,10.0)*0.3+vec3(0.9,0.7,0.5)*pow(m,4.0)*0.05;
        vec3 cell=floor(d*260.0);float s=hash(cell);float star=step(0.994,s)*smoothstep(0.03,0.2,d.y);
        vec3 f=fract(d*260.0)-0.5;float r=length(f);star*=smoothstep(0.32,0.04,r);
        col+=vec3(star)*(1.4+2.2*hash(cell+3.0));
        col=mix(col,vec3(0.04,0.06,0.11),smoothstep(0.0,-0.15,d.y));
        gl_FragColor=vec4(col,1.0);}`});
  return new THREE.Mesh(new THREE.SphereGeometry(480,48,24),mat);
}

export function buildScene(renderer){
  const scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x0c1a3a,45,230);
  const M=makeMaterials();
  const pm=new THREE.PMREMGenerator(renderer);
  scene.environment=pm.fromScene(new RoomEnvironment(renderer),0.04).texture;
  pm.dispose();

  const moonDir=new THREE.Vector3(0.32,0.26,-0.91).normalize();
  const keyDir=new THREE.Vector3(0.5,0.6,0.62).normalize();
  scene.add(makeSky(moonDir));
  const glowTex=T.glow();
  const moon=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xfff4dc,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  moon.material.opacity=0.8;moon.position.copy(moonDir).multiplyScalar(440);moon.scale.set(24,24,1);scene.add(moon);

  const lights=[];
  const L=(l)=>{lights.push(l);return l;};

  // ---------- global lights ----------
  const moonLight=L(new THREE.DirectionalLight(0x9fb6ff,0.65));
  moonLight.position.copy(keyDir).multiplyScalar(70).add(new THREE.Vector3(2,0,-2));moonLight.target.position.set(2,0,-2);
  moonLight.castShadow=true;moonLight.shadow.mapSize.set(2048,2048);
  const sc=moonLight.shadow.camera;sc.left=-32;sc.right=32;sc.top=32;sc.bottom=-32;sc.near=5;sc.far=160;
  moonLight.shadow.bias=-0.0006;moonLight.shadow.normalBias=0.03;
  scene.add(moonLight,moonLight.target);
  scene.add(new THREE.HemisphereLight(0x33508c,0x241a12,0.3));
  scene.add(new THREE.AmbientLight(0x304060,0.08));

  const point=(c,i,d,x,y,z)=>{const p=L(new THREE.PointLight(c,i,d,2));p.position.set(x,y,z);scene.add(p);return p;};
  const spot=(c,i,d,ang,x,y,z,tx,ty,tz,shadow)=>{const s=L(new THREE.SpotLight(c,i,d,ang,0.7,2));s.position.set(x,y,z);s.target.position.set(tx,ty,tz);
    if(shadow){s.castShadow=true;s.shadow.mapSize.set(1024,1024);s.shadow.bias=-0.0005;s.shadow.normalBias=0.02;s.shadow.camera.near=0.3;s.shadow.camera.far=12;}
    scene.add(s,s.target);return s;};

  // ---------- garden ----------
  const P={x1:3.4,x2:11.4,z1:6.0,z2:13.0};
  const lawnShape=new THREE.Shape();lawnShape.moveTo(-100,-100);lawnShape.lineTo(100,-100);lawnShape.lineTo(100,100);lawnShape.lineTo(-100,100);lawnShape.closePath();
  const hole=new THREE.Path();hole.moveTo(P.x1,-P.z2);hole.lineTo(P.x2,-P.z2);hole.lineTo(P.x2,-P.z1);hole.lineTo(P.x1,-P.z1);hole.closePath();lawnShape.holes.push(hole);
  const lg=new THREE.ShapeGeometry(lawnShape);{const uv=lg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/2.5,uv.getY(i)/2.5);}
  const lawn=new THREE.Mesh(lg,M.grass);lawn.rotation.x=-Math.PI/2;lawn.position.y=-0.08;lawn.receiveShadow=true;scene.add(lawn);
  const terr=slab(-3.2,10.5,-0.12,0,0,4.6,M.terrace);scene.add(terr);
  // pool
  scene.add(slab(P.x1-0.45,P.x2+0.45,-0.12,0,P.z1-0.45,P.z1,M.terrace),slab(P.x1-0.45,P.x2+0.45,-0.12,0,P.z2,P.z2+0.45,M.terrace),
    slab(P.x1-0.45,P.x1,-0.12,0,P.z1,P.z2,M.terrace),slab(P.x2,P.x2+0.45,-0.12,0,P.z1,P.z2,M.terrace));
  scene.add(slab(P.x1,P.x2,-1.7,-1.6,P.z1,P.z2,M.mosaic,{cast:false}),slab(P.x1,P.x1+0.08,-1.7,-0.1,P.z1,P.z2,M.mosaic),slab(P.x2-0.08,P.x2,-1.7,-0.1,P.z1,P.z2,M.mosaic),
    slab(P.x1,P.x2,-1.7,-0.1,P.z1,P.z1+0.08,M.mosaic),slab(P.x1,P.x2,-1.7,-0.1,P.z2-0.08,P.z2,M.mosaic));
  const water=new THREE.Mesh(new THREE.PlaneGeometry(P.x2-P.x1,P.z2-P.z1),M.water);water.rotation.x=-Math.PI/2;water.position.set((P.x1+P.x2)/2,-0.16,(P.z1+P.z2)/2);scene.add(water);
  point(0x5fd8ff,5,7,P.x1+2.2,-1.2,(P.z1+P.z2)/2);point(0x5fd8ff,5,7,P.x2-2.2,-1.2,(P.z1+P.z2)/2);
  // hedges & plants
  scene.add(slab(-12.5,-10.4,-0.08,2.7,-18,26,M.hedge),slab(9.5,17,-0.08,1.35,-0.9,1.1,M.hedge),slab(13.2,14.2,-0.08,1.3,3.5,15,M.hedge),slab(-10.4,-6,-0.08,0.9,22,23.2,M.hedge));
  const shrub=(x,y,z,r)=>{const s=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),M.hedge);s.position.set(x,y,z);s.scale.set(1,0.8,1);s.castShadow=s.receiveShadow=true;scene.add(s);};
  shrub(-9.6,0.5,11,1.0);shrub(-9.2,0.45,5.5,0.9);shrub(-9.9,0.7,15.5,1.2);shrub(9.6,0.55,2.4,0.8);shrub(13.5,0.6,5.2,0.9);shrub(13.4,0.5,10.5,0.8);shrub(-3.5,0.35,5.6,0.55);
  const palmTree=(x,z,h,ry)=>{const g=new THREE.Group();const tr=cyl(0.14,0.2,h,M.trunk);tr.position.y=h/2;g.add(tr);
    for(let i=0;i<13;i++){const f=new THREE.Mesh(new THREE.PlaneGeometry(1.0,2.7),M.frond);f.castShadow=true;const p=new THREE.Group();p.position.y=h;p.rotation.y=i/13*Math.PI*2+ry;
      f.rotation.x=-0.7-(i%3)*0.2;f.position.set(0,0.35,1.15);p.add(f);g.add(p);}
    g.position.set(x,-0.08,z);scene.add(g);};
  palmTree(-9.4,8.5,4.6,0.3);palmTree(-9.8,-1,5.2,1.2);palmTree(-9.0,18.5,3.8,2.0);palmTree(14.5,7.5,3.6,0.7);palmTree(13.4,12.0,4.2,0.5);palmTree(12.6,1.5,3.6,1.9);shrub(11.8,0.4,15.0,0.7);shrub(13.0,0.5,9.0,0.8);
  point(0xffc27a,2.5,5,-9.0,0.2,8.2);

  // ---------- house ----------
  buildHouse(scene,M,0,0,true,point,spot);
  buildHouse(scene,M,18.6,-2.4,false,point,spot);
  buildHouse(scene,M,37.2,-4.8,false,point,spot);

  // ---------- interior ----------
  buildInterior(scene,M,point,spot);

  return {scene,lights,M,update(t){M.water.normalMap.offset.set(t*0.012,t*0.009);}};
}

function buildHouse(scene,M,ox,oz,detailed,point,spot){
  const g=new THREE.Group();g.position.set(ox,0,oz);scene.add(g);
  const add=(...m)=>{m.forEach(x=>g.add(x));};
  const P=M.plasterExt;
  if(detailed){
    // ground floor walls with openings (front sliding doors, right glazing)
    add(slab(-8.3,-2.2,0,3.2,-0.3,0,P),slab(5.2,8.3,0,3.2,-0.3,0,P),slab(-2.2,5.2,2.7,3.2,-0.3,0,P));
    add(slab(-8.3,8.3,0,3.2,-12.3,-12,P),slab(-8.3,-8,0,3.2,-12.3,0,P));
    add(slab(8,8.3,0,3.2,-1,0,P),slab(8,8.3,0,3.2,-12.3,-11,P),slab(8,8.3,2.9,3.2,-11,-1,P));
    add(slab(-8.3,8.3,3.2,3.5,-12.3,0,P));
    // sliding doors
    add(slab(-2.2,5.2,2.62,2.7,-0.22,-0.06,M.frame),slab(-2.2,5.2,0,0.06,-0.22,-0.06,M.frame),slab(-2.2,-2.14,0,2.7,-0.22,-0.06,M.frame),slab(5.14,5.2,0,2.7,-0.22,-0.06,M.frame));
    const panel=(x1,x2,z)=>{add(slab(x1,x1+0.05,0.06,2.62,z-0.02,z+0.02,M.frame),slab(x2-0.05,x2,0.06,2.62,z-0.02,z+0.02,M.frame),slab(x1,x2,2.5,2.62,z-0.02,z+0.02,M.frame),slab(x1,x2,0.06,0.16,z-0.02,z+0.02,M.frame));
      const gl=plane(x2-x1-0.1,2.44,M.glass);gl.position.set((x1+x2)/2,1.34,z);gl.castShadow=false;gl.receiveShadow=false;add(gl);};
    panel(-2.2,-0.35,-0.11);panel(-0.35,1.5,-0.11);panel(3.35,5.2,-0.11);panel(3.35,5.2,-0.19);
    // right glazing
    for(const z of [-1,-3.5,-6,-8.5,-11])add(slab(8.0,8.3,0,2.9,z-0.03,z+0.03,M.frame));
    add(slab(8.0,8.3,0,0.06,-11,-1,M.frame),slab(8.0,8.3,2.84,2.9,-11,-1,M.frame));
    const rg=plane(10,2.9,M.glass);rg.rotation.y=-Math.PI/2;rg.position.set(8.15,1.45,-6);rg.castShadow=false;rg.receiveShadow=false;add(rg);
    // gathered curtain near the doors (seen from outside through glass)
    const cg=new THREE.PlaneGeometry(1.2,3.05,90,1);{const pa=cg.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i);pa.setZ(i,Math.sin(x*26)*0.09+Math.sin(x*61+1)*0.04);}cg.computeVertexNormals();}
    const cur=new THREE.Mesh(cg,M.curtain);cur.position.set(-1.55,1.55,-0.5);add(cur);
    // small windows (ground + upper, left part)
    const win=(x1,x2,y1,y2,z,mat)=>{add(slab(x1-0.05,x2+0.05,y1-0.05,y2+0.05,z-0.06,z+0.03,M.frame));const p=plane(x2-x1,y2-y1,mat);p.position.set((x1+x2)/2,(y1+y2)/2,z+0.035);p.castShadow=false;add(p);};
    win(-7.75,-7.2,0.8,2.6,0,M.warmEmitSoft);win(-4.95,-4.4,0.8,2.6,0,M.warmEmitSoft);
    win(-7.75,-7.2,4.3,6.2,0,M.warmEmitSoft);win(-4.95,-4.4,4.3,6.2,0,M.warmEmitSoft);
    // soffit spots under the overhang
    for(const x of [-1.6,1.5,4.6]){const d=cyl(0.07,0.07,0.02,M.warmEmit,12);d.position.set(x,3.485,1.3);add(d);}
    point(0xffd9a8,3,6,1.5,3.3,1.3);point(0xffd9a8,2,5,-1.2,3.3,1.2);point(0xffd0a0,3,6,2.4,0.7,1.6);point(0xffc890,2,5,-6.9,1.6,0.8);
  }else{
    add(slab(-8.3,8.3,0,3.5,-12.3,0,P));
    const p=plane(7.2,2.6,M.warmEmitSoft);p.position.set(1.5,1.35,0.03);p.castShadow=false;add(p);
    add(slab(-2.25,5.25,0,2.7,0,0.06,M.frame));const p2=plane(7.3,2.6,M.glass);p2.position.set(1.5,1.35,0.07);p2.castShadow=false;add(p2);
    for(const x of [-1.6,1.5,4.6]){const d=cyl(0.07,0.07,0.02,M.warmEmit,12);d.position.set(x,3.485,1.3);add(d);}
    const w1=plane(0.55,1.8,M.warmEmitSoft);w1.position.set(-7.4,1.7,0.03);add(w1);const w2=plane(0.55,1.9,M.warmEmitSoft);w2.position.set(-7.4,5.2,0.03);add(w2);
  }
  // chimney tower and left white upper volume
  add(slab(-6.5,-5.5,0,8.2,0,1.0,M.concrete),slab(-8.3,-3,3.5,6.9,-12.3,0,P),slab(-8.4,-2.9,6.9,7.1,-12.4,0.1,P));
  // upper stone box
  const S=M.stone;
  add(slab(-3,8.3,3.5,3.9,-12.3,2.6,S),slab(-3,8.3,6.6,7.0,-12.3,2.6,S),slab(-3,-2.7,3.9,6.6,-12.3,2.6,S),slab(8.0,8.3,3.9,6.6,-12.3,2.6,S),slab(-3,8.3,3.9,6.6,-12.6,-12.3,S));
  add(slab(-2.7,-1.0,3.9,6.6,2.3,2.6,S),slab(6.5,8.0,3.9,6.6,2.3,2.6,S));
  const soffit=plane(11.3,2.6,M.woodDark,1);soffit.rotation.x=Math.PI/2;soffit.position.set(2.65,3.495,1.3);add(soffit);
  // balcony recess
  add(slab(-1.0,6.5,3.9,4.0,-1,2.3,M.woodWarm),slab(-1.0,6.5,6.3,6.6,-1,2.3,M.woodDark));
  add(slab(-1.0,1.0,4.0,6.3,-1.3,-1,P),slab(4.0,6.5,4.0,6.3,-1.3,-1,P),slab(1.0,4.0,6.2,6.3,-1.3,-1,P));
  add(slab(-1.0,-0.85,4.0,6.3,-1,2.3,P),slab(6.35,6.5,4.0,6.3,-1,2.3,P));
  // bedroom behind the glass door
  add(slab(-1,6.5,4.0,6.3,-4.0,-3.9,P),slab(-1,-0.9,4.0,6.3,-4,-1.3,P),slab(6.4,6.5,4.0,6.3,-4,-1.3,P));
  const bed=plane(3.6,2.2,M.warmEmitSoft);bed.position.set(2.5,5.1,-3.85);bed.castShadow=false;add(bed);
  const bg=plane(3,2.2,M.glass);bg.position.set(2.5,5.1,-1.15);bg.castShadow=false;add(bg);
  add(slab(1.0,1.05,4.0,6.2,-1.2,-1.1,M.frame),slab(3.95,4.0,4.0,6.2,-1.2,-1.1,M.frame),slab(2.48,2.52,4.0,6.2,-1.2,-1.1,M.frame));
  const bc=new THREE.PlaneGeometry(3.4,2.15,90,1);{const pa=bc.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i);pa.setZ(i,Math.sin(x*9)*0.06);}bc.computeVertexNormals();}
  const bcur=new THREE.Mesh(bc,M.curtain);bcur.position.set(2.5,5.08,-1.5);add(bcur);
  point(0xffd2a0,5,6,2.5,5.3,-2.4);
  // balcony glass balustrade + rail
  const bal=plane(7.3,1.1,M.glass);bal.position.set(2.75,4.55,2.2);bal.castShadow=false;bal.receiveShadow=false;add(bal);
  add(slab(-0.9,6.4,5.08,5.13,2.17,2.23,M.frame),slab(-0.9,6.4,4.0,4.05,2.17,2.23,M.frame));
  // balcony ceiling spots
  for(const x of [0.2,2.0,3.8,5.6]){const d=cyl(0.07,0.07,0.02,M.warmEmit,12);d.position.set(x,6.29,0.7);add(d);}
  point(0xffd9a8,3.5,6,2.9,6.1,0.7);
  // slat screens
  const slats=(x1,x2,y1,y2,z1,z2,n,alongX)=>{for(let i=0;i<n;i++){const f=i/(n-1);
    if(alongX){const x=x1+f*(x2-x1);add(slab(x-0.03,x+0.03,y1,y2,z1,z2,M.woodWarmV));}else{const z=z1+f*(z2-z1);add(slab(x1,x2,y1,y2,z-0.03,z+0.03,M.woodWarmV));}}};
  add(slab(-2.45,-1.25,4.15,6.4,2.32,2.4,M.blackMatte));const sw=plane(1.1,2.2,M.warmEmitSoft);sw.position.set(-1.85,5.27,2.41);add(sw);
  slats(-2.4,-1.3,4.15,6.4,2.6,2.68,10,true);
  slats(-0.85,-0.77,4.05,6.25,-0.8,2.0,14,false);
  slats(6.35,6.43,4.05,6.25,-0.8,2.0,14,false);
}

function buildInterior(scene,M,point,spot){
  const g=new THREE.Group();scene.add(g);
  const add=(...m)=>{m.forEach(x=>g.add(x));};
  // floor & ceiling
  const fl=plane(16,12.3,M.marble,2.4);fl.rotation.x=-Math.PI/2;fl.position.set(0,0.002,-6.15);add(fl);
  const ce=plane(16,12.3,M.plaster);ce.rotation.x=Math.PI/2;ce.position.set(0,3.195,-6.15);add(ce);
  // dropped ceiling over dining with LED cove
  add(slab(-4.5,2.5,2.95,3.2,-12,-8.5,M.plaster));
  const cove=(x1,x2,z1,z2)=>{const s=slab(x1,x2,2.93,2.95,z1,z2,M.warmEmitSoft,{cast:false});add(s);};
  cove(-4.45,2.45,-11.98,-11.9);cove(-4.45,2.45,-8.6,-8.52);cove(-4.45,-4.4,-11.98,-8.52);cove(2.4,2.45,-11.98,-8.52);
  // track lights
  for(const x of [-2.6,3.6]){add(slab(x-0.04,x+0.04,3.13,3.19,-11,-0.8,M.blackMatte));
    for(let z=-1.6;z>-11;z-=1.3){const d=cyl(0.03,0.03,0.05,M.warmEmit,10);d.position.set(x,3.11,z);add(d);}}
  for(const [x,z] of [[-6.5,-2],[-6.5,-6],[6,-2],[6,-6],[0.5,-1.4],[0.5,-7.5]]){const d=cyl(0.05,0.05,0.01,M.warmEmit,12);d.position.set(x,3.19,z);add(d);}
  // dining alcove walls with toile
  const toileBack=plane(7.1,3.0,M.toile,1.6);toileBack.position.set(-1,1.5,-11.97);add(toileBack);
  const toileLeft=plane(3.5,3.0,M.toile,1.6);toileLeft.rotation.y=Math.PI/2;toileLeft.position.set(-4.47,1.5,-10.25);add(toileLeft);
  add(slab(-4.7,-4.5,0,3.2,-12,-7.2,M.plaster));
  // posts and beam
  for(const x of [-4.5,-0.5,2.5])add(slab(x-0.14,x+0.14,0,2.95,-8.65,-8.35,M.woodDarkV));
  add(slab(-0.05,0.05,0,2.95,-8.65,-8.35,M.woodDarkV));
  add(slab(-4.65,2.65,2.7,2.95,-8.7,-8.3,M.woodDark));
  // chandelier
  {const c=new THREE.Group();c.position.set(-1,2.35,-10.2);add(slab(-1.01,-0.99,2.35,2.95,-10.21,-10.19,M.black));
    const r=T.rng(99);for(let i=0;i<20;i++){const a=r()*Math.PI*2,b=Math.acos(2*r()-1),len=0.22+r()*0.28;const d=new THREE.Vector3(Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a));
      const arm=cyl(0.007,0.007,len,M.black,6);arm.position.copy(d).multiplyScalar(len/2);arm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);c.add(arm);
      const bulb=sph(0.028,M.warmEmit,8);bulb.position.copy(d).multiplyScalar(len);c.add(bulb);}
    const core=sph(0.06,M.black,10);c.add(core);add(c);}
  point(0xffc98a,4.5,8,-1,2.3,-10.2);
  // dining table & chairs
  add(slab(-1.9,-0.1,0.72,0.76,-10.65,-9.75,M.black),slab(-1.3,-0.7,0,0.72,-10.35,-10.05,M.black),slab(-1.6,-0.4,0,0.04,-10.5,-9.9,M.black));
  const chair=(x,z,ry)=>{const c=new THREE.Group();c.add(at(rbox(0.46,0.07,0.46,M.rust,0.03),0,0.46,0));c.add(at(rbox(0.46,0.42,0.06,M.rust,0.03),0,0.72,-0.2));
    for(const [lx,lz] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]])c.add(at(cyl(0.012,0.012,0.44,M.black,8),lx,0.22,lz));c.position.set(x,0,z);c.rotation.y=ry;add(c);};
  chair(-1.55,-9.3,0);chair(-0.45,-9.3,0);chair(-1.55,-11.1,Math.PI);chair(-0.45,-11.1,Math.PI);chair(-2.35,-10.2,Math.PI/2);chair(0.35,-10.2,-Math.PI/2);
  // console + lamp + pampas
  add(slab(-3.9,-2.5,0,0.8,-11.9,-11.5,M.black));
  add(at(cyl(0.02,0.02,0.4,M.black,8),-3.6,1.0,-11.7));{const dome=new THREE.Mesh(new THREE.SphereGeometry(0.14,16,10,0,Math.PI*2,0,Math.PI/2),M.black);dome.position.set(-3.6,1.15,-11.7);add(dome);
    const d=cyl(0.1,0.1,0.01,M.warmEmit,12);d.position.set(-3.6,1.15,-11.7);add(d);}
  add(at(cyl(0.12,0.09,0.42,M.black,14),-4.1,0.21,-11.6));
  for(let i=0;i<7;i++){const s=sph(0.09,M.tan,8);s.scale.set(1,2.6,1);s.position.set(-4.1+Math.sin(i)*0.18,1.05+i*0.06,-11.6+Math.cos(i*1.7)*0.14);add(s);add(at(cyl(0.004,0.004,0.7,M.tan,5),-4.1+Math.sin(i)*0.12,0.7,-11.6+Math.cos(i*1.7)*0.1));}
  // shelf partition (left)
  {const x=-4.0;for(let z=-1.1;z>=-7.2;z-=1.0)add(slab(x-0.18,x+0.18,0,3.2,z-0.04,z+0.04,M.woodDarkV));
    for(const y of [0.05,0.7,1.35,2.0,2.65])add(slab(x-0.18,x+0.18,y,y+0.05,-7.2,-1.1,M.woodDark));
    const r=T.rng(5);const cols=M.bookColors(60);let ci=0;
    for(let z=-1.1;z>-7.2;z-=1.0)for(const y of [0.75,1.4,2.05]){const kind=r();
      if(kind<0.5){let zz=z-0.12;const n=4+(r()*6|0);for(let i=0;i<n&&zz>z-0.95;i++){const th=0.03+r()*0.035,hh=0.18+r()*0.12;
        const b=slab(x-0.11,x+0.13,y,y+hh,zz-th,zz,new THREE.MeshStandardMaterial({color:cols[ci++%60],roughness:0.8}));add(b);zz-=th+0.006;}}
      else if(kind<0.75){add(at(rbox(0.16,0.22,0.16,r()<0.5?M.white:M.black,0.02),x,y+0.11,z-0.5));}
      else if(kind<0.9){add(at(sph(0.1,M.terracotta,10),x,y+0.1,z-0.55));}}
    add(at(sph(0.12,M.brass,12),x,2.12+0.12,-3.5));}
  // TV zone behind the partition
  add(slab(-7.97,-7.93,0.85,1.95,-4.7,-2.7,M.tv),slab(-7.95,-7.4,0,0.5,-5.4,-2.0,M.black));
  // rug
  const rg=plane(4.6,6.0,M.rug,1);rg.rotation.x=-Math.PI/2;rg.position.set(0,0.006,-3.9);add(rg);
  // sofas
  const sofa=(cx,cz,len,flip)=>{const s=new THREE.Group();
    s.add(at(rbox(0.95,0.32,len,M.white,0.06),0,0.18,0));
    s.add(at(rbox(0.9,0.16,len/2-0.06,M.white,0.05),0.03,0.42,-len/4));s.add(at(rbox(0.9,0.16,len/2-0.06,M.white,0.05),0.03,0.42,len/4));
    s.add(at(rbox(0.24,0.55,len,M.white,0.06),-0.36,0.67,0));
    s.add(at(rbox(0.95,0.62,0.22,M.white,0.05),0,0.31,-len/2+0.11));s.add(at(rbox(0.95,0.62,0.22,M.white,0.05),0,0.31,len/2-0.11));
    const cush=(mat,w,h,zc,lean)=>{const c=rbox(0.14,h,w,mat,0.03);c.position.set(-0.2,0.5+h/2,zc);c.rotation.z=-0.18-lean;s.add(c);};
    cush(M.palm,0.5,0.5,-len/2+0.5,0);cush(M.stripes,0.62,0.32,-len/2+0.55,0.1);cush(M.rust,0.5,0.5,-0.2,0.05);cush(M.checker,0.45,0.45,0.35,0);cush(M.palm,0.5,0.5,len/2-0.5,0);cush(M.cream,0.5,0.5,len/2-0.95,0.05);
    s.position.set(cx,0,cz);if(flip)s.rotation.y=Math.PI;add(s);};
  sofa(-1.9,-3.3,3.6,false);sofa(1.9,-3.3,3.6,true);
  // coffee table + objects
  add(slab(-0.85,0.85,0.34,0.39,-3.75,-2.85,M.black),slab(-0.8,-0.76,0,0.34,-3.7,-2.9,M.black),slab(0.76,0.8,0,0.34,-3.7,-2.9,M.black));
  add(slab(-0.55,-0.2,0.39,0.42,-3.2,-2.95,new THREE.MeshStandardMaterial({color:0x2c5f8a,roughness:0.6})),slab(-0.52,-0.23,0.42,0.45,-3.18,-2.97,new THREE.MeshStandardMaterial({color:0xe9e2d0,roughness:0.6})));
  add(at(cyl(0.05,0.07,0.28,M.black,12),0.25,0.53,-3.4));
  for(let i=0;i<7;i++){const a=i*0.9,tilt=0.35+(i%3)*0.12;const st=cyl(0.004,0.004,0.42,M.trunk,5);st.position.set(0.25+Math.sin(a)*0.06,0.86,-3.4+Math.cos(a)*0.06);st.rotation.set(Math.cos(a)*tilt,0,-Math.sin(a)*tilt);add(st);
    for(let k=0;k<4;k++){const l=new THREE.Mesh(new THREE.PlaneGeometry(0.05,0.09),M.leaf);const f=0.45+k*0.14;l.position.set(0.25+Math.sin(a)*(0.06+f*0.42*Math.sin(tilt)),0.67+f*0.42*Math.cos(tilt),-3.4+Math.cos(a)*(0.06+f*0.42*Math.sin(tilt)));l.rotation.set(0.3*k,a+k,0.4);add(l);}
    if(i%2){const h=sph(0.022,M.rust,8);h.position.set(0.25+Math.sin(a)*(0.06+0.42*Math.sin(tilt)),0.67+0.42*Math.cos(tilt)+0.02,-3.4+Math.cos(a)*(0.06+0.42*Math.sin(tilt)));add(h);}}
  for(const [x,h] of [[-0.05,0.34],[-0.2,0.28]]){add(at(cyl(0.012,0.012,h,M.peach,8),x,0.39+h/2,-3.6));add(at(cyl(0.03,0.04,0.05,M.peach,10),x,0.415,-3.6));}
  add(at(cyl(0.07,0.05,0.06,M.terracotta,12),0.55,0.42,-3.05));
  add(slab(0.05,0.6,0.39,0.4,-3.7,-3.35,M.black));
  // armchairs
  const armchair=(x,z,ry)=>{const c=new THREE.Group();c.add(at(rbox(0.74,0.18,0.72,M.checker,0.06),0,0.45,0));
    const b=rbox(0.74,0.62,0.14,M.checker,0.06);b.position.set(0,0.78,-0.3);b.rotation.x=-0.16;c.add(b);
    for(const sx of [-0.31,0.31]){const w=rbox(0.12,0.42,0.6,M.checker,0.04);w.position.set(sx,0.66,-0.03);c.add(w);}
    for(const [lx,lz] of [[-0.3,-0.28],[0.3,-0.28],[-0.3,0.28],[0.3,0.28]]){const l=cyl(0.011,0.011,0.38,M.black,8);l.position.set(lx*1.05,0.19,lz*1.05);l.rotation.z=-lx*0.25;l.rotation.x=lz*0.25;c.add(l);}
    c.position.set(x,0,z);c.rotation.y=ry;add(c);};
  armchair(-0.65,-6.2,0.25);armchair(0.95,-6.2,-0.25);
  // copper side table
  add(at(cyl(0.3,0.3,0.02,M.copper,24),1.0,0.5,-5.4),at(cyl(0.02,0.02,0.5,M.copper,8),1.0,0.25,-5.4),at(cyl(0.18,0.2,0.02,M.copper,24),1.0,0.01,-5.4));
  add(at(cyl(0.05,0.05,0.1,M.copper,12),1.0,0.56,-5.4));
  // green zone
  const gsofa=(cx,cz,len,ry,cushions)=>{const s=new THREE.Group();
    s.add(at(rbox(0.95,0.34,len,M.velvet,0.07),0,0.19,0));s.add(at(rbox(0.9,0.16,len-0.1,M.velvet,0.06),0.03,0.44,0));
    s.add(at(rbox(0.26,0.5,len,M.velvet,0.07),-0.35,0.66,0));s.add(at(rbox(0.95,0.6,0.2,M.velvet,0.06),0,0.3,-len/2+0.1));s.add(at(rbox(0.95,0.6,0.2,M.velvet,0.06),0,0.3,len/2-0.1));
    cushions.forEach((mat,i)=>{const c=rbox(0.14,0.48,0.48,mat,0.03);c.position.set(-0.2,0.76,-len/2+0.45+i*0.62);c.rotation.z=-0.2;s.add(c);});
    s.position.set(cx,0,cz);s.rotation.y=ry;add(s);};
  gsofa(5.3,-11.3,4.6,-Math.PI/2,[M.rust,M.floral,M.cream,M.floral,M.mustard,M.rust]);
  gsofa(7.3,-8.4,3.2,Math.PI,[M.floral,M.cream,M.rust,M.floral]);
  add(at(cyl(0.48,0.48,0.03,M.cream,32),5.0,0.36,-9.5),at(cyl(0.05,0.05,0.34,M.black,10),5.0,0.17,-9.5),at(cyl(0.3,0.3,0.02,M.black,24),5.0,0.01,-9.5));
  add(at(cyl(0.015,0.015,0.36,M.brass,8),5.15,0.55,-9.6));{const dome=new THREE.Mesh(new THREE.SphereGeometry(0.13,16,10,0,Math.PI*2,0,Math.PI/2),M.black);dome.position.set(5.15,0.7,-9.6);add(dome);const d=cyl(0.09,0.09,0.01,M.warmEmit,12);d.position.set(5.15,0.7,-9.6);add(d);}
  const rug2=new THREE.Mesh(new THREE.CircleGeometry(1.9,40),M.rug);rug2.rotation.x=-Math.PI/2;rug2.position.set(5.2,0.006,-9.4);rug2.receiveShadow=true;add(rug2);
  const rattan=(x,z,ry)=>{const c=new THREE.Group();c.add(at(rbox(0.56,0.05,0.56,M.cane,0.02),0,0.44,0));const b=rbox(0.56,0.62,0.04,M.cane,0.02);b.position.set(0,0.77,-0.27);b.rotation.x=-0.14;c.add(b);
    for(const [lx,lz] of [[-0.25,-0.25],[0.25,-0.25],[-0.25,0.25],[0.25,0.25]])c.add(at(cyl(0.02,0.02,0.44,M.oak,8),lx,0.22,lz));
    for(const sx of [-0.28,0.28]){c.add(at(slab(sx-0.02,sx+0.02,0.6,0.64,-0.25,0.25,M.oak),0,0,0));}
    c.position.set(x,0,z);c.rotation.y=ry;add(c);};
  rattan(4.0,-8.2,Math.PI+0.3);rattan(6.0,-7.6,Math.PI-0.2);
  // niches on the back wall
  const niche=(xc)=>{const W=M.woodDark;add(slab(xc-0.8,xc+0.8,2.95,3.05,-12,-11.55,W),slab(xc-0.8,xc+0.8,0.85,0.95,-12,-11.55,W),slab(xc-0.8,xc-0.72,0.85,3.05,-12,-11.55,W),slab(xc+0.72,xc+0.8,0.85,3.05,-12,-11.55,W));
    add(slab(xc-0.72,xc+0.72,0.95,2.95,-11.99,-11.94,M.woodDarkV));
    add(slab(xc-0.72,xc+0.72,1.85,1.9,-11.99,-11.6,W));
    const d=cyl(0.06,0.06,0.01,M.warmEmit,10);d.position.set(xc,2.94,-11.78);add(d);
    add(at(cyl(0.12,0.09,0.22,M.pot,14),xc,2.01,-11.78));
    for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.PlaneGeometry(0.16,0.42),M.leaf);l.position.set(xc+Math.sin(i*1.05)*0.07,2.3,-11.78+Math.cos(i*1.05)*0.07);l.rotation.y=i*1.05;l.rotation.x=-0.25;add(l);}
    add(at(rbox(0.22,0.28,0.2,M.white,0.02),xc-0.4,1.09,-11.78),at(rbox(0.2,0.2,0.2,M.black,0.02),xc+0.4,1.05,-11.78));
    point(0xffb070,0.35,2.2,xc,2.6,-11.65);};
  niche(3.8);niche(6.8);
  add(at(cyl(0.05,0.05,0.25,M.brass,10),5.3,2.2,-11.9));
  // floor plant near curtain
  add(at(cyl(0.22,0.18,0.5,M.pot,16),7.0,0.25,-2.0));
  for(let i=0;i<9;i++){const l=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.8),M.leaf);l.position.set(7.0+Math.sin(i*0.7)*0.18,0.9+(i%3)*0.18,-2.0+Math.cos(i*0.7)*0.18);l.rotation.y=i*0.7;l.rotation.x=-0.35;add(l);}
  // curtain wall (right)
  const cg=new THREE.PlaneGeometry(10.4,3.1,240,1);{const pa=cg.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i);pa.setZ(i,Math.sin(x*13)*0.06+Math.sin(x*29+1)*0.035);}cg.computeVertexNormals();}
  const cur=new THREE.Mesh(cg,M.curtain);cur.rotation.y=-Math.PI/2;cur.position.set(7.72,1.575,-6);add(cur);
  add(slab(7.6,7.8,3.1,3.2,-11.4,-0.6,M.frame));
  // magazines on the floor near the sofa
  add(slab(-3.2,-2.7,0,0.06,-2.2,-1.85,new THREE.MeshStandardMaterial({color:0xd0402a,roughness:0.7})),slab(-3.1,-2.6,0.06,0.1,-2.25,-1.9,new THREE.MeshStandardMaterial({color:0x2a5fa0,roughness:0.7})));
  // interior lights
  spot(0xffe4c4,16,10,0.95,0,3.15,-3.3,0,0,-3.3,true);
  spot(0xffdcb0,11,9,0.85,-1,3.15,-9.9,-1,0,-9.9,true);
  spot(0xffe4c4,13,9,0.95,5.2,3.15,-9.4,5.2,0,-9.4,false);
  point(0xfff0dc,2.5,7,-2.6,3.05,-2.2);point(0xfff0dc,2.5,7,3.6,3.05,-6.3);point(0xffe8d0,2.2,6,1.5,2.9,-0.9);
}
