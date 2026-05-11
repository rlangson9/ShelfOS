export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function daysUntil(added, shelf) {
  const e = new Date(added);
  e.setDate(e.getDate() + shelf);
  return Math.ceil((e - new Date()) / 864e5);
}

export function expiryStatus(d) {
  return d <= 1 ? "critical" : d <= 3 ? "warning" : d <= 7 ? "soon" : "ok";
}

export function stockStatus(s, m) {
  return s === 0 ? "out" : s < m ? "low" : "ok";
}

export function getProductImageUrl(name) {
  const encoded = encodeURIComponent(`${name} product photo, professional food photography, white background`);
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encoded}&image_size=square`;
}