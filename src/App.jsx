import { AppProvider, useAuth, useApp } from './context/AppContext';
import LandingPage from './features/auth/LandingPage';
import StoreDashboard from './features/inventory/StoreDashboard';
import SupplierPortal from './features/supplier/SupplierPortal';
import AdminPanel from './features/admin/AdminPanel';
import { C } from './utils/constants';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:'DM Mono', monospace}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:#2a2a3f;border-radius:2px}
  input,select,textarea{font-family:'DM Mono', monospace;background:#0f0f1a;border:1px solid ${C.border2};color:${C.text};border-radius:7px;padding:9px 13px;font-size:13px;outline:none;width:100%;transition:border-color .2s}
  input:focus,select:focus,textarea:focus{border-color:${C.accent}}
  input::placeholder{color:${C.muted}}
  button{font-family:'DM Mono', monospace;cursor:pointer}
  .bp{background:${C.accent};color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;transition:all .2s}
  .bp:hover{background:${C.accent2};transform:translateY(-1px)}
  .bp:active{transform:none}
  .bp:disabled{opacity:.5;cursor:not-allowed}
  .bg{background:none;border:1px solid ${C.border2};color:#9090b0;padding:9px 16px;border-radius:8px;font-size:13px;transition:all .2s}
  .bg:hover{border-color:${C.accent};color:${C.text}}
  .card{background:${C.card};border:1px solid ${C.border};border-radius:14px}
  .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:500;white-space:nowrap}
  .sdot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0}
  .blink{animation:blink .9s ease-in-out infinite alternate}
  @keyframes blink{from{opacity:.25}to{opacity:1}}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(6px);padding:16px}
  .modal{background:${C.surface};border:1px solid ${C.border2};border-radius:18px;padding:28px;width:560px;max-width:100%;max-height:92vh;overflow-y:auto}
  .nb{background:none;border:none;border-bottom:2px solid transparent;color:${C.muted};padding:12px 14px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;transition:all .2s;white-space:nowrap;font-family:'DM Mono', monospace}
  .nb.act{color:${C.text};border-bottom-color:${C.accent}}
  .nb:hover{color:${C.text}}
  .trow{border-bottom:1px solid ${C.border}}
  .trow:hover{background:${C.surface}!important}
  th{color:${C.muted};font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:10px 14px;font-weight:400;text-align:left;white-space:nowrap}
  td{padding:11px 14px;font-size:13px;vertical-align:middle}
  .btrack{height:5px;border-radius:3px;background:${C.border};overflow:hidden;margin-top:4px}
  .bfill{height:100%;border-radius:3px;transition:width .5s}
  .toast-wrap{position:fixed;bottom:22px;right:22px;z-index:999;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none}
  .toast{background:${C.card};border:1px solid ${C.border2};border-radius:10px;padding:11px 16px;font-size:12px;display:flex;align-items:center;gap:9px;animation:tslide .22s ease;box-shadow:0 8px 30px rgba(0,0,0,.5)}
  @keyframes tslide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .sc{background:${C.card};border:1px solid ${C.border};border-radius:11px;padding:18px 20px}
  .order-timeline{display:flex;align-items:center;gap:0;margin:10px 0}
  .ot-step{flex:1;text-align:center;position:relative}
  .ot-step::before{content:'';position:absolute;top:10px;left:-50%;right:50%;height:2px;background:${C.border};z-index:0}
  .ot-step:first-child::before{display:none}
  .ot-dot{width:20px;height:20px;border-radius:50%;border:2px solid ${C.border};background:${C.card};display:inline-flex;align-items:center;justify-content:center;font-size:9px;position:relative;z-index:1;transition:all .3s}
  .ot-dot.done{background:${C.green};border-color:${C.green};color:#fff}
  .ot-dot.active{background:${C.accent};border-color:${C.accent};color:#fff;box-shadow:0 0 10px ${C.accent}66}
  .ot-label{font-size:9px;color:${C.muted};margin-top:4px;letter-spacing:.04em}
  .stat-up{color:${C.green};font-size:11px}
  .stat-dn{color:${C.red};font-size:11px}
  .tab-bar{display:flex;gap:2px;overflow-x:auto;border-bottom:1px solid ${C.border};padding:0 18px;background:#0a0a14}
`;

function AppContent() {
  const { session, isAdmin, isSupplier, login, register } = useAuth();
  const { toasts } = useApp();

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: C.bg, minHeight: '100vh', color: C.text }}>
      <style>{GLOBAL_CSS}</style>
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className="toast"><span className="sdot" style={{ background: t.color }} />{t.msg}</div>)}
      </div>
      {!session
        ? <LandingPage onLogin={login} onRegister={register} />
        : isAdmin
          ? <AdminPanel />
          : isSupplier
            ? <SupplierPortal />
            : <StoreDashboard />
      }
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
