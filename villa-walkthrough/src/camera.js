export const DURATION = 22;

function hermite(keys){
  const n=keys.length;
  const tang=keys.map((k,i)=>{const p=keys[Math.max(0,i-1)],q=keys[Math.min(n-1,i+1)];const dt=(q.t-p.t)||1;
    const s=(i===0||i===n-1)?0.25:1;return k.v.map((_,j)=>s*(q.v[j]-p.v[j])/dt);});
  return t=>{
    if(t<=keys[0].t)return keys[0].v.slice();
    if(t>=keys[n-1].t)return keys[n-1].v.slice();
    let i=0;while(keys[i+1].t<t)i++;
    const a=keys[i],b=keys[i+1],d=b.t-a.t,s=(t-a.t)/d,s2=s*s,s3=s2*s;
    const h00=2*s3-3*s2+1,h10=s3-2*s2+s,h01=-2*s3+3*s2,h11=s3-s2;
    return a.v.map((_,j)=>h00*a.v[j]+h10*d*tang[i][j]+h01*b.v[j]+h11*d*tang[i+1][j]);
  };
}
const K=(t,x,y,z)=>({t,v:[x,y,z]});

const POS=hermite([
  K(0.0,8.5,0.90,22.0),
  K(3.5,2.6,1.05,16.5),
  K(6.5,-0.2,1.35,8.5),
  K(8.6,1.7,1.50,2.4),
  K(9.7,2.4,1.50,0.0),
  K(11.4,1.0,1.45,-1.9),
  K(13.8,0.3,1.55,-3.6),
  K(16.4,0.15,1.45,-6.9),
  K(19.0,1.7,1.55,-8.6),
  K(22.0,3.0,1.60,-8.8),
]);
const LOOK=hermite([
  K(0.0,0.5,3.8,0.0),
  K(3.5,1.0,3.4,0.0),
  K(6.5,2.0,2.2,-1.0),
  K(8.6,2.4,1.50,-3.0),
  K(9.7,1.6,1.30,-5.0),
  K(11.4,-1.0,1.00,-5.8),
  K(13.8,-0.3,0.75,-7.0),
  K(16.4,-0.9,1.50,-11.6),
  K(19.0,2.5,1.45,-12.0),
  K(22.0,6.3,1.30,-11.7),
]);

export function cameraAt(t){
  const p=POS(t),l=LOOK(t);
  p[0]+=Math.sin(t*0.9)*0.012;p[1]+=Math.sin(t*1.3+1)*0.01;
  l[0]+=Math.sin(t*0.7+2)*0.02;l[1]+=Math.sin(t*1.1)*0.015;
  return {pos:p,look:l,roll:Math.sin(t*0.6)*0.003,fov:68};
}
