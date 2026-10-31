import React,{useMemo,useRef,useEffect,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {Environment,Lightformer,useGLTF} from '@react-three/drei';
import * as THREE from 'three';

function Sculpture({reduced,onReady}){
 const {scene}=useGLTF(import.meta.env.BASE_URL+'assets/sculpture/scene.gltf');
 const group=useRef(),idle=useRef(),target=useRef({x:0,y:0});
 useEffect(()=>{
  const hero=document.getElementById('home');
  const move=e=>{const r=hero.getBoundingClientRect();target.current.x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));target.current.y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));};
  const reset=()=>{target.current={x:0,y:0}};
  hero.addEventListener('pointermove',move,{passive:true});hero.addEventListener('pointerleave',reset);
  return()=>{hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',reset)};
 },[]);
 const model=useMemo(()=>{
  const copy=scene.clone(true);
  const box=new THREE.Box3().setFromObject(copy),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const wrapper=new THREE.Group();copy.position.sub(center);wrapper.add(copy);wrapper.scale.setScalar(3.45/Math.max(size.x,size.y,size.z));return wrapper;
 },[scene]);
 useEffect(()=>{onReady()},[model]);
 useFrame((state,delta)=>{if(!group.current)return;const smooth=1-Math.exp(-4*Math.min(delta,.05));
 group.current.rotation.y=THREE.MathUtils.lerp(group.current.rotation.y,reduced?0:target.current.x*1.35,smooth);
 group.current.rotation.x=THREE.MathUtils.lerp(group.current.rotation.x,reduced?0:target.current.y*.5,smooth);
 const t=state.clock.elapsedTime;
 idle.current.position.y=reduced?0:Math.sin(t*.65)*.065;
 idle.current.rotation.set(reduced?0:Math.sin(t*.31)*.035,reduced?0:Math.sin(t*.23)*.09,reduced?0:Math.sin(t*.38)*.025);
 });
 return <group ref={group}><group ref={idle}><primitive object={model}/></group></group>;
}
export default function Scene({reduced,onReady}){
 return <Canvas dpr={[1,1.6]} camera={{position:[0,0,5.8],fov:42}} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.setClearColor(0x000000,0)}} frameloop={reduced?'demand':'always'}>
 <ambientLight intensity={.3}/><directionalLight position={[-3,4,3]} intensity={3} color="#c4deff"/><directionalLight position={[3,-1,1]} intensity={1.7} color="#7eacdd"/>
 <Environment resolution={128}><Lightformer intensity={5} position={[-3,3,2]} scale={[1,6,1]} rotation={[0,.5,.4]}/><Lightformer intensity={4} position={[3,1,1]} scale={[1,5,1]} rotation={[0,-.6,-.3]}/><Lightformer intensity={3} position={[0,-3,2]} scale={[5,.5,1]}/><Lightformer intensity={1} position={[0,2,-3]} scale={[4,3,1]}/></Environment>
 <React.Suspense fallback={null}><Sculpture reduced={reduced} onReady={onReady}/></React.Suspense></Canvas>
}
