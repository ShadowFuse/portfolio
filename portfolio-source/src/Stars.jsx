import React,{useEffect,useRef} from 'react';
export default function Stars({reduced}){
 const ref=useRef();
 useEffect(()=>{
  const canvas=ref.current,hero=canvas.parentElement,ctx=canvas.getContext('2d');if(!ctx)return;
  let w=0,h=0,id,last=0,visible=true;let pointer={x:-10000,y:-10000};
  let seed=75;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  const dots=Array.from({length:100},()=>({u:rand(),v:rand(),r:.5+rand()*1.1,alpha:.18+rand()*.45,dx:0,dy:0}));
  function draw(t=0){const dt=last?Math.min((t-last)/1000,.05):.016;last=t;const ease=1-Math.exp(-6*dt);ctx.clearRect(0,0,w,h);
   for(const p of dots){const x=p.u*w,y=p.v*h,dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy),radius=170;const force=!reduced&&d<radius?55*(1-d/radius)**2:0;
    p.dx+=((d?dx/d:1)*force-p.dx)*ease;p.dy+=((d?dy/d:0)*force-p.dy)*ease;
    ctx.beginPath();ctx.fillStyle=`rgba(180,207,240,${p.alpha})`;ctx.arc(x+p.dx,y+p.dy,p.r,0,Math.PI*2);ctx.fill();
   }if(!reduced&&visible)id=requestAnimationFrame(draw);
  }
  function resize(){w=hero.clientWidth;h=hero.clientHeight;const dpr=Math.min(devicePixelRatio,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);cancelAnimationFrame(id);last=0;draw();}
  function move(e){const r=hero.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};}function leave(){pointer={x:-10000,y:-10000};}
  const ro=new ResizeObserver(resize);ro.observe(hero);
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;cancelAnimationFrame(id);last=0;if(visible)draw();});io.observe(hero);
  hero.addEventListener('pointermove',move,{passive:true});hero.addEventListener('pointerleave',leave);
  return()=>{cancelAnimationFrame(id);ro.disconnect();io.disconnect();hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave)};
 },[reduced]);
 return <canvas ref={ref} className="stars" aria-hidden="true"/>;
}
