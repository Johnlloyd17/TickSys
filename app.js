// Ticketing System: sample data, in memory only.
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const STAT=["Open","In Progress","Resolved","Closed"],PRI=["Low","Medium","High"],CAT=["Hardware","Software","Network","Account","Other"],STAFF=["Unassigned","Alex Cruz","Bea Lim","CJ Tan"];
const ago=h=>new Date(Date.now()-h*36e5).toISOString();
const fmt=i=>new Date(i).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
const age=i=>{const h=Math.max(1,Math.round((Date.now()-new Date(i))/36e5));return h<48?h+"h":Math.round(h/24)+"d"};
const mk=(n,title,description,category,priority,status,assignee,h)=>{const i=STAT.indexOf(status);return{id:"TKT-"+String(n).padStart(3,"0"),title,description,category,priority,status,assignee,created:ago(h),history:STAT.slice(0,i+1).map((s,k)=>[s,ago(h-k*Math.max(h/(i+1),.5)*.8)])}};
let tickets=[
 mk(1,"Printer on 2nd floor not printing","Jobs stay in the queue and nothing comes out.","Hardware","Medium","Open","Unassigned",30),
 mk(2,"Cannot connect to office Wi-Fi","Laptop sees the network but fails to join.","Network","High","In Progress","Bea Lim",52),
 mk(3,"Email password reset","User is locked out of the mailbox.","Account","Low","Resolved","Alex Cruz",70),
 mk(4,"Install accounting software","New version needed on the finance PC.","Software","Medium","Open","CJ Tan",20),
 mk(5,"Monitor flickering","Screen flickers when the cable moves.","Hardware","Low","Closed","Alex Cruz",120),
 mk(6,"VPN drops every hour","Remote staff lose the connection hourly.","Network","High","Open","Unassigned",8),
 mk(7,"Request new user account","Account for a new hire in Records.","Account","Medium","In Progress","Alex Cruz",40)];
let seq=8,mode="board";
const find=id=>tickets.find(t=>t.id===id);
const isActive=t=>t.status==="Open"||t.status==="In Progress";
const nextOf=t=>STAT[STAT.indexOf(t.status)+1];
const chip=v=>`<span class="chip ${v}">${v}</span>`;
let tt;function toast(t,err){const e=$("#toast");e.textContent=t;e.className="toast"+(err?" err":"");clearTimeout(tt);tt=setTimeout(()=>e.textContent="",4500)}
const COL=["#141314","#0068ad","#b9dbfd","#8a8780","#ece8e0"];
const stacked=rows=>{const tot=rows.reduce((a,r)=>a+r[1],0)||1;return`<div class="stack" role="img" aria-label="${rows.map(r=>r[0]+" "+r[1]).join(", ")}">${rows.map(([l,n],i)=>n?`<i style="flex:${n};background:${COL[i%5]}"></i>`:"").join("")}</div><ul class="legend">${rows.map(([l,n],i)=>`<li><span class="sw" style="background:${COL[i%5]}"></span>${esc(l)} <b>${n}</b></li>`).join("")}</ul>`};
const count=(arr,key)=>arr.map(k=>[k,tickets.filter(t=>t[key]===k).length]);
const advBtn=t=>t.status==="Closed"?"":`<button class="btn p sm" data-adv="${t.id}">Move to ${nextOf(t)}</button>`;

