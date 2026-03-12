# ⌚ Time Gems Hub — Luxury Watch Store

A complete full-stack luxury watch e-commerce application.

## Features
- 🛍️ **Shop Page** — Browse all 8 luxury watches with filters (category, price range, sort)
- 🔍 **Search** — Real-time search by brand or model name
- 📄 **Product Detail** — Full specs, gallery, discount display, quantity selector
- 🛒 **Shopping Cart** — Sidebar cart with quantity controls (persists on refresh)
- 💳 **Checkout Flow** — 3-step checkout: Shipping → Payment → Confirm
- 🔐 **User Auth** — Register & Login with bcrypt password hashing
- 📦 **My Orders** — View all past orders with order details
- 💛 **Wishlist** — Save favourite watches (persists locally)
- 🎨 **Bright Gold & Dark Theme** — Premium luxury aesthetic

## Setup

### Requirements
- Node.js 16+
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then open http://localhost:3000 in your browser.

### Development (auto-restart)
```bash
npm run dev
```

## Project Structure
```
time-gems-hub/
├── server.js           ← Express backend (API routes)
├── package.json
├── data/
│   ├── watches.json    ← Watch catalog
│   ├── users.json      ← User accounts (auto-created)
│   └── orders.json     ← Orders (auto-created)
└── public/
    └── index.html      ← Full SPA frontend
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/register | Create new account |
| POST | /api/login | Login |
| POST | /api/logout | Logout |
| GET | /api/me | Get current user |
| GET | /api/watches | Get all watches (with filters) |
| GET | /api/watches/:id | Get single watch |
| POST | /api/orders | Place order (auth required) |
| GET | /api/orders/my | Get my orders (auth required) |

## Query Parameters for /api/watches
- `category` — Filter by category
- `search` — Search by brand/name
- `sort` — `price-asc`, `price-desc`, `rating`, `discount`
- `minPrice`, `maxPrice` — Price range filter

## Note
The frontend also works **without the server** using localStorage fallback — open index.html directly in a browser for a demo.
