"use strict";
(function(){
const K=window.LR_KB;if(!K)return;
const IND=K.IND,KEYS=Object.keys(IND),$=(s,r=document)=>r.querySelector(s),TXT=["Normal","Warning","Critical"],COL=["#00e676","#ffea00","#ff1744"];
const iso=t=>new Date(t).toISOString().slice(0,10),today=()=>iso(Date.now()),DAY=864e5;
const st=(k,v)=>{const i=IND[k];return v>=i.ok[0]&&v<=i.ok[1]?0:v>=i.w[0]&&v<=i.w[1]?1:2};
const worst=(e,ks=KEYS)=>Math.max(...ks.map(k=>st(k,e[k])));
function seed(){const log=[],r=n=>(Math.random()-.5)*n;for(let i=13;i>=0;i--){const t=13-i;log.push({d:iso(Date.now()-i*DAY),src:"sim",hr:Math.round(71+t*.6+r(4)),sys:Math.round(120+t*1.1+r(4)),dia:Math.round(78+t*.5+r(3)),glu:Math.round(92+r(8)),temp:+(36.7+r(.3)).toFixed(1),sleep:+(7.6-t*.12+r(.4)).toFixed(1),mood:Math.max(1,Math.min(5,Math.round(4.4-t*.08+r(.6))))})}return{log,tasks:{}}}
let D=null;try{D=JSON.parse(localStorage.getItem("lr_v1"))}catch(e){}D=D||seed();
const save=()=>{try{localStorage.setItem("lr_v1",JSON.stringify(D))}catch(e){}};
const last=()=>D.log[D.log.length-1];
const streak=()=>{const s=new Set(D.log.filter(e=>e.src=="user").map(e=>e.d));let t=Date.now(),n=0;if(!s.has(today()))t-=DAY;while(s.has(iso(t))){n++;t-=DAY}return n};
const tasksToday=()=>D.tasks[today()]||(D.tasks[today()]=[]);
const pts=()=>Object.values(D.tasks).reduce((a,x)=>a+x.length*10,0);

const main=$("main.dashboard-grid"),nav=document.createElement("nav"),host=document.createElement("main");
nav.className="lr-tabs";host.className="lr-host";host.hidden=true;
nav.innerHTML=`<span class="lr-nav-label">MISSION VIEWS:</span>`+[["dash","🛰️ Primary Overview"],["checkin","📋 Daily Check-in"],["trends","📈 Dynamic Trends"],["hazards","⚠️ 5 Space Hazards"],["triage","🩺 Triage & SBAR"]].map(([k,l],i)=>`<button type="button" data-v="${k}" class="${i?"":"on"}">${l}</button>`).join("");
main.before(nav);main.after(host);
let sel="sys";
function show(v){nav.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.v==v));main.hidden=v!="dash";host.hidden=v=="dash";if(v!="dash")V[v]()}
nav.onclick=e=>{const b=e.target.closest("button");if(b)show(b.dataset.v)};

const backBtn=`<button type="button" class="lr-btn lr-back-btn" data-go="dash">← Back to Primary Overview</button>`;
const card=(k,v)=>{const i=IND[k],s=st(k,v);return `<details class="lr-card lr-s${s}" ${s?"open":""}><summary><b>${i.n}</b><span>${v} ${i.u}</span><em>${TXT[s]}</em></summary><p><b>What:</b> ${i.what}</p><p><b>How to measure:</b> ${i.how}</p><p><b>Why it changes in space:</b> ${i.why}</p><p><b>Contact the flight surgeon if:</b> ${i.call}</p><ul>${i.act.map(a=>`<li>${a}</li>`).join("")}</ul></details>`};
const foot=`<p class="lr-note">${K.NOTE}</p>`;

