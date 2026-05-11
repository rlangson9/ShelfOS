import { daysAgo, getProductImageUrl } from './helpers';

export const STORES_SEED = [
  { id:"s1", name:"Downtown Flagship", city:"New York, NY",    manager:"Alex Kim",    active:true,  revenue:24100 },
  { id:"s2", name:"Westside Market",   city:"Los Angeles, CA", manager:"Sam Lee",     active:true,  revenue:18200 },
  { id:"s3", name:"Northgate Fresh",   city:"Chicago, IL",     manager:"Jordan Park", active:true,  revenue:15400 },
];

export const SUPPLIERS_SEED = [
  { id:"sup1", name:"FreshFarm Co.",   contact:"orders@freshfarm.com",   phone:"(212)555-0101", leadDays:2, rating:4.8, categories:["Produce","Dairy","Floral"],     active:true },
  { id:"sup2", name:"MeatWorks LLC",   contact:"supply@meatworks.com",   phone:"(213)555-0202", leadDays:1, rating:4.6, categories:["Meat","Poultry","Seafood"],     active:true },
  { id:"sup3", name:"BakeryDirect",    contact:"hello@bakerydirect.com", phone:"(312)555-0303", leadDays:1, rating:4.9, categories:["Bakery","Snacks"],              active:true },
  { id:"sup4", name:"ColdChain Dist.", contact:"ops@coldchain.com",      phone:"(415)555-0404", leadDays:3, rating:4.5, categories:["Frozen","Beverages","Alcohol"], active:true },
  { id:"sup5", name:"Pantry Plus",     contact:"bulk@pantryplus.com",    phone:"(718)555-0505", leadDays:4, rating:4.3, categories:["Pantry","Condiments","Canned Goods","Dry Goods"], active:true },
  { id:"sup6", name:"Household Essentials", contact:"support@householdessentials.com", phone:"(718)555-0606", leadDays:2, rating:4.2, categories:["Paper Goods","Cleaning Supplies","Health & Beauty","Household"], active:true },
  { id:"sup7", name:"Family Care Products", contact:"info@familycare.com", phone:"(305)555-0707", leadDays:3, rating:4.4, categories:["Baby","Pet Care","Snacks","Candy"], active:true },
  { id:"sup8", name:"Tobacco & Specialty", contact:"orders@tobaccospecialty.com", phone:"(202)555-0808", leadDays:5, rating:4.1, categories:["Tobacco"], active:true },
];

export const USERS_SEED = [
  { id:"u1", role:"store",    name:"Alex Kim",    email:"alex@downtown.com",   password:"store123",  storeId:"s1",   status:"active", subscriptionId:"sub1", paymentMethods: ["Visa ending in 4242", "Mastercard ending in 5555"] },
  { id:"u2", role:"store",    name:"Sam Lee",     email:"sam@westside.com",    password:"store123",  storeId:"s2",   status:"active", subscriptionId:"sub1", paymentMethods: ["Visa ending in 1111"] },
  { id:"u3", role:"store",    name:"Jordan Park", email:"jordan@northgate.com",password:"store123",  storeId:"s3",   status:"active", subscriptionId:"sub2", paymentMethods: ["Amex ending in 9876"] },
  { id:"u4", role:"supplier", name:"FreshFarm Co.",   email:"orders@freshfarm.com",   password:"sup123", supplierId:"sup1", status:"active" },
  { id:"u5", role:"supplier", name:"MeatWorks LLC",   email:"supply@meatworks.com",   password:"sup123", supplierId:"sup2", status:"active" },
  { id:"u6", role:"supplier", name:"BakeryDirect",    email:"hello@bakerydirect.com", password:"sup123", supplierId:"sup3", status:"active" },
  { id:"u7", role:"admin",    name:"Super Admin",     email:"admin@shelfos.com",      password:"admin123",status:"active" },
];

export const PRICING_PLANS = [
  { id:"basic",    name:"Basic",     monthly:29,   yearly:299,  stores:1, features:["Inventory management","Basic analytics","Email support"],     color:"#5a5aff" },
  { id:"pro",      name:"Pro",       monthly:79,   yearly:799,  stores:5, features:["All Basic features","Multi-store management","Priority support","API access"], color:"#2ecc71" },
  { id:"enterprise", name:"Enterprise", monthly:199, yearly:1999, stores:null, features:["Unlimited stores","Dedicated support","Custom integrations","SLA guarantee"], color:"#e91e8c" },
];