function renderDash(){
  const c=STAT.map(s=>tickets.filter(t=>t.status===s).length);
  $("#strip").innerHTML=STAT.map((s,i)=>`<div class="seg-b s${i}" style="--g:${Math.max(c[i],.6)}"><span>${s}</span><b>${c[i]}</b></div>`).join("");
  const q=tickets.filter(isActive).sort((a,b)=>PRI.indexOf(b.priority)-PRI.indexOf(a.priority)||a.created.localeCompare(b.created)).slice(0,6);
  $("#queue").innerHTML=q.length?q.map(t=>`<li class="q ${t.priority}">${chip(t.priority)}<div><b>${esc(t.title)}</b><small>${t.id} · ${t.category} · open ${age(t.created)} · ${esc(t.assignee)}</small></div><div class="acts">${advBtn(t)}<button class="btn s sm" data-view="${t.id}" aria-label="View ${t.id}">View</button></div></li>`).join(""):'<li class="empty">Nothing needs attention.</li>';
  const act=tickets.filter(isActive),mx=Math.max(...STAFF.map(s=>act.filter(t=>t.assignee===s).length),1);
  $("#load").innerHTML=STAFF.map(s=>{const n=act.filter(t=>t.assignee===s).length;return`<div class="load"><span>${esc(s)}</span><div class="t"><i style="width:${n/mx*100}%"></i></div><em>${n}</em></div>`}).join("");
  $("#cats").innerHTML=count(CAT,"category").map(([c,n])=>`<span>${c}<b>${n}</b></span>`).join("");
}
function matches(t){const q=$("#q").value.trim().toLowerCase(),fp=$("#fp").value;return(t.id+t.title+t.description).toLowerCase().includes(q)&&(fp==="All priorities"||t.priority===fp)}
function renderTickets(){
  const list=tickets.filter(matches);
  $("#board").innerHTML=STAT.map((s,i)=>{const items=list.filter(t=>t.status===s).sort((a,b)=>PRI.indexOf(b.priority)-PRI.indexOf(a.priority));
    return`<section class="col c${i}" aria-label="${s}"><header><span>${s}</span><span>${items.length}</span></header><ul>${items.length?items.map(t=>`<li><article class="card"><div class="top"><span class="id">${t.id}</span>${chip(t.priority)}</div><b>${esc(t.title)}</b><small>${t.category} · ${esc(t.assignee)} · ${age(t.created)}</small><div class="acts">${advBtn(t)}<button class="btn s sm" data-view="${t.id}" aria-label="View ${t.id}">View</button>${t.status==="Closed"?`<button class="btn s sm" data-del="${t.id}" aria-label="Delete ${t.id}">Delete</button>`:""}</div></article></li>`).join(""):'<li class="empty">Nothing here.</li>'}</ul></section>`}).join("");
  const rows=[...list].reverse();
  $("#tix").innerHTML=rows.length?rows.map(t=>`<tr><td class="id">${t.id}</td><td>${esc(t.title)}</td><td class="hm">${t.category}</td><td>${chip(t.priority)}</td><td>${chip(t.status)}</td><td class="hm">${esc(t.assignee)}</td><td class="hm">${fmt(t.created)}</td><td><div class="acts"><button class="btn s sm" data-view="${t.id}" aria-label="View ${t.id}">View</button>${t.status==="Closed"?`<button class="btn s sm" data-del="${t.id}" aria-label="Delete ${t.id}">Delete</button>`:""}</div></td></tr>`).join(""):`<tr><td colspan="8" class="empty">${tickets.length?"No tickets match.":"No tickets yet. Create one."}</td></tr>`;
  $("#board").hidden=mode!=="board";$("#list").hidden=mode!=="list";
}
function renderReports(){
  const tot=tickets.length,done=tickets.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
  $("#r-rate").textContent=(tot?Math.round(done/tot*100):0)+"%";$("#r-total").textContent=tot;
  $("#r-un").textContent=tickets.filter(t=>isActive(t)&&t.assignee==="Unassigned").length;$("#r-closed").textContent=tickets.filter(t=>t.status==="Closed").length;
  $("#rp-status").innerHTML=stacked(count(STAT,"status"));$("#rp-pri").innerHTML=stacked(count([...PRI].reverse(),"priority"));$("#rp-cat").innerHTML=stacked(count(CAT,"category"));
}
function render(){renderDash();renderTickets();renderReports()}

