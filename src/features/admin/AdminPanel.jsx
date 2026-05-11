import { useState } from 'react';
import { C, DF } from '../../utils/constants';
import { useAuth, useApp, useUsers } from '../../context/AppContext';

export default function AdminPanel() {
  const { logout } = useAuth();
  const { stores, suppliers, subscriptions, payments, toast, updateSubscription, cancelSubscription } = useApp();
  const { users, pendingUsers, activeUsers, updateUser } = useUsers();

  const [tab, setTab] = useState("users");
  const [showUserModal, setShowUserModal] = useState(null);

  function approveUser(userId) {
    updateUser({ id: userId, status: 'active', verifiedAt: new Date().toISOString() });
    toast('User approved', C.green);
  }

  function suspendUser(userId) {
    updateUser({ id: userId, status: 'suspended' });
    toast('User suspended', C.amber);
  }

  function revokeSubscription(subId) {
    cancelSubscription(subId);
  }

  function verifyUser(userId) {
    updateUser({ id: userId, verified: true, verifiedAt: new Date().toISOString() });
    toast('User verified', C.green);
  }

  function resetUserPassword(userId) {
    updateUser({ id: userId, resetToken: `reset-${Date.now()}`, passwordResetRequired: true });
    toast('Password reset link sent', C.accent);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/shelfos_logo.svg" alt="ShelfOS" style={{ width: 26, height: 26 }} />
          <span style={{ fontFamily: DF, fontSize: 12, fontWeight: 700 }}>SHELF<span style={{ color: C.pink }}>OS</span></span>
          <span style={{ padding: '2px 8px', borderRadius: 100, background: `${C.pink}22`, color: C.pink, fontSize: 10 }}>ADMIN PORTAL</span>
        </div>

        <div className="tab-bar" style={{ flex: 1, maxWidth: 500, margin: '0 20px' }}>
          {[
            { key: 'users', label: 'Users' },
            { key: 'stores', label: 'Stores & Suppliers' },
            { key: 'subscriptions', label: 'Subscriptions' },
            { key: 'analytics', label: 'Analytics' },
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
          <div style={{ fontSize: 12, color: C.muted }}>Admin</div>
          <button className="bg" style={{ padding: '6px 12px', fontSize: 11 }} onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: 18, overflow: 'auto' }}>
        {tab === "users" && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Total Users</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.accent }}>{users.length}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Pending Approval</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.amber }}>{pendingUsers.length}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Active Users</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{activeUsers.length}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Stores</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.accent }}>{users.filter(u => u.role === 'store').length}</div>
              </div>
            </div>

            {pendingUsers.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Pending Approvals</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{pendingUsers.length} users waiting for approval</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: 12 }}>
                  {pendingUsers.map(user => {
                    const store = stores.find(s => s.id === user.storeId);
                    const supplier = suppliers.find(s => s.id === user.supplierId);
                    return (
                      <div key={user.id} className="card" style={{ padding: 16, borderLeft: `3px solid ${C.amber}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{user.name}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>{user.email}</div>
                          </div>
                          <span className="pill" style={{ background: `${C.amber}22`, color: C.amber }}>{user.role}</span>
                        </div>
                        {(store || supplier) && (
                          <div style={{ background: C.surface, borderRadius: 8, padding: 10, marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>
                              {user.role === 'store' ? 'Store Information' : 'Supplier Information'}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>
                              {store?.name || supplier?.name}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted }}>
                              {store?.city || supplier?.location}
                            </div>
                          </div>
                        )}
                        <div style={{ fontSize: 10, color: C.muted }}>
                          Registered on: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </div>
                        <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
                          <button className="bp" style={{ padding: '6px 14px', fontSize: 12, background: C.green }} onClick={() => approveUser(user.id)}>Approve</button>
                          <button className="bg" style={{ padding: '6px 14px', fontSize: 12, color: C.red }} onClick={() => suspendUser(user.id)}>Reject</button>
                          <button className="bg" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setShowUserModal(user)}>Details</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>All Users</div>
              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="trow">
                        <td style={{ fontWeight: 500 }}>{user.name}</td>
                        <td style={{ color: C.muted }}>{user.email}</td>
                        <td>
                          <span className="pill" style={{
                            background: user.role === 'admin' ? `${C.pink}22` :
                                       user.role === 'supplier' ? `${C.green}22` :
                                       `${C.accent}22`,
                            color: user.role === 'admin' ? C.pink :
                                   user.role === 'supplier' ? C.green :
                                   C.accent
                          }}>{user.role}</span>
                        </td>
                        <td>
                          <span className="pill" style={{
                            background: user.status === 'active' ? `${C.green}22` :
                                       user.status === 'pending' ? `${C.amber}22` :
                                       `${C.red}22`,
                            color: user.status === 'active' ? C.green :
                                   user.status === 'pending' ? C.amber :
                                   C.red
                          }}>{user.status}</span>
                        </td>
                        <td>
                          {user.verified ? (
                            <span className="pill" style={{ background: `${C.green}22`, color: C.green, fontSize: 9 }}>✓ Verified</span>
                          ) : (
                            <span className="pill" style={{ background: `${C.amber}22`, color: C.amber, fontSize: 9 }}>Pending</span>
                          )}
                        </td>
                        <td style={{ color: C.muted, fontSize: 12 }}>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {user.status === 'pending' && (
                              <button className="bp" style={{ padding: '4px 10px', fontSize: 10, background: C.green }} onClick={() => approveUser(user.id)}>Approve</button>
                            )}
                            {user.status === 'active' && (
                              <button className="bg" style={{ padding: '4px 10px', fontSize: 10, color: C.red }} onClick={() => suspendUser(user.id)}>Suspend</button>
                            )}
                            {user.status === 'suspended' && (
                              <button className="bp" style={{ padding: '4px 10px', fontSize: 10 }} onClick={() => approveUser(user.id)}>Reactivate</button>
                            )}
                            {user.status !== 'pending' && !user.verified && (
                              <button className="bp" style={{ padding: '4px 10px', fontSize: 10, background: C.accent }} onClick={() => verifyUser(user.id)}>Verify</button>
                            )}
                            <button className="bg" style={{ padding: '4px 10px', fontSize: 10 }} onClick={() => setShowUserModal(user)}>View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "stores" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Registered Stores</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
                {stores.map(store => (
                  <div key={store.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{store.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{store.city}</div>
                      </div>
                      <span className="pill" style={{ background: `${C.accent}22`, color: C.accent }}>{store.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      <div style={{ marginBottom: 4 }}>Manager: {store.manager}</div>
                      <div>ID: <span style={{ fontFamily: DF }}>{store.id}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Registered Suppliers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
                {suppliers.map(supp => (
                  <div key={supp.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{supp.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{supp.location}</div>
                      </div>
                      <span className="pill" style={{ background: `${C.green}22`, color: C.green }}>{supp.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      <div style={{ marginBottom: 4 }}>Contact: {supp.contact}</div>
                      <div>ID: <span style={{ fontFamily: DF }}>{supp.id}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "subscriptions" && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Total Subscriptions</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.accent }}>{subscriptions.length}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Active</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{subscriptions.filter(s => s.status === 'active').length}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Cancelled</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.red }}>{subscriptions.filter(s => s.status === 'cancelled').length}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>MRR</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>${subscriptions.filter(s => s.status === 'active').reduce((s, sub) => s + sub.amount, 0).toFixed(0)}</div>
              </div>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Billing</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub => {
                    const user = users.find(u => u.id === sub.userId);
                    return (
                      <tr key={sub.id} className="trow">
                        <td style={{ fontWeight: 500 }}>{user?.name || 'Unknown'}</td>
                        <td><span style={{ fontFamily: DF, color: C.accent }}>{sub.planId}</span></td>
                        <td style={{ color: C.muted }}>{sub.billingCycle}</td>
                        <td style={{ color: C.green }}>${sub.amount.toFixed(2)}</td>
                        <td>
                          <span className="pill" style={{
                            background: sub.status === 'active' ? `${C.green}22` : `${C.red}22`,
                            color: sub.status === 'active' ? C.green : C.red
                          }}>{sub.status}</span>
                        </td>
                        <td>
                          {sub.status === 'active' && (
                            <button className="bg" style={{ padding: '4px 10px', fontSize: 10, color: C.red }} onClick={() => revokeSubscription(sub.id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Total Revenue</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>${payments.reduce((s, p) => s + p.amount, 0).toFixed(0)}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Subscription Revenue</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.accent }}>${payments.filter(p => p.type === 'subscription').reduce((s, p) => s + p.amount, 0).toFixed(0)}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Order Revenue</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>${payments.filter(p => p.type === 'order').reduce((s, p) => s + p.amount, 0).toFixed(0)}</div>
              </div>
              <div className="sc">
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>Total Transactions</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.amber }}>{payments.length}</div>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Recent Payments</div>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 15).map(payment => {
                    const user = users.find(u => u.id === payment.userId);
                    return (
                      <tr key={payment.id} className="trow">
                        <td><span style={{ fontFamily: DF, color: C.accent }}>{payment.id}</span></td>
                        <td>{user?.name || 'Unknown'}</td>
                        <td>
                          <span className="pill" style={{
                            background: payment.type === 'subscription' ? `${C.accent}22` : `${C.green}22`,
                            color: payment.type === 'subscription' ? C.accent : C.green
                          }}>{payment.type}</span>
                        </td>
                        <td style={{ color: C.green }}>${payment.amount.toFixed(2)}</td>
                        <td style={{ color: C.muted }}>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>
                          <span className="pill" style={{
                            background: payment.status === 'completed' ? `${C.green}22` : `${C.red}22`,
                            color: payment.status === 'completed' ? C.green : C.red
                          }}>{payment.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showUserModal && (
        <div className="modal-bg" onClick={() => setShowUserModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 520 }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>User Details: {showUserModal.name}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '12px 14px', background: C.surface, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>User ID</div>
                <div style={{ fontFamily: DF, fontSize: 13 }}>{showUserModal.id}</div>
              </div>
              <div style={{ padding: '12px 14px', background: C.surface, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 13 }}>{showUserModal.email}</div>
              </div>
              <div style={{ padding: '12px 14px', background: C.surface, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Role</div>
                <span className="pill" style={{
                  background: showUserModal.role === 'admin' ? `${C.pink}22` :
                             showUserModal.role === 'supplier' ? `${C.green}22` :
                             `${C.accent}22`,
                  color: showUserModal.role === 'admin' ? C.pink :
                         showUserModal.role === 'supplier' ? C.green :
                         C.accent
                }}>{showUserModal.role}</span>
              </div>
              <div style={{ padding: '12px 14px', background: C.surface, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Status</div>
                <span className="pill" style={{
                  background: showUserModal.status === 'active' ? `${C.green}22` :
                             showUserModal.status === 'pending' ? `${C.amber}22` :
                             `${C.red}22`,
                  color: showUserModal.status === 'active' ? C.green :
                         showUserModal.status === 'pending' ? C.amber :
                         C.red
                }}>{showUserModal.status}</span>
              </div>
            </div>

            <div style={{ background: C.surface, borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Account Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.muted }}>Verified:</span>
                  <span>{showUserModal.verified ? <span style={{ color: C.green }}>✓ Yes</span> : <span style={{ color: C.amber }}>Pending</span>}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.muted }}>Created:</span>
                  <span>{showUserModal.createdAt ? new Date(showUserModal.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.muted }}>Last Login:</span>
                  <span>{showUserModal.lastLogin ? new Date(showUserModal.lastLogin).toLocaleDateString() : 'Never'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.muted }}>Verified At:</span>
                  <span>{showUserModal.verifiedAt ? new Date(showUserModal.verifiedAt).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </div>

            {(showUserModal.storeId || showUserModal.supplierId) && (
              <div style={{ background: `${C.accent}10`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.accent, marginBottom: 8 }}>
                  {showUserModal.role === 'store' ? 'Store Information' : 'Supplier Information'}
                </div>
                {showUserModal.storeId && (() => {
                  const store = stores.find(s => s.id === showUserModal.storeId);
                  return store ? (
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 500 }}>{store.name}</div>
                      <div style={{ color: C.muted }}>{store.city}</div>
                      <div style={{ color: C.muted }}>Manager: {store.manager}</div>
                    </div>
                  ) : null;
                })()}
                {showUserModal.supplierId && (() => {
                  const supplier = suppliers.find(s => s.id === showUserModal.supplierId);
                  return supplier ? (
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 500 }}>{supplier.name}</div>
                      <div style={{ color: C.muted }}>{supplier.location}</div>
                      <div style={{ color: C.muted }}>Contact: {supplier.contact}</div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div style={{ background: `${C.green}10`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.green, marginBottom: 8 }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {showUserModal.status === 'pending' && (
                  <button className="bp" style={{ padding: '8px 16px', fontSize: 12, background: C.green }} onClick={() => { approveUser(showUserModal.id); setShowUserModal(null); }}>
                    Approve Account
                  </button>
                )}
                {showUserModal.status === 'active' && (
                  <button className="bg" style={{ padding: '8px 16px', fontSize: 12, color: C.red }} onClick={() => { suspendUser(showUserModal.id); setShowUserModal(null); }}>
                    Suspend Account
                  </button>
                )}
                {showUserModal.status === 'suspended' && (
                  <button className="bp" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => { approveUser(showUserModal.id); setShowUserModal(null); }}>
                    Reactivate Account
                  </button>
                )}
                {!showUserModal.verified && (
                  <button className="bp" style={{ padding: '8px 16px', fontSize: 12, background: C.accent }} onClick={() => { verifyUser(showUserModal.id); setShowUserModal(null); }}>
                    Verify Identity
                  </button>
                )}
                <button className="bg" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => { resetUserPassword(showUserModal.id); setShowUserModal(null); }}>
                  Reset Password
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="bg" onClick={() => setShowUserModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
