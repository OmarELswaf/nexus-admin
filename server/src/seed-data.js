// Deterministic seed data so the dashboard looks identical on every boot.
// All records are fictional demo data.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Maya', 'Omar', 'Lina', 'Karim', 'Sara', 'Adam', 'Nour', 'Hassan', 'Dina', 'Tarek', 'Salma', 'Youssef', 'Farah', 'Mostafa', 'Hoda', 'Ali'];
const LAST = ['Haddad', 'Elsawaf', 'Nasser', 'Fahmy', 'Aziz', 'Mansour', 'Rizk', 'Shawky', 'Gamal', 'Fouad', 'Saad', 'Nabil'];
const PRODUCTS = [
  ['Wireless Headphones', 'Audio', 89], ['Noise-Cancel Earbuds', 'Audio', 59],
  ['Mechanical Keyboard', 'Accessories', 120], ['Ultrawide Monitor', 'Displays', 420],
  ['Standing Desk', 'Furniture', 650], ['Desk Lamp', 'Furniture', 45],
  ['USB-C Hub', 'Accessories', 38], ['Webcam HD', 'Accessories', 75],
  ['Laptop Stand', 'Accessories', 52], ['Bluetooth Speaker', 'Audio', 68],
  ['Ergonomic Chair', 'Furniture', 380], ['Portable SSD 1TB', 'Storage', 110],
  ['Gaming Mouse', 'Accessories', 55], ['4K Action Camera', 'Cameras', 240],
  ['Smartwatch', 'Wearables', 199], ['Phone Gimbal', 'Cameras', 95],
];
const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const STATUS_WEIGHTS = [0.12, 0.22, 0.2, 0.38, 0.08];

function pickWeighted(rand, items, weights) {
  let r = rand();
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function buildSeed() {
  const rand = mulberry32(20261123);
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const products = PRODUCTS.map(([name, category, price], i) => ({
    id: `prd_${1000 + i}`,
    name, category, price,
    stock: 5 + Math.floor(rand() * 200),
    active: rand() > 0.08,
    createdAt: new Date(now - Math.floor(rand() * 300) * day).toISOString(),
  }));

  const customers = [];
  for (let i = 0; i < 60; i++) {
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    customers.push({
      id: `cus_${2000 + i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
    });
  }

  const orders = [];
  for (let i = 0; i < 240; i++) {
    const itemsCount = 1 + Math.floor(rand() * 3);
    const items = [];
    for (let j = 0; j < itemsCount; j++) {
      const p = products[Math.floor(rand() * products.length)];
      items.push({ productId: p.id, name: p.name, qty: 1 + Math.floor(rand() * 3), unitPrice: p.price });
    }
    const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    orders.push({
      id: `ord_${3000 + i}`,
      customer: customers[Math.floor(rand() * customers.length)],
      items,
      total: Math.round(total * 100) / 100,
      status: pickWeighted(rand, ORDER_STATUSES, STATUS_WEIGHTS),
      createdAt: new Date(now - Math.floor(rand() * 90) * day - Math.floor(rand() * day)).toISOString(),
    });
  }
  orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // 90 days of daily revenue + signup series
  const series = [];
  for (let d = 89; d >= 0; d--) {
    const weekday = new Date(now - d * day).getDay();
    const weekendBoost = weekday === 5 || weekday === 6 ? 1.35 : 1;
    series.push({
      date: new Date(now - d * day).toISOString().slice(0, 10),
      revenue: Math.round((1400 + rand() * 1800) * weekendBoost),
      signups: Math.round((6 + rand() * 22) * weekendBoost),
    });
  }

  return { products, orders, series };
}

module.exports = { buildSeed };