const V={
checkin(){const l=last();
 host.innerHTML=`<section class="panel lr-p"><div class="lr-view-top"><span class="section-kicker">SELF-ASSESSMENT</span>${backBtn}</div><h2 class="panel-title">Daily Check-in</h2><p class="lr-note">Take each measurement, enter it, and save. Your entries are tagged MEASURED; the starting history is SIMULATED demo data.</p><form id="lrf" class="lr-form">${KEYS.map(k=>{const i=IND[k];return `<label>${i.n} <small>${i.u}</small><input name="${k}" type="number" step="${i.step}" min="${i.r[0]}" max="${i.r[1]}" value="${l[k]}" required></label>`}).join("")}<button class="lr-btn">Save &amp; assess</button></form><div id="lrres"></div>${foot}</section><section class="panel lr-p" id="lrtasks"></section>`;
 tasks()},
trends(k=sel){sel=k;const i=IND[k];
 host.innerHTML=`<section class="panel lr-p lr-wide"><div class="lr-view-top"><span class="section-kicker">TRENDS</span>${backBtn}</div><h2 class="panel-title">${i.n} over time</h2><div class="lr-chips">${KEYS.map(x=>`<button data-k="${x}" class="${x==k?"on":""}">${IND[x].n}</button>`).join("")}</div><canvas id="lrc"></canvas><p id="lrtr" class="lr-note"></p><p class="lr-note">Band: green normal, yellow warning, red critical. Hollow point = SIMULATED, filled = MEASURED.</p>${foot}</section>`;draw(k)},
hazards(){const e=last();
 host.innerHTML=`<section class="panel lr-p lr-wide lr-haz-header"><div class="lr-view-top"><span class="section-kicker">NASA HUMAN RESEARCH PROGRAM</span>${backBtn}</div><h2 class="panel-title">The 5 Hazards of Human Spaceflight — Live Crew Status Mapping</h2></section>`+K.HAZ.map(h=>{const s=worst(e,h.ind);return `<section class="panel lr-p lr-card lr-s${s}"><span class="section-kicker">NASA HRP HAZARD</span><h2 class="panel-title">${h.n}</h2><p>${h.risk}</p><div class="lr-chips">${h.ind.map(k=>`<span class="lr-s${st(k,e[k])}">● ${IND[k].n}</span>`).join("")}</div><p><b>Action:</b> ${h.act}</p></section>`}).join("")+`<section class="panel lr-p lr-wide">${foot}</section>`},
triage(){host.innerHTML=`<section class="panel lr-p"><div class="lr-view-top"><span class="section-kicker">TRIAGE</span>${backBtn}</div><h2 class="panel-title">Symptom check</h2><p class="lr-note">Tick what you feel now. The result also uses your latest check-in.</p><div class="lr-sym">${K.TRI.map((s,i)=>`<label><input type="checkbox" data-i="${i}"> ${s[0]}</label>`).join("")}</div></section><section class="panel lr-p" id="lrtri"></section>`;tri()}};

function assess(e){const w=worst(e),bad=KEYS.filter(k=>st(k,e[k]));
 return `<div class="lr-banner lr-s${w}"><b>${["All indicators in range. Keep the routine.","Attention: "+bad.map(k=>IND[k].n).join(", ")+".","Critical: "+bad.filter(k=>st(k,e[k])==2).map(k=>IND[k].n).join(", ")+". Follow the actions, then prepare the flight-surgeon report."][w]}</b>${w?`<button class="lr-btn" data-go="triage" type="button">Open Triage</button>`:""}</div>`+KEYS.map(k=>card(k,e[k])).join("")}
function tasks(){const done=tasksToday(),s=streak(),p=pts(),lv=p<50?"Cadet":p<150?"Mission Ready":"Mars Ready",ared=Object.values(D.tasks).filter(x=>x.includes("ared")).length,e=last();
 const bd=[["7-day streak",s>=7],["Iron Bones",ared>=5],["All green",worst(e)==0]];
 $("#lrtasks").innerHTML=`<span class="section-kicker">HEALTH ROUTINE</span><h2 class="panel-title">Today's tasks</h2><div class="lr-score"><b>${p}</b> pts · <b>${lv}</b> · streak <b>${s}</b> day${s==1?"":"s"}</div>${K.TASKS.map(([id,t])=>`<label class="lr-task"><input type="checkbox" data-t="${id}" ${done.includes(id)?"checked":""} ${id=="checkin"?"disabled":""}> ${t}</label>`).join("")}<div class="lr-chips">${bd.map(([n,o])=>`<span class="${o?"lr-s0":"lr-off"}">${o?"★":"☆"} ${n}</span>`).join("")}</div>`}

