/* ============================================================
   🎥 WHERE TO PUT YOUR VIDEOS
   Option A (easiest): save each file at  videos/<lesson-id>/<sign-name>.mp4
                       e.g.  videos/greet/kumusta.mp4
                       The app finds it automatically.
   Option B: paste a link below, using the same key:
                       "greet/kumusta": "https://your-site.com/kumusta.mp4"
   The page shows the exact path for each sign in the dashed "VIDEO SLOT".
   ============================================================ */
const VIDEO_BASE = "videos/";
const VIDEOS = {
  // "greet/kumusta": "https://example.com/kumusta.mp4",
};

/* Lessons: [Cebuano word, English meaning] — check every sign with a CSL signer or Deaf community resource before publishing */
const LESSONS = [
 {id:"greet",title:"Greetings",e:"👋",signs:[["Kumusta","Hello / How are you?"],["Maayong buntag","Good morning"],["Salamat","Thank you"],["Palihug","Please"],["Pasayloa ko","Sorry"]]},
 {id:"num",title:"Numbers 1–5",e:"🔢",signs:[["Usa","One"],["Duha","Two"],["Tulo","Three"],["Upat","Four"],["Lima","Five"]]},
 {id:"fam",title:"Family",e:"👪",signs:[["Nanay","Mother"],["Tatay","Father"],["Igsoon","Sibling"],["Lola","Grandmother"],["Lolo","Grandfather"]]},
 {id:"abc",title:"Alphabet A–F",e:"🔤",signs:[["A","Letter A"],["B","Letter B"],["C","Letter C"],["D","Letter D"],["E","Letter E"],["F","Letter F"]]},
 {id:"daily",title:"Everyday words",e:"💧",signs:[["Oo","Yes"],["Dili","No"],["Tabang","Help"],["Tubig","Water"],["Kaon","Eat"]]}
];
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const keyOf=(l,s)=>l.id+"/"+slug(s[0]);
const srcOf=(l,s)=>VIDEOS[keyOf(l,s)]||(VIDEO_BASE+keyOf(l,s)+".mp4");
const total=LESSONS.reduce((n,l)=>n+l.signs.length,0);

let st={view:"learn",li:0,si:0,speed:1,loop:true,q:null,score:0,asked:0,find:""};
let done={};
try{done=JSON.parse(localStorage.getItem("csl-done")||"{}")}catch(e){}
const save=()=>{try{localStorage.setItem("csl-done",JSON.stringify(done))}catch(e){}};
const $=s=>document.querySelector(s);
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const L=()=>LESSONS[st.li], S=()=>L().signs[st.si];

/* ---------- video stage (the video slot) ---------- */
function stage(l,s){
 const k=keyOf(l,s), p=srcOf(l,s);
 return `<div class="stage" id="stage"><span class="tag">🎥 VIDEO SLOT · ${esc(k)}</span>
  <!-- 🎥 VIDEO SLOT: the player below loads: ${esc(p)} -->
  <video id="vid" controls playsinline preload="metadata" aria-label="Sign video for ${esc(s[0])}" ${st.loop?"loop":""} src="${esc(p)}"></video>
  <div class="slot"><h3>Put the video for “${esc(s[0])}” here</h3>
  <p>Save your file at this path, or add the link to <b>VIDEOS</b> in the script:</p>
  <pre id="code">&lt;video controls src="${esc(p)}"&gt;&lt;/video&gt;</pre>
  <button class="cp" data-a="copy" data-t="${esc(p)}">Copy file path</button></div></div>`;
}
function wire(){
 const v=$("#vid"); if(!v) return;
 v.addEventListener("loadedmetadata",()=>{$("#stage").classList.add("has");v.playbackRate=st.speed;});
 v.addEventListener("error",()=>$("#stage").classList.remove("has"));
}
const hasVid=()=>$("#stage")&&$("#stage").classList.contains("has");