export const SUBSCRIPTIONS_SEED = [
  { id:"sub1", userId:"u1", planId:"pro", billingCycle:"monthly", amount:79, startDate:daysAgo(30), nextBillingDate:new Date().toISOString(), status:"active", paymentMethod:"Visa ending in 4242" },
  { id:"sub2", userId:"u2", planId:"basic", billingCycle:"yearly", amount:299, startDate:daysAgo(180), nextBillingDate:daysAgo(-180), status:"active", paymentMethod:"Mastercard ending in 5555" },
  { id:"sub3", userId:"u3", planId:"pro", billingCycle:"monthly", amount:79, startDate:daysAgo(7), nextBillingDate:new Date().toISOString(), status:"active", paymentMethod:"Visa ending in 1111" },
];

export const BARCODE_DB = {
  "012345678901":{ name:"Organic Whole Milk",     category:"Dairy",    price:3.49,  expiryDays:7,   description:"Fresh organic whole milk, 1 gallon" },
  "098765432109":{ name:"Sourdough Bread",        category:"Bakery",   price:5.99,  expiryDays:4,   description:"Artisan sourdough loaf, 800g" },
  "111222333444":{ name:"Atlantic Salmon Fillet", category:"Meat",     price:12.99, expiryDays:2,   description:"Fresh Atlantic salmon, per lb" },
  "444333222111":{ name:"Roma Tomatoes",          category:"Produce",  price:1.99,  expiryDays:5,   description:"Fresh Roma tomatoes, per lb" },
  "555666777888":{ name:"Greek Yogurt Plain",     category:"Dairy",    price:4.29,  expiryDays:14,  description:"Full-fat Greek yogurt, 32oz" },
  "888777666555":{ name:"Orange Juice",           category:"Beverages",price:3.79,  expiryDays:10,  description:"100% fresh squeezed OJ, 64oz" },
  "123456789012":{ name:"Frozen Peas",            category:"Frozen",   price:2.49,  expiryDays:365, description:"Sweet green peas, frozen, 16oz" },
  "210987654321":{ name:"Free Range Eggs",        category:"Dairy",    price:6.49,  expiryDays:21,  description:"Cage-free large brown eggs, 12ct" },
};

export const BARCODES = Object.keys(BARCODE_DB);

export const SALES = { 
  s1:[4200,3800,4100,4900,5800,7200,6100], 
  s2:[3100,2900,3300,3700,4400,5500,4800], 
  s3:[2600,2400,2800,3100,3700,4600,4000] 
};

export function makeProds(sid) {
  return [
    {id:`${sid}-1`,storeId:sid,name:"Organic Whole Milk",    category:"Dairy",   sku:"DAI-001",barcode:"012345678901",price:3.49, stock:42,minStock:15,expiryDays:7,  addedDate:daysAgo(2),description:"Fresh organic whole milk, 1 gallon",  tag:{synced:true, lastSync:"2m ago"}, supplierId:"sup1", imageUrl: getProductImageUrl("Organic Whole Milk")},
    {id:`${sid}-2`,storeId:sid,name:"Sourdough Bread",       category:"Bakery",  sku:"BAK-007",barcode:"098765432109",price:5.99, stock:18,minStock:10,expiryDays:4,  addedDate:daysAgo(1),description:"Artisan sourdough loaf, 800g",        tag:{synced:true, lastSync:"5m ago"}, supplierId:"sup3", imageUrl: getProductImageUrl("Sourdough Bread")},
    {id:`${sid}-3`,storeId:sid,name:"Atlantic Salmon Fillet",category:"Seafood", sku:"SEA-023",barcode:"111222333444",price:12.99,stock:8, minStock:12,expiryDays:2,  addedDate:daysAgo(3),description:"Fresh Atlantic salmon, per lb",       tag:{synced:false,lastSync:"2h ago"},supplierId:"sup2", imageUrl: getProductImageUrl("Atlantic Salmon Fillet")},
    {id:`${sid}-4`,storeId:sid,name:"Roma Tomatoes",         category:"Produce", sku:"PRO-041",barcode:"444333222111",price:1.99, stock:65,minStock:20,expiryDays:5,  addedDate:daysAgo(1),description:"Fresh Roma tomatoes, per lb",         tag:{synced:true, lastSync:"1m ago"}, supplierId:"sup1", imageUrl: getProductImageUrl("Roma Tomatoes")},
    {id:`${sid}-5`,storeId:sid,name:"Greek Yogurt Plain",    category:"Dairy",   sku:"DAI-012",barcode:"555666777888",price:4.29, stock:30,minStock:20,expiryDays:14, addedDate:daysAgo(0),description:"Full-fat Greek yogurt, 32oz",        tag:{synced:true, lastSync:"8m ago"}, supplierId:"sup1", imageUrl: getProductImageUrl("Greek Yogurt Plain")},
    {id:`${sid}-6`,storeId:sid,name:"Frozen Peas",           category:"Frozen",  sku:"FRZ-003",barcode:"123456789012",price:2.49, stock:55,minStock:25,expiryDays:365,addedDate:daysAgo(10),description:"Sweet green peas, frozen, 16oz",   tag:{synced:false,lastSync:"1d ago"}, supplierId:"sup4", imageUrl: getProductImageUrl("Frozen Peas")},
    {id:`${sid}-7`,storeId:sid,name:"Orange Juice",          category:"Beverages",sku:"BEV-019",barcode:"888777666555",price:3.79,stock:28,minStock:15,expiryDays:10, addedDate:daysAgo(3),description:"100% fresh squeezed OJ, 64oz",      tag:{synced:true, lastSync:"3m ago"}, supplierId:"sup4", imageUrl: getProductImageUrl("Orange Juice")},
    {id:`${sid}-8`,storeId:sid,name:"Free Range Eggs",       category:"Dairy",   sku:"DAI-005",barcode:"210987654321",price:6.49, stock:5, minStock:10,expiryDays:21, addedDate:daysAgo(5),description:"Cage-free large brown eggs, 12ct", tag:{synced:true, lastSync:"11m ago"},supplierId:"sup1", imageUrl: getProductImageUrl("Free Range Eggs")},
  ];
}

