import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadBrandGuide() {
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
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--sg);line-height:1.6}
        a{color:var(--text);text-decoration:none}
        button{font-family:var(--sg);cursor:pointer}
        input,textarea,select{font-family:var(--sg)}
        .grad-bar{height:4px;background:var(--g)}
        .container{max-max-width:1100px;width:100%;margin:0 auto;padding:0 24px}
        .section{padding:80px 0}
        .section-head{margin-bottom:48px}
        .section-num{font-family:var(--jb);font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-weight:700;font-size:32px;color:var(--white);margin-bottom:8px}
        .section-desc{font-size:14px;color:var(--sub);max-width:500px}
        .divider{height:2px;border-radius:1px;background:var(--g);opacity:.2;margin:0 0 48px}
        .comp-label{font-family:var(--jb);font-size:10px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}
        .comp-group{margin-bottom:48px}
        .row{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start}
        .col{flex:1;min-width:0}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
        .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .spacer{height:32px}
        
        /* ─── NAVIGATION ─── */
        .nav-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:var(--card);border:1px solid var(--border);border-radius:10px}
        .nav-logo{font-weight:700;font-size:18px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-logo-bar{width:24px;height:4px;border-radius:2px;background:var(--g)}
        .nav-links{display:flex;gap:28px}
        .nav-links a{font-size:13px;font-weight:500;color:var(--sub);transition:color .15s}
        .nav-links a:hover{color:var(--white)}
        .nav-actions{display:flex;gap:10px;align-items:center}
        
        /* ─── BUTTONS ─── */
        .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:6px;font-weight:600;font-size:13px;border:none;transition:all .15s}
        .btn-sm{padding:7px 16px;font-size:12px;border-radius:5px}
        .btn-lg{padding:14px 32px;font-size:15px;border-radius:8px}
        .btn-white{background:var(--white);color:#000}
        .btn-white:hover{background:#e0e0e0}
        .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}
        .btn-outline:hover{border-color:#444}
        .btn-ghost{background:transparent;border:none;color:var(--sub)}
        .btn-ghost:hover{color:var(--white)}
        .btn-dark{background:var(--elevated);color:var(--text);border:1px solid var(--border)}
        .btn-icon{width:36px;height:36px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;background:var(--elevated);border:1px solid var(--border);color:var(--sub);font-size:14px}
        .btn-group{display:inline-flex;gap:0}
        .btn-group .btn{border-radius:0;border-right:1px solid var(--border)}
        .btn-group .btn:first-child{border-radius:6px 0 0 6px}
        .btn-group .btn:last-child{border-radius:0 6px 6px 0;border-right:none}
        
        /* ─── CARDS ─── */
        .card{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden}
        .card-grad{height:3px;background:var(--g)}
        .card-body{padding:20px}
        .card-sm .card-body{padding:16px}
        .card-title{font-weight:600;font-size:15px;color:var(--white);margin-bottom:6px}
        .card-text{font-size:13px;color:var(--sub);line-height:1.7}
        .card-meta{font-family:var(--jb);font-size:10px;color:var(--muted);margin-top:10px}
        .card-footer{padding:14px 20px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        .card-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        .card-header-title{font-weight:600;font-size:14px;color:var(--white)}
        
        /* ─── BADGES ─── */
        .badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;background:var(--elevated);border:1px solid var(--border);color:var(--text)}
        .badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .badge-grad .badge-dot{background:var(--g135)}
        .badge-line{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;color:var(--text)}
        .badge-line::before{content:'';width:12px;height:3px;border-radius:2px;background:var(--g)}
        
        /* ─── INPUTS ─── */
        .input{width:100%;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;outline:none;transition:border-color .15s}
        .input:focus{border-color:#333}
        .input-label{display:block;font-size:12px;font-weight:600;color:var(--sub);margin-bottom:6px;letter-spacing:.02em}
        .input-hint{font-size:11px;color:var(--muted);margin-top:4px}
        .input-group{position:relative}
        .input-group .input{padding-left:36px}
        .input-group-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--muted)}
        .textarea{width:100%;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;outline:none;resize:vertical;min-height:80px;transition:border-color .15s}
        .textarea:focus{border-color:#333}
        .select{width:100%;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;outline:none;appearance:none;cursor:pointer}
        
        /* ─── TOGGLE / CHECKBOX / RADIO ─── */
        .toggle{position:relative;width:40px;height:22px;display:inline-block}
        .toggle input{opacity:0;width:0;height:0}
        .toggle-slider{position:absolute;inset:0;background:var(--elevated);border:1px solid var(--border);border-radius:11px;transition:.2s;cursor:pointer}
        .toggle-slider::before{content:'';position:absolute;width:16px;height:16px;left:2px;top:2px;background:var(--sub);border-radius:50%;transition:.2s}
        .toggle input:checked+.toggle-slider{background:var(--elevated);border-color:#333}
        .toggle input:checked+.toggle-slider::before{transform:translateX(18px);background:var(--white)}
        .checkbox{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text)}
        .checkbox input{width:16px;height:16px;accent-color:#fff}
        .radio{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text)}
        .radio input{width:16px;height:16px;accent-color:#fff}
        
        /* ─── AVATARS ─── */
        .avatar{width:36px;height:36px;border-radius:50%;background:var(--elevated);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:var(--sub);flex-shrink:0}
        .avatar-sm{width:28px;height:28px;font-size:11px}
        .avatar-lg{width:48px;height:48px;font-size:16px}
        .avatar-xl{width:64px;height:64px;font-size:20px}
        .avatar-group{display:flex}
        .avatar-group .avatar{margin-left:-8px;border:2px solid var(--bg)}
        .avatar-group .avatar:first-child{margin-left:0}
        .avatar-ring{box-shadow:0 0 0 2px var(--bg),0 0 0 4px transparent;background-image:var(--g135);background-origin:border-box;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:2px}
        .avatar-ring-inner{width:100%;height:100%;border-radius:50%;background:var(--elevated);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:var(--sub)}
        
        /* ─── TAGS ─── */
        .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:500;background:var(--elevated);border:1px solid var(--border);color:var(--sub)}
        .tag-close{background:none;border:none;color:var(--muted);font-size:12px;cursor:pointer;padding:0;margin-left:2px}
        .tag-group{display:flex;gap:6px;flex-wrap:wrap}
        
        /* ─── TABLES ─── */
        .table-wrap{border:1px solid var(--border);border-radius:10px;overflow:hidden}
        .table{width:100%;border-collapse:collapse}
        .table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:var(--sub);text-transform:uppercase;letter-spacing:.06em;background:var(--card);border-bottom:1px solid var(--border)}
        .table td{padding:12px 16px;font-size:13px;color:var(--text);border-bottom:1px solid var(--border)}
        .table tr:last-child td{border-bottom:none}
        .table tr:hover td{background:var(--hover)}
        
        /* ─── LISTS ─── */
        .list{list-style:none}
        .list-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);font-size:13px;color:var(--text);transition:background .1s}
        .list-item:last-child{border-bottom:none}
        .list-item:hover{background:var(--hover)}
        .list-item-indicator{width:20px;height:3px;border-radius:2px;background:var(--g);flex-shrink:0}
        .list-item-dot{width:6px;height:6px;border-radius:50%;background:var(--white);flex-shrink:0}
        .list-item-text{flex:1}
        .list-item-meta{font-family:var(--jb);font-size:10px;color:var(--muted)}
        .list-bordered{border:1px solid var(--border);border-radius:8px;overflow:hidden}
        
        /* ─── TIMELINE ─── */
        .timeline{position:relative;padding-left:28px}
        .timeline::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:var(--border)}
        .timeline-item{position:relative;padding-bottom:32px}
        .timeline-item:last-child{padding-bottom:0}
        .timeline-dot{position:absolute;left:-24px;top:4px;width:12px;height:12px;border-radius:50%;border:2px solid var(--border);background:var(--bg)}
        .timeline-dot-active{border:none;background:var(--g135);width:12px;height:12px}
        .timeline-title{font-weight:600;font-size:14px;color:var(--white);margin-bottom:4px}
        .timeline-text{font-size:13px;color:var(--sub)}
        .timeline-time{font-family:var(--jb);font-size:10px;color:var(--muted);margin-top:4px}
        
        /* ─── ACCORDION ─── */
        .accordion{border:1px solid var(--border);border-radius:8px;overflow:hidden}
        .accordion-item{border-bottom:1px solid var(--border)}
        .accordion-item:last-child{border-bottom:none}
        .accordion-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--card);border:none;color:var(--white);font-size:14px;font-weight:500;cursor:pointer;text-align:left;transition:background .1s}
        .accordion-trigger:hover{background:var(--hover)}
        .accordion-trigger .arrow{font-size:12px;color:var(--muted);transition:transform .2s}
        .accordion-trigger.active .arrow{transform:rotate(180deg)}
        .accordion-content{display:none;padding:14px 18px;font-size:13px;color:var(--sub);line-height:1.7;background:var(--bg);border-top:1px solid var(--border)}
        .accordion-content.open{display:block}
        
        /* ─── TABS ─── */
        .tabs{display:flex;gap:0;border-bottom:1px solid var(--border)}
        .tab{padding:10px 20px;font-size:13px;font-weight:500;color:var(--sub);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s}
        .tab:hover{color:var(--white)}
        .tab.active{color:var(--white);border-bottom-color:var(--white)}
        .tab-content{display:none;padding:20px 0}
        .tab-content.active{display:block}
        
        /* ─── ALERTS ─── */
        .alert{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:8px;font-size:13px;border:1px solid var(--border);background:var(--card)}
        .alert-bar{width:3px;min-height:100%;border-radius:2px;background:var(--g);flex-shrink:0;align-self:stretch}
        .alert-title{font-weight:600;color:var(--white);margin-bottom:2px}
        .alert-text{color:var(--sub)}
        
        /* ─── PROGRESS ─── */
        .progress-track{width:100%;height:4px;background:var(--elevated);border-radius:2px;overflow:hidden}
        .progress-fill{height:100%;border-radius:2px;background:var(--g);transition:width .3s}
        .progress-label{display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px}
        .progress-label span:first-child{color:var(--text);font-weight:500}
        .progress-label span:last-child{color:var(--muted);font-family:var(--jb)}
        
        /* ─── TOOLTIP ─── */
        .tooltip-wrap{position:relative;display:inline-block}
        .tooltip-wrap .tooltip{visibility:hidden;opacity:0;position:absolute;bottom:calc(100%+8px);left:50%;transform:translateX(-50%);padding:6px 12px;background:var(--white);color:#000;font-size:11px;font-weight:500;border-radius:4px;white-space:nowrap;transition:opacity .15s;z-index:10}
        .tooltip-wrap .tooltip::after{content:'';position:absolute;top:100%;left:50%;margin-left:-4px;border:4px solid transparent;border-top-color:var(--white)}
        .tooltip-wrap:hover .tooltip{visibility:visible;opacity:1}
        
        /* ─── BREADCRUMBS ─── */
        .breadcrumbs{display:flex;align-items:center;gap:8px;font-size:13px}
        .breadcrumbs a{color:var(--sub)}
        .breadcrumbs a:hover{color:var(--white)}
        .breadcrumbs .sep{color:var(--muted);font-size:11px}
        .breadcrumbs .current{color:var(--white);font-weight:500}
        
        /* ─── PAGINATION ─── */
        .pagination{display:flex;gap:4px}
        .page-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:13px;font-weight:500;background:var(--card);border:1px solid var(--border);color:var(--sub);cursor:pointer;transition:all .15s}
        .page-btn:hover{border-color:#333;color:var(--white)}
        .page-btn.active{background:var(--white);color:#000;border-color:var(--white)}
        
        /* ─── STATS ─── */
        .stat{padding:20px}
        .stat-value{font-size:32px;font-weight:700;color:var(--white)}
        .stat-label{font-size:12px;color:var(--sub);margin-top:2px}
        .stat-change{font-family:var(--jb);font-size:11px;color:var(--sub);margin-top:6px}
        .stat-bar{width:100%;height:3px;border-radius:2px;background:var(--g);margin-top:12px}
        
        /* ─── SKELETON ─── */
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skeleton{background:linear-gradient(90deg,var(--elevated) 25%,#1a1a1a 50%,var(--elevated) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:4px}
        .skeleton-text{height:12px;margin-bottom:8px}
        .skeleton-text:last-child{width:60%}
        .skeleton-title{height:18px;width:40%;margin-bottom:12px}
        .skeleton-avatar{width:36px;height:36px;border-radius:50%}
        .skeleton-img{height:120px;border-radius:6px;margin-bottom:12px}
        
        /* ─── DROPDOWN ─── */
        .dropdown{position:relative;display:inline-block}
        .dropdown-menu{position:absolute;top:calc(100%+6px);left:0;min-width:200px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:4px;z-index:100;display:none;box-shadow:0 8px 30px rgba(0,0,0,.5)}
        .dropdown.open .dropdown-menu{display:block}
        .dropdown-item{display:flex;align-items:center;gap:10px;padding:8px 12px;font-size:13px;color:var(--text);border-radius:5px;cursor:pointer;transition:background .1s}
        .dropdown-item:hover{background:var(--hover)}
        .dropdown-divider{height:1px;background:var(--border);margin:4px 0}
        .dropdown-label{padding:6px 12px;font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
        
        /* ─── MODAL ─── */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;z-index:1000}
        .modal-overlay.open{display:flex}
        .modal{background:var(--card);border:1px solid var(--border);border-radius:12px;width:480px;max-width:90vw;overflow:hidden}
        .modal-grad{height:3px;background:var(--g)}
        .modal-header{padding:20px 24px 0;display:flex;align-items:center;justify-content:space-between}
        .modal-title{font-weight:600;font-size:16px;color:var(--white)}
        .modal-close{background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer}
        .modal-body{padding:16px 24px}
        .modal-body p{font-size:13px;color:var(--sub);line-height:1.7}
        .modal-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end}
        
        /* ─── TOAST ─── */
        .toast{display:flex;align-items:center;gap:12px;padding:14px 18px;background:var(--card);border:1px solid var(--border);border-radius:8px;max-width:380px;font-size:13px}
        .toast-bar{width:3px;min-height:32px;border-radius:2px;background:var(--g);flex-shrink:0;align-self:stretch}
        .toast-text{flex:1;color:var(--text)}
        .toast-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px}
        
        /* ─── COMMAND PALETTE ─── */
        .cmd-palette{background:var(--card);border:1px solid var(--border);border-radius:12px;width:560px;max-width:90vw;overflow:hidden}
        .cmd-input-wrap{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
        .cmd-input{flex:1;background:none;border:none;color:var(--white);font-size:14px;outline:none}
        .cmd-input::placeholder{color:var(--muted)}
        .cmd-prefix{font-family:var(--jb);font-size:12px;color:var(--muted)}
        .cmd-results{max-height:300px;overflow-y:auto;padding:4px}
        .cmd-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:6px;cursor:pointer;transition:background .1s}
        .cmd-item:hover,.cmd-item.selected{background:var(--hover)}
        .cmd-item-icon{font-size:14px;color:var(--muted);width:20px;text-align:center}
        .cmd-item-text{flex:1;font-size:13px;color:var(--text)}
        .cmd-item-shortcut{font-family:var(--jb);font-size:10px;color:var(--muted)}
        .cmd-group-label{padding:8px 14px;font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
        .cmd-footer{padding:10px 18px;border-top:1px solid var(--border);display:flex;gap:16px;font-family:var(--jb);font-size:10px;color:var(--muted)}
        
        /* ─── BLOG ─── */
        .blog-card{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden}
        .blog-img{height:180px;background:var(--elevated);position:relative}
        .blog-img-grad{position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--g)}
        .blog-body{padding:20px}
        .blog-tag{font-size:10px;font-weight:600;color:var(--sub);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
        .blog-title{font-weight:600;font-size:17px;color:var(--white);margin-bottom:8px;line-height:1.4}
        .blog-excerpt{font-size:13px;color:var(--sub);line-height:1.7;margin-bottom:12px}
        .blog-footer{display:flex;align-items:center;gap:10px}
        .blog-author{font-size:12px;font-weight:500;color:var(--text)}
        .blog-date{font-family:var(--jb);font-size:10px;color:var(--muted)}
        .blog-read{font-family:var(--jb);font-size:10px;color:var(--muted);margin-left:auto}
        
        /* ─── BLOG POST (full) ─── */
        .post{max-width:680px;margin:0 auto}
        .post h1{font-weight:700;font-size:36px;color:var(--white);line-height:1.2;margin-bottom:16px}
        .post h2{font-weight:600;font-size:22px;color:var(--white);margin:32px 0 12px}
        .post h3{font-weight:600;font-size:17px;color:var(--white);margin:24px 0 8px}
        .post p{font-size:15px;color:#bbb;line-height:1.8;margin-bottom:16px}
        .post blockquote{border-left:3px solid;border-image:var(--g) 1;padding:12px 20px;margin:20px 0;font-size:15px;color:var(--sub);font-style:italic}
        .post code{font-family:var(--jb);font-size:13px;background:var(--elevated);padding:2px 6px;border-radius:3px}
        .post pre{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:18px;margin:20px 0;overflow-x:auto}
        .post pre code{background:none;padding:0;font-size:12px;color:var(--text);line-height:1.7}
        .post ul,.post ol{margin:12px 0 16px 20px;font-size:15px;color:#bbb;line-height:1.8}
        .post img{width:100%;border-radius:8px;margin:20px 0}
        .post hr{border:none;height:2px;background:var(--g);opacity:.15;margin:40px 0;border-radius:1px}
        .post-meta{display:flex;align-items:center;gap:12px;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid var(--border)}
        .post-meta .avatar{margin-right:4px}
        .post-author{font-weight:500;font-size:13px;color:var(--text)}
        .post-date{font-family:var(--jb);font-size:11px;color:var(--muted)}
        
        /* ─── PRICING ─── */
        .pricing-card{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;text-align:center;padding:32px 24px}
        .pricing-featured{border-color:#333}
        .pricing-featured .pricing-grad{height:3px;background:var(--g);margin:-32px -24px 24px}
        .pricing-name{font-weight:600;font-size:14px;color:var(--sub);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px}
        .pricing-price{font-weight:700;font-size:40px;color:var(--white);margin-bottom:4px}
        .pricing-period{font-size:12px;color:var(--muted);margin-bottom:24px}
        .pricing-features{list-style:none;text-align:left;margin-bottom:28px}
        .pricing-features li{padding:8px 0;font-size:13px;color:var(--sub);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
        .pricing-features li:last-child{border-bottom:none}
        .pricing-check{width:14px;height:3px;border-radius:2px;background:var(--g);flex-shrink:0}
        
        /* ─── TESTIMONIAL ─── */
        .testimonial{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:24px}
        .testimonial-text{font-size:14px;color:#bbb;line-height:1.7;margin-bottom:16px;font-style:italic}
        .testimonial-author{display:flex;align-items:center;gap:12px}
        .testimonial-name{font-weight:600;font-size:13px;color:var(--white)}
        .testimonial-role{font-size:11px;color:var(--muted)}
        .testimonial-bar{width:32px;height:3px;border-radius:2px;background:var(--g);margin-bottom:16px}
        
        /* ─── STEPS ─── */
        .steps{display:flex;gap:0;align-items:flex-start}
        .step{flex:1;text-align:center;position:relative}
        .step-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--border);background:var(--bg);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--muted)}
        .step-active .step-dot{border:none;background:var(--white);color:#000}
        .step-complete .step-dot{border:none;background:var(--white);color:#000}
        .step-line{position:absolute;top:14px;left:calc(50% + 20px);right:calc(-50% + 20px);height:2px;background:var(--border)}
        .step-active .step-line{background:var(--g)}
        .step-complete .step-line{background:var(--g)}
        .step:last-child .step-line{display:none}
        .step-label{font-size:12px;font-weight:500;color:var(--muted)}
        .step-active .step-label{color:var(--white)}
        
        /* ─── CHANGELOG ─── */
        .changelog-item{padding:24px 0;border-bottom:1px solid var(--border)}
        .changelog-version{display:inline-flex;align-items:center;gap:8px;margin-bottom:8px}
        .changelog-version-num{font-weight:700;font-size:16px;color:var(--white)}
        .changelog-version-bar{width:32px;height:3px;border-radius:2px;background:var(--g)}
        .changelog-date{font-family:var(--jb);font-size:11px;color:var(--muted);margin-bottom:12px}
        .changelog-list{list-style:none}
        .changelog-list li{display:flex;gap:10px;padding:4px 0;font-size:13px;color:var(--sub)}
        .changelog-list li::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--white);flex-shrink:0;margin-top:7px}
        .changelog-type{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;background:var(--elevated);border:1px solid var(--border);border-radius:3px;color:var(--sub);margin-right:4px}
        
        /* ─── EMPTY STATE ─── */
        .empty-state{text-align:center;padding:60px 20px}
        .empty-icon{width:64px;height:64px;border-radius:50%;background:var(--elevated);border:1px solid var(--border);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--muted)}
        .empty-title{font-weight:600;font-size:16px;color:var(--white);margin-bottom:6px}
        .empty-text{font-size:13px;color:var(--sub);margin-bottom:20px;max-width:300px;margin-left:auto;margin-right:auto}
        
        /* ─── KBD ─── */
        .kbd{display:inline-flex;align-items:center;padding:2px 8px;background:var(--elevated);border:1px solid var(--border);border-radius:4px;font-family:var(--jb);font-size:11px;color:var(--sub);line-height:1.8}
        
        /* ─── SIDEBAR ─── */
        .sidebar{width:240px;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;flex-shrink:0}
        .sidebar-section{margin-bottom:16px}
        .sidebar-label{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;padding:8px 10px}
        .sidebar-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;font-size:13px;color:var(--sub);cursor:pointer;transition:all .1s}
        .sidebar-item:hover{background:var(--hover);color:var(--text)}
        .sidebar-item.active{background:var(--hover);color:var(--white);font-weight:500}
        .sidebar-item-icon{font-size:14px;width:18px;text-align:center}
        .sidebar-item-badge{margin-left:auto;font-family:var(--jb);font-size:10px;color:var(--muted)}
        .sidebar-divider{height:1px;background:var(--border);margin:8px 0}
        
        /* ─── SEARCH ─── */
        .search-result{padding:16px;border-bottom:1px solid var(--border)}
        .search-result:last-child{border-bottom:none}
        .search-result:hover{background:var(--hover)}
        .search-title{font-weight:600;font-size:14px;color:var(--white);margin-bottom:4px}
        .search-snippet{font-size:13px;color:var(--sub);line-height:1.6;margin-bottom:6px}
        .search-url{font-family:var(--jb);font-size:11px;color:var(--muted)}
        
        /* ─── FEATURE GRID ─── */
        .feature{padding:24px;border:1px solid var(--border);border-radius:10px;background:var(--card)}
        .feature-icon{width:40px;height:40px;border-radius:8px;background:var(--elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--sub);margin-bottom:14px;position:relative;overflow:hidden}
        .feature-icon::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--g)}
        .feature-title{font-weight:600;font-size:14px;color:var(--white);margin-bottom:6px}
        .feature-text{font-size:13px;color:var(--sub);line-height:1.6}
        
        /* ─── FOOTER ─── */
        .site-footer{border-top:1px solid var(--border);padding:48px 0 32px}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px}
        .footer-brand{font-weight:700;font-size:18px;color:var(--white);margin-bottom:12px}
        .footer-brand-bar{width:48px;height:3px;border-radius:2px;background:var(--g);margin-bottom:12px}
        .footer-desc{font-size:13px;color:var(--sub);line-height:1.6}
        .footer-heading{font-weight:600;font-size:12px;color:var(--white);text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px}
        .footer-links{list-style:none}
        .footer-links li{margin-bottom:8px}
        .footer-links a{font-size:13px;color:var(--sub);transition:color .15s}
        .footer-links a:hover{color:var(--white)}
        .footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:24px;border-top:1px solid var(--border)}
        .footer-copy{font-size:12px;color:var(--muted)}
        
        /* ─── MISC ─── */
        .divider-thin{height:1px;background:var(--border)}
        .text-muted{color:var(--muted)}
        .text-sub{color:var(--sub)}
        .text-white{color:var(--white)}
        .fw-600{font-weight:600}
        .fw-700{font-weight:700}
        .fs-11{font-size:11px}
        .fs-12{font-size:12px}
        .fs-13{font-size:13px}
        .fs-14{font-size:14px}
        .mono{font-family:var(--jb)}
        .mt-8{margin-top:8px}
        .mt-16{margin-top:16px}
        .mt-24{margin-top:24px}
        .mt-32{margin-top:32px}
        .mb-8{margin-bottom:8px}
        .mb-16{margin-bottom:16px}
        .mb-24{margin-bottom:24px}
        
        /* ─── ANIMATIONS ─── */
        @keyframes gradSweep{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes pulseRing{0%{transform:scale(.3);opacity:1}100%{transform:scale(1.8);opacity:0}}
        @keyframes barWave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
        @keyframes orbit{0%{transform:rotate(0deg) translateX(50px) rotate(0deg)}100%{transform:rotate(360deg) translateX(50px) rotate(-360deg)}}
        @keyframes loadSlide{0%{left:-30%}100%{left:100%}}
        @keyframes morph{0%,100%{border-radius:50%}25%{border-radius:30% 70% 50% 50%}50%{border-radius:50% 30% 70% 50%}75%{border-radius:70% 50% 30% 70%}}
        @keyframes float1{0%,100%{transform:translate(0,0)}33%{transform:translate(30px,-20px)}66%{transform:translate(-15px,15px)}}
        @keyframes float2{0%,100%{transform:translate(0,0)}33%{transform:translate(-25px,25px)}66%{transform:translate(20px,-10px)}}
        @keyframes typewriter{0%{width:0}50%{width:100%}90%{width:100%}100%{width:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        
        .anim-sweep{height:6px;border-radius:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF,#FF6B2B);background-size:200% 100%;animation:gradSweep 3s linear infinite}
        .anim-morph{width:80px;height:80px;background:var(--g135);animation:morph 6s ease-in-out infinite}
        .spinner{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--white);border-radius:50%;animation:spin .6s linear infinite}
        
        @media(max-width:768px){
        .grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
        .row{flex-direction:column}
        .footer-grid{grid-template-columns:1fr 1fr}
        .steps{flex-direction:column;gap:16px}
        .nav-links{display:none}
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

<div className="container">
<div style={{{ textAlign: "center", padding: "80px 0 40px" }}}>
<div style={{{ width: 160, height: 6, borderRadius: 3, background: "var(--g)", margin: "0 auto 24px" }}}></div>
<h1 style={{{ fontWeight: 700, fontSize: 56, color: "var(--white)", letterSpacing: "-.03em" }}}>BlackRoad Brand Guide</h1>
<p style={{{ fontSize: 14, color: "var(--sub)", marginTop: 12 }}}>200+ components · Space Grotesk · Gradient-only color</p>
</div>
</div>


<div className="container section" id="navigation">
<div className="section-head"><div className="section-num">01</div><div className="section-title">Navigation</div><div className="section-desc">Navbars, sidebars, breadcrumbs, tabs, pagination</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">1 · Primary Navbar</div>
<div className="nav-bar">
<div className="nav-logo"><div className="nav-logo-bar"></div>BlackRoad</div>
<div className="nav-links"><a href="https://blackroad-io.pages.dev">Product</a><a href="#">Vision</a><a href="#">Agents</a><a href="https://blackroad-docs-hub.pages.dev">Docs</a><a href="https://blackroad-store.pages.dev">Pricing</a></div>
<div className="nav-actions"><button className="btn btn-outline btn-sm">Sign In</button><button className="btn btn-white btn-sm">Get Started</button></div>
</div></div>

<div className="comp-group"><div className="comp-label">2 · Minimal Navbar</div>
<div className="nav-bar" style={{{ border: "none", background: "transparent", padding: "14px 0" }}}>
<div className="nav-logo"><div className="nav-logo-bar"></div>BlackRoad</div>
<div className="nav-links"><a href="https://hr-blackroad-io.pages.dev">About</a><a href="https://blackroad-research.pages.dev">Blog</a><a href="https://support-blackroad-io.pages.dev">Contact</a></div>
<button className="btn btn-ghost btn-sm">Menu →</button>
</div></div>

<div className="comp-group"><div className="comp-label">3 · Breadcrumbs</div>
<div className="breadcrumbs"><a href="https://blackroad-io.pages.dev">Home</a><span className="sep">/</span><a href="https://blackroad-docs-hub.pages.dev">Docs</a><span className="sep">/</span><a href="#">API</a><span className="sep">/</span><span className="current">Authentication</span></div>
<div className="spacer"></div>
<div className="comp-label">4 · Breadcrumbs with gradient separator</div>
<div className="breadcrumbs"><a href="#">Dashboard</a><span style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)", display: "inline-block" }}}></span><a href="#">Settings</a><span style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)", display: "inline-block" }}}></span><span className="current">API Keys</span></div>
</div>

<div className="comp-group"><div className="comp-label">5 · Tabs</div>
<div className="tabs" id="tabs1">
<button className="tab active" onclick="switchTab('tabs1','tc1',this)">Overview</button>
<button className="tab" onclick="switchTab('tabs1','tc2',this)">Analytics</button>
<button className="tab" onclick="switchTab('tabs1','tc3',this)">Settings</button>
<button className="tab" onclick="switchTab('tabs1','tc4',this)">Logs</button>
</div>
<div id="tc1" className="tab-content active"><p className="fs-13 text-sub">Overview content goes here. This is the default active tab.</p></div>
<div id="tc2" className="tab-content"><p className="fs-13 text-sub">Analytics dashboard with charts and metrics.</p></div>
<div id="tc3" className="tab-content"><p className="fs-13 text-sub">Configuration and preferences panel.</p></div>
<div id="tc4" className="tab-content"><p className="fs-13 text-sub">System logs and event history.</p></div>
</div>

<div className="comp-group"><div className="comp-label">6 · Tabs with gradient underline</div>
<div style={{{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)" }}}>
<button className="tab" style={{{ borderBottom: "2px solid transparent", marginBottom: -2, borderImage: "var(--g) 1", color: "var(--white)" }}}>Active</button>
<button className="tab" style={{{ marginBottom: -2 }}}>Queued</button>
<button className="tab" style={{{ marginBottom: -2 }}}>Archived</button>
</div></div>

<div className="comp-group"><div className="comp-label">7 · Pagination</div>
<div className="pagination">
<button className="page-btn">←</button><button className="page-btn active">1</button><button className="page-btn">2</button><button className="page-btn">3</button><button className="page-btn">...</button><button className="page-btn">12</button><button className="page-btn">→</button>
</div></div>

<div className="comp-group"><div className="comp-label">8 · Sidebar Navigation</div>
<div className="row">
<div className="sidebar">
<div className="sidebar-section">
<div className="sidebar-label">Main</div>
<div className="sidebar-item active"><span className="sidebar-item-icon">◈</span>Dashboard</div>
<div className="sidebar-item"><span className="sidebar-item-icon">◇</span>Agents<span className="sidebar-item-badge">12</span></div>
<div className="sidebar-item"><span className="sidebar-item-icon">◇</span>Deployments</div>
<div className="sidebar-item"><span className="sidebar-item-icon">◇</span>Analytics</div>
</div>
<div className="sidebar-divider"></div>
<div className="sidebar-section">
<div className="sidebar-label">Settings</div>
<div className="sidebar-item"><span className="sidebar-item-icon">◇</span>API Keys</div>
<div className="sidebar-item"><span className="sidebar-item-icon">◇</span>Team</div>
<div className="sidebar-item"><span className="sidebar-item-icon">◇</span>Billing</div>
</div>
</div>
<div className="col" style={{{ padding: 20 }}}>
<p className="fs-13 text-sub">Main content area next to the sidebar.</p>
</div>
</div></div>

<div className="comp-group"><div className="comp-label">9 · Vertical Tabs</div>
<div className="row" style={{{ gap: 0 }}}>
<div style={{{ border: "1px solid var(--border)", borderRadius: "8px 0 0 8px", overflow: "hidden", width: 180, flexShrink: 0 }}}>
<div className="sidebar-item active" style={{{ borderRadius: 0 }}}>General</div>
<div className="sidebar-item" style={{{ borderRadius: 0 }}}>Security</div>
<div className="sidebar-item" style={{{ borderRadius: 0 }}}>Notifications</div>
<div className="sidebar-item" style={{{ borderRadius: 0 }}}>Integrations</div>
</div>
<div style={{{ border: "1px solid var(--border)", borderLeft: "none", borderRadius: "0 8px 8px 0", padding: 20, flex: 1 }}}>
<p className="fs-13 text-sub">Tab content panel with settings form.</p>
</div>
</div></div>
</div>


<div className="container section" id="buttons">
<div className="section-head"><div className="section-num">02</div><div className="section-title">Buttons</div><div className="section-desc">All button variants, sizes, and groups</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">10 · Primary Buttons</div>
<div className="row"><button className="btn btn-white">Deploy</button><button className="btn btn-outline">View Logs</button><button className="btn btn-dark">Settings</button><button className="btn btn-ghost">Cancel</button></div></div>

<div className="comp-group"><div className="comp-label">11 · Small Buttons</div>
<div className="row"><button className="btn btn-white btn-sm">Save</button><button className="btn btn-outline btn-sm">Edit</button><button className="btn btn-dark btn-sm">Delete</button><button className="btn btn-ghost btn-sm">Skip</button></div></div>

<div className="comp-group"><div className="comp-label">12 · Large Buttons</div>
<div className="row"><button className="btn btn-white btn-lg">Get Started</button><button className="btn btn-outline btn-lg">Learn More</button></div></div>

<div className="comp-group"><div className="comp-label">13 · Icon Buttons</div>
<div className="row"><button className="btn-icon">+</button><button className="btn-icon">✕</button><button className="btn-icon">⟳</button><button className="btn-icon">⋯</button><button className="btn-icon">◈</button></div></div>

<div className="comp-group"><div className="comp-label">14 · Button Group</div>
<div className="btn-group"><button className="btn btn-dark">Day</button><button className="btn btn-dark">Week</button><button className="btn btn-dark" style={{{ background: "var(--white)", color: "#000" }}}>Month</button><button className="btn btn-dark">Year</button></div></div>

<div className="comp-group"><div className="comp-label">15 · Button with gradient bar</div>
<div className="row">
<div style={{{ display: "inline-flex", flexDirection: "column", overflow: "hidden", borderRadius: 6 }}}><div style={{{ height: 2, background: "var(--g)" }}}></div><button className="btn btn-dark" style={{{ borderRadius: "0 0 6px 6px", borderTop: "none" }}}>Deploy Agent</button></div>
<div style={{{ display: "inline-flex", flexDirection: "column", overflow: "hidden", borderRadius: 6 }}}><button className="btn btn-dark" style={{{ borderRadius: "6px 6px 0 0", borderBottom: "none" }}}>View Status</button><div style={{{ height: 2, background: "var(--g)" }}}></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">16 · Loading Button</div>
<div className="row"><button className="btn btn-white" disabled style={{{ opacity: ".7" }}}><span className="spinner" style={{{ width: 14, height: 14, borderWidth: 2, borderColor: "#000", borderTopColor: "transparent" }}}></span>Deploying...</button><button className="btn btn-outline" disabled style={{{ opacity: ".5" }}}>Processing</button></div></div>
</div>


<div className="container section" id="cards">
<div className="section-head"><div className="section-num">03</div><div className="section-title">Cards</div><div className="section-desc">Content containers in every variation</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">17 · Basic Card</div>
<div className="grid-3">
<div className="card"><div className="card-grad"></div><div className="card-body"><div className="card-title">Agent Alpha</div><div className="card-text">Autonomous task runner for distributed deployments across the fleet.</div><div className="card-meta">Updated 2h ago</div></div></div>
<div className="card"><div className="card-grad"></div><div className="card-body"><div className="card-title">Agent Beta</div><div className="card-text">Data pipeline processor for real-time analytics and monitoring.</div><div className="card-meta">Updated 5h ago</div></div></div>
<div className="card"><div className="card-grad"></div><div className="card-body"><div className="card-title">Agent Gamma</div><div className="card-text">Security scanner and compliance checker for infrastructure nodes.</div><div className="card-meta">Updated 1d ago</div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">18 · Card with Header</div>
<div className="grid-2">
<div className="card"><div className="card-header"><span className="card-header-title">System Health</span><span className="mono fs-11 text-muted">Live</span></div><div className="card-body"><div className="card-text">All 5 nodes reporting nominal. CPU average 12%. Memory 34% utilized.</div></div><div className="card-footer"><span className="mono fs-11 text-muted">Last check: 30s ago</span><button className="btn btn-ghost btn-sm">Refresh</button></div></div>
<div className="card"><div className="card-header"><span className="card-header-title">Deployment Queue</span><span className="mono fs-11 text-muted">3 pending</span></div><div className="card-body"><div className="card-text">Next deployment scheduled for blackroad-api v2.4.1 at 03:00 UTC.</div></div><div className="card-footer"><span className="mono fs-11 text-muted">Queue depth: 3</span><button className="btn btn-ghost btn-sm">View All</button></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">19 · Stat Cards</div>
<div className="grid-4">
<div className="card"><div className="stat"><div className="stat-value">5</div><div className="stat-label">Active Nodes</div><div className="stat-change">↑ 2 from last week</div><div className="stat-bar"></div></div></div>
<div className="card"><div className="stat"><div className="stat-value">847</div><div className="stat-label">Requests / min</div><div className="stat-change">↑ 12% from yesterday</div><div className="stat-bar"></div></div></div>
<div className="card"><div className="stat"><div className="stat-value">99.8%</div><div className="stat-label">Uptime</div><div className="stat-change">30-day average</div><div className="stat-bar"></div></div></div>
<div className="card"><div className="stat"><div className="stat-value">23ms</div><div className="stat-label">Avg Latency</div><div className="stat-change">↓ 4ms improvement</div><div className="stat-bar"></div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">20 · Profile Card</div>
<div className="grid-3">
<div className="card"><div className="card-body" style={{{ textAlign: "center" }}}><div className="avatar avatar-xl" style={{{ margin: "0 auto 12px" }}}>A</div><div className="card-title">Alice</div><div className="card-text">Pi 400 · Gateway Node</div><div className="card-meta">192.168.4.49</div><div style={{{ marginTop: 14 }}}><button className="btn btn-outline btn-sm">SSH Connect</button></div></div></div>
<div className="card"><div className="card-body" style={{{ textAlign: "center" }}}><div className="avatar avatar-xl" style={{{ margin: "0 auto 12px" }}}>C</div><div className="card-title">Cecilia</div><div className="card-text">Pi 5 · AI Compute</div><div className="card-meta">192.168.4.96</div><div style={{{ marginTop: 14 }}}><button className="btn btn-outline btn-sm">SSH Connect</button></div></div></div>
<div className="card"><div className="card-body" style={{{ textAlign: "center" }}}><div className="avatar avatar-xl" style={{{ margin: "0 auto 12px" }}}>O</div><div className="card-title">Octavia</div><div className="card-text">Pi 5 · Storage + Git</div><div className="card-meta">192.168.4.100</div><div style={{{ marginTop: 14 }}}><button className="btn btn-outline btn-sm">SSH Connect</button></div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">21 · Skeleton Loading Card</div>
<div className="grid-3">
<div className="card"><div className="card-body"><div className="skeleton skeleton-img"></div><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-text"></div><div className="skeleton skeleton-text"></div><div className="skeleton skeleton-text" style={{{ width: "40%" }}}></div></div></div>
<div className="card"><div className="card-body"><div className="row" style={{{ marginBottom: 12 }}}><div className="skeleton skeleton-avatar"></div><div className="col"><div className="skeleton skeleton-text" style={{{ width: "60%" }}}></div><div className="skeleton skeleton-text" style={{{ width: "40%" }}}></div></div></div><div className="skeleton skeleton-text"></div><div className="skeleton skeleton-text"></div></div></div>
<div className="card"><div className="card-body"><div className="skeleton skeleton-title" style={{{ width: "50%" }}}></div><div className="skeleton" style={{{ height: 40, marginBottom: 12 }}}></div><div className="skeleton skeleton-text" style={{{ width: "70%" }}}></div></div></div>
</div></div>
</div>


<div className="container section" id="forms">
<div className="section-head"><div className="section-num">04</div><div className="section-title">Forms</div><div className="section-desc">Inputs, textareas, selects, toggles, checkboxes</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">22 · Text Inputs</div>
<div className="grid-2">
<div><label className="input-label">Email</label><input className="input" type="email" placeholder="you@example.com" /><div className="input-hint">We'll never share your email.</div></div>
<div><label className="input-label">API Key</label><input className="input" type="text" placeholder="br_live_..." /><div className="input-hint">Found in your dashboard settings.</div></div>
</div></div>

<div className="comp-group"><div className="comp-label">23 · Input with Icon</div>
<div className="grid-2">
<div className="input-group"><span className="input-group-icon">⌕</span><input className="input" placeholder="Search agents..." /></div>
<div className="input-group"><span className="input-group-icon">⌘</span><input className="input" placeholder="Run command..." /></div>
</div></div>

<div className="comp-group"><div className="comp-label">24 · Textarea</div>
<div><label className="input-label">Description</label><textarea className="textarea" placeholder="Describe your agent's purpose..."></textarea></div></div>

<div className="comp-group"><div className="comp-label">25 · Select</div>
<div className="grid-2">
<div><label className="input-label">Region</label><select className="select"><option>US East (NYC)</option><option>US West (SFO)</option><option>Europe (AMS)</option></select></div>
<div><label className="input-label">Instance</label><select className="select"><option>Pi 5 — 8GB</option><option>Pi 5 — 4GB</option><option>Pi 400 — 4GB</option></select></div>
</div></div>

<div className="comp-group"><div className="comp-label">26 · Toggles</div>
<div className="row" style={{{ gap: 32 }}}>
<label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label>
<label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label>
<label style={{{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}}><label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label>Auto-deploy</label>
</div></div>

<div className="comp-group"><div className="comp-label">27 · Checkboxes</div>
<div className="row" style={{{ gap: 24 }}}>
<label className="checkbox"><input type="checkbox" checked />Enable monitoring</label>
<label className="checkbox"><input type="checkbox" />Send notifications</label>
<label className="checkbox"><input type="checkbox" checked />Auto-restart</label>
</div></div>

<div className="comp-group"><div className="comp-label">28 · Radio Buttons</div>
<div className="row" style={{{ gap: 24 }}}>
<label className="radio"><input type="radio" name="plan" checked />Starter</label>
<label className="radio"><input type="radio" name="plan" />Pro</label>
<label className="radio"><input type="radio" name="plan" />Enterprise</label>
</div></div>

<div className="comp-group"><div className="comp-label">29 · Full Form</div>
<div className="card" style={{{ maxWidth: 500 }}}><div className="card-grad"></div><div className="card-body" style={{{ padding: 24 }}}>
<div className="card-title" style={{{ marginBottom: 20, fontSize: 17 }}}>Create Agent</div>
<div style={{{ marginBottom: 16 }}}><label className="input-label">Name</label><input className="input" placeholder="my-agent" /></div>
<div style={{{ marginBottom: 16 }}}><label className="input-label">Type</label><select className="select"><option>Worker</option><option>Scheduler</option><option>Monitor</option></select></div>
<div style={{{ marginBottom: 16 }}}><label className="input-label">Description</label><textarea className="textarea" rows="3" placeholder="What does this agent do?"></textarea></div>
<div style={{{ marginBottom: 20 }}}><label style={{{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}}><label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label>Start immediately</label></div>
<div className="row"><button className="btn btn-white">Create Agent</button><button className="btn btn-ghost">Cancel</button></div>
</div></div></div>
</div>


<div className="container section" id="badges">
<div className="section-head"><div className="section-num">05</div><div className="section-title">Badges & Tags</div><div className="section-desc">Status indicators, labels, and tag groups</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">30 · Badges with gradient dot</div>
<div className="row"><span className="badge badge-grad"><span className="badge-dot"></span>Online</span><span className="badge badge-grad"><span className="badge-dot"></span>Deployed</span><span className="badge badge-grad"><span className="badge-dot"></span>Active</span><span className="badge"><span className="badge-dot" style={{{ background: "#333" }}}></span>Offline</span></div></div>

<div className="comp-group"><div className="comp-label">31 · Badges with gradient line</div>
<div className="row"><span className="badge-line">v2.4.1</span><span className="badge-line">Production</span><span className="badge-line">Stable</span></div></div>

<div className="comp-group"><div className="comp-label">32 · Tags</div>
<div className="tag-group"><span className="tag">agent</span><span className="tag">infrastructure</span><span className="tag">pi5</span><span className="tag">hailo-8</span><span className="tag">wireguard</span></div></div>

<div className="comp-group"><div className="comp-label">33 · Removable Tags</div>
<div className="tag-group"><span className="tag">alice <button className="tag-close">✕</button></span><span className="tag">cecilia <button className="tag-close">✕</button></span><span className="tag">octavia <button className="tag-close">✕</button></span></div></div>

<div className="comp-group"><div className="comp-label">34 · Keyboard Shortcuts</div>
<div className="row" style={{{ gap: 24 }}}><span className="fs-13"><span className="kbd">⌘</span> + <span className="kbd">K</span> Command palette</span><span className="fs-13"><span className="kbd">⌘</span> + <span className="kbd">⇧</span> + <span className="kbd">P</span> Quick deploy</span><span className="fs-13"><span className="kbd">Esc</span> Close</span></div></div>
</div>


<div className="container section" id="lists">
<div className="section-head"><div className="section-num">06</div><div className="section-title">Lists</div><div className="section-desc">Data lists, activity feeds, file browsers</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">35 · Basic List</div>
<div className="list-bordered">
<div className="list-item"><span className="list-item-indicator"></span><span className="list-item-text">blackroad-api</span><span className="list-item-meta">v2.4.1</span></div>
<div className="list-item"><span className="list-item-indicator"></span><span className="list-item-text">lucidia-core</span><span className="list-item-meta">v1.8.0</span></div>
<div className="list-item"><span className="list-item-indicator"></span><span className="list-item-text">roadnet-mesh</span><span className="list-item-meta">v0.3.2</span></div>
<div className="list-item"><span className="list-item-indicator"></span><span className="list-item-text">cece-engine</span><span className="list-item-meta">v3.1.0</span></div>
</div></div>

<div className="comp-group"><div className="comp-label">36 · List with avatars</div>
<div className="list-bordered">
<div className="list-item"><span className="avatar avatar-sm">A</span><span className="list-item-text">Alice deployed blackroad-api to production</span><span className="list-item-meta">2m ago</span></div>
<div className="list-item"><span className="avatar avatar-sm">C</span><span className="list-item-text">Cecilia completed model training cycle</span><span className="list-item-meta">15m ago</span></div>
<div className="list-item"><span className="avatar avatar-sm">O</span><span className="list-item-text">Octavia synced 47 repos from GitHub</span><span className="list-item-meta">1h ago</span></div>
<div className="list-item"><span className="avatar avatar-sm">L</span><span className="list-item-text">Lucidia processed 1,200 API requests</span><span className="list-item-meta">2h ago</span></div>
</div></div>

<div className="comp-group"><div className="comp-label">37 · File List</div>
<div className="list-bordered">
<div className="list-item"><span style={{{ fontSize: 14, width: 20, textAlign: "center", color: "var(--muted)" }}}>📁</span><span className="list-item-text fw-600">src/</span><span className="list-item-meta">4 items</span></div>
<div className="list-item"><span style={{{ fontSize: 14, width: 20, textAlign: "center", color: "var(--muted)" }}}>📁</span><span className="list-item-text fw-600">lib/</span><span className="list-item-meta">12 items</span></div>
<div className="list-item"><span style={{{ fontSize: 14, width: 20, textAlign: "center", color: "var(--muted)" }}}>📄</span><span className="list-item-text">package.json</span><span className="list-item-meta">2.1 KB</span></div>
<div className="list-item"><span style={{{ fontSize: 14, width: 20, textAlign: "center", color: "var(--muted)" }}}>📄</span><span className="list-item-text">wrangler.toml</span><span className="list-item-meta">840 B</span></div>
<div className="list-item"><span style={{{ fontSize: 14, width: 20, textAlign: "center", color: "var(--muted)" }}}>📄</span><span className="list-item-text">README.md</span><span className="list-item-meta">3.4 KB</span></div>
</div></div>

<div className="comp-group"><div className="comp-label">38 · Checklist</div>
<div className="list-bordered">
<div className="list-item"><label className="checkbox"><input type="checkbox" checked />Set up WireGuard mesh</label></div>
<div className="list-item"><label className="checkbox"><input type="checkbox" checked />Deploy RoadNet to all nodes</label></div>
<div className="list-item"><label className="checkbox"><input type="checkbox" />Configure Hailo-8 accelerators</label></div>
<div className="list-item"><label className="checkbox"><input type="checkbox" />Set up monitoring dashboard</label></div>
</div></div>

<div className="comp-group"><div className="comp-label">39 · Numbered List</div>
<div className="list-bordered">
<div className="list-item"><span style={{{ fontFamily: "var(--jb)", fontSize: 11, color: "var(--muted)", width: 24, textAlign: "center" }}}>01</span><span className="list-item-text">Initialize cluster configuration</span></div>
<div className="list-item"><span style={{{ fontFamily: "var(--jb)", fontSize: 11, color: "var(--muted)", width: 24, textAlign: "center" }}}>02</span><span className="list-item-text">Deploy agents to all nodes</span></div>
<div className="list-item"><span style={{{ fontFamily: "var(--jb)", fontSize: 11, color: "var(--muted)", width: 24, textAlign: "center" }}}>03</span><span className="list-item-text">Verify mesh connectivity</span></div>
<div className="list-item"><span style={{{ fontFamily: "var(--jb)", fontSize: 11, color: "var(--muted)", width: 24, textAlign: "center" }}}>04</span><span className="list-item-text">Enable auto-healing services</span></div>
</div></div>

<div className="comp-group"><div className="comp-label">40 · Definition List</div>
<div className="list-bordered">
<div className="list-item" style={{{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}}><span className="fw-600 fs-13" style={{{ color: "var(--white)" }}}>Agent</span><span className="fs-12 text-sub">An autonomous process that runs on a node and performs tasks.</span></div>
<div className="list-item" style={{{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}}><span className="fw-600 fs-13" style={{{ color: "var(--white)" }}}>Node</span><span className="fs-12 text-sub">A physical device in the BlackRoad fleet (Pi 5, Pi 400, etc).</span></div>
<div className="list-item" style={{{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}}><span className="fw-600 fs-13" style={{{ color: "var(--white)" }}}>Mesh</span><span className="fs-12 text-sub">The WireGuard network connecting all nodes (10.8.0.x).</span></div>
</div></div>
</div>


<div className="container section" id="tables">
<div className="section-head"><div className="section-num">07</div><div className="section-title">Tables</div><div className="section-desc">Data tables for structured information</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">41 · Data Table</div>
<div className="table-wrap">
<table className="table">
<thead><tr><th>Node</th><th>IP</th><th>CPU</th><th>Memory</th><th>Status</th></tr></thead>
<tbody>
<tr><td className="fw-600">Alice</td><td className="mono fs-12 text-sub">192.168.4.49</td><td>8%</td><td>42%</td><td><span className="badge badge-grad"><span className="badge-dot"></span>Online</span></td></tr>
<tr><td className="fw-600">Cecilia</td><td className="mono fs-12 text-sub">192.168.4.96</td><td>23%</td><td>61%</td><td><span className="badge badge-grad"><span className="badge-dot"></span>Online</span></td></tr>
<tr><td className="fw-600">Octavia</td><td className="mono fs-12 text-sub">192.168.4.100</td><td>15%</td><td>38%</td><td><span className="badge badge-grad"><span className="badge-dot"></span>Online</span></td></tr>
<tr><td className="fw-600">Aria</td><td className="mono fs-12 text-sub">192.168.4.98</td><td>—</td><td>—</td><td><span className="badge"><span className="badge-dot" style={{{ background: "#333" }}}></span>Offline</span></td></tr>
<tr><td className="fw-600">Lucidia</td><td className="mono fs-12 text-sub">192.168.4.38</td><td>31%</td><td>54%</td><td><span className="badge badge-grad"><span className="badge-dot"></span>Online</span></td></tr>
</tbody>
</table>
</div></div>

<div className="comp-group"><div className="comp-label">42 · Compact Table</div>
<div className="table-wrap">
<table className="table">
<thead><tr><th>Port</th><th>Service</th><th>Protocol</th></tr></thead>
<tbody>
<tr><td className="mono fs-12">22</td><td>SSH</td><td className="text-sub">TCP</td></tr>
<tr><td className="mono fs-12">53</td><td>DNS</td><td className="text-sub">UDP</td></tr>
<tr><td className="mono fs-12">3100</td><td>Gitea</td><td className="text-sub">TCP</td></tr>
<tr><td className="mono fs-12">7890</td><td>Stats Proxy</td><td className="text-sub">TCP</td></tr>
<tr><td className="mono fs-12">11434</td><td>Ollama</td><td className="text-sub">TCP</td></tr>
</tbody>
</table>
</div></div>
</div>


<div className="container section" id="avatars">
<div className="section-head"><div className="section-num">08</div><div className="section-title">Avatars</div><div className="section-desc">User and node representations</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">43 · Avatar Sizes</div>
<div className="row" style={{{ alignItems: "center" }}}><span className="avatar avatar-sm">S</span><span className="avatar">M</span><span className="avatar avatar-lg">L</span><span className="avatar avatar-xl">XL</span></div></div>

<div className="comp-group"><div className="comp-label">44 · Avatar Group</div>
<div className="avatar-group"><span className="avatar">A</span><span className="avatar">C</span><span className="avatar">O</span><span className="avatar">L</span><span className="avatar" style={{{ fontSize: 11 }}}>+2</span></div></div>

<div className="comp-group"><div className="comp-label">45 · Avatar with Gradient Ring</div>
<div className="row" style={{{ alignItems: "center", gap: 24 }}}>
<div className="avatar-ring avatar-lg"><div className="avatar-ring-inner">A</div></div>
<div className="avatar-ring avatar-xl"><div className="avatar-ring-inner">C</div></div>
</div></div>
</div>


<div className="container section" id="alerts">
<div className="section-head"><div className="section-num">09</div><div className="section-title">Alerts & Toasts</div><div className="section-desc">Notifications and system messages</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">46 · Alert with gradient bar</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 12 }}}>
<div className="alert"><div className="alert-bar"></div><div><div className="alert-title">Deployment successful</div><div className="alert-text">blackroad-api v2.4.1 deployed to all 5 nodes.</div></div></div>
<div className="alert"><div className="alert-bar"></div><div><div className="alert-title">Node offline</div><div className="alert-text">Aria (192.168.4.98) is not responding. Last seen 2h ago.</div></div></div>
<div className="alert"><div className="alert-bar"></div><div><div className="alert-title">Certificate expiring</div><div className="alert-text">Lucidia SSL certificate expires in 14 days.</div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">47 · Toast Notifications</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 12 }}}>
<div className="toast"><div className="toast-bar"></div><div className="toast-text">Agent deployed successfully to Cecilia.</div><button className="toast-close">✕</button></div>
<div className="toast"><div className="toast-bar"></div><div className="toast-text">3 new commits pushed to blackroad-api.</div><button className="toast-close">✕</button></div>
</div></div>
</div>


<div className="container section" id="progress">
<div className="section-head"><div className="section-num">10</div><div className="section-title">Progress & Loading</div><div className="section-desc">Progress bars, spinners, loading states</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">48 · Progress Bars</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 20 }}}>
<div><div className="progress-label"><span>Deployment</span><span>78%</span></div><div className="progress-track"><div className="progress-fill" style={{{ width: "78%" }}}></div></div></div>
<div><div className="progress-label"><span>Upload</span><span>45%</span></div><div className="progress-track"><div className="progress-fill" style={{{ width: "45%" }}}></div></div></div>
<div><div className="progress-label"><span>Processing</span><span>100%</span></div><div className="progress-track"><div className="progress-fill" style={{{ width: "100%" }}}></div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">49 · Animated Loading Bar</div>
<div style={{{ height: 4, borderRadius: 2, background: "var(--elevated)", position: "relative", overflow: "hidden" }}}><div style={{{ position: "absolute", top: 0, height: "100%", width: "30%", borderRadius: 2, background: "var(--g)", animation: "loadSlide 1.8s ease-in-out infinite" }}}></div></div></div>

<div className="comp-group"><div className="comp-label">50 · Spinners</div>
<div className="row" style={{{ alignItems: "center", gap: 24 }}}><div className="spinner"></div><div className="spinner" style={{{ width: 28, height: 28 }}}></div><div className="spinner" style={{{ width: 40, height: 40, borderWidth: 3 }}}></div></div></div>

<div className="comp-group"><div className="comp-label">51 · Gradient Sweep Loader</div>
<div className="anim-sweep"></div></div>
</div>


<div className="container section" id="timeline">
<div className="section-head"><div className="section-num">11</div><div className="section-title">Timeline</div><div className="section-desc">Chronological events and activity</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">52 · Timeline</div>
<div className="timeline">
<div className="timeline-item"><div className="timeline-dot timeline-dot-active"></div><div className="timeline-title">Fleet deployed</div><div className="timeline-text">All 5 nodes configured and connected to mesh.</div><div className="timeline-time">2026-03-09 03:00</div></div>
<div className="timeline-item"><div className="timeline-dot timeline-dot-active"></div><div className="timeline-title">Power optimization</div><div className="timeline-text">Applied conservative governor, disabled unused services.</div><div className="timeline-time">2026-03-09 02:30</div></div>
<div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-title">Security audit</div><div className="timeline-text">Removed obfuscated cron, rotated secrets, disabled miners.</div><div className="timeline-time">2026-03-09 01:45</div></div>
<div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-title">RoadNet deployed</div><div className="timeline-text">WiFi mesh on all nodes. 5 APs across channels 1, 6, 11.</div><div className="timeline-time">2026-03-08 23:00</div></div>
</div></div>

<div className="comp-group"><div className="comp-label">53 · Horizontal Timeline / Steps</div>
<div className="steps">
<div className="step step-complete"><div className="step-line"></div><div className="step-dot">1</div><div className="step-label">Configure</div></div>
<div className="step step-complete"><div className="step-line"></div><div className="step-dot">2</div><div className="step-label">Deploy</div></div>
<div className="step step-active"><div className="step-line"></div><div className="step-dot">3</div><div className="step-label">Monitor</div></div>
<div className="step"><div className="step-line"></div><div className="step-dot">4</div><div className="step-label">Scale</div></div>
</div></div>
</div>


<div className="container section" id="accordion">
<div className="section-head"><div className="section-num">12</div><div className="section-title">Accordion & FAQ</div><div className="section-desc">Expandable content sections</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">54 · Accordion</div>
<div className="accordion">
<div className="accordion-item"><button className="accordion-trigger active" onclick="toggleAccordion(this)">What is BlackRoad OS?<span className="arrow">▾</span></button><div className="accordion-content open">BlackRoad OS is a distributed AI operating system running across a fleet of Raspberry Pi 5 nodes, connected via WireGuard mesh networking.</div></div>
<div className="accordion-item"><button className="accordion-trigger" onclick="toggleAccordion(this)">How many nodes are supported?<span className="arrow">▾</span></button><div className="accordion-content">The current fleet has 5 nodes (Alice, Cecilia, Octavia, Aria, Lucidia) but the architecture supports up to 255 devices.</div></div>
<div className="accordion-item"><button className="accordion-trigger" onclick="toggleAccordion(this)">What AI hardware is available?<span className="arrow">▾</span></button><div className="accordion-content">Two Hailo-8 AI accelerators (26 TOPS each) on Cecilia and Octavia, plus Ollama running on multiple nodes for LLM inference.</div></div>
<div className="accordion-item"><button className="accordion-trigger" onclick="toggleAccordion(this)">How does self-healing work?<span className="arrow">▾</span></button><div className="accordion-content">Each node runs autonomy scripts that check critical services every 1-5 minutes and auto-restart them if they go down.</div></div>
</div></div>

<div className="comp-group"><div className="comp-label">55 · FAQ Grid</div>
<div className="grid-2">
<div className="card"><div className="card-body"><div className="card-title">Is it open source?</div><div className="card-text">Yes. All code lives in Gitea on Octavia and mirrors to GitHub.</div></div></div>
<div className="card"><div className="card-body"><div className="card-title">What protocols are used?</div><div className="card-text">WireGuard for mesh, NATS for messaging, HTTP/gRPC for APIs.</div></div></div>
<div className="card"><div className="card-body"><div className="card-title">Can I add my own node?</div><div className="card-text">Any Pi 5 can join the fleet with the roadnet deploy script.</div></div></div>
<div className="card"><div className="card-body"><div className="card-title">What about security?</div><div className="card-text">UFW, SSH key-only auth, encrypted tunnels, no plaintext secrets.</div></div></div>
</div></div>
</div>


<div className="container section" id="blog">
<div className="section-head"><div className="section-num">13</div><div className="section-title">Blog</div><div className="section-desc">Article cards, post layouts, comments</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">56 · Blog Cards</div>
<div className="grid-3">
<div className="blog-card"><div className="blog-img"><div className="blog-img-grad"></div></div><div className="blog-body"><div className="blog-tag">Infrastructure</div><div className="blog-title">Building a Self-Healing Pi Cluster</div><div className="blog-excerpt">How we automated failure recovery across 5 nodes with systemd timers and shell scripts.</div><div className="blog-footer"><span className="avatar avatar-sm">A</span><span className="blog-author">Alexa</span><span className="blog-date">Mar 9</span><span className="blog-read">5 min</span></div></div></div>
<div className="blog-card"><div className="blog-img" style={{{ background: "#0a0a0a" }}}><div className="blog-img-grad"></div></div><div className="blog-body"><div className="blog-tag">AI</div><div className="blog-title">52 TOPS on $70 of Hardware</div><div className="blog-excerpt">Running dual Hailo-8 accelerators on Raspberry Pi 5 for edge AI inference.</div><div className="blog-footer"><span className="avatar avatar-sm">A</span><span className="blog-author">Alexa</span><span className="blog-date">Mar 8</span><span className="blog-read">8 min</span></div></div></div>
<div className="blog-card"><div className="blog-img" style={{{ background: "#0a0a0a" }}}><div className="blog-img-grad"></div></div><div className="blog-body"><div className="blog-tag">Networking</div><div className="blog-title">WireGuard Mesh at Home</div><div className="blog-excerpt">Connecting 5 Pis and 2 cloud VPS into a single encrypted network.</div><div className="blog-footer"><span className="avatar avatar-sm">A</span><span className="blog-author">Alexa</span><span className="blog-date">Mar 7</span><span className="blog-read">6 min</span></div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">57 · Blog List View</div>
<div className="list-bordered">
<div className="list-item" style={{{ padding: 16, flexDirection: "column", alignItems: "flex-start", gap: 4 }}}><div className="row" style={{{ width: "100%", gap: 8, alignItems: "center" }}}><span className="blog-tag" style={{{ margin: 0 }}}>Tutorial</span><span className="fw-600 fs-14" style={{{ color: "var(--white)" }}}>Deploy Ollama Models Across Your Fleet</span><span className="blog-read" style={{{ marginLeft: "auto" }}}>4 min</span></div><div className="fs-12 text-sub">Step-by-step guide to distributing LLM inference across multiple Pi nodes.</div></div>
<div className="list-item" style={{{ padding: 16, flexDirection: "column", alignItems: "flex-start", gap: 4 }}}><div className="row" style={{{ width: "100%", gap: 8, alignItems: "center" }}}><span className="blog-tag" style={{{ margin: 0 }}}>Update</span><span className="fw-600 fs-14" style={{{ color: "var(--white)" }}}>RoadNet v0.3: WiFi Mesh Goes Live</span><span className="blog-read" style={{{ marginLeft: "auto" }}}>3 min</span></div><div className="fs-12 text-sub">Our carrier-grade WiFi mesh is now running on all 5 nodes with automatic failover.</div></div>
<div className="list-item" style={{{ padding: 16, flexDirection: "column", alignItems: "flex-start", gap: 4 }}}><div className="row" style={{{ width: "100%", gap: 8, alignItems: "center" }}}><span className="blog-tag" style={{{ margin: 0 }}}>Deep Dive</span><span className="fw-600 fs-14" style={{{ color: "var(--white)" }}}>Power Optimization: From 73°C to 58°C</span><span className="blog-read" style={{{ marginLeft: "auto" }}}>7 min</span></div><div className="fs-12 text-sub">How we cut power consumption and thermals across the entire fleet with software-only changes.</div></div>
</div></div>

<div className="comp-group"><div className="comp-label">58 · Full Blog Post</div>
<div className="card" style={{{ maxWidth: 720 }}}><div className="card-grad"></div><div className="card-body" style={{{ padding: 32 }}}>
<div className="post">
<div className="blog-tag">Architecture</div>
<h1>The BlackRoad Fleet Architecture</h1>
<div className="post-meta"><span className="avatar avatar-sm">A</span><div><div className="post-author">Alexa</div><div className="post-date">March 9, 2026 · 8 min read</div></div></div>
<p>BlackRoad OS runs on a distributed fleet of Raspberry Pi nodes connected through a WireGuard mesh network. Each node serves a specific purpose in the overall architecture.</p>
<h2>Node Roles</h2>
<p>The fleet is designed with clear separation of concerns. Alice handles ingress and DNS. Cecilia runs AI workloads. Octavia manages storage and version control.</p>
<blockquote>The best infrastructure is the one that heals itself before you notice something broke.</blockquote>
<h3>Networking Layer</h3>
<p>All inter-node communication flows through WireGuard tunnels on the <code>10.8.0.x</code> subnet. The mesh topology means any node can reach any other node directly.</p>
<pre><code># WireGuard peer configuration
[Peer]
PublicKey = base64encodedkey==
AllowedIPs = 10.8.0.3/32
Endpoint = 192.168.4.96:51820</code></pre>
<ul><li>Alice: 10.8.0.6 — Gateway, DNS, Pi-hole</li><li>Cecilia: 10.8.0.3 — AI compute, TTS, MinIO</li><li>Octavia: 10.8.0.4 — Gitea, NVMe storage, Docker Swarm</li></ul>
<hr />
<p>Next up: how we built the self-healing autonomy layer.</p>
</div>
</div></div></div>

<div className="comp-group"><div className="comp-label">59 · Author Bio</div>
<div className="card" style={{{ maxWidth: 500 }}}><div className="card-body"><div className="row" style={{{ alignItems: "center", gap: 16 }}}><div className="avatar-ring avatar-xl"><div className="avatar-ring-inner">A</div></div><div><div className="fw-600 fs-14" style={{{ color: "var(--white)" }}}>Alexa</div><div className="fs-12 text-sub" style={{{ marginTop: 2 }}}>Builder of BlackRoad OS. Running distributed AI infrastructure on Raspberry Pi hardware.</div><div style={{{ marginTop: 8 }}}><button className="btn btn-outline btn-sm">Follow</button></div></div></div></div></div></div>

<div className="comp-group"><div className="comp-label">60 · Comments</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}}>
<div className="row" style={{{ gap: 12 }}}><span className="avatar avatar-sm">M</span><div className="col"><div className="row" style={{{ gap: 8, alignItems: "baseline" }}}><span className="fw-600 fs-13">User</span><span className="mono fs-11 text-muted">2h ago</span></div><p className="fs-13 text-sub mt-8">Great writeup on the mesh networking setup. What latency do you see between nodes?</p></div></div>
<div className="row" style={{{ gap: 12, paddingLeft: 48 }}}><span className="avatar avatar-sm">A</span><div className="col"><div className="row" style={{{ gap: 8, alignItems: "baseline" }}}><span className="fw-600 fs-13">Alexa</span><span className="mono fs-11 text-muted">1h ago</span></div><p className="fs-13 text-sub mt-8">Sub-millisecond on the LAN. Through WireGuard to the VPS it's about 23ms average.</p></div></div>
</div></div>
</div>


<div className="container section" id="modals">
<div className="section-head"><div className="section-num">14</div><div className="section-title">Modals & Dialogs</div><div className="section-desc">Overlay windows for focused interactions</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">61 · Modal (inline preview)</div>
<div style={{{ background: "rgba(255,255,255,.03)", borderRadius: 12, padding: 40, display: "flex", justifyContent: "center" }}}>
<div className="modal"><div className="modal-grad"></div><div className="modal-header"><span className="modal-title">Delete Agent</span><button className="modal-close">✕</button></div><div className="modal-body"><p>Are you sure you want to delete <strong style={{{ color: "var(--white)" }}}>agent-alpha</strong>? This action cannot be undone.</p></div><div className="modal-footer"><button className="btn btn-ghost">Cancel</button><button className="btn btn-white">Delete</button></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">62 · Modal with form</div>
<div style={{{ background: "rgba(255,255,255,.03)", borderRadius: 12, padding: 40, display: "flex", justifyContent: "center" }}}>
<div className="modal"><div className="modal-grad"></div><div className="modal-header"><span className="modal-title">New API Key</span><button className="modal-close">✕</button></div><div className="modal-body"><div style={{{ marginBottom: 14 }}}><label className="input-label">Key Name</label><input className="input" placeholder="production-key" /></div><div><label className="input-label">Permissions</label><select className="select"><option>Read Only</option><option>Read/Write</option><option>Admin</option></select></div></div><div className="modal-footer"><button className="btn btn-ghost">Cancel</button><button className="btn btn-white">Generate Key</button></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">63 · Command Palette</div>
<div style={{{ background: "rgba(255,255,255,.03)", borderRadius: 12, padding: 40, display: "flex", justifyContent: "center" }}}>
<div className="cmd-palette"><div className="cmd-input-wrap"><span className="cmd-prefix">></span><input className="cmd-input" placeholder="Type a command..." /></div>
<div className="cmd-group-label">Recent</div>
<div className="cmd-results">
<div className="cmd-item selected"><span className="cmd-item-icon">◈</span><span className="cmd-item-text">Deploy to production</span><span className="cmd-item-shortcut">⌘⇧D</span></div>
<div className="cmd-item"><span className="cmd-item-icon">◇</span><span className="cmd-item-text">View system logs</span><span className="cmd-item-shortcut">⌘L</span></div>
<div className="cmd-item"><span className="cmd-item-icon">◇</span><span className="cmd-item-text">SSH to Cecilia</span><span className="cmd-item-shortcut">⌘2</span></div>
</div>
<div className="cmd-group-label">Actions</div>
<div className="cmd-results">
<div className="cmd-item"><span className="cmd-item-icon">◇</span><span className="cmd-item-text">Create new agent</span><span className="cmd-item-shortcut">⌘N</span></div>
<div className="cmd-item"><span className="cmd-item-icon">◇</span><span className="cmd-item-text">Run health check</span><span className="cmd-item-shortcut">⌘H</span></div>
<div className="cmd-item"><span className="cmd-item-icon">◇</span><span className="cmd-item-text">Toggle dark mode</span><span className="cmd-item-shortcut">⌘D</span></div>
</div>
<div className="cmd-footer"><span>↑↓ Navigate</span><span>↵ Select</span><span>Esc Close</span></div>
</div></div></div>
</div>


<div className="container section" id="pricing">
<div className="section-head"><div className="section-num">15</div><div className="section-title">Pricing</div><div className="section-desc">Pricing cards and plan comparison</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">64 · Pricing Cards</div>
<div className="grid-3">
<div className="pricing-card"><div className="pricing-name">Starter</div><div className="pricing-price">$0</div><div className="pricing-period">Free forever</div><ul className="pricing-features"><li><span className="pricing-check"></span>1 node</li><li><span className="pricing-check"></span>Basic monitoring</li><li><span className="pricing-check"></span>Community support</li><li><span className="pricing-check"></span>5 agents</li></ul><button className="btn btn-outline" style={{{ width: "100%" }}}>Get Started</button></div>
<div className="pricing-card pricing-featured"><div className="pricing-grad"></div><div className="pricing-name">Pro</div><div className="pricing-price">$29</div><div className="pricing-period">per month</div><ul className="pricing-features"><li><span className="pricing-check"></span>10 nodes</li><li><span className="pricing-check"></span>Advanced analytics</li><li><span className="pricing-check"></span>Priority support</li><li><span className="pricing-check"></span>Unlimited agents</li><li><span className="pricing-check"></span>Custom domains</li></ul><button className="btn btn-white" style={{{ width: "100%" }}}>Upgrade to Pro</button></div>
<div className="pricing-card"><div className="pricing-name">Enterprise</div><div className="pricing-price">Custom</div><div className="pricing-period">contact us</div><ul className="pricing-features"><li><span className="pricing-check"></span>Unlimited nodes</li><li><span className="pricing-check"></span>Dedicated support</li><li><span className="pricing-check"></span>SLA guarantee</li><li><span className="pricing-check"></span>On-premise deploy</li><li><span className="pricing-check"></span>Custom integrations</li></ul><button className="btn btn-outline" style={{{ width: "100%" }}}>Contact Sales</button></div>
</div></div>
</div>


<div className="container section" id="testimonials">
<div className="section-head"><div className="section-num">16</div><div className="section-title">Testimonials</div><div className="section-desc">Social proof and quotes</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">65-67 · Testimonial Cards</div>
<div className="grid-3">
<div className="testimonial"><div className="testimonial-bar"></div><div className="testimonial-text">"BlackRoad turned our Pi cluster into a production-grade platform. Self-healing saved us from 3am alerts."</div><div className="testimonial-author"><span className="avatar avatar-sm">J</span><div><div className="testimonial-name">Jordan</div><div className="testimonial-role">DevOps Engineer</div></div></div></div>
<div className="testimonial"><div className="testimonial-bar"></div><div className="testimonial-text">"52 TOPS of AI inference on hardware that costs less than a GPU. The Hailo integration is brilliant."</div><div className="testimonial-author"><span className="avatar avatar-sm">R</span><div><div className="testimonial-name">Riley</div><div className="testimonial-role">ML Engineer</div></div></div></div>
<div className="testimonial"><div className="testimonial-bar"></div><div className="testimonial-text">"The WireGuard mesh setup is elegant. Every node can talk to every other node with sub-ms latency."</div><div className="testimonial-author"><span className="avatar avatar-sm">S</span><div><div className="testimonial-name">Sam</div><div className="testimonial-role">Network Architect</div></div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">68 · Large Testimonial</div>
<div className="card" style={{{ maxWidth: 700 }}}><div className="card-grad"></div><div className="card-body" style={{{ padding: 32, textAlign: "center" }}}><div style={{{ width: 48, height: 3, borderRadius: 2, background: "var(--g)", margin: "0 auto 20px" }}}></div><p style={{{ fontSize: 18, color: "#bbb", lineHeight: 1.7, fontStyle: "italic", marginBottom: 20 }}}>"We replaced a $2,000/month cloud bill with $400 worth of Raspberry Pis. BlackRoad OS made it possible."</p><div style={{{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}}><span className="avatar">M</span><div style={{{ textAlign: "left" }}}><div className="fw-600 fs-13">Morgan</div><div className="fs-11 text-muted">CTO, EdgeStack</div></div></div></div></div></div>
</div>


<div className="container section" id="features">
<div className="section-head"><div className="section-num">17</div><div className="section-title">Features</div><div className="section-desc">Feature grids and highlight sections</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">69-74 · Feature Grid</div>
<div className="grid-3">
<div className="feature"><div className="feature-icon">◈</div><div className="feature-title">Self-Healing</div><div className="feature-text">Autonomy scripts monitor and restart services automatically across all nodes.</div></div>
<div className="feature"><div className="feature-icon">◇</div><div className="feature-title">Mesh Network</div><div className="feature-text">WireGuard connects every node with encrypted tunnels and sub-ms latency.</div></div>
<div className="feature"><div className="feature-icon">▣</div><div className="feature-title">Edge AI</div><div className="feature-text">Dual Hailo-8 accelerators deliver 52 TOPS of AI inference at the edge.</div></div>
<div className="feature"><div className="feature-icon">◎</div><div className="feature-title">Fleet Deploy</div><div className="feature-text">Push code to all nodes simultaneously with a single command.</div></div>
<div className="feature"><div className="feature-icon">⬡</div><div className="feature-title">Distributed Storage</div><div className="feature-text">1TB NVMe on Octavia with MinIO on Cecilia for object storage.</div></div>
<div className="feature"><div className="feature-icon">◉</div><div className="feature-title">Monitoring</div><div className="feature-text">Real-time stats, health checks, and power monitoring across the fleet.</div></div>
</div></div>

<div className="comp-group"><div className="comp-label">75 · Feature Row</div>
<div className="card"><div className="card-body" style={{{ padding: 32 }}}><div className="row" style={{{ gap: 32, alignItems: "center" }}}><div style={{{ flex: 1 }}}><div className="fw-700 fs-14" style={{{ color: "var(--white)", fontSize: 20, marginBottom: 8 }}}>Built for the Edge</div><p className="fs-14 text-sub" style={{{ lineHeight: 1.7, marginBottom: 16 }}}>Every component runs on ARM hardware. No cloud dependency. Your data stays on your network.</p><button className="btn btn-white">Learn More</button></div><div style={{{ width: 200, height: 120, background: "var(--elevated)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}}><div className="anim-morph" style={{{ width: 60, height: 60 }}}></div></div></div></div></div></div>
</div>


<div className="container section" id="changelog">
<div className="section-head"><div className="section-num">18</div><div className="section-title">Changelog</div><div className="section-desc">Version history and release notes</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">76-78 · Changelog Entries</div>
<div className="changelog-item"><div className="changelog-version"><span className="changelog-version-num">v2.4.1</span><span className="changelog-version-bar"></span></div><div className="changelog-date">March 9, 2026</div><ul className="changelog-list"><li><span className="changelog-type">fix</span>Resolved Octavia undervoltage by removing overclock</li><li><span className="changelog-type">fix</span>Fixed Lucidia overheating — disabled world-engine service</li><li>Applied power optimization across all 4 nodes</li></ul></div>
<div className="changelog-item"><div className="changelog-version"><span className="changelog-version-num">v2.4.0</span><span className="changelog-version-bar"></span></div><div className="changelog-date">March 8, 2026</div><ul className="changelog-list"><li><span className="changelog-type">new</span>RoadNet WiFi mesh deployed to all 5 nodes</li><li><span className="changelog-type">new</span>Fleet security audit with secret rotation</li><li>Cleaned 141 containers from Aria</li></ul></div>
<div className="changelog-item"><div className="changelog-version"><span className="changelog-version-num">v2.3.0</span><span className="changelog-version-bar"></span></div><div className="changelog-date">March 7, 2026</div><ul className="changelog-list"><li><span className="changelog-type">new</span>Hailo-8 integration on Cecilia and Octavia</li><li><span className="changelog-type">new</span>WireGuard mesh with Anastasia hub</li><li>Deployed autonomy scripts for self-healing</li></ul></div>
</div></div>
</div>


<div className="container section" id="tooltips">
<div className="section-head"><div className="section-num">19</div><div className="section-title">Tooltips & Popovers</div><div className="section-desc">Contextual hover information</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">79-81 · Tooltips</div>
<div className="row" style={{{ gap: 32 }}}>
<div className="tooltip-wrap"><button className="btn btn-outline">Hover me</button><div className="tooltip">Deploy to production</div></div>
<div className="tooltip-wrap"><span className="badge badge-grad"><span className="badge-dot"></span>Online</span><div className="tooltip">Node is healthy and responding</div></div>
<div className="tooltip-wrap"><span className="kbd">⌘K</span><div className="tooltip">Open command palette</div></div>
</div></div>
</div>


<div className="container section" id="empty">
<div className="section-head"><div className="section-num">20</div><div className="section-title">Empty & Error States</div><div className="section-desc">Placeholder content for missing data</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">82 · Empty State</div>
<div className="card"><div className="empty-state"><div className="empty-icon">◇</div><div className="empty-title">No agents yet</div><div className="empty-text">Create your first agent to start deploying across the fleet.</div><button className="btn btn-white">Create Agent</button></div></div></div>

<div className="comp-group"><div className="comp-label">83 · Error State</div>
<div className="card"><div className="empty-state"><div className="empty-icon" style={{{ fontSize: 20 }}}>!</div><div className="empty-title">Connection failed</div><div className="empty-text">Unable to reach Aria (192.168.4.98). The node may need a physical reboot.</div><button className="btn btn-outline">Retry</button></div></div></div>

<div className="comp-group"><div className="comp-label">84 · No Results</div>
<div className="card"><div className="empty-state"><div className="empty-icon">⌕</div><div className="empty-title">No results found</div><div className="empty-text">Try adjusting your search or filters.</div></div></div></div>
</div>


<div className="container section" id="search">
<div className="section-head"><div className="section-num">21</div><div className="section-title">Search</div><div className="section-desc">Search inputs and result layouts</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">85 · Search Bar</div>
<div className="card" style={{{ maxWidth: 600 }}}><div style={{{ padding: 4 }}}><div className="input-group"><span className="input-group-icon">⌕</span><input className="input" placeholder="Search docs, agents, nodes..." style={{{ border: "none", background: "transparent" }}} /></div></div></div></div>

<div className="comp-group"><div className="comp-label">86-88 · Search Results</div>
<div className="list-bordered" style={{{ maxWidth: 600 }}}>
<div className="search-result"><div className="search-title">WireGuard Configuration Guide</div><div className="search-snippet">Learn how to set up WireGuard mesh networking between all nodes in your fleet...</div><div className="search-url">docs / networking / wireguard</div></div>
<div className="search-result"><div className="search-title">Hailo-8 Integration</div><div className="search-snippet">Configure the Hailo-8 AI accelerator on your Pi 5 for edge inference...</div><div className="search-url">docs / ai / hailo</div></div>
<div className="search-result"><div className="search-title">Fleet Deployment</div><div className="search-snippet">Deploy code to all nodes simultaneously using the blackroad CLI...</div><div className="search-url">docs / deploy / fleet</div></div>
</div></div>
</div>


<div className="container section" id="dropdown">
<div className="section-head"><div className="section-num">22</div><div className="section-title">Dropdowns</div><div className="section-desc">Contextual menus and action lists</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">89 · Dropdown Menu (click to toggle)</div>
<div className="dropdown" id="dd1">
<button className="btn btn-outline" onclick="toggleDropdown('dd1')">Actions ▾</button>
<div className="dropdown-menu">
<div className="dropdown-label">Deploy</div>
<div className="dropdown-item">Deploy to production</div>
<div className="dropdown-item">Deploy to staging</div>
<div className="dropdown-divider"></div>
<div className="dropdown-label">Manage</div>
<div className="dropdown-item">View logs</div>
<div className="dropdown-item">Edit config</div>
<div className="dropdown-divider"></div>
<div className="dropdown-item" style={{{ color: "var(--sub)" }}}>Delete agent</div>
</div>
</div></div>
</div>


<div className="container section" id="code">
<div className="section-head"><div className="section-num">23</div><div className="section-title">Code</div><div className="section-desc">Code blocks, inline code, terminal output</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">90 · Code Block</div>
<div className="card"><div className="card-grad"></div><div className="card-header"><span className="card-header-title mono fs-12">deploy.sh</span><button className="btn btn-ghost btn-sm">Copy</button></div><div style={{{ padding: 18, fontFamily: "var(--jb)", fontSize: 12, color: "var(--text)", lineHeight: 1.8 }}}><span style={{{ color: "var(--muted)" }}}>#!/bin/bash</span><br /><span style={{{ color: "var(--sub)" }}}>set -e</span><br /><br /><span style={{{ color: "var(--sub)" }}}>NODES</span>=<span style={{{ color: "var(--text)" }}}>("alice" "cecilia" "octavia" "lucidia")</span><br /><br /><span style={{{ color: "var(--sub)" }}}>for</span> node <span style={{{ color: "var(--sub)" }}}>in</span> "${NODES[@]}"; <span style={{{ color: "var(--sub)" }}}>do</span><br />  echo <span style={{{ color: "var(--text)" }}}>"Deploying to $node..."</span><br />  ssh "$node" <span style={{{ color: "var(--text)" }}}>"cd /opt/blackroad && git pull && systemctl restart blackroad"</span><br /><span style={{{ color: "var(--sub)" }}}>done</span></div></div></div>

<div className="comp-group"><div className="comp-label">91 · Terminal Output</div>
<div className="card"><div className="card-body" style={{{ padding: 18 }}}><div className="terminal" style={{{ border: "none", background: "transparent", padding: 0 }}}><div className="cmd">$ blackroad status --fleet</div><div style={{{ marginTop: 8 }}}>alice      192.168.4.49   online   cpu:8%   mem:42%</div><div>cecilia    192.168.4.96   online   cpu:23%  mem:61%</div><div>octavia    192.168.4.100  online   cpu:15%  mem:38%</div><div>aria       192.168.4.98   <span style={{{ color: "var(--text)" }}}>offline</span></div><div>lucidia    192.168.4.38   online   cpu:31%  mem:54%</div><div style={{{ marginTop: 8 }}} className="cmd">$ _</div></div></div></div></div>

<div className="comp-group"><div className="comp-label">92 · Inline Code</div>
<p className="fs-14" style={{{ color: "var(--sub)", lineHeight: 1.8 }}}>Run <code style={{{ fontFamily: "var(--jb)", fontSize: 12, background: "var(--elevated)", padding: "2px 8px", borderRadius: 3, color: "var(--text)" }}}>blackroad deploy --all</code> to push to every node. The config lives at <code style={{{ fontFamily: "var(--jb)", fontSize: 12, background: "var(--elevated)", padding: "2px 8px", borderRadius: 3, color: "var(--text)" }}}>/etc/blackroad/config.toml</code>.</p></div>
</div>


<div className="container section" id="heroes">
<div className="section-head"><div className="section-num">24</div><div className="section-title">Hero Sections</div><div className="section-desc">Landing page hero layouts</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">93 · Centered Hero</div>
<div className="card"><div style={{{ textAlign: "center", padding: "80px 40px" }}}><div style={{{ width: 80, height: 4, borderRadius: 2, background: "var(--g)", margin: "0 auto 24px" }}}></div><h1 style={{{ fontWeight: 700, fontSize: 44, color: "var(--white)", letterSpacing: "-.02em", maxWidth: 600, margin: "0 auto 16px" }}}>Infrastructure that thinks for itself</h1><p style={{{ fontSize: 16, color: "var(--sub)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.6 }}}>Distributed AI operating system. Self-healing. Edge-native. Built on Raspberry Pi.</p><div className="row" style={{{ justifyContent: "center" }}}><button className="btn btn-white btn-lg">Get Started</button><button className="btn btn-outline btn-lg">View Docs</button></div></div></div></div>

<div className="comp-group"><div className="comp-label">94 · Split Hero</div>
<div className="card"><div className="row" style={{{ padding: "60px 40px", gap: 40, alignItems: "center" }}}><div style={{{ flex: 1 }}}><div style={{{ width: 48, height: 3, borderRadius: 2, background: "var(--g)", marginBottom: 20 }}}></div><h1 style={{{ fontWeight: 700, fontSize: 36, color: "var(--white)", marginBottom: 12 }}}>Build at the edge</h1><p style={{{ fontSize: 15, color: "var(--sub)", lineHeight: 1.7, marginBottom: 24 }}}>Deploy AI models across your fleet. No cloud. No latency. Full control.</p><div className="row"><button className="btn btn-white">Deploy Now</button><button className="btn btn-ghost">Learn More →</button></div></div><div style={{{ width: 300, height: 200, background: "var(--elevated)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}}><div style={{{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--g)" }}}></div><div className="anim-morph" style={{{ width: 60, height: 60 }}}></div></div></div></div></div>

<div className="comp-group"><div className="comp-label">95 · Minimal Hero</div>
<div style={{{ padding: "80px 0", textAlign: "center" }}}><div style={{{ display: "inline-flex", gap: 4, marginBottom: 20 }}}><div style={{{ width: 4, height: 24, borderRadius: 2, background: "var(--g)" }}}></div><div style={{{ width: 4, height: 24, borderRadius: 2, background: "var(--g)" }}}></div><div style={{{ width: 4, height: 24, borderRadius: 2, background: "var(--g)" }}}></div></div><h1 style={{{ fontWeight: 700, fontSize: 48, color: "var(--white)", letterSpacing: "-.03em" }}}>BlackRoad</h1><p style={{{ fontSize: 14, color: "var(--muted)", marginTop: 8, fontFamily: "var(--jb)" }}}>Distributed AI infrastructure</p></div></div>
</div>


<div className="container section" id="cta">
<div className="section-head"><div className="section-num">25</div><div className="section-title">Call to Action</div><div className="section-desc">Conversion sections and newsletter signup</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">96 · CTA Banner</div>
<div className="card"><div className="card-grad"></div><div style={{{ padding: "48px 40px", textAlign: "center" }}}><h2 style={{{ fontWeight: 700, fontSize: 28, color: "var(--white)", marginBottom: 12 }}}>Ready to deploy?</h2><p style={{{ fontSize: 14, color: "var(--sub)", marginBottom: 24 }}}>Get your fleet running in under 5 minutes.</p><div className="row" style={{{ justifyContent: "center" }}}><button className="btn btn-white btn-lg">Start Free</button><button className="btn btn-outline btn-lg">Schedule Demo</button></div></div></div></div>

<div className="comp-group"><div className="comp-label">97 · Newsletter Signup</div>
<div className="card" style={{{ maxWidth: 500 }}}><div className="card-grad"></div><div className="card-body" style={{{ padding: 28 }}}><div className="fw-600 fs-14" style={{{ color: "var(--white)", marginBottom: 4 }}}>Stay updated</div><p className="fs-13 text-sub mb-16">Get fleet updates and new features delivered weekly.</p><div className="row"><input className="input" placeholder="you@example.com" style={{{ flex: 1 }}} /><button className="btn btn-white">Subscribe</button></div></div></div></div>

<div className="comp-group"><div className="comp-label">98 · Inline CTA</div>
<div className="row" style={{{ alignItems: "center", padding: 24, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}}><div style={{{ flex: 1 }}}><div className="fw-600 fs-14" style={{{ color: "var(--white)" }}}>Need help setting up?</div><div className="fs-13 text-sub">Our team can configure your fleet remotely.</div></div><button className="btn btn-white">Get Help</button></div></div>
</div>


<div className="container section" id="misc">
<div className="section-head"><div className="section-num">26</div><div className="section-title">Misc Components</div><div className="section-desc">Dividers, spacers, logos, counters</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">99 · Gradient Dividers</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 24 }}}>
<div style={{{ height: 2, background: "var(--g)", borderRadius: 1 }}}></div>
<div style={{{ height: 1, background: "var(--g)", opacity: ".3" }}}></div>
<div style={{{ height: 4, background: "var(--g)", borderRadius: 2, maxWidth: 200 }}}></div>
<div style={{{ display: "flex", alignItems: "center", gap: 16 }}}><div style={{{ flex: 1, height: 1, background: "var(--border)" }}}></div><span className="mono fs-11 text-muted">or</span><div style={{{ flex: 1, height: 1, background: "var(--border)" }}}></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">100 · Logo Bar</div>
<div className="row" style={{{ justifyContent: "center", gap: 48, padding: "24px 0" }}}>
<span className="fs-14 fw-600 text-muted">Partner A</span>
<span className="fs-14 fw-600 text-muted">Partner B</span>
<span className="fs-14 fw-600 text-muted">Partner C</span>
<span className="fs-14 fw-600 text-muted">Partner D</span>
<span className="fs-14 fw-600 text-muted">Partner E</span>
</div></div>
</div>


<div className="container section" id="notifications">
<div className="section-head"><div className="section-num">27</div><div className="section-title">Notifications</div><div className="section-desc">Notification panels and activity feeds</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">101 · Notification Panel</div>
<div className="card" style={{{ maxWidth: 380 }}}><div className="card-grad"></div><div className="card-header"><span className="card-header-title">Notifications</span><button className="btn btn-ghost btn-sm">Mark all read</button></div>
<div className="list-item" style={{{ background: "var(--hover)" }}}><span className="list-item-indicator"></span><div className="list-item-text"><div className="fw-600 fs-12" style={{{ color: "var(--white)" }}}>Deploy complete</div><div className="fs-11 text-sub">v2.4.1 pushed to all nodes</div></div><span className="list-item-meta">2m</span></div>
<div className="list-item"><span style={{{ width: 20, height: 3, borderRadius: 2, background: "var(--border)", flexShrink: 0 }}}></span><div className="list-item-text"><div className="fw-600 fs-12" style={{{ color: "var(--sub)" }}}>Health check passed</div><div className="fs-11 text-muted">All nodes nominal</div></div><span className="list-item-meta">1h</span></div>
<div className="list-item"><span style={{{ width: 20, height: 3, borderRadius: 2, background: "var(--border)", flexShrink: 0 }}}></span><div className="list-item-text"><div className="fw-600 fs-12" style={{{ color: "var(--sub)" }}}>Backup completed</div><div className="fs-11 text-muted">Rclone sync to gdrive</div></div><span className="list-item-meta">6h</span></div>
<div className="card-footer"><button className="btn btn-ghost btn-sm" style={{{ margin: "0 auto" }}}>View all notifications</button></div></div></div>

<div className="comp-group"><div className="comp-label">102-104 · Activity Feed Items</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}}>
<div className="row" style={{{ gap: 12, alignItems: "flex-start" }}}><div style={{{ width: 3, minHeight: 40, borderRadius: 2, background: "var(--g)", flexShrink: 0, marginTop: 4 }}}></div><div><div className="fw-600 fs-13">Agent deployed to Cecilia</div><div className="fs-12 text-sub">blackroad-worker v1.2.0 started on 192.168.4.96</div><div className="mono fs-11 text-muted mt-8">2 minutes ago</div></div></div>
<div className="row" style={{{ gap: 12, alignItems: "flex-start" }}}><div style={{{ width: 3, minHeight: 40, borderRadius: 2, background: "var(--g)", flexShrink: 0, marginTop: 4 }}}></div><div><div className="fw-600 fs-13">Config updated</div><div className="fs-12 text-sub">WireGuard peers refreshed on all nodes</div><div className="mono fs-11 text-muted mt-8">15 minutes ago</div></div></div>
<div className="row" style={{{ gap: 12, alignItems: "flex-start" }}}><div style={{{ width: 3, minHeight: 40, borderRadius: 2, background: "var(--border)", flexShrink: 0, marginTop: 4 }}}></div><div><div className="fw-600 fs-13 text-sub">Backup completed</div><div className="fs-12 text-muted">Daily sync to Google Drive finished</div><div className="mono fs-11 text-muted mt-8">6 hours ago</div></div></div>
</div></div>
</div>


<div className="container section" id="metrics">
<div className="section-head"><div className="section-num">28</div><div className="section-title">Metrics & Dashboards</div><div className="section-desc">Data visualization components</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">105-108 · Metric Cards</div>
<div className="grid-4">
<div className="card"><div className="card-body"><div className="mono fs-11 text-muted mb-8">REQUESTS</div><div className="fw-700" style={{{ fontSize: 28, color: "var(--white)" }}}>12.4K</div><div className="mono fs-11 text-sub mt-8">↑ 8% vs last hour</div></div></div>
<div className="card"><div className="card-body"><div className="mono fs-11 text-muted mb-8">LATENCY</div><div className="fw-700" style={{{ fontSize: 28, color: "var(--white)" }}}>23ms</div><div className="mono fs-11 text-sub mt-8">p99: 89ms</div></div></div>
<div className="card"><div className="card-body"><div className="mono fs-11 text-muted mb-8">ERROR RATE</div><div className="fw-700" style={{{ fontSize: 28, color: "var(--white)" }}}>0.02%</div><div className="mono fs-11 text-sub mt-8">3 errors / 15K req</div></div></div>
<div className="card"><div className="card-body"><div className="mono fs-11 text-muted mb-8">THROUGHPUT</div><div className="fw-700" style={{{ fontSize: 28, color: "var(--white)" }}}>847/s</div><div className="mono fs-11 text-sub mt-8">Peak: 1,240/s</div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">109 · Sparkline-style bars</div>
<div className="card" style={{{ maxWidth: 500 }}}><div className="card-body"><div className="fw-600 fs-13 mb-16">Request volume (24h)</div><div style={{{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}}>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "30%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "45%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "60%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "40%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "75%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "90%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "100%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "85%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "70%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "55%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "65%" }}}></div>
<div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "80%" }}}></div>
</div><div className="row mt-8" style={{{ justifyContent: "space-between" }}}><span className="mono fs-11 text-muted">00:00</span><span className="mono fs-11 text-muted">12:00</span><span className="mono fs-11 text-muted">Now</span></div></div></div></div>

<div className="comp-group"><div className="comp-label">110-114 · Node Status Dashboard</div>
<div className="card"><div className="card-grad"></div><div className="card-header"><span className="card-header-title">Fleet Status</span><span className="mono fs-11 text-muted">Live · 4/5 online</span></div><div className="card-body" style={{{ padding: 0 }}}>
<table className="table"><thead><tr><th style={{{ width: 30 }}}></th><th>Node</th><th>CPU</th><th>Mem</th><th>Temp</th><th>Uptime</th></tr></thead><tbody>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="fw-600">Alice</td><td className="mono fs-12">8%</td><td className="mono fs-12">42%</td><td className="mono fs-12">52°C</td><td className="mono fs-12">14d</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="fw-600">Cecilia</td><td className="mono fs-12">23%</td><td className="mono fs-12">61%</td><td className="mono fs-12">58°C</td><td className="mono fs-12">14d</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="fw-600">Octavia</td><td className="mono fs-12">15%</td><td className="mono fs-12">38%</td><td className="mono fs-12">55°C</td><td className="mono fs-12">1d</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--border)" }}}></div></td><td className="fw-600 text-muted">Aria</td><td className="mono fs-12 text-muted">—</td><td className="mono fs-12 text-muted">—</td><td className="mono fs-12 text-muted">—</td><td className="mono fs-12 text-muted">down</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="fw-600">Lucidia</td><td className="mono fs-12">31%</td><td className="mono fs-12">54%</td><td className="mono fs-12">58°C</td><td className="mono fs-12">14d</td></tr>
</tbody></table></div></div></div>
</div>


<div className="container section" id="settings">
<div className="section-head"><div className="section-num">29</div><div className="section-title">Settings Panels</div><div className="section-desc">Configuration and preferences layouts</div></div>
<div className="divider"></div>

<div className="comp-group"><div className="comp-label">115-120 · Settings Rows</div>
<div className="card" style={{{ maxWidth: 600 }}}><div className="card-grad"></div>
<div style={{{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}}><div><div className="fw-600 fs-13">Auto-deploy</div><div className="fs-12 text-sub">Push to all nodes on git push</div></div><label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label></div>
<div style={{{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}}><div><div className="fw-600 fs-13">Health checks</div><div className="fs-12 text-sub">Monitor node status every 5m</div></div><label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label></div>
<div style={{{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}}><div><div className="fw-600 fs-13">Email alerts</div><div className="fs-12 text-sub">Send notifications on failures</div></div><label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label></div>
<div style={{{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}}><div><div className="fw-600 fs-13">Auto-restart</div><div className="fs-12 text-sub">Restart failed services automatically</div></div><label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label></div>
<div style={{{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}}><div><div className="fw-600 fs-13">Power optimization</div><div className="fs-12 text-sub">Conservative governor on all nodes</div></div><label className="toggle"><input type="checkbox" checked /><span className="toggle-slider"></span></label></div>
<div style={{{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}}><div><div className="fw-600 fs-13">Debug mode</div><div className="fs-12 text-sub">Verbose logging to all outputs</div></div><label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label></div>
</div></div>
</div>


<div className="container section" id="animations">
<div className="section-head"><div className="section-num">30</div><div className="section-title">Animations</div><div className="section-desc">Motion patterns for the brand</div></div>
<div className="divider"></div>

<div className="grid-2" style={{{ gap: 24 }}}>
<div className="comp-group"><div className="comp-label">121 · Gradient Sweep</div><div className="card"><div style={{{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}}><div style={{{ width: "80%" }}}><div className="anim-sweep"></div></div></div></div></div>
<div className="comp-group"><div className="comp-label">122 · Morph Shape</div><div className="card"><div style={{{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}}><div className="anim-morph"></div></div></div></div>
<div className="comp-group"><div className="comp-label">123 · Pulse Rings</div><div className="card"><div style={{{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}}><div style={{{ position: "relative", width: 80, height: 80 }}}><div style={{{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", background: "var(--g135) border-box", WebkitMask: "linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", animation: "pulseRing 2.4s ease-out infinite" }}}></div><div style={{{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", background: "var(--g135) border-box", WebkitMask: "linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", animation: "pulseRing 2.4s ease-out .8s infinite" }}}></div><div style={{{ position: "absolute", top: "50%", left: "50%", width: 8, height: 8, margin: -4, borderRadius: "50%", background: "#fff" }}}></div></div></div></div></div>
<div className="comp-group"><div className="comp-label">124 · Spectrum Bars</div><div className="card"><div style={{{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}}><div style={{{ display: "flex", gap: 4, alignItems: "center", height: 60 }}}><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out infinite", transformOrigin: "center" }}}></span><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out .1s infinite", transformOrigin: "center" }}}></span><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out .2s infinite", transformOrigin: "center" }}}></span><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out .3s infinite", transformOrigin: "center" }}}></span><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out .4s infinite", transformOrigin: "center" }}}></span><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out .5s infinite", transformOrigin: "center" }}}></span><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out .6s infinite", transformOrigin: "center" }}}></span><span style={{{ width: 5, height: "100%", borderRadius: 3, background: "var(--g135)", animation: "barWave 1.4s ease-in-out .7s infinite", transformOrigin: "center" }}}></span></div></div></div></div>
<div className="comp-group"><div className="comp-label">125 · Orbit</div><div className="card"><div style={{{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}}><div style={{{ position: "relative", width: 120, height: 120 }}}><div style={{{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid var(--border)" }}}></div><div style={{{ position: "absolute", inset: 20, borderRadius: "50%", border: "1px solid #141414" }}}></div><div style={{{ position: "absolute", top: "50%", left: "50%", width: 8, height: 8, margin: -4, borderRadius: "50%", background: "#fff" }}}></div><div style={{{ position: "absolute", top: "50%", left: "50%", width: 6, height: 6, margin: -3, animation: "orbit 4s linear infinite" }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div></div></div></div></div></div>
<div className="comp-group"><div className="comp-label">126 · Floating Particles</div><div className="card"><div style={{{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}}><div style={{{ position: "relative", width: 200, height: 100 }}}><div style={{{ position: "absolute", width: 12, height: 12, borderRadius: "50%", background: "var(--g135)", top: "20%", left: "15%", animation: "float1 5s ease-in-out infinite" }}}></div><div style={{{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "var(--g135)", top: "60%", left: "45%", animation: "float2 4s ease-in-out infinite" }}}></div><div style={{{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "var(--g135)", top: "30%", left: "70%", animation: "float1 6s ease-in-out 1s infinite" }}}></div><div style={{{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "var(--g135)", top: "75%", left: "25%", animation: "float2 3.5s ease-in-out .5s infinite" }}}></div></div></div></div></div>
</div>

<div className="comp-group"><div className="comp-label">127 · Loading Line</div><div style={{{ height: 4, borderRadius: 2, background: "var(--elevated)", position: "relative", overflow: "hidden", marginTop: 16 }}}><div style={{{ position: "absolute", top: 0, height: "100%", width: "30%", borderRadius: 2, background: "var(--g)", animation: "loadSlide 1.8s ease-in-out infinite" }}}></div></div></div>

<div className="comp-group"><div className="comp-label">128 · Typewriter</div><div style={{{ marginTop: 16 }}}><div style={{{ fontFamily: "var(--jb)", fontSize: 14, color: "var(--white)", overflow: "hidden", whiteSpace: "nowrap", display: "inline-block", animation: "typewriter 4s steps(24) infinite", borderRight: "2px solid var(--white)" }}}>blackroad deploy --fleet all</div><div style={{{ height: 2, borderRadius: 1, background: "var(--g)", marginTop: 8, maxWidth: 300, opacity: ".5" }}}></div></div></div>
</div>


<div className="container section">
<div className="section-head"><div className="section-num">31</div><div className="section-title">Additional Components</div><div className="section-desc">129-200+ remaining components</div></div>
<div className="divider"></div>


<div className="comp-group"><div className="comp-label">129-132 · Stat Row</div>
<div className="card"><div className="card-body"><div className="row" style={{{ textAlign: "center" }}}>
<div className="col"><div className="fw-700" style={{{ fontSize: 24, color: "var(--white)" }}}>207</div><div className="fs-12 text-sub">Repos</div></div>
<div style={{{ width: 1, background: "var(--border)" }}}></div>
<div className="col"><div className="fw-700" style={{{ fontSize: 24, color: "var(--white)" }}}>5</div><div className="fs-12 text-sub">Nodes</div></div>
<div style={{{ width: 1, background: "var(--border)" }}}></div>
<div className="col"><div className="fw-700" style={{{ fontSize: 24, color: "var(--white)" }}}>52</div><div className="fs-12 text-sub">TOPS</div></div>
<div style={{{ width: 1, background: "var(--border)" }}}></div>
<div className="col"><div className="fw-700" style={{{ fontSize: 24, color: "var(--white)" }}}>99.8%</div><div className="fs-12 text-sub">Uptime</div></div>
</div></div></div></div>


<div className="comp-group"><div className="comp-label">133-136 · User Row</div>
<div className="list-bordered">
<div className="list-item"><span className="avatar avatar-sm">A</span><div style={{{ flex: 1 }}}><div className="fw-600 fs-13">Alexa</div><div className="fs-11 text-muted">admin · all nodes</div></div><span className="badge badge-grad"><span className="badge-dot"></span>Active</span></div>
<div className="list-item"><span className="avatar avatar-sm">B</span><div style={{{ flex: 1 }}}><div className="fw-600 fs-13">blackroad</div><div className="fs-11 text-muted">deploy · cecilia, octavia</div></div><span className="badge badge-grad"><span className="badge-dot"></span>Active</span></div>
<div className="list-item"><span className="avatar avatar-sm">P</span><div style={{{ flex: 1 }}}><div className="fw-600 fs-13">pi</div><div className="fs-11 text-muted">system · alice, octavia</div></div><span className="badge"><span className="badge-dot" style={{{ background: "#333" }}}></span>System</span></div>
<div className="list-item"><span className="avatar avatar-sm">O</span><div style={{{ flex: 1 }}}><div className="fw-600 fs-13">octavia</div><div className="fs-11 text-muted">deploy · lucidia</div></div><span className="badge"><span className="badge-dot" style={{{ background: "#333" }}}></span>System</span></div>
</div></div>


<div className="comp-group"><div className="comp-label">137-140 · API Key List</div>
<div className="list-bordered">
<div className="list-item"><div style={{{ flex: 1 }}}><div className="fw-600 fs-13">Production</div><div className="mono fs-11 text-muted">br_live_4f8a...c2d1</div></div><span className="mono fs-11 text-muted">Created Mar 1</span><button className="btn btn-ghost btn-sm">Revoke</button></div>
<div className="list-item"><div style={{{ flex: 1 }}}><div className="fw-600 fs-13">Staging</div><div className="mono fs-11 text-muted">br_test_9e3b...a7f4</div></div><span className="mono fs-11 text-muted">Created Feb 28</span><button className="btn btn-ghost btn-sm">Revoke</button></div>
<div className="list-item"><div style={{{ flex: 1 }}}><div className="fw-600 fs-13">Development</div><div className="mono fs-11 text-muted">br_dev_2c1d...8e5a</div></div><span className="mono fs-11 text-muted">Created Feb 15</span><button className="btn btn-ghost btn-sm">Revoke</button></div>
</div></div>


<div className="comp-group"><div className="comp-label">141-146 · Dashboard Layout</div>
<div style={{{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}}>
<div className="card"><div className="card-grad"></div><div className="card-body" style={{{ padding: 24 }}}><div className="fw-600 fs-14 mb-16" style={{{ color: "var(--white)" }}}>Fleet Overview</div><div style={{{ display: "flex", gap: 3, alignItems: "flex-end", height: 80, marginBottom: 12 }}}><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "40%" }}}></div><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "55%" }}}></div><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "70%" }}}></div><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "85%" }}}></div><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "60%" }}}></div><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "90%" }}}></div><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "75%" }}}></div><div style={{{ flex: 1, background: "var(--g)", borderRadius: "2px 2px 0 0", height: "95%" }}}></div></div><div className="fs-12 text-sub">Request volume over the last 8 hours</div></div></div>
<div style={{{ display: "flex", flexDirection: "column", gap: 20 }}}>
<div className="card"><div className="card-body"><div className="mono fs-11 text-muted mb-8">ACTIVE AGENTS</div><div className="fw-700" style={{{ fontSize: 36, color: "var(--white)" }}}>12</div></div></div>
<div className="card"><div className="card-body"><div className="mono fs-11 text-muted mb-8">DEPLOYMENTS</div><div className="fw-700" style={{{ fontSize: 36, color: "var(--white)" }}}>847</div></div></div>
</div>
</div></div>