/* ---------- views ---------- */
function learn(){
 const l=L(),s=S(),k=keyOf(l,s),isDone=!!done[k];
 const side=LESSONS.map((x,i)=>{const n=x.signs.filter(y=>done[keyOf(x,y)]).length;
  return `<button class="lesson" data-a="lesson" data-i="${i}" ${i===st.li?'aria-current="true"':""}><span class="e" aria-hidden="true">${x.e}</span><span><b>${x.title}</b><small>${n} of ${x.signs.length} learned</small></span></button>`}).join("");
 const strip=l.signs.map((x,i)=>`<button class="chip ${done[keyOf(l,x)]?"done":""}" data-a="sign" data-i="${i}" ${i===st.si?'aria-current="true"':""}>${esc(x[0])}</button>`).join("");
 return `<aside aria-label="Lessons"><div class="ls">${side}</div></aside>
 <section><div class="crumb">Learn › ${l.title} › ${esc(s[0])}</div>
 ${stage(l,s)}
 <div class="title"><h2>${esc(s[0])}</h2><span>${esc(s[1])}</span></div>
 <div class="ctl">
  <button class="btn" data-a="prev" ${st.si===0&&st.li===0?"disabled":""}>‹ Previous</button>
  <button class="btn pri" data-a="next">Next sign ›</button>
  <button class="btn" data-a="play">Replay</button>
  <button class="btn" data-a="speed" aria-label="Playback speed">Speed ${st.speed}×</button>
  <button class="btn" data-a="loop" aria-pressed="${st.loop}">Loop ${st.loop?"on":"off"}</button>
  <button class="btn ${isDone?"ok":""} sp" data-a="learned">${isDone?"✓ Learned":"Mark as learned"}</button>
 </div>
 <div class="hint">Sign ${st.si+1} of ${l.signs.length} in ${l.title}. Tip: use ← → keys to move between signs, Space to play or pause.</div>
 <div class="strip" role="list" aria-label="Signs in this lesson" style="margin-top:12px">${strip}</div></section>`;
}
function newQ(){
 const all=[];LESSONS.forEach(l=>l.signs.forEach(s=>all.push([l,s])));
 const [l,s]=all[Math.floor(Math.random()*all.length)];
 const pool=l.signs.filter(x=>x!==s).sort(()=>Math.random()-.5).slice(0,3);
 st.q={l,s,opts:[s,...pool].sort(()=>Math.random()-.5),ans:null};
}
function practice(){
 if(!st.q)newQ(); const q=st.q;
 const o=q.opts.map((x,i)=>{let c="opt";if(q.ans!==null){if(x===q.s)c+=" right";else if(i===q.ans)c+=" wrong"}
  return `<button class="${c}" data-a="ans" data-i="${i}" ${q.ans!==null?"disabled":""}>${esc(x[0])}<small style="display:block;font-weight:400;color:var(--mute)">${esc(x[1])}</small></button>`}).join("");
 return `<section><div class="crumb">Practice › Which sign is this?</div>
 <div class="hint" style="margin-bottom:10px">Score: ${st.score} of ${st.asked}</div>
 ${stage(q.l,q.s)}
 <div class="opts">${o}</div>
 <div class="ctl">${q.ans!==null?`<span>${q.opts[q.ans]===q.s?"Correct! The sign is “"+esc(q.s[0])+"”.":"Not quite. The sign is “"+esc(q.s[0])+"”."}</span><button class="btn pri sp" data-a="nq">Next question ›</button>`:`<button class="btn" data-a="play">Replay video</button>`}</div></section>`;
}
function dict(){
 const f=st.find.toLowerCase(),items=[];
 LESSONS.forEach((l,li)=>l.signs.forEach((s,si)=>{if(!f||(s[0]+" "+s[1]).toLowerCase().includes(f))items.push(`<button class="btn" data-a="go" data-l="${li}" data-i="${si}">${esc(s[0])}<small>${esc(s[1])} · ${l.title}</small></button>`)}));
 return `<section><div class="crumb">Dictionary</div><h2>Find a sign</h2>
 <input class="search" id="q" placeholder="Search in Cebuano or English" value="${esc(st.find)}" aria-label="Search signs">
 <div class="dg">${items.join("")||"<p class='hint'>No signs match. Try another word.</p>"}</div></section>`;
}
function render(keepFocus){
 const t=[["learn","Learn"],["practice","Practice"],["dict","Dictionary"]];
 const h=t.map(x=>`<button class="tab" data-a="view" data-v="${x[0]}" ${st.view===x[0]?'aria-current="page"':""}>${x[1]}</button>`).join("");
 $("#tabs").innerHTML=h;$("#btabs").innerHTML=h;
 const app=$("#app");app.className=st.view==="learn"?"":"one";
 app.innerHTML=st.view==="learn"?learn():st.view==="practice"?practice():dict();
 const n=Object.keys(done).length;$("#pt").textContent=n+" of "+total+" signs";$("#pb").style.width=(n/total*100)+"%";
 wire();
 if(keepFocus){const q=$("#q");if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}}
}
function step(d){
 let i=st.si+d;
 if(i<0){if(st.li>0){st.li--;i=L().signs.length-1}else i=0}
 else if(i>=L().signs.length){if(st.li<LESSONS.length-1){st.li++;i=0}else i=L().signs.length-1}
 st.si=i;render();
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,d=b.dataset;
 if(a==="view"){st.view=d.v;if(d.v==="practice"&&!st.q)newQ();render()}
 else if(a==="lesson"){st.li=+d.i;st.si=0;render()}
 else if(a==="sign"){st.si=+d.i;render()}
 else if(a==="go"){st.view="learn";st.li=+d.l;st.si=+d.i;render();scrollTo(0,0)}
 else if(a==="prev")step(-1);
 else if(a==="next")step(1);
 else if(a==="play"){const v=$("#vid");if(v&&hasVid()){v.currentTime=0;v.play()}}
 else if(a==="speed"){st.speed=st.speed===1?0.5:st.speed===0.5?0.75:1;const v=$("#vid");if(v)v.playbackRate=st.speed;b.textContent="Speed "+st.speed+"×"}
 else if(a==="loop"){st.loop=!st.loop;const v=$("#vid");if(v)v.loop=st.loop;b.setAttribute("aria-pressed",st.loop);b.textContent="Loop "+(st.loop?"on":"off")}
 else if(a==="learned"){const k=keyOf(L(),S());if(done[k])delete done[k];else done[k]=1;save();render()}
 else if(a==="copy"){try{navigator.clipboard.writeText(d.t);b.textContent="Copied"}catch(x){b.textContent="Select the path above to copy"}}
 else if(a==="ans"){if(st.q.ans===null){st.q.ans=+d.i;st.asked++;if(st.q.opts[st.q.ans]===st.q.s)st.score++;render()}}
 else if(a==="nq"){newQ();render()}
});
document.addEventListener("input",e=>{if(e.target.id==="q"){st.find=e.target.value;render(true)}});
document.addEventListener("keydown",e=>{
 if(st.view!=="learn"||/INPUT|TEXTAREA/.test(e.target.tagName))return;
 if(e.key==="ArrowRight")step(1);else if(e.key==="ArrowLeft")step(-1);
 else if(e.key===" "&&e.target.tagName!=="BUTTON"){const v=$("#vid");if(v&&hasVid()){e.preventDefault();v.paused?v.play():v.pause()}}
});
render();
