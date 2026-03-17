// ================================================================
// ROZGARCONNECT — Complete Backend Server
// NO DATABASE SETUP NEEDED — runs out of the box!
// Just deploy and go live.
// ================================================================
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { v4: uid } = require('uuid');
const path     = require('path');

const app    = express();
const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'rozgar_secret_key_2024';

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, 'frontend/public')));

// ================================================================
// IN-MEMORY DATABASE (no signup, no Atlas, works instantly)
// ================================================================
const DB = { workers: [], employers: [], jobs: [], matches: [] };

// ── SEED DEMO DATA ───────────────────────────────────────────────
;(function seed() {
  const W = [
    { _id:uid(), name:'Ramesh Kumar',   phone:'9876543210', skill_category:'salesboy',      ask_price:12000, salary_type:'monthly', location:{city:'Lucknow',  state:'UP',    lat:26.85,lng:80.95}, rating:4.8, rating_count:12, is_available:true, is_verified:true,  experience_years:3, views_count:42, free_unlocks_left:3, response_rate:0.9  },
    { _id:uid(), name:'Sunita Devi',    phone:'9876543211', skill_category:'cook',           ask_price:9000,  salary_type:'monthly', location:{city:'Patna',    state:'Bihar', lat:25.60,lng:85.12}, rating:4.5, rating_count:8,  is_available:true, is_verified:false, experience_years:2, views_count:28, free_unlocks_left:3, response_rate:0.8  },
    { _id:uid(), name:'Mukesh Yadav',   phone:'9876543212', skill_category:'construction',   ask_price:550,   salary_type:'daily',   location:{city:'Varanasi', state:'UP',    lat:25.32,lng:83.00}, rating:4.6, rating_count:20, is_available:true, is_verified:true,  experience_years:5, views_count:55, free_unlocks_left:3, response_rate:0.95 },
    { _id:uid(), name:'Priya Singh',    phone:'9876543213', skill_category:'tailor',         ask_price:8000,  salary_type:'monthly', location:{city:'Jaipur',   state:'Raj',   lat:26.91,lng:75.79}, rating:0,   rating_count:0,  is_available:true, is_verified:false, experience_years:0, views_count:10, free_unlocks_left:3, response_rate:1.0  },
    { _id:uid(), name:'Arjun Patel',    phone:'9876543214', skill_category:'driver',         ask_price:15000, salary_type:'monthly', location:{city:'Bhopal',   state:'MP',    lat:23.26,lng:77.41}, rating:4.3, rating_count:6,  is_available:true, is_verified:true,  experience_years:4, views_count:33, free_unlocks_left:3, response_rate:0.75 },
    { _id:uid(), name:'Ravi Sharma',    phone:'9876543215', skill_category:'electrician',    ask_price:600,   salary_type:'daily',   location:{city:'Lucknow',  state:'UP',    lat:26.84,lng:80.92}, rating:4.2, rating_count:9,  is_available:true, is_verified:false, experience_years:3, views_count:19, free_unlocks_left:3, response_rate:0.85 },
    { _id:uid(), name:'Geeta Kumari',   phone:'9876543216', skill_category:'housekeeping',   ask_price:7000,  salary_type:'monthly', location:{city:'Gaya',     state:'Bihar', lat:24.80,lng:85.00}, rating:4.7, rating_count:15, is_available:true, is_verified:true,  experience_years:6, views_count:61, free_unlocks_left:3, response_rate:0.92 },
    { _id:uid(), name:'Suresh Verma',   phone:'9876543217', skill_category:'delivery',       ask_price:13000, salary_type:'monthly', location:{city:'Agra',     state:'UP',    lat:27.18,lng:78.01}, rating:3.9, rating_count:4,  is_available:true, is_verified:false, experience_years:1, views_count:22, free_unlocks_left:3, response_rate:0.7  },
    { _id:uid(), name:'Meena Devi',     phone:'9876543218', skill_category:'babysitter',     ask_price:6000,  salary_type:'monthly', location:{city:'Kanpur',   state:'UP',    lat:26.46,lng:80.33}, rating:4.9, rating_count:22, is_available:true, is_verified:true,  experience_years:7, views_count:78, free_unlocks_left:3, response_rate:0.98 },
    { _id:uid(), name:'Vijay Maurya',   phone:'9876543219', skill_category:'security_guard', ask_price:10000, salary_type:'monthly', location:{city:'Allahabad',state:'UP',    lat:25.44,lng:81.84}, rating:4.1, rating_count:7,  is_available:true, is_verified:false, experience_years:8, views_count:35, free_unlocks_left:3, response_rate:0.88 },
    { _id:uid(), name:'Deepa Rani',     phone:'9876543220', skill_category:'tailor',         ask_price:9500,  salary_type:'monthly', location:{city:'Lucknow',  state:'UP',    lat:26.86,lng:80.96}, rating:4.4, rating_count:11, is_available:true, is_verified:true,  experience_years:4, views_count:29, free_unlocks_left:3, response_rate:0.9  },
    { _id:uid(), name:'Santosh Kumar',  phone:'9876543221', skill_category:'plumber',        ask_price:650,   salary_type:'daily',   location:{city:'Patna',    state:'Bihar', lat:25.61,lng:85.13}, rating:4.0, rating_count:5,  is_available:true, is_verified:false, experience_years:6, views_count:17, free_unlocks_left:3, response_rate:0.8  },
    { _id:uid(), name:'Kavita Sharma',  phone:'9876543222', skill_category:'cook',           ask_price:10000, salary_type:'monthly', location:{city:'Jaipur',   state:'Raj',   lat:26.92,lng:75.80}, rating:4.6, rating_count:18, is_available:true, is_verified:true,  experience_years:5, views_count:44, free_unlocks_left:3, response_rate:0.93 },
    { _id:uid(), name:'Mohan Das',      phone:'9876543223', skill_category:'painter',        ask_price:500,   salary_type:'daily',   location:{city:'Varanasi', state:'UP',    lat:25.33,lng:83.01}, rating:3.8, rating_count:3,  is_available:true, is_verified:false, experience_years:2, views_count:12, free_unlocks_left:3, response_rate:0.75 },
    { _id:uid(), name:'Rekha Devi',     phone:'9876543224', skill_category:'housekeeping',   ask_price:6500,  salary_type:'monthly', location:{city:'Lucknow',  state:'UP',    lat:26.85,lng:80.94}, rating:4.3, rating_count:9,  is_available:true, is_verified:false, experience_years:3, views_count:25, free_unlocks_left:3, response_rate:0.87 },
  ];
  const E = [
    { _id:uid(), business_name:'Ram Electronics', owner_name:'Ram Gupta',    phone:'8888800001', whatsapp:'8888800001', business_type:'retail',       location:{city:'Lucknow',state:'UP',   lat:26.85,lng:80.95}, rating:4.5, is_verified:true,  plan:'super', boost_active:true,  direct_fetch_used:3, direct_fetch_quota:5 },
    { _id:uid(), business_name:'Singh Builders',  owner_name:'Vikram Singh', phone:'8888800002', whatsapp:'8888800002', business_type:'construction', location:{city:'Patna',  state:'Bihar',lat:25.60,lng:85.12}, rating:4.2, is_verified:false, plan:'free',  boost_active:false, direct_fetch_used:1, direct_fetch_quota:5 },
    { _id:uid(), business_name:'Gupta Kirana',    owner_name:'Deepak Gupta', phone:'8888800003', whatsapp:'8888800003', business_type:'retail',       location:{city:'Jaipur', state:'Raj',  lat:26.91,lng:75.79}, rating:3.8, is_verified:false, plan:'free',  boost_active:false, direct_fetch_used:0, direct_fetch_quota:5 },
  ];
  W.forEach(w => DB.workers.push(w));
  E.forEach(e => DB.employers.push(e));
  // Seed a demo job
  DB.jobs.push({ _id:uid(), employer_id:E[0]._id, title:'Salesboy for Mobile Shop', category:'salesboy', bid_low:10000, bid_high:14000, salary_type:'monthly', description:'Mobile shop, 9am-6pm, good commission', location:{city:'Lucknow',state:'UP',lat:26.85,lng:80.95}, radius_km:10, status:'active', boost_active:true, views_count:23, likes_count:4, createdAt:new Date() });
  DB.jobs.push({ _id:uid(), employer_id:E[1]._id, title:'Construction Mazdoor', category:'construction', bid_low:500, bid_high:650, salary_type:'daily', description:'Building construction site work', location:{city:'Patna',state:'Bihar',lat:25.60,lng:85.12}, radius_km:15, status:'active', boost_active:false, views_count:11, likes_count:2, createdAt:new Date() });
  DB.jobs.push({ _id:uid(), employer_id:E[2]._id, title:'Kirana Shop Helper', category:'kirana_helper', bid_low:8000, bid_high:11000, salary_type:'monthly', description:'Help manage store, stock keeping', location:{city:'Jaipur',state:'Raj',lat:26.91,lng:75.79}, radius_km:5, status:'active', boost_active:false, views_count:7, likes_count:1, createdAt:new Date() });
  console.log(`✅ Demo data seeded: ${DB.workers.length} workers, ${DB.employers.length} employers, ${DB.jobs.length} jobs`);
})();

