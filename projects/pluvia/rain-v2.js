/* PLUVIA v2 — one deterministic renderer in every browser.
   Sharp aerial photograph / removable condensation / stationary water lenses. */
(()=>{'use strict';
const fog=document.querySelector('#fog'),water=document.querySelector('#water');
const fc=fog.getContext('2d'),wc=water.getContext('2d');
const sharp=document.createElement('canvas'),sc=sharp.getContext('2d');
const frosted=document.createElement('canvas'),fr=frosted.getContext('2d');
const mask=document.createElement('canvas'),mc=mask.getContext('2d');
const photo=new Image();photo.decoding='async';
let w=1,h=1,dpr=1,mode=1,fogLevel=.91,ready=false,time=0,last=0,acc=0,fogTick=0,statsTick=0,wipeEvents=0;
let wave=null;let drops=[],trail=null;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stats={births:0,wiped:0,expired:0};
const api={setMode(n){mode=n},setFog(n){fogLevel=.5+n*.5;fogTick=1},clear(x=w/2,y=h/2){wave={x,y,age:0,r:0,max:Math.max(Math.hypot(x,y),Math.hypot(w-x,y),Math.hypot(x,h-y),Math.hypot(w-x,h-y))+100};}};
window.pluvia=api;
function cover(ctx,img,cw,ch,extra=0){const s=Math.max(cw/img.width,ch/img.height);ctx.drawImage(img,(cw-img.width*s)/2-extra,(ch-img.height*s)/2-extra,img.width*s+extra*2,img.height*s+extra*2);}
function resize(){
w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.4,Math.sqrt(2100000/(w*h)));
for(const c of [fog,water,sharp,frosted]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
mask.width=Math.round(w*.5);mask.height=Math.round(h*.5);
if(!ready)return;
cover(sc,photo,sharp.width,sharp.height);
fr.filter=`blur(${19*dpr}px)`;cover(fr,photo,frosted.width,frosted.height,36*dpr);fr.filter='none';
fr.fillStyle='rgba(157,192,181,.20)';fr.fillRect(0,0,frosted.width,frosted.height);
// Fine condensation gives the glass a material surface without obscuring the scene.
let grainSeed=46;for(let i=0;i<Math.min(18000,w*h/65);i++){grainSeed=(grainSeed*16807)%2147483647;let x=grainSeed/2147483647*frosted.width;grainSeed=(grainSeed*16807)%2147483647;let y=grainSeed/2147483647*frosted.height;fr.fillStyle=i%2?'#edfff511':'#052c2110';fr.fillRect(x,y,1,1);}
drops=[];for(let i=0;i<Math.min(410,w*h/2500);i++)add(true);fogTick=1;paintFog(.016);
}
function makeLens(d){
const c=document.createElement('canvas');const quality=2;const r=d.r;const dim=Math.ceil(r*4+8);c.width=c.height=dim*quality;const x=c.getContext('2d');x.scale(quality,quality);const m=dim/2,ry=r*d.squash;
// Transparent interior: the moving scene remains visible through every bead.
x.save();x.translate(m,m);x.rotate(d.rotation);
x.beginPath();x.moveTo(0,-ry);x.bezierCurveTo(r*.68,-ry*1.08,r*1.05,-ry*.35,r,ry*.12);x.bezierCurveTo(r*.93,ry*.83,r*.42,ry*1.04,-r*.12,ry);x.bezierCurveTo(-r*.83,ry*.91,-r*1.03,ry*.24,-r,-ry*.13);x.bezierCurveTo(-r*.94,-ry*.71,-r*.5,-ry,0,-ry);x.clip();x.globalAlpha=.16;x.drawImage(sharp,(d.x-r*1.3)*dpr,(d.y-r*1.3)*dpr,r*2.6*dpr,r*2.6*dpr,-r,-ry,r*2,ry*2);x.globalAlpha=1;
let lens=x.createRadialGradient(-r*.15,-ry*.18,r*.25,0,0,r);
lens.addColorStop(0,'#ffffff00');lens.addColorStop(.68,'#ffffff00');lens.addColorStop(.87,'#04251c30');lens.addColorStop(.96,'#c8fff738');lens.addColorStop(1,'#ffffff15');x.fillStyle=lens;x.fillRect(-r,-r,r*2,r*2);
x.beginPath();x.ellipse(0,0,r*.87,ry*.86,0,3.6,4.9);x.strokeStyle='#f2fffb9c';x.lineWidth=Math.max(.55,r*.07);x.stroke();
x.beginPath();x.ellipse(0,0,r*.92,ry*.9,0,.4,1.8);x.strokeStyle='#e5fff44d';x.lineWidth=Math.max(.4,r*.035);x.stroke();
let spec=x.createRadialGradient(-r*.46,-ry*.55,0,-r*.46,-ry*.55,r*.15);spec.addColorStop(0,'#ffffffb0');spec.addColorStop(1,'#ffffff00');x.fillStyle=spec;x.fillRect(-r,-r,r*2,r*2);x.restore();return c;
}
function add(initial=false){if(drops.length>2600)return;const big=Math.random()>.72;const r=big?6+Math.random()*6:1.6+Math.random()*4.8;const life=8+Math.random()*13;
const d={x:Math.random()*w,y:Math.random()*h,r,life,age:initial?Math.random()*life:0,alpha:1,squash:.78+Math.random()*.21,rotation:Math.random()*.8-.4,wiped:false};d.sprite=makeLens(d);drops.push(d);stats.births++;}
function distanceToSegment(px,py,ax,ay,bx,by){const vx=bx-ax,vy=by-ay;const den=vx*vx+vy*vy;let t=den?Math.max(0,Math.min(1,((px-ax)*vx+(py-ay)*vy)/den)):0;return Math.hypot(px-ax-t*vx,py-ay-t*vy);}
function wipe(x,y){if(!ready)return;const radius=w<650?48:69;const previous=trail&&time-trail.time<.16?trail:{x,y};
mc.globalCompositeOperation='source-over';const length=Math.hypot(x-previous.x,y-previous.y);const steps=Math.max(1,Math.ceil(length/(radius*.22)));
for(let i=0;i<=steps;i++){const px=(previous.x+(x-previous.x)*i/steps)*.5,py=(previous.y+(y-previous.y)*i/steps)*.5;const r=radius*.5;let brush=mc.createRadialGradient(px,py,r*.35,px,py,r);brush.addColorStop(0,'rgba(255,255,255,1)');brush.addColorStop(.5,'rgba(255,255,255,.97)');brush.addColorStop(1,'rgba(255,255,255,0)');mc.fillStyle=brush;mc.fillRect(px-r,py-r,r*2,r*2);}
for(const d of drops){if(!d.wiped&&distanceToSegment(d.x,d.y,previous.x,previous.y,x,y)<radius*.84+d.r){d.wiped=true;stats.wiped++;}}
trail={x,y,time};wipeEvents++;fogTick=1;
}
addEventListener('pointermove',e=>wipe(e.clientX,e.clientY),{passive:true});addEventListener('pointerdown',e=>wipe(e.clientX,e.clientY),{passive:true});addEventListener('pointerout',e=>{if(!e.relatedTarget)trail=null});addEventListener('resize',resize);
function paintFog(dt){
mc.globalCompositeOperation='destination-out';mc.fillStyle=`rgba(0,0,0,${1-Math.exp(-dt*.105)})`;mc.fillRect(0,0,mask.width,mask.height);mc.globalCompositeOperation='source-over';
fc.clearRect(0,0,fog.width,fog.height);fc.globalCompositeOperation='source-over';fc.globalAlpha=fogLevel;fc.drawImage(frosted,0,0);const rain=document.querySelector('#distant-rain');fc.globalAlpha=fogLevel*.85;fc.filter='blur(2px)';fc.drawImage(rain,0,0,fog.width,fog.height);fc.filter='none';fc.globalAlpha=1;fc.globalCompositeOperation='destination-out';fc.drawImage(mask,0,0,fog.width,fog.height);fc.globalCompositeOperation='source-over';
}
function frame(now){requestAnimationFrame(frame);if(!ready||document.hidden){last=now;return;}const dt=Math.min((now-last)/1000||.016,.06);last=now;time+=dt;fogTick+=dt;
if(wave){wave.age+=dt;const progress=Math.min(1,wave.age/1.65);wave.r=wave.max*(1-Math.pow(1-progress,2));mc.globalCompositeOperation='source-over';const radius=wave.r*.5;const g=mc.createRadialGradient(wave.x*.5,wave.y*.5,Math.max(0,radius-26),wave.x*.5,wave.y*.5,Math.max(1,radius));g.addColorStop(0,'#fff');g.addColorStop(1,'#ffffff00');mc.fillStyle=g;mc.fillRect(wave.x*.5-radius,wave.y*.5-radius,radius*2,radius*2);for(const d of drops)if(Math.hypot(d.x-wave.x,d.y-wave.y)<wave.r-20)d.wiped=true;fogTick=1;if(progress>=1)wave=null;}
if(fogTick>=.045){paintFog(Math.min(fogTick,.07));fogTick=0;}
acc+=dt*Math.min(w*h/23000,95)*[.35,1,7.5][mode]*(reduce?.35:1);while(acc>=1){add();acc--;}
wc.setTransform(1,0,0,1,0,0);wc.clearRect(0,0,water.width,water.height);wc.setTransform(dpr,0,0,dpr,0,0);
for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.age+=dt;if(trail&&time-trail.time<.12&&!d.wiped&&Math.hypot(d.x-trail.x,d.y-trail.y)<(w<650?42:60)){d.wiped=true;stats.wiped++;}if(d.wiped)d.alpha=Math.max(0,d.alpha-dt*9);if(d.age>d.life||d.alpha<=0){if(!d.wiped)stats.expired++;drops.splice(i,1);continue;}
const birth=reduce?1:Math.min(1,d.age/.12);const fade=Math.min(1,(d.life-d.age)/3);const bounce=reduce?1:1+Math.sin(d.age*30)*Math.exp(-d.age*11)*.2;const dim=d.sprite.width/2*(.2+birth*.8)*bounce;wc.globalAlpha=d.alpha*birth*fade;wc.drawImage(d.sprite,d.x-dim/2,d.y-dim/2,dim,dim);
if(d.age<.5&&!reduce){const progress=d.age/.5;wc.globalAlpha=(1-progress)*.16*d.alpha;wc.beginPath();wc.ellipse(d.x,d.y,d.r*(1+progress*1.2),d.r*(1+progress*1.2),0,0,Math.PI*2);wc.strokeStyle='#e3fff4';wc.lineWidth=.7;wc.stroke();if(d.r>6&&progress<.4){wc.globalAlpha=(1-progress/.4)*.3;for(let n=0;n<4;n++){const angle=n*Math.PI/2+d.rotation;const sr=d.r*(1.2+progress*2);wc.beginPath();wc.arc(d.x+Math.cos(angle)*sr,d.y+Math.sin(angle)*sr,.8,0,Math.PI*2);wc.fillStyle='#edfff9';wc.fill();}}}
}
if(wave){wc.globalAlpha=Math.max(0,1-wave.age/1.65)*.45;wc.strokeStyle='#e3fff5';wc.lineWidth=1.5;wc.shadowColor='#d6fff0';wc.shadowBlur=18;wc.beginPath();wc.arc(wave.x,wave.y,wave.r,0,Math.PI*2);wc.stroke();wc.shadowBlur=0;}water.dataset.clearing=String(!!wave);
wc.globalAlpha=1;statsTick+=dt;if(statsTick>1){water.dataset.drops=String(drops.length);water.dataset.births=String(stats.births);water.dataset.wiped=String(stats.wiped);water.dataset.expired=String(stats.expired);fog.dataset.wipes=String(wipeEvents);statsTick=0;}
}
photo.onload=()=>{ready=true;resize();document.body.dataset.scene='ready';};photo.onerror=()=>{document.body.dataset.scene='error';const n=document.querySelector('#notice');n.textContent='Не удалось загрузить лес. Обнови страницу.';n.classList.add('visible');};photo.src='assets/forest-canopy.webp';resize();requestAnimationFrame(frame);
})();