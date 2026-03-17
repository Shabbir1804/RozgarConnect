// ═══════════════════════════════════════════════════════════════
// ROZGARCONNECT — Complete App (Backend + Frontend in one file)
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const { v4: uid } = require('uuid');

const app    = express();
const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'rozgar_secret_2024';

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── IN-MEMORY DATABASE ───────────────────────────────────────────
const DB = { workers: [], employers: [], jobs: [], matches: [] };

// Seed demo data on startup
const demoWorkers = [
  { _id:uid(), name:'Ramesh Kumar',  phone:'9876543210', skill:'salesboy',      skill_name:'Salesboy',         icon:'🛍', ask:12000, type:'monthly', city:'Lucknow',   state:'UP',    rating:4.8, verified:true,  exp:3, available:true, views:42 },
  { _id:uid(), name:'Sunita Devi',   phone:'9876543211', skill:'cook',          skill_name:'Cook',             icon:'🍳', ask:9000,  type:'monthly', city:'Patna',     state:'Bihar', rating:4.5, verified:false, exp:2, available:true, views:28 },
  { _id:uid(), name:'Mukesh Yadav',  phone:'9876543212', skill:'construction',  skill_name:'Construction',     icon:'🏗', ask:550,   type:'daily',   city:'Varanasi',  state:'UP',    rating:4.6, verified:true,  exp:5, available:true, views:55 },
  { _id:uid(), name:'Priya Singh',   phone:'9876543213', skill:'tailor',        skill_name:'Tailor',           icon:'🧵', ask:8000,  type:'monthly', city:'Jaipur',    state:'Raj',   rating:0,   verified:false, exp:0, available:true, views:10 },
  { _id:uid(), name:'Arjun Patel',   phone:'9876543214', skill:'driver',        skill_name:'Driver',           icon:'🚗', ask:15000, type:'monthly', city:'Bhopal',    state:'MP',    rating:4.3, verified:true,  exp:4, available:true, views:33 },
  { _id:uid(), name:'Ravi Sharma',   phone:'9876543215', skill:'electrician',   skill_name:'Electrician',      icon:'⚡', ask:600,   type:'daily',   city:'Lucknow',   state:'UP',    rating:4.2, verified:false, exp:3, available:true, views:19 },
  { _id:uid(), name:'Geeta Kumari',  phone:'9876543216', skill:'housekeeping',  skill_name:'Housekeeping',     icon:'🧹', ask:7000,  type:'monthly', city:'Gaya',      state:'Bihar', rating:4.7, verified:true,  exp:6, available:true, views:61 },
  { _id:uid(), name:'Meena Devi',    phone:'9876543218', skill:'babysitter',    skill_name:'Baby Sitter',      icon:'🍼', ask:6000,  type:'monthly', city:'Kanpur',    state:'UP',    rating:4.9, verified:true,  exp:7, available:true, views:78 },
  { _id:uid(), name:'Vijay Maurya',  phone:'9876543219', skill:'security_guard',skill_name:'Security Guard',   icon:'🛡', ask:10000, type:'monthly', city:'Allahabad', state:'UP',    rating:4.1, verified:false, exp:8, available:true, views:35 },
  { _id:uid(), name:'Deepa Rani',    phone:'9876543220', skill:'tailor',        skill_name:'Tailor',           icon:'🧵', ask:9500,  type:'monthly', city:'Lucknow',   state:'UP',    rating:4.4, verified:true,  exp:4, available:true, views:29 },
  { _id:uid(), name:'Santosh Kumar', phone:'9876543221', skill:'plumber',       skill_name:'Plumber',          icon:'🔧', ask:650,   type:'daily',   city:'Patna',     state:'Bihar', rating:4.0, verified:false, exp:6, available:true, views:17 },
  { _id:uid(), name:'Kavita Sharma', phone:'9876543222', skill:'cook',          skill_name:'Cook',             icon:'🍳', ask:10000, type:'monthly', city:'Jaipur',    state:'Raj',   rating:4.6, verified:true,  exp:5, available:true, views:44 },
];
const demoEmployers = [
  { _id:uid(), biz:'Ram Electronics', owner:'Ram Gupta',    phone:'8888800001', type:'retail',       city:'Lucknow', state:'UP',    rating:4.5, verified:true,  plan:'super' },
  { _id:uid(), biz:'Singh Builders',  owner:'Vikram Singh', phone:'8888800002', type:'construction', city:'Patna',   state:'Bihar', rating:4.2, verified:false, plan:'free'  },
  { _id:uid(), biz:'Gupta Kirana',    owner:'Deepak Gupta', phone:'8888800003', type:'retail',       city:'Jaipur',  state:'Raj',   rating:3.8, verified:false, plan:'free'  },
];
demoWorkers.forEach(w => DB.workers.push(w));
demoEmployers.forEach(e => DB.employers.push(e));
DB.jobs.push({ _id:uid(), emp_id:demoEmployers[0]._id, emp_name:'Ram Electronics', title:'Salesboy for Mobile Shop', skill:'salesboy', icon:'🛍', bid_low:10000, bid_high:14000, type:'monthly', desc:'Mobile shop 9am-6pm, good commission', city:'Lucknow', radius:10, status:'active', boosted:true,  views:23, likes:4, created:new Date() });
DB.jobs.push({ _id:uid(), emp_id:demoEmployers[1]._id, emp_name:'Singh Builders',  title:'Construction Mazdoor',      skill:'construction', icon:'🏗', bid_low:500, bid_high:650, type:'daily', desc:'Building site work daily wages', city:'Patna', radius:15, status:'active', boosted:false, views:11, likes:2, created:new Date() });
DB.jobs.push({ _id:uid(), emp_id:demoEmployers[2]._id, emp_name:'Gupta Kirana',    title:'Kirana Shop Helper',        skill:'kirana_helper', icon:'📦', bid_low:8000, bid_high:11000, type:'monthly', desc:'Help manage store and stock', city:'Jaipur', radius:5, status:'active', boosted:false, views:7, likes:1, created:new Date() });
console.log('✅ RozgarConnect ready —', DB.workers.length, 'workers,', DB.employers.length, 'employers,', DB.jobs.length, 'jobs');

// ── AUTH HELPER ──────────────────────────────────────────────────
const sign = p => jwt.sign(p, SECRET, { expiresIn: '30d' });
const auth = (req, res, next) => {
  const t = req.headers.authorization?.split(' ')[1];
  if (!t) return res.status(401).json({ error: 'Login karein pehle' });
  try { req.user = jwt.verify(t, SECRET); next(); }
  catch { res.status(401).json({ error: 'Session expire hua, dobara login karein' }); }
};

// ── CATEGORIES ───────────────────────────────────────────────────
const CATS = [
  {id:'salesboy',name:'Salesboy / Sales Girl',icon:'🛍'},{id:'shop_helper',name:'Shop Helper',icon:'🏪'},
  {id:'kirana_helper',name:'Kirana Store Helper',icon:'📦'},{id:'medical_store',name:'Medical Store Helper',icon:'💊'},
  {id:'construction',name:'Construction Worker',icon:'🏗'},{id:'mason',name:'Mason / Raj Mistri',icon:'🧱'},
  {id:'painter',name:'Painter',icon:'🎨'},{id:'carpenter',name:'Carpenter / Badhai',icon:'🪚'},
  {id:'electrician',name:'Electrician',icon:'⚡'},{id:'plumber',name:'Plumber',icon:'🔧'},
  {id:'welder',name:'Welder / Lohar',icon:'🔩'},{id:'delivery',name:'Delivery Worker',icon:'🚚'},
  {id:'driver',name:'Driver / Chalak',icon:'🚗'},{id:'truck_driver',name:'Truck Driver',icon:'🚜'},
  {id:'warehouse',name:'Warehouse Worker',icon:'📦'},{id:'cook',name:'Cook / Chef',icon:'🍳'},
  {id:'halwai',name:'Halwai / Mithai',icon:'🫓'},{id:'waiter',name:'Waiter / Hotel Staff',icon:'🍽'},
  {id:'factory',name:'Factory Worker',icon:'🏭'},{id:'tailor',name:'Tailor / Darzi',icon:'🧵'},
  {id:'machine_operator',name:'Machine Operator',icon:'⚙'},{id:'housekeeping',name:'Housekeeping / Maid',icon:'🧹'},
  {id:'babysitter',name:'Baby Sitter / Aya',icon:'🍼'},{id:'gardener',name:'Gardener / Mali',icon:'🌿'},
  {id:'dhobi',name:'Washerman / Dhobi',icon:'🚿'},{id:'mobile_repair',name:'Mobile Repair',icon:'📱'},
  {id:'ac_repair',name:'AC / Fridge Repair',icon:'❄'},{id:'barber',name:'Barber / Nai',icon:'💇'},
  {id:'beautician',name:'Beautician',icon:'💆'},{id:'agriculture',name:'Agriculture Worker',icon:'🌾'},
  {id:'dairy',name:'Dairy Worker',icon:'🐄'},{id:'security_guard',name:'Security Guard',icon:'🛡'},
  {id:'office_peon',name:'Office Peon',icon:'🧑‍💼'},{id:'tutor',name:'Tutor / Teacher',icon:'📚'},
  {id:'photographer',name:'Photographer',icon:'📷'},
];
app.get('/api/categories', (_, res) => res.json({ categories: CATS }));
app.get('/api/health', (_, res) => res.json({ status:'ok', workers:DB.workers.length, employers:DB.employers.length, jobs:DB.jobs.length }));

