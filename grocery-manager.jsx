import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════ CONSTANTS */
const F = "'DM Mono', monospace";
const DF = "'Space Mono', monospace";
const C = {
  bg:"#07070d", surface:"#0f0f1a", card:"#131320", border:"#1c1c2e", border2:"#2a2a3f",
  text:"#e8e8f4", muted:"#5a5a7a", dim:"#252535", accent:"#5a5aff", accent2:"#7c7cff",
  green:"#2ecc71", amber:"#f39c12", red:"#e74c3c", yellow:"#f1c40f", pink:"#e91e8c",
};
const SC = { critical:C.red, warning:C.amber, soon:C.yellow, ok:C.green, out:C.red, low:C.amber };
const CATS = ["Produce","Dairy","Meat","Poultry","Seafood","Bakery","Frozen","Beverages","Pantry","Snacks","Candy","Condiments","Canned Goods","Dry Goods","Paper Goods","Cleaning Supplies","Health & Beauty","Baby","Pet Care","Household","Floral","Alcohol","Tobacco"];

/* ═══════════════════════════════════════════════════════════ SEED DATA */
const STORES_SEED = [
  { id:"s1", name:"Downtown Flagship", city:"New York, NY",    manager:"Alex Kim",    active:true,  revenue:24100 },
  { id:"s2", name:"Westside Market",   city:"Los Angeles, CA", manager:"Sam Lee",     active:true,  revenue:18200 },
  { id:"s3", name:"Northgate Fresh",   city:"Chicago, IL",     manager:"Jordan Park", active:true,  revenue:15400 },
];
const SUPPLIERS_SEED = [
  { id:"sup1", name:"FreshFarm Co.",   contact:"orders@freshfarm.com",   phone:"(212)555-0101", leadDays:2, rating:4.8, categories:["Produce","Dairy","Floral"],     active:true },
  { id:"sup2", name:"MeatWorks LLC",   contact:"supply@meatworks.com",   phone:"(213)555-0202", leadDays:1, rating:4.6, categories:["Meat","Poultry","Seafood"],     active:true },
  { id:"sup3", name:"BakeryDirect",    contact:"hello@bakerydirect.com", phone:"(312)555-0303", leadDays:1, rating:4.9, categories:["Bakery","Snacks"],              active:true },
  { id:"sup4", name:"ColdChain Dist.", contact:"ops@coldchain.com",      phone:"(415)555-0404", leadDays:3, rating:4.5, categories:["Frozen","Beverages","Alcohol"], active:true },
  { id:"sup5", name:"Pantry Plus",     contact:"bulk@pantryplus.com",    phone:"(718)555-0505", leadDays:4, rating:4.3, categories:["Pantry","Condiments","Canned Goods","Dry Goods"], active:true },
  { id:"sup6", name:"Household Essentials", contact:"support@householdessentials.com", phone:"(718)555-0606", leadDays:2, rating:4.2, categories:["Paper Goods","Cleaning Supplies","Health & Beauty","Household"], active:true },
  { id:"sup7", name:"Family Care Products", contact:"info@familycare.com", phone:"(305)555-0707", leadDays:3, rating:4.4, categories:["Baby","Pet Care","Snacks","Candy"], active:true },
  { id:"sup8", name:"Tobacco & Specialty", contact:"orders@tobaccospecialty.com", phone:"(202)555-0808", leadDays:5, rating:4.1, categories:["Tobacco"], active:true },
];
const USERS_SEED = [
  { id:"u1", role:"store",    name:"Alex Kim",    email:"alex@downtown.com",   password:"store123",  storeId:"s1",   status:"active", subscriptionId:"sub1", paymentMethods: ["Visa ending in 4242", "Mastercard ending in 5555"] },
  { id:"u2", role:"store",    name:"Sam Lee",     email:"sam@westside.com",    password:"store123",  storeId:"s2",   status:"active", subscriptionId:"sub1", paymentMethods: ["Visa ending in 1111"] },
  { id:"u3", role:"store",    name:"Jordan Park", email:"jordan@northgate.com",password:"store123",  storeId:"s3",   status:"active", subscriptionId:"sub2", paymentMethods: ["Amex ending in 9876"] },
  { id:"u4", role:"supplier", name:"FreshFarm Co.",   email:"orders@freshfarm.com",   password:"sup123", supplierId:"sup1", status:"active" },
  { id:"u5", role:"supplier", name:"MeatWorks LLC",   email:"supply@meatworks.com",   password:"sup123", supplierId:"sup2", status:"active" },
  { id:"u6", role:"supplier", name:"BakeryDirect",    email:"hello@bakerydirect.com", password:"sup123", supplierId:"sup3", status:"active" },
  { id:"u7", role:"admin",    name:"Super Admin",     email:"admin@shelfos.com",      password:"admin123",status:"active" },
];
const PRICING_PLANS = [
  { id:"basic",    name:"Basic",     monthly:29,   yearly:299,  stores:1, features:["Inventory management","Basic analytics","Email support"],     color:C.accent },
  { id:"pro",      name:"Pro",       monthly:79,   yearly:799,  stores:5, features:["All Basic features","Multi-store management","Priority support","API access"], color:C.green },
  { id:"enterprise", name:"Enterprise", monthly:199, yearly:1999, stores:null, features:["Unlimited stores","Dedicated support","Custom integrations","SLA guarantee"], color:C.pink },
];
const SUBSCRIPTIONS_SEED = [
  { id:"sub1", userId:"u1", planId:"pro", billingCycle:"monthly", amount:79, startDate:daysAgo(30), nextBillingDate:new Date().toISOString(), status:"active", paymentMethod:"Visa ending in 4242" },
  { id:"sub2", userId:"u2", planId:"basic", billingCycle:"yearly", amount:299, startDate:daysAgo(180), nextBillingDate:daysAgo(-180), status:"active", paymentMethod:"Mastercard ending in 5555" },
  { id:"sub3", userId:"u3", planId:"pro", billingCycle:"monthly", amount:79, startDate:daysAgo(7), nextBillingDate:new Date().toISOString(), status:"active", paymentMethod:"Visa ending in 1111" },
];
const BARCODE_DB = {
  "012345678901":{ name:"Organic Whole Milk",     category:"Dairy",    price:3.49,  expiryDays:7,   description:"Fresh organic whole milk, 1 gallon" },
  "098765432109":{ name:"Sourdough Bread",        category:"Bakery",   price:5.99,  expiryDays:4,   description:"Artisan sourdough loaf, 800g" },
  "111222333444":{ name:"Atlantic Salmon Fillet", category:"Meat",     price:12.99, expiryDays:2,   description:"Fresh Atlantic salmon, per lb" },
  "444333222111":{ name:"Roma Tomatoes",          category:"Produce",  price:1.99,  expiryDays:5,   description:"Fresh Roma tomatoes, per lb" },
  "555666777888":{ name:"Greek Yogurt Plain",     category:"Dairy",    price:4.29,  expiryDays:14,  description:"Full-fat Greek yogurt, 32oz" },
  "888777666555":{ name:"Orange Juice",           category:"Beverages",price:3.79,  expiryDays:10,  description:"100% fresh squeezed OJ, 64oz" },
  "123456789012":{ name:"Frozen Peas",            category:"Frozen",   price:2.49,  expiryDays:365, description:"Sweet green peas, frozen, 16oz" },
  "210987654321":{ name:"Free Range Eggs",        category:"Dairy",    price:6.49,  expiryDays:21,  description:"Cage-free large brown eggs, 12ct" },
};
const BARCODES = Object.keys(BARCODE_DB);
const WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SALES = { s1:[4200,3800,4100,4900,5800,7200,6100], s2:[3100,2900,3300,3700,4400,5500,4800], s3:[2600,2400,2800,3100,3700,4600,4000] };