function draw(k){const c=$("#lrc");if(!c)return;const i=IND[k],d=D.log.slice(-30),dpr=window.devicePixelRatio||1,W=c.width=Math.max(320,c.clientWidth*dpr),H=c.height=260*dpr,x=c.getContext("2d");
 const vals=d.map(e=>e[k]),lo=Math.min(i.w[0],...vals),hi=Math.max(i.w[1],...vals),pd=(hi-lo)*.12,a=lo-pd,b=hi+pd,L=48*dpr,R=W-12*dpr,T=12*dpr,B=H-26*dpr;
 const Y=v=>B-(v-a)/(b-a)*(B-T),X=n=>L+(d.length>1?n/(d.length-1):0)*(R-L);
 x.clearRect(0,0,W,H);[[a,b,"255,23,68,.10"],[i.w[0],i.w[1],"255,234,0,.12"],[i.ok[0],i.ok[1],"0,230,118,.16"]].forEach(([p,q,col])=>{x.fillStyle=`rgba(${col})`;x.fillRect(L,Y(q),R-L,Y(p)-Y(q))});
 x.fillStyle="#94a3b8";x.font=11*dpr+"px sans-serif";[a,(a+b)/2,b].forEach(v=>x.fillText(v.toFixed(i.step<1?1:0),4*dpr,Y(v)+4*dpr));x.fillText(d[0].d.slice(5),L,H-8*dpr);x.fillText(d[d.length-1].d.slice(5),R-30*dpr,H-8*dpr);
 x.strokeStyle="#00f2fe";x.lineWidth=2*dpr;x.beginPath();d.forEach((e,n)=>n?x.lineTo(X(n),Y(e[k])):x.moveTo(X(n),Y(e[k])));x.stroke();
 d.forEach((e,n)=>{const col=COL[st(k,e[k])];x.beginPath();x.arc(X(n),Y(e[k]),4*dpr,0,7);if(e.src=="user"){x.fillStyle=col;x.fill()}else{x.strokeStyle=col;x.lineWidth=2*dpr;x.stroke()}});
 const s7=d.slice(-7),m=s7.length,mx=(m-1)/2,my=s7.reduce((q,e)=>q+e[k],0)/m;let nu=0,de=0;s7.forEach((e,n)=>{nu+=(n-mx)*(e[k]-my);de+=(n-mx)**2});const sl=de?nu/de:0,v=vals[vals.length-1],bd=sl>0?i.ok[1]:i.ok[0],days=(bd-v)/sl,big=Math.abs(sl*7)>=(hi-lo)*.03;
 let t=big?`${sl>0?"Rising":"Falling"} about ${Math.abs(sl*7).toFixed(i.step<1?1:0)} ${i.u} per week.`:"Stable over the last week.";
 if(st(k,v)==0&&big&&days>0&&days<60)t+=` At this rate it leaves the normal range in about ${Math.ceil(days)} day(s): act early.`;$("#lrtr").textContent=t}

function tri(){const sel=[...host.querySelectorAll("[data-i]:checked")].map(c=>K.TRI[c.dataset.i]),e=last(),lv=Math.max(0,...sel.map(s=>s[1]),worst(e)),bad=KEYS.filter(k=>st(k,e[k]));
 const M=[["No action needed","Continue the routine and keep logging check-ins."],["Notify the crew and send a non-urgent report","Apply the suggested actions, re-check in 2-4 hours, then send the report."],["Urgent: start the protocol and send an urgent report","Rest, apply the actions, alert the crew. Do not wait for a reply: the ground response can take many minutes."]][lv];
 const T=`FLIGHT SURGEON REPORT (SBAR) - Project Lone Rover
S: ${($("#crewIdValue")||{}).textContent||"Crew"} | ${today()} | Priority: ${["ROUTINE","NON-URGENT","URGENT"][lv]}
   Symptoms: ${sel.length?sel.map(s=>s[0]).join("; "):"none reported"}
B: Data source: ${e.src=="user"?"MEASURED":"SIMULATED"} (${e.d}). Environment: ${(($("#envModeText")||{}).textContent)||"n/a"}
A: ${KEYS.map(k=>`${IND[k].n} ${e[k]} ${IND[k].u} [${TXT[st(k,e[k])]}]`).join("; ")}
   Flagged: ${bad.length?bad.map(k=>IND[k].n).join(", "):"none"}
R: Actions taken/planned: ${bad.length?bad.map(k=>IND[k].act[0]).join("; "):"routine monitoring"}. Requesting guidance.`;
 $("#lrtri").innerHTML=`<div class="lr-banner lr-s${lv}"><b>${M[0]}</b></div><p>${M[1]}</p>${bad.map(k=>`<p><b>${IND[k].n}:</b> ${IND[k].act.join(" / ")}</p>`).join("")}<pre id="lrrep">${T.replace(/</g,"&lt;")}</pre><button class="lr-btn" id="lrcopy" type="button">Copy report</button> <button class="lr-btn" id="lrdl" type="button">Download .txt</button>`}

host.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.k)V.trends(b.dataset.k);if(b.dataset.go)show(b.dataset.go);
 if(b.id=="lrcopy"){const t=$("#lrrep").textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const r=document.createRange();r.selectNodeContents($("#lrrep"));getSelection().removeAllRanges();getSelection().addRange(r);document.execCommand("copy")});b.textContent="Copied"}
 if(b.id=="lrdl"){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([$("#lrrep").textContent],{type:"text/plain"}));a.download="flight-surgeon-report-"+today()+".txt";a.click()}});
host.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target),en={d:today(),src:"user"};KEYS.forEach(k=>en[k]=+f.get(k));
 D.log=D.log.filter(x=>!(x.d==en.d&&x.src=="user"));D.log.push(en);D.log=D.log.slice(-90);const t=tasksToday();if(!t.includes("checkin"))t.push("checkin");save();$("#lrres").innerHTML=assess(en);tasks()});
host.addEventListener("change",e=>{const c=e.target;if(c.dataset.i!==undefined)tri();if(c.dataset.t){const t=tasksToday();c.checked?t.includes(c.dataset.t)||t.push(c.dataset.t):t.splice(t.indexOf(c.dataset.t),1);save();tasks()}});
addEventListener("resize",()=>{if(!host.hidden&&$("#lrc"))draw(sel)});
})();
