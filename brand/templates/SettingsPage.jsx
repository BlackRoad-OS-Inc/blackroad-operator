import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function SettingsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        
        *{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
        img,svg{image-rendering:crisp-edges}
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        body{overflow-x:hidden;background:var(--bg);color:var(--white);font-family:var(--sg)}
        .grad-bar{height:3px;background:var(--g)}
        
        /* LAYOUT */
        .settings-layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
        .settings-sidebar{border-right:1px solid var(--border);padding:32px 16px}
        .settings-logo{font-weight:700;font-size:18px;color:var(--white);display:flex;align-items:center;gap:10px;padding:0 12px;margin-bottom:32px}
        .settings-logo-mark{width:24px;height:3px;border-radius:2px;background:var(--g)}
        
        .settings-nav{list-style:none}
        .settings-nav li{margin-bottom:2px}
        .settings-nav a{display:block;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:500;color:var(--white);opacity:.4;text-decoration:none;transition:all .15s}
        .settings-nav a:hover{opacity:.7}
        .settings-nav a.active{opacity:1;border:1px solid var(--border)}
        .settings-nav-sep{height:1px;background:var(--border);margin:16px 12px}
        
        .settings-main{padding:48px}
        .settings-main h1{font-size:24px;font-weight:700;color:var(--white);margin-bottom:8px}
        .settings-main .lead{font-size:14px;color:var(--white);opacity:.4;margin-bottom:40px}
        
        /* SECTIONS */
        .settings-section{margin-bottom:48px}
        .settings-section-title{font-size:16px;font-weight:600;color:var(--white);margin-bottom:4px}
        .settings-section-desc{font-size:12px;color:var(--white);opacity:.3;margin-bottom:20px}
        .settings-section-divider{height:1px;background:var(--border);margin-bottom:20px}
        
        /* FORM ELEMENTS */
        .s-form-group{margin-bottom:20px}
        .s-form-label{display:block;font-size:12px;font-weight:600;color:var(--white);opacity:.5;margin-bottom:6px}
        .s-form-input{width:100%;max-width:400px;padding:10px 14px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-family:var(--sg);outline:none;transition:border-color .2s}
        .s-form-input:focus{border-color:#333}
        .s-form-hint{font-size:11px;color:var(--white);opacity:.25;margin-top:4px}
        
        /* TOGGLE ROW */
        .toggle-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border)}
        .toggle-row:first-child{border-top:1px solid var(--border)}
        .toggle-info h4{font-size:13px;font-weight:500;color:var(--white)}
        .toggle-info p{font-size:12px;color:var(--white);opacity:.3;margin-top:2px}
        .toggle{position:relative;width:40px;height:22px;display:inline-block;flex-shrink:0}
        .toggle input{opacity:0;width:0;height:0}
        .toggle-slider{position:absolute;inset:0;background:transparent;border:1px solid var(--border);border-radius:11px;transition:.2s;cursor:pointer}
        .toggle-slider::before{content:'';position:absolute;width:16px;height:16px;left:2px;top:2px;background:var(--white);opacity:.3;border-radius:50%;transition:.2s}
        .toggle input:checked+.toggle-slider{border-color:#444}
        .toggle input:checked+.toggle-slider::before{transform:translateX(18px);opacity:1}
        
        /* BUTTONS */
        .btn-save{padding:10px 24px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-outline-sm{padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:12px;font-weight:500;cursor:pointer;font-family:var(--sg);transition:border-color .2s}
        .btn-outline-sm:hover{border-color:#333}
        .btn-danger{padding:10px 24px;border:1px solid var(--white);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg);opacity:.6}
        
        .btn-row{display:flex;gap:10px;margin-top:24px}
        
        /* DANGER ZONE */
        .danger-zone{border:1px solid var(--white);border-radius:10px;padding:24px;opacity:.5}
        .danger-zone h3{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
        .danger-zone p{font-size:12px;color:var(--white);opacity:.4;margin-bottom:16px}
        
        @media(max-width:768px){.settings-layout{grid-template-columns:1fr}.settings-sidebar{display:none}.settings-main{padding:24px 20px}}
        
        /* ═══ RESPONSIVE — fit to screen ═══ */
        @media(max-max-width:1024px;width:100%){
          .metrics-strip{grid-template-columns:repeat(3,1fr)}
          .org-grid,.grid-4,.tier-grid,.cap-grid,.stat-grid,.shield-grid,.surface-grid,.stats-row{grid-template-columns:repeat(2,1fr)}
          .node-grid{grid-template-columns:repeat(3,1fr)}
          .product-grid,.features-grid,.focus-grid,.gallery,.team-grid,.pricing{grid-template-columns:repeat(2,1fr)}
          .footer-grid{grid-template-columns:1fr 1fr}
          .cloud-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}
          .nav-links{display:none}
          .hero{padding:80px 20px 60px}
          .hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .section,.section-wide{padding:48px 20px}
          .metrics-strip{grid-template-columns:repeat(2,1fr)}
          .product-featured{grid-template-columns:1fr}
          .product-grid,.features-grid,.focus-grid,.gallery,.team-grid,.pricing,.cap-grid,.tier-grid,.shield-grid{grid-template-columns:1fr}
          .org-grid,.grid-4,.stat-grid,.stats-row,.surface-grid{grid-template-columns:1fr}
          .node-grid{grid-template-columns:1fr 1fr}
          .cloud-grid{grid-template-columns:1fr}
          footer{padding:32px 20px}
          .footer-grid{grid-template-columns:1fr}
          .footer-bottom{flex-direction:column;gap:12px;text-align:center}
          .topnav{padding:10px 16px}
          .topnav-links{gap:8px;flex-wrap:wrap}
          .topnav-links a{font-size:11px}
        }
        
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f5f5f5", overflowX: "hidden", width: "100%", fontFamily: grotesk }}>

<div className="grad-bar"></div>
<div className="settings-layout">
  <aside className="settings-sidebar">
    <div className="settings-logo"><div className="settings-logo-mark"></div> Settings</div>
    <ul className="settings-nav">
      <li><a href="#" className="active">General</a></li>
      <li><a href="#">Profile</a></li>
      <li><a href="#">Security</a></li>
      <li><a href="#">Notifications</a></li>
      <li><div className="settings-nav-sep"></div></li>
      <li><a href="#">Nodes</a></li>
      <li><a href="#">Network</a></li>
      <li><a href="#">API Keys</a></li>
      <li><div className="settings-nav-sep"></div></li>
      <li><a href="#">Billing</a></li>
      <li><a href="#">Team</a></li>
    </ul>
  </aside>

  <main className="settings-main">
    <h1>General Settings</h1>
    <p className="lead">Manage your account preferences and configuration.</p>

    <div className="settings-section">
      <div className="settings-section-title">Profile</div>
      <div className="settings-section-desc">Your public identity and contact information.</div>
      <div className="settings-section-divider"></div>
      <div className="s-form-group">
        <label className="s-form-label">Display Name</label>
        <input className="s-form-input" type="text" value="Alexa" />
      </div>
      <div className="s-form-group">
        <label className="s-form-label">Email</label>
        <input className="s-form-input" type="email" value="amundsonalexa@gmail.com" />
        <div className="s-form-hint">Used for notifications and account recovery.</div>
      </div>
      <div className="s-form-group">
        <label className="s-form-label">Username</label>
        <input className="s-form-input" type="text" value="blackroad" />
      </div>
      <div className="btn-row">
        <button className="btn-save">Save Changes</button>
        <button className="btn-outline-sm">Cancel</button>
      </div>
    </div>

    <div className="settings-section">
      <div className="settings-section-title">Preferences</div>
      <div className="settings-section-desc">Customize your experience.</div>
      <div className="settings-section-divider"></div>
      <div className="toggle-row">
        <div className="toggle-info"><h4>Dark mode</h4><p>Use dark theme across all pages</p></div>
        <label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label>
      </div>
      <div className="toggle-row">
        <div className="toggle-info"><h4>Email notifications</h4><p>Receive alerts for node status changes</p></div>
        <label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label>
      </div>
      <div className="toggle-row">
        <div className="toggle-info"><h4>Auto-healing</h4><p>Automatically restart failed services</p></div>
        <label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label>
      </div>
      <div className="toggle-row">
        <div className="toggle-info"><h4>Usage analytics</h4><p>Share anonymous usage data to improve the platform</p></div>
        <label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label>
      </div>
    </div>

    <div className="settings-section">
      <div className="settings-section-title">Danger Zone</div>
      <div className="settings-section-desc">Irreversible and destructive actions.</div>
      <div className="settings-section-divider"></div>
      <div className="danger-zone">
        <h3>Delete Account</h3>
        <p>Once you delete your account, there is no going back. All data will be permanently removed.</p>
        <button className="btn-danger">Delete Account</button>
      </div>
    </div>
  </main>
</div>






      </div>
    </>
  );
}
