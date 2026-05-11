import { useState } from 'react';
import { C, DF } from '../../utils/constants';
import { useAuth, useApp } from '../../context/AppContext';

export default function LandingPage() {
  const { login, register } = useAuth();
  const { plans, toast } = useApp();
  const [mode, setMode] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [regForm, setReg] = useState({ role: 'store', name: '', email: '', password: '', storeName: '', city: '' });
  const [err, setErr] = useState('');

  function doLogin(e) {
    e.preventDefault();
    setErr('');
    if (!login(email, password)) setErr('Invalid email or password.');
  }

  function doRegister(e) {
    e.preventDefault();
    setErr('');
    if (!regForm.name || !regForm.email || !regForm.password) {
      setErr('Please fill all required fields.');
      return;
    }
    if (register({ ...regForm })) {
      toast('Account created — pending admin approval', C.amber);
      setMode('login');
    } else {
      setErr('Email already registered.');
    }
  }

  const DEMO = [
    { role: 'store', label: 'Store Manager', email: 'alex@downtown.com', pass: 'store123', color: C.accent },
    { role: 'supplier', label: 'Supplier', email: 'orders@freshfarm.com', pass: 'sup123', color: C.green },
    { role: 'admin', label: 'Admin', email: 'admin@shelfos.com', pass: 'admin123', color: C.pink },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, borderBottom: `1px solid ${C.border}`, background: C.surface, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/shelfos_logo.svg" alt="ShelfOS" style={{ width: 28, height: 28 }} />
          <span style={{ fontFamily: DF, fontSize: 13, fontWeight: 700, letterSpacing: '.05em' }}>SHELF<span style={{ color: C.accent }}>OS</span></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="bg" style={{ padding: '7px 16px', fontSize: 12 }} onClick={() => { setMode('login'); setErr(''); }}>Sign In</button>
          <button className="bp" style={{ padding: '7px 16px', fontSize: 12 }} onClick={() => { setMode('register'); setErr(''); }}>Get Started</button>
        </div>
      </nav>

      {mode === 'home' && (
        <div style={{ flex: 1 }}>
          <div style={{ textAlign: 'center', padding: '80px 24px 60px', background: `radial-gradient(ellipse at 50% 0%, ${C.accent}18 0%, transparent 65%)` }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: `${C.accent}22`, border: `1px solid ${C.accent}44`, fontSize: 11, color: C.accent, letterSpacing: '.08em', marginBottom: 20 }}>SMART GROCERY MANAGEMENT PLATFORM</div>
            <h1 style={{ fontFamily: DF, fontSize: 'clamp(28px,5vw,52px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16, maxWidth: 700, margin: '0 auto 16px', color: '#adacaf' }}>
              Automate your store.<br /><span style={{ color: C.accent }}>One platform.</span> Every shelf.
            </h1>
            <p style={{ fontSize: 15, color: C.muted, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Real-time inventory, digital price tags, supplier ordering, and multi-store analytics — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="bp" style={{ padding: '12px 28px', fontSize: 14 }} onClick={() => setMode('register')}>Start free trial</button>
              <button className="bg" style={{ padding: '12px 28px', fontSize: 14 }} onClick={() => setMode('login')}>Sign in →</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, padding: '0 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>, title: 'Digital Price Tags', desc: 'Push price & shelf-life updates wirelessly to smart shelf tags across your store.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>, title: 'Inventory Control', desc: 'Barcode scanning, expiry tracking, and low-stock alerts with one-click reorder.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>, title: 'Supplier Orders', desc: 'Place, track, and receive orders from suppliers with full status visibility.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>, title: 'Analytics', desc: 'Sales trends, stock health, and store comparisons across all your locations.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" /></svg>, title: 'Multi-Store', desc: 'Manage every location from a single dashboard. Switch stores instantly.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" /></svg>, title: 'Role-Based Access', desc: 'Separate portals for store managers, suppliers, and platform admins.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 22, marginBottom: 10, color: C.accent }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '60px 32px', background: C.surface }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: 12, color: C.muted, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Simple, transparent pricing</div>
                <h2 style={{ fontFamily: DF, fontSize: 28, fontWeight: 700, color: '#b3b2b8' }}>Choose your plan</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
                {plans?.map((plan, idx) => (
                  <div key={plan.id} className="card" style={{ padding: 24, border: idx === 1 ? `2px solid ${plan.color}` : `1px solid ${C.border}`, position: 'relative' }}>
                    {idx === 1 && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', padding: '3px 12px', borderRadius: 100, fontSize: 10, fontWeight: 500 }}>MOST POPULAR</div>}
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
                      {plan.features.map(feature => (
                        <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                          <span style={{ color: C.green }}>✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button className="bp" style={{ width: '100%', background: idx === 1 ? plan.color : C.accent }} onClick={() => setMode('register')}>Get started</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, padding: '40px 32px', background: C.surface }}>
            <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: C.muted, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>Try a demo account</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {DEMO.map(d => (
                  <button key={d.role} onClick={() => { setEmail(d.email); setPass(d.pass); setMode('login'); }} style={{ background: `${d.color}18`, border: `1px solid ${d.color}44`, color: d.color, padding: '10px 20px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                    {d.label} demo
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(mode === 'login' || mode === 'register') && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <img src="/shelfos_logo.svg" alt="ShelfOS" style={{ width: 40, height: 40, marginBottom: 12 }} />
              <div style={{ fontFamily: DF, fontSize: 14, fontWeight: 700, letterSpacing: '.05em' }}>SHELF<span style={{ color: C.accent }}>OS</span></div>
            </div>

            {mode === 'login' && (
              <div className="card" style={{ padding: 28 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Welcome back</div>
                {err && <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: C.red, marginBottom: 14 }}>{err}</div>}
                <form onSubmit={doLogin}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Email address</div>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Password</div>
                    <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
                  </div>
                  <button type="submit" className="bp" style={{ width: '100%', marginBottom: 14 }}>Sign in</button>
                  <div style={{ textAlign: 'center', fontSize: 12, color: C.muted }}>
                    New here? <button type="button" onClick={() => { setMode('register'); setErr(''); }} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', textDecoration: 'underline' }}>Create account</button>
                  </div>
                </form>
              </div>
            )}

            {mode === 'register' && (
              <div className="card" style={{ padding: 28 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Create your account</div>
                {err && <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: C.red, marginBottom: 14 }}>{err}</div>}
                <form onSubmit={doRegister}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Role</div>
                      <select value={regForm.role} onChange={e => setReg({ ...regForm, role: e.target.value })}>
                        <option value="store">Store Manager</option>
                        <option value="supplier">Supplier</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Full Name</div>
                      <input type="text" value={regForm.name} onChange={e => setReg({ ...regForm, name: e.target.value })} placeholder="Your name" required />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Email address</div>
                    <input type="email" value={regForm.email} onChange={e => setReg({ ...regForm, email: e.target.value })} placeholder="you@example.com" required />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Password</div>
                    <input type="password" value={regForm.password} onChange={e => setReg({ ...regForm, password: e.target.value })} placeholder="••••••••" required />
                  </div>
                  {regForm.role === 'store' && (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Store Name</div>
                        <input type="text" value={regForm.storeName} onChange={e => setReg({ ...regForm, storeName: e.target.value })} placeholder="Store name" />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>City</div>
                        <input type="text" value={regForm.city} onChange={e => setReg({ ...regForm, city: e.target.value })} placeholder="City, State" />
                      </div>
                    </>
                  )}
                  <button type="submit" className="bp" style={{ width: '100%', marginBottom: 14 }}>Create account</button>
                  <div style={{ textAlign: 'center', fontSize: 12, color: C.muted }}>
                    Already have an account? <button type="button" onClick={() => { setMode('login'); setErr(''); }} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', textDecoration: 'underline' }}>Sign in</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
