'use strict';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reduceMotion.matches, frame = 0, timer, commandIndex = 0;
const commands = ['ls ./projects', 'cat interests.txt', 'cd network-lab', 'git status', 'python main.py'];
const text = document.querySelector('#terminal-text');
const toggle = document.querySelector('#motion-toggle');
const canvas = document.querySelector('#network-bg');
const ctx = canvas.getContext('2d');
const pointer = {x:-1000,y:-1000};
const finePointer = matchMedia('(pointer: fine)');
let width = 0, height = 0, particles = [], lastTime = 0;
function resize() {
  width = innerWidth; height = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * ratio; canvas.height = height * ratio;
  ctx?.setTransform(ratio,0,0,ratio,0,0);
  particles = Array.from({length:Math.min(65,Math.floor(width/22))},()=>({
    x:Math.random()*width,y:Math.random()*height,
    vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.2+.5
  }));
}
function draw(time) {
  if (!ctx || !motion || document.hidden) {frame=0;return;}
  const delta = Math.min((time-lastTime)/16.67 || 1,2); lastTime=time;
  ctx.clearRect(0,0,width,height);
  for (let i=0;i<particles.length;i++) {
    const p=particles[i];
    p.x=(p.x+p.vx*delta+width)%width;p.y=(p.y+p.vy*delta+height)%height;
    ctx.fillStyle='#c4f66c';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    for(let j=i+1;j<particles.length;j++) {
      const q=particles[j],d=Math.hypot(p.x-q.x,p.y-q.y);
      if(d<135){ctx.strokeStyle='rgba(196,246,108,'+((1-d/135)*.22)+')';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
    }
    const d=Math.hypot(p.x-pointer.x,p.y-pointer.y);
    if(d<180){ctx.strokeStyle='rgba(196,246,108,'+((1-d/180)*.45)+')';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();}
  }
  frame=requestAnimationFrame(draw);
}
function typeNext() {
  clearTimeout(timer);
  if(!motion || document.hidden)return;
  const command=commands[commandIndex];let i=0;text.textContent='';
  function type(){
    text.textContent=command.slice(0,++i);
    if(i<command.length)timer=setTimeout(type,65);
    else timer=setTimeout(()=>{commandIndex=(commandIndex+1)%commands.length;typeNext();},2400);
  }
  type();
}
function syncMotion(){
  document.body.classList.toggle('motion-off',!motion);
  toggle.setAttribute('aria-pressed',String(motion));
  toggle.textContent='動態效果：'+(motion?'開':'關');
  cancelAnimationFrame(frame);frame=0;clearTimeout(timer);
  if(motion&&!document.hidden){lastTime=performance.now();frame=requestAnimationFrame(draw);typeNext();}
  else{
    ctx?.clearRect(0,0,width,height);
    document.querySelectorAll('.reveal-ready').forEach(el=>el.classList.add('revealed'));
    document.querySelectorAll('[data-tilt]').forEach(el=>{el.style.removeProperty('--rx');el.style.removeProperty('--ry');});
  }
}
if('IntersectionObserver' in window && motion){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}});
  },{threshold:.12});
  document.querySelectorAll('.section-label,.about-layout,.section-heading,.featured,.research,.contact-row').forEach((el,i)=>{
    el.classList.add('reveal-ready');el.style.setProperty('--delay',(i%2*80)+'ms');observer.observe(el);
  });
}
document.querySelectorAll('.research,.featured,.terminal').forEach(el=>{
  el.dataset.tilt='';
  el.addEventListener('pointermove',event=>{
    if(!motion||!finePointer.matches)return;
    const rect=el.getBoundingClientRect();
    el.style.setProperty('--rx',(-(event.clientY-rect.top-rect.height/2)/rect.height*5)+'deg');
    el.style.setProperty('--ry',((event.clientX-rect.left-rect.width/2)/rect.width*5)+'deg');
    el.style.setProperty('--card-x',(event.clientX-rect.left)+'px');
    el.style.setProperty('--card-y',(event.clientY-rect.top)+'px');
  });
  el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});
});
document.addEventListener('pointermove',event=>{
  if(!motion||!finePointer.matches)return;
  pointer.x=event.clientX;pointer.y=event.clientY;
  document.body.style.setProperty('--pointer-x',pointer.x+'px');
  document.body.style.setProperty('--pointer-y',pointer.y+'px');
},{passive:true});
document.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-1000;});
const progress=document.querySelector('.scroll-progress');
function updateScroll(){
  const distance=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform='scaleX('+(distance>0?scrollY/distance:0)+')';
}
addEventListener('scroll',updateScroll,{passive:true});
addEventListener('resize',()=>{resize();updateScroll();},{passive:true});
document.addEventListener('visibilitychange',syncMotion);
reduceMotion.addEventListener('change',event=>{motion=!event.matches;syncMotion();});
toggle.addEventListener('click',()=>{motion=!motion;syncMotion();});
document.querySelector('#terminal-button').addEventListener('click',()=>{
  commandIndex=(commandIndex+1)%commands.length;
  if(motion)typeNext();else text.textContent=commands[commandIndex];
});
document.querySelector('#year').textContent=new Date().getFullYear();
resize();updateScroll();syncMotion();