// ── AUTH ROUTES ──────────────────────────────────────────────────
app.post('/api/auth/register/worker', (req, res) => {
  const { name, phone, skill, ask, type, exp, city, state } = req.body;
  if (!name||!phone||!skill||!ask) return res.status(400).json({ error:'Name, phone, skill aur salary zaroori hai' });
  if (DB.workers.find(w=>w.phone===phone)) return res.status(409).json({ error:'Yeh phone already registered hai — Login karein' });
  const cat = CATS.find(c=>c.id===skill);
  const w = { _id:uid(), name, phone, skill, skill_name:cat?.name||skill, icon:cat?.icon||'💼', ask:Number(ask), type:type||'monthly', city:city||'', state:state||'', exp:Number(exp)||0, rating:0, verified:false, available:true, views:0, created:new Date() };
  DB.workers.push(w);
  res.status(201).json({ ok:true, token:sign({id:w._id,role:'worker'}), user:w, role:'worker' });
});

app.post('/api/auth/register/employer', (req, res) => {
  const { biz, owner, phone, whatsapp, type, city, state } = req.body;
  if (!biz||!owner||!phone) return res.status(400).json({ error:'Business name, owner name aur phone zaroori hai' });
  if (DB.employers.find(e=>e.phone===phone)) return res.status(409).json({ error:'Yeh phone already registered hai — Login karein' });
  const e = { _id:uid(), biz, owner, phone, whatsapp:whatsapp||phone, type:type||'retail', city:city||'', state:state||'', rating:0, verified:false, plan:'free', created:new Date() };
  DB.employers.push(e);
  res.status(201).json({ ok:true, token:sign({id:e._id,role:'employer'}), user:e, role:'employer' });
});

app.post('/api/auth/login/worker', (req, res) => {
  const w = DB.workers.find(w=>w.phone===req.body.phone);
  if (!w) return res.status(404).json({ error:'Is phone se koi worker registered nahi hai' });
  res.json({ ok:true, token:sign({id:w._id,role:'worker'}), user:w, role:'worker' });
});

app.post('/api/auth/login/employer', (req, res) => {
  const e = DB.employers.find(e=>e.phone===req.body.phone);
  if (!e) return res.status(404).json({ error:'Is phone se koi employer registered nahi hai' });
  res.json({ ok:true, token:sign({id:e._id,role:'employer'}), user:e, role:'employer' });
});

app.get('/api/auth/me', auth, (req, res) => {
  const u = req.user.role==='worker' ? DB.workers.find(w=>w._id===req.user.id) : DB.employers.find(e=>e._id===req.user.id);
  u ? res.json({role:req.user.role,user:u}) : res.status(404).json({error:'Not found'});
});

// ── WORKER ROUTES ────────────────────────────────────────────────
app.get('/api/workers', auth, (req, res) => {
  let w = DB.workers.filter(x=>x.available);
  if (req.query.skill) w = w.filter(x=>x.skill===req.query.skill);
  if (req.query.city)  w = w.filter(x=>x.city?.toLowerCase().includes(req.query.city.toLowerCase()));
  res.json({ workers:w.sort((a,b)=>b.rating-a.rating), total:w.length });
});
app.get('/api/workers/:id', auth, (req,res)=>{
  const w=DB.workers.find(w=>w._id===req.params.id);
  if(!w) return res.status(404).json({error:'Not found'});
  w.views=(w.views||0)+1; res.json({worker:w});
});
app.patch('/api/workers/:id/availability', auth, (req,res)=>{
  const w=DB.workers.find(w=>w._id===req.params.id);
  if(!w) return res.status(404).json({error:'Not found'});
  w.available=!w.available;
  res.json({available:w.available, message:`Ab aap ${w.available?'available':'unavailable'} hain`});
});
app.patch('/api/workers/:id/ask', auth, (req,res)=>{
  const w=DB.workers.find(w=>w._id===req.params.id);
  if(!w) return res.status(404).json({error:'Not found'});
  w.ask=Number(req.body.ask);
  res.json({message:'ASK price update ho gayi!', ask:w.ask});
});
app.post('/api/workers/:id/fetch', auth, (req,res)=>{
  if(req.user.role!=='employer') return res.status(403).json({error:'Employers only'});
  const w=DB.workers.find(w=>w._id===req.params.id);
  if(!w) return res.status(404).json({error:'Not found'});
  res.json({ok:true, name:w.name, phone:w.phone, city:w.city, skill:w.skill_name, ask:w.ask, rating:w.rating, charge:'₹29'});
});

// ── JOB ROUTES ───────────────────────────────────────────────────
app.post('/api/jobs', auth, (req,res)=>{
  if(req.user.role!=='employer') return res.status(403).json({error:'Employers only'});
  const {title,skill,bid_low,bid_high,type,desc,city,radius} = req.body;
  if(!skill||!bid_high) return res.status(400).json({error:'Skill aur max salary zaroori hai'});
  const emp=DB.employers.find(e=>e._id===req.user.id);
  const cat=CATS.find(c=>c.id===skill);
  const job={ _id:uid(), emp_id:req.user.id, emp_name:emp?.biz||'Employer', title:title||cat?.name||skill, skill, icon:cat?.icon||'💼', bid_low:Number(bid_low)||0, bid_high:Number(bid_high), type:type||'monthly', desc:desc||'', city:city||emp?.city||'', radius:Number(radius)||10, status:'active', boosted:false, views:0, likes:0, created:new Date() };
  DB.jobs.push(job);
  const eligible=DB.workers.filter(w=>w.available&&w.skill===job.skill&&w.ask<=job.bid_high&&w.type===job.type);
  res.status(201).json({ok:true, message:`Job post ho gayi! ${eligible.length} workers eligible hain!`, job, eligible_count:eligible.length});
});
app.get('/api/jobs', (req,res)=>{
  let j=DB.jobs.filter(x=>x.status==='active');
  if(req.query.skill) j=j.filter(x=>x.skill===req.query.skill);
  res.json({jobs:j.sort((a,b)=>b.boosted-a.boosted||new Date(b.created)-new Date(a.created)),total:j.length});
});
app.get('/api/jobs/feed', auth, (req,res)=>{
  if(req.user.role!=='worker') return res.status(403).json({error:'Workers only'});
  const w=DB.workers.find(w=>w._id===req.user.id);
  if(!w) return res.status(404).json({error:'Not found'});
  const jobs=DB.jobs.filter(j=>j.status==='active'&&j.bid_high>=w.ask&&j.type===w.type).sort((a,b)=>b.boosted-a.boosted);
  res.json({jobs, worker_ask:w.ask, total:jobs.length});
});
app.get('/api/jobs/mine', auth, (req,res)=>{
  res.json({jobs:DB.jobs.filter(j=>j.emp_id===req.user.id).sort((a,b)=>new Date(b.created)-new Date(a.created))});
});
app.post('/api/jobs/:id/like/:wid', auth, (req,res)=>{
  if(req.user.role!=='employer') return res.status(403).json({error:'Employers only'});
  if(DB.matches.find(m=>m.emp_id===req.user.id&&m.w_id===req.params.wid&&m.job_id===req.params.id))
    return res.status(409).json({error:'Pehle se like kar diya hai'});
  const m={_id:uid(),emp_id:req.user.id,w_id:req.params.wid,job_id:req.params.id,score:75,status:'liked',unlocked:false,created:new Date()};
  DB.matches.push(m);
  res.status(201).json({ok:true,message:'Worker ko like kar diya!',match:m});
});

