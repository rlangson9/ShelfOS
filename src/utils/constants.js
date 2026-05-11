export const F = "'DM Mono', monospace";
export const DF = "'Space Mono', monospace";

export const C = {
  bg:"#07070d", surface:"#0f0f1a", card:"#131320", border:"#1c1c2e", border2:"#2a2a3f",
  text:"#e8e8f4", muted:"#5a5a7a", dim:"#252535", accent:"#5a5aff", accent2:"#7c7cff",
  green:"#2ecc71", amber:"#f39c12", red:"#e74c3c", yellow:"#f1c40f", pink:"#e91e8c",
};

export const SC = { critical:C.red, warning:C.amber, soon:C.yellow, ok:C.green, out:C.red, low:C.amber };

export const CATS = [
  "Produce","Dairy","Meat","Poultry","Seafood","Bakery","Frozen","Beverages",
  "Pantry","Snacks","Candy","Condiments","Canned Goods","Dry Goods",
  "Paper Goods","Cleaning Supplies","Health & Beauty","Baby","Pet Care",
  "Household","Floral","Alcohol","Tobacco"
];

export const ORDER_STATUSES = ["pending","confirmed","processing","in-transit","delivered","cancelled"];

export const ORDER_STATUS_COLOR = { 
  pending:C.muted, 
  confirmed:C.accent, 
  processing:C.yellow, 
  "in-transit":C.amber, 
  delivered:C.green, 
  cancelled:C.red 
};

export const PRIORITY_COLOR = { high:C.red, normal:C.accent, low:C.muted };

export const WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];