// ================================================================
// HELPERS
// ================================================================
const sign = (payload) => jwt.sign(payload, SECRET, { expiresIn: '30d' });
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Login karein pehle (No token)' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token — please login again' }); }
};

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, d2r = Math.PI/180;
  const dLat = (lat2-lat1)*d2r, dLng = (lng2-lng1)*d2r;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function matchScore(worker, job) {
  const ratingScore   = (worker.rating / 5) * 35;
  const dist          = haversine(worker.location?.lat||26.85, worker.location?.lng||80.95, job.location?.lat||26.85, job.location?.lng||80.95);
  const distScore     = Math.max(0, (1 - dist / (job.radius_km||10))) * 25;
  const salaryFit     = worker.ask_price <= job.bid_high ? ((job.bid_high - worker.ask_price) / job.bid_high) * 25 : 0;
  const verifiedScore = worker.is_verified ? 10 : 0;
  const respScore     = (worker.response_rate||0.5) * 5;
  return Math.round(ratingScore + distScore + salaryFit + verifiedScore + respScore);
}

// ================================================================
// CATEGORIES
// ================================================================
const CATS = [
  {id:'salesboy',name:'Salesboy / Sales Girl',hindi:'सेल्सबॉय',icon:'🛍',sector:'retail'},
  {id:'shop_helper',name:'Shop Helper',hindi:'दुकान सहायक',icon:'🏪',sector:'retail'},
  {id:'kirana_helper',name:'Kirana Store Helper',hindi:'किराना सहायक',icon:'📦',sector:'retail'},
  {id:'medical_store',name:'Medical Store Helper',hindi:'दवाई दुकान',icon:'💊',sector:'retail'},
  {id:'cloth_shop',name:'Cloth Shop Helper',hindi:'कपड़ा दुकान',icon:'👗',sector:'retail'},
  {id:'construction',name:'Construction Worker',hindi:'निर्माण मजदूर',icon:'🏗',sector:'construction'},
  {id:'mason',name:'Mason / Raj Mistri',hindi:'राज मिस्त्री',icon:'🧱',sector:'construction'},
  {id:'painter',name:'Painter / Rang Mistri',hindi:'रंग मिस्त्री',icon:'🎨',sector:'construction'},
  {id:'carpenter',name:'Carpenter / Badhai',hindi:'बढ़ई',icon:'🪚',sector:'construction'},
  {id:'electrician',name:'Electrician',hindi:'बिजली मिस्त्री',icon:'⚡',sector:'construction'},
  {id:'plumber',name:'Plumber',hindi:'नलका मिस्त्री',icon:'🔧',sector:'construction'},
  {id:'welder',name:'Welder / Lohar',hindi:'वेल्डर',icon:'🔩',sector:'construction'},
  {id:'tile_worker',name:'Tile / Floor Worker',hindi:'टाइल मिस्त्री',icon:'🪟',sector:'construction'},
  {id:'sanitation',name:'Sanitation Worker',hindi:'सफाई मजदूर',icon:'🪣',sector:'construction'},
  {id:'delivery',name:'Delivery Worker',hindi:'डिलीवरी बॉय',icon:'🚚',sector:'transport'},
  {id:'driver',name:'Driver / Chalak',hindi:'ड्राइवर',icon:'🚗',sector:'transport'},
  {id:'bike_rider',name:'Bike Rider',hindi:'बाइक राइडर',icon:'🏍',sector:'transport'},
  {id:'truck_driver',name:'Truck Driver',hindi:'ट्रक ड्राइवर',icon:'🚜',sector:'transport'},
  {id:'warehouse',name:'Warehouse Worker',hindi:'गोदाम मजदूर',icon:'📦',sector:'transport'},
  {id:'cook',name:'Cook / Chef / Bawarchi',hindi:'बावर्ची',icon:'🍳',sector:'food'},
  {id:'halwai',name:'Halwai / Mithai Maker',hindi:'हलवाई',icon:'🫓',sector:'food'},
  {id:'waiter',name:'Waiter / Hotel Staff',hindi:'वेटर',icon:'🍽',sector:'food'},
  {id:'chai_stall',name:'Chai Stall Worker',hindi:'चाय वाला',icon:'☕',sector:'food'},
  {id:'factory',name:'Factory / Mill Worker',hindi:'फैक्ट्री मजदूर',icon:'🏭',sector:'factory'},
  {id:'tailor',name:'Tailor / Darzi',hindi:'दर्जी',icon:'🧵',sector:'factory'},
  {id:'embroidery',name:'Embroidery Worker',hindi:'कढ़ाई कारीगर',icon:'🪡',sector:'factory'},
  {id:'machine_operator',name:'Machine Operator',hindi:'मशीन ऑपरेटर',icon:'⚙',sector:'factory'},
  {id:'housekeeping',name:'Housekeeping / Maid',hindi:'घरेलू काम',icon:'🧹',sector:'household'},
  {id:'babysitter',name:'Baby Sitter / Aya',hindi:'आया',icon:'🍼',sector:'household'},
  {id:'elder_care',name:'Elder Care',hindi:'बुजुर्ग सेवा',icon:'👴',sector:'household'},
  {id:'gardener',name:'Gardener / Mali',hindi:'माली',icon:'🌿',sector:'household'},
  {id:'dhobi',name:'Washerman / Dhobi',hindi:'धोबी',icon:'🚿',sector:'household'},
  {id:'mobile_repair',name:'Mobile Repair',hindi:'मोबाइल मिस्त्री',icon:'📱',sector:'repair'},
  {id:'ac_repair',name:'AC / Fridge Repair',hindi:'AC फ्रिज रिपेयर',icon:'❄',sector:'repair'},
  {id:'barber',name:'Barber / Nai',hindi:'नाई',icon:'💇',sector:'repair'},
  {id:'beautician',name:'Beautician / Parlour',hindi:'ब्यूटीशियन',icon:'💆',sector:'repair'},
  {id:'locksmith',name:'Locksmith',hindi:'चाबी मिस्त्री',icon:'🔑',sector:'repair'},
  {id:'agriculture',name:'Agriculture Worker',hindi:'खेत मजदूर',icon:'🌾',sector:'agriculture'},
  {id:'dairy',name:'Dairy Worker',hindi:'डेयरी',icon:'🐄',sector:'agriculture'},
  {id:'tractor_operator',name:'Tractor Operator',hindi:'ट्रैक्टर चालक',icon:'🚜',sector:'agriculture'},
  {id:'poultry',name:'Poultry Worker',hindi:'मुर्गी पालन',icon:'🐔',sector:'agriculture'},
  {id:'security_guard',name:'Security Guard',hindi:'चौकीदार',icon:'🛡',sector:'security'},
  {id:'office_peon',name:'Office Peon',hindi:'पियून',icon:'🧑‍💼',sector:'security'},
  {id:'tutor',name:'Tutor / Home Teacher',hindi:'ट्यूटर',icon:'📚',sector:'security'},
  {id:'photographer',name:'Photographer',hindi:'फोटोग्राफर',icon:'📷',sector:'security'},
  {id:'printer_operator',name:'Printer / Xerox',hindi:'प्रिंट',icon:'🖨',sector:'security'},
];