// ── MATCH ROUTES ─────────────────────────────────────────────────
app.get('/api/matches', auth, (req,res)=>{
  let m;
  if(req.user.role==='worker'){
    m=DB.matches.filter(x=>x.w_id===req.user.id).map(x=>{
      const e=DB.employers.find(e=>e._id===x.emp_id), j=DB.jobs.find(j=>j._id===x.job_id);
      return{...x,emp:{biz:e?.biz,city:e?.city,rating:e?.rating},job:{title:j?.title,skill:j?.skill,bid_high:j?.bid_high,type:j?.type}};
    });
  } else {
    m=DB.matches.filter(x=>x.emp_id===req.user.id).map(x=>{
      const w=DB.workers.find(w=>w._id===x.w_id), j=DB.jobs.find(j=>j._id===x.job_id);
      return{...x,worker:{name:w?.name,skill:w?.skill_name,icon:w?.icon,ask:w?.ask,city:w?.city,rating:w?.rating,verified:w?.verified,phone:x.unlocked?w?.phone:null},job:{title:j?.title}};
    });
  }
  res.json({matches:m.sort((a,b)=>new Date(b.created)-new Date(a.created)),total:m.length});
});
app.patch('/api/matches/:id/accept', auth, (req,res)=>{
  const m=DB.matches.find(m=>m._id===req.params.id&&m.w_id===req.user.id);
  if(!m) return res.status(404).json({error:'Not found'});
  m.status='matched'; m.unlocked=true;
  res.json({ok:true,message:'🎉 Match ho gaya! Employer ko notify kar diya.',match:m});
});
app.patch('/api/matches/:id/reject', auth, (req,res)=>{
  const m=DB.matches.find(m=>m._id===req.params.id);
  if(!m) return res.status(404).json({error:'Not found'});
  m.status='rejected';
  res.json({ok:true,message:'Decline kar diya',match:m});
});