<div className="comp-group"><div className="comp-label">147-152 · Deployment History</div>
<div className="table-wrap"><table className="table"><thead><tr><th></th><th>Version</th><th>Target</th><th>Duration</th><th>Time</th></tr></thead><tbody>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="mono fs-12">v2.4.1</td><td>All nodes</td><td className="mono fs-12 text-sub">12s</td><td className="mono fs-12 text-muted">2m ago</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="mono fs-12">v2.4.0</td><td>Cecilia, Octavia</td><td className="mono fs-12 text-sub">8s</td><td className="mono fs-12 text-muted">1d ago</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--border)" }}}></div></td><td className="mono fs-12">v2.3.9</td><td>Alice</td><td className="mono fs-12 text-sub">4s</td><td className="mono fs-12 text-muted">2d ago</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="mono fs-12">v2.3.8</td><td>All nodes</td><td className="mono fs-12 text-sub">15s</td><td className="mono fs-12 text-muted">3d ago</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="mono fs-12">v2.3.7</td><td>Lucidia</td><td className="mono fs-12 text-sub">5s</td><td className="mono fs-12 text-muted">4d ago</td></tr>
<tr><td><div style={{{ width: 12, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></td><td className="mono fs-12">v2.3.6</td><td>All nodes</td><td className="mono fs-12 text-sub">14s</td><td className="mono fs-12 text-muted">5d ago</td></tr>
</tbody></table></div></div>


<div className="comp-group"><div className="comp-label">153-160 · Login Form</div>
<div className="card" style={{{ maxWidth: 400, margin: "0 auto" }}}><div className="card-grad"></div><div className="card-body" style={{{ padding: 32, textAlign: "center" }}}>
<div style={{{ width: 48, height: 4, borderRadius: 2, background: "var(--g)", margin: "0 auto 16px" }}}></div>
<div className="fw-700" style={{{ fontSize: 20, color: "var(--white)", marginBottom: 4 }}}>Welcome back</div>
<div className="fs-13 text-sub mb-24">Sign in to your BlackRoad account</div>
<div style={{{ marginBottom: 14, textAlign: "left" }}}><label className="input-label">Email</label><input className="input" type="email" placeholder="you@example.com" /></div>
<div style={{{ marginBottom: 20, textAlign: "left" }}}><label className="input-label">Password</label><input className="input" type="password" placeholder="••••••••" /></div>
<button className="btn btn-white" style={{{ width: "100%", marginBottom: 12 }}}>Sign In</button>
<button className="btn btn-outline" style={{{ width: "100%", marginBottom: 16 }}}>Continue with GitHub</button>
<div className="fs-12 text-sub">Don't have an account? <a href="#" style={{{ color: "var(--white)", fontWeight: 500 }}}>Sign up</a></div>
</div></div></div>


<div className="comp-group"><div className="comp-label">161-164 · Range / Slider display</div>
<div className="grid-2">
<div><div className="progress-label"><span>CPU Limit</span><span>75%</span></div><div className="progress-track" style={{{ height: 6, borderRadius: 3 }}}><div className="progress-fill" style={{{ width: "75%", borderRadius: 3 }}}></div></div></div>
<div><div className="progress-label"><span>Memory Limit</span><span>60%</span></div><div className="progress-track" style={{{ height: 6, borderRadius: 3 }}}><div className="progress-fill" style={{{ width: "60%", borderRadius: 3 }}}></div></div></div>
</div></div>

<div className="comp-group"><div className="comp-label">165-168 · Status Indicators</div>
<div className="row" style={{{ gap: 32 }}}>
<div className="row" style={{{ gap: 8, alignItems: "center" }}}><div style={{{ width: 8, height: 8, borderRadius: "50%", background: "var(--white)" }}}></div><span className="fs-13">Operational</span></div>
<div className="row" style={{{ gap: 8, alignItems: "center" }}}><div style={{{ width: 20, height: 3, borderRadius: 2, background: "var(--g)" }}}></div><span className="fs-13">Healthy</span></div>
<div className="row" style={{{ gap: 8, alignItems: "center" }}}><div style={{{ width: 8, height: 8, borderRadius: "50%", background: "var(--muted)" }}}></div><span className="fs-13 text-sub">Degraded</span></div>
<div className="row" style={{{ gap: 8, alignItems: "center" }}}><div style={{{ width: 8, height: 8, borderRadius: "50%", background: "#222" }}}></div><span className="fs-13 text-muted">Offline</span></div>
</div></div>


<div className="comp-group"><div className="comp-label">169-172 · Comparison Table</div>
<div className="table-wrap"><table className="table"><thead><tr><th>Feature</th><th style={{{ textAlign: "center" }}}>Starter</th><th style={{{ textAlign: "center" }}}>Pro</th><th style={{{ textAlign: "center" }}}>Enterprise</th></tr></thead><tbody>
<tr><td>Nodes</td><td style={{{ textAlign: "center" }}}>1</td><td style={{{ textAlign: "center" }}}>10</td><td style={{{ textAlign: "center" }}}>Unlimited</td></tr>
<tr><td>Agents</td><td style={{{ textAlign: "center" }}}>5</td><td style={{{ textAlign: "center" }}}>Unlimited</td><td style={{{ textAlign: "center" }}}>Unlimited</td></tr>
<tr><td>Support</td><td style={{{ textAlign: "center" }}}>Community</td><td style={{{ textAlign: "center" }}}>Priority</td><td style={{{ textAlign: "center" }}}>Dedicated</td></tr>
<tr><td>Analytics</td><td style={{{ textAlign: "center" }}}>Basic</td><td style={{{ textAlign: "center" }}}>Advanced</td><td style={{{ textAlign: "center" }}}>Custom</td></tr>
<tr><td>SLA</td><td style={{{ textAlign: "center" }}}>—</td><td style={{{ textAlign: "center" }}}>99.5%</td><td style={{{ textAlign: "center" }}}>99.99%</td></tr>
</tbody></table></div></div>


<div className="comp-group"><div className="comp-label">173-180 · Quick Reference Cards</div>
<div className="grid-4">
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">SSH</div><div className="fw-600 fs-13 mt-8">Port 22</div></div></div>
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">DNS</div><div className="fw-600 fs-13 mt-8">Port 53</div></div></div>
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">Gitea</div><div className="fw-600 fs-13 mt-8">Port 3100</div></div></div>
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">Ollama</div><div className="fw-600 fs-13 mt-8">Port 11434</div></div></div>
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">Stats</div><div className="fw-600 fs-13 mt-8">Port 7890</div></div></div>
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">NATS</div><div className="fw-600 fs-13 mt-8">Port 4222</div></div></div>
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">MinIO</div><div className="fw-600 fs-13 mt-8">Port 9000</div></div></div>
<div className="card card-sm"><div className="card-body"><div className="mono fs-11 text-muted">Tunnel</div><div className="fw-600 fs-13 mt-8">Port 20241</div></div></div>
</div></div>


<div className="comp-group"><div className="comp-label">181-186 · Color Reference Swatches</div>
<div className="row" style={{{ gap: 12 }}}>
<div style={{{ textAlign: "center" }}}><div style={{{ width: 48, height: 48, borderRadius: 8, background: "var(--g135)", marginBottom: 6 }}}></div><div className="mono fs-11 text-muted">Gradient</div></div>
<div style={{{ textAlign: "center" }}}><div style={{{ width: 48, height: 48, borderRadius: 8, background: "#000", border: "1px solid var(--border)", marginBottom: 6 }}}></div><div className="mono fs-11 text-muted">Base</div></div>
<div style={{{ textAlign: "center" }}}><div style={{{ width: 48, height: 48, borderRadius: 8, background: "#0a0a0a", border: "1px solid var(--border)", marginBottom: 6 }}}></div><div className="mono fs-11 text-muted">Card</div></div>
<div style={{{ textAlign: "center" }}}><div style={{{ width: 48, height: 48, borderRadius: 8, background: "#111", border: "1px solid var(--border)", marginBottom: 6 }}}></div><div className="mono fs-11 text-muted">Elevated</div></div>
<div style={{{ textAlign: "center" }}}><div style={{{ width: 48, height: 48, borderRadius: 8, background: "#222", marginBottom: 6 }}}></div><div className="mono fs-11 text-muted">Border</div></div>
<div style={{{ textAlign: "center" }}}><div style={{{ width: 48, height: 48, borderRadius: 8, background: "#f5f5f5", marginBottom: 6 }}}></div><div className="mono fs-11 text-muted">Primary</div></div>
</div></div>


<div className="comp-group"><div className="comp-label">187-192 · Typography Scale</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 12 }}}>
<div className="fw-700" style={{{ fontSize: 48, color: "var(--white)", letterSpacing: "-.03em" }}}>Display 48</div>
<div className="fw-700" style={{{ fontSize: 36, color: "var(--white)", letterSpacing: "-.02em" }}}>Heading 36</div>
<div className="fw-600" style={{{ fontSize: 24, color: "var(--white)" }}}>Heading 24</div>
<div className="fw-600" style={{{ fontSize: 18, color: "var(--white)" }}}>Heading 18</div>
<div style={{{ fontSize: 15, color: "#999" }}}>Body text at 15px with regular weight for paragraph content.</div>
<div className="mono" style={{{ fontSize: 12, color: "var(--sub)" }}}>JetBrains Mono 12px for code and technical content</div>
</div></div>