// ================================================================
// ROUTES
// ================================================================

// Health check
app.get('/api/health', (_, res) => res.json({ status:'ok', message:'RozgarConnect is live 🚀', workers:DB.workers.length, employers:DB.employers.length, jobs:DB.jobs.length }));

// Categories
app.get('/api/categories', (req, res) => {
  const { sector } = req.query;
  res.json({ categories: sector ? CATS.filter(c=>c.sector===sector) : CATS, total: CATS.length });
});

// ── AUTH ─────────────────────────────────────────────────────────

// Register Worker
app.post('/api/auth/register/worker', async (req, res) => {
  try {
    const { name, phone, skill_category, ask_price, salary_type, location, experience_years, sub_skill, language, gender } = req.body;
    if (!name||!phone||!skill_category||!ask_price) return res.status(400).json({ error:'Name, phone, skill aur ask_price zaroori hai' });
    if (DB.workers.find(w=>w.phone===phone)) return res.status(409).json({ error:'Yeh phone number pehle se registered hai' });
    const worker = { _id:uid(), name, phone, skill_category, sub_skill:sub_skill||'', ask_price:Number(ask_price), salary_type:salary_type||'monthly', location:location||{city:'',state:'',lat:26.85,lng:80.95}, experience_years:Number(experience_years)||0, language:language||'hindi', gender:gender||'male', rating:0, rating_count:0, is_available:true, is_verified:false, free_unlocks_left:3, response_rate:1.0, views_count:0, work_history:[], createdAt:new Date() };
    DB.workers.push(worker);
    const token = sign({ id:worker._id, role:'worker' });
    res.status(201).json({ message:'Worker registered! Welcome to RozgarConnect 🎉', token, worker });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Register Employer
app.post('/api/auth/register/employer', async (req, res) => {
  try {
    const { business_name, owner_name, phone, whatsapp, business_type, location, gstin } = req.body;
    if (!business_name||!owner_name||!phone) return res.status(400).json({ error:'Business name, owner name aur phone zaroori hai' });
    if (DB.employers.find(e=>e.phone===phone)) return res.status(409).json({ error:'Yeh phone number pehle se registered hai' });
    const employer = { _id:uid(), business_name, owner_name, phone, whatsapp:whatsapp||phone, business_type:business_type||'retail', location:location||{city:'',state:'',lat:26.85,lng:80.95}, gstin:gstin||'', rating:0, is_verified:false, plan:'free', boost_active:false, boost_expires_at:null, direct_fetch_used:0, direct_fetch_quota:5, daily_like_quota:50, likes_used_today:0, createdAt:new Date() };
    DB.employers.push(employer);
    const token = sign({ id:employer._id, role:'employer' });
    res.status(201).json({ message:'Employer registered! Ab job post karein 🎉', token, employer });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Login Worker
app.post('/api/auth/login/worker', (req, res) => {
  const { phone } = req.body;
  const worker = DB.workers.find(w=>w.phone===phone);
  if (!worker) return res.status(404).json({ error:'Is phone se koi worker registered nahi hai' });
  res.json({ message:'Login ho gaya!', token:sign({ id:worker._id, role:'worker' }), worker });
});

// Login Employer
app.post('/api/auth/login/employer', (req, res) => {
  const { phone } = req.body;
  const employer = DB.employers.find(e=>e.phone===phone);
  if (!employer) return res.status(404).json({ error:'Is phone se koi employer registered nahi hai' });
  res.json({ message:'Login ho gaya!', token:sign({ id:employer._id, role:'employer' }), employer });
});

// Me
app.get('/api/auth/me', auth, (req, res) => {
  if (req.user.role==='worker') {
    const w = DB.workers.find(w=>w._id===req.user.id);
    return w ? res.json({ role:'worker', user:w }) : res.status(404).json({ error:'Not found' });
  }
  const e = DB.employers.find(e=>e._id===req.user.id);
  return e ? res.json({ role:'employer', user:e }) : res.status(404).json({ error:'Not found' });
});

// ── WORKERS ──────────────────────────────────────────────────────

// Browse workers (employer)
app.get('/api/workers', auth, (req, res) => {
  const { category, city, min_rating, max_ask, verified_only } = req.query;
  let workers = DB.workers.filter(w => w.is_available);
  if (category) workers = workers.filter(w=>w.skill_category===category);
  if (city) workers = workers.filter(w=>w.location?.city?.toLowerCase().includes(city.toLowerCase()));
  if (min_rating) workers = workers.filter(w=>w.rating>=Number(min_rating));
  if (max_ask) workers = workers.filter(w=>w.ask_price<=Number(max_ask));
  if (verified_only==='true') workers = workers.filter(w=>w.is_verified);
  workers = workers.sort((a,b)=>b.rating-a.rating || b.is_verified-a.is_verified);
  res.json({ workers, total:workers.length });
});

// Get worker profile
app.get('/api/workers/:id', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Worker not found' });
  w.views_count = (w.views_count||0)+1;
  res.json({ worker:w });
});

// Toggle availability
app.patch('/api/workers/:id/availability', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Not found' });
  w.is_available = !w.is_available;
  res.json({ is_available:w.is_available, message:`Ab aap ${w.is_available?'available':'unavailable'} hain` });
});

// Update ask price
app.patch('/api/workers/:id/ask-price', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Not found' });
  w.ask_price = Number(req.body.ask_price);
  res.json({ message:'ASK price update ho gayi!', ask_price:w.ask_price });
});

// Update worker profile
app.patch('/api/workers/:id', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Not found' });
  ['name','description','skill_category','sub_skill','experience_years','location'].forEach(k=>{ if(req.body[k]!==undefined) w[k]=req.body[k]; });
  res.json({ worker:w });
});

// Direct fetch (employer king feature)
app.post('/api/workers/:id/direct-fetch', auth, (req, res) => {
  if (req.user.role!=='employer') return res.status(403).json({ error:'Sirf employers ke liye' });
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Worker not found' });
  const emp = DB.employers.find(e=>e._id===req.user.id);
  if (emp) emp.direct_fetch_used = (emp.direct_fetch_used||0)+1;
  res.json({ message:'✅ Direct fetch successful! Contact details mil gayi.', worker_name:w.name, phone:w.phone, whatsapp:w.phone, location:w.location, skill_category:w.skill_category, ask_price:w.ask_price, rating:w.rating, charge:'₹29' });
});

// ── EMPLOYERS ────────────────────────────────────────────────────

app.get('/api/employers/profile', auth, (req, res) => {
  const e = DB.employers.find(e=>e._id===req.user.id);
  if (!e) return res.status(404).json({ error:'Not found' });
  res.json({ employer:e });
});

app.patch('/api/employers/profile', auth, (req, res) => {
  const e = DB.employers.find(e=>e._id===req.user.id);
  if (!e) return res.status(404).json({ error:'Not found' });
  ['business_name','owner_name','whatsapp','business_type','location'].forEach(k=>{ if(req.body[k]!==undefined) e[k]=req.body[k]; });
  res.json({ employer:e });
});

// ── JOBS ─────────────────────────────────────────────────────────

// Post a job (BID placement)
app.post('/api/jobs', auth, (req, res) => {
  if (req.user.role!=='employer') return res.status(403).json({ error:'Sirf employers job post kar sakte hain' });
  const { title, category, bid_low, bid_high, salary_type, description, location, radius_km, start_date } = req.body;
  if (!category||!bid_high) return res.status(400).json({ error:'Category aur maximum salary zaroori hai' });
  const emp = DB.employers.find(e=>e._id===req.user.id);
  const job = { _id:uid(), employer_id:req.user.id, employer_name:emp?.business_name||'Employer', title:title||category, category, bid_low:Number(bid_low)||0, bid_high:Number(bid_high), salary_type:salary_type||'monthly', description:description||'', location:location||emp?.location||{city:'',state:'',lat:26.85,lng:80.95}, radius_km:Number(radius_km)||10, start_date:start_date||'Turant / Immediate', status:'active', boost_active:false, views_count:0, likes_count:0, createdAt:new Date() };
  DB.jobs.push(job);
  // BID-ASK ENGINE: find eligible workers immediately
  const eligible = bidAskEngine(job);
  res.status(201).json({ message:`Job post ho gayi! ${eligible.length} workers eligible hain!`, job, eligible_workers_count:eligible.length, eligible_workers:eligible.slice(0,10) });
});

// Browse all jobs (public)
app.get('/api/jobs', (req, res) => {
  const { category, city } = req.query;
  let jobs = DB.jobs.filter(j=>j.status==='active');
  if (category) jobs = jobs.filter(j=>j.category===category);
  if (city) jobs = jobs.filter(j=>j.location?.city?.toLowerCase().includes(city.toLowerCase()));
  jobs = jobs.sort((a,b)=>b.boost_active-a.boost_active || new Date(b.createdAt)-new Date(a.createdAt));
  // Attach employer info
  const withEmp = jobs.map(j=>({ ...j, employer_id:{ _id:j.employer_id, business_name:j.employer_name||'Employer', location:j.location } }));
  res.json({ jobs:withEmp, total:withEmp.length });
});

// Worker job feed — only jobs where bid >= worker ask
app.get('/api/jobs/feed', auth, (req, res) => {
  if (req.user.role!=='worker') return res.status(403).json({ error:'Sirf workers ke liye' });
  const worker = DB.workers.find(w=>w._id===req.user.id);
  if (!worker) return res.status(404).json({ error:'Worker not found' });
  let jobs = DB.jobs.filter(j => j.status==='active' && j.bid_high>=worker.ask_price && j.salary_type===worker.salary_type);
  jobs = jobs.sort((a,b)=>b.boost_active-a.boost_active || new Date(b.createdAt)-new Date(a.createdAt));
  const withEmp = jobs.map(j=>({ ...j, employer_id:{ _id:j.employer_id, business_name:j.employer_name||'Employer', location:j.location } }));
  res.json({ jobs:withEmp, worker_ask:worker.ask_price, total:withEmp.length });
});

// Employer's own jobs
app.get('/api/jobs/my-jobs', auth, (req, res) => {
  const jobs = DB.jobs.filter(j=>j.employer_id===req.user.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  res.json({ jobs, total:jobs.length });
});

// Get eligible workers for a job (BID-ASK engine)
app.get('/api/jobs/:id/eligible-workers', auth, (req, res) => {
  const job = DB.jobs.find(j=>j._id===req.params.id);
  if (!job) return res.status(404).json({ error:'Job not found' });
  job.views_count = (job.views_count||0)+1;
  const workers = bidAskEngine(job);
  res.json({ workers, total:workers.length, job });
});

// Boost a job
app.post('/api/jobs/:id/boost', auth, (req, res) => {
  const job = DB.jobs.find(j=>j._id===req.params.id && j.employer_id===req.user.id);
  if (!job) return res.status(404).json({ error:'Job not found' });
  const days = { basic:3, super:7, max:15 };
  job.boost_active = true;
  job.boost_plan = req.body.plan||'basic';
  job.boost_expires = new Date(Date.now()+(days[job.boost_plan]||3)*86400000);
  res.json({ message:`Job ko ${job.boost_plan} boost mil gaya!`, job });
});

// Like a worker (employer)
app.post('/api/jobs/:id/like-worker/:workerId', auth, (req, res) => {
  if (req.user.role!=='employer') return res.status(403).json({ error:'Sirf employers ke liye' });
  const job = DB.jobs.find(j=>j._id===req.params.id);
  if (!job) return res.status(404).json({ error:'Job not found' });
  const existing = DB.matches.find(m=>m.employer_id===req.user.id && m.worker_id===req.params.workerId && m.job_id===req.params.id);
  if (existing) return res.status(409).json({ error:'Pehle se like kar diya hai', match:existing });
  const worker = DB.workers.find(w=>w._id===req.params.workerId);
  const score = worker ? matchScore(worker, job) : 0;
  const match = { _id:uid(), employer_id:req.user.id, worker_id:req.params.workerId, job_id:req.params.id, match_score:score, status:'employer_liked', contact_unlocked:false, expires_at:new Date(Date.now()+72*3600000), createdAt:new Date() };
  DB.matches.push(match);
  job.likes_count = (job.likes_count||0)+1;
  res.status(201).json({ message:'Worker ko like kar diya! Unke accept karne par match hoga.', match });
});

// ── MATCHES ──────────────────────────────────────────────────────

// My matches
app.get('/api/matches/my-matches', auth, (req, res) => {
  let matches;
  if (req.user.role==='worker') {
    matches = DB.matches.filter(m=>m.worker_id===req.user.id && m.status!=='expired').map(m=>{
      const emp = DB.employers.find(e=>e._id===m.employer_id);
      const job = DB.jobs.find(j=>j._id===m.job_id);
      return { ...m, employer_id:{ _id:m.employer_id, business_name:emp?.business_name, location:emp?.location, rating:emp?.rating, business_type:emp?.business_type }, job_id:{ _id:m.job_id, title:job?.title, category:job?.category, bid_high:job?.bid_high, salary_type:job?.salary_type, description:job?.description } };
    });
  } else {
    matches = DB.matches.filter(m=>m.employer_id===req.user.id && m.status!=='expired').map(m=>{
      const wk = DB.workers.find(w=>w._id===m.worker_id);
      const job = DB.jobs.find(j=>j._id===m.job_id);
      return { ...m, worker_id:{ _id:m.worker_id, name:wk?.name, skill_category:wk?.skill_category, ask_price:wk?.ask_price, location:wk?.location, rating:wk?.rating, is_verified:wk?.is_verified, phone:m.contact_unlocked?wk?.phone:undefined }, job_id:{ _id:m.job_id, title:job?.title, category:job?.category, bid_high:job?.bid_high } };
    });
  }
  matches = matches.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  res.json({ matches, total:matches.length });
});

// Accept match (worker)
app.patch('/api/matches/:id/accept', auth, (req, res) => {
  const match = DB.matches.find(m=>m._id===req.params.id && m.worker_id===req.user.id);
  if (!match) return res.status(404).json({ error:'Match not found' });
  match.status = 'mutual';
  match.contact_unlocked = true;
  res.json({ message:'🎉 Match confirm ho gaya! Employer ko notify kar diya.', match });
});

// Reject match
app.patch('/api/matches/:id/reject', auth, (req, res) => {
  const match = DB.matches.find(m=>m._id===req.params.id);
  if (!match) return res.status(404).json({ error:'Match not found' });
  match.status = 'rejected';
  res.json({ message:'Match decline kar diya', match });
});

// ── BID-ASK ENGINE ───────────────────────────────────────────────
function bidAskEngine(job) {
  return DB.workers
    .filter(w => w.is_available && w.skill_category===job.category && w.ask_price<=job.bid_high && w.salary_type===job.salary_type)
    .map(w => ({ ...w, match_score:matchScore(w,job), distance_km:+haversine(w.location?.lat||26.85,w.location?.lng||80.95,job.location?.lat||26.85,job.location?.lng||80.95).toFixed(1) }))
    .filter(w => w.distance_km <= (job.radius_km||10))
    .sort((a,b)=>b.match_score-a.match_score);
}

// ── CATCH ALL → serve frontend ───────────────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'frontend/public/index.html')));

// ── START ────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`\n✅ RozgarConnect running at http://localhost:${PORT}\n`));
