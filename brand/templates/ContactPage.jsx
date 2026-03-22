import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function ContactPage() {
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
        .grad-bar{height:4px;background:var(--g)}
        
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.5;text-decoration:none}
        .nav-links a:hover{opacity:1}
        
        .contact-layout{display:grid;grid-template-columns:1fr 1fr;max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px;gap:64px}
        
        /* LEFT */
        .contact-info h1{font-size:42px;font-weight:700;color:var(--white);margin-bottom:16px}
        .contact-info .lead{font-size:16px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:48px}
        .contact-channels{list-style:none}
        .contact-channel{display:flex;gap:16px;padding:20px 0;border-bottom:1px solid var(--border)}
        .contact-channel:first-child{border-top:1px solid var(--border)}
        .channel-icon{width:40px;height:40px;border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;position:relative;overflow:hidden}
        .channel-icon::before{content:'';position:absolute;inset:0;background:var(--g135);opacity:.06}
        .channel-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
        .channel-value{font-size:14px;color:var(--white);opacity:.7}
        
        /* RIGHT - FORM */
        .contact-form h2{font-size:22px;font-weight:700;color:var(--white);margin-bottom:8px}
        .contact-form .subtitle{font-size:13px;color:var(--white);opacity:.4;margin-bottom:32px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .form-group{margin-bottom:20px}
        .form-label{display:block;font-size:12px;font-weight:600;color:var(--white);opacity:.5;margin-bottom:6px}
        .form-input{width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:14px;font-family:var(--sg);outline:none;transition:border-color .2s}
        .form-input:focus{border-color:#333}
        .form-input::placeholder{color:var(--white);opacity:.2}
        .form-select{width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:14px;font-family:var(--sg);outline:none;appearance:none;cursor:pointer}
        .form-select option{background:var(--black);color:var(--white)}
        .form-textarea{width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:14px;font-family:var(--sg);outline:none;resize:vertical;min-height:120px;transition:border-color .2s}
        .form-textarea:focus{border-color:#333}
        .form-textarea::placeholder{color:var(--white);opacity:.2}
        .btn-submit{width:100%;padding:14px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .form-note{font-size:11px;color:var(--white);opacity:.3;margin-top:12px;text-align:center}
        
        footer{border-top:1px solid var(--border);padding:32px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3;margin-top:48px}
        
        @media(max-width:768px){
          .contact-layout{grid-template-columns:1fr;padding:48px 20px;gap:48px}
          .contact-info h1{font-size:32px}
          .form-row{grid-template-columns:1fr}
          nav{padding:14px 20px}.nav-links{display:none}
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
<nav>
  <div className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad</div>
  <div className="nav-links">
    <a href="https://blackroad-io.pages.dev">Home</a>
    <a href="https://design-blackroad-io.pages.dev">Work</a>
    <a href="https://hr-blackroad-io.pages.dev">About</a>
    <a href="#" style={{{ opacity: 1 }}}>Contact</a>
  </div>
</nav>

<div className="contact-layout">
  <div className="contact-info">
    <h1>Get in touch</h1>
    <p className="lead">Have a project in mind or want to collaborate? We'd love to hear from you.</p>
    <ul className="contact-channels">
      <li className="contact-channel">
        <div className="channel-icon">@</div>
        <div><div className="channel-label">Email</div><div className="channel-value">hello@blackroad.io</div></div>
      </li>
      <li className="contact-channel">
        <div className="channel-icon">◈</div>
        <div><div className="channel-label">GitHub</div><div className="channel-value">github.com/blackboxprogramming</div></div>
      </li>
      <li className="contact-channel">
        <div className="channel-icon">△</div>
        <div><div className="channel-label">Location</div><div className="channel-value">Distributed — Edge nodes worldwide</div></div>
      </li>
      <li className="contact-channel">
        <div className="channel-icon">○</div>
        <div><div className="channel-label">Response Time</div><div className="channel-value">Within 24 hours</div></div>
      </li>
    </ul>
  </div>

  <div className="contact-form">
    <h2>Send a message</h2>
    <p className="subtitle">Fill out the form below and we'll get back to you soon.</p>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">First Name</label>
        <input className="form-input" type="text" placeholder="Jane" />
      </div>
      <div className="form-group">
        <label className="form-label">Last Name</label>
        <input className="form-input" type="text" placeholder="Doe" />
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Email</label>
      <input className="form-input" type="email" placeholder="jane@example.com" />
    </div>
    <div className="form-group">
      <label className="form-label">Subject</label>
      <select className="form-select">
        <option>General Inquiry</option>
        <option>Partnership</option>
        <option>Technical Support</option>
        <option>Other</option>
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">Message</label>
      <textarea className="form-textarea" placeholder="Tell us about your project..."></textarea>
    </div>
    <button className="btn-submit">Send Message</button>
    <p className="form-note">We'll never share your information with third parties.</p>
  </div>
</div>

<footer>&copy; 2026 BlackRoad. All rights reserved.</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
