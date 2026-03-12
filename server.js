const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ── Data files
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const WATCHES_FILE = path.join(DATA_DIR, 'watches.json');

function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, []);
if (!fs.existsSync(ORDERS_FILE)) writeJSON(ORDERS_FILE, []);

// ── Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'timegems_secret_key_2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// ── Auth middleware
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: 'Please login first' });
}

// ────────────────────────────────
// API: Auth
// ────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, error: 'All fields required' });
  const users = readJSON(USERS_FILE);
  if (users.find(u => u.email === email))
    return res.json({ success: false, error: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), name, email, password: hashed, createdAt: new Date().toISOString() };
  users.push(user);
  writeJSON(USERS_FILE, users);
  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ success: true, user: req.session.user });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);
  if (!user) return res.json({ success: false, error: 'Email not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, error: 'Incorrect password' });
  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ success: true, user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

// ────────────────────────────────
// API: Watches
// ────────────────────────────────
app.get('/api/watches', (req, res) => {
  const watches = readJSON(WATCHES_FILE);
  const { category, sort, search, minPrice, maxPrice } = req.query;
  let filtered = [...watches];
  if (category && category !== 'All') filtered = filtered.filter(w => w.category === category);
  if (search) filtered = filtered.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.brand.toLowerCase().includes(search.toLowerCase())
  );
  if (minPrice) filtered = filtered.filter(w => w.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(w => w.price <= Number(maxPrice));
  if (sort === 'price-asc')  filtered.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
  if (sort === 'rating')     filtered.sort((a,b) => b.rating - a.rating);
  if (sort === 'discount')   filtered.sort((a,b) => b.discount - a.discount);
  res.json(filtered);
});

app.get('/api/watches/:id', (req, res) => {
  const watches = readJSON(WATCHES_FILE);
  const watch = watches.find(w => w.id === parseInt(req.params.id));
  if (!watch) return res.status(404).json({ error: 'Not found' });
  res.json(watch);
});

// ────────────────────────────────
// API: Orders
// ────────────────────────────────
app.post('/api/orders', requireAuth, (req, res) => {
  const { items, address, paymentMethod, total } = req.body;
  if (!items || !items.length) return res.json({ success: false, error: 'Cart is empty' });
  const orders = readJSON(ORDERS_FILE);
  const order = {
    id: 'TGH' + Date.now(),
    userId: req.session.user.id,
    userName: req.session.user.name,
    userEmail: req.session.user.email,
    items,
    address,
    paymentMethod,
    total,
    status: 'Confirmed',
    placedAt: new Date().toISOString()
  };
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  res.json({ success: true, order });
});

app.get('/api/orders/my', requireAuth, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const myOrders = orders.filter(o => o.userId === req.session.user.id);
  res.json(myOrders.reverse());
});

// Serve the SPA for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✦ Time Gems Hub running at http://localhost:${PORT}\n`);
});
