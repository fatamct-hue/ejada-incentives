
"use strict";
/* ============ ICONS ============ */
const IC={
home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
unit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V7l8-4 8 4v14M9 21v-5h6v5M8 10h.01M12 10h.01M16 10h.01M8 13h.01M16 13h.01"/></svg>',
form:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5"/></svg>',
dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
review:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M8.5 11l2 2 3.5-4"/></svg>',
money:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v.01M18 14.5v.01"/></svg>',
cycle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3M8 14l2.5 2.5L16 12"/></svg>',
report:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h10l4 4v14H5zM9 17v-3M12 17v-6M15 17v-4"/></svg>',
gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
/* track icons (custom) */
bs:'<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="22" width="30" height="11" rx="2" fill="#00253e"/><rect x="5" y="22" width="30" height="3" fill="#4ad6ed"/><circle cx="14" cy="13" r="4.5" fill="#0f446c"/><path d="M8 22c0-3.6 2.7-5.8 6-5.8s6 2.2 6 5.8" fill="#0f446c"/><circle cx="27" cy="12" r="4" fill="#00827a"/><path d="M22 22c0-3.3 2.2-5.4 5-5.4s5 2.1 5 5.4" fill="#00827a"/><path d="M17.5 11.5l2-1.5 2 1.5" stroke="#aa7f67" stroke-width="1.6" stroke-linecap="round"/></svg>',
inv:'<svg viewBox="0 0 40 40" fill="none"><path d="M20 5a10 10 0 0 0-6 18c1 .8 1.6 2 1.6 3.2V28h8.8v-1.8c0-1.3.6-2.4 1.6-3.2A10 10 0 0 0 20 5z" fill="#aa7f67"/><rect x="15.6" y="29.5" width="8.8" height="2.8" rx="1" fill="#00253e"/><rect x="17" y="33.6" width="6" height="2.4" rx="1" fill="#00253e"/><path d="M20 10v7l3.5 3" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M6 13h-3M37 13h-3M9 5.5L7 3.5M31 5.5l2-2" stroke="#e4c6ac" stroke-width="2" stroke-linecap="round"/></svg>',
mob:'<svg viewBox="0 0 40 40" fill="none"><path d="M8 34l8-8 5 5 11-13" stroke="#00827a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 18h5v5" stroke="#00827a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="10" r="4.5" fill="#00253e"/><path d="M6 22c0-4 3-6.5 7-6.5s7 2.5 7 6.5" fill="#00253e"/><path d="M28 6l1.2 2.6 2.8.3-2.1 1.9.6 2.8L28 12.1l-2.5 1.5.6-2.8L24 8.9l2.8-.3z" fill="#aa7f67"/></svg>',
/* small icons */
emp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
evid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12.5l-7.8 7.8a5 5 0 0 1-7-7L13 5.5a3.4 3.4 0 0 1 4.8 4.8L10 18.1a1.7 1.7 0 0 1-2.4-2.4l7-7"/></svg>',
eval:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.6l-5.3 2.7 1.1-5.9L3.4 9.3l6-.8z"/></svg>',
honor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-2.5 5 2.5-1.5-7M12 6v6M9 9h6"/></svg>',
warn:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 18H2zM12 10v5M12 18v.01"/></svg>',
};
/* ============ REFERENCE DATA ============ */
const TRACKS={
 bs:{desc:"ترسيخ ثقافة تقديم خدمات متميزة، بتكريم الموظف المتميز في التقسيمات التي تقدم خدمات مباشرة للمستفيدين، ربع سنوياً لضمان استمرار التحفيز.",appr:"المديرية العامة للتطوير والدراسات",name:"موظف خدمة المستفيدين",short:"خدمة المستفيدين",c:"#0f446c",cb:"#e1ecf6",period:"ربع سنوية",cycles:["Q1","Q2","Q3","Q4"],reward:"300 ر.ع لكل فائز",fixed:300},
 inv:{desc:"تعزيز ثقافة الابتكار والإبداع، بتكريم الموظفين الذين قدموا أفكاراً أو حلولاً جديدة تحسّن الأداء أو تطوّر الخدمات أو تخفّض التكاليف.",appr:"المديرية العامة للتطوير والدراسات",name:"الموظف المبتكر",short:"المبتكر",c:"#aa7f67",cb:"#ede4df",period:"نصف سنوية",cycles:["H1","H2"],reward:"500 / 400 / 300 ر.ع",prizes:{1:500,2:400,3:300}},
 mob:{desc:"تحفيز الموظفين على المبادرة وتنفيذ أعمال خارج مهامهم المعتادة تحقق نتائج إيجابية، وتطوير قدراتهم ومعارفهم.",appr:"المديرية العامة للشؤون الإدارية والمالية",name:"الموظف المبادر",short:"المبادر",c:"#00827a",cb:"#c2f2e4",period:"ربع سنوية (مخصص سنوي واحد)",cycles:["Q1","Q2","Q3","Q4"],reward:"يحدده المسؤول الأعلى ضمن الرصيد"}
};
const CYC={Q1:"الربع الأول",Q2:"الربع الثاني",Q3:"الربع الثالث",Q4:"الربع الرابع",H1:"النصف الأول",H2:"النصف الثاني"};
const ST=[["draft","مسودة"],["sent","مرسل"],["needs_info","يحتاج استكمال"],["review","قيد المراجعة"],["recommended","موصى به"],["approved","معتمد"],["to_pay","أُحيل للصرف"],["paid","صُرف"],["honored","تم التكريم"]];
const STN=Object.fromEntries(ST);
const APPROVED_SET=new Set(["approved","to_pay","paid","honored"]);
const SB_URL="https://faqgbpckewxnpazszqeo.supabase.co";
const SB_KEY="sb_publishable_GPZxXpielROB33EcIG0GJg_rgDt-a1I";
const INV_TOTAL=2400, RATE=15;
const S={year:new Date().getFullYear(),years:{},units:[],noms:[],role:{type:null,unitId:null},me:null,pubVersions:[],employees:[],users:[]};
function yearCfg(y){return S.years[y]||{approvedTotal:0,refDate:"",closingConfirmed:"",cycles:{}}}
function cycOf(y,c){return (yearCfg(y).cycles||{})[c]||{close:"",open:false}}
function today(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function unit(id){return S.units.find(u=>u.id===id)||{id,name:id||"—",short:id||"—",outlets:[],employees:0}}
function bsEligible(u){return !!u&&u.active!==false&&(u.type==="regional"||u.type==="customer"||u.bs===true)}
function evName(e){return typeof e==="string"?e:(e&&e.name)||"ملف"}

/* ============ DATA LAYER (Supabase) ============ */
function errMsg(e){const m=(e&&(e.message||e.error_description||e.msg))||String(e);
 if(/Invalid login credentials/i.test(m))return "البريد أو كلمة المرور غير صحيحة";
 if(/already registered|already exists/i.test(m))return "البريد مسجل مسبقاً، استخدم تسجيل الدخول";
 if(/Password should be at least/i.test(m))return "كلمة المرور قصيرة (6 أحرف على الأقل)";
 if(/Failed to fetch|NetworkError/i.test(m))return "تعذّر الاتصال بالخادم، تحقق من الإنترنت";
 if(/row-level security/i.test(m))return "لا تملك صلاحية هذا الإجراء";
 return m.replace(/^.*?ERROR:\s*/,"")}
function makeApi(){
 const sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
 const chk=({data,error})=>{if(error)throw error;return data};
 return {
  async session(){return chk(await sb.auth.getSession()).session},
  async signIn(email,password){return chk(await sb.auth.signInWithPassword({email,password}))},
  async signUp(email,password){return chk(await sb.auth.signUp({email,password}))},
  async signOut(){await sb.auth.signOut()},
  async setPassword(password){return chk(await sb.auth.updateUser({password}))},
  async claim(code){return chk(await sb.rpc("claim_invite",{p_code:code}))},
  async loadAll(){
   const uid=(await this.session())?.user?.id;
   const me=chk(await sb.from("app_users").select("*").eq("user_id",uid).maybeSingle());
   if(!me)return {me:null};
   const [units,years,cycles,noms,emps,pubs]=await Promise.all([
    sb.from("units").select("*").order("id"),sb.from("years").select("*"),sb.from("cycles").select("*"),
    sb.from("nominations").select("*").order("created_at",{ascending:false}),
    sb.from("employees").select("*"),sb.from("pub_versions").select("*")]).then(rs=>rs.map(chk));
   const users=me.role==="central"?chk(await sb.from("app_users").select("*").order("created_at")):[];
   return {me,units,years,cycles,noms,emps,pubs,users};
  },
  async insertNom(row){return chk(await sb.from("nominations").insert(row).select("id").single()).id},
  async updateNom(id,patch){chk(await sb.from("nominations").update(patch).eq("id",id))},
  async deleteNom(id){chk(await sb.from("nominations").delete().eq("id",id))},
  async submit(id){chk(await sb.rpc("submit_nomination",{p_id:id}))},
  async transition(id,to,note,date){chk(await sb.rpc("transition",{p_id:id,p_to:to,p_note:note||null,p_date:date||null}))},
  async addInv(a){return chk(await sb.rpc("add_inv_result",a))},
  async upload(path,file){chk(await sb.storage.from("evidence").upload(path,file,{upsert:false,contentType:file.type||undefined}));return path},
  async signedUrl(path){return chk(await sb.storage.from("evidence").createSignedUrl(path,300)).signedUrl},
  async audit(id){return chk(await sb.from("audit_log").select("*").eq("nomination_id",id).order("at"))},
  async updateUnit(id,patch){chk(await sb.from("units").update(patch).eq("id",id))},
  async addUnit(row){chk(await sb.from("units").insert(row))},
  async upsertYear(row){chk(await sb.from("years").upsert(row))},
  async upsertCycle(row){chk(await sb.from("cycles").upsert(row))},
  async addUser(row){return chk(await sb.from("app_users").insert(row).select("*").single())},
  async deleteUser(id){chk(await sb.from("app_users").delete().eq("id",id))},
  async upsertEmployees(rows){chk(await sb.from("employees").upsert(rows))},
  async addPub(row){chk(await sb.from("pub_versions").insert(row))}
 };
}
let api=null;
function mapNom(r){return {id:r.id,year:r.year,track:r.track,cycle:r.cycle,unitId:r.unit_id,status:r.status,amount:+r.amount||0,
 emp:{name:r.emp_name||"",empNo:r.emp_no||"",title:r.emp_title||"",outlet:r.outlet||""},dept:r.dept||"",scores:r.scores||[],scoreEv:r.score_ev||[],
 justification:r.justification||"",supervisor:r.supervisor||"",initiative:r.initiative||"",execDate:r.exec_date||"",benef:r.benef||"",proposed:r.proposed==null?0:+r.proposed,
 place:r.place,kind:r.kind,idea:r.idea,nbRef:r.nb_ref,members:r.members||[],approvalDate:r.approval_date,evidence:r.evidence||[],returnReason:r.return_reason||"",
 preparedBy:r.prepared_by||"",approvedBy:r.approved_by||"",paidAt:r.paid_at||"",honoredAt:r.honored_at||"",demo:r.demo,createdAt:r.created_at}}
async function reload(){
 const d=await api.loadAll();S.me=d.me;if(!d.me)return;
 S.role={type:d.me.role,unitId:d.me.unit_id};
 S.units=d.units.map(u=>({id:u.id,name:u.name,short:u.short,type:u.type,gov:u.gov||"",parent:u.parent_id||"",inParent:u.in_parent,bs:u.bs,employees:u.employees||0,outlets:u.outlets||[],active:u.active!==false}));
 S.years={};d.years.forEach(y=>S.years[y.year]={approvedTotal:y.approved_total||0,refDate:y.ref_date||"",closingConfirmed:y.closing_confirmed||"",cycles:{}});
 d.cycles.forEach(c=>{if(S.years[c.year])S.years[c.year].cycles[c.code]={close:c.close_date||"",open:!!c.open}});
 if(!S.years[S.year]){const ys=Object.keys(S.years).map(Number).sort();if(ys.length)S.year=ys[ys.length-1]}
 S.noms=d.noms.map(mapNom);
 S.employees=d.emps.map(e=>({empNo:e.emp_no,name:e.name,title:e.title||"",unitId:e.unit_id}));
 S.pubVersions=d.pubs.map(p=>({year:p.year,track:p.track||"",cycle:p.cycle||"",by:p.by_name,at:(p.at||"").slice(0,10),count:p.count}));
 S.users=d.users.map(x=>({id:x.id,name:x.name,email:x.email||"",role:x.role,unitId:x.unit_id||"",inviteCode:x.invite_code,claimed:!!x.user_id}));
 const ys=Object.keys(S.years).sort();$("#yearSel").innerHTML=ys.map(y=>`<option ${+y===S.year?"selected":""}>${y}</option>`).join("");
}
let BUSY=false;
async function run(fn,okMsg){if(BUSY)return;BUSY=true;document.body.classList.add("busy");
 try{await fn();if(okMsg)toast(okMsg);return true}catch(e){toast(errMsg(e));return false}finally{BUSY=false;document.body.classList.remove("busy")}}


const CRIT={
 bs:[{m:"جودة وكفاءة تقديم الخدمة",w:30,subs:["دقة إنجاز المعاملات واكتمالها، وخلوها من الأخطاء","الإلمام الشامل بأنظمة وإجراءات العمل المحدثة","القدرة على تقديم حلول مرنة وبدائل مناسبة تسعد المستفيدين"]},
  {m:"اللباقة وحسن التعامل",w:30,subs:["الاستقبال الإيجابي والترحيب بالمستفيدين باهتمام","القدرة على احتواء المواقف والتعامل مع الملاحظات بهدوء ورقي","الوضوح والشفافية والأسلوب الإيجابي في الرد على الاستفسارات"]},
  {m:"سرعة الإنجاز",w:20,subs:["إنجاز المعاملات ضمن الإطار الزمني المعتمد للخدمة","الاستجابة الفورية والتعامل السريع مع الحالات العاجلة"]},
  {m:"المهنية والاحترافية",w:20,subs:["الالتزام التام بأوقات العمل والمظهر الوظيفي اللائق","روح المبادرة، والتعاون الفعال، ونشر الإيجابية بين زملاء العمل"]}],
 mob:[{m:"الإنجاز خارج نطاق المهام المعتادة",w:30,subs:["إنجاز أعمال أو مهام إضافية خارج الوصف الوظيفي","المبادرة الذاتية دون تكليف مباشر","الالتزام بتنفيذ المبادرة ومتابعتها حتى اكتمالها"]},
  {m:"حل المشكلات والتحسين",w:30,subs:["تحديد مشكلة أو فرصة تحسين بوضوح","تقديم حل عملي قابل للتطبيق","تحسين الأداء أو تقليل الوقت أو التكلفة بشكل ملموس"]},
  {m:"العمل الجماعي ونقل المعرفة",w:20,subs:["المشاركة الفعالة في الفرق واللجان","التعلم الذاتي ونقل المعرفة للزملاء"]},
  {m:"الأثر",w:20,subs:["أثر ملموس وقابل للقياس على العمل أو المستفيدين","استدامة الأثر أو قابلية تعميم المبادرة"]}]
};
const NSUB=10;
function total(n){return (n.scores||[]).reduce((a,v)=>a+(+v||0),0)}
/* ============ STATE ============ */
/* ============ CALCULATIONS ============ */
function yNoms(){return S.noms.filter(n=>n.year===S.year)}
function participating(){return S.units.filter(u=>!u.inParent&&u.active!==false)}
function bsUnitsCount(){return S.units.filter(bsEligible).length}
function budget(){
 const cfg=yearCfg(S.year);const total=cfg.approvedTotal*RATE;const bsT=bsUnitsCount()*4*300;
 const mob=Math.max(0,total-bsT-INV_TOTAL);const units=participating();
 const empSum=units.reduce((a,u)=>a+(+u.employees||0),0);const alloc={};
 units.forEach(u=>alloc[u.id]=empSum?Math.round(mob*u.employees/empSum*1000)/1000:0);
 return {total,mob,bsT,empSum,approvedTotal:cfg.approvedTotal,perEmp:empSum?mob/empSum:0,alloc,diff:empSum-cfg.approvedTotal};
}


function unitMoney(uid){
 const b=budget();const ns=yNoms().filter(n=>n.track==="mob"&&n.unitId===uid);
 const byQ={Q1:0,Q2:0,Q3:0,Q4:0};let paid=0,committed=0,pending=0;
 ns.forEach(n=>{
  if(APPROVED_SET.has(n.status)){byQ[n.cycle]+=n.amount;if(n.status==="paid"||n.status==="honored")paid+=n.amount;else committed+=n.amount}
  else if(["sent","review","recommended"].includes(n.status))pending+=(n.proposed||0);
 });
 const approved=byQ.Q1+byQ.Q2+byQ.Q3+byQ.Q4;
 return {alloc:b.alloc[uid]||0,byQ,approved,paid,committed,pending,balance:(b.alloc[uid]||0)-approved};
}
function conflicts(){
 const map={};
 yNoms().filter(n=>n.track!=="inv"||true).forEach(n=>{
  const ids=n.track==="inv"?(n.members||[]).map(m=>m.empNo):[n.emp.empNo];
  ids.forEach(e=>{if(!e)return;(map[e]=map[e]||[]).push(n)});
 });
 const out=[];
 Object.entries(map).forEach(([e,list])=>{
  const tracks=new Set(list.map(n=>n.track));
  if(tracks.size>1){
   const appr=new Set(list.filter(n=>APPROVED_SET.has(n.status)).map(n=>n.track));
   out.push({empNo:e,list,severe:appr.size>1});
  }
 });
 return out;
}
function approvedInOtherTrack(n){
 const ids=n.track==="inv"?(n.members||[]).map(m=>m.empNo):[n.emp.empNo];
 return yNoms().find(x=>x.id!==n.id&&x.track!==n.track&&APPROVED_SET.has(x.status)&&(x.track==="inv"?(x.members||[]).some(m=>ids.includes(m.empNo)):ids.includes(x.emp.empNo)));
}
function bsWinner(uid,cyc,except){return yNoms().find(n=>n.track==="bs"&&n.unitId===uid&&n.cycle===cyc&&APPROVED_SET.has(n.status)&&n.id!==except)}
function alerts(){
 const a=[];const ns=yNoms();
 // second BS winner (data integrity)
 S.units.filter(bsEligible).forEach(u=>["Q1","Q2","Q3","Q4"].forEach(q=>{
  const w=ns.filter(n=>n.track==="bs"&&n.unitId===u.id&&n.cycle===q&&APPROVED_SET.has(n.status));
  if(w.length>1)a.push({lvl:"r",t:"فائز ثانٍ لخدمة المستفيدين",d:u.short+" — "+CYC[q]});
 }));
 conflicts().forEach(c=>a.push({lvl:c.severe?"r":"w",t:c.severe?"موظف معتمد في مسارين":"موظف مرشح في أكثر من مسار",d:c.list[0].emp.name+" ("+c.empNo+"): "+c.list.map(n=>TRACKS[n.track].short+" "+CYC[n.cycle]+" — "+STN[n.status]).join("، ")+" — يحسمه الفريق المركزي",go:"review"}));
 participating().forEach(u=>{const m=unitMoney(u.id);if(m.balance<0)a.push({lvl:"r",t:"تجاوز مالي",d:u.short+": المعتمد "+fm(m.approved)+" يتجاوز المخصص "+fm(m.alloc)})});
 const cur=currentQ();
 S.units.filter(bsEligible).forEach(u=>{if(!ns.some(n=>n.track==="bs"&&n.unitId===u.id&&n.cycle===cur&&n.status!=="draft"))a.push({lvl:"w",t:"جهة لم ترسل",d:u.short+" — خدمة المستفيدين "+CYC[cur]})});
 const ni=ns.filter(n=>n.status==="needs_info");if(ni.length)a.push({lvl:"w",t:"ترشيحات ناقصة",d:ni.length+" ترشيح أُعيد للاستكمال ولم يُستكمل بعد",go:"review"});
 const b=budget();if(b.diff!==0)a.push({lvl:"w",t:"اختلاف أعداد الموظفين",d:"مجموع التقسيمات المشمولة "+b.empSum+" ≠ العدد المعتمد للحساب "+b.approvedTotal,go:"settings"});
 return a;
}
/* ============ HELPERS ============ */
const $=s=>document.querySelector(s);
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function fm(n){return (Math.round(n*1000)/1000).toLocaleString("en-US",{maximumFractionDigits:3})+" ر.ع"}
function fn(n){return Number(n).toLocaleString("en-US")}
function pill(s){return `<span class="pill st-${s}">${STN[s]}</span>`}
function tk(t){return `<span class="tk"><i style="background:${TRACKS[t].c}"></i>${TRACKS[t].short}</span>`}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),2600)}
function modal(html){$("#mbox").innerHTML=html;$("#mdl").classList.add("on")}
function closeModal(){$("#mdl").classList.remove("on")}
$("#mdl").addEventListener("click",e=>{if(e.target.id==="mdl")closeModal()});
function approverOf(t){return t==="mob"?"adm":"dev"}
const APPROVER_NAME={adm:"المديرية العامة للشؤون الإدارية والمالية",dev:"المديرية العامة للتطوير والدراسات"};
const ROLE_NAMES={central:"فريق الإجادة المؤسسية",dev:"م.ع للتطوير والدراسات",adm:"م.ع للشؤون الإدارية والمالية",dg:"مدير عام / مسؤول أعلى"};
function who(){const r=S.role;if(!S.me)return "";if(r.type==="dg")return "المدير العام — "+unit(r.unitId).short;return ROLE_NAMES[r.type]}
function currentQ(){const d=new Date();if(S.year<d.getFullYear())return "Q4";return "Q"+(Math.floor(d.getMonth()/3)+1)}


