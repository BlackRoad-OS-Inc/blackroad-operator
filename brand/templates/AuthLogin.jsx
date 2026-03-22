import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function AuthLogin() {
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
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        body{overflow-x:hidden;background:var(--bg);color:var(--white);font-family:var(--sg);min-height:100vh;display:flex;flex-direction:column}
        .grad-bar{height:4px;background:var(--g)}
        
        .auth-layout{flex:1;display:grid;grid-template-columns:1fr 1fr}
        
        /* LEFT - FORM */
        .auth-form-side{display:flex;align-items:center;justify-content:center;padding:48px}
        .auth-form-wrap{width:100%;max-width:380px}
        .auth-logo{font-weight:700;font-size:22px;color:var(--white);display:flex;align-items:center;gap:10px;margin-bottom:48px}
        .auth-logo-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .auth-form-wrap h1{font-size:28px;font-weight:700;color:var(--white);margin-bottom:8px}
        .auth-form-wrap .subtitle{font-size:14px;color:var(--white);opacity:.4;margin-bottom:36px}
        
        .form-group{margin-bottom:20px}
        .form-label{display:block;font-size:12px;font-weight:600;color:var(--white);opacity:.6;margin-bottom:6px}
        .form-input{width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:14px;font-family:var(--sg);outline:none;transition:border-color .2s}
        .form-input:focus{border-color:#333}
        .form-input::placeholder{color:var(--white);opacity:.2}
        .form-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
        .form-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--white);opacity:.5}
        .form-check input{accent-color:#fff}
        .form-link{font-size:13px;color:var(--white);opacity:.5;text-decoration:none}
        .form-link:hover{opacity:.8}
        
        .btn-auth{width:100%;padding:12px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sg);margin-bottom:16px}
        .btn-auth-outline{width:100%;padding:12px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:14px;font-weight:500;cursor:pointer;font-family:var(--sg);display:flex;align-items:center;justify-content:center;gap:8px;transition:border-color .2s}
        .btn-auth-outline:hover{border-color:#333}
        
        .divider-row{display:flex;align-items:center;gap:16px;margin:24px 0}
        .divider-line{flex:1;height:1px;background:var(--border)}
        .divider-text{font-size:11px;color:var(--white);opacity:.3;text-transform:uppercase;letter-spacing:.08em}
        
        .auth-footer{text-align:center;margin-top:32px;font-size:13px;color:var(--white);opacity:.4}
        .auth-footer a{color:var(--white);opacity:1;text-decoration:underline;text-underline-offset:2px}
        
        /* RIGHT - VISUAL */
        .auth-visual-side{border-left:1px solid var(--border);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
        .auth-visual-bg{position:absolute;inset:0}
        .auth-orb{position:absolute;border-radius:50%;filter:blur(100px);opacity:.12}
        .auth-orb-1{width:500px;height:500px;background:#FF2255;top:-100px;left:-100px}
        .auth-orb-2{width:400px;height:400px;background:#4488FF;bottom:-50px;right:-50px}
        .auth-orb-3{width:300px;height:300px;background:#8844FF;top:30%;left:30%}
        .auth-visual-content{position:relative;text-align:center;padding:48px;max-width:400px}
        .auth-visual-content h2{font-size:28px;font-weight:700;color:var(--white);margin-bottom:16px}
        .auth-visual-content p{font-size:14px;color:var(--white);opacity:.5;line-height:1.7}
        .auth-visual-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;color:var(--white);opacity:.6;margin-top:32px}
        .auth-visual-badge::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--g135)}
        
        @media(max-width:768px){
          .auth-layout{grid-template-columns:1fr}
          .auth-visual-side{display:none}
          .auth-form-side{padding:32px 20px}
        }
        
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
<div className="auth-layout">
  <div className="auth-form-side">
    <div className="auth-form-wrap">
      <div className="auth-logo"><div className="auth-logo-mark"></div> BlackRoad</div>
      <h1>Welcome back</h1>
      <p className="subtitle">Sign in to your account to continue.</p>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" placeholder="you@example.com" />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input className="form-input" type="password" placeholder="Enter your password" />
      </div>
      <div className="form-row">
        <label className="form-check"><input type="checkbox" /> Remember me</label>
        <a className="form-link" href="#">Forgot password?</a>
      </div>
      <button className="btn-auth">Sign In</button>

      <div className="divider-row">
        <div className="divider-line"></div>
        <span className="divider-text">or</span>
        <div className="divider-line"></div>
      </div>

      <button className="btn-auth-outline">Continue with GitHub</button>

      <div className="auth-footer">
        Don't have an account? <a href="#">Sign up</a>
      </div>
    </div>
  </div>

  <div className="auth-visual-side">
    <div className="auth-visual-bg">
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>
      <div className="auth-orb auth-orb-3"></div>
    </div>
    <div className="auth-visual-content">
      <h2>Sovereign infrastructure at your fingertips</h2>
      <p>Deploy AI agents on hardware you own. No cloud dependency, no vendor lock-in.</p>
      <div className="auth-visual-badge">52 TOPS edge compute active</div>
    </div>
  </div>
</div>






      </div>
    </>
  );
}
