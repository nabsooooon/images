import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildScene } from './scene.js';
import { cameraAt, DURATION } from './camera.js';

const params=new URLSearchParams(location.search);
const mode=params.get('mode')||'interactive';
const RENDER=mode==='render';
let W=RENDER?(+params.get('w')||1080):window.innerWidth;
let H=RENDER?(+params.get('h')||1920):window.innerHeight;
const quality=params.get('q')||'high';

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:RENDER});
renderer.setPixelRatio(RENDER?1:Math.min(window.devicePixelRatio,window.innerWidth<720?1:1.5));
renderer.setSize(W,H);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const camera=new THREE.PerspectiveCamera(60,W/H,0.05,600);
const world=buildScene(renderer);
const scene=world.scene;

const GradePass={
  uniforms:{tDiffuse:{value:null},seed:{value:0},res:{value:new THREE.Vector2(W,H)}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float seed;uniform vec2 res;varying vec2 vUv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+seed*0.37)*43758.5453);}
    void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 q=vUv-0.5;float v=clamp(1.0-dot(q,q)*1.1,0.0,1.0);c.rgb*=mix(0.5,1.0,v);
      c.rgb+= (hash(floor(vUv*res))-0.5)*0.03;c.rgb=mix(c.rgb,c.rgb*vec3(1.03,1.0,0.965),0.6);gl_FragColor=c;}`
};

function makeComposer(w,h){
  const pr=renderer.getPixelRatio();
  const rt=new THREE.WebGLRenderTarget(w*pr,h*pr,{type:THREE.HalfFloatType,samples:quality==='low'?0:4});
  const c=new EffectComposer(renderer,rt);
  c.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(w,h),0.35,0.5,1.0);
  if(quality!=='low')c.addPass(bloom);
  c.addPass(new OutputPass());
  const grade=new ShaderPass(GradePass);c.addPass(grade);
  return {c,grade};
}
let {c:composer,grade}=makeComposer(W,H);

function setCamera(t){
  const k=cameraAt(t);
  camera.position.set(k.pos[0],k.pos[1],k.pos[2]);
  camera.up.set(0,1,0);camera.lookAt(k.look[0],k.look[1],k.look[2]);
  camera.rotateZ(k.roll);camera.fov=k.fov;camera.updateProjectionMatrix();
}
function frame(t,seed){world.update(t);setCamera(t);grade.uniforms.seed.value=seed;composer.render();}

const api={ready:false,duration:DURATION,mode:'play',time:0,
  renderFrame(u,i,fmt='jpeg',q=0.94){frame(u*DURATION,i);return renderer.domElement.toDataURL(fmt==='png'?'image/png':'image/jpeg',q);},
  renderView(px,py,pz,lx,ly,lz,fov,fmt='png'){world.update(0);camera.position.set(px,py,pz);camera.up.set(0,1,0);camera.lookAt(lx,ly,lz);camera.fov=fov||68;camera.updateProjectionMatrix();grade.uniforms.seed.value=0;composer.render();return renderer.domElement.toDataURL(fmt==='png'?'image/png':'image/jpeg',0.94);},
  camera,scene,renderer};
window.__villa=api;

if(RENDER){
  frame(0,0);
  api.ready=true;
}else{
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=0.08;controls.enabled=false;
  controls.minDistance=0.3;controls.maxDistance=60;controls.maxPolarAngle=Math.PI*0.52;
  let playing=true,t=0,last=performance.now(),seed=0;
  api.setMode=(m)=>{api.mode=m;if(m==='free'){const k=cameraAt(t);controls.target.set(k.look[0],k.look[1],k.look[2]);controls.enabled=true;playing=false;}else{controls.enabled=false;playing=true;}};
  api.seek=(u)=>{t=u*DURATION;setCamera(t);playing=false;api.mode='play';controls.enabled=false;};
  api.play=()=>{playing=true;api.mode='play';controls.enabled=false;};
  api.pause=()=>{playing=false;};
  api.isPlaying=()=>playing;
  api.chapter=(sec)=>{t=sec;api.mode='play';controls.enabled=false;playing=true;};
  api.toggle=()=>{playing?api.pause():api.play();};
  window.addEventListener('resize',()=>{W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();composer.setSize(W,H);grade.uniforms.res.value.set(W,H);});
  function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,0.1);last=now;
    if(playing){t+=dt;if(t>DURATION+1.5)t=0;}
    api.time=Math.min(t/DURATION,1);
    world.update(Math.min(t,DURATION));
    if(api.mode==='play')setCamera(Math.min(t,DURATION));else controls.update();
    grade.uniforms.seed.value=(seed++)%1000;composer.render();
    if(api.onFrame)api.onFrame(api.time);}
  api.ready=true;requestAnimationFrame(loop);
}