export const CATALOG_SEED = [
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

export const SEED_ORDERS = [
  {id:"ORD-1001",storeId:"s1",supplierId:"sup1",supplierName:"FreshFarm Co.",status:"delivered",placedAt:daysAgo(5),eta:"3 days ago",total:284.50,items:[{name:"Organic Whole Milk",qty:40,unitPrice:3.49},{name:"Greek Yogurt Plain",qty:30,unitPrice:4.29}],notes:"Urgent restock",priority:"high",courier:{name:"Mike Johnson",phone:"(212) 555-1234",company:"Express Delivery Co.",trackingNumber:"TRK789456123",estimatedDelivery:"Tomorrow"}},
  {id:"ORD-1002",storeId:"s1",supplierId:"sup2",supplierName:"MeatWorks LLC",status:"in-transit",placedAt:daysAgo(2),eta:"Tomorrow",total:519.60,items:[{name:"Atlantic Salmon Fillet",qty:40,unitPrice:12.99}],notes:"",priority:"normal",courier:{name:"Sarah Williams",phone:"(213) 555-8765",company:"Fresh Freight Services",trackingNumber:"TRK123456789",estimatedDelivery:"Tomorrow"}},
  {id:"ORD-1003",storeId:"s2",supplierId:"sup1",supplierName:"FreshFarm Co.",status:"pending",placedAt:daysAgo(1),eta:"In 2 days",total:147.40,items:[{name:"Roma Tomatoes",qty:50,unitPrice:1.99},{name:"Greek Yogurt Plain",qty:20,unitPrice:4.29}],notes:"Refrigerated truck",priority:"normal"},
  {id:"ORD-1004",storeId:"s3",supplierId:"sup3",supplierName:"BakeryDirect",status:"confirmed",placedAt:daysAgo(1),eta:"Tomorrow",total:119.80,items:[{name:"Sourdough Bread",qty:20,unitPrice:5.99}],notes:"",priority:"low"},
  {id:"ORD-1005",storeId:"s1",supplierId:"sup4",supplierName:"ColdChain Dist.",status:"pending",placedAt:daysAgo(0),eta:"In 3 days",total:87.30,items:[{name:"Orange Juice",qty:23,unitPrice:3.79}],notes:"",priority:"normal"},
];

export const PAYMENTS_SEED = [
  { id: 'pay-1', userId: 'u1', amount: 79, type: 'subscription', status: 'completed', date: daysAgo(30), method: 'Visa ending in 4242' },
  { id: 'pay-2', userId: 'u2', amount: 299, type: 'subscription', status: 'completed', date: daysAgo(180), method: 'Mastercard ending in 5555' },
  { id: 'pay-3', userId: 'u1', amount: 284.50, type: 'order', status: 'completed', date: daysAgo(5), method: 'Visa ending in 4242' },
];