<div className="comp-group"><div className="comp-label">193-196 · Icon Boxes</div>
<div className="row" style={{{ gap: 16 }}}>
<div style={{{ width: 48, height: 48, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}}><span style={{{ fontSize: 18, color: "var(--sub)" }}}>◈</span><div style={{{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--g)" }}}></div></div>
<div style={{{ width: 48, height: 48, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}}><span style={{{ fontSize: 18, color: "var(--sub)" }}}>◇</span><div style={{{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--g)" }}}></div></div>
<div style={{{ width: 48, height: 48, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}}><span style={{{ fontSize: 18, color: "var(--sub)" }}}>◎</span><div style={{{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--g)" }}}></div></div>
<div style={{{ width: 48, height: 48, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}}><span style={{{ fontSize: 18, color: "var(--sub)" }}}>⬡</span><div style={{{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--g)" }}}></div></div>
</div></div>


<div className="comp-group"><div className="comp-label">197 · Brand Mark</div>
<div style={{{ textAlign: "center", padding: 40 }}}>
<div style={{{ display: "inline-flex", gap: 4, marginBottom: 16 }}}><div style={{{ width: 5, height: 28, borderRadius: 2, background: "var(--g)" }}}></div><div style={{{ width: 5, height: 28, borderRadius: 2, background: "var(--g)" }}}></div><div style={{{ width: 5, height: 28, borderRadius: 2, background: "var(--g)" }}}></div></div>
<div className="fw-700" style={{{ fontSize: 32, color: "var(--white)", letterSpacing: "-.03em" }}}>BlackRoad</div>
<div className="mono fs-11 text-muted" style={{{ marginTop: 4 }}}>Distributed AI Operating System</div>
</div></div>

<div className="comp-group"><div className="comp-label">198 · Watermark</div>
<div style={{{ textAlign: "center", padding: 32 }}}><div className="fw-700" style={{{ fontSize: 80, color: "#0a0a0a", letterSpacing: "-.04em", userSelect: "none" }}}>BLACKROAD</div></div></div>

<div className="comp-group"><div className="comp-label">199-200 · Section Markers</div>
<div style={{{ display: "flex", flexDirection: "column", gap: 24 }}}>
<div style={{{ display: "flex", alignItems: "center", gap: 16 }}}><div style={{{ width: 48, height: 3, borderRadius: 2, background: "var(--g)" }}}></div><span className="fw-700" style={{{ fontSize: 20, color: "var(--white)" }}}>Section Title</span></div>
<div style={{{ display: "flex", alignItems: "center", gap: 16 }}}><div style={{{ width: 24, height: 24, borderRadius: 6, background: "var(--g135)" }}}></div><span className="fw-600 fs-14" style={{{ color: "var(--white)" }}}>Featured Block</span><span className="fs-12 text-sub">With subtitle description text</span></div>
</div></div>
</div>


<div className="container">
<div className="site-footer">
<div className="footer-grid">
<div><div className="footer-brand">BlackRoad</div><div className="footer-brand-bar"></div><div className="footer-desc">Distributed AI operating system built on Raspberry Pi hardware. Self-healing, edge-native, open source.</div></div>
<div><div className="footer-heading">Product</div><ul className="footer-links"><li><a href="#">Overview</a></li><li><a href="#">Features</a></li><li><a href="https://blackroad-store.pages.dev">Pricing</a></li><li><a href="#">Changelog</a></li></ul></div>
<div><div className="footer-heading">Docs</div><ul className="footer-links"><li><a href="#">Getting Started</a></li><li><a href="#">API Reference</a></li><li><a href="#">Deployment</a></li><li><a href="#">Architecture</a></li></ul></div>
<div><div className="footer-heading">Company</div><ul className="footer-links"><li><a href="https://hr-blackroad-io.pages.dev">About</a></li><li><a href="https://blackroad-research.pages.dev">Blog</a></li><li><a href="https://github.com/blackboxprogramming">GitHub</a></li><li><a href="https://support-blackroad-io.pages.dev">Contact</a></li></ul></div>
</div>
<div className="footer-bottom"><span className="footer-copy">© 2026 BlackRoad. All rights reserved.</span><div style={{{ width: 48, height: 3, borderRadius: 2, background: "var(--g)" }}}></div></div>
</div>
</div>

</div>

<div className="grad-bar"></div>








      </div>
    </>
  );
}
