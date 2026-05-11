import { useState } from 'react';
import { C, DF, SC, CATS } from '../../utils/constants';
import { daysUntil, expiryStatus, stockStatus } from '../../utils/helpers';
import { useAuth, useApp, useStore, useOrders, useSubscriptions } from '../../context/AppContext';

export default function StoreDashboard() {
  const { session, logout } = useAuth();
  const { stores, catalog, suppliers, plans, toast, addOrder, updateOrder, addProductToStore, addPayment } = useApp();
  const { storeProducts, syncTag, updateStoreProduct } = useStore();
  const { storeOrders } = useOrders();
  const { userSubscription, userPayments, updateSubscription, cancelSubscription, createSubscription } = useSubscriptions();

  const storeId = session.user.storeId;
  const store = stores.find(s => s.id === storeId);

  const [tab, setTab] = useState("home");
  const [cart, setCart] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [paymentDateFilter, setPaymentDateFilter] = useState("");
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showTagModal, setShowTagModal] = useState(null);
  const [tagColorFilter, setTagColorFilter] = useState('');
  
  const TAG_COLORS = {
    none: { color: C.text, label: 'Default' },
    red: { color: '#e74c3c', label: 'Promotion' },
    green: { color: '#2ecc71', label: 'Fresh Stock' },
    yellow: { color: '#f39c12', label: 'Price Adjusted' }
  };

  const products = storeProducts;
  const orders = storeOrders;
  const userPaymentMethods = session.user.paymentMethods || ["Visa ending in 4242", "Mastercard ending in 5555"];

  const filteredPayments = userPayments.filter(payment => {
    if (paymentFilter && payment.type !== paymentFilter) return false;
    if (paymentDateFilter) {
      const paymentDate = new Date(payment.date);
      const today = new Date();
      if (paymentDateFilter === "7") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (paymentDate < sevenDaysAgo) return false;
      } else if (paymentDateFilter === "30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        if (paymentDate < thirtyDaysAgo) return false;
      } else if (paymentDateFilter === "month") {
        if (paymentDate.getMonth() !== today.getMonth() || paymentDate.getFullYear() !== today.getFullYear()) return false;
      } else if (paymentDateFilter === "lastMonth") {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        if (paymentDate.getMonth() !== lastMonth.getMonth() || paymentDate.getFullYear() !== lastMonth.getFullYear()) return false;
      }
    }
    return true;
  });

  const filteredCatalog = catalog.filter(p => {
    if (!p.status || p.status !== "active") return false;
    if (catFilter && p.category !== catFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const aProd = products.find(p => p.name === a.name);
    const bProd = products.find(p => p.name === b.name);
    let aScore = 0, bScore = 0;
    if (aProd) {
      if (aProd.stock < aProd.minStock) aScore += aProd.stock < aProd.minStock * 0.5 ? 10 : 5;
      const expDays = daysUntil(aProd.addedDate, aProd.expiryDays);
      if (expDays <= 2) aScore += 10;
      else if (expDays <= 5) aScore += 5;
    }
    if (bProd) {
      if (bProd.stock < bProd.minStock) bScore += bProd.stock < bProd.minStock * 0.5 ? 10 : 5;
      const expDays = daysUntil(bProd.addedDate, bProd.expiryDays);
      if (expDays <= 2) bScore += 10;
      else if (expDays <= 5) bScore += 5;
    }
    return bScore - aScore;
  });

  function addToCart(prod) {
    setCart(c => {
      const exists = c.find(x => x.id === prod.id);
      if (exists) return c.map(x => x.id === prod.id ? { ...x, qty: Math.min(x.qty + 1, prod.maxOrderQty) } : x);
      return [...c, { ...prod, qty: Math.max(prod.minOrderQty, 1) }];
    });
  }

  function removeFromCart(prodId) {
    setCart(c => c.filter(x => x.id !== prodId));
  }

  function updateCartQty(prodId, delta) {
    setCart(c => c.map(x => {
      if (x.id !== prodId) return x;
      const newQty = x.qty + delta;
      return { ...x, qty: Math.max(x.minOrderQty, Math.min(newQty, x.maxOrderQty)) };
    }));
  }

  function checkout() {
    if (cart.length === 0) return;
    const grouped = cart.reduce((acc, item) => {
      (acc[item.supplierId] = acc[item.supplierId] || []).push(item);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([suppId, items]) => {
      const supplier = suppliers.find(s => s.id === suppId);
      const order = {
        id: `ORD-${Date.now()}`,
        storeId,
        supplierId: suppId,
        supplierName: supplier?.name || "Unknown",
        status: "pending",
        placedAt: new Date().toISOString(),
        eta: `${supplier?.leadDays || 3} days`,
        total: items.reduce((s, i) => s + i.unitPrice * i.qty, 0),
        items: items.map(i => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        notes: "",
        priority: "normal"
      };
      addOrder(order);

      const payment = {
        id: `pay-${Date.now()}`,
        userId: session.user.id,
        amount: order.total,
        type: 'order',
        status: 'completed',
        date: new Date().toISOString(),
        method: userPaymentMethods[0] || 'Unknown'
      };
      addPayment(payment);
    });

    setCart([]);
    setCheckoutModal(false);
    toast("Order placed successfully");
  }

  function receiveOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.items.forEach(item => {
      const existing = products.find(x => x.storeId === storeId && x.name === item.name);
      if (existing) {
        addProductToStore({
          ...existing,
          stock: existing.stock + item.qty,
          addedDate: new Date().toISOString()
        });
      } else {
        const catItem = catalog.find(c => c.name === item.name);
        if (catItem) {
          addProductToStore({
            id: `${storeId}-${Date.now()}`,
            storeId,
            name: catItem.name,
            category: catItem.category,
            sku: catItem.sku,
            barcode: catItem.barcode,
            price: catItem.unitPrice,
            stock: item.qty,
            minStock: 10,
            expiryDays: catItem.expiryDays,
            addedDate: new Date().toISOString(),
            description: catItem.description,
            tag: { synced: false, lastSync: '' },
            supplierId: catItem.supplierId,
            imageUrl: catItem.imageUrl
          });
        }
      }
    });

    updateOrder({ id: orderId, status: "delivered" });
    toast(`Received: ${order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}`);
  }

  function downloadReceipt(payment) {
    const receipt = `
ShelfOS Receipt
─────────────────────────────
Payment ID: ${payment.id}
Type: ${payment.type === 'subscription' ? 'Subscription Payment' : 'Order Payment'}
Date: ${new Date(payment.date).toLocaleDateString()}
Method: ${payment.method}
Amount: $${payment.amount.toFixed(2)}
Status: ${payment.status}
─────────────────────────────
Thank you for your purchase!
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Receipt downloaded");
  }

  function editTag(product) {
    setShowTagModal({ action: 'edit', product });
  }

  function unlinkTag(productId) {
    updateStoreProduct({
      id: productId,
      tag: null
    });
    toast("Tag unlinked");
  }

  function syncAllTags() {
    products.filter(p => p.tag?.tagId).forEach(p => {
      syncTag(p.id);
    });
    toast("Syncing all tags...");
  }

  function syncExpiringTags() {
    products.filter(p => {
      const expDays = daysUntil(p.addedDate, p.expiryDays);
      return expDays <= 3 && p.tag?.tagId;
    }).forEach(p => {
      syncTag(p.id);
    });
    toast("Syncing expiring product tags...");
  }

  function syncPromotionTags() {
    products.filter(p => p.tag?.tagColor === 'red' && p.tag?.tagId).forEach(p => {
      syncTag(p.id);
    });
    toast("Syncing promotion tags...");
  }

  function resetAllTags() {
    products.forEach(p => {
      if (p.tag?.tagId) {
        updateStoreProduct({
          id: p.id,
          tag: { ...p.tag, synced: false }
        });
      }
    });
    toast("All tags reset", C.amber);
  }

  function exportSalesData() {
    const salesData = {
      storeId,
      storeName: store?.name || 'Unknown',
      exportDate: new Date().toISOString(),
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.total, 0),
      orders: orders.map(o => ({
        id: o.id,
        supplierId: o.supplierId,
        supplierName: o.supplierName,
        status: o.status,
        total: o.total,
        placedAt: o.placedAt,
        items: o.items
      })),
      payments: payments.filter(p => p.userId === session.user.id).map(p => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        method: p.method,
        date: p.date,
        status: p.status
      }))
    };

    const blob = new Blob([JSON.stringify(salesData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Sales data exported");
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src="/shelfos_logo.svg" alt="ShelfOS" style={{ width: 26, height: 26 }} />
          <span style={{ fontFamily: DF, fontSize: 12, fontWeight: 700 }}>SHELF<span style={{ color: C.accent }}>OS</span></span>
        </div>

        <div className="tab-bar" style={{ flex: 1, maxWidth: 600, margin: '0 20px' }}>
          {[
            { key: 'home', label: 'Dashboard' },
            { key: 'inventory', label: 'Inventory' },
            { key: 'pricetags', label: 'Price Tags' },
            { key: 'marketplace', label: 'Marketplace' },
            { key: 'orders', label: 'Orders' },
            { key: 'payments', label: 'Payments' },
            { key: 'subscription', label: 'Subscription' },
            { key: 'settings', label: 'Account' },
          ].map(t => (
            <button
              key={t.key}
              className={`nb ${tab === t.key ? 'act' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="bg"
            title="Scan Barcode"
            onClick={() => toast("Barcode scanner activated")}
            style={{ padding: '8px', borderRadius: 8 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="15"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="17"></line>
              <line x1="20" y1="13" x2="20" y2="3"></line>
              <line x1="1" y1="18" x2="7" y2="18"></line>
              <line x1="9" y1="18" x2="15" y2="18"></line>
              <line x1="17" y1="18" x2="23" y2="18"></line>
            </svg>
          </button>
          {cart.length > 0 && (
            <button
              className="bp"
              style={{ padding: '6px 14px', fontSize: 11, position: 'relative' }}
              onClick={() => setCheckoutModal(true)}
            >
              Cart ({cart.reduce((s, i) => s + i.qty, 0)})
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: C.muted }}>{session.user.name}</div>
            <button className="bg" style={{ padding: '6px 12px', fontSize: 11 }} onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: 18, overflow: 'auto' }}>
        {tab === "home" && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Products in Stock</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{products.length}</div>
                <div className="stat-up">+2 this week</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Low Stock</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.amber }}>{products.filter(p => p.stock < p.minStock).length}</div>
                <div className="stat-dn">-3 from last week</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Active Orders</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.accent }}>{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</div>
                <div className="stat-up">+1 today</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Expiring Soon</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.red }}>{products.filter(p => daysUntil(p.addedDate, p.expiryDays) <= 3).length}</div>
                <div className="stat-dn">Watch these!</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Inventory Overview</div>
                  <button className="bg" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => setTab('inventory')}>View All</button>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {products.slice(0, 8).map(p => {
                    const expDays = daysUntil(p.addedDate, p.expiryDays);
                    return (
                      <div key={p.id} className="trow" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: SC[stockStatus(p.stock, p.minStock)] }}>
                          {p.stock} in stock
                        </div>
                        <div style={{ fontSize: 11, color: SC[expiryStatus(expDays)] }}>
                          {expDays <= 0 ? 'Expired' : `${expDays}d`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Recent Orders</div>
                  <button className="bg" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => setTab('orders')}>View All</button>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="trow" style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontFamily: DF, fontSize: 11, color: C.muted }}>{o.id}</span>
                        <span className="pill" style={{ background: `${SC[o.status === 'delivered' ? 'ok' : o.status === 'in-transit' ? 'warning' : 'warning']}22`, color: SC[o.status === 'delivered' ? 'ok' : o.status === 'in-transit' ? 'warning' : 'warning'] }}>{o.status}</span>
                      </div>
                      <div style={{ fontSize: 12 }}>{o.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.green, marginTop: 4 }}>${o.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "inventory" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Inventory Management</div>
              <div style={{ fontSize: 12, color: C.muted }}>
                💡 Click on price to edit and sync to electronic tags
              </div>
            </div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Min</th>
                    <th>Price</th>
                    <th>Price Tag</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const expDays = daysUntil(p.addedDate, p.expiryDays);
                    const stockSt = stockStatus(p.stock, p.minStock);
                    const expSt = expiryStatus(expDays);
                    const tagPrice = p.tag?.displayPrice || p.price;
                    const isEditing = editingPrice === p.id;
                    
                    return (
                      <tr key={p.id} className="trow">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: 18 }}>📦</span>
                            )}
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4, maxWidth: 200 }}>{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td><span style={{ color: SC[stockSt] }}>{p.stock}</span></td>
                        <td>{p.minStock}</td>
                        <td>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input
                                type="number"
                                step="0.01"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                style={{ width: 80, padding: '4px 8px', fontSize: 12 }}
                                autoFocus
                              />
                              <button
                                className="bp"
                                style={{ padding: '4px 10px', fontSize: 10 }}
                                onClick={() => {
                                  const newPrice = parseFloat(editValue);
                                  if (newPrice && newPrice > 0) {
                                    updateStoreProduct({ id: p.id, price: newPrice });
                                    toast(`Price updated to $${newPrice.toFixed(2)} - syncing to tag...`);
                                    // Auto-sync tag after price change
                                    syncTag(p.id);
                                  }
                                  setEditingPrice(null);
                                  setEditValue('');
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="bg"
                                style={{ padding: '4px 10px', fontSize: 10 }}
                                onClick={() => { setEditingPrice(null); setEditValue(''); }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingPrice(p.id); setEditValue(p.price.toString()); }}
                              style={{ background: 'none', border: 'none', color: C.accent, textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}
                            >
                              ${p.price.toFixed(2)}
                            </button>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: TAG_COLORS[p.tag?.tagColor || 'none'].color }}>${tagPrice.toFixed(2)}</div>
                            {p.tag?.displayName && (
                              <div style={{ fontSize: 10, color: C.muted }}>{p.tag.displayName}</div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <select
                                value={p.tag?.tagColor || 'none'}
                                onChange={(e) => {
                                  const newColor = e.target.value;
                                  updateStoreProduct({
                                    id: p.id,
                                    tag: { ...(p.tag || {}), tagColor: newColor }
                                  });
                                  toast(`Tag color set to ${TAG_COLORS[newColor].label} - syncing to tag...`);
                                  // Auto-sync tag after color change
                                  syncTag(p.id);
                                }}
                                style={{ width: '100%', padding: '4px 8px', fontSize: 11 }}
                              >
                                {Object.entries(TAG_COLORS).map(([key, val]) => (
                                  <option key={key} value={key}>{val.label}</option>
                                ))}
                              </select>
                              {p.tag?.tagColor && p.tag?.tagColor !== 'none' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: TAG_COLORS[p.tag.tagColor].color }} />
                                  <span style={{ color: C.muted }}>{TAG_COLORS[p.tag.tagColor].label}</span>
                                </div>
                              )}
                              <button
                                className="bg"
                                style={{ padding: '2px 6px', fontSize: 9, alignSelf: 'flex-start' }}
                                onClick={() => syncTag(p.id)}
                                disabled={p.tag?.synced}
                              >
                                {p.tag?.synced ? '✓ Synced' : 'Sync Tag'}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ color: SC[expSt] }}>{expDays <= 0 ? 'Expired' : `${expDays} days`}</span></td>
                        <td>
                          {stockSt === 'out' ? <span className="pill" style={{ background: `${C.red}22`, color: C.red }}>Out of Stock</span> :
                           stockSt === 'low' ? <span className="pill" style={{ background: `${C.amber}22`, color: C.amber }}>Low Stock</span> :
                           expSt === 'critical' ? <span className="pill" style={{ background: `${C.red}22`, color: C.red }}>Expiring</span> :
                           <span className="pill" style={{ background: `${C.green}22`, color: C.green }}>OK</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: 9, color: C.muted }}>
                              {p.tag?.lastSync ? `Last: ${p.tag.lastSync}` : 'Never synced'}
                            </div>
                            {p.tag?.synced ? (
                              <span className="pill" style={{ background: `${C.green}22`, color: C.green, fontSize: 9 }}>✓ Synced</span>
                            ) : (
                              <span className="pill" style={{ background: `${C.amber}22`, color: C.amber, fontSize: 9 }}>Pending</span>
                            )}
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

        {tab === "pricetags" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Price Tag Management</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select
                  value={catFilter}
                  onChange={e => setCatFilter(e.target.value)}
                  style={{ width: 160, padding: '8px 12px', fontSize: 12 }}
                >
                  <option value="">All Categories</option>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  onChange={e => setTagColorFilter(e.target.value)}
                  style={{ width: 140, padding: '8px 12px', fontSize: 12 }}
                  defaultValue={tagColorFilter}
                >
                  <option value="">All Colors</option>
                  {Object.entries(TAG_COLORS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <button className="bp" onClick={() => setShowTagModal({ action: 'add' })} style={{ padding: '8px 16px', fontSize: 12 }}>
                  + Add New Tag
                </button>
                <button className="bp" onClick={() => syncAllTags()} style={{ padding: '8px 16px', fontSize: 12, background: C.green }}>
                  Sync All Tags
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Linked Price Tags</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                  {products.filter(p => {
                    if (!p.tag?.tagId) return false;
                    if (catFilter && p.category !== catFilter) return false;
                    if (tagColorFilter && p.tag.tagColor !== tagColorFilter) return false;
                    return true;
                  }).map(p => {
                    const tagColor = TAG_COLORS[p.tag?.tagColor || 'none'];
                    return (
                      <div
                        key={p.tag.tagId}
                        className="card"
                        style={{ padding: 16, borderLeft: `4px solid ${tagColor.color}` }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Tag ID: {p.tag.tagId}</div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 500, color: tagColor.color }}>${(p.tag.displayPrice || p.price).toFixed(2)}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: tagColor.color }} />
                            <span style={{ fontSize: 11, color: C.muted }}>{tagColor.label}</span>
                          </div>
                          <div style={{ fontSize: 10, color: C.muted }}>
                            {p.tag.synced ? '✓ Synced' : 'Pending'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                          <button className="bg" style={{ flex: 1, padding: '4px 8px', fontSize: 10 }} onClick={() => editTag(p)}>
                            Edit
                          </button>
                          <button className="bg" style={{ flex: 1, padding: '4px 8px', fontSize: 10, color: C.red }} onClick={() => unlinkTag(p.id)}>
                            Unlink
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(() => {
                    const filteredTags = products.filter(p => {
                      if (!p.tag?.tagId) return false;
                      if (catFilter && p.category !== catFilter) return false;
                      if (tagColorFilter && p.tag.tagColor !== tagColorFilter) return false;
                      return true;
                    });
                    const hasActiveFilters = catFilter || tagColorFilter;
                    
                    if (filteredTags.length === 0) {
                      return (
                        <div style={{ padding: 24, textAlign: 'center', border: `2px dashed ${C.border2}`, borderRadius: 12 }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>🏷️</div>
                          <div style={{ fontSize: 12, color: C.muted }}>
                            {hasActiveFilters ? 'No tags match your filters' : 'No tags linked yet'}
                          </div>
                          {!hasActiveFilters && (
                            <button className="bp" style={{ marginTop: 12, padding: '6px 14px', fontSize: 11 }} onClick={() => setShowTagModal({ action: 'add' })}>
                              Link a Tag
                            </button>
                          )}
                          {hasActiveFilters && (
                            <button className="bg" style={{ marginTop: 12, padding: '6px 14px', fontSize: 11 }} onClick={() => { setCatFilter(''); setTagColorFilter(''); }}>
                              Clear Filters
                            </button>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div>
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Tag Statistics</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: C.muted }}>Total Products</span>
                      <span style={{ fontSize: 18, fontWeight: 500 }}>{products.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: C.muted }}>With Tags</span>
                      <span style={{ fontSize: 18, fontWeight: 500, color: C.green }}>{products.filter(p => p.tag?.tagId).length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: C.muted }}>Synced</span>
                      <span style={{ fontSize: 18, fontWeight: 500, color: C.accent }}>{products.filter(p => p.tag?.synced).length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: C.muted }}>Pending Sync</span>
                      <span style={{ fontSize: 18, fontWeight: 500, color: C.amber }}>{products.filter(p => p.tag && !p.tag.synced).length}</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Quick Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="bp" onClick={() => syncAllTags()} style={{ padding: '10px 14px', fontSize: 12 }}>
                      🔄 Sync All Tags
                    </button>
                    <button className="bg" onClick={() => syncExpiringTags()} style={{ padding: '10px 14px', fontSize: 12 }}>
                      ⚠️ Sync Expiring Products
                    </button>
                    <button className="bg" onClick={() => syncPromotionTags()} style={{ padding: '10px 14px', fontSize: 12 }}>
                      🏷️ Sync Promotion Tags
                    </button>
                    <button className="bg" onClick={() => resetAllTags()} style={{ padding: '10px 14px', fontSize: 12, color: C.red }}>
                      🗑️ Reset All Tags
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "marketplace" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Supplier Marketplace</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: 200 }}
                />
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 150 }}>
                  <option value="">All Categories</option>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
              {filteredCatalog.map(prod => {
                const urgency = products.find(p => p.name === prod.name);
                const isUrgent = urgency && (urgency.stock < urgency.minStock || daysUntil(urgency.addedDate, urgency.expiryDays) <= 5);
                return (
                  <div
                    key={prod.id}
                    className="card"
                    style={{ padding: 16, borderLeft: isUrgent ? `3px solid ${C.amber}` : '3px solid transparent' }}
                  >
                    {isUrgent && (
                      <div style={{ fontSize: 10, color: C.amber, marginBottom: 8 }}>
                        {urgency.stock < urgency.minStock ? '⚠️ Low stock' : `⚠️ Expires in ${daysUntil(urgency.addedDate, urgency.expiryDays)}d`}
                      </div>
                    )}
                    <div style={{ height: 120, background: C.surface, borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
                      {prod.imageUrl ? (
                        <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📦</div>
                      )}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{prod.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>
                      {prod.description}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 18, fontWeight: 500, color: C.green }}>${prod.unitPrice.toFixed(2)}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{prod.packSize}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span className="pill" style={{ background: C.surface, color: C.muted, fontSize: 10 }}>MOQ: {prod.minOrderQty}</span>
                      <span className="pill" style={{ background: C.surface, color: C.muted, fontSize: 10 }}>Stock: {prod.stock}</span>
                    </div>
                    <button
                      className="bp"
                      style={{ width: '100%', padding: 8, fontSize: 12 }}
                      onClick={() => addToCart(prod)}
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Order Management</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(400px,1fr))', gap: 14 }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  className="card"
                  style={{ padding: 20, borderLeft: `3px solid ${order.status === 'delivered' ? C.green : order.status === 'in-transit' ? C.amber : order.status === 'pending' ? C.muted : C.yellow}` }}
                  onClick={() => setShowOrderModal(order)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: DF, fontSize: 12, color: C.muted }}>{order.id}</span>
                        <span className="pill" style={{ background: `${order.status === 'delivered' ? C.green : order.status === 'in-transit' ? C.amber : order.status === 'pending' ? C.muted : C.yellow}22`, color: order.status === 'delivered' ? C.green : order.status === 'in-transit' ? C.amber : order.status === 'pending' ? C.muted : C.yellow }}>{order.status}</span>
                        <span className="pill" style={{ background: `${C.accent}22`, color: C.accent }}>{order.priority}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{order.supplierName}</div>
                      {order.notes && <div style={{ fontSize: 12, color: C.amber, marginTop: 3 }}>📝 {order.notes}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color: C.green }}>${order.total.toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>ETA: {order.eta}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 12px', fontSize: 12 }}>
                        <span style={{ fontWeight: 500 }}>{item.name}</span> <span style={{ color: C.muted }}>×{item.qty} @ ${item.unitPrice}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-timeline">
                    {['Placed', 'Confirmed', 'Processing', 'In Transit', 'Delivered'].map((step, idx) => {
                      const statuses = ['pending', 'confirmed', 'processing', 'in-transit', 'delivered'];
                      const isDone = statuses.indexOf(order.status) >= idx;
                      const isActive = statuses.indexOf(order.status) === idx;
                      return (
                        <div key={step} className="ot-step">
                          <div className={`ot-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div className="ot-label">{step}</div>
                        </div>
                      );
                    })}
                  </div>
                  {order.status === 'in-transit' && order.courier && (
                    <div style={{ marginTop: 14, padding: 12, background: `${C.accent}10`, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: C.accent, marginBottom: 6 }}>📞 Courier Contact</div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{order.courier.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        Phone: <a href={`tel:${order.courier.phone}`} style={{ color: C.accent }}>{order.courier.phone}</a>
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>Company: {order.courier.company}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>Tracking: {order.courier.trackingNumber}</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
                    {order.status === 'in-transit' && (
                      <button className="bp" style={{ padding: '6px 14px', fontSize: 12, background: C.green }} onClick={(e) => { e.stopPropagation(); receiveOrder(order.id); }}>
                        Mark Received
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button className="bg" style={{ padding: '6px 14px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); }}>
                        Cancel
                      </button>
                    )}
                    <button className="bg" style={{ padding: '6px 14px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setShowOrderModal(order); }}>
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 14 }}>Payment History</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} style={{ width: 150 }}>
                  <option value="">All Types</option>
                  <option value="subscription">Subscriptions</option>
                  <option value="order">Orders</option>
                </select>
                <select value={paymentDateFilter} onChange={e => setPaymentDateFilter(e.target.value)} style={{ width: 150 }}>
                  <option value="">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="month">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Total Spent</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: C.green }}>${filteredPayments.reduce((s, p) => s + p.amount, 0).toFixed(2)}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Subscriptions</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: C.accent }}>${filteredPayments.filter(p => p.type === 'subscription').reduce((s, p) => s + p.amount, 0).toFixed(2)}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Orders</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: C.green }}>${filteredPayments.filter(p => p.type === 'order').reduce((s, p) => s + p.amount, 0).toFixed(2)}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Transactions</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: C.amber }}>{filteredPayments.length}</div>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>No payments found for the selected filters</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredPayments.map(payment => (
                  <div key={payment.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {payment.type === 'subscription' ? 'Subscription Payment' : 'Order Payment'}
                        </div>
                        <span className="pill" style={{ background: payment.type === 'subscription' ? `${C.accent}22` : `${C.green}22`, color: payment.type === 'subscription' ? C.accent : C.green, fontSize: 10 }}>
                          {payment.type}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        {new Date(payment.date).toLocaleDateString()} · {payment.method}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="pill" style={{ background: `${C.green}22`, color: C.green }}>{payment.status}</span>
                      <span style={{ fontSize: 16, fontWeight: 500, color: C.green }}>${payment.amount.toFixed(2)}</span>
                      <button className="bg" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => setShowPaymentModal(payment)}>Receipt</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "subscription" && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 18 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Available Plans</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
                  {plans.map((plan) => {
                    const isCurrent = userSubscription?.planId === plan.id;
                    return (
                      <div key={plan.id} className="card" style={{ padding: 24, border: isCurrent ? `2px solid ${plan.color}` : `1px solid ${C.border}` }}>
                        {isCurrent && <div style={{ background: plan.color, color: '#fff', padding: '3px 12px', borderRadius: 100, fontSize: 10, fontWeight: 500, display: 'inline-block', marginBottom: 12 }}>CURRENT PLAN</div>}
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{plan.name}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 16 }}>
                          <span style={{ fontSize: 36, fontWeight: 700 }}>${plan.monthly}</span>
                          <span style={{ color: C.muted, fontSize: 14, marginLeft: 2 }}>/month</span>
                        </div>
                        <div style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 12, textAlign: 'center' }}>
                          <span style={{ color: C.accent }}>Save 17%</span> when billed annually — ${plan.yearly}/year
                        </div>
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Features included:</div>
                          {plan.features.map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                              <span style={{ color: C.green }}>✓</span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                        {isCurrent ? (
                          <button className="bp" style={{ width: '100%', background: plan.color }}>Current Plan</button>
                        ) : (
                          <button className="bp" style={{ width: '100%' }} onClick={() => { updateSubscription(userSubscription?.id, plan.id); }}>Upgrade to {plan.name}</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Your Current Subscription</div>
                {userSubscription ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, color: C.muted }}>Plan</div>
                        <div style={{ fontSize: 18, fontWeight: 500 }}>{plans.find(p => p.id === userSubscription.planId)?.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, color: C.muted }}>Next Billing</div>
                        <div style={{ fontSize: 18, fontWeight: 500, color: C.green }}>${userSubscription.amount}</div>
                      </div>
                    </div>
                    <div style={{ background: C.surface, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Billing Details</div>
                      <div style={{ fontSize: 12 }}>Payment Method: {userSubscription.paymentMethod}</div>
                      <div style={{ fontSize: 12 }}>Billing Cycle: {userSubscription.billingCycle}</div>
                      <div style={{ fontSize: 12 }}>Status: <span style={{ color: C.green }}>{userSubscription.status}</span></div>
                    </div>
                    <button className="bg" style={{ width: '100%', borderColor: C.red, color: C.red }} onClick={() => { cancelSubscription(userSubscription.id); }}>
                      Cancel Subscription
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }}>👋</div>
                    <div style={{ fontSize: 14, marginBottom: 16 }}>No active subscription</div>
                    <button className="bp" onClick={() => setShowSubModal(true)}>Subscribe Now</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Account Settings</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
              <div>
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Store Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Store Name *</div>
                      <input type="text" defaultValue={store?.name || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Manager Name *</div>
                      <input type="text" defaultValue={store?.manager || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Email</div>
                      <input type="email" defaultValue={session.user.email || ''} disabled />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Phone</div>
                      <input type="text" defaultValue={store?.phone || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>City</div>
                      <input type="text" defaultValue={store?.city || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Address</div>
                      <input type="text" defaultValue={store?.address || ''} />
                    </div>
                  </div>
                  <button className="bp" style={{ marginTop: 16, padding: '10px 20px', fontSize: 12 }}>
                    Save Store Details
                  </button>
                </div>

                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Change Password</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Current Password</div>
                      <input type="password" placeholder="Enter current password" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>New Password</div>
                      <input type="password" placeholder="Enter new password" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Confirm New Password</div>
                      <input type="password" placeholder="Confirm new password" />
                    </div>
                  </div>
                  <button className="bp" style={{ marginTop: 16, padding: '10px 20px', fontSize: 12, background: C.amber }}>
                    Change Password
                  </button>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Payment Methods</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: C.surface, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Visa ending in 4242</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Expires 12/2025</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="bg" style={{ padding: '4px 10px', fontSize: 10 }}>Edit</button>
                        <button className="bg" style={{ padding: '4px 10px', fontSize: 10, color: C.red }}>Delete</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: C.surface, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Mastercard ending in 5555</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Expires 06/2026</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="bg" style={{ padding: '4px 10px', fontSize: 10 }}>Edit</button>
                        <button className="bg" style={{ padding: '4px 10px', fontSize: 10, color: C.red }}>Delete</button>
                      </div>
                    </div>
                  </div>
                  <button className="bp" style={{ marginTop: 16, padding: '10px 20px', fontSize: 12 }}>
                    + Add Payment Method
                  </button>
                </div>
              </div>

              <div>
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Store Photos</div>
                  
                  <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 16 }}>
                    {store?.storeImage ? (
                      <div>
                        <img src={store.storeImage} alt="Store" style={{ maxWidth: '100%', borderRadius: 8 }} />
                        <button className="bg" style={{ marginTop: 12, padding: '6px 14px', fontSize: 11 }}>Replace Image</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Upload store front picture</div>
                        <label style={{ display: 'inline-block', cursor: 'pointer', padding: '8px 16px', background: C.accent, color: '#fff', borderRadius: 8, fontSize: 12 }}>
                          Upload Image
                          <input type="file" accept="image/*" style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>

                  <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
                    {store?.verificationImage ? (
                      <div>
                        <img src={store.verificationImage} alt="Verification" style={{ maxWidth: '100%', borderRadius: 8 }} />
                        <button className="bg" style={{ marginTop: 12, padding: '6px 14px', fontSize: 11 }}>Replace</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Upload verification document</div>
                        <label style={{ display: 'inline-block', cursor: 'pointer', padding: '8px 16px', background: C.accent, color: '#fff', borderRadius: 8, fontSize: 12 }}>
                          Upload Document
                          <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Data Export</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="bp" style={{ padding: '10px 14px', fontSize: 12 }} onClick={() => exportSalesData()}>
                      📊 Export Sales Data
                    </button>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12 }}>
                      📋 Export Inventory Report
                    </button>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12 }}>
                      📦 Export Order History
                    </button>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12 }}>
                      📈 Export Analytics Report
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Account Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12 }}>
                      Download Invoice History
                    </button>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12 }}>
                      Export All Data
                    </button>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12, color: C.red }}>
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showOrderModal && (
        <div className="modal-bg" onClick={() => setShowOrderModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 620 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Order {showOrderModal.id}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="pill" style={{ background: `${showOrderModal.status === 'delivered' ? C.green : showOrderModal.status === 'in-transit' ? C.amber : C.yellow}22`, color: showOrderModal.status === 'delivered' ? C.green : showOrderModal.status === 'in-transit' ? C.amber : C.yellow }}>{showOrderModal.status}</span>
                  <span className="pill" style={{ background: `${C.accent}22`, color: C.accent }}>⚑ {showOrderModal.priority}</span>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, color: C.green }}>${showOrderModal.total.toFixed(2)}</div>
            </div>

            <div className="order-timeline">
              {['Placed', 'Confirmed', 'Processing', 'In Transit', 'Delivered'].map((step, idx) => {
                const statuses = ['pending', 'confirmed', 'processing', 'in-transit', 'delivered'];
                const isDone = statuses.indexOf(showOrderModal.status) >= idx;
                const isActive = statuses.indexOf(showOrderModal.status) === idx;
                return (
                  <div key={step} className="ot-step">
                    <div className={`ot-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div className="ot-label">{step}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
              <div style={{ padding: '10px 14px', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 3 }}>Supplier</div>
                <div style={{ fontSize: 13 }}>{showOrderModal.supplierName}</div>
              </div>
              <div style={{ padding: '10px 14px', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 3 }}>ETA</div>
                <div style={{ fontSize: 13 }}>{showOrderModal.eta}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>Order items</div>
            <div style={{ marginBottom: 16 }}>
              {showOrderModal.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                    <span style={{ color: C.muted }}>×{item.qty} units</span>
                    <span style={{ color: C.muted }}>@${item.unitPrice}</span>
                    <span style={{ fontWeight: 500, color: C.green }}>${(item.qty * item.unitPrice).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: `2px solid ${C.border}`, margin: '4px 0', fontSize: 14, fontWeight: 500 }}>
                <span>Total</span>
                <span style={{ color: C.green }}>${showOrderModal.total.toFixed(2)}</span>
              </div>
            </div>

            {showOrderModal.courier && (
              <div style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.accent, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>Courier Information</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{showOrderModal.courier.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>
                  Phone: <a href={`tel:${showOrderModal.courier.phone}`} style={{ color: C.accent }}>{showOrderModal.courier.phone}</a>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>Company: {showOrderModal.courier.company}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>Tracking Number: {showOrderModal.courier.trackingNumber}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Estimated Delivery: {showOrderModal.courier.estimatedDelivery}</div>
                <div style={{ fontSize: 11, color: C.amber, marginTop: 8, fontStyle: 'italic' }}>
                  💡 Contact courier to arrange delivery address and time
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', gap: 7 }}>
                {showOrderModal.status === 'in-transit' && (
                  <button className="bp" style={{ background: C.green }} onClick={() => { receiveOrder(showOrderModal.id); setShowOrderModal(null); }}>✓ Mark Received</button>
                )}
              </div>
              <button className="bg" onClick={() => setShowOrderModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-bg" onClick={() => setShowPaymentModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Receipt</div>
              <div style={{ fontFamily: DF, fontSize: 12, color: C.muted }}>{showPaymentModal.id}</div>
            </div>
            <div style={{ background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: C.muted }}>Payment Type</span>
                <span>{showPaymentModal.type === 'subscription' ? 'Subscription Payment' : 'Order Payment'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: C.muted }}>Date</span>
                <span>{new Date(showPaymentModal.date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: C.muted }}>Payment Method</span>
                <span>{showPaymentModal.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: C.muted }}>Status</span>
                <span style={{ color: C.green }}>{showPaymentModal.status}</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>Total Amount</span>
                <span style={{ fontSize: 18, fontWeight: 500, color: C.green }}>${showPaymentModal.amount.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="bg" onClick={() => downloadReceipt(showPaymentModal)}>Download Receipt</button>
              <button className="bp" onClick={() => setShowPaymentModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {checkoutModal && (
        <div className="modal-bg" onClick={() => setCheckoutModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Checkout</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Cart Items</div>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>📦</span>
                    )}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>${item.unitPrice} × {item.qty}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button className="bg" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => updateCartQty(item.id, -1)}>-</button>
                      <span style={{ fontSize: 12 }}>{item.qty}</span>
                      <button className="bg" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => updateCartQty(item.id, 1)}>+</button>
                    </div>
                    <button className="bg" style={{ padding: '4px 8px', fontSize: 11, color: C.red }} onClick={() => removeFromCart(item.id)}>✕ Remove</button>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>${(item.unitPrice * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: `1px solid ${C.border}`, marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: C.green }}>${cart.reduce((s, i) => s + i.unitPrice * i.qty, 0).toFixed(2)}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Payment Method</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {userPaymentMethods.map((method, idx) => (
                  <button key={idx} className="bg" style={{ padding: '10px 16px', fontSize: 12, flex: 1 }}>{method}</button>
                ))}
                <button className="bg" style={{ padding: '10px 16px', fontSize: 12, flex: 1 }}>Add New Card</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="bg" onClick={() => setCheckoutModal(false)}>Cancel</button>
              <button className="bp" onClick={checkout}>Place Order</button>
            </div>
          </div>
        </div>
      )}

      {showSubModal && (
        <div className="modal-bg" onClick={() => setShowSubModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Subscribe to ShelfOS</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Select Plan</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {plans.map(plan => (
                  <button key={plan.id} className="bg" style={{ padding: '10px 16px', fontSize: 12 }}>
                    {plan.name} - ${plan.monthly}/mo
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Billing Cycle</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="bp" style={{ padding: '10px 20px', fontSize: 12 }}>Monthly</button>
                <button className="bg" style={{ padding: '10px 20px', fontSize: 12 }}>Yearly <span style={{ color: C.green }}>(Save 17%)</span></button>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Payment Method</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {userPaymentMethods.map((method, idx) => (
                  <button key={idx} className="bg" style={{ padding: '10px 16px', fontSize: 12, flex: 1 }}>{method}</button>
                ))}
                <button className="bg" style={{ padding: '10px 16px', fontSize: 12, flex: 1 }}>Add New Card</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="bg" onClick={() => setShowSubModal(false)}>Cancel</button>
              <button className="bp" onClick={() => { createSubscription(session.user.id, 'pro', 'monthly'); setShowSubModal(false); }}>Subscribe Now</button>
            </div>
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="modal-bg" onClick={() => setShowTagModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 500 }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>
              {showTagModal.action === 'edit' ? 'Edit Price Tag' : 'Link Product to Price Tag'}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Select Product</div>
              <select
                id="tag-product"
                style={{ width: '100%' }}
                defaultValue={showTagModal.product?.id || ''}
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.tag?.tagId && `(Tag: ${p.tag.tagId})`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Tag ID</div>
              <input
                type="text"
                id="tag-id"
                placeholder="Enter tag ID (e.g., TAG-001)"
                defaultValue={showTagModal.product?.tag?.tagId || ''}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Tag Color</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(TAG_COLORS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => document.getElementById('tag-color').value = key}
                    style={{
                      padding: '10px 16px',
                      fontSize: 12,
                      border: `2px solid ${showTagModal.product?.tag?.tagColor === key ? val.color : C.border}`,
                      backgroundColor: val.color,
                      color: key === 'none' ? C.text : '#fff',
                      borderRadius: 8
                    }}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
              <input type="hidden" id="tag-color" defaultValue={showTagModal.product?.tag?.tagColor || 'none'} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Custom Display Name (Optional)</div>
              <input
                type="text"
                id="tag-display-name"
                placeholder="Override product name on tag"
                defaultValue={showTagModal.product?.tag?.displayName || ''}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="bg" onClick={() => setShowTagModal(null)}>Cancel</button>
              <button
                className="bp"
                onClick={() => {
                  const productId = document.getElementById('tag-product').value;
                  const tagId = document.getElementById('tag-id').value;
                  const tagColor = document.getElementById('tag-color').value;
                  const displayName = document.getElementById('tag-display-name').value;

                  if (!productId || !tagId) {
                    toast("Please select a product and enter a tag ID", C.red);
                    return;
                  }

                  const product = products.find(p => p.id === productId);
                  updateStoreProduct({
                    id: productId,
                    tag: {
                      tagId,
                      tagColor,
                      displayName: displayName || product.name,
                      displayPrice: product.price,
                      synced: false
                    }
                  });

                  toast(`Tag ${tagId} linked to ${product.name}`);
                  setShowTagModal(null);
                }}
              >
                {showTagModal.action === 'edit' ? 'Update Tag' : 'Link Tag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