function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); }
function daysUntil(added,shelf){ const e=new Date(added); e.setDate(e.getDate()+shelf); return Math.ceil((e-new Date())/864e5); }
function expiryStatus(d){ return d<=1?"critical":d<=3?"warning":d<=7?"soon":"ok"; }
function stockStatus(s,m){ return s===0?"out":s<m?"low":"ok"; }
function makeProds(sid){
  return [
    {id:`${sid}-1`,storeId:sid,name:"Organic Whole Milk",    category:"Dairy",   sku:"DAI-001",barcode:"012345678901",price:3.49, stock:42,minStock:15,expiryDays:7,  addedDate:daysAgo(2),description:"Fresh organic whole milk, 1 gallon",  tag:{synced:true, lastSync:"2m ago"}, supplierId:"sup1", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Organic Whole Milk product photo, professional food photography, white background")}&image_size=square`},
    {id:`${sid}-2`,storeId:sid,name:"Sourdough Bread",       category:"Bakery",  sku:"BAK-007",barcode:"098765432109",price:5.99, stock:18,minStock:10,expiryDays:4,  addedDate:daysAgo(1),description:"Artisan sourdough loaf, 800g",        tag:{synced:true, lastSync:"5m ago"}, supplierId:"sup3", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Sourdough Bread product photo, professional food photography, white background")}&image_size=square`},
    {id:`${sid}-3`,storeId:sid,name:"Atlantic Salmon Fillet",category:"Seafood", sku:"SEA-023",barcode:"111222333444",price:12.99,stock:8, minStock:12,expiryDays:2,  addedDate:daysAgo(3),description:"Fresh Atlantic salmon, per lb",       tag:{synced:false,lastSync:"2h ago"},supplierId:"sup2", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Atlantic Salmon Fillet product photo, professional food photography, white background")}&image_size=square`},
    {id:`${sid}-4`,storeId:sid,name:"Roma Tomatoes",         category:"Produce", sku:"PRO-041",barcode:"444333222111",price:1.99, stock:65,minStock:20,expiryDays:5,  addedDate:daysAgo(1),description:"Fresh Roma tomatoes, per lb",         tag:{synced:true, lastSync:"1m ago"}, supplierId:"sup1", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Roma Tomatoes product photo, professional food photography, white background")}&image_size=square`},
    {id:`${sid}-5`,storeId:sid,name:"Greek Yogurt Plain",    category:"Dairy",   sku:"DAI-012",barcode:"555666777888",price:4.29, stock:30,minStock:20,expiryDays:14, addedDate:daysAgo(0),description:"Full-fat Greek yogurt, 32oz",        tag:{synced:true, lastSync:"8m ago"}, supplierId:"sup1", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Greek Yogurt Plain product photo, professional food photography, white background")}&image_size=square`},
    {id:`${sid}-6`,storeId:sid,name:"Frozen Peas",           category:"Frozen",  sku:"FRZ-003",barcode:"123456789012",price:2.49, stock:55,minStock:25,expiryDays:365,addedDate:daysAgo(10),description:"Sweet green peas, frozen, 16oz",   tag:{synced:false,lastSync:"1d ago"}, supplierId:"sup4", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Frozen Peas product photo, professional food photography, white background")}&image_size=square`},
    {id:`${sid}-7`,storeId:sid,name:"Orange Juice",          category:"Beverages",sku:"BEV-019",barcode:"888777666555",price:3.79,stock:28,minStock:15,expiryDays:10, addedDate:daysAgo(3),description:"100% fresh squeezed OJ, 64oz",      tag:{synced:true, lastSync:"3m ago"}, supplierId:"sup4", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Orange Juice product photo, professional food photography, white background")}&image_size=square`},
    {id:`${sid}-8`,storeId:sid,name:"Free Range Eggs",       category:"Dairy",   sku:"DAI-005",barcode:"210987654321",price:6.49, stock:5, minStock:10,expiryDays:21, addedDate:daysAgo(5),description:"Cage-free large brown eggs, 12ct", tag:{synced:true, lastSync:"11m ago"},supplierId:"sup1", imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Free Range Eggs product photo, professional food photography, white background")}&image_size=square`},
  ];
}
const SEED_ORDERS = [
  {id:"ORD-1001",storeId:"s1",supplierId:"sup1",supplierName:"FreshFarm Co.",status:"delivered",placedAt:daysAgo(5),eta:"3 days ago",total:284.50,items:[{name:"Organic Whole Milk",qty:40,unitPrice:3.49},{name:"Greek Yogurt Plain",qty:30,unitPrice:4.29}],notes:"Urgent restock",priority:"high",courier:{name:"Mike Johnson",phone:"(212) 555-1234",company:"Express Delivery Co.",trackingNumber:"TRK789456123",estimatedDelivery:"Tomorrow"}},
  {id:"ORD-1002",storeId:"s1",supplierId:"sup2",supplierName:"MeatWorks LLC",status:"in-transit",placedAt:daysAgo(2),eta:"Tomorrow",total:519.60,items:[{name:"Atlantic Salmon Fillet",qty:40,unitPrice:12.99}],notes:"",priority:"normal",courier:{name:"Sarah Williams",phone:"(213) 555-8765",company:"Fresh Freight Services",trackingNumber:"TRK123456789",estimatedDelivery:"Tomorrow"}},
  {id:"ORD-1003",storeId:"s2",supplierId:"sup1",supplierName:"FreshFarm Co.",status:"pending",placedAt:daysAgo(1),eta:"In 2 days",total:147.40,items:[{name:"Roma Tomatoes",qty:50,unitPrice:1.99},{name:"Greek Yogurt Plain",qty:20,unitPrice:4.29}],notes:"Refrigerated truck",priority:"normal"},
  {id:"ORD-1004",storeId:"s3",supplierId:"sup3",supplierName:"BakeryDirect",status:"confirmed",placedAt:daysAgo(1),eta:"Tomorrow",total:119.80,items:[{name:"Sourdough Bread",qty:20,unitPrice:5.99}],notes:"",priority:"low"},
  {id:"ORD-1005",storeId:"s1",supplierId:"sup4",supplierName:"ColdChain Dist.",status:"pending",placedAt:daysAgo(0),eta:"In 3 days",total:87.30,items:[{name:"Orange Juice",qty:23,unitPrice:3.79}],notes:"",priority:"normal"},
];

/* ═══════════════════════════════════════════════════════════ GLOBAL CSS */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:${F}}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:#2a2a3f;border-radius:2px}
  input,select,textarea{font-family:${F};background:#0f0f1a;border:1px solid ${C.border2};color:${C.text};border-radius:7px;padding:9px 13px;font-size:13px;outline:none;width:100%;transition:border-color .2s}
  input:focus,select:focus,textarea:focus{border-color:${C.accent}}
  input::placeholder{color:${C.muted}}
  button{font-family:${F};cursor:pointer}
  .bp{background:${C.accent};color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;transition:all .2s}
  .bp:hover{background:${C.accent2};transform:translateY(-1px)}
  .bp:active{transform:none}
  .bg{background:none;border:1px solid ${C.border2};color:#9090b0;padding:9px 16px;border-radius:8px;font-size:13px;transition:all .2s}
  .bg:hover{border-color:${C.accent};color:${C.text}}
  .card{background:${C.card};border:1px solid ${C.border};border-radius:14px}
  .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:500;white-space:nowrap}
  .sdot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0}
  .blink{animation:blink .9s ease-in-out infinite alternate}
  @keyframes blink{from{opacity:.25}to{opacity:1}}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(6px);padding:16px}
  .modal{background:${C.surface};border:1px solid ${C.border2};border-radius:18px;padding:28px;width:560px;max-width:100%;max-height:92vh;overflow-y:auto}
  .nb{background:none;border:none;border-bottom:2px solid transparent;color:${C.muted};padding:12px 14px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;transition:all .2s;white-space:nowrap;font-family:${F}}
  .nb.act{color:${C.text};border-bottom-color:${C.accent}}
  .nb:hover{color:${C.text}}
  .trow{border-bottom:1px solid ${C.border}}
  .trow:hover{background:${C.surface}!important}
  th{color:${C.muted};font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:10px 14px;font-weight:400;text-align:left;white-space:nowrap}
  td{padding:11px 14px;font-size:13px;vertical-align:middle}
  .btrack{height:5px;border-radius:3px;background:${C.border};overflow:hidden;margin-top:4px}
  .bfill{height:100%;border-radius:3px;transition:width .5s}
  .toast-wrap{position:fixed;bottom:22px;right:22px;z-index:999;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none}
  .toast{background:${C.card};border:1px solid ${C.border2};border-radius:10px;padding:11px 16px;font-size:12px;display:flex;align-items:center;gap:9px;animation:tslide .22s ease;box-shadow:0 8px 30px rgba(0,0,0,.5)}
  @keyframes tslide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .sc{background:${C.card};border:1px solid ${C.border};border-radius:11px;padding:18px 20px}
  .order-timeline{display:flex;align-items:center;gap:0;margin:10px 0}
  .ot-step{flex:1;text-align:center;position:relative}
  .ot-step::before{content:'';position:absolute;top:10px;left:-50%;right:50%;height:2px;background:${C.border};z-index:0}
  .ot-step:first-child::before{display:none}
  .ot-dot{width:20px;height:20px;border-radius:50%;border:2px solid ${C.border};background:${C.card};display:inline-flex;align-items:center;justify-content:center;font-size:9px;position:relative;z-index:1;transition:all .3s}
  .ot-dot.done{background:${C.green};border-color:${C.green};color:#fff}
  .ot-dot.active{background:${C.accent};border-color:${C.accent};color:#fff;box-shadow:0 0 10px ${C.accent}66}
  .ot-label{font-size:9px;color:${C.muted};margin-top:4px;letter-spacing:.04em}
  .stat-up{color:${C.green};font-size:11px}
  .stat-dn{color:${C.red};font-size:11px}
  .tab-bar{display:flex;gap:2px;overflow-x:auto;border-bottom:1px solid ${C.border};padding:0 18px;background:#0a0a14}
`;

/* ═══════════════════════════════════════════════════════════ STATUS HELPERS */
const ORDER_STATUSES = ["pending","confirmed","processing","in-transit","delivered","cancelled"];
const ORDER_STATUS_COLOR = { pending:C.muted, confirmed:C.accent, processing:C.yellow, "in-transit":C.amber, delivered:C.green, cancelled:C.red };
const PRIORITY_COLOR = { high:C.red, normal:C.accent, low:C.muted };

/* ═══════════════════════════════════════════════════════════ ROOT */
export default function App(){
  const [session, setSession] = useState(null); // { user }
  const [users, setUsers]     = useState(USERS_SEED);
  const [stores]              = useState(STORES_SEED);
  const [suppliers]           = useState(SUPPLIERS_SEED);
  const [allProducts, setAllProducts] = useState(()=>STORES_SEED.flatMap(s=>makeProds(s.id)));
  const [allOrders, setAllOrders]     = useState(SEED_ORDERS);
  const [catalog, setCatalog] = useState(
    CATALOG_SEED.map(p => ({
      ...p,
      imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${p.name} product photo, professional food photography, white background`)}&image_size=square`
    }))
  );
  const [subscriptions, setSubscriptions] = useState(SUBSCRIPTIONS_SEED);
  const [payments, setPayments] = useState([
    { id: 'pay-1', userId: 'u1', amount: 79, type: 'subscription', status: 'completed', date: daysAgo(30), method: 'Visa ending in 4242' },
    { id: 'pay-2', userId: 'u2', amount: 299, type: 'subscription', status: 'completed', date: daysAgo(180), method: 'Mastercard ending in 5555' },
    { id: 'pay-3', userId: 'u1', amount: 284.50, type: 'order', status: 'completed', date: daysAgo(5), method: 'Visa ending in 4242' },
  ]);
  const [toasts, setToasts]   = useState([]);
  const [syncingIds, setSyncingIds] = useState(new Set());

  function toast(msg, color=C.green){
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,color}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200);
  }

  function login(email, password){
    const u=users.find(u=>u.email===email&&u.password===password);
    if(!u) return false;
    setSession({user:u});
    return true;
  }
  function logout(){ setSession(null); }

  function register(data){
    const exists=users.find(u=>u.email===data.email);
    if(exists) return false;
    const newUser={id:`u${Date.now()}`,status:"pending",...data};
    setUsers(u=>[...u,newUser]);
    return true;
  }

  function createSubscription(userId, planId, billingCycle){
    const plan=PRICING_PLANS.find(p=>p.id===planId);
    if(!plan) return false;
    const sub={
      id:`sub${Date.now()}`,
      userId,
      planId,
      billingCycle,
      amount:billingCycle==="monthly"?plan.monthly:plan.yearly,
      startDate:new Date().toISOString(),
      nextBillingDate:new Date(Date.now()+30*24*60*60*1000).toISOString(),
      status:"active",
      paymentMethod:"Card ending in ****"
    };
    setSubscriptions(s=>[...s,sub]);
    setUsers(u=>u.map(x=>x.id===userId?{...x,subscriptionId:sub.id}:x));
    return true;
  }

  function updateSubscription(subId, planId){
    const plan=PRICING_PLANS.find(p=>p.id===planId);
    if(!plan) return false;
    setSubscriptions(s=>s.map(sub=>sub.id===subId?{...sub,planId,amount:sub.billingCycle==="monthly"?plan.monthly:plan.yearly}:sub));
    toast("Subscription updated");
    return true;
  }

  function cancelSubscription(subId){
    setSubscriptions(s=>s.map(sub=>sub.id===subId?{...sub,status:"cancelled"}:sub));
    toast("Subscription cancelled",C.amber);
  }

  function syncTag(id){
    setSyncingIds(p=>new Set([...p,id]));
    setTimeout(()=>{
      setAllProducts(all=>all.map(p=>p.id===id?{...p,tag:{synced:true,lastSync:"just now"}}:p));
      setSyncingIds(p=>{const n=new Set(p);n.delete(id);return n;});
      toast("Tag synced");
    },1800);
  }

  const sharedProps = { 
    users, setUsers, stores, suppliers, allProducts, setAllProducts, 
    allOrders, setAllOrders, subscriptions, setSubscriptions,
    payments, setPayments, catalog, setCatalog,
    syncingIds, syncTag, toast, logout,
    createSubscription, updateSubscription, cancelSubscription, plans: PRICING_PLANS
  };

  return(
    <div style={{fontFamily:F,background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{GLOBAL_CSS}</style>
      <div className="toast-wrap">
        {toasts.map(t=><div key={t.id} className="toast"><span className="sdot" style={{background:t.color}}/>{t.msg}</div>)}
      </div>
      {!session
        ? <LandingPage onLogin={login} onRegister={register} toast={toast} plans={PRICING_PLANS}/>
        : session.user.role==="admin"
          ? <AdminPanel {...sharedProps} session={session} plans={PRICING_PLANS}/>
          : session.user.role==="supplier"
            ? <SupplierPortal {...sharedProps} session={session}/>
            : <StoreDashboard {...sharedProps} session={session}/>
      }
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ LANDING PAGE */
function LandingPage({onLogin, onRegister, toast, plans}){
  const [mode, setMode]     = useState("home"); // home | login | register
  const [role, setRole]     = useState("store");
  const [email, setEmail]   = useState("");
  const [password, setPass] = useState("");
  const [regForm, setReg]   = useState({role:"store",name:"",email:"",password:"",storeName:"",city:""});
  const [err, setErr]       = useState("");

  function doLogin(e){
    e.preventDefault(); setErr("");
    if(!onLogin(email,password)) setErr("Invalid email or password.");
  }
  function doRegister(e){
    e.preventDefault(); setErr("");
    if(!regForm.name||!regForm.email||!regForm.password){setErr("Please fill all required fields."); return;}
    if(onRegister({...regForm})) { toast("Account created — pending admin approval",C.amber); setMode("login"); }
    else setErr("Email already registered.");
  }

  const DEMO = [
    {role:"store",   label:"Store Manager",  email:"alex@downtown.com",    pass:"store123", color:C.accent},
    {role:"supplier",label:"Supplier",       email:"orders@freshfarm.com", pass:"sup123",   color:C.green},
    {role:"admin",   label:"Admin",          email:"admin@shelfos.com",    pass:"admin123", color:C.pink},
  ];

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Nav */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",height:60,borderBottom:`1px solid ${C.border}`,background:C.surface,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/shelfos_logo.svg" alt="ShelfOS" style={{width:28,height:28}}/>
          <span style={{fontFamily:DF,fontSize:13,fontWeight:700,letterSpacing:".05em"}}>SHELF<span style={{color:C.accent}}>OS</span></span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="bg" style={{padding:"7px 16px",fontSize:12}} onClick={()=>{setMode("login");setErr("");}}>Sign In</button>
          <button className="bp" style={{padding:"7px 16px",fontSize:12}} onClick={()=>{setMode("register");setErr("");}}>Get Started</button>
        </div>
      </nav>

      {mode==="home"&&(
        <div style={{flex:1}}>
          {/* Hero */}
          <div style={{textAlign:"center",padding:"80px 24px 60px",background:`radial-gradient(ellipse at 50% 0%, ${C.accent}18 0%, transparent 65%)`}}>
            <div style={{display:"inline-block",padding:"4px 14px",borderRadius:100,background:`${C.accent}22`,border:`1px solid ${C.accent}44`,fontSize:11,color:C.accent,letterSpacing:".08em",marginBottom:20}}>SMART GROCERY MANAGEMENT PLATFORM</div>
            <h1 style={{fontFamily:DF,fontSize:"clamp(28px,5vw,52px)",fontWeight:700,lineHeight:1.15,marginBottom:16,maxWidth:700,margin:"0 auto 16px",color:"#adacaf"}}>
              Automate your store.<br/><span style={{color:C.accent}}>One platform.</span> Every shelf.
            </h1>
            <p style={{fontSize:15,color:C.muted,maxWidth:520,margin:"0 auto 36px",lineHeight:1.7}}>
              Real-time inventory, digital price tags, supplier ordering, and multi-store analytics — all in one place.
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="bp" style={{padding:"12px 28px",fontSize:14}} onClick={()=>setMode("register")}>Start free trial</button>
              <button className="bg" style={{padding:"12px 28px",fontSize:14}} onClick={()=>setMode("login")}>Sign in →</button>
            </div>
          </div>

          {/* Features */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,padding:"0 32px 48px",maxWidth:1100,margin:"0 auto"}}>
            {[
              {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,title:"Digital Price Tags",desc:"Push price & shelf-life updates wirelessly to smart shelf tags across your store."},
              {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,title:"Inventory Control",desc:"Barcode scanning, expiry tracking, and low-stock alerts with one-click reorder."},
              {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,title:"Supplier Orders",desc:"Place, track, and receive orders from suppliers with full status visibility."},
              {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,title:"Analytics",desc:"Sales trends, stock health, and store comparisons across all your locations."},
              {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/></svg>,title:"Multi-Store",desc:"Manage every location from a single dashboard. Switch stores instantly."},
              {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>,title:"Role-Based Access",desc:"Separate portals for store managers, suppliers, and platform admins."},
            ].map(f=>(
              <div key={f.title} className="card" style={{padding:"20px 22px"}}>
                <div style={{fontSize:22,marginBottom:10,color:C.accent}}>{f.icon}</div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:6}}>{f.title}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Pricing section */}
          <div style={{padding:"60px 32px",background:C.surface}}>
            <div style={{maxWidth:1000,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:32}}>
                <div style={{fontSize:12,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>Simple, transparent pricing</div>
                <h2 style={{fontFamily:DF,fontSize:28,fontWeight:700,color:"#b3b2b8"}}>Choose your plan</h2>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
                {plans?.map((plan, idx)=>(
                  <div key={plan.id} className="card" style={{padding:24,border:idx===1?`2px solid ${plan.color}`:`1px solid ${C.border}`,position:"relative"}}>
                    {idx===1&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:plan.color,color:"#fff",padding:"3px 12px",borderRadius:100,fontSize:10,fontWeight:500}}>MOST POPULAR</div>}
                    <div style={{fontSize:16,fontWeight:500,marginBottom:4}}>{plan.name}</div>
                    <div style={{display:"flex",alignItems:"baseline",marginBottom:16}}>
                      <span style={{fontSize:36,fontWeight:700}}>${plan.monthly}</span>
                      <span style={{color:C.muted,fontSize:14,marginLeft:2}}>/month</span>
                    </div>
                    <div style={{background:`${C.accent}10`,border:`1px solid ${C.accent}33`,borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:12,textAlign:"center"}}>
                      <span style={{color:C.accent}}>Save 17%</span> when billed annually — ${plan.yearly}/year
                    </div>
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Features included:</div>
                      {plan.features.map(f=>(
                        <div key={f} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,fontSize:13}}>
                          <span style={{color:C.green}}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button className="bp" style={{width:"100%",background:idx===1?plan.color:C.accent}} onClick={()=>setMode("register")}>Get started</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demo login section */}
          <div style={{borderTop:`1px solid ${C.border}`,padding:"40px 32px",background:C.surface}}>
            <div style={{maxWidth:720,margin:"0 auto",textAlign:"center"}}>
              <div style={{fontSize:12,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>Try a demo account</div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                {DEMO.map(d=>(
                  <button key={d.role} onClick={()=>{setEmail(d.email);setPass(d.pass);setMode("login");}} style={{background:`${d.color}18`,border:`1px solid ${d.color}44`,color:d.color,padding:"10px 20px",borderRadius:8,fontSize:13,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:d.color,display:"inline-block"}}/>
                    {d.label} demo
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(mode==="login"||mode==="register")&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 16px"}}>
          <div style={{width:"100%",maxWidth:420}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <img src="/shelfos_logo.svg" alt="ShelfOS" style={{width:40,height:40,marginBottom:12}}/>
              <div style={{fontFamily:DF,fontSize:14,fontWeight:700,letterSpacing:".05em"}}>SHELF<span style={{color:C.accent}}>OS</span></div>
            </div>

            {mode==="login"&&(
              <div className="card" style={{padding:28}}>
                <div style={{fontSize:16,fontWeight:500,marginBottom:20}}>Welcome back</div>
                {err&&<div style={{background:`${C.red}15`,border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:14}}>{err}</div>}
                <form onSubmit={doLogin}>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:C.muted,marginBottom:5}}>Email address</div>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
                  </div>
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:11,color:C.muted,marginBottom:5}}>Password</div>
                    <input type="password" value={password} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required/>
                  </div>
                  <button type="submit" className="bp" style={{width:"100%",padding:"11px"}}>Sign in</button>
                </form>
                <div style={{textAlign:"center",marginTop:16,fontSize:12,color:C.muted}}>
                  No account? <button onClick={()=>{setMode("register");setErr("");}} style={{background:"none",border:"none",color:C.accent,fontSize:12,padding:0}}>Sign up</button>
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,marginTop:16,paddingTop:14}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8,textAlign:"center"}}>Quick demo access</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {DEMO.map(d=>(
                      <button key={d.role} onClick={()=>{setEmail(d.email);setPass(d.pass);}} style={{background:`${d.color}10`,border:`1px solid ${d.color}33`,color:d.color,padding:"7px 12px",borderRadius:7,fontSize:12,textAlign:"left",display:"flex",justifyContent:"space-between"}}>
                        <span>{d.label}</span><span style={{color:C.muted,fontSize:11}}>{d.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:"center",marginTop:14,fontSize:11,color:C.muted}}>
                  <button onClick={()=>{setMode("home");setErr("");}} style={{background:"none",border:"none",color:C.muted,fontSize:11}}>← Back to home</button>
                </div>
              </div>
            )}

            {mode==="register"&&(
              <div className="card" style={{padding:28}}>
                <div style={{fontSize:16,fontWeight:500,marginBottom:6}}>Create account</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Join ShelfOS — your account will be reviewed by our team.</div>
                {err&&<div style={{background:`${C.red}15`,border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:14}}>{err}</div>}
                {/* Role picker */}
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  {[["store",<><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14,marginRight:6}}><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/></svg>Store Manager</>],["supplier",<><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14,marginRight:6}}><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>Supplier</>]].map(([r,label])=>(
                    <button key={r} onClick={()=>setReg(f=>({...f,role:r}))} style={{flex:1,padding:"9px",borderRadius:8,border:`1px solid ${regForm.role===r?C.accent:C.border2}`,background:regForm.role===r?`${C.accent}18`:"none",color:regForm.role===r?C.accent:C.muted,fontSize:12,transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {label}
                    </button>
                  ))}
                </div>
                <form onSubmit={doRegister}>
                  {[["Full Name / Company","name","text",regForm.name],["Email Address","email","email",regForm.email]].map(([label,key,type,val])=>(
                    <div key={key} style={{marginBottom:11}}>
                      <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{label}</div>
                      <input type={type} value={val} onChange={e=>setReg(f=>({...f,[key]:e.target.value}))} placeholder={label}/>
                    </div>
                  ))}
                  {regForm.role==="store"&&(
                    <div style={{marginBottom:11}}>
                      <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Store City</div>
                      <input value={regForm.city} onChange={e=>setReg(f=>({...f,city:e.target.value}))} placeholder="e.g. Austin, TX"/>
                    </div>
                  )}
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Password</div>
                    <input type="password" value={regForm.password} onChange={e=>setReg(f=>({...f,password:e.target.value}))} placeholder="Min 6 characters"/>
                  </div>
                  <button type="submit" className="bp" style={{width:"100%",padding:"11px"}}>Create account</button>
                </form>
                <div style={{textAlign:"center",marginTop:14,fontSize:12,color:C.muted}}>
                  Already have an account? <button onClick={()=>{setMode("login");setErr("");}} style={{background:"none",border:"none",color:C.accent,fontSize:12,padding:0}}>Sign in</button>
                </div>
                <div style={{textAlign:"center",marginTop:10,fontSize:11,color:C.muted}}>
                  <button onClick={()=>{setMode("home");setErr("");}} style={{background:"none",border:"none",color:C.muted,fontSize:11}}>← Back to home</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ ADMIN USERS */
function AdminUsers({ users, stores, suppliers, allOrders, allProducts, approveUser, suspendUser, toast }){
  const [group,      setGroup]      = useState("stores");   // stores | suppliers | admins | pending
  const [searchQ,    setSearchQ]    = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showAddUser,setShowAddUser]= useState(false);

  const storeUsers    = users.filter(u => u.role === "store");
  const supplierUsers = users.filter(u => u.role === "supplier");
  const adminUsers    = users.filter(u => u.role === "admin");
  const pendingUsers  = users.filter(u => u.status === "pending");

  const GROUP_META = [
    { key:"stores",    label:"Store Managers", count:storeUsers.length,    color:C.accent, icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/></svg> },
    { key:"suppliers", label:"Suppliers",      count:supplierUsers.length, color:C.green,  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> },
    { key:"admins",    label:"Admins",         count:adminUsers.length,    color:C.pink,   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg> },
    { key:"pending",   label:"Pending Approval", count:pendingUsers.length,color:C.amber,  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  ];

  const currentList = {
    stores:    storeUsers,
    suppliers: supplierUsers,
    admins:    adminUsers,
    pending:   pendingUsers,
  }[group] || [];

  const filtered = currentList.filter(u =>
    u.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQ.toLowerCase())
  );

  function getLinkedEntity(u){
    if(u.storeId)    return stores.find(s => s.id === u.storeId);
    if(u.supplierId) return suppliers.find(s => s.id === u.supplierId);
    return null;
  }
  function getUserStats(u){
    if(u.role === "store"){
      const prods  = allProducts.filter(p => p.storeId === u.storeId);
      const orders = allOrders.filter(o => o.storeId === u.storeId);
      const active = orders.filter(o => !["delivered","cancelled"].includes(o.status)).length;
      return [
        { label:"Products",      val:prods.length   },
        { label:"Total Orders",  val:orders.length  },
        { label:"Active Orders", val:active         },
      ];
    }
    if(u.role === "supplier"){
      const orders    = allOrders.filter(o => o.supplierId === u.supplierId);
      const delivered = orders.filter(o => o.status === "delivered").length;
      const revenue   = orders.filter(o => o.status !== "cancelled").reduce((a,o)=>a+(o.total||0),0);
      return [
        { label:"Orders",    val:orders.length                },
        { label:"Delivered", val:delivered                    },
        { label:"Revenue",   val:`$${revenue.toFixed(0)}`     },
      ];
    }
    return [];
  }

  const gm = GROUP_META.find(g => g.key === group);

  return(
    <div>
      {/* Summary stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {GROUP_META.map(g => (
          <button key={g.key} onClick={()=>{ setGroup(g.key); setExpandedId(null); setSearchQ(""); }}
            style={{textAlign:"left",padding:"16px 18px",borderRadius:11,border:`1px solid ${group===g.key?g.color:C.border}`,background:group===g.key?`${g.color}12`:C.card,cursor:"pointer",transition:"all .2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:18}}>{g.icon}</span>
              {g.key==="pending"&&g.count>0&&(
                <span className="pill" style={{background:`${C.amber}22`,color:C.amber,fontSize:10}}>needs action</span>
              )}
            </div>
            <div style={{fontSize:26,fontWeight:500,color:group===g.key?g.color:C.text,marginBottom:3}}>{g.count}</div>
            <div style={{fontSize:11,color:group===g.key?g.color:C.muted,letterSpacing:".04em"}}>{g.label}</div>
          </button>
        ))}
      </div>

      {/* Group header + search + add */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{gm?.icon}</span>
          <span style={{fontSize:14,fontWeight:500,color:gm?.color}}>{gm?.label}</span>
          <span className="pill" style={{background:`${gm?.color}22`,color:gm?.color,fontSize:11}}>{filtered.length}</span>
        </div>
        <input
          placeholder={`Search ${gm?.label.toLowerCase()}…`}
          value={searchQ} onChange={e=>setSearchQ(e.target.value)}
          style={{width:230,marginLeft:"auto"}}
        />
        {group!=="admins"&&group!=="pending"&&(
          <button className="bp" style={{padding:"8px 14px",fontSize:12,background:gm?.color}} onClick={()=>setShowAddUser(group)}>
            + Add {gm?.label.slice(0,-1)}
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{textAlign:"center",padding:56,color:C.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>{gm?.icon}</div>
          <div style={{fontSize:13}}>{searchQ ? "No results match your search." : `No ${gm?.label.toLowerCase()} yet.`}</div>
        </div>
      )}

      {/* ── STORE MANAGERS group ── */}
      {group === "stores" && filtered.length > 0 && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(u => {
            const store  = getLinkedEntity(u);
            const stats  = getUserStats(u);
            const isOpen = expandedId === u.id;
            return (
              <div key={u.id} className="card" style={{overflow:"hidden",borderColor:isOpen?C.accent:C.border,transition:"border-color .2s"}}>
                {/* Row */}
                <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",cursor:"pointer"}} onClick={()=>setExpandedId(isOpen?null:u.id)}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${C.accent}22`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{u.name}</div>
                    <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                  </div>
                  {store && (
                    <div style={{textAlign:"center",padding:"4px 12px",borderRadius:8,background:`${C.accent}10`,border:`1px solid ${C.accent}22`}}>
                      <div style={{fontSize:11,fontWeight:500,color:C.accent}}>{store.name}</div>
                      <div style={{fontSize:10,color:C.muted}}>{store.city}</div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className="pill" style={{background:u.status==="active"?`${C.green}22`:u.status==="pending"?`${C.amber}22`:`${C.red}22`,color:u.status==="active"?C.green:u.status==="pending"?C.amber:C.red}}>{u.status}</span>
                    <span style={{color:C.muted,fontSize:12,transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(90deg)":"none"}}>›</span>
                  </div>
                </div>
                {/* Expanded detail */}
                {isOpen && (
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"16px 18px",background:C.surface}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                      {stats.map(s=>(
                        <div key={s.label} style={{padding:"10px 14px",background:C.card,borderRadius:9,border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:10,color:C.muted,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
                          <div style={{fontSize:20,fontWeight:500,color:C.accent}}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,fontSize:12}}>
                      {[["User ID",u.id],["Store ID",u.storeId||"—"],["Subscription",u.subscriptionId||"—"],["Joined","Recently"]].map(([k,v])=>(
                        <div key={k} style={{padding:"8px 12px",background:C.card,borderRadius:8,border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:10,color:C.muted,marginBottom:2}}>{k}</div>
                          <div style={{fontFamily:DF,fontSize:11,color:C.text}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {u.status==="pending"   && <button className="bp" style={{fontSize:12,padding:"7px 14px",background:C.green}}  onClick={()=>{approveUser(u.id);setExpandedId(null);}}>✓ Approve</button>}
                      {u.status==="active"    && <button className="bg" style={{fontSize:12,padding:"7px 14px",color:C.amber,borderColor:`${C.amber}44`}} onClick={()=>suspendUser(u.id)}>Suspend</button>}
                      {u.status==="suspended" && <button className="bp" style={{fontSize:12,padding:"7px 14px"}} onClick={()=>approveUser(u.id)}>Reactivate</button>}
                      <button className="bg" style={{fontSize:12,padding:"7px 14px",color:C.red,borderColor:`${C.red}33`}} onClick={()=>{ if(window.confirm?.("Remove this user?")) toast("User removed",C.red); }}>Remove</button>
                      <button className="bg" style={{fontSize:12,padding:"7px 14px",marginLeft:"auto"}} onClick={()=>setExpandedId(null)}>Collapse ↑</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SUPPLIERS group ── */}
      {group === "suppliers" && filtered.length > 0 && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(u => {
            const sup    = getLinkedEntity(u);
            const stats  = getUserStats(u);
            const isOpen = expandedId === u.id;
            return (
              <div key={u.id} className="card" style={{overflow:"hidden",borderColor:isOpen?C.green:C.border,transition:"border-color .2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",cursor:"pointer"}} onClick={()=>setExpandedId(isOpen?null:u.id)}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${C.green}22`,border:`1px solid ${C.green}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{u.name}</div>
                    <div style={{fontSize:11,color:C.muted}}>{u.email}</div>
                  </div>
                  {sup && (
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:200}}>
                      {sup.categories.map(cat=>(
                        <span key={cat} className="pill" style={{background:"#1e1e2e",color:"#888",fontSize:10}}>{cat}</span>
                      ))}
                    </div>
                  )}
                  {sup && (
                    <div style={{textAlign:"center",minWidth:60}}>
                      <div style={{fontSize:13,color:C.amber}}>{"★".repeat(Math.round(sup.rating||0))}</div>
                      <div style={{fontSize:10,color:C.muted}}>{sup.rating}</div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className="pill" style={{background:u.status==="active"?`${C.green}22`:u.status==="pending"?`${C.amber}22`:`${C.red}22`,color:u.status==="active"?C.green:u.status==="pending"?C.amber:C.red}}>{u.status}</span>
                    <span style={{color:C.muted,fontSize:12,display:"inline-block",transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"16px 18px",background:C.surface}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                      {stats.map(s=>(
                        <div key={s.label} style={{padding:"10px 14px",background:C.card,borderRadius:9,border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:10,color:C.muted,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
                          <div style={{fontSize:20,fontWeight:500,color:C.green}}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    {sup && (
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,fontSize:12}}>
                        {[["Contact",sup.contact],["Phone",sup.phone||"—"],["Lead Time",`${sup.leadDays} days`],["Supplier ID",sup.id]].map(([k,v])=>(
                          <div key={k} style={{padding:"8px 12px",background:C.card,borderRadius:8,border:`1px solid ${C.border}`}}>
                            <div style={{fontSize:10,color:C.muted,marginBottom:2}}>{k}</div>
                            <div style={{fontSize:11,color:C.text}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {u.status==="pending"   && <button className="bp" style={{fontSize:12,padding:"7px 14px",background:C.green}}  onClick={()=>{approveUser(u.id);setExpandedId(null);}}>✓ Approve</button>}
                      {u.status==="active"    && <button className="bg" style={{fontSize:12,padding:"7px 14px",color:C.amber,borderColor:`${C.amber}44`}} onClick={()=>suspendUser(u.id)}>Suspend</button>}
                      {u.status==="suspended" && <button className="bp" style={{fontSize:12,padding:"7px 14px"}} onClick={()=>approveUser(u.id)}>Reactivate</button>}
                      <button className="bg" style={{fontSize:12,padding:"7px 14px",color:C.red,borderColor:`${C.red}33`}} onClick={()=>{ toast("Supplier removed",C.red); }}>Remove</button>
                      <button className="bg" style={{fontSize:12,padding:"7px 14px",marginLeft:"auto"}} onClick={()=>setExpandedId(null)}>Collapse ↑</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADMINS group ── */}
      {group === "admins" && filtered.length > 0 && (
        <div className="card" style={{overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead style={{background:"#0a0014"}}>
              <tr><th>Name</th><th>Email</th><th>Status</th><th>Note</th></tr>
            </thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id} className="trow" style={{background:"transparent"}}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:28,height:28,borderRadius:7,background:`${C.pink}22`,border:`1px solid ${C.pink}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{u.name.charAt(0)}</div>
                      <span style={{fontWeight:500}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{color:C.muted,fontSize:12}}>{u.email}</td>
                  <td><span className="pill" style={{background:`${C.green}22`,color:C.green}}>{u.status}</span></td>
                  <td style={{fontSize:11,color:C.muted}}>Platform administrator — full access</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PENDING group ── */}
      {group === "pending" && (
        <div>
          {filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:56,color:C.muted}}>
              <div style={{fontSize:28,marginBottom:8}}>✓</div>
              <div style={{fontSize:13}}>No pending approvals — all caught up!</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.map(u => (
                <div key={u.id} className="card" style={{padding:"16px 20px",borderLeft:`3px solid ${C.amber}`,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${C.amber}18`,border:`1px solid ${C.amber}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{u.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:3}}>{u.email}</div>
                    <span className="pill" style={{background:u.role==="supplier"?`${C.green}22`:`${C.accent}22`,color:u.role==="supplier"?C.green:C.accent,fontSize:10}}>
                      {u.role === "supplier" ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12,marginRight:4}}><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>Supplier</> : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12,marginRight:4}}><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/></svg>Store Manager</>}
                    </span>
                  </div>
                  {u.city && <div style={{fontSize:12,color:C.muted}}>📍 {u.city}</div>}
                  <div style={{display:"flex",gap:7}}>
                    <button className="bp" style={{fontSize:12,padding:"7px 14px",background:C.green}} onClick={()=>approveUser(u.id)}>✓ Approve</button>
                    <button className="bg"  style={{fontSize:12,padding:"7px 14px",color:C.red,borderColor:`${C.red}44`}} onClick={()=>suspendUser(u.id)}>✗ Deny</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add User modal stub */}
      {showAddUser && (
        <div className="modal-bg" onClick={()=>setShowAddUser(false)}>
          <div className="modal" style={{width:420}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:16}}>
              Add {showAddUser === "stores" ? "Store Manager" : "Supplier"}
            </div>
            <div style={{fontSize:12,color:C.muted,marginBottom:20,lineHeight:1.6}}>
              New users will receive an invitation email and must set their own password.<br/>
              Their account will be <span style={{color:C.amber}}>pending</span> until confirmed.
            </div>
            {[["Full Name / Company","text"],["Email Address","email"],showAddUser==="stores"?["Store Name","text"]:["Product Categories","text"]].map(([label,type])=>(
              <div key={label} style={{marginBottom:12}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{label}</div>
                <input type={type} placeholder={label}/>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}}>
              <button className="bg" onClick={()=>setShowAddUser(false)}>Cancel</button>
              <button className="bp" style={{background:showAddUser==="stores"?C.accent:C.green}} onClick={()=>{toast(`Invitation sent`);setShowAddUser(false);}}>Send Invitation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ ADMIN PANEL */
function AdminPanel({session,users,setUsers,stores,suppliers,allProducts,allOrders,subscriptions,plans,toast,logout,cancelSubscription}){
  const [tab, setTab] = useState("overview");
  const TABS = ["overview","users","stores","suppliers","orders","subscriptions","settings"];

  const pendingUsers = users.filter(u=>u.status==="pending");
  const totalRevenue = stores.reduce((a,s)=>a+s.revenue,0);
  const activeSubscriptions = subscriptions.filter(s=>s.status==="active");
  const monthlyRevenue = activeSubscriptions.reduce((a,s)=>a+(s.billingCycle==="monthly"?s.amount:s.amount/12),0);

  function approveUser(id){ setUsers(u=>u.map(x=>x.id===id?{...x,status:"active"}:x)); toast("User approved"); }
  function suspendUser(id){ setUsers(u=>u.map(x=>x.id===id?{...x,status:"suspended"}:x)); toast("User suspended",C.amber); }

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Admin Header */}
      <div style={{background:"#0a0014",borderBottom:`1px solid ${C.pink}33`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/shelfos_logo.svg" alt="ShelfOS" style={{width:26,height:26}}/>
          <span style={{fontFamily:DF,fontSize:12,fontWeight:700,letterSpacing:".05em"}}>SHELF<span style={{color:C.pink}}>OS</span> <span style={{color:C.muted,fontSize:10,fontWeight:400}}>ADMIN</span></span>
          <span style={{padding:"2px 8px",borderRadius:100,background:`${C.pink}22`,color:C.pink,fontSize:10,border:`1px solid ${C.pink}44`}}>ADMIN CONSOLE</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {pendingUsers.length>0&&<span className="pill" style={{background:`${C.amber}22`,color:C.amber,border:`1px solid ${C.amber}44`}}>{pendingUsers.length} pending approvals</span>}
          <span style={{fontSize:12,color:C.muted}}>{session.user.name}</span>
          <button className="bg" style={{fontSize:11,padding:"6px 12px"}} onClick={logout}>Sign out</button>
        </div>
      </div>
      <div className="tab-bar">
        {TABS.map(t=><button key={t} className={`nb${tab===t?" act":""}`} onClick={()=>setTab(t)} style={{...(tab===t?{color:C.pink,borderBottomColor:C.pink}:{})}}>{t}{t==="users"&&pendingUsers.length>0?` (${pendingUsers.length})`:""}</button>)}
      </div>
      <div style={{flex:1,padding:"20px",maxWidth:1300,margin:"0 auto",width:"100%"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[
                {label:"Total Stores",val:stores.length,color:C.pink},
                {label:"Suppliers",val:suppliers.length,color:C.accent},
                {label:"Total Users",val:users.length,color:C.green},
                {label:"Platform Revenue",val:`$${totalRevenue.toLocaleString()}`,color:C.amber},
              ].map(s=>(
                <div key={s.label} className="sc">
                  <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:7}}>{s.label}</div>
                  <div style={{fontSize:28,fontWeight:500,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Pending Approvals</div>
                {pendingUsers.length===0
                  ?<div style={{color:C.muted,fontSize:13,padding:"16px 0"}}>No pending approvals.</div>
                  :pendingUsers.map(u=>(
                    <div key={u.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                      <div>
                        <div style={{fontSize:13}}>{u.name}</div>
                        <div style={{fontSize:11,color:C.muted}}>{u.email} · {u.role}</div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="bp" style={{padding:"5px 10px",fontSize:11,background:C.green}} onClick={()=>approveUser(u.id)}>Approve</button>
                        <button className="bg" style={{padding:"5px 10px",fontSize:11,color:C.red,borderColor:C.red+"44"}} onClick={()=>suspendUser(u.id)}>Deny</button>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Store Performance</div>
                {stores.map(s=>{
                  const rev=s.revenue; const max=Math.max(...stores.map(x=>x.revenue));
                  return(
                    <div key={s.id} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                        <span>{s.name}</span><span style={{color:C.green}}>${rev.toLocaleString()}</span>
                      </div>
                      <div className="btrack"><div className="bfill" style={{width:`${(rev/max)*100}%`,background:C.pink}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab==="users"&&(
          <AdminUsers
            users={users}
            stores={stores}
            suppliers={suppliers}
            allOrders={allOrders}
            allProducts={allProducts}
            approveUser={approveUser}
            suspendUser={suspendUser}
            toast={toast}
          />
        )}

        {/* STORES */}
        {tab==="stores"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14}}>Store Management</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
              {stores.map(s=>{
                const prods=allProducts.filter(p=>p.storeId===s.id);
                const orders=allOrders.filter(o=>o.storeId===s.id);
                return(
                  <div key={s.id} className="card" style={{padding:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                      <div style={{fontSize:14,fontWeight:500}}>{s.name}</div>
                      <span className="pill" style={{background:`${C.green}22`,color:C.green}}>active</span>
                    </div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{s.city} · {s.manager}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:12}}>
                      <div className="sc" style={{padding:"10px 12px"}}><div style={{color:C.muted,fontSize:10}}>PRODUCTS</div><div style={{fontSize:18,fontWeight:500,marginTop:3}}>{prods.length}</div></div>
                      <div className="sc" style={{padding:"10px 12px"}}><div style={{color:C.muted,fontSize:10}}>ORDERS</div><div style={{fontSize:18,fontWeight:500,marginTop:3}}>{orders.length}</div></div>
                      <div className="sc" style={{padding:"10px 12px",gridColumn:"1/-1"}}><div style={{color:C.muted,fontSize:10}}>WEEKLY REVENUE</div><div style={{fontSize:18,fontWeight:500,color:C.green,marginTop:3}}>${s.revenue.toLocaleString()}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUPPLIERS */}
        {tab==="suppliers"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14}}>Supplier Management</div>
            <div className="card" style={{overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead style={{background:"#0a0014"}}><tr><th>Supplier</th><th>Contact</th><th>Categories</th><th>Lead Time</th><th>Rating</th><th>Status</th></tr></thead>
                <tbody>
                  {suppliers.map(s=>(
                    <tr key={s.id} className="trow" style={{background:"transparent"}}>
                      <td style={{fontWeight:500}}>{s.name}</td>
                      <td style={{color:C.muted,fontSize:12}}>{s.contact}</td>
                      <td>{s.categories.map(c=><span key={c} className="pill" style={{background:"#1e1e2e",color:"#888",marginRight:4}}>{c}</span>)}</td>
                      <td style={{color:C.muted}}>{s.leadDays}d</td>
                      <td style={{color:C.amber}}>{"★".repeat(Math.round(s.rating))} <span style={{color:C.muted}}>{s.rating}</span></td>
                      <td><span className="pill" style={{background:`${C.green}22`,color:C.green}}>active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALL ORDERS */}
        {tab==="orders"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14}}>All Orders — Platform-wide</div>
            <div className="card" style={{overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
                <thead style={{background:"#0a0014"}}><tr><th>Order ID</th><th>Store</th><th>Supplier</th><th>Items</th><th>Total</th><th>Priority</th><th>Status</th><th>ETA</th></tr></thead>
                <tbody>
                  {allOrders.map(o=>(
                    <tr key={o.id} className="trow" style={{background:"transparent"}}>
                      <td><span style={{fontFamily:DF,fontSize:11,color:C.muted}}>{o.id}</span></td>
                      <td style={{fontSize:12}}>{stores.find(s=>s.id===o.storeId)?.name||o.storeId}</td>
                      <td style={{fontSize:12,color:C.muted}}>{o.supplierName}</td>
                      <td style={{fontSize:12,color:C.muted}}>{o.items?.length} items</td>
                      <td style={{fontWeight:500}}>${o.total?.toFixed(2)}</td>
                      <td><span className="pill" style={{background:`${PRIORITY_COLOR[o.priority]||C.muted}22`,color:PRIORITY_COLOR[o.priority]||C.muted}}>{o.priority||"normal"}</span></td>
                      <td><span className="pill" style={{background:`${ORDER_STATUS_COLOR[o.status]}22`,color:ORDER_STATUS_COLOR[o.status]}}>{o.status}</span></td>
                      <td style={{fontSize:12,color:C.muted}}>{o.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab==="subscriptions"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14}}>Subscription Management</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[
                {label:"Active Subscriptions",val:activeSubscriptions.length,color:C.green},
                {label:"Monthly Revenue",val:`$${monthlyRevenue.toFixed(2)}`,color:C.amber},
                {label:"Total Subscriptions",val:subscriptions.length,color:C.accent},
              ].map(s=>(
                <div key={s.label} className="sc">
                  <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6}}>{s.label}</div>
                  <div style={{fontSize:24,fontWeight:500,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead style={{background:"#0a0014"}}>
                  <tr><th>ID</th><th>User</th><th>Plan</th><th>Billing Cycle</th><th>Amount</th><th>Payment Method</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub=>{
                    const user=users.find(u=>u.id===sub.userId);
                    const plan=plans?.find(p=>p.id===sub.planId);
                    return(
                      <tr key={sub.id} className="trow" style={{background:"transparent"}}>
                        <td><span style={{fontFamily:DF,fontSize:11,color:C.muted}}>{sub.id}</span></td>
                        <td>{user?.name||"Unknown"}</td>
                        <td><span className="pill" style={{background:`${plan?.color||C.accent}22`,color:plan?.color||C.accent}}>{plan?.name||sub.planId}</span></td>
                        <td style={{textTransform:"capitalize"}}>{sub.billingCycle}</td>
                        <td style={{fontWeight:500}}>${sub.amount}</td>
                        <td style={{fontSize:11,color:C.muted}}>{sub.paymentMethod}</td>
                        <td><span className="pill" style={{background:sub.status==="active"?`${C.green}22`:`${C.red}22`,color:sub.status==="active"?C.green:C.red}}>{sub.status}</span></td>
                        <td>
                          {sub.status==="active"&&<button className="bg" style={{padding:"4px 9px",fontSize:11,color:C.red,borderColor:`${C.red}44`}} onClick={()=>cancelSubscription(sub.id)}>Cancel</button>}
                          {sub.status==="cancelled"&&<span style={{fontSize:11,color:C.muted}}>Cancelled</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab==="settings"&&(
          <div style={{maxWidth:500}}>
            <div style={{fontSize:14,marginBottom:20}}>Platform Settings</div>
            {[["Platform Name","ShelfOS"],["Support Email","support@shelfos.com"],["Default Lead Time (days)","2"],["Min Password Length","8"]].map(([label,val])=>(
              <div key={label} style={{marginBottom:14}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{label}</div>
                <input defaultValue={val}/>
              </div>
            ))}
            <button className="bp" style={{marginTop:8}} onClick={()=>toast("Settings saved")}>Save settings</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ SUPPLIER CATALOG SEED */
const CATALOG_SEED = [
  { id:"cat-1", supplierId:"sup1", name:"Organic Whole Milk",     category:"Dairy",    sku:"SUP1-DAI-001", barcode:"012345678901", unitPrice:2.10, packSize:"1 gallon",  minOrderQty:10, maxOrderQty:500, leadDays:2, expiryDays:7,   description:"Farm-fresh certified organic whole milk.",   status:"active",  stock:340, images:["🥛"] },
  { id:"cat-2", supplierId:"sup1", name:"Greek Yogurt Plain",     category:"Dairy",    sku:"SUP1-DAI-012", barcode:"555666777888", unitPrice:2.80, packSize:"32oz",      minOrderQty:6,  maxOrderQty:200, leadDays:2, expiryDays:14,  description:"Full-fat authentic Greek strained yogurt.",  status:"active",  stock:180, images:["🫙"] },
  { id:"cat-3", supplierId:"sup1", name:"Free Range Eggs",        category:"Dairy",    sku:"SUP1-DAI-005", barcode:"210987654321", unitPrice:4.20, packSize:"12ct",      minOrderQty:12, maxOrderQty:300, leadDays:2, expiryDays:21,  description:"Cage-free brown eggs from local farms.",     status:"active",  stock:95,  images:["🥚"] },
  { id:"cat-4", supplierId:"sup1", name:"Roma Tomatoes",          category:"Produce",  sku:"SUP1-PRO-041", barcode:"444333222111", unitPrice:1.10, packSize:"per lb",    minOrderQty:20, maxOrderQty:1000,leadDays:1, expiryDays:5,   description:"Firm plum tomatoes, ideal for cooking.",     status:"active",  stock:620, images:["🍅"] },
  { id:"cat-5", supplierId:"sup1", name:"Baby Spinach",           category:"Produce",  sku:"SUP1-PRO-055", barcode:"321321321321", unitPrice:1.80, packSize:"5oz bag",   minOrderQty:10, maxOrderQty:400, leadDays:1, expiryDays:6,   description:"Pre-washed baby spinach leaves.",            status:"active",  stock:210, images:["🥬"] },
  { id:"cat-6", supplierId:"sup2", name:"Atlantic Salmon Fillet", category:"Seafood",  sku:"SUP2-SEA-023", barcode:"111222333444", unitPrice:8.50, packSize:"per lb",    minOrderQty:5,  maxOrderQty:200, leadDays:1, expiryDays:2,   description:"Fresh Atlantic salmon, skin-on fillet.",     status:"active",  stock:80,  images:["🐟"] },
  { id:"cat-7", supplierId:"sup2", name:"Chicken Breast",         category:"Poultry",  sku:"SUP2-POU-031", barcode:"222333444555", unitPrice:4.20, packSize:"per lb",    minOrderQty:10, maxOrderQty:500, leadDays:1, expiryDays:3,   description:"Boneless skinless chicken breast, fresh.",   status:"active",  stock:240, images:["🍗"] },
  { id:"cat-8", supplierId:"sup2", name:"Ground Beef 80/20",      category:"Meat",     sku:"SUP2-MEA-044", barcode:"333444555666", unitPrice:5.10, packSize:"per lb",    minOrderQty:10, maxOrderQty:400, leadDays:1, expiryDays:3,   description:"80/20 lean-to-fat ground beef blend.",       status:"active",  stock:160, images:["🥩"] },
  { id:"cat-9", supplierId:"sup3", name:"Sourdough Bread",        category:"Bakery",   sku:"SUP3-BAK-007", barcode:"098765432109", unitPrice:3.80, packSize:"800g loaf", minOrderQty:5,  maxOrderQty:100, leadDays:1, expiryDays:4,   description:"Traditional long-ferment artisan sourdough.",status:"active",  stock:55,  images:["🍞"] },
  { id:"cat-10",supplierId:"sup3", name:"Croissants 6pk",         category:"Bakery",   sku:"SUP3-BAK-015", barcode:"109876543210", unitPrice:4.50, packSize:"6 pack",    minOrderQty:4,  maxOrderQty:80,  leadDays:1, expiryDays:2,   description:"Buttery all-butter French croissants.",      status:"active",  stock:40,  images:["🥐"] },
  { id:"cat-11",supplierId:"sup3", name:"Potato Chips Original",  category:"Snacks",   sku:"SUP3-SNA-001", barcode:"111111111111", unitPrice:2.90, packSize:"8oz bag",   minOrderQty:12, maxOrderQty:300, leadDays:1, expiryDays:60,  description:"Crunchy kettle-cooked potato chips.",        status:"active",  stock:320, images:["🍿"] },
  { id:"cat-12",supplierId:"sup4", name:"Orange Juice",           category:"Beverages",sku:"SUP4-BEV-019", barcode:"888777666555", unitPrice:2.40, packSize:"64oz",      minOrderQty:8,  maxOrderQty:300, leadDays:3, expiryDays:10,  description:"100% fresh-squeezed orange juice.",          status:"active",  stock:175, images:["🍊"] },
  { id:"cat-13",supplierId:"sup4", name:"Frozen Peas",            category:"Frozen",   sku:"SUP4-FRZ-003", barcode:"123456789012", unitPrice:1.50, packSize:"16oz",      minOrderQty:12, maxOrderQty:600, leadDays:3, expiryDays:365, description:"Flash-frozen sweet garden peas.",            status:"active",  stock:430, images:["🫛"] },
  { id:"cat-14",supplierId:"sup4", name:"Sparkling Water 12pk",   category:"Beverages",sku:"SUP4-BEV-033", barcode:"456456456456", unitPrice:5.20, packSize:"12 cans",   minOrderQty:4,  maxOrderQty:200, leadDays:3, expiryDays:365, description:"Lightly sparkling natural mineral water.",   status:"active",  stock:290, images:["💧"] },
  { id:"cat-15",supplierId:"sup4", name:"Craft IPA 6pk",          category:"Alcohol",  sku:"SUP4-ALC-001", barcode:"777777777777", unitPrice:9.90, packSize:"6 bottles", minOrderQty:2,  maxOrderQty:100, leadDays:3, expiryDays:365, description:"Hoppy India Pale Ale, 12oz bottles.",        status:"active",  stock:150, images:["🍺"] },
  { id:"cat-16",supplierId:"sup5", name:"Extra Virgin Olive Oil", category:"Condiments",sku:"SUP5-CON-007", barcode:"789789789789", unitPrice:6.80, packSize:"500ml",     minOrderQty:6,  maxOrderQty:200, leadDays:4, expiryDays:730, description:"Cold-pressed first extraction EVOO.",        status:"active",  stock:120, images:["🫒"] },
  { id:"cat-17",supplierId:"sup5", name:"Jasmine Rice 5lb",       category:"Dry Goods",sku:"SUP5-DRY-021", barcode:"654654654654", unitPrice:3.90, packSize:"5lb bag",   minOrderQty:6,  maxOrderQty:400, leadDays:4, expiryDays:365, description:"Fragrant long-grain jasmine rice.",          status:"active",  stock:310, images:["🌾"] },
  { id:"cat-18",supplierId:"sup5", name:"Canned Tomatoes",        category:"Canned Goods",sku:"SUP5-CAN-001", barcode:"222222222222", unitPrice:1.10, packSize:"14.5oz",   minOrderQty:24, maxOrderQty:600, leadDays:4, expiryDays:730, description:"San Marzano style diced tomatoes.",          status:"active",  stock:520, images:["🍅"] },
  { id:"cat-19",supplierId:"sup1", name:"Cheddar Cheese Block",   category:"Dairy",    sku:"SUP1-DAI-022", barcode:"987987987987", unitPrice:3.50, packSize:"8oz block", minOrderQty:8,  maxOrderQty:250, leadDays:2, expiryDays:60,  description:"Sharp aged cheddar, natural rind.",          status:"draft",   stock:200, images:["🧀"] },
  { id:"cat-20",supplierId:"sup1", name:"Sunflower Bouquet",      category:"Floral",   sku:"SUP1-FLO-001", barcode:"333333333333", unitPrice:12.90, packSize:"bouquet",   minOrderQty:3,  maxOrderQty:50,  leadDays:2, expiryDays:7,   description:"Fresh mixed sunflower bouquet.",             status:"active",  stock:25,  images:["🌻"] },
  { id:"cat-21",supplierId:"sup6", name:"Paper Towels 6pk",       category:"Paper Goods",sku:"SUP6-PAP-001", barcode:"444444444444", unitPrice:8.90, packSize:"6 rolls",   minOrderQty:4,  maxOrderQty:200, leadDays:2, expiryDays:3650, description:"Ultra-strong paper towel rolls.",            status:"active",  stock:280, images:["🧻"] },
  { id:"cat-22",supplierId:"sup6", name:"Multi-Surface Cleaner",  category:"Cleaning Supplies",sku:"SUP6-CLE-001", barcode:"555555555555", unitPrice:3.90, packSize:"32oz",      minOrderQty:8,  maxOrderQty:300, leadDays:2, expiryDays:3650, description:"All-purpose household cleaner.",             status:"active",  stock:190, images:["🧴"] },
  { id:"cat-23",supplierId:"sup6", name:"Shampoo & Conditioner",  category:"Health & Beauty",sku:"SUP6-HB-001", barcode:"666666666666", unitPrice:7.90, packSize:"16oz duo",  minOrderQty:6,  maxOrderQty:150, leadDays:2, expiryDays:1095, description:"Hydrating shampoo and conditioner set.",     status:"active",  stock:140, images:["💆"] },
  { id:"cat-24",supplierId:"sup6", name:"Light Bulbs 4pk",       category:"Household",sku:"SUP6-HOU-001", barcode:"777777777777", unitPrice:5.90, packSize:"4 bulbs",    minOrderQty:5,  maxOrderQty:100, leadDays:2, expiryDays:3650, description:"LED soft white light bulbs.",                status:"active",  stock:95,  images:["💡"] },
  { id:"cat-25",supplierId:"sup7", name:"Baby Diapers Size 3",    category:"Baby",     sku:"SUP7-BAB-001", barcode:"888888888888", unitPrice:24.90, packSize:"100 count", minOrderQty:2,  maxOrderQty:80,  leadDays:3, expiryDays:1095, description:"Ultra-absorbent baby diapers.",              status:"active",  stock:85,  images:["👶"] },
  { id:"cat-26",supplierId:"sup7", name:"Premium Dog Food",       category:"Pet Care", sku:"SUP7-PET-001", barcode:"999999999999", unitPrice:19.90, packSize:"15lb bag",  minOrderQty:4,  maxOrderQty:120, leadDays:3, expiryDays:548, description:"Nutritious dog food for adult dogs.",         status:"active",  stock:110, images:["🐕"] },
  { id:"cat-27",supplierId:"sup7", name:"Gummy Bears",            category:"Candy",    sku:"SUP7-CAN-001", barcode:"101010101010", unitPrice:2.50, packSize:"5oz bag",   minOrderQty:12, maxOrderQty:400, leadDays:3, expiryDays:365, description:"Assorted fruit gummy bears.",                 status:"active",  stock:420, images:["🍬"] },
  { id:"cat-28",supplierId:"sup8", name:"Cigarettes Pack",        category:"Tobacco",  sku:"SUP8-TOB-001", barcode:"121212121212", unitPrice:8.90, packSize:"pack",      minOrderQty:10, maxOrderQty:200, leadDays:5, expiryDays:3650, description:"Premium cigarette pack (ID required).",      status:"active",  stock:180, images:["🚬"] },
];

/* ═══════════════════════════════════════════════════════════ SUPPLIER PORTAL */
function SupplierPortal({session,stores,allOrders,setAllOrders,catalog,setCatalog,toast,logout}){
  const [tab, setTab] = useState("orders");
  const mySupplier = session.user.supplierId;
  const myOrders   = allOrders.filter(o=>o.supplierId===mySupplier);
  const [showCourierModal, setShowCourierModal] = useState(null);
  const [courierDetails, setCourierDetails] = useState({
    name: "",
    phone: "",
    company: "",
    trackingNumber: "",
    estimatedDelivery: ""
  });

  function updateOrderStatus(id,status){
    setAllOrders(o=>o.map(x=>x.id===id?{...x,status}:x));
    toast(`Order ${id.slice(-4)} marked as ${status}`);
  }

  function saveCourierDetails(orderId){
    setAllOrders(o=>o.map(x=>x.id===orderId?{...x,courier:courierDetails,status:"in-transit"}:x));
    toast("Courier details saved and order marked as dispatched");
    setShowCourierModal(null);
    setCourierDetails({name:"",phone:"",company:"",trackingNumber:"",estimatedDelivery:""});
  }

  const pending   = myOrders.filter(o=>o.status==="pending").length;
  const inTransit = myOrders.filter(o=>o.status==="in-transit").length;
  const delivered = myOrders.filter(o=>o.status==="delivered").length;
  const revenue   = myOrders.filter(o=>o.status!=="cancelled").reduce((a,o)=>a+(o.total||0),0);

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#00100a",borderBottom:`1px solid ${C.green}33`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/shelfos_logo.svg" alt="ShelfOS" style={{width:26,height:26}}/>
          <span style={{fontFamily:DF,fontSize:12,fontWeight:700}}>SHELF<span style={{color:C.green}}>OS</span></span>
          <span style={{padding:"2px 8px",borderRadius:100,background:`${C.green}22`,color:C.green,fontSize:10}}>SUPPLIER PORTAL</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,color:C.muted}}>{session.user.name}</span>
          <button className="bg" style={{fontSize:11,padding:"6px 12px"}} onClick={logout}>Sign out</button>
        </div>
      </div>
      <div className="tab-bar">
        {["orders","products","analytics"].map(t=><button key={t} className={`nb${tab===t?" act":""}`} onClick={()=>setTab(t)} style={tab===t?{color:C.green,borderBottomColor:C.green}:{}}>{t}{t==="orders"&&pending>0?` (${pending})`:""}</button>)}
      </div>
      <div style={{flex:1,padding:"20px",maxWidth:1100,margin:"0 auto",width:"100%"}}>

        {/* stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[{label:"New Orders",val:pending,color:C.amber},{label:"In Transit",val:inTransit,color:C.accent},{label:"Delivered",val:delivered,color:C.green},{label:"Total Revenue",val:`$${revenue.toFixed(0)}`,color:C.green}].map(s=>(
            <div key={s.label} className="sc"><div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6}}>{s.label}</div><div style={{fontSize:26,fontWeight:500,color:s.color}}>{s.val}</div></div>
          ))}
        </div>

        {tab==="orders"&&(
          <div>
            {myOrders.length===0?<div style={{textAlign:"center",padding:60,color:C.muted}}>No orders yet.</div>:
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {myOrders.map(o=>{
                  const store=stores.find(s=>s.id===o.storeId);
                  const step=ORDER_STATUSES.indexOf(o.status);
                  return(
                    <div key={o.id} className="card" style={{padding:20,borderLeft:`3px solid ${ORDER_STATUS_COLOR[o.status]}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                            <span style={{fontFamily:DF,fontSize:12,color:C.muted}}>{o.id}</span>
                            <span className="pill" style={{background:`${ORDER_STATUS_COLOR[o.status]}22`,color:ORDER_STATUS_COLOR[o.status]}}>{o.status}</span>
                            <span className="pill" style={{background:`${PRIORITY_COLOR[o.priority]||C.muted}22`,color:PRIORITY_COLOR[o.priority]||C.muted}}>{o.priority||"normal"}</span>
                          </div>
                          <div style={{fontSize:13,fontWeight:500}}>{store?.name} <span style={{color:C.muted,fontWeight:400}}>— {store?.city}</span></div>
                          {o.notes&&<div style={{fontSize:12,color:C.amber,marginTop:3}}>📝 {o.notes}</div>}
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:18,fontWeight:500,color:C.green}}>${o.total?.toFixed(2)}</div>
                          <div style={{fontSize:11,color:C.muted}}>ETA: {o.eta}</div>
                        </div>
                      </div>
                      {/* items */}
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                        {o.items?.map((item,i)=>(
                          <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 12px",fontSize:12}}>
                            <span style={{fontWeight:500}}>{item.name}</span> <span style={{color:C.muted}}>×{item.qty} @ ${parseFloat(item.unitPrice||0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Order timeline */}
                      <OrderTimeline status={o.status}/>
                      {/* Courier info */}
                      {o.courier&&(
                        <div style={{marginTop:12,padding:12,background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Courier Details</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:12}}>
                            <div><span style={{color:C.muted}}>Name:</span> {o.courier.name}</div>
                            <div><span style={{color:C.muted}}>Phone:</span> {o.courier.phone}</div>
                            <div><span style={{color:C.muted}}>Company:</span> {o.courier.company}</div>
                            <div><span style={{color:C.muted}}>Tracking:</span> {o.courier.trackingNumber}</div>
                          </div>
                          {o.courier.estimatedDelivery&&(
                            <div style={{marginTop:8,padding:8,background:`${C.accent}11`,borderRadius:6}}>
                              <span style={{color:C.accent,fontSize:12}}>📦 Estimated Delivery: {o.courier.estimatedDelivery}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {/* actions */}
                      {o.status!=="delivered"&&o.status!=="cancelled"&&(
                        <div style={{display:"flex",gap:7,marginTop:14,flexWrap:"wrap"}}>
                          {o.status==="pending"&&<button className="bp" style={{padding:"6px 14px",fontSize:12,background:C.green}} onClick={()=>updateOrderStatus(o.id,"confirmed")}>Confirm Order</button>}
                          {o.status==="confirmed"&&<button className="bp" style={{padding:"6px 14px",fontSize:12}} onClick={()=>updateOrderStatus(o.id,"processing")}>Start Processing</button>}
                          {o.status==="processing"&&<button className="bp" style={{padding:"6px 14px",fontSize:12,background:C.amber}} onClick={()=>setShowCourierModal(o.id)}>Add Courier & Dispatch</button>}
                          {o.status==="in-transit"&&<button className="bp" style={{padding:"6px 14px",fontSize:12,background:C.green}} onClick={()=>updateOrderStatus(o.id,"delivered")}>Mark Delivered</button>}
                          {o.status==="pending"&&<button className="bg" style={{padding:"6px 14px",fontSize:12,color:C.red,borderColor:`${C.red}44`}} onClick={()=>updateOrderStatus(o.id,"cancelled")}>Cancel</button>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* Courier Details Modal */}
        {showCourierModal&&(
          <div className="modal-bg" onClick={()=>setShowCourierModal(null)}>
            <div className="modal" style={{width:480}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:16,fontWeight:500,marginBottom:16}}>Add Courier Details</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input
                  placeholder="Courier Name"
                  value={courierDetails.name}
                  onChange={e=>setCourierDetails({...courierDetails,name:e.target.value})}
                  style={{width:"100%"}}
                />
                <input
                  placeholder="Courier Phone Number"
                  value={courierDetails.phone}
                  onChange={e=>setCourierDetails({...courierDetails,phone:e.target.value})}
                  style={{width:"100%"}}
                />
                <input
                  placeholder="Courier Company"
                  value={courierDetails.company}
                  onChange={e=>setCourierDetails({...courierDetails,company:e.target.value})}
                  style={{width:"100%"}}
                />
                <input
                  placeholder="Tracking Number"
                  value={courierDetails.trackingNumber}
                  onChange={e=>setCourierDetails({...courierDetails,trackingNumber:e.target.value})}
                  style={{width:"100%"}}
                />
                <input
                  type="date"
                  placeholder="Estimated Delivery Date"
                  value={courierDetails.estimatedDelivery}
                  onChange={e=>setCourierDetails({...courierDetails,estimatedDelivery:e.target.value})}
                  style={{width:"100%"}}
                />
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
                <button className="bg" onClick={()=>setShowCourierModal(null)}>Cancel</button>
                <button 
                  className="bp" 
                  style={{background:C.amber}}
                  onClick={()=>saveCourierDetails(showCourierModal)}
                  disabled={!courierDetails.name||!courierDetails.phone}
                >
                  Save & Dispatch
                </button>
              </div>
            </div>
          </div>
        )}

        {tab==="products"&&(
          <SupplierCatalog
            catalog={catalog}
            setCatalog={setCatalog}
            mySupplier={mySupplier}
            toast={toast}
          />
        )}
        {tab==="analytics"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Orders by status</div>
                {ORDER_STATUSES.filter(s=>s!=="cancelled").map(s=>{
                  const count=myOrders.filter(o=>o.status===s).length;
                  if(!count) return null;
                  return(
                    <div key={s} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                        <span style={{textTransform:"capitalize"}}>{s}</span><span style={{color:ORDER_STATUS_COLOR[s]}}>{count}</span>
                      </div>
                      <div className="btrack"><div className="bfill" style={{width:`${(count/myOrders.length)*100}%`,background:ORDER_STATUS_COLOR[s]}}/></div>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Revenue by store</div>
                {stores.map(s=>{
                  const rev=myOrders.filter(o=>o.storeId===s.id&&o.status!=="cancelled").reduce((a,o)=>a+(o.total||0),0);
                  if(!rev) return null;
                  return(
                    <div key={s.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                        <span>{s.name}</span><span style={{color:C.green}}>${rev.toFixed(0)}</span>
                      </div>
                      <div className="btrack"><div className="bfill" style={{width:`${Math.min(100,(rev/revenue)*100)}%`,background:C.green}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════ SUPPLIER CATALOG */
function SupplierCatalog({ catalog, setCatalog, mySupplier, toast }){
  const [filterCat,   setFilterCat]   = useState("All");
  const [filterStatus,setFilterStatus]= useState("all");
  const [searchQ,     setSearchQ]     = useState("");
  const [showModal,   setShowModal]   = useState(null); // null | "add" | product obj
  const [showDetail,  setShowDetail]  = useState(null);
  const [viewMode,    setViewMode]    = useState("grid"); // grid | table

  const myCatalog = catalog.filter(p => p.supplierId === mySupplier);

  const filtered = myCatalog
    .filter(p => filterCat === "All" || p.category === filterCat)
    .filter(p => filterStatus === "all" || p.status === filterStatus)
    .filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
                 p.sku.toLowerCase().includes(searchQ.toLowerCase()));

  const cats = [...new Set(myCatalog.map(p => p.category))];
  const activeCount = myCatalog.filter(p => p.status === "active").length;
  const draftCount  = myCatalog.filter(p => p.status === "draft").length;
  const lowStockCount = myCatalog.filter(p => p.stock < 50).length;
  const totalSkus   = myCatalog.length;

  function saveProduct(form, isEdit){
    if(isEdit){
      setCatalog(c => c.map(p => p.id === form.id ? { ...p, ...form } : p));
      toast("Product updated");
    } else {
      const newP = {
        ...form,
        id: `cat-${Date.now()}`,
        supplierId: mySupplier,
        status: form.status || "draft",
        stock: parseInt(form.stock) || 0,
        unitPrice: parseFloat(form.unitPrice) || 0,
        minOrderQty: parseInt(form.minOrderQty) || 1,
        maxOrderQty: parseInt(form.maxOrderQty) || 999,
        leadDays: parseInt(form.leadDays) || 1,
        expiryDays: parseInt(form.expiryDays) || 7,
        imageUrl: form.imageUrl || "",
      };
      setCatalog(c => [...c, newP]);
      toast("Product added to catalog");
    }
    setShowModal(null);
  }

  function toggleStatus(id){
    setCatalog(c => c.map(p => p.id === id
      ? { ...p, status: p.status === "active" ? "draft" : "active" }
      : p));
    toast("Status updated");
  }

  function deleteProduct(id){
    setCatalog(c => c.filter(p => p.id !== id));
    setShowDetail(null);
    toast("Product removed from catalog", C.red);
  }

  return (
    <div>
      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[
          {label:"Total SKUs",      val:totalSkus,    color:C.accent},
          {label:"Active",          val:activeCount,  color:C.green},
          {label:"Draft",           val:draftCount,   color:C.muted},
          {label:"Low Stock (<50)", val:lowStockCount,color:lowStockCount>0?C.amber:C.muted},
        ].map(s=>(
          <div key={s.label} className="sc">
            <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:500,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input
          placeholder="Search products or SKU…"
          value={searchQ} onChange={e=>setSearchQ(e.target.value)}
          style={{width:210}}
        />
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{width:130}}>
          <option value="All">All Categories</option>
          {cats.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:120}}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        {/* view toggle */}
        <div style={{display:"flex",border:`1px solid ${C.border2}`,borderRadius:8,overflow:"hidden",marginLeft:"auto"}}>
          {["grid","table"].map(v=>(
            <button key={v} onClick={()=>setViewMode(v)} style={{padding:"7px 13px",fontSize:12,background:viewMode===v?`${C.green}22`:"none",border:"none",color:viewMode===v?C.green:C.muted,borderRight:v==="grid"?`1px solid ${C.border2}`:"none"}}>
              {v==="grid" ? "⊞ Grid" : "☰ Table"}
            </button>
          ))}
        </div>
        <button className="bp" style={{padding:"9px 16px",fontSize:12,background:C.green}} onClick={()=>setShowModal("add")}>
          + Add Product
        </button>
      </div>

      {filtered.length === 0 && (
        <div style={{textAlign:"center",padding:60,color:C.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>📦</div>
          <div>No products match your filters.</div>
          <button className="bp" style={{marginTop:16,background:C.green,fontSize:12}} onClick={()=>setShowModal("add")}>Add your first product</button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
          {filtered.map(p=>{
            const productImage = p.imageUrl || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(p.name + ' product photo, professional food photography, white background')}&image_size=square`;
            return (
              <div key={p.id} className="card" style={{padding:0,overflow:"hidden",cursor:"pointer",transition:"border-color .2s",borderColor:p.status==="draft"?C.border2:C.border}} onClick={()=>setShowDetail(p)}>
                {/* colour band */}
                <div style={{height:4,background:p.status==="active"?C.green:C.muted}}/>
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{width:40,height:40,borderRadius:6,overflow:"hidden",background:C.surface}}>
                      <img src={productImage} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <span className="pill" style={{background:p.status==="active"?`${C.green}22`:`${C.muted}22`,color:p.status==="active"?C.green:C.muted,fontSize:10}}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div style={{padding:"0 16px"}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:3,lineHeight:1.3}}>{p.name}</div>
                <div style={{fontSize:10,color:C.muted,fontFamily:DF,marginBottom:8}}>{p.sku}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.5}}>{p.description}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:18,fontWeight:500,color:C.green}}>${p.unitPrice.toFixed(2)}</div>
                    <div style={{fontSize:10,color:C.muted}}>per {p.packSize}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:500,color:p.stock<50?C.amber:C.text}}>{p.stock} units</div>
                    <div style={{fontSize:10,color:C.muted}}>in stock</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  <span className="pill" style={{background:"#1e1e2e",color:"#888",fontSize:10}}>{p.category}</span>
                  <span className="pill" style={{background:"#1e1e2e",color:"#888",fontSize:10}}>MOQ: {p.minOrderQty}</span>
                  <span className="pill" style={{background:"#1e1e2e",color:"#888",fontSize:10}}>{p.expiryDays}d shelf</span>
                </div>
              </div>
              <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                <button className="bg" style={{flex:1,padding:"5px 8px",fontSize:11}} onClick={()=>setShowModal(p)}>Edit</button>
                <button onClick={()=>toggleStatus(p.id)} style={{flex:1,padding:"5px 8px",fontSize:11,borderRadius:7,border:`1px solid ${p.status==="active"?C.muted+"44":C.green+"44"}`,background:"none",color:p.status==="active"?C.muted:C.green}}>
                  {p.status==="active"?"Deactivate":"Activate"}
                </button>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && filtered.length > 0 && (
        <div className="card" style={{overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
            <thead style={{background:"#00100a"}}>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th><th>Unit Price</th>
                <th>Pack Size</th><th>MOQ</th><th>Stock</th><th>Shelf Life</th><th>Lead</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>{
                const productImage = p.imageUrl || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(p.name + ' product photo, professional food photography, white background')}&image_size=square`;
                return (
                  <tr key={p.id} className="trow" style={{background:"transparent"}}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:40,height:40,borderRadius:6,overflow:"hidden",background:C.surface}}>
                          <img src={productImage} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        </div>
                        <div>
                          <div style={{fontWeight:500,fontSize:13}}>{p.name}</div>
                          <div style={{fontSize:10,color:C.muted,lineHeight:1.4,maxWidth:200}}>{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{fontFamily:DF,fontSize:10,color:C.muted}}>{p.sku}</span></td>
                    <td><span className="pill" style={{background:"#1e1e2e",color:"#888"}}>{p.category}</span></td>
                    <td style={{fontWeight:500,color:C.green}}>${p.unitPrice.toFixed(2)}</td>
                    <td style={{fontSize:12,color:C.muted}}>{p.packSize}</td>
                    <td style={{fontSize:12}}>{p.minOrderQty}–{p.maxOrderQty}</td>
                    <td>
                      <span style={{color:p.stock<50?C.amber:C.text,fontWeight:p.stock<50?500:400}}>{p.stock}</span>
                    </td>
                    <td style={{fontSize:12,color:C.muted}}>{p.expiryDays}d</td>
                    <td style={{fontSize:12,color:C.muted}}>{p.leadDays}d</td>
                    <td>
                      <span className="pill" style={{background:p.status==="active"?`${C.green}22`:`${C.muted}22`,color:p.status==="active"?C.green:C.muted}}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:5}}>
                        <button className="bg" style={{padding:"4px 9px",fontSize:11}} onClick={()=>setShowDetail(p)}>View</button>
                        <button className="bg" style={{padding:"4px 9px",fontSize:11}} onClick={()=>setShowModal(p)}>Edit</button>
                        <button onClick={()=>toggleStatus(p.id)} style={{padding:"4px 9px",fontSize:11,borderRadius:7,border:`1px solid ${p.status==="active"?C.muted+"44":C.green+"44"}`,background:"none",color:p.status==="active"?C.muted:C.green}}>
                          {p.status==="active"?"Pause":"Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PRODUCT FORM MODAL */}
      {showModal && (
        <CatalogProductModal
          product={showModal === "add" ? null : showModal}
          onSave={saveProduct}
          onClose={()=>setShowModal(null)}
        />
      )}

      {/* PRODUCT DETAIL MODAL */}
      {showDetail && (
        <CatalogDetailModal
          product={showDetail}
          onEdit={()=>{ setShowModal(showDetail); setShowDetail(null); }}
          onToggleStatus={()=>{ toggleStatus(showDetail.id); setShowDetail(p=>({...p,status:p.status==="active"?"draft":"active"})); }}
          onDelete={()=>deleteProduct(showDetail.id)}
          onClose={()=>setShowDetail(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ CATALOG PRODUCT FORM MODAL */
function CatalogProductModal({ product, onSave, onClose }){
  const isEdit = !!product;
  const [form, setForm] = useState(product ? { ...product } : {
    name:"", category:"Produce", sku:"", barcode:"", unitPrice:"",
    packSize:"", minOrderQty:"1", maxOrderQty:"999",
    leadDays:"1", expiryDays:"7", stock:"0",
    description:"", status:"draft", imageUrl:"",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        set("imageUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    set("imageUrl", "");
  };

  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width:580}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:14,fontWeight:500,marginBottom:18}}>{isEdit?"Edit Product":"Add to Catalog"}</div>

        {/* Image upload */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Product Image</div>
          {form.imageUrl ? (
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:80,height:80,borderRadius:8,overflow:"hidden",background:C.surface}}>
                <img src={form.imageUrl} alt="Product" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div>
                <button className="bg" style={{fontSize:11,padding:"6px 12px",color:C.red,borderColor:`${C.red}44`}} onClick={removeImage}>Remove Image</button>
              </div>
            </div>
          ) : (
            <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",height:100,border:`2px dashed ${C.border2}`,borderRadius:10,cursor:"pointer",background:C.surface}}>
              <span style={{fontSize:24,marginBottom:8}}>📷</span>
              <span style={{fontSize:12,color:C.muted}}>Click to upload product image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/>
            </label>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            ["Product Name","name","text","1/-1"],
            ["Description","description","text","1/-1"],
            ["Category","category","select"],
            ["Status","status","status-select"],
            ["SKU","sku","text"],
            ["Barcode","barcode","text"],
            ["Unit Price ($)","unitPrice","number"],
            ["Pack Size","packSize","text"],
            ["Min Order Qty","minOrderQty","number"],
            ["Max Order Qty","maxOrderQty","number"],
            ["Lead Time (days)","leadDays","number"],
            ["Shelf Life (days)","expiryDays","number"],
            ["Current Stock","stock","number"],
          ].map(([label,key,type,span])=>(
            <div key={key} style={{gridColumn:span||"auto"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{label}</div>
              {type==="select"
                ? <select value={form[key]} onChange={e=>set(key,e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
                : type==="status-select"
                  ? <select value={form[key]} onChange={e=>set(key,e.target.value)}><option value="active">Active</option><option value="draft">Draft</option></select>
                  : <input type={type==="number"?"number":"text"} step={key==="unitPrice"?"0.01":"1"} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={label}/>
              }
            </div>
          ))}
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}}>
          <button className="bg" onClick={onClose}>Cancel</button>
          <button className="bp" style={{background:C.green}} onClick={()=>{if(form.name&&form.unitPrice)onSave(form,isEdit);}}>
            {isEdit?"Save Changes":"Add to Catalog"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ CATALOG DETAIL MODAL */
function CatalogDetailModal({ product:p, onEdit, onToggleStatus, onDelete, onClose }){
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width:520}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{fontSize:40}}>{p.images?.[0]||"📦"}</div>
            <div>
              <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>{p.name}</div>
              <div style={{display:"flex",gap:6}}>
                <span className="pill" style={{background:p.status==="active"?`${C.green}22`:`${C.muted}22`,color:p.status==="active"?C.green:C.muted}}>{p.status}</span>
                <span className="pill" style={{background:"#1e1e2e",color:"#888"}}>{p.category}</span>
              </div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:500,color:C.green}}>${p.unitPrice.toFixed(2)}</div>
            <div style={{fontSize:11,color:C.muted}}>per {p.packSize}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:16,padding:"12px 14px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
          {p.description}
        </div>

        {/* Info grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[
            ["SKU",          p.sku,                    DF],
            ["Barcode",      p.barcode||"—",           DF],
            ["Current Stock",`${p.stock} units`,       null],
            ["Min Order Qty",p.minOrderQty,            null],
            ["Max Order Qty",p.maxOrderQty,            null],
            ["Pack Size",    p.packSize,               null],
            ["Shelf Life",   `${p.expiryDays} days`,  null],
            ["Lead Time",    `${p.leadDays} days`,     null],
            ["Stock Status", p.stock<50?"Low":"OK",    null],
          ].map(([label,val,ff])=>(
            <div key={label} style={{padding:"10px 12px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:".06em",textTransform:"uppercase",marginBottom:3}}>{label}</div>
              <div style={{fontSize:12,fontFamily:ff||F,color:label==="Stock Status"&&p.stock<50?C.amber:C.text}}>{val}</div>
            </div>
          ))}
        </div>

        {/* Stock bar */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:5}}>
            <span>Stock level</span>
            <span style={{color:p.stock<50?C.amber:C.green}}>{p.stock} / 500 units</span>
          </div>
          <div className="btrack" style={{height:8}}>
            <div className="bfill" style={{width:`${Math.min(100,(p.stock/500)*100)}%`,background:p.stock<50?C.amber:C.green}}/>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
          <button className="bg" style={{color:C.red,borderColor:`${C.red}44`,fontSize:12,padding:"8px 14px"}} onClick={onDelete}>Delete</button>
          <div style={{display:"flex",gap:8}}>
            <button className="bg" style={{fontSize:12,padding:"8px 14px"}} onClick={onToggleStatus}>
              {p.status==="active"?"Deactivate":"Activate"}
            </button>
            <button className="bp" style={{background:C.green,fontSize:12,padding:"8px 14px"}} onClick={onEdit}>Edit Product</button>
            <button className="bg" style={{fontSize:12,padding:"8px 14px"}} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ ORDER TIMELINE */
function OrderTimeline({status}){
  const steps=["pending","confirmed","processing","in-transit","delivered"];
  const cur=steps.indexOf(status);
  const cancelled=status==="cancelled";
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:0,margin:"8px 0",overflowX:"auto"}}>
      {steps.map((s,i)=>{
        const done=cur>i; const active=cur===i; const labels=["Placed","Confirmed","Processing","In Transit","Delivered"];
        return(
          <div key={s} style={{flex:1,textAlign:"center",position:"relative",minWidth:60}}>
            {i>0&&<div style={{position:"absolute",top:9,right:"50%",left:"-50%",height:2,background:done?C.green:C.border}}/>}
            <div style={{width:20,height:20,borderRadius:"50%",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,position:"relative",zIndex:1,background:cancelled?"#222":done?C.green:active?C.accent:C.border,color:done||active?"#fff":C.muted,transition:"all .3s",border:`2px solid ${cancelled?"#333":done?C.green:active?C.accent:C.border}`,boxShadow:active?`0 0 8px ${C.accent}66`:"none"}}>
              {done?"✓":i+1}
            </div>
            <div style={{fontSize:9,color:cancelled?C.muted:done?C.green:active?C.accent:C.muted,marginTop:4,letterSpacing:".03em"}}>{cancelled&&i===cur?"Cancelled":labels[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ STORE DASHBOARD */
function StoreDashboard({session,stores,suppliers,allProducts,setAllProducts,allOrders,setAllOrders,syncingIds,syncTag,toast,logout,catalog,plans,subscriptions,setSubscriptions,payments,setPayments,users,createSubscription,updateSubscription,cancelSubscription}){
  const [tab, setTab]           = useState("dashboard");
  const [activeStore, setActiveStore] = useState(session.user.storeId||"s1");
  const [filterCat, setFilterCat]    = useState("All");
  const [searchQ, setSearchQ]        = useState("");
  const [priceEditId, setPriceEditId]= useState(null);
  const [tempPrice, setTempPrice]    = useState("");
  const [showAddModal,    setShowAddModal]   = useState(false);
  const [showTagModal,    setShowTagModal]   = useState(null);
  const [showBarcodeUI,   setShowBarcodeUI]  = useState(false);
  const [showOrderModal,  setShowOrderModal] = useState(null);
  const [showOrderDetail, setShowOrderDetail]= useState(null);
  const [scannerEnabled,  setScannerEnabled]= useState(true);
  const [cart, setCart] = useState([]);
  const [marketSearch, setMarketSearch] = useState("");
  const [marketFilterCat, setMarketFilterCat] = useState("All");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(null);

  const { scannerActive } = useBarcodeScanner({
    onScan: handleBarcodeScan,
    enabled: scannerEnabled
  });

  const products  = allProducts.filter(p=>p.storeId===activeStore);
  const myOrders  = allOrders.filter(o=>o.storeId===activeStore);
  const myStore   = stores.find(s=>s.id===activeStore);

  const alerts=[];
  products.forEach(p=>{
    const d=daysUntil(p.addedDate,p.expiryDays);
    if(d<=1) alerts.push({type:"critical",msg:`${p.name} expires today!`,id:p.id});
    else if(d<=3) alerts.push({type:"warning",msg:`${p.name} expires in ${d}d`,id:p.id});
    const ss=stockStatus(p.stock,p.minStock);
    if(ss==="low") alerts.push({type:"low",msg:`${p.name} below min stock`,id:p.id});
    if(ss==="out") alerts.push({type:"out",msg:`${p.name} out of stock`,id:p.id});
  });

  const unsyncedCount = products.filter(p=>!p.tag.synced).length;
  const storeOrders   = myOrders;
  const pendingOrders = storeOrders.filter(o=>o.status==="pending"||o.status==="confirmed").length;

  function updateProduct(id,patch){ setAllProducts(all=>all.map(p=>p.id===id?{...p,...patch}:p)); }
  function syncAll(){ products.filter(p=>!p.tag.synced).forEach(p=>syncTag(p.id)); }
  function updatePrice(id,np){
    const price=parseFloat(np);
    if(isNaN(price)||price<=0) return;
    updateProduct(id,{price,tag:{synced:false,lastSync:"pending"}});
    setPriceEditId(null);
    toast("Price updated — sync tag",C.amber);
  }
  function addStock(id,qty){
    setAllProducts(all=>all.map(p=>p.id===id?{...p,stock:Math.max(0,p.stock+qty)}:p));
    toast(`+${qty} units restocked`);
  }
  function addProduct(form){
    const newP={id:`${activeStore}-${Date.now()}`,storeId:activeStore,name:form.name,category:form.category,
      sku:form.sku||`${form.category.slice(0,3).toUpperCase()}-${Math.floor(Math.random()*900+100)}`,
      barcode:form.barcode||"",price:parseFloat(form.price),stock:parseInt(form.stock),
      minStock:parseInt(form.minStock)||10,expiryDays:parseInt(form.expiryDays)||7,
      addedDate:new Date().toISOString(),description:form.description||"",
      tag:{synced:false,lastSync:"never"},
      supplierId:suppliers.find(s=>s.categories.includes(form.category))?.id||"sup5"};
    setAllProducts(all=>[...all,newP]);
    setShowAddModal(false);
    toast("Product added");
  }
  function placeOrder(order){
    const eta=new Date(); eta.setDate(eta.getDate()+order.leadDays);
    const newO={...order,id:`ORD-${Date.now()}`,status:"pending",storeId:activeStore,placedAt:new Date().toISOString(),eta:eta.toLocaleDateString()};
    setAllOrders(o=>[...o,newO]);
    setShowOrderModal(null);
    toast(`Order placed with ${order.supplierName}`);
  }
  function cancelOrder(id){
    setAllOrders(o=>o.map(x=>x.id===id?{...x,status:"cancelled"}:x));
    toast("Order cancelled",C.red);
  }
  function receiveOrder(id){
    const order=allOrders.find(o=>o.id===id);
    if(!order) return;
    const receivedItems = [];
    order.items?.forEach(item=>{
      const prod=allProducts.find(p=>p.storeId===activeStore&&p.name===item.name);
      if(prod){ 
        setAllProducts(all=>all.map(p=>p.id===prod.id?{
          ...p,
          stock:p.stock+parseInt(item.qty||0),
          addedDate:new Date().toISOString()
        }:p));
        receivedItems.push(item.name);
      }
    });
    setAllOrders(o=>o.map(x=>x.id===id?{...x,status:"delivered"}:x));
    toast(`${receivedItems.length > 0 ? receivedItems.join(', ') : 'Items'} received — stock updated and shelf life monitoring started!`);
  }
  function handleBarcodeScan(barcode){
    const found=BARCODE_DB[barcode];
    if(!found){ toast("Barcode not found",C.red); return; }
    const existing=products.find(p=>p.barcode===barcode);
    if(existing){ addStock(existing.id,10); toast(`${existing.name} — +10 units`); }
    else{ addProduct({name:found.name,category:found.category,sku:"",barcode,price:found.price.toString(),stock:"20",minStock:"10",expiryDays:found.expiryDays.toString(),description:found.description}); }
    setShowBarcodeUI(false);
  }

  const filtered=products.filter(p=>(filterCat==="All"||p.category===filterCat)&&(p.name.toLowerCase().includes(searchQ.toLowerCase())||p.sku.toLowerCase().includes(searchQ.toLowerCase())));
  const TABS=["dashboard","inventory","price-tags","orders","marketplace","payments","subscriptions","analytics","alerts"];

  // Cart functions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, qty: Math.min(item.qty + 1, product.maxOrderQty) }
            : item
        );
      }
      return [...prev, { ...product, qty: product.minOrderQty }];
    });
    toast(`${product.name} added to cart`);
  };

  const updateCartQty = (productId, qty) => {
    const product = catalog.find(p => p.id === productId);
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => 
        prev.map(item => 
          item.id === productId 
            ? { ...item, qty: Math.min(qty, product?.maxOrderQty || 999) }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.unitPrice * item.qty), 0);

  // Place marketplace order
  const placeMarketplaceOrder = (paymentMethod) => {
    if (cart.length === 0) return;
    
    // Group items by supplier
    const supplierGroups = {};
    cart.forEach(item => {
      if (!supplierGroups[item.supplierId]) {
        supplierGroups[item.supplierId] = [];
      }
      supplierGroups[item.supplierId].push(item);
    });

    // Create orders for each supplier
    Object.entries(supplierGroups).forEach(([supplierId, items]) => {
      const supplier = suppliers.find(s => s.id === supplierId);
      const total = items.reduce((t, item) => t + (item.unitPrice * item.qty), 0);
      const eta = new Date();
      eta.setDate(eta.getDate() + (supplier?.leadDays || 2));
      
      const newOrder = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        storeId: activeStore,
        supplierId,
        supplierName: supplier?.name || 'Supplier',
        status: 'pending',
        placedAt: new Date().toISOString(),
        eta: eta.toLocaleDateString(),
        total,
        items: items.map(item => ({
          name: item.name,
          qty: item.qty,
          unitPrice: item.unitPrice
        })),
        notes: '',
        priority: 'normal',
        leadDays: supplier?.leadDays || 2
      };
      
      setAllOrders(prev => [...prev, newOrder]);
      
      // Record payment
      const newPayment = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: session.user.id,
        amount: total,
        type: 'order',
        status: 'completed',
        date: new Date().toISOString(),
        method: paymentMethod
      };
      setPayments(prev => [...prev, newPayment]);
    });

    setCart([]);
    setShowCheckout(false);
    toast('Order placed successfully!');
  };

  const userSubscription = subscriptions.find(s => s.userId === session.user.id);
  const userPayments = payments.filter(p => p.userId === session.user.id);
  const currentUser = users.find(u => u.id === session.user.id);
  const userPaymentMethods = currentUser?.paymentMethods || [];
  const [paymentFilter, setPaymentFilter] = useState("");
  const [paymentDateFilter, setPaymentDateFilter] = useState("");

  // Filtered payments based on selected filters
  const filteredPayments = userPayments.filter(payment => {
    // Type filter
    if (paymentFilter && payment.type !== paymentFilter) return false;
    
    // Date filter
    if (paymentDateFilter) {
      const paymentDate = new Date(payment.date);
      const today = new Date();
      
      if (paymentDateFilter === "7") {
        // Last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (paymentDate < sevenDaysAgo) return false;
      } else if (paymentDateFilter === "30") {
        // Last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        if (paymentDate < thirtyDaysAgo) return false;
      } else if (paymentDateFilter === "month") {
        // This month
        if (paymentDate.getMonth() !== today.getMonth() || paymentDate.getFullYear() !== today.getFullYear()) return false;
      } else if (paymentDateFilter === "lastMonth") {
        // Last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        if (paymentDate.getMonth() !== lastMonth.getMonth() || paymentDate.getFullYear() !== lastMonth.getFullYear()) return false;
      }
    }
    
    return true;
  });

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 18px",display:"flex",alignItems:"center",gap:10,height:52}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <img src="/shelfos_logo.svg" alt="ShelfOS" style={{width:26,height:26}}/>
          <span style={{fontFamily:DF,fontSize:12,fontWeight:700}}>SHELF<span style={{color:C.accent}}>OS</span></span>
        </div>
        {/* store switcher — show all stores for multi-store managers */}
        <div style={{display:"flex",gap:5,overflowX:"auto",flex:1}}>
          {stores.map(s=>(
            <button key={s.id} onClick={()=>setActiveStore(s.id)} style={{padding:"4px 11px",borderRadius:20,fontSize:12,border:`1px solid ${activeStore===s.id?C.accent:C.border2}`,background:activeStore===s.id?`${C.accent}18`:"none",color:activeStore===s.id?C.accent:"#9090b0",whiteSpace:"nowrap",transition:"all .2s"}}>
              {s.name}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <button onClick={()=>setScannerEnabled(!scannerEnabled)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,border:`1px solid ${scannerEnabled?C.green+"44":C.border2}`,background:scannerEnabled?`${C.green}12`:"none",color:scannerEnabled?C.green:C.muted,fontSize:11}}>
            <span className={`sdot${scannerActive?" blink":""}`} style={{background:scannerActive?C.green:scannerEnabled?C.green:C.muted}}/>
            {scannerEnabled?(scannerActive?"Scanning…":"Scanner ON"):"Scanner OFF"}
          </button>
          <button className="bg" style={{padding:"6px 11px",fontSize:11}} onClick={()=>setShowBarcodeUI(true)}>▦ Manual Scan</button>
          {unsyncedCount>0&&<button className="bg" onClick={syncAll} style={{fontSize:11,color:C.amber,borderColor:`${C.amber}44`,padding:"6px 11px"}}>⟳ Sync {unsyncedCount}</button>}
          <button className="bp" onClick={()=>setShowAddModal(true)} style={{fontSize:11,padding:"7px 13px"}}>+ Product</button>
          {cart.length > 0 && (
            <button className="bg" onClick={() => setShowCheckout(true)} style={{padding:"6px 11px",fontSize:11,display:"flex",alignItems:"center",gap:5,borderColor:C.accent,background:`${C.accent}10`,color:C.accent}}>
              🛒 {cart.reduce((sum, item) => sum + item.qty, 0)} items (${cartTotal.toFixed(2)})
            </button>
          )}
          <span style={{fontSize:12,color:C.muted}}>{session.user.name}</span>
          <button className="bg" style={{fontSize:11,padding:"6px 10px"}} onClick={logout}>↩</button>
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(t=><button key={t} className={`nb${tab===t?" act":""}`} onClick={()=>setTab(t)}>
          {t==="alerts"&&alerts.length>0?`alerts (${alerts.length})`:t==="orders"&&pendingOrders>0?`orders (${pendingOrders})`:t}
        </button>)}
      </div>

      {/* Store banner */}
      <div style={{background:`${C.accent}0b`,borderBottom:`1px solid ${C.accent}1a`,padding:"7px 18px",display:"flex",alignItems:"center",gap:10,fontSize:11}}>
        <span style={{color:C.accent,letterSpacing:".06em",textTransform:"uppercase"}}>● {myStore?.name}</span>
        <span style={{color:C.muted}}>{myStore?.city} · Manager: {myStore?.manager}</span>
        <span style={{marginLeft:"auto",color:C.muted}}>{products.length} products · {storeOrders.filter(o=>o.status==="pending").length} orders pending</span>
      </div>

      <div style={{flex:1,padding:"18px",maxWidth:1300,margin:"0 auto",width:"100%"}}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
              {[
                {label:"Products",val:products.length,color:C.accent},
                {label:"Expiring ≤3d",val:products.filter(p=>daysUntil(p.addedDate,p.expiryDays)<=3).length,color:C.amber},
                {label:"Stock Alerts",val:products.filter(p=>stockStatus(p.stock,p.minStock)!=="ok").length,color:C.red},
                {label:"Active Orders",val:storeOrders.filter(o=>!["delivered","cancelled"].includes(o.status)).length,color:C.green},
              ].map(s=>(
                <div key={s.label} className="sc">
                  <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6}}>{s.label}</div>
                  <div style={{fontSize:28,fontWeight:500,color:s.val>0&&s.label!=="Products"?s.color:C.text}}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div className="card" style={{padding:18}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Expiry timeline</div>
                {[...products].sort((a,b)=>daysUntil(a.addedDate,a.expiryDays)-daysUntil(b.addedDate,b.expiryDays)).slice(0,7).map(p=>{
                  const d=daysUntil(p.addedDate,p.expiryDays);const st=expiryStatus(d);
                  return(<div key={p.id} style={{marginBottom:11}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                      <span>{p.name}</span><span style={{color:SC[st]}}>{d<=0?"EXPIRED":`${d}d`}</span>
                    </div>
                    <div className="btrack"><div className="bfill" style={{width:`${Math.min(100,Math.max(3,(d/30)*100))}%`,background:SC[st]}}/></div>
                  </div>);
                })}
              </div>
              <div className="card" style={{padding:18}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Recent orders</div>
                {storeOrders.slice(0,5).map(o=>(
                  <div key={o.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>setShowOrderDetail(o)}>
                    <div>
                      <div style={{fontSize:12,fontWeight:500}}>{o.supplierName}</div>
                      <div style={{fontSize:11,color:C.muted}}>{o.id} · {o.items?.length} items</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <span className="pill" style={{background:`${ORDER_STATUS_COLOR[o.status]}22`,color:ORDER_STATUS_COLOR[o.status]}}>{o.status}</span>
                      <div style={{fontSize:11,color:C.muted,marginTop:3}}>${o.total?.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                <button className="bg" style={{width:"100%",marginTop:12,fontSize:12}} onClick={()=>setTab("orders")}>View all orders →</button>
              </div>
            </div>
            <div className="card" style={{padding:18}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Sales this week</div>
              <BarChart data={SALES[activeStore]||SALES.s1} labels={WEEK} color={C.accent} prefix="$"/>
            </div>
          </div>
        )}

        {/* ── INVENTORY ── */}
        {tab==="inventory"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <input placeholder="Search products or SKU…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{width:220}}/>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{width:130}}>
                <option>All</option>{CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              <button className="bg" style={{padding:"8px 12px",fontSize:11}} onClick={()=>setShowBarcodeUI(true)}>▦ Scan</button>
            </div>
            <div className="card" style={{overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:860}}>
                <thead style={{background:"#0a0a14"}}><tr><th>Product</th><th>Barcode</th><th>Category</th><th>Price</th><th>Stock</th><th>Expires</th><th>Supplier</th><th>Tag</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(p=>{
                    const d=daysUntil(p.addedDate,p.expiryDays);const est=expiryStatus(d);const sst=stockStatus(p.stock,p.minStock);
                    const sup=suppliers.find(s=>s.id===p.supplierId);
                    const productImage = p.imageUrl || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(p.name + ' product photo, professional food photography, white background')}&image_size=square`;
                    return(
                      <tr key={p.id} className="trow" style={{background:"transparent"}}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:40,height:40,borderRadius:6,overflow:"hidden",background:C.surface}}>
                              <img src={productImage} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            </div>
                            <div>
                              <div style={{fontWeight:500}}>{p.name}</div>
                              <div style={{fontSize:11,color:C.muted}}>{p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td><span style={{fontFamily:DF,fontSize:10,color:C.muted}}>{p.barcode||"—"}</span></td>
                        <td><span className="pill" style={{background:"#1e1e2e",color:"#888"}}>{p.category}</span></td>
                        <td>
                          {priceEditId===p.id
                            ?<div style={{display:"flex",gap:4}}><input value={tempPrice} onChange={e=>setTempPrice(e.target.value)} style={{width:70,padding:"4px 8px"}} autoFocus onKeyDown={e=>{if(e.key==="Enter")updatePrice(p.id,tempPrice);if(e.key==="Escape")setPriceEditId(null);}}/><button className="bp" style={{padding:"4px 8px",fontSize:11}} onClick={()=>updatePrice(p.id,tempPrice)}>✓</button></div>
                            :<span style={{cursor:"pointer",fontWeight:500}} onClick={()=>{setPriceEditId(p.id);setTempPrice(p.price.toFixed(2));}}>${p.price.toFixed(2)} <span style={{fontSize:10,color:C.muted}}>✎</span></span>
                          }
                        </td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{color:sst==="ok"?C.text:SC[sst],fontWeight:sst!=="ok"?500:400}}>{p.stock}</span>
                            <span style={{fontSize:11,color:C.muted}}>/{p.minStock}</span>
                            <button style={{background:"none",border:`1px solid ${C.border2}`,color:"#888",borderRadius:4,fontSize:10,padding:"1px 6px"}} onClick={()=>addStock(p.id,10)}>+10</button>
                          </div>
                        </td>
                        <td><span className="pill" style={{background:`${SC[est]}22`,color:SC[est]}}>{d<=0?"EXPIRED":`${d}d`}</span></td>
                        <td style={{fontSize:11,color:C.muted}}>{sup?.name||"—"}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span className={`sdot${syncingIds.has(p.id)?" blink":""}`} style={{background:syncingIds.has(p.id)?C.yellow:p.tag.synced?C.green:C.red}}/>
                            <span style={{fontSize:11,color:C.muted}}>{syncingIds.has(p.id)?"syncing…":p.tag.synced?"synced":"unsynced"}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{display:"flex",gap:5}}>
                            <button className="bg" style={{padding:"4px 9px",fontSize:11}} onClick={()=>setShowTagModal(p)}>Tag</button>
                            {!p.tag.synced&&!syncingIds.has(p.id)&&<button className="bp" style={{padding:"4px 9px",fontSize:11}} onClick={()=>syncTag(p.id)}>Sync</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRICE TAGS ── */}
        {tab==="price-tags"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:14}}>Digital Price Tags <span style={{fontSize:12,color:C.muted,marginLeft:8}}>{products.filter(p=>p.tag.synced).length} synced · {unsyncedCount} pending</span></div>
              <button className="bp" onClick={syncAll}>Sync All</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
              {products.map(p=>{
                const d=daysUntil(p.addedDate,p.expiryDays);const est=expiryStatus(d);const isSyncing=syncingIds.has(p.id);
                return(
                  <div key={p.id}>
                    <div style={{background:"#f5f0e8",color:"#111",borderRadius:8,fontFamily:DF,position:"relative",overflow:"hidden",padding:14,boxShadow:`0 0 0 2px ${isSyncing?C.yellow:p.tag.synced?C.green:C.red}`,opacity:isSyncing?.7:1,transition:"all .3s"}}>
                      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#111"}}/>
                      <div style={{fontSize:9,letterSpacing:".1em",color:"#888",marginTop:8,marginBottom:5}}>{p.sku} · {p.category.toUpperCase()}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#111",lineHeight:1.3,marginBottom:4}}>{p.name}</div>
                      <div style={{fontSize:10,color:"#666",marginBottom:10,lineHeight:1.4}}>{p.description}</div>
                      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",borderTop:"1px solid #ddd",paddingTop:10}}>
                        <span style={{fontSize:24,fontWeight:700,color:"#111"}}>${p.price.toFixed(2)}</span>
                        <div style={{textAlign:"right"}}><div style={{fontSize:9,color:SC[est],fontWeight:700}}>{d<=0?"⚠ EXPIRED":est==="critical"?"⚠ TODAY":`BEST: ${d}D`}</div><div style={{fontSize:9,color:"#999",marginTop:2}}>QTY: {p.stock}</div></div>
                      </div>
                    </div>
                    <div style={{marginTop:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span className={`sdot${isSyncing?" blink":""}`} style={{background:isSyncing?C.yellow:p.tag.synced?C.green:C.red}}/><span style={{fontSize:11,color:C.muted}}>{isSyncing?"updating…":p.tag.synced?p.tag.lastSync:"unsynced"}</span></div>
                      {!p.tag.synced&&!isSyncing&&<button className="bp" style={{padding:"3px 9px",fontSize:10}} onClick={()=>syncTag(p.id)}>Sync</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab==="orders"&&(
          <OrderManagement
            orders={storeOrders} suppliers={suppliers} products={products}
            onPlace={placeOrder} onCancel={cancelOrder} onReceive={receiveOrder}
            onDetail={setShowOrderDetail} toast={toast}
          />
        )}

        {/* ── MARKETPLACE ── */}
        {tab==="marketplace"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>Supplier Marketplace</span>
              {cart.length > 0 && (
                <button className="bp" onClick={() => setShowCheckout(true)} style={{padding:"8px 16px",fontSize:12}}>
                  Checkout ({cart.reduce((s,i)=>s+i.qty,0)} items)
                </button>
              )}
            </div>

            {/* Filters */}
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <input 
                placeholder="Search products..." 
                value={marketSearch} 
                onChange={e=>setMarketSearch(e.target.value)} 
                style={{width:240}}
              />
              <select 
                value={marketFilterCat} 
                onChange={e=>setMarketFilterCat(e.target.value)} 
                style={{width:150}}
              >
                <option value="All">All Categories</option>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Product grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {catalog
                .filter(p => p.status === "active")
                .filter(p => marketFilterCat === "All" || p.category === marketFilterCat)
                .filter(p => p.name.toLowerCase().includes(marketSearch.toLowerCase()))
                .sort((a, b) => {
                  // Check if products are low in stock or expiring in user's inventory
                  const inventoryA = products.find(p => p.name === a.name);
                  const inventoryB = products.find(p => p.name === b.name);
                  
                  // Calculate urgency score for each product
                  const getUrgencyScore = (inv) => {
                    if (!inv) return 0;
                    const stockRatio = inv.stock / inv.minStock;
                    const expiryDays = daysUntil(inv.addedDate, inv.expiryDays);
                    
                    // Higher score means more urgent
                    let score = 0;
                    if (stockRatio < 0.5) score += 10; // Very low stock
                    else if (stockRatio < 1) score += 5; // Low stock
                    if (expiryDays <= 2) score += 10; // Expiring very soon
                    else if (expiryDays <= 5) score += 5; // Expiring soon
                    return score;
                  };
                  
                  const scoreA = getUrgencyScore(inventoryA);
                  const scoreB = getUrgencyScore(inventoryB);
                  
                  return scoreB - scoreA; // Higher score first
                })
                .map(product => {
                  const supplier = suppliers.find(s => s.id === product.supplierId);
                  const cartItem = cart.find(i => i.id === product.id);
                  const inventoryProduct = products.find(p => p.name === product.name);
                  const isUrgent = inventoryProduct && (
                    (inventoryProduct.stock / inventoryProduct.minStock < 1) || 
                    daysUntil(inventoryProduct.addedDate, inventoryProduct.expiryDays) <= 5
                  );
                  const productImage = product.imageUrl || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(product.name + ' product photo, professional food photography, white background')}&image_size=square`;
                  return (
                    <div key={product.id} className="card" style={{padding:16,borderLeft:isUrgent?`3px solid ${C.amber}`:"3px solid transparent"}}>
                      {isUrgent && (
                        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:6,padding:"4px 8px",background:`${C.amber}10`,borderRadius:6,width:"fit-content"}}>
                          <span>⚠</span>
                          <span style={{fontSize:11,color:C.amber}}>
                            {inventoryProduct && daysUntil(inventoryProduct.addedDate, inventoryProduct.expiryDays) <= 5 
                              ? `Expires in ${daysUntil(inventoryProduct.addedDate, inventoryProduct.expiryDays)}d` 
                              : `Low stock`}
                          </span>
                        </div>
                      )}
                      <div style={{width:"100%",height:120,borderRadius:8,overflow:"hidden",marginBottom:8,background:C.surface}}>
                        <img src={productImage} alt={product.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      </div>
                      <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{product.name}</div>
                      <div style={{fontSize:11,color:C.muted,marginBottom:8}}>
                        {supplier?.name} · {product.category}
                      </div>
                      <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.4}}>
                        {product.description}
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <span style={{fontSize:18,fontWeight:500,color:C.green}}>${product.unitPrice.toFixed(2)}</span>
                        <span style={{fontSize:11,color:C.muted}}>
                          {product.packSize}
                        </span>
                      </div>
                      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
                        <span className="pill" style={{background:"#1e1e2e",color:"#888",fontSize:10}}>MOQ: {product.minOrderQty}</span>
                        <span className="pill" style={{background:"#1e1e2e",color:"#888",fontSize:10}}>Stock: {product.stock}</span>
                      </div>
                      {cartItem ? (
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <button 
                            className="bg" 
                            style={{padding:"4px 10px",fontSize:12}}
                            onClick={() => updateCartQty(product.id, cartItem.qty - 1)}
                          >-</button>
                          <span style={{fontSize:13}}>{cartItem.qty}</span>
                          <button 
                            className="bg" 
                            style={{padding:"4px 10px",fontSize:12}}
                            onClick={() => updateCartQty(product.id, cartItem.qty + 1)}
                          >+</button>
                          <button 
                            className="bg" 
                            style={{padding:"4px 10px",fontSize:12,color:C.red,borderColor:`${C.red}44`,marginLeft:"auto"}}
                            onClick={() => removeFromCart(product.id)}
                          >Remove</button>
                        </div>
                      ) : (
                        <button 
                          className="bp" 
                          style={{width:"100%",padding:"8px",fontSize:12}}
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab==="payments"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>Payment History</span>
              <div style={{display:"flex",gap:8}}>
                <select 
                  value={paymentFilter} 
                  onChange={e => setPaymentFilter(e.target.value)}
                  style={{width:150}}
                >
                  <option value="">All Types</option>
                  <option value="subscription">Subscriptions</option>
                  <option value="order">Orders</option>
                </select>
                <select 
                  value={paymentDateFilter} 
                  onChange={e => setPaymentDateFilter(e.target.value)}
                  style={{width:150}}
                >
                  <option value="">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="month">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>
            </div>

            {/* Summary Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
              <div className="sc">
                <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:4}}>Total Spent</div>
                <div style={{fontSize:24,fontWeight:500,color:C.green}}>
                  ${filteredPayments.reduce((s,p) => s+p.amount,0).toFixed(2)}
                </div>
              </div>
              <div className="sc">
                <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:4}}>Subscriptions</div>
                <div style={{fontSize:24,fontWeight:500,color:C.accent}}>
                  ${filteredPayments.filter(p=>p.type==="subscription").reduce((s,p)=>s+p.amount,0).toFixed(2)}
                </div>
              </div>
              <div className="sc">
                <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:4}}>Orders</div>
                <div style={{fontSize:24,fontWeight:500,color:C.green}}>
                  ${filteredPayments.filter(p=>p.type==="order").reduce((s,p)=>s+p.amount,0).toFixed(2)}
                </div>
              </div>
              <div className="sc">
                <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:4}}>Transactions</div>
                <div style={{fontSize:24,fontWeight:500,color:C.amber}}>
                  {filteredPayments.length}
                </div>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div style={{textAlign:"center",padding:60,color:C.muted}}>No payments found for the selected filters</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filteredPayments.map(payment => (
                  <div key={payment.id} className="card" style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                        <div style={{fontSize:13,fontWeight:500}}>
                          {payment.type === 'subscription' ? 'Subscription Payment' : 'Order Payment'}
                        </div>
                        <span className="pill" style={{
                          background:payment.type === 'subscription' ? `${C.accent}22` : `${C.green}22`,
                          color:payment.type === 'subscription' ? C.accent : C.green,
                          fontSize:10
                        }}>
                          {payment.type}
                        </span>
                      </div>
                      <div style={{fontSize:11,color:C.muted}}>
                        {new Date(payment.date).toLocaleDateString()} · {payment.method}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span className="pill" style={{background:`${C.green}22`,color:C.green}}>
                        {payment.status}
                      </span>
                      <span style={{fontSize:16,fontWeight:500,color:C.green}}>
                        ${payment.amount.toFixed(2)}
                      </span>
                      <button 
                        className="bg" 
                        style={{padding:"6px 12px",fontSize:11}}
                        onClick={() => setShowPaymentModal(payment)}
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUBSCRIPTIONS ── */}
        {tab==="subscriptions"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14}}>Subscription Management</div>

            {userSubscription ? (
              <div className="card" style={{padding:20,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:500,marginBottom:4}}>
                      {plans.find(p => p.id === userSubscription.planId)?.name || userSubscription.planId}
                    </div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:2}}>
                      Billing: {userSubscription.billingCycle}
                    </div>
                    <div style={{fontSize:12,color:C.muted}}>
                      Next payment: {new Date(userSubscription.nextBillingDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:500,color:C.green}}>${userSubscription.amount}</div>
                    <span className="pill" style={{background:`${C.green}22`,color:C.green,marginTop:8}}>
                      {userSubscription.status}
                    </span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="bg" onClick={() => setShowPaymentModal({type: 'change-plan', subscription: userSubscription})} style={{padding:"8px 16px",fontSize:12}}>
                    Change Plan
                  </button>
                  {userSubscription.status === 'active' && (
                    <button 
                      className="bg" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel your subscription?')) {
                          cancelSubscription(userSubscription.id);
                          toast('Subscription cancelled');
                        }
                      }}
                      style={{padding:"8px 16px",fontSize:12,color:C.red,borderColor:`${C.red}44`}}
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{padding:20,marginBottom:14,textAlign:"center"}}>
                <div style={{fontSize:14,marginBottom:10}}>No active subscription</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Choose a plan to get started</div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {plans.map((plan, idx) => (
                <div key={plan.id} className="card" style={{padding:20,border:idx === 1 ? `2px solid ${plan.color}` : undefined}}>
                  {idx === 1 && (
                    <div style={{position:"relative",top:"-28px",textAlign:"center",marginBottom:"-8px"}}>
                      <span className="pill" style={{background:plan.color,color:"white",padding:"4px 12px"}}>
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div style={{fontSize:16,fontWeight:500,marginBottom:6}}>{plan.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:10}}>
                    <span style={{fontSize:28,fontWeight:500}}>${plan.monthly}</span>
                    <span style={{fontSize:12,color:C.muted}}>/month</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:12}}>
                    Save 17% with annual billing: ${plan.yearly}/year
                  </div>
                  <div style={{marginBottom:14}}>
                    {plan.features.map((feature, i) => (
                      <div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:12}}>
                        <span style={{color:C.green}}>✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="bp" 
                    style={{width:"100%",background:plan.color}}
                    onClick={() => {
                      if (userSubscription) {
                        updateSubscription(userSubscription.id, plan.id);
                        toast('Subscription updated');
                      } else {
                        setShowPaymentModal({type: 'subscribe', plan});
                      }
                    }}
                  >
                    {userSubscription?.planId === plan.id ? 'Current Plan' : userSubscription ? 'Switch Plan' : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab==="analytics"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div className="card" style={{padding:18}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Sales this week</div>
                <BarChart data={SALES[activeStore]||SALES.s1} labels={WEEK} color={C.accent} prefix="$"/>
              </div>
              <div className="card" style={{padding:18}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Stock health</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {products.slice(0,8).map(p=>{
                    const ss=stockStatus(p.stock,p.minStock);
                    const pct=Math.min(100,Math.round((p.stock/Math.max(p.minStock*2,p.stock+1))*100));
                    return(<div key={p.id} style={{padding:"8px 10px",background:C.surface,borderRadius:7,border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:11,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:4}}><span>{p.stock}/{p.minStock}</span><span style={{color:SC[ss]}}>{ss.toUpperCase()}</span></div>
                      <div className="btrack"><div className="bfill" style={{width:`${pct}%`,background:SC[ss]}}/></div>
                    </div>);
                  })}
                </div>
              </div>
            </div>
            <div className="card" style={{padding:18}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Order spend by supplier</div>
              {suppliers.map(s=>{
                const total=storeOrders.filter(o=>o.supplierId===s.id&&o.status!=="cancelled").reduce((a,o)=>a+(o.total||0),0);
                if(!total) return null;
                const max=Math.max(...suppliers.map(s2=>storeOrders.filter(o=>o.supplierId===s2.id&&o.status!=="cancelled").reduce((a,o)=>a+(o.total||0),0)));
                return(<div key={s.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span>{s.name}</span><span style={{color:C.green}}>${total.toFixed(2)}</span></div>
                  <div className="btrack"><div className="bfill" style={{width:`${(total/max)*100}%`,background:C.accent}}/></div>
                </div>);
              })}
            </div>
          </div>
        )}

        {/* ── ALERTS ── */}
        {tab==="alerts"&&(
          <div>
            <div style={{fontSize:14,marginBottom:14}}>{alerts.length} active alerts</div>
            {alerts.length===0&&<div style={{textAlign:"center",padding:60,color:C.muted}}><div style={{fontSize:28,marginBottom:8}}>✓</div><div>All clear.</div></div>}
            {["critical","out","warning","low","soon"].map(type=>{
              const grp=alerts.filter(a=>a.type===type);if(!grp.length) return null;
              const label={critical:"Expiring Today",out:"Out of Stock",warning:"Expiring in 3 Days",low:"Low Stock",soon:"Expiring This Week"}[type];
              const col={critical:C.red,out:C.red,warning:C.amber,low:C.amber,soon:C.yellow}[type];
              return(<div key={type} style={{marginBottom:16}}>
                <div style={{fontSize:10,color:col,letterSpacing:".08em",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:7}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:col,display:"inline-block"}}/>{label}
                </div>
                {grp.map((a,i)=>{
                  const product=products.find(p=>p.id===a.id);
                  const sup=product?suppliers.find(s=>s.id===product.supplierId):null;
                  return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,marginBottom:6,background:`${col}11`,border:`1px solid ${col}33`,fontSize:13}}>
                    <span style={{color:col}}>⚠</span><span style={{flex:1}}>{a.msg}</span>
                    <div style={{display:"flex",gap:6}}>
                      {(type==="low"||type==="out")&&sup&&<button className="bp" style={{padding:"4px 10px",fontSize:11}} onClick={()=>setShowOrderModal({supplierId:sup.id,supplierName:sup.name,leadDays:sup.leadDays,categories:sup.categories,prefill:product.name})}>Order from {sup.name}</button>}
                      {(type==="critical"||type==="warning")&&product&&<button className="bp" style={{padding:"4px 10px",fontSize:11,background:col}} onClick={()=>{updateProduct(a.id,{price:parseFloat((product.price*.8).toFixed(2)),tag:{synced:false,lastSync:"pending"}});}}>Discount 20%</button>}
                      {product&&<button className="bg" style={{padding:"4px 10px",fontSize:11}} onClick={()=>addStock(a.id,20)}>+20 stock</button>}
                    </div>
                  </div>);
                })}
              </div>);
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showBarcodeUI&&<BarcodeModal onScan={handleBarcodeScan} onClose={()=>setShowBarcodeUI(false)}/>}
      {showAddModal&&<AddProductModal onAdd={addProduct} onClose={()=>setShowAddModal(false)}/>}
      {showTagModal&&(
        <div className="modal-bg" onClick={()=>setShowTagModal(null)}>
          <div className="modal" style={{width:340}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:14}}>Tag Preview — {showTagModal.name}</div>
            <div style={{background:"#f5f0e8",color:"#111",borderRadius:8,fontFamily:DF,position:"relative",overflow:"hidden",padding:20,boxShadow:`0 0 0 2px ${showTagModal.tag.synced?C.green:C.red}`}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#111"}}/>
              <div style={{fontSize:9,color:"#888",letterSpacing:".1em",marginTop:8,marginBottom:8}}>{showTagModal.sku} · {showTagModal.category.toUpperCase()}</div>
              <div style={{fontSize:15,fontWeight:700,color:"#111",marginBottom:7}}>{showTagModal.name}</div>
              <div style={{fontSize:11,color:"#555",marginBottom:12,lineHeight:1.5}}>{showTagModal.description}</div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #ddd",paddingTop:12}}>
                <span style={{fontSize:30,fontWeight:700,color:"#111"}}>${showTagModal.price.toFixed(2)}</span>
                <div style={{textAlign:"right",fontSize:10,color:"#888"}}><div>Stock: {showTagModal.stock}</div><div style={{marginTop:3,color:SC[expiryStatus(daysUntil(showTagModal.addedDate,showTagModal.expiryDays))]}}>{daysUntil(showTagModal.addedDate,showTagModal.expiryDays)}d left</div></div>
              </div>
            </div>
            <div style={{marginTop:14,display:"flex",justifyContent:"flex-end",gap:8}}>
              <button className="bg" onClick={()=>setShowTagModal(null)}>Close</button>
              <button className="bp" onClick={()=>{syncTag(showTagModal.id);setShowTagModal(null);}}>Push to Tag</button>
            </div>
          </div>
        </div>
      )}
      {showOrderModal!==null&&<OrderModal initial={showOrderModal} products={products} suppliers={suppliers} onPlace={placeOrder} onClose={()=>setShowOrderModal(null)}/>}
      {showOrderDetail&&<OrderDetailModal order={showOrderDetail} suppliers={suppliers} onClose={()=>setShowOrderDetail(null)} onCancel={cancelOrder} onReceive={receiveOrder}/>}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-bg" onClick={() => setShowCheckout(false)}>
          <div className="modal" style={{width: '600px'}} onClick={e => e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:500,marginBottom:16}}>Checkout</div>
            
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Cart Items</div>
              {cart.map(item => {
                const itemImage = item.imageUrl || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.name + ' product photo, professional food photography, white background')}&image_size=square`;
                return (
                  <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:40,height:40,borderRadius:6,overflow:"hidden",background:C.surface}}>
                        <img src={itemImage} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:500}}>{item.name}</div>
                        <div style={{fontSize:11,color:C.muted}}>${item.unitPrice.toFixed(2)} × {item.qty}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{display:'flex',gap:4,alignItems:'center'}}>
                        <button 
                          className="bg" 
                          style={{padding:'2px 8px',fontSize:12}}
                          onClick={() => updateCartQty(item.id, item.qty - 1)}
                        >-</button>
                        <span style={{fontSize:12}}>{item.qty}</span>
                        <button 
                          className="bg" 
                          style={{padding:'2px 8px',fontSize:12}}
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                        >+</button>
                      </div>
                      <span style={{fontSize:13,fontWeight:500}}>${(item.unitPrice * item.qty).toFixed(2)}</span>
                      <button 
                        className="bg" 
                        style={{padding:'2px 8px',fontSize:12,color:C.red,borderColor:`${C.red}44`}}
                        onClick={() => removeFromCart(item.id)}
                      >✕ Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderTop:`1px solid ${C.border}`,marginBottom:16}}>
              <span style={{fontSize:14,fontWeight:500}}>Total</span>
              <span style={{fontSize:22,fontWeight:500,color:C.green}}>${cartTotal.toFixed(2)}</span>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Payment Method</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {[...userPaymentMethods, 'Add New Card'].map(method => (
                  <button 
                    key={method}
                    className="bg"
                    style={{padding:'10px 16px',fontSize:12,flex:1}}
                    onClick={() => placeMarketplaceOrder(method === 'Add New Card' ? 'New Card' : method)}
                  >
                    {method === 'Add New Card' ? method : `Pay with ${method}`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button className="bg" onClick={() => setShowCheckout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment/Receipt Modal */}
      {showPaymentModal && (
        <div className="modal-bg" onClick={() => setShowPaymentModal(null)}>
          <div className="modal" style={{width: '500px'}} onClick={e => e.stopPropagation()}>
            {showPaymentModal.type === 'subscribe' || showPaymentModal.type === 'change-plan' ? (
              <div>
                <div style={{fontSize:16,fontWeight:500,marginBottom:16}}>
                  {showPaymentModal.type === 'subscribe' ? 'Subscribe to' : 'Change to'} {showPaymentModal.plan?.name}
                </div>
                
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Plan Details</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:500}}>{showPaymentModal.plan?.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>Billed {showPaymentModal.type === 'subscribe' ? 'monthly' : userSubscription?.billingCycle || 'monthly'}</div>
                    </div>
                    <div style={{fontSize:20,fontWeight:500,color:C.green}}>
                      ${showPaymentModal.plan?.monthly}
                    </div>
                  </div>
                </div>

                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Payment Method</div>
                  <input placeholder="Card Number" style={{marginBottom:8}} />
                  <div style={{display:'flex',gap:8,marginBottom:8}}>
                    <input placeholder="MM/YY" style={{flex:1}} />
                    <input placeholder="CVC" style={{flex:1}} />
                  </div>
                </div>

                <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                  <button className="bg" onClick={() => setShowPaymentModal(null)}>Cancel</button>
                  <button 
                    className="bp" 
                    onClick={() => {
                      if (showPaymentModal.type === 'subscribe') {
                        createSubscription(session.user.id, showPaymentModal.plan.id, 'monthly');
                      } else {
                        updateSubscription(userSubscription.id, showPaymentModal.plan.id);
                      }
                      // Record payment
                      const newPayment = {
                        id: `pay-${Date.now()}`,
                        userId: session.user.id,
                        amount: showPaymentModal.plan.monthly,
                        type: 'subscription',
                        status: 'completed',
                        date: new Date().toISOString(),
                        method: userPaymentMethods[0] || 'Visa ending in 4242'
                      };
                      setPayments(prev => [...prev, newPayment]);
                      setShowPaymentModal(null);
                      toast('Subscription updated!');
                    }}
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:16,fontWeight:500,marginBottom:16,textAlign:'center'}}>
                  🧾 Receipt
                </div>
                
                <div style={{padding:'16px',background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{fontSize:12,color:C.muted}}>Receipt ID</span>
                    <span style={{fontFamily:DF,fontSize:12}}>{showPaymentModal.id}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{fontSize:12,color:C.muted}}>Date</span>
                    <span style={{fontSize:12}}>{new Date(showPaymentModal.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{fontSize:12,color:C.muted}}>Type</span>
                    <span style={{fontSize:12,textTransform:'capitalize'}}>{showPaymentModal.type}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{fontSize:12,color:C.muted}}>Payment Method</span>
                    <span style={{fontSize:12}}>{showPaymentModal.method}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                    <span style={{fontSize:13,fontWeight:500}}>Total</span>
                    <span style={{fontSize:18,fontWeight:500,color:C.green}}>${showPaymentModal.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{display:'flex',justifyContent:'center',gap:8}}>
                  <button 
                    className="bp" 
                    onClick={() => {
                      const receiptText = `
ShelfOS Receipt
───────────────────────────────
Receipt ID: ${showPaymentModal.id}
Date: ${new Date(showPaymentModal.date).toLocaleDateString()}
Type: ${showPaymentModal.type.toUpperCase()}
Payment Method: ${showPaymentModal.method}
───────────────────────────────
Total: $${showPaymentModal.amount.toFixed(2)}
───────────────────────────────
Thank you for your payment!
                      `.trim();
                      
                      const blob = new Blob([receiptText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `receipt-${showPaymentModal.id}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      toast('Receipt downloaded!');
                    }}
                    style={{background:C.accent}}
                  >
                    Download Receipt
                  </button>
                  <button className="bg" onClick={() => setShowPaymentModal(null)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ ORDER MANAGEMENT */
function OrderManagement({orders, suppliers, products, onPlace, onCancel, onReceive, onDetail, toast}){
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSup, setFilterSup]       = useState("all");
  const [searchQ, setSearchQ]           = useState("");
  const [showNew, setShowNew]           = useState(false);
  const [sortKey, setSortKey]           = useState("placedAt");

  const filtered = orders
    .filter(o=>filterStatus==="all"||o.status===filterStatus)
    .filter(o=>filterSup==="all"||o.supplierId===filterSup)
    .filter(o=>o.id.toLowerCase().includes(searchQ.toLowerCase())||o.supplierName.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a,b)=>sortKey==="total"?b.total-a.total:new Date(b.placedAt)-new Date(a.placedAt));

  const totals={
    spend: orders.filter(o=>o.status!=="cancelled").reduce((a,o)=>a+(o.total||0),0),
    pending: orders.filter(o=>o.status==="pending").length,
    inTransit: orders.filter(o=>o.status==="in-transit").length,
    delivered: orders.filter(o=>o.status==="delivered").length,
  };

  return(
    <div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[{label:"Total Spend",val:`$${totals.spend.toFixed(2)}`,color:C.green},{label:"Pending",val:totals.pending,color:C.amber},{label:"In Transit",val:totals.inTransit,color:C.accent},{label:"Delivered",val:totals.delivered,color:C.green}].map(s=>(
          <div key={s.label} className="sc"><div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6}}>{s.label}</div><div style={{fontSize:24,fontWeight:500,color:s.color}}>{s.val}</div></div>
        ))}
      </div>

      {/* Filters & actions */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input placeholder="Search orders…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{width:200}}/>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:140}}>
          <option value="all">All Status</option>
          {ORDER_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSup} onChange={e=>setFilterSup(e.target.value)} style={{width:160}}>
          <option value="all">All Suppliers</option>
          {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={sortKey} onChange={e=>setSortKey(e.target.value)} style={{width:130}}>
          <option value="placedAt">Newest first</option>
          <option value="total">Highest value</option>
        </select>
        <button className="bp" style={{marginLeft:"auto",padding:"9px 16px",fontSize:12}} onClick={()=>setShowNew(true)}>+ New Order</button>
      </div>

      {/* Order cards */}
      {filtered.length===0
        ?<div style={{textAlign:"center",padding:60,color:C.muted}}><div style={{fontSize:24,marginBottom:8}}>📦</div><div>No orders match your filters.</div></div>
        :<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(o=>(
            <div key={o.id} className="card" style={{padding:18,borderLeft:`3px solid ${ORDER_STATUS_COLOR[o.status]}`,cursor:"pointer"}} onClick={()=>onDetail(o)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontFamily:DF,fontSize:11,color:C.muted}}>{o.id}</span>
                  <span className="pill" style={{background:`${ORDER_STATUS_COLOR[o.status]}22`,color:ORDER_STATUS_COLOR[o.status]}}>{o.status}</span>
                  <span className="pill" style={{background:`${PRIORITY_COLOR[o.priority]||C.muted}22`,color:PRIORITY_COLOR[o.priority]||C.muted}}>⚑ {o.priority||"normal"}</span>
                  {o.notes&&<span style={{fontSize:11,color:C.amber}}>📝 {o.notes.slice(0,30)}</span>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:500,color:C.green}}>${o.total?.toFixed(2)}</div>
                  <div style={{fontSize:11,color:C.muted}}>ETA: {o.eta}</div>
                </div>
              </div>
              <div style={{fontSize:13,marginBottom:8}}><span style={{fontWeight:500}}>{o.supplierName}</span> <span style={{color:C.muted}}>· {o.items?.length} items · {o.items?.reduce((a,i)=>a+parseInt(i.qty||0),0)} units</span></div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                {o.items?.slice(0,3).map((item,i)=>(
                  <span key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 10px",fontSize:11}}>
                    {item.name} ×{item.qty}
                  </span>
                ))}
                {o.items?.length>3&&<span style={{fontSize:11,color:C.muted,padding:"3px 8px"}}>+{o.items.length-3} more</span>}
              </div>
              <OrderTimeline status={o.status}/>
              <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
                {o.status==="in-transit"&&<button className="bp" style={{padding:"6px 13px",fontSize:12,background:C.green}} onClick={()=>onReceive(o.id)}>Mark Received</button>}
                {(o.status==="pending"||o.status==="confirmed")&&<button className="bg" style={{padding:"6px 13px",fontSize:12,color:C.red,borderColor:`${C.red}44`}} onClick={()=>onCancel(o.id)}>Cancel</button>}
                <button className="bg" style={{padding:"6px 13px",fontSize:12}} onClick={()=>onDetail(o)}>View details →</button>
              </div>
            </div>
          ))}
        </div>
      }

      {showNew&&<OrderModal initial={{}} products={products} suppliers={suppliers} onPlace={onPlace} onClose={()=>setShowNew(false)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ ORDER DETAIL MODAL */
function OrderDetailModal({order, suppliers, onClose, onCancel, onReceive}){
  const sup=suppliers.find(s=>s.id===order.supplierId);
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width:620}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Order {order.id}</div>
            <div style={{display:"flex",gap:8}}>
              <span className="pill" style={{background:`${ORDER_STATUS_COLOR[order.status]}22`,color:ORDER_STATUS_COLOR[order.status]}}>{order.status}</span>
              <span className="pill" style={{background:`${PRIORITY_COLOR[order.priority]||C.muted}22`,color:PRIORITY_COLOR[order.priority]||C.muted}}>⚑ {order.priority||"normal"}</span>
            </div>
          </div>
          <div style={{fontSize:22,fontWeight:500,color:C.green}}>${order.total?.toFixed(2)}</div>
        </div>

        <OrderTimeline status={order.status}/>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"16px 0"}}>
          {[["Supplier",sup?.name||order.supplierName],["Contact",sup?.contact||"—"],["Lead Time",`${order.leadDays||sup?.leadDays||"?"} days`],["ETA",order.eta],["Placed",new Date(order.placedAt).toLocaleDateString()],["Priority",order.priority||"normal"]].map(([k,v])=>(
            <div key={k} style={{padding:"10px 14px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:3}}>{k}</div>
              <div style={{fontSize:13}}>{v}</div>
            </div>
          ))}
        </div>

        {order.courier&&(
          <div style={{background:`${C.accent}11`,border:`1px solid ${C.accent}33`,borderRadius:8,padding:"14px",marginBottom:14}}>
            <div style={{fontSize:11,color:C.accent,letterSpacing:".07em",textTransform:"uppercase",marginBottom:10}}>📦 Courier Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:13}}>
              <div><span style={{color:C.muted}}>Name:</span> {order.courier.name}</div>
              <div><span style={{color:C.muted}}>Phone:</span> <a href={`tel:${order.courier.phone}`} style={{color:C.accent,textDecoration:"underline"}}>{order.courier.phone}</a></div>
              <div><span style={{color:C.muted}}>Company:</span> {order.courier.company}</div>
              <div><span style={{color:C.muted}}>Tracking:</span> {order.courier.trackingNumber}</div>
            </div>
            {order.courier.estimatedDelivery&&(
              <div style={{marginTop:10,padding:8,background:`${C.accent}22`,borderRadius:6,textAlign:"center"}}>
                <span style={{color:C.accent,fontSize:13}}>Estimated Delivery: {order.courier.estimatedDelivery}</span>
              </div>
            )}
            <div style={{marginTop:10,fontSize:11,color:C.muted,textAlign:"center"}}>
              Contact courier to arrange delivery address and time
            </div>
          </div>
        )}

        {order.notes&&(
          <div style={{background:`${C.amber}11`,border:`1px solid ${C.amber}33`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.amber}}>
            📝 {order.notes}
          </div>
        )}

        <div style={{fontSize:11,color:C.muted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:10}}>Order items</div>
        <div style={{marginBottom:16}}>
          {order.items?.map((item,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:500}}>{item.name}</div>
              <div style={{display:"flex",gap:20,fontSize:13}}>
                <span style={{color:C.muted}}>×{item.qty} units</span>
                <span style={{color:C.muted}}>@${parseFloat(item.unitPrice||0).toFixed(2)}</span>
                <span style={{fontWeight:500,color:C.green}}>${(parseInt(item.qty||0)*parseFloat(item.unitPrice||0)).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderTop:`2px solid ${C.border}`,marginTop:4,fontSize:14,fontWeight:500}}>
            <span>Total</span><span style={{color:C.green}}>${order.total?.toFixed(2)}</span>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
          <div style={{display:"flex",gap:7}}>
            {order.status==="in-transit"&&<button className="bp" style={{background:C.green}} onClick={()=>{onReceive(order.id);onClose();}}>✓ Mark Received</button>}
            {(order.status==="pending"||order.status==="confirmed")&&<button className="bg" style={{color:C.red,borderColor:`${C.red}44`}} onClick={()=>{onCancel(order.id);onClose();}}>Cancel Order</button>}
          </div>
          <button className="bg" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ ORDER FORM MODAL */
function OrderModal({initial, products, suppliers, onPlace, onClose}){
  const [supplierId, setSupplierId] = useState(initial.supplierId||suppliers[0].id);
  const [items, setItems] = useState(initial.prefill?[{name:initial.prefill,qty:20,unitPrice:(products.find(p=>p.name===initial.prefill)?.price||5).toFixed(2)}]:[{name:"",qty:20,unitPrice:"5.00"}]);
  const [notes, setNotes]     = useState("");
  const [priority, setPriority] = useState("normal");
  const sup=suppliers.find(s=>s.id===supplierId);
  const total=items.reduce((a,i)=>a+(parseFloat(i.qty||0)*parseFloat(i.unitPrice||0)),0);
  function setItem(idx,k,v){setItems(it=>it.map((i,j)=>j===idx?{...i,[k]:v}:i));}
  function autofill(idx,name){
    const prod=products.find(p=>p.name===name);
    if(prod) setItem(idx,"unitPrice",prod.price.toFixed(2));
  }
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:14,fontWeight:500,marginBottom:18}}>New Purchase Order</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:5}}>Supplier</div>
          <select value={supplierId} onChange={e=>setSupplierId(e.target.value)}>
            {suppliers.map(s=><option key={s.id} value={s.id}>{s.name} — {s.leadDays}d lead · ★{s.rating}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:C.muted,marginBottom:5}}>Priority</div>
            <div style={{display:"flex",gap:6}}>
              {["low","normal","high"].map(p=>(
                <button key={p} onClick={()=>setPriority(p)} style={{flex:1,padding:"7px",borderRadius:7,border:`1px solid ${priority===p?PRIORITY_COLOR[p]:C.border2}`,background:priority===p?`${PRIORITY_COLOR[p]}18`:"none",color:priority===p?PRIORITY_COLOR[p]:C.muted,fontSize:12,textTransform:"capitalize"}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:C.muted,marginBottom:5}}>Notes for supplier</div>
            <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Refrigerated truck required"/>
          </div>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Order items</div>
        {items.map((item,idx)=>(
          <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 75px 85px 28px",gap:7,marginBottom:7}}>
            <input list="prod-list" placeholder="Product name" value={item.name} onChange={e=>{setItem(idx,"name",e.target.value);autofill(idx,e.target.value);}}/>
            <input type="number" placeholder="Qty" value={item.qty} onChange={e=>setItem(idx,"qty",e.target.value)}/>
            <input type="number" placeholder="$ each" step="0.01" value={item.unitPrice} onChange={e=>setItem(idx,"unitPrice",e.target.value)}/>
            <button onClick={()=>setItems(it=>it.filter((_,j)=>j!==idx))} style={{background:"none",border:"none",color:C.muted,fontSize:16}}>×</button>
          </div>
        ))}
        <datalist id="prod-list">{products.map(p=><option key={p.id} value={p.name}/>)}</datalist>
        <button className="bg" style={{fontSize:12,marginBottom:14}} onClick={()=>setItems(it=>[...it,{name:"",qty:20,unitPrice:"5.00"}])}>+ Add item</button>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,color:C.muted}}>ETA: {sup?.leadDays}d · {sup?.contact}</div>
          <div style={{fontSize:15,fontWeight:500}}>Total: <span style={{color:C.green}}>${total.toFixed(2)}</span></div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
          <button className="bg" onClick={onClose}>Cancel</button>
          <button className="bp" onClick={()=>onPlace({supplierId,supplierName:sup.name,leadDays:sup.leadDays,items,total,notes,priority})}>Place Order</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ SCANNER HOOK */
function useBarcodeScanner({onScan, enabled=true}){
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanBuffer, setScanBuffer] = useState("");
  const [scanTimeout, setScanTimeout] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (scanBuffer.length >= 8 && scanBuffer.length <= 14) {
          const barcode = scanBuffer;
          setLastScan({code: barcode, time: Date.now()});
          onScan?.(barcode);
          setScannerActive(true);
          setTimeout(() => setScannerActive(false), 500);
        }
        setScanBuffer("");
        if (scanTimeout) clearTimeout(scanTimeout);
        return;
      }

      if (/^[0-9A-Za-z]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        setScanBuffer(prev => prev + e.key);
        
        if (scanTimeout) clearTimeout(scanTimeout);
        const timeout = setTimeout(() => setScanBuffer(""), 1000);
        setScanTimeout(timeout);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (scanTimeout) clearTimeout(scanTimeout);
    };
  }, [enabled, onScan, scanBuffer, scanTimeout]);

  return { scannerActive, lastScan };
}

/* ═══════════════════════════════════════════════════════════ BARCODE MODAL */
function BarcodeModal({onScan,onClose}){
  const [input,setInput]=useState("");
  const [scanning,setScanning]=useState(false);
  const [result,setResult]=useState(null);
  function doScan(code){
    if(!code) return;
    setScanning(true);setResult(null);
    setTimeout(()=>{setResult(BARCODE_DB[code]?{...BARCODE_DB[code],code}:{error:true,code});setScanning(false);},900);
  }
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width:440}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:13,fontWeight:500,marginBottom:14}}>Barcode Scanner</div>
        <div style={{border:`2px dashed ${C.accent}`,borderRadius:10,padding:28,textAlign:"center",position:"relative",overflow:"hidden",marginBottom:14}}>
          {scanning&&<div style={{position:"absolute",left:0,right:0,height:2,background:C.accent,opacity:.7,animation:"scanMove 2s ease-in-out infinite",top:"50%"}}/>}
          <style>{"@keyframes scanMove{0%{top:20%}50%{top:80%}100%{top:20%}}"}</style>
          <div style={{fontSize:28,marginBottom:6,opacity:scanning?.5:1}}>▦</div>
          <div style={{fontSize:12,color:C.muted}}>{scanning?"Scanning…":"Enter barcode or simulate a scan"}</div>
        </div>
        {result&&(
          <div style={{marginBottom:12,padding:12,borderRadius:8,background:result.error?`${C.red}11`:`${C.green}11`,border:`1px solid ${result.error?`${C.red}33`:`${C.green}33`}`}}>
            {result.error?<div style={{fontSize:13,color:C.red}}>✗ Not found: {result.code}</div>
              :<div><div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{result.name}</div><div style={{fontSize:11,color:C.muted}}>{result.category} · ${result.price.toFixed(2)} · {result.expiryDays}d shelf life</div></div>}
          </div>
        )}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input placeholder="Enter barcode…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doScan(input)} style={{flex:1}}/>
          <button className="bp" style={{whiteSpace:"nowrap",padding:"8px 12px",fontSize:12}} onClick={()=>doScan(input)}>Scan</button>
        </div>
        <div style={{fontSize:11,color:"#444",marginBottom:12}}>Samples: {BARCODES.slice(0,2).join(" · ")}</div>
        <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
          <button className="bg" style={{fontSize:12}} onClick={()=>{const c=BARCODES[Math.floor(Math.random()*BARCODES.length)];setInput(c);doScan(c);}}>⟳ Random scan</button>
          <div style={{display:"flex",gap:8}}>
            <button className="bg" onClick={onClose}>Cancel</button>
            {result&&!result.error&&<button className="bp" onClick={()=>onScan(result.code)}>Add / Restock</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ ADD PRODUCT MODAL */
function AddProductModal({onAdd,onClose}){
  const [form,setForm]=useState({name:"",category:"Produce",sku:"",barcode:"",price:"",stock:"",minStock:"10",expiryDays:"7",description:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:13,fontWeight:500,marginBottom:14}}>Add New Product</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          {[["Product Name","name","text","1/-1"],["Barcode","barcode","text"],["SKU","sku","text"],["Category","category","select"],["Price ($)","price","number"],["Stock","stock","number"],["Min Stock","minStock","number"],["Shelf Life (days)","expiryDays","number"]].map(([label,key,type,span])=>(
            <div key={key} style={{gridColumn:span||"auto"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{label}</div>
              {type==="select"?<select value={form[key]} onChange={e=>set(key,e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
                :<input type={type} value={form[key]} onChange={e=>set(key,e.target.value)}/>}
            </div>
          ))}
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Description (shown on tag)</div>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={2} style={{resize:"vertical"}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
          <button className="bg" onClick={onClose}>Cancel</button>
          <button className="bp" onClick={()=>{if(form.name&&form.price&&form.stock)onAdd(form);}}>Add Product</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ CHARTS */
function BarChart({data,labels,color,prefix=""}){
  const max=Math.max(...data,1);
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:130}}>
      {data.map((v,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <span style={{fontSize:10,color:C.muted}}>{prefix}{v>=1000?`${(v/1000).toFixed(1)}k`:v}</span>
          <div style={{width:"100%",background:color,borderRadius:"3px 3px 0 0",height:`${Math.round((v/max)*96)}px`,opacity:.85,transition:"height .4s"}}/>
          <span style={{fontSize:10,color:C.muted}}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