function countUp(root){root.querySelectorAll("[data-count]").forEach(el=>{const t=+el.dataset.count;const suf=el.dataset.suf||"";let s=null;const step=ts=>{if(!s)s=ts;const p=Math.min(1,(ts-s)/600);el.textContent=fn(Math.round(t*(1-Math.pow(1-p,3))))+suf;if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}

/* ============ CHARTS (SVG) ============ */
function niceStep(m){const r=m/4;const p=Math.pow(10,Math.floor(Math.log10(r||1)));const f=r/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p}
function barChart(cats,series,{h=220,stack=false}={}){
 const W=600,pad={l:12,r:44,t:20,b:44};const iw=W-pad.l-pad.r,ih=h-pad.t-pad.b;
 const max=Math.max(1,...cats.map((_,i)=>stack?series.reduce((a,s)=>a+s.v[i],0):Math.max(...series.map(s=>s.v[i]))));
 const step=Math.max(1,niceStep(max));const nice=step*Math.ceil(max/step);const gw=iw/cats.length;const bw=stack?Math.min(46,gw*.55):Math.min(26,gw*.7/series.length);
 let g="";for(let k=0;k*step<=nice+1e-9;k++){const y=pad.t+ih-ih*k*step/nice;g+=`<line x1="${pad.l}" x2="${W-pad.r}" y1="${y}" y2="${y}" stroke="#e8e5de"/><text x="${W-pad.r+8}" y="${y+4}" font-size="11" text-anchor="start" fill="#5d7383">${fn(k*step)}</text>`}
 cats.forEach((c,i)=>{const cx=W-pad.r-gw*i-gw/2;let acc=0;
  series.forEach((s,j)=>{const v=s.v[i];const bh=ih*v/nice;let x,y;
   if(stack){x=cx-bw/2;y=pad.t+ih-acc-bh;acc+=bh}else{x=cx+bw*series.length/2-(j+1)*bw;y=pad.t+ih-bh}
   g+=`<rect x="${x+1}" y="${y}" width="${bw-2}" height="${Math.max(0,bh)}" rx="3" fill="${s.c}"><title>${esc(s.n)}: ${fn(v)}</title></rect>`;
   if(!stack&&v)g+=`<text x="${x+bw/2}" y="${y-4}" font-size="10.5" text-anchor="middle" fill="#00253e">${fn(v)}</text>`});
  if(stack){const tot=series.reduce((a,s)=>a+s.v[i],0);if(tot)g+=`<text x="${cx}" y="${pad.t+ih-acc-5}" font-size="11" text-anchor="middle" font-weight="700" fill="#00253e">${fn(tot)}</text>`}
  g+=`<text x="${cx}" y="${h-pad.b+16}" font-size="11.5" text-anchor="middle" fill="#00253e">${esc(c)}</text>`});
 return `<div class="chart"><svg viewBox="0 0 ${W} ${h}" role="img">${g}</svg><div class="legend">${series.map(s=>`<span><i style="background:${s.c}"></i>${esc(s.n)}</span>`).join("")}</div></div>`;
}
function hbars(rows,{c="#00827a"}={}){
 const max=Math.max(1,...rows.map(r=>r[1]));
 return rows.map(r=>`<div style="display:grid;grid-template-columns:120px 1fr 64px;gap:8px;align-items:center;font-size:13px;margin:5px 0"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r[0])}</span><div class="bar" style="height:12px"><i style="width:${r[1]/max*100}%;background:${r[2]||c}"></i></div><span class="num" style="text-align:left">${r[3]||fn(r[1])}</span></div>`).join("");
}

/* ============ ROLES & NAV ============ */
const ROUTES={
 home:["الرئيسية","home"],unit:["لوحة التقسيم","unit"],bsform:["استمارة خدمة المستفيدين","form"],mobform:["استمارة الموظف المبادر","form"],
 inv:["نتائج المبتكر (نبتكر)","bulb"],dash:["الداشبورد المركزي","dash"],review:["المراجعة والإشراف","review"],budget:["الميزانية والمخصصات","money"],
 cycles:["الدورات وإقفال ديسمبر","cycle"],reports:["القوائم والتقارير والنشر","report"],settings:["الإعدادات","gear"]
};
const SHORT={home:"الرئيسية",unit:"تقسيمي",bsform:"خدمة المستفيدين",mobform:"المبادر",inv:"المبتكر",dash:"الداشبورد",review:"المراجعة",budget:"الميزانية",cycles:"الدورات",reports:"التقارير",settings:"الإعدادات"};
function allowed(){
 const t=S.role.type;
 if(t==="dg"){const u=unit(S.role.unitId);return ["home","unit"].concat(bsEligible(u)?["bsform"]:[],["mobform"])}
 if(t==="adm")return ["home","dash","review","budget","reports"];
 if(t==="dev")return ["home","dash","review","inv","reports"];
 if(t==="central")return ["home","dash","review","inv","budget","cycles","reports","settings"];
 return ["home"];
}
function buildUser(){$("#userBox").innerHTML=S.me?`<div style="font-weight:600">${esc(S.me.name)}</div><div class="small" style="color:#afc5d3">${esc(who())}</div><div class="flt" style="margin-top:8px"><button class="btn o s" style="background:transparent;color:#fff" onclick="doRefresh()">تحديث</button><button class="btn o s" style="background:transparent;color:#fff" onclick="logout()">خروج</button></div>`:""}
async function doRefresh(){await run(reload,"تم التحديث");render()}
async function logout(){await api.signOut();location.hash="";location.reload()}


function buildNav(){
 const r=cur();const al=allowed();
 $("#nav").innerHTML=al.map(k=>`<a href="#${k}" class="${k===r?"on":""}">${IC[ROUTES[k][1]]}<span>${ROUTES[k][0]}</span></a>`).join("");
 const bn=al.slice(0,5);$("#bnav").innerHTML=bn.map(k=>`<a href="#${k}" class="${k===r?"on":""}">${IC[ROUTES[k][1]]}<span>${SHORT[k]}</span></a>`).join("");
}
function cur(){const h=(location.hash||"#home").slice(1);const k=h.split("-")[0];return allowed().includes(k)?k:"home"}

/* ============ VIEWS ============ */
const V={};
V.home=()=>{
 const t=S.role.type;const u=S.role.unitId&&unit(S.role.unitId);
 const ns=yNoms();let todo=[];
 if(u){const mine=ns.filter(n=>n.unitId===u.id);
  if(bsEligible(u)&&!mine.some(n=>n.track==="bs"&&n.cycle==="Q4"&&n.status!=="draft"))todo.push(["!","ترشيح خدمة المستفيدين للربع الرابع لم يُرسل بعد","bsform"]);

  const ni=mine.filter(n=>n.status==="needs_info").length;if(ni)todo.push([ni,"ترشيح أُعيد للاستكمال","unit"]);
  const m=unitMoney(u.id);todo.push([fn(m.balance),"ريال رصيد المبادر المتبقي لهذه السنة","mobform"]);
 }else if(t==="adm"||t==="dev"){const mine=ns.filter(n=>approverOf(n.track)===t);todo.push([mine.filter(n=>n.status==="recommended").length,"ترشيح موصى به بانتظار اعتمادك","review"]);if(t==="adm")todo.push([ns.filter(n=>["approved","to_pay"].includes(n.status)).length,"معتمد بانتظار الإحالة أو تسجيل الصرف","review"])}else if(false){todo.push([ns.filter(n=>n.status==="sent").length,"ترشيح مرسل بانتظار الاستلام","review"]);todo.push([ns.filter(n=>n.status==="review").length,"قيد المراجعة","review"]);todo.push([ns.filter(n=>n.status==="approved").length,"معتمد بانتظار الإحالة للصرف","review"])}
 else{todo.push([ns.filter(n=>n.status==="recommended").length,"ترشيح موصى به بانتظار الاعتماد","review"]);todo.push([alerts().length,"تنبيه نشط","dash"]);todo.push([ns.filter(n=>n.status==="paid").length,"صُرف ولم يُسجّل تكريمه بعد","reports"])}
 const steps=["تعبئة الاستمارة واعتمادها من المدير العام","مراجعة فريق الإجادة المؤسسية","الاعتماد من الجهة المختصة","الإحالة للصرف","الصرف","التكريم"];
 return `
 <div class="hero fadein"><div>
  <span class="pill" style="background:rgba(74,214,237,.18);color:#4ad6ed">دورة ${S.year}</span>
  <h2 style="margin-top:10px">منصة حوافز الإجادة المؤسسية</h2>
  <p>ثلاثة مسارات لتقدير الموظفين: خدمة المستفيدين، والمبتكر، والمبادر. تُعبّأ الترشيحات من الجهات، وتُراجَع وتُعتمد مركزياً، وتُتابع حتى الصرف والتكريم.</p>
  <div class="acts">${u?(bsEligible(u)?`<a class="btn c" href="#bsform">ترشيح خدمة المستفيدين</a>`:"")+`<a class="btn c" href="#mobform">ترشيح موظف مبادر</a><a class="btn o" href="#unit">لوحة تقسيمي</a>`:`<a class="btn c" href="#dash">الداشبورد</a><a class="btn o" href="#review">المراجعة</a>`}</div>
 </div><div class="fig">${["bs","inv","mob"].map(k=>`<div class="hic">${IC[k]}</div>`).join("")}</div></div>
 <div class="sec"><h2>المطلوب منك الآن</h2><span class="muted small">${esc(who())}</span></div>
 <div class="card">${todo.map(x=>`<a class="todo" href="#${x[2]}" style="text-decoration:none;color:inherit"><span class="n num" style="color:var(--teal)">${x[0]}</span><span style="flex:1">${x[1]}</span><span class="muted">←</span></a>`).join("")}</div>
 <div class="sec"><h2>مسارات الحوافز</h2></div>
 <div class="grid g3">${Object.entries(TRACKS).map(([k,T])=>`<div class="card trk fadein" style="--c:${T.c};--cb:${T.cb}"><div style="display:flex;gap:12px;align-items:center"><div class="ic">${IC[k]}</div><h3 style="font-size:18px">${T.name}</h3></div>
  <p style="margin:0;font-size:14px">${T.desc}</p><dl><dt>جهة الاعتماد</dt><dd>${T.appr}</dd><dt>الدورية</dt><dd>${T.period}</dd><dt>المكافأة</dt><dd>${T.reward}</dd><dt>الجهات</dt><dd>${k==="bs"?"11 مديرية إقليمية، ودائرة خدمة المراجعين، ومركز الاتصال وتجاوب، والدعم الفني بنظم المعلومات الجغرافية":k==="inv"?"جميع الموظفين عبر منصة «نبتكر»":"جميع التقسيمات المشمولة"}</dd>
  <dt>العدد</dt><dd>${k==="bs"?"14 فائزاً في الربع · 56 في السنة":k==="inv"?"3 فائزين لكل نصف · 6 في السنة":"يحدده المسؤول الأعلى"}</dd><dt>المخصص</dt><dd>${k==="bs"?"16,800 ر.ع سنوياً":k==="inv"?"2,400 ر.ع سنوياً":"حسب عدد موظفي التقسيم"}</dd></dl>
  <p class="small muted" style="margin:0">${k==="bs"?"جائزة واحدة لكل مديرية في كل ربع؛ ويُذكر المنفذ للتحليل فقط.":k==="inv"?"تُقيَّم الأفكار في «نبتكر»، والمنصة تستقبل النتائج المعتمدة فقط.":"مخصص سنوي واحد يغطي الأرباع الأربعة، ولا يُقسَّم تلقائياً."}</p></div>`).join("")}</div>
 <div class="sec"><h2>مراحل الترشيح والاعتماد</h2></div>
 <div class="card"><div class="steps">${steps.map((s,i)=>`<div class="step"><div class="dot">${i+1}</div>${s}</div>`).join("")}</div>
 <p class="small muted" style="margin:14px 0 0">يجوز ترشيح الموظف في أكثر من مسار، ولا يُكرَّم إلا في مسار واحد خلال السنة.</p></div>

 `;
};
V.unit=()=>{
 const u=unit(S.role.unitId);const ns=yNoms().filter(n=>n.unitId===u.id);const m=unitMoney(u.id);const isDG=S.role.type==="dg";
 const cnt=k=>ns.filter(k).length;
 const k=[["المسودات",cnt(n=>n.status==="draft")],["المرسلة",cnt(n=>["sent","review","recommended"].includes(n.status))],["المعادة للاستكمال",cnt(n=>n.status==="needs_info")],["المعتمدة",cnt(n=>APPROVED_SET.has(n.status))]];
 const cyc=["Q1","Q2","Q3","Q4"].map(q=>{const bs=ns.filter(n=>n.track==="bs"&&n.cycle===q);const mb=ns.filter(n=>n.track==="mob"&&n.cycle===q);const st=cycOf(S.year,q);
  return `<tr><td data-l="الدورة"><b>${CYC[q]}</b><div class="small muted">إقفال ${st.close}</div></td>${bsEligible(u)?`<td data-l="خدمة المستفيدين">${bs.length?bs.map(n=>pill(n.status)).join(" "):'<span class="muted small">لا يوجد</span>'}</td>`:""}<td data-l="المبادر">${mb.length?mb.map(n=>pill(n.status)).join(" "):'<span class="muted small">لا يوجد</span>'}</td><td data-l="المعتمد للمبادر" class="num">${fm(m.byQ[q])}</td></tr>`}).join("");
 return `<div class="card fadein" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div class="trk" style="border:0"><div class="ic" style="background:var(--teal-b)">${IC.unit.replace('stroke="currentColor"','stroke="#006452"')}</div></div><div style="flex:1;min-width:200px"><h2 style="font-size:20px">${esc(u.name)}</h2><div class="small muted">${u.type==="regional"?"مديرية إقليمية — محافظة "+u.gov+" · مشمولة بخدمة المستفيدين والمبادر":u.type==="customer"?"دائرة خدمة المراجعين — جائزة واحدة لخدمة المستفيدين في كل ربع":(u.bs?"مشمولة بخدمة المستفيدين ("+u.outlets.join("، ")+") والمبادر":"مشمولة بمسار المبادر فقط")} · ${fn(u.employees)} موظفاً</div></div>
 <div class="flt">${bsEligible(u)?`<a class="btn" href="#bsform">ترشيح خدمة المستفيدين</a>`:""}<a class="btn t" href="#mobform">ترشيح مبادر</a></div></div>
 <div class="grid g4 k" style="margin-top:14px">${k.map(x=>`<div class="card kpi"><span class="l">${x[0]}</span><span class="v num" data-count="${x[1]}">0</span></div>`).join("")}</div>
 ${bsEligible(u)?`<div class="sec"><h2>جوائز خدمة المستفيدين</h2><span class="sp"></span><span class="small muted">جائزة واحدة في كل ربع · 300 ر.ع</span></div>
 <div class="grid g4 k">${["Q1","Q2","Q3","Q4"].map(q=>{const w=bsWinner(u.id,q);const p=ns.filter(n=>n.track==="bs"&&n.cycle===q&&!APPROVED_SET.has(n.status)&&n.status!=="draft");return `<div class="card kpi"><span class="l">${CYC[q]}</span>${w?`<b style="font-size:15px">${esc(w.emp.name)}</b><span class="num" style="font-weight:900;font-size:20px">${fm(300)}</span>${pill(w.status)}`:p.length?`<span class="s">قيد المراجعة</span>`:`<span class="s">لا يوجد فائز معتمد</span>`}</div>`}).join("")}</div>
 <div class="small muted" style="margin-top:6px">المستحق المعتمد: ${fm(["Q1","Q2","Q3","Q4"].filter(q=>bsWinner(u.id,q)).length*300)}</div>`:""}
 <div class="sec"><h2>مخصص المبادر السنوي</h2><span class="sp"></span><span class="small muted">مبلغ واحد للسنة يغطي الأرباع الأربعة</span></div>
 <div class="card"><div class="grid g4 k">${[["المخصص السنوي",m.alloc],["المعتمد",m.approved],["المصروف فعلياً",m.paid],["الرصيد المتبقي",m.balance]].map(x=>`<div class="kpi"><span class="l">${x[0]}</span><span class="v num" style="font-size:22px${x[0]==="الرصيد المتبقي"&&x[1]<0?";color:var(--danger)":""}">${fm(x[1])}</span></div>`).join("")}</div>
 <div class="bar" style="margin-top:12px;height:12px"><i style="width:${Math.min(100,m.alloc?m.approved/m.alloc*100:0)}%"></i></div><div class="small muted" style="margin-top:6px">التزامات معتمدة لم تُصرف: ${fm(m.committed)} · ترشيحات قيد المراجعة بمبالغ مقترحة: ${fm(m.pending)}</div></div>
 <div class="sec"><h2>دورات السنة</h2></div>
 <div class="card tw"><table class="rtable"><thead><tr><th>الدورة</th>${bsEligible(u)?"<th>خدمة المستفيدين</th>":""}<th>المبادر</th><th>المعتمد للمبادر</th></tr></thead><tbody>${cyc}</tbody></table></div>
 <div class="sec"><h2>ترشيحات التقسيم</h2><span class="sp"></span><span class="small muted">لا تظهر هنا بيانات أي تقسيم آخر</span></div>
 ${nomTable(ns,{unitView:true,isDG})}`;
};
function nomTable(ns,{unitView=false,isDG=false,actions=false,compact=false}={}){
 if(compact){if(!ns.length)return `<div class="card empty">لا توجد ترشيحات</div>`;return `<div class="card tw"><table class="rtable"><thead><tr><th>الموظف</th><th>الجهة</th><th>المسار</th><th>الدورة</th><th></th></tr></thead><tbody>${ns.map(n=>`<tr><td data-l="الموظف"><b>${esc(n.emp.name)}</b></td><td data-l="الجهة" class="small">${esc(unit(n.unitId).short)}</td><td data-l="المسار">${tk(n.track)}</td><td data-l="الدورة">${CYC[n.cycle]}</td><td><button class="btn s" onclick="openNom('${n.id}')">فتح</button></td></tr>`).join("")}</tbody></table></div>`}
 if(!ns.length)return `<div class="card empty">لا توجد سجلات مطابقة</div>`;
 return `<div class="card tw"><table class="rtable"><thead><tr><th>الموظف</th><th>المسار</th><th>الدورة</th>${unitView?"":"<th>الجهة</th>"}<th>الحالة</th><th>المبلغ</th><th>المُعد / المعتمِد</th><th></th></tr></thead><tbody>
 ${ns.map(n=>`<tr><td data-l="الموظف"><b>${esc(n.emp.name)}</b>${n.legacy?'<span class="tag">نتيجة سابقة</span>':""}<div class="small muted num">${esc(n.emp.empNo)}${n.emp.outlet?" · "+esc(n.emp.outlet):""}</div></td><td data-l="المسار">${tk(n.track)}</td><td data-l="الدورة">${CYC[n.cycle]}${n.place?" · المركز "+n.place:""}</td>${unitView?"":`<td data-l="الجهة" class="small">${esc(unit(n.unitId).short)}</td>`}
 <td data-l="الحالة">${pill(n.status)}</td><td data-l="المبلغ" class="num">${n.amount?fm(n.amount):n.proposed?'<span class="muted">مقترح '+fm(n.proposed)+'</span>':"—"}</td>
 <td data-l="المعتمِد" class="small">${esc(n.preparedBy||"—")}<br><span class="muted">${esc(n.approvedBy||"")}</span></td><td><button class="btn o s" onclick="openNom('${n.id}')">عرض</button></td></tr>`).join("")}</tbody></table></div>`;
}

/* ---- Forms ---- */
let editId=null;
V.bsform=()=>formBS();V.mobform=()=>formMOB();
function unitHeader(u){return `<div class="f"><label>التقسيم التنظيمي</label><input readonly value="${esc(u.name)}"><span class="hint">يُحدَّد تلقائياً من حساب الدخول</span></div>`}
function evidenceField(n){return `<div class="f w"><label>الشواهد والمرفقات <span class="req">*</span></label><input type="file" multiple id="fEv" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"><span class="hint">PDF أو صورة أو مستند (حتى 10 ميجابايت للملف)</span><div id="evList">${(n&&n.evidence||[]).map(e=>`<span class="chip">${IC.evid.replace('<svg','<svg width="14"')}${esc(evName(e))}</span>`).join("")}</div></div>`}


function formActions(){return `<div class="fs" style="border:0"></div><div class="flt" style="grid-column:1/-1"><button class="btn o" onclick="saveForm('draft')">حفظ كمسودة</button><button class="btn t" onclick="saveForm('send')">اعتماد وإرسال</button><span class="small muted">يُسجَّل اعتمادك باسمك وتاريخه عند الإرسال</span></div>`}
function critTable(t,n){
 const sc=n&&n.scores||[];const ev=n&&n.scoreEv||[];let k=0;
 return `<div class="f w"><div class="ctab">${CRIT[t].map(g=>`<div class="cg"><div class="cm"><b>${esc(g.m)}</b><span class="num">(${g.w})</span></div>${g.subs.map(sub=>{const i=k++;return `<div class="cr"><div class="ct">${esc(sub)}<span class="muted small"> · الوزن 10</span></div><select name="sc${i}" class="inp num" onchange="calcScore()"><option value="">الدرجة</option>${Array.from({length:11},(_,v)=>`<option ${sc[i]!==undefined&&sc[i]!==""&&+sc[i]===v?"selected":""}>${v}</option>`).join("")}</select><input class="inp" name="ev${i}" placeholder="الدليل أو المثال (الموقف أو الشاهد الداعم للدرجة)" value="${esc(ev[i]||"")}"></div>`}).join("")}</div>`).join("")}
 <div class="ctot">المجموع الكلي: <b id="wscore" class="num">—</b> / 100</div></div></div>`;
}
function approvalsBlock(t){
 const third=t==="bs"?"اعتماد لجنة التقييم":"إشراف المديرية العامة للشؤون الإدارية والمالية";
 return `<div class="fs">ثالثاً: الاعتمادات الرسمية</div>
 <div class="f"><label>المسؤول المباشر (الاسم) <span class="req">*</span></label><input name="supervisor" value="${esc(editNomObj()&&editNomObj().supervisor||"")}"></div>
 <div class="f"><label>اعتماد المدير العام${t==="mob"?" / المسؤول الأعلى":""}</label><input readonly value="يُسجَّل باسمك وتاريخه عند الإرسال"></div>
 <div class="f w"><label>${third}</label><input readonly value="يُسجَّل إلكترونياً في مرحلة المراجعة"></div>`;
}
function editNomObj(){return editId&&S.noms.find(x=>x.id===editId)||null}
function formBS(){
 const u=unit(S.role.unitId);if(!bsEligible(u))return `<div class="card empty">هذا التقسيم غير مشمول بمسار خدمة المستفيدين.</div>`;
 const n=editId&&S.noms.find(x=>x.id===editId&&x.track==="bs")||null;
 const openQ=["Q1","Q2","Q3","Q4"].filter(q=>cycOf(S.year,q).open||(n&&n.cycle===q));if(!openQ.length)return `<div class="card empty">لا توجد دورة مفتوحة لاستقبال الترشيحات حالياً.</div>`;const taken=openQ.map(q=>[q,bsWinner(u.id,q)]);
 return `<div class="card fadein"><div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><div class="trk" style="border:0"><div class="ic" style="--cb:${TRACKS.bs.cb}">${IC.bs}</div></div><div><h2 style="font-size:20px">استمارة ترشيح لجائزة موظف خدمة المستفيدين</h2><div class="small muted">جائزة واحدة للجهة في كل ربع · 300 ر.ع · وفق الاستمارة المعتمدة للربعين الأول والثاني</div></div></div>
 ${n&&n.returnReason?`<div class="alert w">${IC.warn}<div><b>أُعيد للاستكمال:</b> ${esc(n.returnReason)}</div></div>`:""}
 <form class="form" id="frm" onsubmit="return false">
 <div class="fs">البيانات الأساسية للمرشح</div>
 <div class="f"><label>اسم الموظف <span class="req">*</span></label><input name="name" value="${esc(n?n.emp.name:"")}"></div>
 <div class="f"><label>المسمى الوظيفي <span class="req">*</span></label><input name="title" value="${esc(n?n.emp.title:"")}"></div>
 ${unitHeader(u)}
 <div class="f"><label>الدائرة / القسم</label><input name="dept" value="${esc(n?n.dept||"":"الخدمة الموحدة")}"></div>
 <div class="f"><label>الرقم الوظيفي <span class="req">*</span></label><input name="empNo" inputmode="numeric" value="${esc(n?n.emp.empNo:"")}" oninput="empLookup(this)"><span class="hint" id="empHint"></span></div>
 <div class="f"><label>المنفذ الذي يعمل فيه <span class="req">*</span></label><select name="outlet">${u.outlets.map(o=>`<option ${n&&n.emp.outlet===o?"selected":""}>${esc(o)}</option>`).join("")}</select><span class="hint">للتحليل فقط؛ الجائزة على مستوى الجهة</span></div>
 <div class="f"><label>الربع <span class="req">*</span></label><select name="cycle">${taken.map(([q,w])=>`<option value="${q}" ${(n?n.cycle:"Q4")===q?"selected":""}>${CYC[q]} ${S.year}${w?" — يوجد فائز معتمد":""}</option>`).join("")}</select></div>
 <div class="f"><label>المحافظة</label><input readonly value="${esc(u.gov)}"></div>
 <div class="fs">أولاً: معايير التقييم والأداء <span class="small muted" style="font-family:var(--fb)">(قيّم الموظف في كل معيار فرعي من 10)</span></div>
 ${critTable("bs",n)}
 <div class="fs">ثانياً: مسوغات الترشيح</div>
 <div class="f w"><label>أبرز الإنجازات والمبادرات التي تجعل هذا الموظف نموذجاً للتميز <span class="req">*</span></label><textarea name="justification" placeholder="اذكر مواقف وإنجازات محددة وتاريخها، مثل: معالجة شكوى مراجع بتاريخ…، إنجاز … معاملة خلال الربع…">${esc(n&&n.justification||"")}</textarea></div>
 ${evidenceField(n)}
 ${approvalsBlock("bs")}
 ${formActions()}</form></div>`;
}
function formMOB(){
 const u=unit(S.role.unitId);const n=editId&&S.noms.find(x=>x.id===editId&&x.track==="mob")||null;const m=unitMoney(u.id);
 return `<div class="card fadein"><div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><div class="trk" style="border:0"><div class="ic" style="--cb:${TRACKS.mob.cb}">${IC.mob}</div></div><div><h2 style="font-size:20px">استمارة ترشيح لجائزة الموظف المبادر</h2><div class="small muted">المكافأة يحددها المسؤول الأعلى ضمن رصيد التقسيم السنوي</div></div></div>
 ${n&&n.returnReason?`<div class="alert w">${IC.warn}<div><b>أُعيد للاستكمال:</b> ${esc(n.returnReason)}</div></div>`:""}
 <div class="alert i" style="margin:8px 0 4px">${IC.money.replace('<svg','<svg width="18"')}<div>الرصيد السنوي المتاح للتقسيم: <b class="num">${fm(m.balance)}</b> من ${fm(m.alloc)} · مبالغ مقترحة قيد المراجعة: ${fm(m.pending)}</div></div>
 <form class="form" id="frm" onsubmit="return false">
 <div class="fs">البيانات الأساسية للمرشح</div>
 <div class="f"><label>اسم الموظف <span class="req">*</span></label><input name="name" value="${esc(n?n.emp.name:"")}"></div>
 <div class="f"><label>المسمى الوظيفي <span class="req">*</span></label><input name="title" value="${esc(n?n.emp.title:"")}"></div>
 ${unitHeader(u)}
 <div class="f"><label>الدائرة / القسم</label><input name="dept" value="${esc(n?n.dept||"":"")}"></div>
 <div class="f"><label>الرقم الوظيفي <span class="req">*</span></label><input name="empNo" inputmode="numeric" value="${esc(n?n.emp.empNo:"")}" oninput="empLookup(this)"><span class="hint" id="empHint"></span></div>
 <div class="f"><label>الربع <span class="req">*</span></label><select name="cycle">${["Q1","Q2","Q3","Q4"].filter(q=>cycOf(S.year,q).open||(n&&n.cycle===q)).map(q=>`<option value="${q}" ${(n?n.cycle:"Q4")===q?"selected":""}>${CYC[q]} ${S.year}</option>`).join("")}</select></div>
 <div class="f w"><label>عنوان المبادرة أو العمل الإضافي <span class="req">*</span></label><input name="initiative" value="${esc(n&&n.initiative||"")}"></div>
 <div class="f"><label>تاريخ التنفيذ</label><input type="date" name="execDate" value="${esc(n&&n.execDate||"")}"></div>
 <div class="f"><label>المستفيدون</label><input name="benef" value="${esc(n&&n.benef||"")}"></div>
 <div class="fs">أولاً: معايير التقييم <span class="small muted" style="font-family:var(--fb)">(قيّم الموظف في كل معيار فرعي من 10)</span></div>
 ${critTable("mob",n)}
 <div class="fs">ثانياً: مسوغات الترشيح</div>
 <div class="f w"><label>وصف المبادرة، وما تجاوز فيه واجباته المعتادة، ودوره الشخصي، والأثر الملموس <span class="req">*</span></label><textarea name="justification" placeholder="مثال: لاحظ تأخر … فبادر دون تكليف إلى … مما أدى إلى تقليص … من … إلى …">${esc(n&&n.justification||"")}</textarea></div>
 ${evidenceField(n)}
 <div class="f"><label>مبلغ المكافأة المقترح (ر.ع) <span class="req">*</span></label><input name="proposed" type="number" min="1" step="1" value="${n&&n.proposed||""}" oninput="chkAmt(${m.balance})"><span class="hint" id="amtHint">لا يُقبل مبلغ يتجاوز الرصيد المتاح</span></div>
 ${approvalsBlock("mob")}
 ${formActions()}</form></div>`;
}
function calcScore(){const f=$("#frm");if(!f||!f.sc0)return;let s=0,all=true;for(let i=0;i<NSUB;i++){const v=f["sc"+i].value;if(v==="")all=false;else s+=+v}const el=$("#wscore");if(el)el.textContent=s+(all?"":" (غير مكتمل)")}
function chkAmt(bal){const v=+$("#frm").proposed.value;const h=$("#amtHint");if(v>bal){h.style.color="var(--danger)";h.textContent="يتجاوز الرصيد المتاح ("+fm(bal)+")"}else{h.style.color="";h.textContent="ضمن الرصيد المتاح"}}
async function saveForm(mode){
 const f=$("#frm");const u=unit(S.role.unitId);const isBS=cur()==="bsform";
 const g=k=>f[k]?f[k].value.trim():"";
 const prevN=editId&&S.noms.find(x=>x.id===editId);
 const files=[...(($("#fEv")||{}).files||[])];
 if(files.some(x=>x.size>10*1024*1024)){toast("حجم أحد الملفات يتجاوز 10 ميجابايت");return}
 if(mode!=="draft"){
  const req=isBS?["name","title","empNo","justification","supervisor"]:["name","title","empNo","initiative","justification","proposed","supervisor"];
  const miss=req.filter(k=>!g(k));if(miss.length){toast("أكمل الحقول المطلوبة (*) قبل الإرسال");f[miss[0]].focus();return}
  for(let i=0;i<NSUB;i++)if(f["sc"+i].value===""){toast("أكمل درجات جميع المعايير الفرعية");f["sc"+i].focus();return}
  if(!((prevN&&prevN.evidence||[]).length||files.length)){toast("أرفق شاهداً واحداً على الأقل");return}
  if(!isBS){const m=unitMoney(u.id);if(+g("proposed")>m.balance+0.001){toast("المبلغ المقترح يتجاوز الرصيد السنوي المتاح للتقسيم ("+fm(m.balance)+")");return}}
 }else if(!g("name")&&!g("empNo")){toast("أدخل اسم الموظف أو رقمه الوظيفي على الأقل لحفظ المسودة");return}
 const row={year:S.year,track:isBS?"bs":"mob",cycle:g("cycle"),unit_id:u.id,emp_no:g("empNo"),emp_name:g("name"),emp_title:g("title"),dept:g("dept"),
  outlet:isBS?g("outlet"):null,scores:Array.from({length:NSUB},(_,i)=>f["sc"+i].value===""?null:+f["sc"+i].value),score_ev:Array.from({length:NSUB},(_,i)=>f["ev"+i].value.trim()),
  justification:g("justification"),supervisor:g("supervisor")};
 if(!isBS)Object.assign(row,{initiative:g("initiative"),benef:g("benef"),exec_date:g("execDate")||null,proposed:+g("proposed")||null});
 let id=prevN&&prevN.id;
 const ok=await run(async()=>{
  if(!id)id=await api.insertNom({...row,status:"draft"});else await api.updateNom(id,row);
  if(files.length){const ev=[...(prevN&&prevN.evidence||[])];
   for(let i=0;i<files.length;i++){const fl=files[i];const ext=(fl.name.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"");
    const path=`${u.id}/${id}/${Date.now()}-${i}.${ext}`;await api.upload(path,fl);ev.push({path,name:fl.name})}
   await api.updateNom(id,{evidence:ev})}
  if(mode==="send")await api.submit(id);
  await reload();
 },mode==="send"?"أُرسل الترشيح إلى فريق الإجادة المؤسسية":"حُفظت المسودة");
 if(!ok){if(id&&!prevN){await reload();editId=id}return}
 editId=null;location.hash="unit";render();
}


/* ---- Nomination detail & workflow ---- */
async function openNom(id){
 const n=S.noms.find(x=>x.id===id);if(!n)return;const u=unit(n.unitId);const r=S.role.type;
 let audit=[];try{audit=await api.audit(id)}catch(e){}
 const rows=[];const add=(l,v)=>{if(v!==undefined&&v!==""&&v!==null)rows.push(`<tr><th style="position:static;width:150px">${l}</th><td>${v}</td></tr>`)};
 add("المسار",tk(n.track));add("الدورة",CYC[n.cycle]+" "+n.year);add("الجهة",esc(u.name));
 if(n.track!=="inv"){add("الموظف",esc(n.emp.name)+' <span class="muted num">'+esc(n.emp.empNo)+"</span>");add("المسمى الوظيفي",esc(n.emp.title));add("الدائرة / القسم",esc(n.dept));add("المنفذ",esc(n.emp.outlet));
  if(n.track==="mob"){add("المبادرة",esc(n.initiative));add("تاريخ التنفيذ",esc(n.execDate));add("المستفيدون",esc(n.benef));add("المبلغ المقترح",n.proposed?fm(n.proposed):"")}
  if(n.scores&&n.scores.length){let k=0;add("معايير التقييم",`<table class="small">${CRIT[n.track].map(g=>`<tr><td colspan="2" style="font-weight:700;background:var(--grey-b)">${esc(g.m)} (${g.w})</td></tr>`+g.subs.map(sub=>{const i=k++;return `<tr><td>${esc(sub)}${n.scoreEv&&n.scoreEv[i]?`<div class="muted">${esc(n.scoreEv[i])}</div>`:""}</td><td class="num">${n.scores[i]??"—"}</td></tr>`}).join("")).join("")}<tr style="font-weight:700"><td>المجموع الكلي</td><td class="num">${total(n)} / 100</td></tr></table>`)}
  add("مسوغات الترشيح",esc(n.justification).replace(/\n/g,"<br>"));add("المسؤول المباشر",esc(n.supervisor));add("اعتماد المدير العام",esc(n.approvedBy))}
 if(n.track==="inv"){add("المركز",n.place);add("الفكرة",esc(n.idea)+' <span class="muted">('+esc(n.nbRef)+")</span>");add("الفائز",esc(n.emp.name));add("الأعضاء والتوزيع",(n.members||[]).map(m=>esc(m.name)+' <span class="muted num">'+esc(m.empNo)+"</span> — "+fm(+m.share||0)).join("<br>"));add("تاريخ الاعتماد",esc(n.approvalDate))}
 add("الشواهد",(n.evidence||[]).map(e=>typeof e==="string"?`<span class="chip">${esc(e)}</span>`:`<button class="chip" style="border:0;cursor:pointer" onclick="openEv('${esc(e.path)}')">${IC.evid.replace('<svg','<svg width="14"')}${esc(e.name)}</button>`).join(""));
 add("المبلغ المعتمد",n.amount?fm(n.amount):"");add("تاريخ الصرف",n.paidAt);add("تاريخ التكريم",n.honoredAt);
 const conf=approvedInOtherTrack(n);
 const acts=[];const can=(s,roles)=>n.status===s&&roles.includes(r);
 if(r==="dg"&&n.unitId===S.role.unitId&&["draft","needs_info"].includes(n.status))acts.push(`<button class="btn" onclick="editNom('${n.id}')">${n.status==="needs_info"?"استكمال":"تعديل"}</button>`);
 if(r==="dg"&&n.unitId===S.role.unitId&&n.status==="draft")acts.push(`<button class="btn o" onclick="delNom('${n.id}')">حذف المسودة</button>`);
 if(can("sent",["central"]))acts.push(`<button class="btn" onclick="act('${n.id}','review','استلام للمراجعة')">استلام للمراجعة</button>`);
 if(["sent","review","recommended"].includes(n.status)&&(r==="central"||r===approverOf(n.track)))acts.push(`<button class="btn o" onclick="returnNom('${n.id}')">إعادة للاستكمال</button>`);
 if(can("review",["central"]))acts.push(`<button class="btn t" onclick="act('${n.id}','recommended','توصية بالاعتماد')">توصية</button>`);
 if(can("recommended",[approverOf(n.track)]))acts.push(`<button class="btn g" onclick="approve('${n.id}')">اعتماد</button>`);
 if(can("approved",["adm"]))acts.push(`<button class="btn" onclick="act('${n.id}','to_pay','إحالة للصرف')">إحالة للصرف</button>`);
 if(can("to_pay",["adm"]))acts.push(`<button class="btn" onclick="markDate('${n.id}','paid','تسجيل الصرف')">تسجيل الصرف</button>`);
 if(can("paid",["central"]))acts.push(`<button class="btn g" onclick="markDate('${n.id}','honored','تسجيل وقوع التكريم')">تسجيل التكريم</button>`);
 if(n.status==="honored")acts.push(`<button class="btn o" onclick="cert('${n.id}')">شهادة التهنئة</button>`);
 modal(`<h3>${esc(n.emp.name)} ${pill(n.status)}</h3>
 ${conf&&!APPROVED_SET.has(n.status)?`<div class="alert r" style="margin-bottom:10px">${IC.warn}<div>الموظف معتمد في مسار ${TRACKS[conf.track].short} هذه السنة، ولا يُعتمد في مسار ثانٍ. يحسم فريق الإجادة المسار.</div></div>`:""}
 ${n.returnReason&&n.status==="needs_info"?`<div class="alert w" style="margin-bottom:10px">${IC.warn}<div><b>سبب الإرجاع:</b> ${esc(n.returnReason)}</div></div>`:""}
 <table>${rows.join("")}</table>
 ${audit.length?`<h3 style="font-size:16px;margin-top:16px">سجل الإجراءات</h3><div class="audit">${audit.map(a=>`<div><span class="num muted">${esc((a.at||"").slice(0,16).replace("T"," "))}</span> — <b>${esc(a.by_name)}</b>: ${esc(a.action)}${a.note?' <span class="muted">('+esc(a.note)+")</span>":""}</div>`).join("")}</div>`:""}
 <div class="ft">${acts.join("")}<button class="btn o" onclick="closeModal()">إغلاق</button></div>`);
}
async function openEv(path){const w=window.open("","_blank");try{const u=await api.signedUrl(path);if(w)w.location=u;else location.href=u}catch(e){if(w)w.close();toast(errMsg(e))}}
async function delNom(id){closeModal();await run(async()=>{await api.deleteNom(id);await reload()},"حُذفت المسودة");render()}
async function act(id,to,label){closeModal();await run(async()=>{await api.transition(id,to);await reload()},label+" ✓");render()}
async function doReturn(id){const v=$("#rr").value.trim();if(!v){toast("اكتب سبب الإرجاع");return}closeModal();await run(async()=>{await api.transition(id,"needs_info",v);await reload()},"أُعيد للجهة للاستكمال");render()}
async function approve(id){closeModal();await run(async()=>{await api.transition(id,"approved");await reload()},"تم الاعتماد");render()}
function markDate(id,to,label){modal(`<h3>${label}</h3><div class="f"><label>التاريخ الفعلي</label><input type="date" id="dt" value="${today()}"></div><div class="f" style="margin-top:8px"><label>ملاحظة / رقم المستند</label><input id="dn"></div><div class="ft"><button class="btn g" onclick="doDate('${id}','${to}','${label}')">تسجيل</button><button class="btn o" onclick="openNom('${id}')">رجوع</button></div>`)}
async function doDate(id,to,label){const d=$("#dt").value,nt=$("#dn").value.trim();closeModal();await run(async()=>{await api.transition(id,to,nt||null,d||null);await reload()},label+" ✓");render()}


function editNom(id){editId=id;closeModal();const n=S.noms.find(x=>x.id===id);location.hash=n.track==="bs"?"bsform":"mobform";render()}
function returnNom(id){modal(`<h3>إعادة الترشيح للاستكمال</h3><div class="f"><label>سبب الإرجاع (إلزامي)</label><textarea id="rr"></textarea></div><div class="ft"><button class="btn" onclick="doReturn('${id}')">إعادة</button><button class="btn o" onclick="openNom('${id}')">رجوع</button></div>`)}
/* ---- Innovator ---- */
V.inv=()=>{
 const ns=yNoms().filter(n=>n.track==="inv");
 return `<div class="alert i">${IC.bulb.replace('<svg','<svg width="18"')}<div>الأفكار تُقدَّم وتُحكَّم في منصة «نبتكر». هنا تُدخل النتائج المعتمدة فقط ولا يُعاد تحكيمها. الموعد المستهدف لاستلام قوائم ${S.year}: <b>15 ديسمبر ${S.year}</b>.</div></div>
 ${["H1","H2"].map(h=>{const list=ns.filter(n=>n.cycle===h);return `<div class="sec"><h2>${CYC[h]} ${S.year}</h2><span class="sp"></span><span class="small muted">${list.length}/3 نتائج · ${fm(list.reduce((a,n)=>a+n.amount,0))} من 1,200 ر.ع</span></div>
 <div class="grid g3">${[1,2,3].map(p=>{const n=list.find(x=>x.place===p);return `<div class="card trk" style="--c:${TRACKS.inv.c}"><div style="display:flex;justify-content:space-between"><b style="font-family:var(--fd);font-size:17px">المركز ${["","الأول","الثاني","الثالث"][p]}</b><span class="num">${fm(TRACKS.inv.prizes[p])}</span></div>
 ${n?`<div><b>${esc(n.idea)}</b><div class="small muted">${esc(n.nbRef)} · ${esc(unit(n.unitId).short)}</div></div><div class="small">${n.members.map(m=>esc(m.name)+" — "+fm(m.share)).join("<br>")}</div><div>${pill(n.status)}</div><button class="btn o s" onclick="openNom('${n.id}')">التفاصيل</button>`
 :`<div class="muted small">لم تُدخل النتيجة</div><button class="btn s" onclick="invForm('${h}',${p})">إدخال النتيجة المعتمدة</button>`}</div>`}).join("")}</div>`}).join("")}`;
};
function invForm(h,p){
 const prize=TRACKS.inv.prizes[p];
 modal(`<h3>إدخال نتيجة ${CYC[h]} — المركز ${p} (${fm(prize)})</h3>
 <div class="form" id="ivf"><div class="f"><label>نوع الفائز</label><select id="ik" onchange="invKind()"><option value="ind">فرد</option><option value="team">فريق</option></select></div>
 <div class="f"><label>اسم الفكرة</label><input id="iidea"></div><div class="f"><label>رقم الفكرة في «نبتكر»</label><input id="iref"></div>
 <div class="f"><label>المديرية / التقسيم</label><select id="iu">${participating().map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select></div>
 <div class="f"><label>تاريخ الاعتماد</label><input type="date" id="idate" value="${today()}"></div><div class="f"><label>مستند اعتماد النتائج</label><input type="file" id="idoc"></div>
 <div class="f w"><label>الأعضاء (الاسم · الرقم الوظيفي · الحصة)</label><div id="imem"></div><button class="btn o s" id="iadd" style="display:none;margin-top:6px" onclick="invAdd()">+ إضافة عضو</button><span class="hint" id="ish">مجموع الحصص يجب ألا يتجاوز ${fm(prize)}. التوزيع بين أعضاء الفريق يُفعّل بعد اعتماد آلية التوزيع.</span></div></div>
 <div class="ft"><button class="btn g" onclick="invSave('${h}',${p})">حفظ النتيجة</button><button class="btn o" onclick="closeModal()">إلغاء</button></div>`);
 invAdd(prize);
}
function invAdd(v){const d=document.createElement("div");d.style.cssText="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px;margin-top:6px";d.innerHTML=`<input class="inp" placeholder="الاسم"><input class="inp" placeholder="الرقم الوظيفي"><input class="inp" type="number" placeholder="الحصة" value="${v||""}" oninput="invSum()">`;$("#imem").appendChild(d)}
function invKind(){const t=$("#ik").value==="team";$("#iadd").style.display=t?"inline-flex":"none";if(t&&$("#imem").children.length<2)invAdd()}
function invSum(){let s=0;$("#imem").querySelectorAll("div").forEach(r=>s+=+r.children[2].value||0);return s}
async function invSave(h,p){
 const prize=TRACKS.inv.prizes[p];const mem=[...$("#imem").children].map(r=>({name:r.children[0].value.trim(),empNo:r.children[1].value.trim(),share:+r.children[2].value||0})).filter(m=>m.name);
 if(!mem.length||!$("#iidea").value.trim()){toast("أدخل اسم الفكرة واسم الفائز");return}
 if(mem.some(m=>!m.empNo)){toast("أدخل الرقم الوظيفي لكل فائز");return}
 const s=mem.reduce((a,m)=>a+m.share,0);if(s>prize){toast("مجموع الحصص ("+fm(s)+") يتجاوز قيمة الجائزة ("+fm(prize)+")");return}
 const fl=$("#idoc").files[0];const kind=$("#ik").value;const uid=$("#iu").value;const idea=$("#iidea").value.trim(),ref=$("#iref").value.trim(),dt=$("#idate").value||null;
 closeModal();
 await run(async()=>{let doc=[];
  if(fl){const ext=(fl.name.split(".").pop()||"pdf").toLowerCase().replace(/[^a-z0-9]/g,"");const path=`inv/${S.year}-${h}-${p}-${Date.now()}.${ext}`;await api.upload(path,fl);doc=[{path,name:fl.name}]}
  await api.addInv({p_year:S.year,p_cycle:h,p_place:p,p_kind:kind,p_idea:idea,p_nb_ref:ref,p_unit:uid,p_members:mem,p_approval_date:dt,p_doc:doc});
  await reload()},S.role.type==="dev"?"سُجّلت النتيجة واعتُمدت":"سُجّلت النتيجة وتنتظر اعتماد المديرية العامة للتطوير والدراسات");
 render();
}


/* ---- Dashboard ---- */
let F={track:"",cycle:"",gov:"",unit:"",outlet:"",tab:"over"};
V.dash=()=>{
 let ns=yNoms();
 if(F.track)ns=ns.filter(n=>n.track===F.track);if(F.cycle)ns=ns.filter(n=>n.cycle===F.cycle);if(F.gov)ns=ns.filter(n=>unit(n.unitId).gov===F.gov);if(F.unit)ns=ns.filter(n=>n.unitId===F.unit);if(F.outlet)ns=ns.filter(n=>n.emp.outlet===F.outlet);
 const appr=ns.filter(n=>APPROVED_SET.has(n.status));const paid=ns.filter(n=>["paid","honored"].includes(n.status));const hon=ns.filter(n=>n.status==="honored");
 const outlets=[...new Set(S.units.flatMap(u=>u.outlets))];
 const flt=`<div class="card flt" style="margin-bottom:14px">
 <select onchange="F.track=this.value;render()"><option value="">كل المسارات</option>${Object.entries(TRACKS).map(([k,t])=>`<option value="${k}" ${F.track===k?"selected":""}>${t.short}</option>`).join("")}</select>
 <select onchange="F.cycle=this.value;render()"><option value="">كل الدورات</option>${Object.entries(CYC).map(([k,t])=>`<option value="${k}" ${F.cycle===k?"selected":""}>${t}</option>`).join("")}</select>
 <select onchange="F.gov=this.value;render()"><option value="">كل المحافظات</option>${[...new Set(S.units.map(u=>u.gov).filter(Boolean))].map(g=>`<option ${F.gov===g?"selected":""}>${esc(g)}</option>`).join("")}</select>
 <select onchange="F.unit=this.value;render()"><option value="">كل التقسيمات</option>${participating().map(u=>`<option value="${u.id}" ${F.unit===u.id?"selected":""}>${esc(u.short)}</option>`).join("")}</select>
 <select onchange="F.outlet=this.value;render()"><option value="">كل المنافذ</option>${outlets.map(o=>`<option ${F.outlet===o?"selected":""}>${esc(o)}</option>`).join("")}</select>
 <button class="btn o s" onclick="F={track:'',cycle:'',gov:'',unit:'',outlet:'',tab:F.tab};render()">مسح</button></div>`;
 const tabs=`<div class="tabs">${[["over","نظرة عامة"],["units","متابعة الجهات"],["alerts","التنبيهات ("+alerts().length+")"],["list","السجلات"]].map(t=>`<button class="${F.tab===t[0]?"on":""}" onclick="F.tab='${t[0]}';render()">${t[1]}</button>`).join("")}</div>`;
 let body="";
 if(F.tab==="over"){
  const st=ST.map(s=>[STN[s[0]],ns.filter(n=>n.status===s[0]).length]);
  const qc=["Q1","Q2","Q3","Q4"];
  body=`<div class="grid g4 k">${[["إجمالي الترشيحات",ns.length,""],["المعتمدون",appr.length,fm(appr.reduce((a,n)=>a+n.amount,0))],["المصروف لهم",paid.length,fm(paid.reduce((a,n)=>a+n.amount,0))],["المكرّمون فعلياً",hon.length,"بعد تسجيل التكريم"]].map(x=>`<div class="card kpi fadein"><span class="l">${x[0]}</span><span class="v num" data-count="${x[1]}">0</span><span class="s">${x[2]}</span></div>`).join("")}</div>
  <div class="grid g2" style="margin-top:14px">
  <div class="card"><h3 style="font-size:16px;margin-bottom:8px">مقارنة الأرباع — عدد المعتمدين</h3>${barChart(qc.map(q=>CYC[q].replace("الربع ","")),[{n:"خدمة المستفيدين",c:TRACKS.bs.c,v:qc.map(q=>ns.filter(n=>n.track==="bs"&&n.cycle===q&&APPROVED_SET.has(n.status)).length)},{n:"المبادر",c:TRACKS.mob.c,v:qc.map(q=>ns.filter(n=>n.track==="mob"&&n.cycle===q&&APPROVED_SET.has(n.status)).length)}])}<p class="small muted" style="margin:6px 0 0">الهدف لخدمة المستفيدين 14 في الربع. الربع الرابع غير منتهٍ ولا يُعرض كنتيجة نهائية.</p></div>
  <div class="card"><h3 style="font-size:16px;margin-bottom:8px">المبادر — المبالغ المعتمدة والمصروفة لكل ربع</h3>${barChart(qc.map(q=>CYC[q].replace("الربع ","")),[{n:"صُرف",c:"#006452",v:qc.map(q=>ns.filter(n=>n.track==="mob"&&n.cycle===q&&["paid","honored"].includes(n.status)).reduce((a,n)=>a+n.amount,0))},{n:"معتمد لم يُصرف",c:"#5eccc9",v:qc.map(q=>ns.filter(n=>n.track==="mob"&&n.cycle===q&&["approved","to_pay"].includes(n.status)).reduce((a,n)=>a+n.amount,0))}],{stack:true})}</div>
  <div class="card"><h3 style="font-size:16px;margin-bottom:8px">توزيع الحالات</h3>${hbars(st.map((s,i)=>[s[0],s[1],["#868c8e","#0f446c","#8a5a00","#6f92b4","#00827a","#43b987","#aa7f67","#7a5640","#00253e"][i]]))}</div>
  <div class="card"><h3 style="font-size:16px;margin-bottom:8px">المبتكر — نصفا السنة</h3>${barChart(["النصف الأول","النصف الثاني"],[{n:"نتائج مدخلة",c:TRACKS.inv.c,v:["H1","H2"].map(h=>ns.filter(n=>n.track==="inv"&&n.cycle===h).length)},{n:"المستهدف",c:"#e4c6ac",v:[3,3]}],{h:200})}<p class="small muted" style="margin:6px 0 0">نتائج النصف الثاني مستهدفة في 15 ديسمبر.</p></div>
  </div>`;
 }
 if(F.tab==="units"){const q=F.cycle&&F.cycle.startsWith("Q")?F.cycle:"Q4";
  body=`<p class="small muted">الدورة المعروضة: <b>${CYC[q]}</b> (غيّرها من فلتر الدورات)</p><div class="card tw"><table class="rtable"><thead><tr><th>الجهة</th><th>بدأ الإدخال</th><th>خدمة المستفيدين</th><th>المبادر</th><th>الناقص</th><th>ينتظر اعتماداً</th><th>رصيد المبادر</th></tr></thead><tbody>
  ${participating().map(u=>{const un=yNoms().filter(n=>n.unitId===u.id&&n.cycle===q);const started=un.length>0;const bs=un.filter(n=>n.track==="bs");const bsSent=bs.some(n=>n.status!=="draft");const miss=[];
   if(bsEligible(u)&&!bsSent)miss.push("ترشيح خدمة المستفيدين");if(un.some(n=>n.status==="needs_info"))miss.push("استكمال مطلوب");
   const wait=un.filter(n=>["sent","review","recommended"].includes(n.status)).length;const m=unitMoney(u.id);
   return `<tr><td data-l="الجهة"><b>${esc(u.short)}</b></td><td data-l="بدأ الإدخال">${started?'<span class="pill st-approved">نعم</span>':'<span class="pill st-draft">لا</span>'}</td><td data-l="خدمة المستفيدين">${bsEligible(u)?(bs.length?bs.map(n=>pill(n.status)).join(" "):'<span class="pill st-needs_info">لم يُرسل</span>'):'<span class="muted small">غير مشمول</span>'}</td><td data-l="المبادر">${un.filter(n=>n.track==="mob").map(n=>pill(n.status)).join(" ")||'<span class="muted small">—</span>'}</td><td data-l="الناقص" class="small">${miss.join("، ")||"—"}</td><td data-l="ينتظر اعتماداً" class="num">${wait||"—"}</td><td data-l="رصيد المبادر" class="num" style="${m.balance<0?"color:var(--danger)":""}">${fm(m.balance)}</td></tr>`}).join("")}</tbody></table></div>`}
 if(F.tab==="alerts"){const a=alerts();body=a.length?`<div class="grid" style="gap:8px">${a.map(x=>`<div class="alert ${x.lvl}">${IC.warn}<div><b>${esc(x.t)}:</b> ${esc(x.d)}</div></div>`).join("")}</div>`:`<div class="alert ok">لا توجد تنبيهات</div>`}
 if(F.tab==="list")body=nomTable(ns);
 return flt+tabs+body;
};

/* ---- HR review ---- */
let RV="";
V.review=()=>{
 const t=S.role.type;const ns=yNoms();const cnf=conflicts();
 const groups=t==="central"?[["sent","جديدة"],["review","قيد المراجعة"],["needs_info","معادة للاستكمال"],["recommended","بانتظار الاعتماد"],["conf","تعارضات"]]
  :t==="adm"?[["recommended","بانتظار اعتمادك"],["approved","للإحالة للصرف"],["to_pay","لتسجيل الصرف"]]
  :[["recommended","بانتظار اعتمادك"],["approved","المعتمدة"]];
 if(!groups.some(g=>g[0]===RV))RV=groups[0][0];
 const scope=t==="adm"?ns.filter(n=>RV==="recommended"?n.track==="mob":true):t==="dev"?ns.filter(n=>n.track!=="mob"):ns;
 const list=RV==="conf"?[]:scope.filter(n=>n.status===RV);
 return `<div class="tabs">${groups.map(g=>`<button class="${RV===g[0]?"on":""}" onclick="RV='${g[0]}';render()">${g[1]} (${g[0]==="conf"?cnf.length:scope.filter(n=>n.status===g[0]).length})</button>`).join("")}</div>
 ${RV==="conf"?(cnf.length?cnf.map(c=>`<div class="card" style="margin-bottom:10px"><div class="small" style="margin-bottom:6px"><b>${esc(c.list[0].emp.name)}</b> — ${c.severe?"معتمد في مسارين":"مرشح في مسارين"}</div>${nomTable(c.list,{compact:true})}</div>`).join(""):`<div class="card empty">لا توجد تعارضات</div>`):nomTable(list,{compact:true})}`;
};

/* ---- Budget ---- */
V.budget=()=>{
 const b=budget();const rows=participating().map(u=>({u,...unitMoney(u.id)}));
 const tot=k=>rows.reduce((a,r)=>a+r[k],0);
 const canEdit=S.role.type==="central";
 return `<div class="grid g4 k">${[["إجمالي ميزانية الحوافز",b.total,fn(b.approvedTotal)+" موظفاً"],["خدمة المستفيدين",b.bsT,""],["المبتكر",INV_TOTAL,""],["المتاح للمبادر",b.mob,""]].map(x=>`<div class="card kpi"><span class="l">${x[0]}</span><span class="v num" style="font-size:22px">${fm(x[1])}</span><span class="s">${x[2]}</span></div>`).join("")}</div>
 ${b.diff?`<div class="alert w" style="margin-top:12px">${IC.warn}<div>مجموع موظفي التقسيمات المشمولة (${fn(b.empSum)}) يختلف عن العدد الإجمالي المعتمد للحساب (${fn(b.approvedTotal)}) بفارق ${fn(b.diff)}. ${canEdit?'<a href="#settings">راجع الإعدادات</a>':""}</div></div>`:`<div class="alert ok" style="margin-top:12px">مجموع موظفي التقسيمات المشمولة يطابق العدد المعتمد للحساب (${fn(b.empSum)}).</div>`}

 <div class="sec"><h2>مخصصات المبادر حسب التقسيم</h2><span class="sp"></span><span class="small muted">الاعتماد ≠ الصرف ≠ التكريم</span></div>
 <div class="card tw"><table class="rtable"><thead><tr><th>التقسيم</th><th>الموظفون</th><th>المخصص السنوي</th><th>ر1</th><th>ر2</th><th>ر3</th><th>ر4</th><th>المصروف</th><th>التزامات لم تُصرف</th><th>الرصيد</th></tr></thead><tbody>
 ${rows.map(r=>`<tr><td data-l="التقسيم"><b>${esc(r.u.short)}</b></td><td data-l="الموظفون" class="num">${fn(r.u.employees)}</td><td data-l="المخصص" class="num">${fm(r.alloc)}</td>${["Q1","Q2","Q3","Q4"].map(q=>`<td data-l="${CYC[q]}" class="num">${r.byQ[q]?fn(r.byQ[q]):"—"}</td>`).join("")}<td data-l="المصروف" class="num">${fm(r.paid)}</td><td data-l="التزامات" class="num">${fm(r.committed)}</td><td data-l="الرصيد" class="num" style="font-weight:700;${r.balance<0?"color:var(--danger)":""}">${fm(r.balance)}</td></tr>`).join("")}
 <tr style="font-weight:700"><td data-l="">الإجمالي</td><td data-l="الموظفون" class="num">${fn(b.empSum)}</td><td data-l="المخصص" class="num">${fm(tot("alloc"))}</td>${["Q1","Q2","Q3","Q4"].map(q=>`<td data-l="${CYC[q]}" class="num">${fn(rows.reduce((a,r)=>a+r.byQ[q],0))}</td>`).join("")}<td data-l="المصروف" class="num">${fm(tot("paid"))}</td><td data-l="التزامات" class="num">${fm(tot("committed"))}</td><td data-l="الرصيد" class="num">${fm(tot("balance"))}</td></tr></tbody></table></div>`;
};

/* ---- Cycles & December closing ---- */
V.cycles=()=>{
 const cfg=yearCfg(S.year);const ns=yNoms();const isC=S.role.type==="central";
 const row=(t,c)=>{const list=ns.filter(n=>n.track===t&&n.cycle===c);const w=list.filter(n=>APPROVED_SET.has(n.status));const amt=w.reduce((a,n)=>a+n.amount,0);
  const target=t==="bs"?bsUnitsCount():t==="inv"?3:null;const pend=list.filter(n=>["sent","review","recommended"].includes(n.status)).length;
  const ended=(cycOf(S.year,c).close||'9999')<today();let st,cls;
  if(!ended){st="غير منتهية";cls="st-draft"}else if(target&&w.length>=target&&!pend){st="مكتملة";cls="st-approved"}else if(pend){st="بانتظار الاعتماد";cls="st-review"}else{st=target?"ناقصة":"مكتملة";cls=target?"st-needs_info":"st-approved"}
  if(t==="mob"&&ended&&!pend){st="مكتملة";cls="st-approved"}
  return `<tr><td data-l="المسار">${tk(t)}</td><td data-l="الدورة">${CYC[c]}</td><td data-l="تاريخ إقفال التقييم">${isC?`<input type="date" class="inp" value="${cycOf(S.year,c).close}" onchange="saveCycle('${c}',{close_date:this.value||null})">`:cycOf(S.year,c).close}</td><td data-l="استقبال الترشيحات">${t==="inv"?'<span class="muted small">من نبتكر</span>':(isC?`<label style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" ${cycOf(S.year,c).open?"checked":""} onchange="saveCycle('${c}',{open:this.checked})">${cycOf(S.year,c).open?"مفتوح":"مغلق"}</label>`:(cycOf(S.year,c).open?"مفتوح":"مغلق"))}</td><td data-l="الحالة"><span class="pill ${cls}">${st}</span></td><td data-l="الفائزون" class="num">${w.length}${target?" / "+target:""}</td><td data-l="بانتظار" class="num">${pend||"—"}</td><td data-l="المبلغ" class="num">${fm(amt)}</td></tr>`};
 return `<div class="alert w">${IC.warn}<div>الربع الرابع قد لا يكتمل قبل تكريم منتصف ديسمبر. تاريخ إقفال كل دورة قابل للتحديد من الفريق المركزي، والدورة غير المنتهية لا تُعرض كنتيجة نهائية.</div></div>
 <div class="sec"><h2>إقفال نتائج ديسمبر ${S.year}</h2></div>
 <div class="card tw"><table class="rtable"><thead><tr><th>المسار</th><th>الدورة</th><th>تاريخ إقفال التقييم</th><th>استقبال الترشيحات</th><th>الحالة</th><th>الفائزون</th><th>بانتظار</th><th>المبلغ المعتمد</th></tr></thead><tbody>
 ${["Q1","Q2","Q3","Q4"].map(q=>row("bs",q)).join("")}${["H1","H2"].map(h=>row("inv",h)).join("")}${["Q1","Q2","Q3","Q4"].map(q=>row("mob",q)).join("")}</tbody></table></div>
 ${isC?`<div class="card" style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px"><b>اعتماد إقفال السنة</b><div class="small muted">${cfg.closingConfirmed?"تم اعتماد الإقفال — "+esc(cfg.closingConfirmed):"يُعتمد بعد اكتمال الدورات أو تحديد ما يُرحَّل منها"}</div></div><button class="btn" ${cfg.closingConfirmed?"disabled":""} onclick="confirmClosing()">اعتماد الإقفال</button></div>
 `:""}`;
};
/* ---- Reports ---- */
let RP={kind:"honor",track:"",cycle:""};
V.reports=()=>{
 let ns=yNoms();if(RP.track)ns=ns.filter(n=>n.track===RP.track);if(RP.cycle)ns=ns.filter(n=>n.cycle===RP.cycle);
 const isC=S.role.type==="central";
 const kinds=[["honor","قائمة التكريم"],["pub","قائمة النشر الرسمية"],["mol","كشف وزارة العمل"],["noms","الترشيحات والتقييمات"],["budget","الميزانية"],["cert","شهادات التهنئة"]];
 let list=[],cols=[],note="";
 if(RP.kind==="honor"){list=ns.filter(n=>APPROVED_SET.has(n.status));cols=[["الاسم",n=>n.emp.name],["الجهة",n=>unit(n.unitId).short],["المسار",n=>TRACKS[n.track].short],["الدورة",n=>CYC[n.cycle]+(n.place?" — المركز "+n.place:"")],["الحالة",n=>STN[n.status]]];note="قائمة عمل لتحضير التكريم: المعتمدون ومن بعدهم. قائمة «تم تكريمهم» الفعلية هي كشف وزارة العمل."}
 if(RP.kind==="pub"){list=ns.filter(n=>APPROVED_SET.has(n.status));cols=[["الاسم",n=>n.emp.name],["التقسيم",n=>unit(n.unitId).name],["المسار",n=>TRACKS[n.track].name],["الدورة / المركز",n=>CYC[n.cycle]+(n.place?" — المركز "+n.place:"")]];note="لا تتضمن الرقم الوظيفي أو درجات التقييم أو تفاصيل الصرف. لا تُخرج إلا بعد مراجعة الأسماء واعتماد نسخة النشر."}
 if(RP.kind==="mol"){list=ns.filter(n=>n.status==="honored");cols=[["الاسم",n=>n.emp.name],["الرقم الوظيفي",n=>n.track==="inv"?(n.members||[]).map(m=>m.empNo).join(" / "):n.emp.empNo],["الجهة",n=>unit(n.unitId).name],["المسار",n=>TRACKS[n.track].name],["الدورة",n=>CYC[n.cycle]],["المبلغ",n=>n.amount],["تاريخ التكريم",n=>n.honoredAt||""],["الشواهد",n=>(n.evidence||[]).map(evName).join("؛ ")]];note="يقتصر على من سُجّل وقوع تكريمه فعلياً."}
 if(RP.kind==="noms"){list=ns;cols=[["الاسم",n=>n.emp.name],["الرقم الوظيفي",n=>n.emp.empNo],["الجهة",n=>unit(n.unitId).short],["المنفذ",n=>n.emp.outlet],["المسار",n=>TRACKS[n.track].short],["الدورة",n=>CYC[n.cycle]],["الحالة",n=>STN[n.status]],["مجموع التقييم",n=>n.track==="inv"?"":total(n)],["المبلغ",n=>n.amount||n.proposed||0]]}
 const pv=S.pubVersions.find(v=>v.year===S.year&&v.track===RP.track&&v.cycle===RP.cycle);
 const flt=`<div class="tabs">${kinds.map(k=>`<button class="${RP.kind===k[0]?"on":""}" onclick="RP.kind='${k[0]}';render()">${k[1]}</button>`).join("")}</div>
 <div class="card flt" style="margin-bottom:12px"><select onchange="RP.track=this.value;render()"><option value="">كل المسارات</option>${Object.entries(TRACKS).map(([k,t])=>`<option value="${k}" ${RP.track===k?"selected":""}>${t.short}</option>`).join("")}</select><select onchange="RP.cycle=this.value;render()"><option value="">كل الدورات</option>${Object.entries(CYC).map(([k,t])=>`<option value="${k}" ${RP.cycle===k?"selected":""}>${t}</option>`).join("")}</select></div>`;
 if(RP.kind==="budget"){const b=budget();cols=null;window._csv=[["التقسيم","الموظفون","المخصص","ر1","ر2","ر3","ر4","المصروف","التزامات","الرصيد"]].concat(participating().map(u=>{const m=unitMoney(u.id);return [u.name,u.employees,m.alloc,m.byQ.Q1,m.byQ.Q2,m.byQ.Q3,m.byQ.Q4,m.paid,m.committed,m.balance]}));
  return flt+exportBar()+`<div class="card small">ملف الميزانية جاهز للتصدير (${participating().length} تقسيماً). المعاينة في شاشة <a href="#budget">الميزانية</a>.</div>`}
 if(RP.kind==="cert"){const h=ns.filter(n=>n.status==="honored").slice(0,30);return flt+`<div class="card tw"><table class="rtable"><tbody>${h.map(n=>`<tr><td data-l="الاسم">${esc(n.emp.name)}</td><td data-l="المسار">${tk(n.track)}</td><td data-l="الدورة">${CYC[n.cycle]}</td><td><button class="btn o s" onclick="cert('${n.id}')">معاينة الشهادة</button></td></tr>`).join("")||'<tr><td class="empty">لا يوجد مكرّمون بعد</td></tr>'}</tbody></table></div>`}
 window._csv=[cols.map(c=>c[0])].concat(list.map(n=>cols.map(c=>c[1](n))));
 const gate=RP.kind==="pub"&&!pv;
 return flt+`<div class="alert i" style="margin-bottom:10px"><div>${note||"تصدير للتحليل."} عدد السجلات: <b>${list.length}</b></div></div>
 ${RP.kind==="pub"?(pv?`<div class="alert ok" style="margin-bottom:10px"><div>نسخة النشر معتمدة: ${esc(pv.by)} — ${esc(pv.at)} (${pv.count} اسماً). لا تُنشر تلقائياً.</div></div>`:`<div class="card" style="margin-bottom:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="flex:1">راجع الأسماء أدناه ثم اعتمد نسخة النشر لتفعيل الإخراج.</span>${isC?`<button class="btn g" onclick="approvePub(${list.length})">اعتماد نسخة النشر</button>`:'<span class="small muted">الاعتماد للفريق المركزي</span>'}</div>`):""}
 ${gate?"":exportBar()}
 <div class="card tw"><table class="rtable"><thead><tr>${cols.map(c=>`<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${list.map(n=>`<tr>${cols.map(c=>`<td data-l="${c[0]}">${esc(c[1](n))}</td>`).join("")}</tr>`).join("")||`<tr><td class="empty" colspan="${cols.length}">لا توجد سجلات</td></tr>`}</tbody></table></div>`;
};
function exportBar(){return `<div class="card flt noprint" style="margin-bottom:10px"><button class="btn" onclick="downloadXlsx()">تنزيل Excel</button><button class="btn o" onclick="window.print()">طباعة / PDF</button></div>`}
function downloadXlsx(){if(!window.XLSX){toast("مكتبة Excel غير محمّلة");return}const ws=XLSX.utils.aoa_to_sheet(window._csv);ws["!views"]=[{RTL:true}];const wb=XLSX.utils.book_new();wb.Workbook={Views:[{RTL:true}]};XLSX.utils.book_append_sheet(wb,ws,"البيانات");XLSX.writeFile(wb,"حوافز-الإجادة-"+S.year+"-"+(RP.kind||"تقرير")+".xlsx")}
function cert(id){const n=S.noms.find(x=>x.id===id);modal(`<div class="cert" id="certBox"><img class="lgimg" src="brand/logo.png" alt="" onerror="this.style.display='none'"><div class="small" style="color:#00827a;letter-spacing:.5px">وزارة الإسكان والتخطيط العمراني</div><h4 style="margin-top:6px">شهادة تقدير</h4><div class="small">تتقدم الوزارة بخالص الشكر والتقدير إلى</div><div class="nm">${esc(n.emp.name)}</div><div>لفوزه بجائزة <b>${TRACKS[n.track].name}</b> — ${CYC[n.cycle]} ${n.year}</div><div class="small muted" style="margin-top:6px">${esc(unit(n.unitId).name)}</div><div class="small muted" style="margin-top:18px">فريق الإجادة المؤسسية · ${esc(n.honoredAt||"")}</div></div><div class="ft noprint"><button class="btn" onclick="document.body.classList.add('printcert');window.print();document.body.classList.remove('printcert')">طباعة / PDF</button><button class="btn o" onclick="closeModal()">إغلاق</button></div>`)}


/* ---- Settings ---- */
V.settings=()=>{
 const cfg=yearCfg(S.year);const b=budget();
 const unitOpts=sel=>`<option value="">—</option>`+S.units.map(x=>`<option value="${x.id}" ${sel===x.id?"selected":""}>${esc(x.short)}</option>`).join("");
 return `<div class="grid g2"><div class="card"><h3 style="font-size:16px">السنة ${S.year}</h3>
 <div class="form" style="margin-top:10px"><div class="f"><label>إجمالي موظفي الوزارة المعتمد للحساب</label><input type="number" min="0" value="${cfg.approvedTotal}" onchange="saveYear({approved_total:+this.value})"></div>
 <div class="f"><label>التاريخ المرجعي للأعداد</label><input type="date" value="${cfg.refDate}" onchange="saveYear({ref_date:this.value||null})"></div></div>
 <div class="flt" style="margin-top:10px"><button class="btn o s" onclick="newYear()">فتح سنة جديدة</button></div></div>
 <div class="card"><h3 style="font-size:16px">الجهات المشمولة بخدمة المستفيدين</h3><p class="small" style="margin:6px 0 0">${S.units.filter(bsEligible).map(u=>esc(u.short)).join("، ")||"—"}</p><p class="small muted">العدد: ${bsUnitsCount()} جهة</p></div></div>
 <div class="sec"><h2>المستخدمون</h2><span class="sp"></span><button class="btn s" onclick="userForm()">إضافة مستخدم</button></div>
 <div class="card tw"><table class="rtable"><thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>التقسيم</th><th>الحالة</th><th></th></tr></thead><tbody>${S.users.map(x=>`<tr><td data-l="الاسم">${esc(x.name)}</td><td data-l="البريد" class="num" dir="ltr" style="text-align:right">${esc(x.email)||"—"}</td><td data-l="الدور">${ROLE_NAMES[x.role]}</td><td data-l="التقسيم">${x.unitId?esc(unit(x.unitId).short):"—"}</td><td data-l="الحالة">${x.claimed?'<span class="pill st-approved">مفعّل</span>':`<span class="pill st-needs_info">رمز التفعيل: <b class="num" dir="ltr">${esc(x.inviteCode)}</b></span>`}</td><td>${x.id!==S.me.id?`<button class="btn o s" onclick="delUser('${x.id}')">حذف</button>`:""}</td></tr>`).join("")}</tbody></table></div>
 <p class="small muted">أرسل لكل مستخدم رابط المنصة ورمز التفعيل الخاص به. يفعّل حسابه مرة واحدة ببريده وكلمة مرور يختارها، فيظهر له تقسيمه تلقائياً.</p>
 <div class="sec"><h2>التقسيمات وأعداد الموظفين</h2><span class="sp"></span><button class="btn s" onclick="unitForm()">إضافة تقسيم</button></div>
 ${b.diff?`<div class="alert w" style="margin-bottom:10px">${IC.warn}<div>مجموع موظفي التقسيمات المشمولة ${fn(b.empSum)} ≠ العدد المعتمد ${fn(b.approvedTotal)}</div></div>`:""}
 <div class="card tw"><table class="rtable"><thead><tr><th>التقسيم</th><th>الموظفون</th><th>التقسيم الأعلى</th><th>محسوب ضمن الأعلى</th><th>خدمة المستفيدين</th><th>المنافذ</th></tr></thead><tbody>
 ${S.units.map(u=>`<tr><td data-l="التقسيم"><input class="inp" style="min-width:200px" value="${esc(u.name)}" onchange="saveUnit('${u.id}',{name:this.value})"></td><td data-l="الموظفون"><input class="inp num" style="width:90px" type="number" min="0" value="${u.employees}" onchange="saveUnit('${u.id}',{employees:+this.value||0})"></td>
 <td data-l="الأعلى"><select class="inp" onchange="saveUnit('${u.id}',{parent_id:this.value||null})">${unitOpts(u.parent).replace(`<option value="${u.id}"`,`<option disabled value="${u.id}"`)}</select></td>
 <td data-l="ضمن الأعلى"><input type="checkbox" ${u.inParent?"checked":""} ${u.parent?"":"disabled"} onchange="saveUnit('${u.id}',{in_parent:this.checked})"></td>
 <td data-l="خدمة المستفيدين"><input type="checkbox" ${bsEligible(u)?"checked":""} ${u.type==="regional"||u.type==="customer"?"disabled":""} onchange="saveUnit('${u.id}',{bs:this.checked})"></td>
 <td data-l="المنافذ"><input class="inp" style="min-width:180px" value="${esc(u.outlets.join("، "))}" placeholder="افصل بفاصلة" onchange="saveUnit('${u.id}',{outlets:this.value.split(/[,،]/).map(x=>x.trim()).filter(Boolean)})"></td></tr>`).join("")}</tbody></table></div>
 <div class="sec"><h2>سجل الموظفين</h2></div>
 <div class="card"><p class="small" style="margin-top:0">${S.employees.length?fn(S.employees.length)+" موظفاً مسجلاً":"لم يُستورد سجل الموظفين بعد"}. عند كتابة الرقم الوظيفي في الاستمارة يظهر الاسم والمسمى تلقائياً.</p>
 <p class="small muted">الصق من Excel بالترتيب: الرقم الوظيفي، الاسم، المسمى الوظيفي، رمز التقسيم أو اسمه.</p><textarea id="empimp" class="inp" style="width:100%;min-height:80px"></textarea><div class="flt" style="margin-top:8px"><button class="btn" onclick="importEmps()">استيراد</button></div></div>`;
};
async function saveYear(patch){await run(async()=>{await api.upsertYear({year:S.year,...patch});await reload()},"حُفظ");render()}
async function newYear(){const y=S.year+1;if(S.years[y]){toast("السنة "+y+" موجودة");return}
 await run(async()=>{await api.upsertYear({year:y,approved_total:yearCfg(S.year).approvedTotal});
  for(const [c,d] of [["Q1","03-31"],["Q2","06-30"],["Q3","09-30"],["Q4","12-10"],["H1","06-30"],["H2","12-15"]])await api.upsertCycle({year:y,code:c,close_date:y+"-"+d,open:false});
  S.year=y;await reload()},"فُتحت السنة "+y);render()}
async function saveUnit(id,patch){await run(async()=>{await api.updateUnit(id,patch);await reload()},"حُفظ");render()}
function unitForm(){modal(`<h3>إضافة تقسيم</h3><div class="form"><div class="f w"><label>اسم التقسيم</label><input id="nun"></div><div class="f"><label>الاسم المختصر</label><input id="nus"></div>
 <div class="f"><label>النوع</label><select id="nut"><option value="central">مديرية / دائرة مركزية</option><option value="office">مكتب</option><option value="regional">مديرية إقليمية</option></select></div>
 <div class="f"><label>عدد الموظفين</label><input id="nue" type="number" min="0" value="0"></div><div class="f"><label>التقسيم الأعلى</label><select id="nup"><option value="">—</option>${S.units.map(x=>`<option value="${x.id}">${esc(x.short)}</option>`).join("")}</select></div></div>
 <div class="ft"><button class="btn g" onclick="addUnit()">إضافة</button><button class="btn o" onclick="closeModal()">إلغاء</button></div>`)}
async function addUnit(){const name=$("#nun").value.trim();if(!name){toast("أدخل اسم التقسيم");return}
 const row={id:"u-"+Date.now().toString(36),name,short:$("#nus").value.trim()||name,type:$("#nut").value,employees:+$("#nue").value||0,parent_id:$("#nup").value||null};
 closeModal();await run(async()=>{await api.addUnit(row);await reload()},"أُضيف التقسيم");render()}
function userForm(){modal(`<h3>إضافة مستخدم</h3><div class="form"><div class="f"><label>الاسم</label><input id="un"></div><div class="f"><label>البريد الإلكتروني</label><input id="ue" type="email" dir="ltr"></div>
 <div class="f"><label>الدور</label><select id="ur" onchange="document.getElementById('uuw').style.display=this.value==='dg'?'':'none'">${Object.entries(ROLE_NAMES).map(([k,v])=>`<option value="${k}" ${k==="dg"?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="f" id="uuw"><label>التقسيم</label><select id="uu">${participating().map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select></div></div>
 <div class="ft"><button class="btn g" onclick="saveUser()">إضافة</button><button class="btn o" onclick="closeModal()">إلغاء</button></div>`)}
async function saveUser(){const name=$("#un").value.trim(),email=$("#ue").value.trim().toLowerCase(),role=$("#ur").value,uid=$("#uu").value;
 if(!name||!/^\S+@\S+\.\S+$/.test(email)){toast("أدخل الاسم وبريداً صحيحاً");return}
 if(role==="dg"&&S.users.some(x=>x.role==="dg"&&x.unitId===uid)){toast("هذا التقسيم مرتبط بمدير عام مسجل");return}
 let rec=null;closeModal();
 const ok=await run(async()=>{rec=await api.addUser({name,email,role,unit_id:role==="dg"?uid:null});await reload()});
 render();if(ok&&rec)modal(`<h3>أُضيف المستخدم</h3><p>أرسل إلى <b>${esc(name)}</b> رابط المنصة ورمز التفعيل:</p><div class="card" style="text-align:center;font-size:26px;font-weight:900;letter-spacing:3px" dir="ltr">${esc(rec.invite_code)}</div><p class="small muted">يفعّل حسابه من «تفعيل حساب جديد» بالبريد ${esc(email)} وكلمة مرور يختارها.</p><div class="ft"><button class="btn" onclick="copyInvite('${esc(name)}','${esc(rec.invite_code)}','${esc(email)}')">نسخ رسالة الدعوة</button><button class="btn o" onclick="closeModal()">إغلاق</button></div>`)}
function copyInvite(name,code,email){const t=`السلام عليكم ${name}،\nتم تسجيلكم في منصة حوافز الإجادة المؤسسية.\nالرابط: ${location.origin+location.pathname}\nاختر «تفعيل حساب جديد» وأدخل بريدكم (${email}) وكلمة مرور تختارونها ورمز التفعيل: ${code}\nفريق الإجادة المؤسسية`;navigator.clipboard.writeText(t).then(()=>toast("نُسخت رسالة الدعوة"),()=>toast("تعذّر النسخ"))}
async function delUser(id){const x=S.users.find(u=>u.id===id);modal(`<h3>حذف المستخدم</h3><p>سيُلغى وصول ${esc(x.name)} إلى المنصة. ترشيحات تقسيمه تبقى كما هي.</p><div class="ft"><button class="btn d" onclick="doDelUser('${id}')">حذف</button><button class="btn o" onclick="closeModal()">إلغاء</button></div>`)}
async function doDelUser(id){closeModal();await run(async()=>{await api.deleteUser(id);await reload()},"حُذف المستخدم");render()}
async function importEmps(){const lines=$("#empimp").value.split("\n").map(l=>l.trim()).filter(Boolean);const rows=[];let bad=0;
 lines.forEach(l=>{const p=l.split(/\t|,|،/).map(x=>x.trim());const u=S.units.find(x=>x.id===p[3]||x.name===p[3]||x.short===p[3]);if(p.length<4||!p[0]||!p[1]||!u){bad++;return}rows.push({emp_no:p[0],name:p[1],title:p[2],unit_id:u.id})});
 if(!rows.length){toast("لا توجد أسطر صالحة");return}
 await run(async()=>{for(let i=0;i<rows.length;i+=500)await api.upsertEmployees(rows.slice(i,i+500));await reload()},"استُورد "+rows.length+(bad?" — تعذّر "+bad+" سطراً":""));render()}


async function saveCycle(c,patch){const cur0=cycOf(S.year,c);await run(async()=>{await api.upsertCycle({year:S.year,code:c,close_date:patch.close_date??(cur0.close||null),open:patch.open??cur0.open});await reload()},"حُفظ");render()}
async function confirmClosing(){await run(async()=>{await api.upsertYear({year:S.year,closing_confirmed:today()+" — "+S.me.name});await reload()},"اعتُمد الإقفال");render()}
async function approvePub(count){await run(async()=>{await api.addPub({year:S.year,track:RP.track,cycle:RP.cycle,by_name:S.me.name,count});await reload()},"اعتُمدت نسخة النشر");render()}


let AUTH_TAB="in";
function showAuth(msg){
 document.body.classList.add("authmode");
 $("#auth").innerHTML=`<div class="authbox fadein"><img class="authlogo" src="brand/logo.png" alt="" onerror="this.style.display='none'"><h2>منصة حوافز الإجادة المؤسسية</h2><p class="muted small" style="margin:4px 0 16px">وزارة الإسكان والتخطيط العمراني</p>
 <div class="tabs"><button class="${AUTH_TAB==="in"?"on":""}" onclick="AUTH_TAB='in';showAuth()">تسجيل الدخول</button><button class="${AUTH_TAB==="up"?"on":""}" onclick="AUTH_TAB='up';showAuth()">تفعيل حساب جديد</button></div>
 ${msg?`<div class="alert w" style="margin-bottom:10px">${esc(msg)}</div>`:""}
 <div class="form" style="grid-template-columns:1fr">
 <div class="f"><label>البريد الإلكتروني</label><input id="aem" type="email" dir="ltr" autocomplete="email"></div>
 <div class="f"><label>كلمة المرور</label><input id="apw" type="password" dir="ltr" autocomplete="${AUTH_TAB==="in"?"current-password":"new-password"}"></div>
 ${AUTH_TAB==="up"?`<div class="f"><label>رمز التفعيل</label><input id="acode" dir="ltr" style="text-transform:uppercase;letter-spacing:2px"><span class="hint">يصلك من فريق الإجادة المؤسسية</span></div>`:""}
 <button class="btn" style="justify-content:center;padding:12px" onclick="${AUTH_TAB==="in"?"doLogin()":"doActivate()"}">${AUTH_TAB==="in"?"دخول":"تفعيل الحساب"}</button></div></div>`;
}
function showClaim(){document.body.classList.add("authmode");
 $("#auth").innerHTML=`<div class="authbox fadein"><h2>تفعيل الحساب</h2><p class="small muted">حسابك مسجّل الدخول لكنه غير مرتبط بالمنصة بعد. أدخل رمز التفعيل الذي وصلك من فريق الإجادة المؤسسية.</p>
 <div class="f"><label>رمز التفعيل</label><input id="acode" dir="ltr" style="text-transform:uppercase;letter-spacing:2px"></div>
 <div class="flt" style="margin-top:12px"><button class="btn" onclick="doClaim()">تفعيل</button><button class="btn o" onclick="logout()">خروج</button></div></div>`}
async function doLogin(){const e=$("#aem").value.trim().toLowerCase(),p=$("#apw").value;if(!e||!p){toast("أدخل البريد وكلمة المرور");return}
 const ok=await run(()=>api.signIn(e,p));if(ok)boot()}
async function doActivate(){const e=$("#aem").value.trim().toLowerCase(),p=$("#apw").value,c=$("#acode").value.trim();
 if(!e||!p||!c){toast("أدخل البريد وكلمة المرور ورمز التفعيل");return}if(p.length<8){toast("كلمة المرور 8 أحرف على الأقل");return}
 const ok=await run(async()=>{let d;try{d=await api.signUp(e,p)}catch(err){if(/already/i.test(err.message||""))d=await api.signIn(e,p);else throw err}
  if(!(d&&d.session)&&!(await api.session()))throw new Error("لم يكتمل التفعيل: يلزم إيقاف «Confirm email» في إعدادات Supabase");
  await api.claim(c)},"فُعّل الحساب");if(ok)boot()}
async function doClaim(){const c=$("#acode").value.trim();if(!c){toast("أدخل رمز التفعيل");return}const ok=await run(()=>api.claim(c),"فُعّل الحساب");if(ok)boot()}
async function boot(){
 try{
  if(!api)api=window.API||makeApi();
  const s=await api.session();if(!s){showAuth();return}
  await reload();if(!S.me){showClaim();return}
  document.body.classList.remove("authmode");$("#auth").innerHTML="";buildUser();
  if(!location.hash)location.hash="home";render();
 }catch(e){showAuth(errMsg(e))}
}

function empLookup(el){const e=S.employees.find(x=>x.empNo===el.value.trim());const f=$("#frm");const h=document.getElementById("empHint");if(!e){if(h)h.textContent=S.employees.length?"الرقم غير موجود في سجل الموظفين":"";return}
 if(e.unitId!==S.role.unitId){if(h)h.textContent="الموظف ليس من تقسيمك";return}f.name.value=e.name;f.title.value=e.title;if(h)h.textContent="✓ "+e.name}
/* ============ RENDER ============ */
function render(){
 const k=cur();buildNav();$("#title").textContent=ROUTES[k][0];
 const v=$("#view");v.innerHTML=V[k]();v.classList.remove("fadein");void v.offsetWidth;v.classList.add("fadein");
 countUp(v);if(k==="mobform"||k==="bsform")calcScore();
 $("#side").classList.remove("open");window.scrollTo(0,0);
}
window.addEventListener("hashchange",()=>{if(!/form/.test(cur()))editId=null;render()});
$("#menuBtn").onclick=()=>$("#side").classList.toggle("open");
$("#yearSel").onchange=e=>{S.year=+e.target.value;render()};
boot();