const drawer=$("#drawer");
function openDrawer(html){$("#dbody").innerHTML=html;if(!drawer.open)drawer.showModal()}
function formDrawer({title,values={},create,save}){
  const sel=(id,arr)=>`<select id="${id}" style="width:100%">${arr.map(o=>`<option>${o}</option>`).join("")}</select>`;
  openDrawer(`<h3>${esc(title)}</h3><form id="tform" novalidate><div class="f"><label for="f-title">Title</label><input id="f-title" autocomplete="off"></div><div class="f"><label for="f-description">Description</label><textarea id="f-description" rows="4"></textarea></div><div class="f"><label for="f-category">Category</label>${sel("f-category",CAT)}</div><div class="f"><label for="f-priority">Priority</label>${sel("f-priority",PRI)}</div><div class="f"><label for="f-assignee">Assign to</label>${sel("f-assignee",STAFF)}</div><div class="msg err" id="ferr" role="alert"></div><div class="row"><button type="button" class="btn s" id="fcancel">Cancel</button><button class="btn p" type="submit">${create?"Submit ticket":"Save"}</button></div></form>`);
  const v={title:"",description:"",category:CAT[0],priority:"Medium",assignee:"Unassigned",...values};
  Object.keys(v).forEach(k=>{const e=$("#f-"+k);if(e)e.value=v[k]});
  $("#fcancel").onclick=()=>drawer.close();
  $("#tform").onsubmit=e=>{e.preventDefault();const o={};["title","description","category","priority","assignee"].forEach(k=>o[k]=$("#f-"+k).value.trim());
    const err=validate(o);if(err)return $("#ferr").textContent=err;save(o)};
  $("#f-title").focus();
}
const validate=v=>v.title.length<3?"Title must be at least 3 characters.":!v.description?"Description is required.":"";
function detail(id){const t=find(id),closed=t.status==="Closed";
  openDrawer(`<h3>${t.id}: ${esc(t.title)}</h3><div>${chip(t.priority)} ${chip(t.status)}</div>
  <dl class="d"><dt>Category</dt><dd>${t.category}</dd><dt>Assignee</dt><dd>${esc(t.assignee)}</dd><dt>Created</dt><dd>${fmt(t.created)}</dd><dt>Description</dt><dd>${esc(t.description)}</dd></dl>
  <ul class="hist" aria-label="History">${t.history.map(([s,at])=>`<li><span>${s}</span><span>${fmt(at)}</span></li>`).join("")}</ul>
  ${closed?'<p class="mut" style="margin-top:12px">This ticket is closed and read-only.</p>':""}
  <div class="row"><button class="btn s" id="d-x">Close</button>${closed?"":'<button class="btn s" id="d-edit">Edit</button><button class="btn p" id="d-next">Move to '+nextOf(t)+"</button>"}</div>`);
  $("#d-x").onclick=()=>drawer.close();
  if(!closed){$("#d-edit").onclick=()=>editTicket(t);$("#d-next").onclick=()=>advance(t.id,true)}}
function advance(id,inDrawer){const t=find(id);if(!t||t.status==="Closed")return;const n=nextOf(t);t.status=n;t.history.push([n,new Date().toISOString()]);render();toast(`${t.id} moved to ${n}.`);if(inDrawer)detail(id)}
function editTicket(t){if(t.status==="Closed")return;formDrawer({title:"Edit "+t.id,values:t,save:o=>{Object.assign(t,o);render();toast(`${t.id} updated.`);detail(t.id)}})}
function createTicket(){formDrawer({title:"New ticket",create:1,save:o=>{const t={id:"TKT-"+String(seq++).padStart(3,"0"),...o,status:"Open",created:new Date().toISOString(),history:[["Open",new Date().toISOString()]]};
  tickets.push(t);drawer.close();render();show("tickets");toast(`${t.id} created.`)}})}
$("#new").onclick=createTicket;
function confirmBox(t,yes){$("#ctext").textContent=t;$("#cyes").onclick=()=>{$("#cdlg").close();yes()};$("#cdlg").showModal()}
$("#cno").onclick=()=>$("#cdlg").close();
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||drawer.contains(b))return;
  if(b.dataset.view)detail(b.dataset.view);
  if(b.dataset.adv)advance(b.dataset.adv);
  if(b.dataset.del){const t=find(b.dataset.del);if(t&&t.status==="Closed")confirmBox(`Delete ${t.id}?`,()=>{tickets=tickets.filter(x=>x!==t);render();toast(`${t.id} deleted.`)})}});
$("#mode").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;mode=b.dataset.m;document.querySelectorAll("#mode button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderTickets()});
$("#fp").addEventListener("change",renderTickets);
const names=["dash","tickets","reports"];
function show(v){names.forEach(n=>$("#v-"+n).hidden=n!==v);document.querySelectorAll("#menu button").forEach(b=>b.dataset.v===v?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current"));$("#toast").textContent=""}
document.querySelectorAll("#menu button").forEach(b=>b.onclick=()=>show(b.dataset.v));
$("#q").addEventListener("input",()=>{show("tickets");renderTickets()});
render();
