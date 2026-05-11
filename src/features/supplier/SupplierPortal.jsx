import { useState } from 'react';
import { C, DF, CATS } from '../../utils/constants';
import { getProductImageUrl } from '../../utils/helpers';
import { useAuth, useApp, useOrders } from '../../context/AppContext';

export default function SupplierPortal() {
  const { session, logout } = useAuth();
  const { catalog, suppliers, toast, updateOrder, addCatalogProduct, updateCatalogProduct } = useApp();
  const { supplierOrders } = useOrders();

  const [tab, setTab] = useState("orders");
  const [showOrderModal, setShowOrderModal] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showCourierModal, setShowCourierModal] = useState(null);
  const [search, setSearch] = useState("");
  const [productForm, setProductForm] = useState({
    name: '', category: 'Produce', sku: '', barcode: '', unitPrice: '',
    packSize: '', minOrderQty: '', maxOrderQty: '', leadDays: '',
    expiryDays: '', description: '', status: 'active', stock: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);

  const supplierId = session.user.supplierId;
  const supplier = suppliers.find(s => s.id === supplierId);
  const orders = supplierOrders;
  const supplierCatalog = catalog.filter(p => p.supplierId === supplierId);

  function confirmOrder(orderId) {
    updateOrder({ id: orderId, status: "confirmed" });
    toast("Order confirmed");
  }

  function processOrder(orderId) {
    updateOrder({ id: orderId, status: "processing" });
    toast("Order is now processing");
  }

  function dispatchOrder(orderId, courierData) {
    updateOrder({
      id: orderId,
      status: "in-transit",
      courier: courierData,
      eta: courierData.estimatedDelivery
    });
    setShowCourierModal(null);
    toast("Order dispatched with courier");
  }

  function saveProduct() {
    const newProduct = {
      id: editProduct?.id || `cat-${Date.now()}`,
      supplierId,
      ...productForm,
      unitPrice: parseFloat(productForm.unitPrice),
      minOrderQty: parseInt(productForm.minOrderQty),
      maxOrderQty: parseInt(productForm.maxOrderQty),
      leadDays: parseInt(productForm.leadDays),
      expiryDays: parseInt(productForm.expiryDays),
      stock: parseInt(productForm.stock),
      imageUrl: uploadedImage || getProductImageUrl(productForm.name),
      images: []
    };

    if (editProduct) {
      updateCatalogProduct(newProduct);
      toast("Product updated");
    } else {
      addCatalogProduct(newProduct);
      toast("Product added");
    }

    setShowProductModal(false);
    setEditProduct(null);
    setProductForm({
      name: '', category: 'Produce', sku: '', barcode: '', unitPrice: '',
      packSize: '', minOrderQty: '', maxOrderQty: '', leadDays: '',
      expiryDays: '', description: '', status: 'active', stock: ''
    });
    setUploadedImage(null);
  }

  function deleteProduct(productId) {
    updateCatalogProduct({ id: productId, status: 'deleted' });
    toast("Product archived");
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/SHELFOS-logo.png" alt="ShelfOS" style={{ width: 26, height: 26 }} />
          <span style={{ fontFamily: DF, fontSize: 12, fontWeight: 700 }}>SHELF<span style={{ color: C.green }}>OS</span></span>
          <span style={{ padding: '2px 8px', borderRadius: 100, background: `${C.green}22`, color: C.green, fontSize: 10 }}>SUPPLIER PORTAL</span>
        </div>

        <div className="tab-bar" style={{ flex: 1, maxWidth: 600, margin: '0 20px' }}>
          {[
            { key: 'orders', label: 'Orders' },
            { key: 'catalog', label: 'Catalog' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'settings', label: 'Account Settings' },
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
          <div style={{ fontSize: 12, color: C.muted }}>{supplier?.name}</div>
          <button className="bg" style={{ padding: '6px 12px', fontSize: 11 }} onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: 18, overflow: 'auto' }}>
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
                  style={{ padding: 20, borderLeft: `3px solid ${order.status === 'delivered' ? C.green : order.status === 'in-transit' ? C.amber : order.status === 'processing' ? C.yellow : order.status === 'confirmed' ? C.accent : C.muted}` }}
                  onClick={() => setShowOrderModal(order)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: DF, fontSize: 12, color: C.muted }}>{order.id}</span>
                        <span className="pill" style={{
                          background: order.status === 'delivered' ? `${C.green}22` :
                                      order.status === 'in-transit' ? `${C.amber}22` :
                                      order.status === 'processing' ? `${C.yellow}22` :
                                      order.status === 'confirmed' ? `${C.accent}22` : `${C.muted}22`,
                          color: order.status === 'delivered' ? C.green :
                                 order.status === 'in-transit' ? C.amber :
                                 order.status === 'processing' ? C.yellow :
                                 order.status === 'confirmed' ? C.accent : C.muted
                        }}>{order.status}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{order.supplierName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color: C.green }}>${order.total.toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>ETA: {order.eta}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 12px', fontSize: 12 }}>
                        <span style={{ fontWeight: 500 }}>{item.name}</span> <span style={{ color: C.muted }}>×{item.qty}</span>
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
                  <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
                    {order.status === 'pending' && (
                      <button className="bp" style={{ padding: '6px 14px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); confirmOrder(order.id); }}>
                        Confirm Order
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button className="bp" style={{ padding: '6px 14px', fontSize: 12, background: C.yellow, color: '#000' }} onClick={(e) => { e.stopPropagation(); processOrder(order.id); }}>
                        Start Processing
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button className="bp" style={{ padding: '6px 14px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setShowCourierModal(order); }}>
                        Add Courier & Dispatch
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

        {tab === "catalog" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Product Catalog</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: 200 }}
                />
                <button className="bp" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => { setShowProductModal(true); setEditProduct(null); }}>
                  + Add Product
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
              {supplierCatalog.filter(p => p.status !== 'deleted').map(prod => (
                <div key={prod.id} className="card" style={{ padding: 16 }}>
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
                    <span className="pill" style={{ background: C.surface, color: C.muted, fontSize: 10 }}>{prod.category}</span>
                    <span className="pill" style={{ background: prod.status === 'active' ? `${C.green}22` : `${C.amber}22`, color: prod.status === 'active' ? C.green : C.amber, fontSize: 10 }}>{prod.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="bg" style={{ flex: 1, padding: 8, fontSize: 11 }} onClick={() => { setEditProduct(prod); setProductForm({ ...prod, unitPrice: prod.unitPrice.toString(), minOrderQty: prod.minOrderQty.toString(), maxOrderQty: prod.maxOrderQty.toString(), leadDays: prod.leadDays.toString(), expiryDays: prod.expiryDays.toString(), stock: prod.stock.toString() }); setShowProductModal(true); }}>
                      Edit
                    </button>
                    <button className="bg" style={{ flex: 1, padding: 8, fontSize: 11, color: C.red }} onClick={() => deleteProduct(prod.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Supplier Analytics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Total Orders</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{orders.length}</div>
                <div className="stat-up">+12 this month</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Pending</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.amber }}>{orders.filter(o => o.status === 'pending').length}</div>
                <div className="stat-dn">Need attention</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Processing</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.yellow }}>{orders.filter(o => o.status === 'processing').length}</div>
                <div className="stat-up">In progress</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Revenue</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>${orders.reduce((s, o) => s + o.total, 0).toFixed(0)}</div>
                <div className="stat-up">+8% this month</div>
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Recent Orders</div>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Store</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map(order => (
                    <tr key={order.id} className="trow">
                      <td><span style={{ fontFamily: DF, color: C.accent }}>{order.id}</span></td>
                      <td>{order.storeId}</td>
                      <td>{order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</td>
                      <td style={{ color: C.green }}>${order.total.toFixed(2)}</td>
                      <td>
                        <span className="pill" style={{
                          background: order.status === 'delivered' ? `${C.green}22` :
                                      order.status === 'in-transit' ? `${C.amber}22` :
                                      order.status === 'processing' ? `${C.yellow}22` :
                                      order.status === 'confirmed' ? `${C.accent}22` : `${C.muted}22`,
                          color: order.status === 'delivered' ? C.green :
                                 order.status === 'in-transit' ? C.amber :
                                 order.status === 'processing' ? C.yellow :
                                 order.status === 'confirmed' ? C.accent : C.muted
                        }}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Account Settings</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
              <div>
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Profile Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Business Name *</div>
                      <input type="text" defaultValue={supplier?.name || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Contact Person *</div>
                      <input type="text" defaultValue={supplier?.contact || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Email</div>
                      <input type="email" defaultValue={session.user.email || ''} disabled />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Phone</div>
                      <input type="text" defaultValue={supplier?.phone || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Location</div>
                      <input type="text" defaultValue={supplier?.location || ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Business Type</div>
                      <input type="text" defaultValue={supplier?.type || 'Food Supplier'} />
                    </div>
                  </div>
                  <button className="bp" style={{ marginTop: 16, padding: '10px 20px', fontSize: 12 }}>
                    Save Profile
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
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Verification Documents</div>
                  
                  <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 16 }}>
                    {supplier?.verificationImage ? (
                      <div>
                        <img src={supplier.verificationImage} alt="Verification" style={{ maxWidth: '100%', borderRadius: 8 }} />
                        <button className="bg" style={{ marginTop: 12, padding: '6px 14px', fontSize: 11 }}>Replace Image</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Upload shop photos for verification</div>
                        <label style={{ display: 'inline-block', cursor: 'pointer', padding: '8px 16px', background: C.accent, color: '#fff', borderRadius: 8, fontSize: 12 }}>
                          Upload Image
                          <input type="file" accept="image/*" style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>

                  <div style={{ background: `${C.green}10`, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: C.green, marginBottom: 4 }}>Verification Status</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {supplier?.verified ? (
                        <span style={{ color: C.green }}>✓ Verified</span>
                      ) : (
                        <span style={{ color: C.amber }}>Pending Verification</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Account Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12 }}>
                      Download Invoice History
                    </button>
                    <button className="bg" style={{ padding: '10px 14px', fontSize: 12 }}>
                      Export Data
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
                  <span className="pill" style={{
                    background: showOrderModal.status === 'delivered' ? `${C.green}22` :
                                showOrderModal.status === 'in-transit' ? `${C.amber}22` :
                                showOrderModal.status === 'processing' ? `${C.yellow}22` :
                                showOrderModal.status === 'confirmed' ? `${C.accent}22` : `${C.muted}22`,
                    color: showOrderModal.status === 'delivered' ? C.green :
                           showOrderModal.status === 'in-transit' ? C.amber :
                           showOrderModal.status === 'processing' ? C.yellow :
                           showOrderModal.status === 'confirmed' ? C.accent : C.muted
                  }}>{showOrderModal.status}</span>
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
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 3 }}>Store</div>
                <div style={{ fontSize: 13 }}>{showOrderModal.storeId}</div>
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
                <div style={{ fontSize: 12, color: C.muted }}>Phone: {showOrderModal.courier.phone}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Company: {showOrderModal.courier.company}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Tracking: {showOrderModal.courier.trackingNumber}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="bg" onClick={() => setShowOrderModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="modal-bg" onClick={() => { setShowProductModal(false); setEditProduct(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 580 }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>{editProduct ? 'Edit Product' : '+ Add Product'}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Product Name *</div>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Product name"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Category *</div>
                <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>SKU</div>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="SKU code"
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Barcode</div>
                <input
                  type="text"
                  value={productForm.barcode}
                  onChange={e => setProductForm({ ...productForm, barcode: e.target.value })}
                  placeholder="Barcode"
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Unit Price *</div>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.unitPrice}
                  onChange={e => setProductForm({ ...productForm, unitPrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Pack Size *</div>
                <input
                  type="text"
                  value={productForm.packSize}
                  onChange={e => setProductForm({ ...productForm, packSize: e.target.value })}
                  placeholder="e.g., 1 gallon"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Min Order Qty *</div>
                <input
                  type="number"
                  value={productForm.minOrderQty}
                  onChange={e => setProductForm({ ...productForm, minOrderQty: e.target.value })}
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Max Order Qty *</div>
                <input
                  type="number"
                  value={productForm.maxOrderQty}
                  onChange={e => setProductForm({ ...productForm, maxOrderQty: e.target.value })}
                  placeholder="500"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Lead Days *</div>
                <input
                  type="number"
                  value={productForm.leadDays}
                  onChange={e => setProductForm({ ...productForm, leadDays: e.target.value })}
                  placeholder="2"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Expiry Days *</div>
                <input
                  type="number"
                  value={productForm.expiryDays}
                  onChange={e => setProductForm({ ...productForm, expiryDays: e.target.value })}
                  placeholder="7"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Stock *</div>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Status</div>
                <select value={productForm.status} onChange={e => setProductForm({ ...productForm, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Description</div>
              <textarea
                value={productForm.description}
                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Product Image</div>
              <div style={{ border: `2px dashed ${C.border2}`, borderRadius: 8, padding: 20, textAlign: 'center' }}>
                {uploadedImage ? (
                  <div>
                    <img src={uploadedImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }} />
                    <button className="bg" style={{ marginTop: 10 }} onClick={() => setUploadedImage(null)}>Remove Image</button>
                  </div>
                ) : (
                  <div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="product-image-upload" />
                    <label htmlFor="product-image-upload" style={{ cursor: 'pointer', color: C.accent }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📷</div>
                      <div style={{ fontSize: 12 }}>Click to upload image</div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="bg" onClick={() => { setShowProductModal(false); setEditProduct(null); }}>Cancel</button>
              <button className="bp" onClick={saveProduct}>
                {editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCourierModal && (
        <div className="modal-bg" onClick={() => setShowCourierModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Add Courier & Dispatch Order</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Courier Name *</div>
                <input type="text" id="courier-name" placeholder="Courier name" required />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Phone Number *</div>
                <input type="text" id="courier-phone" placeholder="Phone number" required />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Courier Company</div>
                <input type="text" id="courier-company" placeholder="Company name" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Tracking Number</div>
                <input type="text" id="courier-tracking" placeholder="Tracking number" />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Estimated Delivery Date</div>
              <input type="text" id="courier-eta" placeholder="e.g., Tomorrow" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="bg" onClick={() => setShowCourierModal(null)}>Cancel</button>
              <button className="bp" onClick={() => {
                dispatchOrder(showCourierModal.id, {
                  name: document.getElementById('courier-name').value,
                  phone: document.getElementById('courier-phone').value,
                  company: document.getElementById('courier-company').value,
                  trackingNumber: document.getElementById('courier-tracking').value,
                  estimatedDelivery: document.getElementById('courier-eta').value
                });
              }}>Dispatch Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
