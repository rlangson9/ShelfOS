# ShelfOS

Modern grocery and inventory management system for supermarkets and suppliers - **Desktop Only** (Mac, Windows, Linux)

## Features

- 🏪 **Store Manager Dashboard** - Inventory tracking, order management, supplier marketplace
- 📦 **Supplier Portal** - Product catalog, order fulfillment, courier management
- 💳 **Payment System** - In-app payments and subscription management
- 🔔 **Alerts** - Low stock, expiring items, order status notifications
- 📊 **Analytics** - Sales reporting and inventory insights

---

## Installation Methods

### Method 1: PWA (Progressive Web App) - Easiest
Works on all desktop browsers (Chrome, Edge, Safari, Firefox)

1. Open `http://localhost:5173` in your browser
2. Look for the **Install** icon in the address bar (usually a + or download icon)
3. Click "Install ShelfOS"
4. The app will open in its own window and be available in your applications folder

### Method 2: Desktop App (Electron) - Recommended

#### Prerequisites
- Node.js 18+ installed

#### Development Mode
```bash
cd ShelfOS
npm install
npm run dev
```

#### Build and Package for Desktop

**Build for Mac:**
```bash
npm run electron:build:mac
```
Output in `release/` folder - `.dmg` and `.zip` files

**Build for Windows:**
```bash
npm run electron:build:win
```
Output in `release/` folder - `.exe` installer and portable version

**Build for Linux:**
```bash
npm run electron:build:linux
```
Output in `release/` folder - `.AppImage`, `.deb`, and `.rpm` files

---

## Default Login Credentials

### Store Manager
- Email: `alex@downtown.com`
- Password: `store123`

### Supplier
- Email: `orders@freshfarm.com`
- Password: `sup123`

---

## Usage

### For Store Managers
1. Log in with store manager credentials
2. Manage inventory, place orders, view analytics
3. When orders are in transit, contact couriers directly from order details

### For Suppliers
1. Log in with supplier credentials
2. Manage product catalog, fulfill orders
3. Add courier details when dispatching orders

---

## System Requirements

### Minimum
- **OS**: macOS 10.15+, Windows 10+, Ubuntu 18.04+
- **RAM**: 4GB
- **Storage**: 200MB

### Recommended
- **OS**: macOS 12+, Windows 11+, Ubuntu 22.04+
- **RAM**: 8GB
- **Storage**: 500MB
- **Browser**: Chrome 100+, Edge 100+, Safari 15+, Firefox 100+

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build

# Preview production build
npm run preview

# Build desktop apps
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

---

## License

MIT