// ════════════════════════════════════════════════════════════════
// FRONTEND HTML — Complete Mobile App
// ════════════════════════════════════════════════════════════════
const HTML = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<meta name="theme-color" content="#FF6B00">
<title>RozgarConnect</title>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{--or:#FF6B00;--or2:#FF9933;--bg:#09111C;--s1:#0F1D2E;--s2:#162538;--s3:#1C2E45;--bd:#1E3050;--bd2:#264060;--gr:#00C853;--bl:#2979FF;--gd:#FFD600;--re:#FF1744;--cy:#00E5FF;--tx:#E8EDF5;--tm:#7A9CC0;--td:#2A4060;--fn:'Baloo 2',sans-serif}
html,body{height:100%;overflow:hidden;background:var(--bg);color:var(--tx);font-family:var(--fn)}
#app{height:100vh;display:flex;flex-direction:column;max-width:480px;margin:0 auto}
.screen{display:none;flex:1;overflow-y:auto;flex-direction:column}
.screen.on{display:flex}
/* TOPBAR */
.topbar{background:var(--s1);border-bottom:1px solid var(--bd);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:30}
.topbar h1{font-size:17px;font-weight:800}.topbar h1 span{color:var(--or)}
.topbar-sub{font-size:10px;color:var(--tm);margin-top:1px}
.ibt{width:38px;height:38px;border-radius:50%;background:var(--s2);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer}
/* BOTTOM NAV */
.bnav{background:var(--s1);border-top:1px solid var(--bd);display:flex;flex-shrink:0;padding-bottom:env(safe-area-inset-bottom,0)}
.bt{flex:1;display:flex;flex-direction:column;align-items:center;padding:9px 4px 7px;cursor:pointer;border:none;background:none;color:var(--tm);font-family:var(--fn)}
.bt .bi{font-size:21px;margin-bottom:2px}.bt .bl{font-size:9px;font-weight:700}
.bt.on{color:var(--or)}
/* CARDS */
.card{background:var(--s2);border:1px solid var(--bd);border-radius:14px;margin-bottom:10px;overflow:hidden}
.card.boost{border-color:var(--gd)}
.px{padding:0 16px}.py{padding:14px 0}.p{padding:14px 16px}
/* INPUTS */
.ig{margin-bottom:13px}
.ig label{display:block;font-size:10px;font-weight:700;color:var(--tm);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.inp{width:100%;background:var(--s3);border:1.5px solid var(--bd);border-radius:9px;padding:12px 14px;color:var(--tx);font-family:var(--fn);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--or)}
.inp::placeholder{color:var(--td)}
select.inp option{background:var(--s2)}
.highlight-inp label{color:var(--or)!important}
.highlight-inp .inp{border-color:rgba(255,107,0,.3)}
/* BUTTONS */
.btn{width:100%;padding:13px;border-radius:11px;border:none;font-family:var(--fn);font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .15s}
.btn:active{transform:scale(.97)}
.btn-or{background:linear-gradient(135deg,var(--or),var(--or2));color:#fff;box-shadow:0 4px 18px rgba(255,107,0,.35)}
.btn-gr{background:rgba(0,200,83,.1);color:var(--gr);border:1.5px solid rgba(0,200,83,.25)}
.btn-out{background:transparent;color:var(--tm);border:1.5px solid var(--bd)}
.btn-sm{padding:7px 14px;font-size:11px;border-radius:8px;width:auto}
.btn-bl{background:rgba(41,121,255,.1);color:var(--bl);border:1.5px solid rgba(41,121,255,.25)}
/* PILLS */
.pill{padding:3px 9px;border-radius:20px;font-size:9px;font-weight:800;display:inline-flex;align-items:center;gap:3px}
.p-gr{background:rgba(0,200,83,.1);color:var(--gr)}
.p-or{background:rgba(255,107,0,.1);color:var(--or)}
.p-bl{background:rgba(41,121,255,.1);color:var(--bl)}
.p-gd{background:rgba(255,214,0,.1);color:var(--gd)}
/* AVATAR */
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex-shrink:0}
/* TOGGLE */
.tog{width:50px;height:27px;background:var(--bd);border-radius:14px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
.tog.on{background:var(--gr)}
.tog::after{content:'';width:21px;height:21px;background:#fff;border-radius:50%;position:absolute;top:3px;left:3px;transition:transform .2s;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.tog.on::after{transform:translateX(23px)}
/* SHEET */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:50;display:none;align-items:flex-end}
.overlay.on{display:flex}
.sheet{background:var(--s1);border-radius:20px 20px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0));width:100%;max-height:88vh;overflow-y:auto;animation:su .3s ease}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
.sh{width:38px;height:4px;background:var(--bd);border-radius:2px;margin:0 auto 18px}
.sheet h2{font-size:17px;font-weight:800;margin-bottom:14px}
/* TOAST */
#toast{position:fixed;bottom:calc(76px + env(safe-area-inset-bottom,0));left:50%;transform:translateX(-50%) translateY(12px);background:var(--s3);border:1px solid var(--bd2);border-radius:11px;padding:11px 18px;font-size:12px;font-weight:700;z-index:100;opacity:0;transition:all .3s;pointer-events:none;white-space:nowrap;max-width:90vw;text-align:center}
#toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
/* SPLASH */
#splash{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:200}
.sl{font-size:60px;margin-bottom:14px;animation:bob 1s ease infinite alternate}
@keyframes bob{to{transform:translateY(-8px)}}
.st{font-size:26px;font-weight:800;color:var(--or)}.ss{font-size:12px;color:var(--tm);margin-top:5px}
.sb{width:180px;height:3px;background:var(--bd);border-radius:3px;margin-top:28px;overflow:hidden}
.sf{height:100%;background:linear-gradient(90deg,var(--or),var(--or2));animation:lf 2s ease forwards}
@keyframes lf{to{width:100%}}
/* AUTH */
#auth{position:fixed;inset:0;background:var(--bg);z-index:100;overflow-y:auto;display:none}
.auth-inner{padding:32px 22px 50px;max-width:480px;margin:0 auto}
.auth-logo{text-align:center;margin-bottom:28px}
.auth-logo .ic{font-size:44px;margin-bottom:10px}
.auth-logo h1{font-size:22px;font-weight:800;color:var(--or)}
.auth-logo p{font-size:12px;color:var(--tm);margin-top:4px}
.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.role-card{background:var(--s2);border:2px solid var(--bd);border-radius:14px;padding:22px 14px;text-align:center;cursor:pointer;transition:all .2s}
.role-card:active{transform:scale(.97)}
.role-card.sel{border-color:var(--or);background:rgba(255,107,0,.05)}
.role-card .ri{font-size:40px;margin-bottom:9px}
.role-card h3{font-size:13px;font-weight:800}
.role-card p{font-size:10px;color:var(--tm);margin-top:3px}
.back-btn{background:none;border:none;color:var(--tm);font-size:19px;cursor:pointer;padding:0;margin-right:10px}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sec-title{font-size:10px;font-weight:800;color:var(--tm);text-transform:uppercase;letter-spacing:.08em;margin:18px 0 10px}
/* HOME BANNER */
.banner{padding:14px 16px;display:flex;align-items:center;justify-content:space-between}
.banner.worker{background:linear-gradient(135deg,rgba(255,107,0,.15),rgba(255,153,51,.08))}
.banner.employer{background:linear-gradient(135deg,rgba(255,214,0,.12),rgba(255,107,0,.08))}
/* STATS */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px 16px 0}
.stat{background:var(--s2);border:1px solid var(--bd);border-radius:11px;padding:12px 8px;text-align:center}
.stat .v{font-size:20px;font-weight:800}.stat .l{font-size:9px;color:var(--tm);margin-top:2px}
/* SECTION HEAD */
.sh2{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 8px}
.sh2 h2{font-size:14px;font-weight:800}
.sh2 a{font-size:11px;color:var(--or);cursor:pointer;font-weight:700}
/* JOB CARD */
.jcard{padding:14px 16px;border-bottom:1px solid var(--bd);cursor:pointer;transition:background .15s}
.jcard:last-child{border-bottom:none}.jcard:active{background:var(--s3)}
.jcard .jt{font-size:14px;font-weight:700;margin-bottom:3px}
.jcard .jm{font-size:11px;color:var(--tm);display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.jcard .jp{font-size:17px;font-weight:800;color:var(--gr);font-family:monospace}
/* WORKER CARD */
.wcard{padding:14px 16px;border-bottom:1px solid var(--bd)}
.wcard:last-child{border-bottom:none}
.wcard .wn{font-size:13px;font-weight:800}
.wcard .wm{font-size:10px;color:var(--tm);margin-top:1px}
.wcard .wp{font-size:15px;font-weight:800;color:var(--or);font-family:monospace}
/* MATCH CARD */
.mcard{padding:14px 16px;border-bottom:1px solid var(--bd);cursor:pointer}
.mcard:last-child{border-bottom:none}
/* EMPTY */
.empty{text-align:center;padding:48px 28px;color:var(--tm)}
.empty .ei{font-size:48px;margin-bottom:12px;opacity:.5}
.empty p{font-size:13px;line-height:1.6}
/* LOADER */
.loader{display:flex;align-items:center;justify-content:center;padding:36px;flex-direction:column;gap:12px}
.spin{width:32px;height:32px;border:3px solid var(--bd);border-top-color:var(--or);border-radius:50%;animation:sp .7s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
/* PROFILE */
.prof-head{padding:22px 18px;text-align:center;background:linear-gradient(135deg,var(--s1),var(--s2));border-bottom:1px solid var(--bd)}
::-webkit-scrollbar{width:0;height:0}
</style>
</head>
<body>

<!-- SPLASH -->
<div id="splash">
  <div class="sl">⚙</div>
  <div class="st">RozgarConnect</div>
  <div class="ss">नौकरी ढूंढो, काम दो</div>
  <div class="sb"><div class="sf"></div></div>
</div>

<!-- AUTH -->
<div id="auth">
  <div class="auth-inner">
    <div class="auth-logo">
      <div class="ic">⚙</div>
      <h1>RozgarConnect</h1>
      <p>नौकरी ढूंढो, काम दो</p>
    </div>

    <!-- Step 1: Role Select -->
    <div id="step-role">
      <div style="font-size:15px;font-weight:800;text-align:center;margin-bottom:16px">आप कौन हैं?</div>
      <div class="role-grid">
        <div class="role-card" onclick="pickRole('worker')" id="rc-worker">
          <div class="ri">👷</div>
          <h3>Job Seeker</h3>
          <p>नौकरी चाहिए</p>
        </div>
        <div class="role-card" onclick="pickRole('employer')" id="rc-employer">
          <div class="ri">🏪</div>
          <h3>Employer</h3>
          <p>कर्मचारी चाहिए</p>
        </div>
      </div>
    </div>

    <!-- Step 2: Worker Register -->
    <div id="step-worker-reg" style="display:none">
      <div style="display:flex;align-items:center;margin-bottom:18px">
        <button class="back-btn" onclick="backToRole()">←</button>
        <div style="font-size:15px;font-weight:800">👷 Worker Registration</div>
      </div>
      <div class="ig"><label>पूरा नाम *</label><input class="inp" id="wr-name" placeholder="जैसे Ramesh Kumar"></div>
      <div class="ig"><label>Phone Number *</label><input class="inp" id="wr-phone" type="tel" placeholder="+91 XXXXX XXXXX"></div>
      <div class="ig"><label>Skill / काम *</label>
        <select class="inp" id="wr-skill"><option value="">-- Select Skill --</option></select>
      </div>
      <div class="ig highlight-inp"><label>💰 ASK Price — आपकी न्यूनतम तनख्वाह *</label><input class="inp" id="wr-ask" type="number" placeholder="जैसे 12000"></div>
      <div class="row2">
        <div class="ig"><label>Salary Type</label>
          <select class="inp" id="wr-type"><option value="monthly">Monthly</option><option value="daily">Daily</option></select>
        </div>
        <div class="ig"><label>Experience</label>
          <select class="inp" id="wr-exp"><option value="0">Fresher</option><option value="1">1 year</option><option value="2">2 years</option><option value="3">3-5 years</option><option value="6">5+ years</option></select>
        </div>
      </div>
      <div class="row2">
        <div class="ig"><label>City</label><input class="inp" id="wr-city" placeholder="Lucknow"></div>
        <div class="ig"><label>State</label>
          <select class="inp" id="wr-state"><option>Uttar Pradesh</option><option>Bihar</option><option>Rajasthan</option><option>Madhya Pradesh</option><option>Jharkhand</option><option>West Bengal</option><option>Gujarat</option><option>Maharashtra</option><option>Haryana</option><option>Other</option></select>
        </div>
      </div>
      <button class="btn btn-or" onclick="registerWorker()">Register करें →</button>
      <div style="margin-top:10px"></div>
      <button class="btn btn-out" onclick="showLogin('worker')">पहले से Account है? Login करें</button>
    </div>

    <!-- Step 3: Employer Register -->
    <div id="step-emp-reg" style="display:none">
      <div style="display:flex;align-items:center;margin-bottom:18px">
        <button class="back-btn" onclick="backToRole()">←</button>
        <div style="font-size:15px;font-weight:800">🏪 Employer Registration</div>
      </div>
      <div class="ig"><label>Business / Shop Name *</label><input class="inp" id="er-biz" placeholder="जैसे Sharma Electronics"></div>
      <div class="ig"><label>Owner Name *</label><input class="inp" id="er-owner" placeholder="जैसे Ramesh Sharma"></div>
      <div class="ig"><label>Phone Number *</label><input class="inp" id="er-phone" type="tel" placeholder="+91 XXXXX XXXXX"></div>
      <div class="ig"><label>WhatsApp Number</label><input class="inp" id="er-wa" placeholder="Same or different"></div>
      <div class="ig"><label>Business Type</label>
        <select class="inp" id="er-type">
          <option value="retail">Retail Shop / दुकान</option>
          <option value="construction">Construction / निर्माण</option>
          <option value="factory">Factory / कारखाना</option>
          <option value="transport">Transport</option>
          <option value="restaurant">Restaurant / Dhaba</option>
          <option value="household">Household / घर</option>
          <option value="agriculture">Agriculture / खेती</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="row2">
        <div class="ig"><label>City</label><input class="inp" id="er-city" placeholder="Lucknow"></div>
        <div class="ig"><label>State</label>
          <select class="inp" id="er-state"><option>Uttar Pradesh</option><option>Bihar</option><option>Rajasthan</option><option>Madhya Pradesh</option><option>Jharkhand</option><option>Other</option></select>
        </div>
      </div>
      <button class="btn btn-or" onclick="registerEmployer()">Register करें →</button>
      <div style="margin-top:10px"></div>
      <button class="btn btn-out" onclick="showLogin('employer')">पहले से Account है? Login करें</button>
    </div>

    <!-- Login -->
    <div id="step-login" style="display:none">
      <div style="display:flex;align-items:center;margin-bottom:18px">
        <button class="back-btn" onclick="backToRole()">←</button>
        <div style="font-size:15px;font-weight:800" id="login-title">Login</div>
      </div>
      <div class="ig"><label>Phone Number *</label><input class="inp" id="login-phone" type="tel" placeholder="+91 XXXXX XXXXX"></div>
      <button class="btn btn-or" onclick="doLogin()">Login →</button>
      <div style="margin-top:16px;padding:12px;background:var(--s2);border-radius:10px;font-size:11px;color:var(--tm);line-height:1.8">
        <div style="font-weight:700;color:var(--or);margin-bottom:4px">Demo accounts:</div>
        <div id="demo-hint"></div>
      </div>
    </div>
  </div>
</div>

<!-- MAIN APP -->
<div id="app" style="display:none">

  <!-- HOME -->
  <div class="screen on" id="sc-home">
    <div class="topbar">
      <div><div class="topbar h1" id="home-title" style="font-size:17px;font-weight:800">RozgarConnect</div><div class="topbar-sub" id="home-sub">Loading...</div></div>
      <div style="display:flex;gap:8px">
        <div class="ibt" onclick="openSheet('notif-sheet')">🔔</div>
        <div class="ibt" onclick="goTab('profile')">👤</div>
      </div>
    </div>
    <div id="home-banner"></div>
    <div class="stats" id="home-stats"></div>
    <div class="sh2"><h2 id="home-feed-title">🔥 आपके लिए Jobs</h2><a onclick="goTab('explore')">सभी देखें</a></div>
    <div id="home-feed"><div class="loader"><div class="spin"></div></div></div>
  </div>

  <!-- EXPLORE -->
  <div class="screen" id="sc-explore">
    <div class="topbar">
      <div><div style="font-size:17px;font-weight:800">खोजें <span id="ex-role-label" style="color:var(--or)">Jobs</span></div></div>
    </div>
    <div style="padding:12px 16px 0;overflow-x:auto;white-space:nowrap;scrollbar-width:none">
      <div id="cat-chips" style="display:inline-flex;gap:7px"></div>
    </div>
    <div id="explore-feed" style="flex:1"><div class="loader"><div class="spin"></div></div></div>
  </div>

  <!-- POST JOB -->
  <div class="screen" id="sc-post">
    <div class="topbar"><div style="font-size:17px;font-weight:800">Job Post <span style="color:var(--or)">करें</span></div></div>
    <div style="padding:16px">
      <div class="ig"><label>Category / Skill *</label><select class="inp" id="p-skill"><option value="">-- Select --</option></select></div>
      <div class="ig"><label>Job Title</label><input class="inp" id="p-title" placeholder="जैसे Salesboy for Mobile Shop"></div>
      <div class="ig"><label>Description</label><input class="inp" id="p-desc" placeholder="काम के बारे में बताएं..."></div>
      <div class="ig highlight-inp">
        <label>💰 BID — अधिकतम तनख्वाह जो आप देंगे *</label>
        <div class="row2">
          <div><label style="font-size:9px;color:var(--tm);display:block;margin-bottom:4px">कम से कम (₹)</label><input class="inp" id="p-blow" type="number" placeholder="10000"></div>
          <div><label style="font-size:9px;color:var(--tm);display:block;margin-bottom:4px">ज्यादा से ज्यादा (₹)</label><input class="inp" id="p-bhigh" type="number" placeholder="14000"></div>
        </div>
      </div>
      <div class="row2">
        <div class="ig"><label>Salary Type</label><select class="inp" id="p-type"><option value="monthly">Monthly</option><option value="daily">Daily</option></select></div>
        <div class="ig"><label>Radius (km)</label><input class="inp" id="p-radius" type="number" value="10" min="1" max="25"></div>
      </div>
      <div class="ig"><label>City</label><input class="inp" id="p-city" placeholder="Lucknow"></div>
      <button class="btn btn-or" onclick="postJob()">📋 Job Post करें →</button>
    </div>
  </div>

  <!-- MATCHES -->
  <div class="screen" id="sc-matches">
    <div class="topbar"><div style="font-size:17px;font-weight:800">Matches <span style="color:var(--or)">🤝</span></div></div>
    <div id="match-feed"><div class="loader"><div class="spin"></div></div></div>
  </div>

  <!-- PROFILE -->
  <div class="screen" id="sc-profile">
    <div class="topbar">
      <div style="font-size:17px;font-weight:800">Profile <span style="color:var(--or)">👤</span></div>
      <div class="ibt" onclick="logout()">🚪</div>
    </div>
    <div id="profile-body"></div>
  </div>

  <!-- BOTTOM NAV -->
  <nav class="bnav">
    <button class="bt on" onclick="goTab('home')" id="nt-home"><div class="bi">🏠</div><div class="bl">Home</div></button>
    <button class="bt" onclick="goTab('explore')" id="nt-explore"><div class="bi">🔍</div><div class="bl" id="nt-ex-lbl">खोजें</div></button>
    <button class="bt" onclick="goTab('post')" id="nt-post" style="display:none"><div class="bi">➕</div><div class="bl">Post Job</div></button>
    <button class="bt" onclick="goTab('matches')" id="nt-matches"><div class="bi">🤝</div><div class="bl">Matches</div></button>
    <button class="bt" onclick="goTab('profile')" id="nt-profile"><div class="bi">👤</div><div class="bl">Profile</div></button>
  </nav>
</div>

<!-- SHEETS -->
<div class="overlay" id="worker-sheet" onclick="closeSheet('worker-sheet')"><div class="sheet" onclick="event.stopPropagation()"><div class="sh"></div><div id="ws-body"></div></div></div>
<div class="overlay" id="job-sheet" onclick="closeSheet('job-sheet')"><div class="sheet" onclick="event.stopPropagation()"><div class="sh"></div><div id="js-body"></div></div></div>
<div class="overlay" id="notif-sheet" onclick="closeSheet('notif-sheet')">
  <div class="sheet" onclick="event.stopPropagation()">
    <div class="sh"></div>
    <h2>🔔 Notifications</h2>
    <div style="font-size:13px;padding:10px 0;border-bottom:1px solid var(--bd)">❤️ <b>Ram Electronics</b> ne aapka profile pasand kiya! <span style="color:var(--tm);font-size:10px">2 min ago</span></div>
    <div style="font-size:13px;padding:10px 0;color:var(--tm)">Nayi jobs aapke area mein available hain</div>
  </div>
</div>
<div id="toast"></div>

<script>
// ── STATE ────────────────────────────────────────────────────────
const S = {
  token: localStorage.getItem('rc_tok'),
  user:  JSON.parse(localStorage.getItem('rc_usr') || 'null'),
  role:  localStorage.getItem('rc_rol'),
  loginRole: 'worker',
  cats: [],
  selCat: ''
};

// ── API ──────────────────────────────────────────────────────────
async function api(path, method='GET', body=null) {
  const h = { 'Content-Type': 'application/json' };
  if (S.token) h['Authorization'] = 'Bearer ' + S.token;
  const r = await fetch('/api' + path, { method, headers: h, body: body ? JSON.stringify(body) : null });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Something went wrong');
  return d;
}

// ── TOAST ────────────────────────────────────────────────────────
function toast(msg, err=false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.borderColor = err ? 'rgba(255,23,68,.4)' : 'rgba(255,107,0,.4)';
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 3000);
}

// ── SAVE / CLEAR AUTH ────────────────────────────────────────────
function saveAuth(token, user, role) {
  S.token = token; S.user = user; S.role = role;
  localStorage.setItem('rc_tok', token);
  localStorage.setItem('rc_usr', JSON.stringify(user));
  localStorage.setItem('rc_rol', role);
}
function clearAuth() {
  S.token=null; S.user=null; S.role=null;
  localStorage.removeItem('rc_tok');
  localStorage.removeItem('rc_usr');
  localStorage.removeItem('rc_rol');
}

// ── INIT ─────────────────────────────────────────────────────────
window.onload = async () => {
  // load categories
  try {
    const d = await api('/categories');
    S.cats = d.categories || [];
    fillCatSelects();
    buildCatChips();
  } catch(e) {}

  // splash
  setTimeout(() => {
    document.getElementById('splash').style.opacity = '0';
    document.getElementById('splash').style.transition = 'opacity .4s';
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      S.token ? launchApp() : showAuth();
    }, 400);
  }, 2200);
};

function fillCatSelects() {
  ['wr-skill','p-skill'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    S.cats.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.icon + ' ' + c.name;
      el.appendChild(o);
    });
  });
}

function buildCatChips() {
  const wrap = document.getElementById('cat-chips');
  if (!wrap) return;
  wrap.innerHTML = '<div class="pill p-or" style="padding:7px 14px;font-size:11px;cursor:pointer;border-radius:20px;border:1.5px solid var(--or);background:rgba(255,107,0,.12)" onclick="filterCat(\\'\\',this)">सभी</div>';
  S.cats.slice(0,14).forEach(c => {
    wrap.innerHTML += \`<div onclick="filterCat('\${c.id}',this)" style="padding:7px 14px;font-size:11px;cursor:pointer;border-radius:20px;border:1.5px solid var(--bd);background:var(--s2);color:var(--tm);white-space:nowrap">\${c.icon} \${c.name}</div>\`;
  });
}

// ── AUTH SCREENS ─────────────────────────────────────────────────
function showAuth() {
  document.getElementById('auth').style.display = 'block';
  document.getElementById('app').style.display = 'none';
}

function pickRole(role) {
  document.getElementById('rc-worker').classList.toggle('sel', role==='worker');
  document.getElementById('rc-employer').classList.toggle('sel', role==='employer');
  document.getElementById('step-role').style.display = 'none';
  document.getElementById(role==='worker' ? 'step-worker-reg' : 'step-emp-reg').style.display = 'block';
}

function backToRole() {
  ['step-worker-reg','step-emp-reg','step-login'].forEach(id => document.getElementById(id).style.display='none');
  document.getElementById('step-role').style.display = 'block';
}

function showLogin(role) {
  S.loginRole = role;
  ['step-worker-reg','step-emp-reg'].forEach(id => document.getElementById(id).style.display='none');
  document.getElementById('step-login').style.display = 'block';
  document.getElementById('login-title').textContent = (role==='worker'?'👷 Worker':'🏪 Employer') + ' Login';
  document.getElementById('demo-hint').innerHTML = role==='worker'
    ? 'Worker: 9876543210 (Ramesh)<br>Worker: 9876543211 (Sunita)<br>Worker: 9876543212 (Mukesh)'
    : 'Employer: 8888800001 (Ram Electronics)<br>Employer: 8888800002 (Singh Builders)';
}

async function registerWorker() {
  const name=document.getElementById('wr-name').value.trim();
  const phone=document.getElementById('wr-phone').value.trim();
  const skill=document.getElementById('wr-skill').value;
  const ask=document.getElementById('wr-ask').value;
  if (!name||!phone||!skill||!ask) { toast('❌ सभी * fields भरें',true); return; }
  try {
    const d = await api('/auth/register/worker','POST',{
      name, phone, skill, ask:Number(ask),
      type: document.getElementById('wr-type').value,
      exp:  document.getElementById('wr-exp').value,
      city: document.getElementById('wr-city').value,
      state:document.getElementById('wr-state').value
    });
    saveAuth(d.token, d.user, 'worker');
    toast('🎉 Registration ho gaya! Welcome!');
    launchApp();
  } catch(e) { toast('❌ ' + e.message, true); }
}

async function registerEmployer() {
  const biz=document.getElementById('er-biz').value.trim();
  const owner=document.getElementById('er-owner').value.trim();
  const phone=document.getElementById('er-phone').value.trim();
  if (!biz||!owner||!phone) { toast('❌ सभी * fields भरें',true); return; }
  try {
    const d = await api('/auth/register/employer','POST',{
      biz, owner, phone,
      whatsapp: document.getElementById('er-wa').value || phone,
      type: document.getElementById('er-type').value,
      city: document.getElementById('er-city').value,
      state:document.getElementById('er-state').value
    });
    saveAuth(d.token, d.user, 'employer');
    toast('🎉 Business registered! Ab job post karein!');
    launchApp();
  } catch(e) { toast('❌ ' + e.message, true); }
}

async function doLogin() {
  const phone = document.getElementById('login-phone').value.trim();
  if (!phone) { toast('❌ Phone number daalen',true); return; }
  try {
    const d = await api('/auth/login/'+S.loginRole,'POST',{phone});
    saveAuth(d.token, d.user, d.role);
    toast('✅ Login ho gaya!');
    launchApp();
  } catch(e) { toast('❌ ' + e.message, true); }
}

// ── LAUNCH APP ───────────────────────────────────────────────────
function launchApp() {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  setupUI();
  loadHome();
  loadMatches();
  loadProfile();
}

function setupUI() {
  const isEmp = S.role === 'employer';
  document.getElementById('nt-post').style.display = isEmp ? 'flex' : 'none';
  document.getElementById('nt-ex-lbl').textContent = isEmp ? 'Workers' : 'खोजें';
  document.getElementById('ex-role-label').textContent = isEmp ? 'Workers' : 'Jobs';

  const u = S.user;
  if (isEmp) {
    document.getElementById('home-title').innerHTML = \`🏪 \${u.biz || 'Employer'}\`;
    document.getElementById('home-sub').textContent = 'Hiring Dashboard';
    document.getElementById('home-feed-title').textContent = '👷 Top Workers Available';
  } else {
    const name = u.name?.split(' ')[0] || 'User';
    document.getElementById('home-title').innerHTML = \`नमस्ते <span style="color:var(--or)">\${name}</span>!\`;
    document.getElementById('home-sub').textContent = 'आपके लिए jobs तैयार हैं';
  }

  // Banner
  document.getElementById('home-banner').innerHTML = isEmp
    ? \`<div class="banner employer"><div><b style="font-size:15px">👑 \${u.biz}</b><div style="font-size:11px;color:var(--tm);margin-top:2px">\${u.city||''} • \${u.plan||'free'} plan</div></div><button class="btn btn-or btn-sm" onclick="goTab('post')">+ Post Job</button></div>\`
    : \`<div class="banner worker"><div><b style="font-size:15px">👷 \${u.name}</b><div style="font-size:11px;color:var(--tm);margin-top:2px">\${u.skill_name||u.skill||''} • \${u.city||''}</div></div><div class="tog \${u.available!==false?'on':''}" onclick="toggleAvail()" id="avail-tog"></div></div>\`;
}

// ── HOME ─────────────────────────────────────────────────────────
async function loadHome() {
  const feed = document.getElementById('home-feed');
  feed.innerHTML = '<div class="loader"><div class="spin"></div></div>';
  try {
    if (S.role === 'employer') {
      const d = await api('/workers');
      document.getElementById('home-stats').innerHTML = statsHTML(d.total||0, DB_matches_count(), 0);
      feed.innerHTML = \`<div class="card">\${d.workers?.slice(0,5).map(workerHTML).join('') || emptyHTML('👷','Koi worker nahi mila')}</div>\`;
    } else {
      const d = await api('/jobs/feed');
      document.getElementById('home-stats').innerHTML = statsHTML(d.jobs?.length||0, DB_matches_count(), S.user?.views||0);
      feed.innerHTML = \`<div class="card px">\${d.jobs?.slice(0,5).map(jobHTML).join('') || emptyHTML('💼','Koi job nahi mili. ASK price kam karein.')}</div>\`;
    }
  } catch(e) {
    feed.innerHTML = emptyHTML('⚠️','Load nahi hua. Internet check karein.');
  }
}

function DB_matches_count() { return 0; } // placeholder

function statsHTML(a,b,c) {
  const isEmp = S.role==='employer';
  return \`
    <div class="stat"><div class="v" style="color:var(--or)">\${a}</div><div class="l">\${isEmp?'Workers Found':'Job Offers'}</div></div>
    <div class="stat"><div class="v" style="color:var(--gr)">\${b}</div><div class="l">Matches</div></div>
    <div class="stat"><div class="v">\${c}</div><div class="l">Profile Views</div></div>
  \`;
}

// ── EXPLORE ──────────────────────────────────────────────────────
async function loadExplore(cat='') {
  const feed = document.getElementById('explore-feed');
  feed.innerHTML = '<div class="loader"><div class="spin"></div></div>';
  try {
    if (S.role === 'employer') {
      const d = await api('/workers' + (cat?\`?skill=\${cat}\`:''));
      feed.innerHTML = \`<div class="card">\${d.workers?.map(workerHTML).join('') || emptyHTML('👷','Is category mein koi worker nahi')}</div>\`;
    } else {
      const d = await api('/jobs' + (cat?\`?skill=\${cat}\`:''));
      feed.innerHTML = \`<div class="card px">\${d.jobs?.map(jobHTML).join('') || emptyHTML('💼','Is category mein koi job nahi')}</div>\`;
    }
  } catch(e) { feed.innerHTML = emptyHTML('⚠️','Load nahi hua'); }
}

function filterCat(cat, el) {
  S.selCat = cat;
  document.querySelectorAll('#cat-chips > div').forEach(c => {
    c.style.borderColor = 'var(--bd)';
    c.style.background = 'var(--s2)';
    c.style.color = 'var(--tm)';
  });
  el.style.borderColor = 'var(--or)';
  el.style.background = 'rgba(255,107,0,.12)';
  el.style.color = 'var(--or)';
  loadExplore(cat);
}

// ── CARD HTML ─────────────────────────────────────────────────────
function jobHTML(j) {
  const bid = Number(j.bid_high||0).toLocaleString('en-IN');
  const t = j.type==='monthly'?'/mo':'/day';
  return \`<div class="jcard" onclick="openJobSheet('\${j._id}')">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div style="flex:1;margin-right:10px">
        <div class="jt">\${j.icon||'💼'} \${j.title||j.skill}</div>
        <div class="jm">
          <span>🏪 \${j.emp_name||'Employer'}</span>
          <span>📍 \${j.city||'Near you'}</span>
          \${j.boosted ? '<span class="pill p-gd">🚀 Boosted</span>' : ''}
        </div>
      </div>
      <div class="jp">₹\${bid}<span style="font-size:10px;color:var(--tm)">\${t}</span></div>
    </div>
    <div style="margin-top:9px;display:flex;gap:7px;align-items:center">
      <span style="font-size:10px;color:var(--tm)">📏 \${j.radius||10}km radius</span>
      <button class="btn btn-gr btn-sm" onclick="event.stopPropagation();showInterest('\${j._id}')">Interest दिखाएं</button>
    </div>
  </div>\`;
}

function workerHTML(w) {
  const ask = Number(w.ask||0).toLocaleString('en-IN');
  const t = w.type==='monthly'?'/mo':'/day';
  const stars = w.rating > 0 ? '⭐'.repeat(Math.min(5,Math.round(w.rating))) : 'New';
  const colors = ['#FF6B00','#2979FF','#9C27B0','#00A550','#E040FB','#FF5722'];
  const col = colors[(w.name||'').charCodeAt(0) % colors.length];
  return \`<div class="wcard">
    <div style="display:flex;gap:11px;align-items:flex-start">
      <div class="av" style="width:42px;height:42px;background:linear-gradient(135deg,\${col},\${col}99);font-size:16px">\${(w.name||'W')[0]}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between">
          <div>
            <div class="wn">\${w.name} \${w.verified?'✅':''}</div>
            <div class="wm">\${w.icon||'💼'} \${w.skill_name||w.skill} • \${stars}</div>
            <div class="wm">📍 \${w.city||'Near you'} • \${w.exp||0}yr exp</div>
          </div>
          <div class="wp">₹\${ask}<span style="font-size:9px;color:var(--tm)">\${t}</span></div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:7px;margin-top:10px">
      <button class="btn btn-or btn-sm" onclick="likeWorker('\${w._id}')">❤️ Like</button>
      <button class="btn btn-out btn-sm" onclick="openWorkerSheet('\${w._id}')">Profile</button>
      <button class="btn btn-gr btn-sm" onclick="directFetch('\${w._id}','\${w.name}')">📞 Direct</button>
    </div>
  </div>\`;
}

function emptyHTML(icon, msg) {
  return \`<div class="empty"><div class="ei">\${icon}</div><p>\${msg}</p></div>\`;
}

// ── MATCHES ───────────────────────────────────────────────────────
async function loadMatches() {
  const feed = document.getElementById('match-feed');
  feed.innerHTML = '<div class="loader"><div class="spin"></div></div>';
  try {
    const d = await api('/matches');
    if (!d.matches?.length) { feed.innerHTML = emptyHTML('🤝','Abhi koi match nahi. Jobs/Workers explore karein.'); return; }
    // Update stat
    const statEls = document.querySelectorAll('#home-stats .stat');
    if (statEls[1]) statEls[1].querySelector('.v').textContent = d.total;
    feed.innerHTML = d.matches.map(m => {
      const isEmp = S.role==='employer';
      const title = isEmp ? (m.worker?.name||'Worker') : (m.emp?.biz||'Employer');
      const sub   = isEmp ? \`\${m.worker?.skill||''} • ASK ₹\${Number(m.worker?.ask||0).toLocaleString('en-IN')}\` : \`\${m.job?.title||''} • BID ₹\${Number(m.job?.bid_high||0).toLocaleString('en-IN')}\`;
      const stColor = {liked:'var(--or)',matched:'var(--gr)',rejected:'var(--tm)'}[m.status]||'var(--tm)';
      const stLabel = {liked:'EMPLOYER LIKED',matched:'✅ MATCHED',rejected:'DECLINED'}[m.status]||m.status;
      return \`<div class="mcard" style="border-bottom:1px solid var(--bd)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:14px;font-weight:700">\${title}</div>
            <div style="font-size:11px;color:var(--tm);margin-top:2px">\${sub}</div>
          </div>
          <div class="pill" style="color:\${stColor};background:rgba(255,255,255,.05);">\${stLabel}</div>
        </div>
        \${m.status==='liked'&&S.role==='worker' ? \`<div style="display:flex;gap:7px;margin-top:10px"><button class="btn btn-gr btn-sm" onclick="acceptMatch('\${m._id}')">✅ Accept</button><button class="btn btn-out btn-sm" onclick="rejectMatch('\${m._id}')">Decline</button></div>\` : ''}
        \${m.status==='matched'&&m.worker?.phone ? \`<div style="margin-top:8px;font-size:12px;color:var(--gr)">📞 \${m.worker.phone}</div>\` : ''}
      </div>\`;
    }).join('');
  } catch(e) { feed.innerHTML = emptyHTML('⚠️','Matches load nahi hue'); }
}

async function acceptMatch(id) {
  try { await api(\`/matches/\${id}/accept\`,'PATCH'); toast('🎉 Match ho gaya!'); loadMatches(); } catch(e){ toast('❌'+e.message,true); }
}
async function rejectMatch(id) {
  try { await api(\`/matches/\${id}/reject\`,'PATCH'); toast('Decline kar diya'); loadMatches(); } catch(e){ toast('❌'+e.message,true); }
}

// ── POST JOB ──────────────────────────────────────────────────────
async function postJob() {
  const skill = document.getElementById('p-skill').value;
  const bhigh = document.getElementById('p-bhigh').value;
  if (!skill||!bhigh) { toast('❌ Skill aur max salary zaroori hai',true); return; }
  try {
    const d = await api('/jobs','POST',{
      skill, title:document.getElementById('p-title').value,
      bid_low:Number(document.getElementById('p-blow').value)||0,
      bid_high:Number(bhigh),
      type:document.getElementById('p-type').value,
      desc:document.getElementById('p-desc').value,
      city:document.getElementById('p-city').value,
      radius:Number(document.getElementById('p-radius').value)||10
    });
    toast(\`🎉 \${d.message}\`);
    goTab('explore');
  } catch(e) { toast('❌'+e.message,true); }
}

// ── AVAILABILITY ──────────────────────────────────────────────────
async function toggleAvail() {
  try {
    const d = await api(\`/workers/\${S.user._id}/availability\`,'PATCH');
    S.user.available = d.available;
    localStorage.setItem('rc_usr', JSON.stringify(S.user));
    const tog = document.getElementById('avail-tog');
    if (tog) tog.className = 'tog' + (d.available?' on':'');
    toast(d.message);
  } catch(e){ toast('❌'+e.message,true); }
}

// ── WORKER SHEET ──────────────────────────────────────────────────
async function openWorkerSheet(id) {
  try {
    const d = await api(\`/workers/\${id}\`);
    const w = d.worker;
    const ask = Number(w.ask||0).toLocaleString('en-IN');
    document.getElementById('ws-body').innerHTML = \`
      <h2>\${w.icon||'💼'} \${w.name} \${w.verified?'✅':''}</h2>
      <div style="background:var(--s2);border-radius:10px;padding:13px;margin-bottom:13px">
        <div style="font-size:11px;color:var(--tm)">ASK PRICE (minimum)</div>
        <div style="font-size:24px;font-weight:800;color:var(--or);font-family:monospace">₹\${ask}<span style="font-size:12px;color:var(--tm)">/\${w.type==='monthly'?'mo':'day'}</span></div>
      </div>
      <div style="font-size:12px;color:var(--tm);margin-bottom:4px">📍 \${w.city||'Near you'} • \${w.exp||0} yr exp • ⭐ \${w.rating||'New'}</div>
      \${w.phone ? \`<div style="background:rgba(0,200,83,.1);border:1px solid rgba(0,200,83,.2);border-radius:10px;padding:12px;margin:12px 0"><div style="font-size:11px;color:var(--gr);margin-bottom:4px">✅ Contact Unlocked</div><div style="font-size:17px;font-weight:700">📞 \${w.phone}</div></div>\` : ''}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-or" onclick="likeWorker('\${w._id}');closeSheet('worker-sheet')">❤️ Like Worker</button>
        \${!w.phone ? \`<button class="btn btn-gr" onclick="directFetch('\${w._id}','\${w.name}')">📞 Direct ₹29</button>\` : ''}
      </div>\`;
    openSheet('worker-sheet');
  } catch(e){ toast('❌'+e.message,true); }
}

async function openJobSheet(id) {
  try {
    const d = await api('/jobs');
    const j = d.jobs?.find(x=>x._id===id);
    if (!j) return;
    document.getElementById('js-body').innerHTML = \`
      <h2>\${j.icon||'💼'} \${j.title||j.skill}</h2>
      <div style="background:var(--s2);border-radius:10px;padding:13px;margin-bottom:12px">
        <div style="font-size:11px;color:var(--tm)">BID RANGE</div>
        <div style="font-size:22px;font-weight:800;color:var(--gr);font-family:monospace">₹\${Number(j.bid_low||0).toLocaleString('en-IN')} – ₹\${Number(j.bid_high||0).toLocaleString('en-IN')}<span style="font-size:11px;color:var(--tm)">/\${j.type==='monthly'?'mo':'day'}</span></div>
      </div>
      <div style="font-size:12px;color:var(--tm);margin-bottom:12px">🏪 \${j.emp_name} • 📍 \${j.city||'Near you'} • 📏 \${j.radius||10}km<br>\${j.desc||''}</div>
      <button class="btn btn-or" onclick="showInterest('\${j._id}');closeSheet('job-sheet')">✋ Interest दिखाएं</button>\`;
    openSheet('job-sheet');
  } catch(e){ toast('❌'+e.message,true); }
}

function showInterest(jobId) { toast('✅ Interest dikha diya! Employer contact karega.'); }

async function likeWorker(wid) {
  try {
    const d = await api('/jobs/mine');
    if (!d.jobs?.length) { toast('Pehle ek job post karein!',true); goTab('post'); return; }
    await api(\`/jobs/\${d.jobs[0]._id}/like/\${wid}\`,'POST');
    toast('❤️ Worker ko like kar diya!');
    loadMatches();
  } catch(e){ toast('❌'+e.message,true); }
}

async function directFetch(wid, name) {
  if (!confirm(\`\${name} ka contact directly dekhna hai? ₹29 lagenge.\`)) return;
  try {
    const d = await api(\`/workers/\${wid}/fetch\`,'POST');
    toast(\`📞 \${d.phone} — Contact mil gaya!\`);
    openWorkerSheet(wid);
  } catch(e){ toast('❌'+e.message,true); }
}

// ── PROFILE ───────────────────────────────────────────────────────
function loadProfile() {
  const u = S.user;
  if (!u) return;
  const isEmp = S.role==='employer';
  const colors = ['#FF6B00','#2979FF','#9C27B0'];
  const col = colors[(isEmp?(u.biz||'E'):(u.name||'W')).charCodeAt(0)%colors.length];
  document.getElementById('profile-body').innerHTML = \`
    <div class="prof-head">
      <div class="av" style="width:68px;height:68px;font-size:26px;background:linear-gradient(135deg,\${col},\${col}99);margin:0 auto 12px">\${isEmp?(u.biz||'E')[0]:(u.name||'W')[0]}</div>
      <div style="font-size:19px;font-weight:800">\${isEmp?u.biz:u.name}</div>
      <div style="font-size:11px;color:var(--tm);margin-top:4px">\${isEmp?(u.owner||''):(u.skill_name||u.skill||'')} • \${u.city||'India'}</div>
      <div style="margin-top:8px"><span class="pill \${isEmp?'p-gd':'p-gr'}">\${isEmp?'🏪 Employer':'👷 Worker'}</span></div>
    </div>
    <div style="padding:16px">
      <div class="card p" style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">📱 Contact</div>
        <div style="font-size:13px;color:var(--tm)">📞 \${u.phone||'–'}</div>
        \${isEmp?\`<div style="font-size:13px;color:var(--tm);margin-top:4px">💬 WA: \${u.whatsapp||u.phone||'–'}</div>\`:''}
      </div>
      \${!isEmp?\`
      <div class="card p" style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">💰 ASK Price</div>
        <div style="font-size:26px;font-weight:800;color:var(--or);font-family:monospace">₹\${Number(u.ask||0).toLocaleString('en-IN')}</div>
        <div style="font-size:10px;color:var(--tm);margin-top:2px;margin-bottom:10px">Minimum salary aap accept karenge</div>
        <input type="number" class="inp" id="new-ask" placeholder="Nayi price daalen">
        <button class="btn btn-or" style="margin-top:9px" onclick="updateAsk()">💰 Update ASK Price</button>
      </div>\`:''}
    </div>\`;
}

async function updateAsk() {
  const val = document.getElementById('new-ask')?.value;
  if (!val) return;
  try {
    await api(\`/workers/\${S.user._id}/ask\`,'PATCH',{ask:Number(val)});
    S.user.ask = Number(val);
    localStorage.setItem('rc_usr', JSON.stringify(S.user));
    toast('✅ ASK price update ho gayi!');
    loadProfile();
  } catch(e){ toast('❌'+e.message,true); }
}

// ── NAVIGATION ────────────────────────────────────────────────────
function goTab(tab) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.bt').forEach(b=>b.classList.remove('on'));
  document.getElementById('sc-'+tab).classList.add('on');
  document.getElementById('nt-'+tab)?.classList.add('on');
  if (tab==='explore') loadExplore(S.selCat);
  if (tab==='matches') loadMatches();
  if (tab==='profile') loadProfile();
}

function openSheet(id) { document.getElementById(id).classList.add('on'); }
function closeSheet(id) { document.getElementById(id).classList.remove('on'); }

function logout() {
  clearAuth();
  document.getElementById('app').style.display='none';
  backToRole();
  showAuth();
  toast('Logged out');
}
</script>
</body>
</html>`;

// ── SERVE HTML ───────────────────────────────────────────────────
app.get('*', (_, res) => res.send(HTML));

app.listen(PORT, () => console.log('\n✅ RozgarConnect at http://localhost:' + PORT + '\n'));
