import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { ExpensePieChart, IncomeExpenseBar } from '../components/Charts'
import AnimatedCounter from '../components/AnimatedCounter'
import Skeleton from '../components/Skeleton'
import ConfettiBurst from '../components/ConfettiBurst'
import { useToast } from '../components/Toast'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'

/* ═══════════════════════════════════════════════════════════════════════
   DESIGN : Original glassmorphism (green · cyan · void dark)
   UPGRADED WITH:
     • Unbounded + Manrope + DM Mono font system
     • Film-grain overlay
     • Floating mesh orbs
     • Staggered reveal animations (fadeUp, scaleIn, txIn)
     • Transaction timeline with spine + dots
     • Sticky sidebar (AI insights + Quick Stats card)
     • Page header with eyebrow text
     • Savings rate pill on balance card
     • Top-category and avg-entry quick stats
     • Shimmer skeleton for AI loading
     • Delete confirmation modal
     • All bugs from previous audit fixed
   REMOVED:
     • Holographic conic-border animation
     • bg.jpg dependency
     • blob div elements (replaced by canvas + mesh orbs)
     • duplicate CSS rules
═══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Manrope:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

:root {
  --void:   #030306;
  --s1:     #08080f;
  --s2:     #0e0e1a;
  --green:  #00ff88;
  --green-d:rgba(0,255,136,0.10);
  --green-g:rgba(0,255,136,0.22);
  --cyan:   #00d4ff;
  --cyan-d: rgba(0,212,255,0.10);
  --cyan-g: rgba(0,212,255,0.22);
  --red:    #ff6b6b;
  --red-d:  rgba(255,107,107,0.10);
  --ink:    #ffffff;
  --ink2:   rgba(255,255,255,0.78);
  --ink3:   rgba(255,255,255,0.45);
  --ink4:   rgba(255,255,255,0.14);
  --b1:     rgba(255,255,255,0.10);
  --b2:     rgba(255,255,255,0.18);
  --rXL:    28px;
  --rLG:    20px;
  --rMD:    14px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Manrope', sans-serif;
  background: var(--void);
  color: var(--ink);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--b2); border-radius: 999px; }

/* ── Film grain ── */
.grain {
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px; mix-blend-mode: overlay;
}

/* ── Mesh orbs ── */
.mesh-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(130px); will-change: transform; }
.oa { width: 750px; height: 750px; top: -220px; left: -180px; background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%); animation: of1 24s ease-in-out infinite alternate; }
.ob { width: 600px; height: 600px; bottom: -120px; right: -160px; background: radial-gradient(circle, rgba(0,255,136,0.055) 0%, transparent 70%); animation: of2 30s ease-in-out infinite alternate; }
.oc { width: 450px; height: 450px; top: 40%; left: 38%; background: radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%); animation: of3 20s ease-in-out infinite alternate; }
.od { width: 380px; height: 380px; top: 12%; right: 10%; background: radial-gradient(circle, rgba(0,255,136,0.035) 0%, transparent 70%); animation: of4 22s ease-in-out infinite alternate; }
@keyframes of1 { to { transform: translate(70px, 55px) scale(1.12); } }
@keyframes of2 { to { transform: translate(-55px, -70px) scale(1.08); } }
@keyframes of3 { to { transform: translate(35px, -45px) scale(0.9); } }
@keyframes of4 { to { transform: translate(-35px, 55px) scale(1.18); } }

/* ── Star canvas ── */
.star-canvas { position: fixed; inset: 0; z-index: 1; pointer-events: none; mix-blend-mode: screen; }

/* ── Keyframes ── */
@keyframes navSlide  { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: none; } }
@keyframes fadeUp    { from { opacity: 0; transform: translateY(24px);   } to { opacity: 1; transform: none; } }
@keyframes scaleIn   { from { opacity: 0; transform: scale(0.95) translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes txIn      { from { opacity: 0; transform: translateX(-12px);  } to { opacity: 1; transform: none; } }
@keyframes fadeIn    { from { opacity: 0; }  to { opacity: 1; } }
@keyframes modalIn   { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes logoPulse { 0%,100% { filter: drop-shadow(0 0 8px rgba(0,255,136,0.4)); } 50% { filter: drop-shadow(0 0 22px rgba(0,255,136,0.75)); } }
@keyframes blink     { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
@keyframes barGrow   { from { width: 0 !important; } }
@keyframes shimmer   { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes orbPulse  { 0%,100% { box-shadow: 0 0 0 0 rgba(0,212,255,0.25); } 50% { box-shadow: 0 0 0 10px rgba(0,212,255,0); } }

/* ── Navbar ── */
.navbar {
  position: sticky; top: 0; z-index: 200;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 2.5rem;
  background: rgba(4, 4, 10, 0.88);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.5);
  animation: navSlide 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
.nav-brand { display: flex; align-items: center; gap: 0.75rem; }
.nav-logo-mark {
  width: 36px; height: 36px; border-radius: 11px;
  background: linear-gradient(135deg, #00ff88, #00b8ff);
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
  box-shadow: 0 0 20px rgba(0,255,136,0.3), inset 0 1px 1px rgba(255,255,255,0.25);
  animation: logoPulse 3.5s ease-in-out infinite;
}
.nav-wordmark {
  font-family: 'Unbounded', sans-serif;
  font-size: 0.82rem; font-weight: 700; letter-spacing: 0.02em;
}
.nav-wordmark em { color: var(--green); font-style: normal; }

.nav-right { display: flex; align-items: center; gap: 1.25rem; }
.nav-greeting { font-size: 0.82rem; color: var(--ink2); font-weight: 500; }
.nav-greeting strong { color: var(--ink); font-weight: 700; }
.nav-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--cyan), var(--green));
  display: flex; align-items: center; justify-content: center;
  font-family: 'Unbounded', sans-serif; font-size: 0.7rem; font-weight: 700;
  color: var(--void); border: 1px solid rgba(255,255,255,0.12);
  cursor: pointer; transition: all 0.25s ease;
}
.nav-avatar:hover { transform: scale(1.1); box-shadow: 0 0 18px var(--cyan-g); }
.logout-btn {
  padding: 0.45rem 1.1rem; border-radius: 50px;
  border: 1px solid var(--b2); background: rgba(255,255,255,0.05);
  color: var(--ink2); font-size: 0.76rem; font-family: 'Manrope', sans-serif;
  font-weight: 700; cursor: pointer; transition: all 0.25s ease; letter-spacing: 0.02em;
}
.logout-btn:hover {
  border-color: rgba(255,107,107,0.45); color: var(--red);
  background: rgba(255,107,107,0.07);
}

/* ── Content ── */
.content { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.75rem 5rem; position: relative; z-index: 2; }

/* ── Page header ── */
.page-hd { margin-bottom: 2rem; animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.page-eye {
  font-family: 'DM Mono', monospace; font-size: 0.62rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink3);
  margin-bottom: 0.45rem;
}
.page-title {
  font-family: 'Unbounded', sans-serif; font-size: 1.5rem;
  font-weight: 900; letter-spacing: -0.03em; line-height: 1.1;
}
.page-title span { color: var(--green); }

/* ── Glassmorphism Card (base) ── */
.glass {
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  /* Layered bg: a solid dark floor + a white-tinted glass layer on top */
  background:
    linear-gradient(135deg, rgba(255,255,255,0.085), rgba(255,255,255,0.03)),
    rgba(8, 8, 18, 0.72);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: var(--rXL);
  position: relative; overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease, border-color 0.35s ease;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.18),
    inset 0 -1px 0 rgba(0,0,0,0.3),
    0 8px 32px rgba(0,0,0,0.55),
    0 2px 8px rgba(0,0,0,0.4);
}
/* Top-edge light streak */
.glass::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at 70% 0%, rgba(255,255,255,0.1), transparent 60%);
}
.glass:hover { transform: translateY(-5px); }
.glass:hover {
  border-color: rgba(255,255,255,0.22);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 -1px 0 rgba(0,0,0,0.3),
    0 20px 56px rgba(0,0,0,0.65),
    0 4px 12px rgba(0,0,0,0.4);
}

/* ── Stat Cards: per-card hover accent borders ── */
.card-income:hover  { border-color: rgba(0,255,136,0.35);  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 20px 56px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,136,0.1); }
.card-expense:hover { border-color: rgba(255,107,107,0.35); box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 20px 56px rgba(0,0,0,0.6), 0 0 40px rgba(255,107,107,0.1); }
.card-balance:hover { border-color: rgba(0,212,255,0.35);  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 20px 56px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.1); }

/* ── Bento grid ── */
.bento {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem; margin-bottom: 1.5rem;
  animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
}
.bento .glass { padding: 1.9rem; }

/* ── Card internals ── */
.card-eye {
  font-family: 'DM Mono', monospace; font-size: 0.62rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.55);
  margin-bottom: 0.9rem; display: flex; align-items: center; gap: 0.5rem;
}
.card-eye-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
  animation: blink 2.5s ease-in-out infinite;
}
.card-eye-dot.g { background: var(--green); box-shadow: 0 0 6px var(--green); }
.card-eye-dot.c { background: var(--cyan);  box-shadow: 0 0 6px var(--cyan);  }
.card-eye-dot.r { background: var(--red);   box-shadow: 0 0 6px var(--red);   }

.card-amount {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(1.5rem, 3.5vw, 2.2rem); font-weight: 900;
  letter-spacing: -0.04em; line-height: 1;
  transition: transform 0.3s ease;
}
.glass:hover .card-amount { transform: scale(1.04); }
.card-amount.green { color: var(--green); filter: drop-shadow(0 0 12px rgba(0,255,136,0.25)); }
.card-amount.red   { color: var(--red);   filter: drop-shadow(0 0 12px rgba(255,107,107,0.25)); }
.card-amount.cyan  { color: var(--cyan);  filter: drop-shadow(0 0 12px rgba(0,212,255,0.25)); }

/* Progress bar under each stat */
.card-bar { height: 2px; background: var(--b1); border-radius: 999px; overflow: hidden; margin-top: 1.25rem; }
.card-bar-fill { height: 100%; border-radius: 999px; animation: barGrow 1.4s cubic-bezier(0.16,1,0.3,1) both; }
.card-bar-fill.green { background: linear-gradient(90deg, var(--green), rgba(0,255,136,0.4)); }
.card-bar-fill.red   { background: linear-gradient(90deg, var(--red),   rgba(255,107,107,0.4)); }
.card-bar-fill.cyan  { background: linear-gradient(90deg, var(--cyan),  rgba(0,212,255,0.4)); }

/* Savings pill (balance card) */
.sav-pill {
  display: inline-flex; margin-top: 0.85rem;
  padding: 0.28rem 0.8rem; border-radius: 999px;
  font-family: 'DM Mono', monospace; font-size: 0.68rem; font-weight: 500;
  letter-spacing: 0.04em;
}
.sav-pill.good { background: var(--green-d); color: var(--green); border: 1px solid rgba(0,255,136,0.25); }
.sav-pill.warn { background: rgba(255,200,0,0.1); color: #ffd84d; border: 1px solid rgba(255,200,0,0.25); }
.sav-pill.bad  { background: var(--red-d);   color: var(--red);   border: 1px solid rgba(255,107,107,0.25); }

/* ── Charts row ── */
.chart-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
  margin-bottom: 1.5rem;
  animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both;
}
.card-chart { padding: 1.9rem 2rem; }
.chart-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.chart-title { font-family: 'Unbounded', sans-serif; font-size: 0.76rem; font-weight: 700; letter-spacing: -0.01em; }
.chart-sub   { font-size: 0.65rem; color: var(--ink3); margin-top: 0.2rem; font-family: 'DM Mono', monospace; letter-spacing: 0.04em; }
.chart-badge {
  padding: 0.28rem 0.7rem; border-radius: 999px;
  font-size: 0.62rem; font-family: 'DM Mono', monospace; font-weight: 500; letter-spacing: 0.06em;
}
.chart-badge.green { background: var(--green-d); color: var(--green); border: 1px solid rgba(0,255,136,0.2); }
.chart-badge.cyan  { background: var(--cyan-d);  color: var(--cyan);  border: 1px solid rgba(0,212,255,0.2); }

/* ── Main two-column panel ── */
.main-panel {
  display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.25rem; align-items: start;
  animation: fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both;
}

/* ── Panel header ── */
.panel-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem; }
.panel-hl { display: flex; align-items: baseline; gap: 0.5rem; }
.panel-title { font-family: 'Unbounded', sans-serif; font-size: 0.85rem; font-weight: 800; letter-spacing: -0.02em; }
.panel-count { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--ink3); }

/* ── Primary button ── */
.btn-primary {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.6rem 1.3rem; border-radius: 50px;
  border: 1px solid rgba(0,255,136,0.3);
  background: linear-gradient(135deg, rgba(0,220,150,0.85), rgba(0,180,200,0.85));
  color: var(--void); font-size: 0.78rem; font-family: 'Manrope', sans-serif;
  font-weight: 800; cursor: pointer; letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 6px 20px rgba(0,220,150,0.28), inset 0 1px 1px rgba(255,255,255,0.3);
  position: relative; overflow: hidden;
}
.btn-primary::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.25), transparent);
  opacity: 0; transition: opacity 0.3s ease;
}
.btn-primary:hover::before { opacity: 1; }
.btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 28px rgba(0,220,150,0.4); }
.btn-primary:active { transform: translateY(0) scale(0.98); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; filter: grayscale(0.5); }
.btn-primary .ico { transition: transform 0.3s ease; }
.btn-primary:hover .ico { transform: rotate(45deg); }

/* ── Search row ── */
.search-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.s-wrap { flex: 1; position: relative; }
.s-ico { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: var(--ink3); pointer-events: none; font-size: 0.85rem; }
.search-input {
  width: 100%; padding: 0.75rem 0.9rem 0.75rem 2.5rem;
  border-radius: var(--rLG); border: 1px solid rgba(255,255,255,0.12);
  background: rgba(8, 8, 18, 0.65); color: var(--ink);
  font-size: 0.84rem; font-family: 'Manrope', sans-serif; outline: none;
  transition: all 0.25s ease;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
}
.search-input::placeholder { color: var(--ink3); }
.search-input:focus {
  border-color: rgba(0,212,255,0.45); background: rgba(0,212,255,0.04);
  box-shadow: 0 0 0 3px rgba(0,212,255,0.1), inset 0 1px 2px rgba(0,0,0,0.2);
}
.fps { display: flex; gap: 0.4rem; flex-shrink: 0; }
.fp {
  padding: 0.55rem 1rem; border-radius: 50px; border: 1px solid var(--b1);
  background: rgba(255,255,255,0.04); color: var(--ink2);
  font-size: 0.74rem; font-family: 'Manrope', sans-serif; font-weight: 700;
  cursor: pointer; transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
  backdrop-filter: blur(10px);
}
.fp:hover { border-color: var(--b2); color: var(--ink); background: rgba(255,255,255,0.08); }
.fp.on { background: rgba(0,255,136,0.1); border-color: rgba(0,255,136,0.4); color: var(--green); }

/* ── Add form ── */
.form-card {
  border-radius: var(--rXL); margin-bottom: 1.25rem; padding: 1.75rem;
  background:
    linear-gradient(135deg, rgba(0,255,136,0.06), rgba(0,212,255,0.03)),
    rgba(6, 6, 16, 0.8);
  border: 1px solid rgba(0,255,136,0.2);
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  animation: scaleIn 0.35s cubic-bezier(0.16,1,0.3,1);
}
.form-eye { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--green); margin-bottom: 1.2rem; opacity: 0.75; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.full { grid-column: 1 / -1; }
.iw { display: flex; flex-direction: column; gap: 0.35rem; }
.il { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink3); }
.inp {
  padding: 0.72rem 0.95rem; border-radius: var(--rMD); border: 1px solid rgba(255,255,255,0.12);
  background: rgba(6, 6, 16, 0.7); color: var(--ink); font-size: 0.86rem;
  font-family: 'Manrope', sans-serif; outline: none; transition: all 0.22s ease; width: 100%;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
}
.inp::placeholder { color: var(--ink3); }
.inp:focus { border-color: rgba(0,212,255,0.5); background: rgba(0,212,255,0.04); box-shadow: 0 0 0 3px rgba(0,212,255,0.1), inset 0 1px 2px rgba(0,0,0,0.2); }
.inp option { background: #0e0e1a; color: var(--ink); }
.form-foot { margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.65rem; }
.btn-dismiss {
  padding: 0.58rem 1.15rem; border-radius: 50px; border: 1px solid var(--b2);
  background: transparent; color: var(--ink2); font-size: 0.78rem;
  font-family: 'Manrope', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.22s ease;
}
.btn-dismiss:hover { color: var(--ink); background: rgba(255,255,255,0.05); }
.btn-save {
  padding: 0.58rem 1.5rem; border-radius: 50px; border: none;
  background: linear-gradient(135deg, rgba(0,220,150,0.9), rgba(0,180,200,0.9));
  color: var(--void); font-size: 0.78rem; font-family: 'Manrope', sans-serif; font-weight: 800;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 4px 16px rgba(0,220,150,0.28);
}
.btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,220,150,0.38); }

/* ── Timeline ── */
.timeline { display: flex; flex-direction: column; }
.tl-item {
  display: flex; gap: 0.9rem; align-items: stretch; padding: 0.15rem 0;
  animation: txIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
.tl-spine { display: flex; flex-direction: column; align-items: center; width: 14px; flex-shrink: 0; padding-top: 16px; }
.tl-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  border: 1px solid currentColor; transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.tl-dot.inc { color: var(--green); background: rgba(0,255,136,0.2); }
.tl-dot.exp { color: var(--red);   background: rgba(255,107,107,0.2); }
.tl-line { flex: 1; width: 1px; background: var(--b1); margin-top: 4px; min-height: 18px; }
.tl-item:last-child .tl-line { display: none; }

.tx-card {
  flex: 1; margin: 0.28rem 0; padding: 0.95rem 1.2rem; border-radius: var(--rLG);
  background:
    linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025)),
    rgba(8, 8, 18, 0.68);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  transition: all 0.28s cubic-bezier(0.16,1,0.3,1); cursor: default;
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12);
}
.tx-card:hover {
  background:
    linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04)),
    rgba(8, 8, 22, 0.82);
  border-color: rgba(0,212,255,0.3);
  transform: translateX(6px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.45), inset 2px 0 0 rgba(0,212,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
}
.tx-card:hover .tl-dot { transform: scale(1.65); box-shadow: 0 0 8px currentColor; }
.tx-l { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.tx-cat { font-size: 0.87rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.tx-desc { font-size: 0.73rem; color: var(--ink2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
.tx-time { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: var(--ink3); font-style: italic; }
.tx-r { display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }
.tx-amt { font-family: 'DM Mono', monospace; font-size: 0.92rem; font-weight: 500; letter-spacing: -0.01em; }
.tx-amt.inc { color: var(--green); }
.tx-amt.exp { color: var(--red);   }
.tx-del {
  width: 27px; height: 27px; border-radius: 9px; border: 1px solid transparent;
  background: transparent; color: var(--ink3); font-size: 0.8rem; cursor: pointer;
  opacity: 0; transition: all 0.22s ease;
  display: flex; align-items: center; justify-content: center;
}
.tx-card:hover .tx-del { opacity: 1; }
.tx-del:hover { background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.3); color: var(--red); }

/* ── Empty state ── */
.empty {
  padding: 3rem 1.5rem; text-align: center; border-radius: var(--rXL);
  border: 1px dashed var(--b1); background: rgba(255,255,255,0.015);
}
.empty-ico { font-size: 2.4rem; margin-bottom: 0.75rem; opacity: 0.45; }
.empty-t { font-family: 'Unbounded', sans-serif; font-size: 0.76rem; font-weight: 700; color: var(--ink2); margin-bottom: 0.4rem; }
.empty-s { font-size: 0.7rem; color: var(--ink3); font-family: 'DM Mono', monospace; }

/* ── Sidebar ── */
.sidebar { display: flex; flex-direction: column; gap: 1.25rem; position: sticky; top: 80px; }

/* ── AI Insights card ── */
.card-ai {
  padding: 1.75rem;
  background:
    linear-gradient(145deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02)),
    rgba(8, 8, 20, 0.75);
  border: 1px solid rgba(0,212,255,0.2);
}
.ai-hd { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.ai-orb {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,255,136,0.2));
  display: flex; align-items: center; justify-content: center; font-size: 1rem;
  border: 1px solid rgba(0,212,255,0.3);
  animation: orbPulse 3s ease-in-out infinite;
}
.ai-meta { display: flex; flex-direction: column; gap: 0.15rem; }
.ai-title { font-family: 'Unbounded', sans-serif; font-size: 0.76rem; font-weight: 800; }
.ai-sub { font-size: 0.6rem; color: var(--ink3); font-family: 'DM Mono', monospace; letter-spacing: 0.05em; }
.ai-idle { text-align: center; padding: 1.5rem 0.5rem; }
.ai-idle-ico { font-size: 1.9rem; margin-bottom: 0.6rem; opacity: 0.35; }
.ai-idle-t { font-family: 'Unbounded', sans-serif; font-size: 0.74rem; font-weight: 700; color: var(--ink2); margin-bottom: 0.35rem; }
.ai-idle-s { font-size: 0.68rem; color: var(--ink3); font-family: 'DM Mono', monospace; line-height: 1.65; }
.ai-body { color: rgba(255,255,255,0.82); line-height: 1.78; font-size: 0.83rem; }
.ai-body h1,.ai-body h2,.ai-body h3 { font-family: 'Unbounded', sans-serif; color: var(--cyan); margin: 1.1rem 0 0.5rem; font-size: 0.78rem; font-weight: 700; }
.ai-body strong { color: var(--ink); font-weight: 700; }
.ai-body ul,.ai-body ol { padding-left: 1.25rem; margin: 0.5rem 0; }
.ai-body li { margin-bottom: 0.4rem; }
.ai-body p { margin-bottom: 0.65rem; }
.ai-body code { background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); padding: 0.1rem 0.4rem; border-radius: 5px; font-size: 0.75rem; color: var(--cyan); font-family: 'DM Mono', monospace; }

/* ── Quick Stats card ── */
.card-quick {
  padding: 1.6rem;
  background:
    linear-gradient(145deg, rgba(0,255,136,0.07), rgba(0,255,136,0.01)),
    rgba(6, 6, 16, 0.78);
  border: 1px solid rgba(0,255,136,0.18);
}
.quick-title { font-family: 'Unbounded', sans-serif; font-size: 0.69rem; font-weight: 800; color: var(--ink2); letter-spacing: 0.02em; margin-bottom: 1.15rem; text-transform: uppercase; }
.qs { display: flex; justify-content: space-between; align-items: center; padding: 0.62rem 0; border-bottom: 1px solid var(--b1); }
.qs:last-child { border-bottom: none; }
.qs-k { font-size: 0.72rem; color: var(--ink2); font-family: 'DM Mono', monospace; }
.qs-v { font-size: 0.8rem; font-weight: 700; font-family: 'DM Mono', monospace; }
.qs-v.g { color: var(--green); }
.qs-v.c { color: var(--cyan);  }

/* ── Skeleton shimmer ── */
.skel {
  height: 11px; border-radius: 6px; margin-bottom: 0.62rem;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite;
}

/* ── Delete modal ── */
.modal-bg { position: fixed; inset: 0; z-index: 999; background: rgba(3,3,6,0.75); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.18s ease; }
.modal { background: var(--s2); border: 1px solid rgba(255,107,107,0.22); border-radius: 22px; padding: 2rem; width: 320px; max-width: 90%; text-align: center; box-shadow: 0 50px 100px rgba(0,0,0,0.6); animation: modalIn 0.28s cubic-bezier(0.16,1,0.3,1); }
.modal-ico { font-size: 2rem; margin-bottom: 0.75rem; }
.modal-t { font-family: 'Unbounded', sans-serif; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.4rem; }
.modal-s { font-size: 0.8rem; color: var(--ink2); margin-bottom: 1.5rem; }
.modal-btns { display: flex; gap: 0.65rem; }
.mc { flex: 1; padding: 0.65rem; border-radius: 11px; border: 1px solid var(--b2); background: transparent; color: var(--ink2); font-size: 0.8rem; font-family: 'Manrope', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.22s ease; }
.mc:hover { color: var(--ink); background: rgba(255,255,255,0.06); }
.md { flex: 1; padding: 0.65rem; border-radius: 11px; border: 1px solid rgba(255,107,107,0.3); background: rgba(255,107,107,0.1); color: var(--red); font-size: 0.8rem; font-family: 'Manrope', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.22s ease; }
.md:hover { background: rgba(255,107,107,0.2); }

/* ── Responsive ── */
@media (max-width: 960px) {
  .bento { grid-template-columns: repeat(3, 1fr); }
  .main-panel { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .chart-row { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .bento { grid-template-columns: 1fr; }
  .navbar { padding: 0.9rem 1.25rem; }
  .content { padding: 1.5rem 1rem 3.5rem; }
  .chart-row { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .search-row { flex-direction: column; }
  .fps { justify-content: stretch; }
  .fp { flex: 1; text-align: center; }
  .panel-hd { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .nav-greeting { display: none; }
}
`

/* ─── Helpers ─────────────────────────────────────────────────── */
const safeParse = k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const savingsMeta = r => r >= 30 ? { cls: 'good', txt: `${r.toFixed(0)}% saved ✦` }
  : r >= 10 ? { cls: 'warn', txt: `${r.toFixed(0)}% saved` }
  : { cls: 'bad',  txt: `${r.toFixed(0)}% saved` }

/* ─── Starfield (all fixes from prev audit) ───────────────────── */
function useStarfield(ref) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let id, paused = false, rfp = false
    const m = { x: innerWidth / 2, y: innerHeight / 2 }
    let W = innerWidth, H = innerHeight
    const mkS = () => Array.from({ length: 210 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      bs: Math.random() * 1.6 + 0.3, hue: Math.random() > 0.76 ? Math.random() * 60 + 180 : 0,
      ts: Math.random() * 0.024 + 0.007, to: Math.random() * Math.PI * 2, ox: 0, oy: 0,
    }))
    canvas.width = W; canvas.height = H
    let stars = mkS(), ss = [], t = 0

    const onMM = e => { if (rfp) return; rfp = true; requestAnimationFrame(() => { m.x = e.clientX; m.y = e.clientY; rfp = false }) }
    const onR  = () => { W = innerWidth; H = innerHeight; canvas.width = W; canvas.height = H; stars = mkS() }
    const onV  = () => { paused = document.hidden; if (!paused) animate() }
    window.addEventListener('mousemove', onMM); window.addEventListener('resize', onR); document.addEventListener('visibilitychange', onV)

    function animate() {
      if (paused) return; t++
      ctx.clearRect(0, 0, W, H)
      const ng = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 290)
      ng.addColorStop(0, 'rgba(0,212,255,0.07)'); ng.addColorStop(0.5, 'rgba(120,80,255,0.025)'); ng.addColorStop(1, 'transparent')
      ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H)
      for (const s of stars) {
        const dx = s.x - m.x, dy = s.y - m.y, d = Math.sqrt(dx*dx + dy*dy)
        if (d < 170) { const f = (1 - d/170) * 9; s.ox += dx/d * f * 0.06; s.oy += dy/d * f * 0.06 }
        s.ox *= 0.93; s.oy *= 0.93
        const px = s.x + s.ox, py = s.y + s.oy
        const tw = Math.sin(t * s.ts + s.to) * 0.5 + 0.5
        const sz = s.bs * (0.58 + tw * 0.5), al = 0.22 + tw * 0.65
        if (s.bs > 1) {
          const gg = ctx.createRadialGradient(px, py, 0, px, py, sz * 5)
          gg.addColorStop(0, s.hue ? `hsla(${s.hue},70%,65%,${al*0.11})` : `rgba(255,255,255,${al*0.08})`); gg.addColorStop(1, 'transparent')
          ctx.fillStyle = gg; ctx.fillRect(px - sz*5, py - sz*5, sz*10, sz*10)
        }
        ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2)
        ctx.fillStyle = s.hue ? `hsla(${s.hue},70%,76%,${al})` : `rgba(255,255,255,${al})`; ctx.fill()
      }
      if (ss.length < 2 && Math.random() < 0.003) ss.push({ x: Math.random()*W, y: Math.random()*H*0.4, vx: (Math.random()*5+3)*(Math.random()>.5?1:-1), vy: Math.random()*2.5+1.5, life:1, len:Math.random()*50+30 })
      for (let i = ss.length-1; i >= 0; i--) {
        const s = ss[i]; s.x += s.vx; s.y += s.vy; s.life -= 0.013
        if (s.life <= 0 || s.x < -100 || s.x > W+100 || s.y > H+100) { ss.splice(i,1); continue }
        const g = ctx.createLinearGradient(s.x-s.vx*(s.len/8), s.y-s.vy*(s.len/8), s.x, s.y)
        g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,`rgba(200,230,255,${s.life*0.65})`)
        ctx.beginPath(); ctx.moveTo(s.x-s.vx*(s.len/8),s.y-s.vy*(s.len/8)); ctx.lineTo(s.x,s.y)
        ctx.strokeStyle = g; ctx.lineWidth = 1.1; ctx.stroke()
        ctx.beginPath(); ctx.arc(s.x,s.y,1.4,0,Math.PI*2); ctx.fillStyle=`rgba(200,230,255,${s.life})`; ctx.fill()
      }
      id = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(id); window.removeEventListener('mousemove',onMM); window.removeEventListener('resize',onR); document.removeEventListener('visibilitychange',onV) }
  }, [ref])
}

/* ─── Sub-components ──────────────────────────────────────────── */
const DeleteModal = memo(function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-ico">🗑</div>
        <div className="modal-t">Delete transaction?</div>
        <div className="modal-s">This action is permanent and cannot be undone.</div>
        <div className="modal-btns">
          <button className="mc" onClick={onCancel}>Cancel</button>
          <button className="md" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
})

const InsightsLoading = memo(function InsightsLoading() {
  return (
    <div>{[88,70,94,58,78,64].map((w,i) => (
      <div key={i} className="skel" style={{ width:`${w}%`, animationDelay:`${i*0.08}s` }} />
    ))}</div>
  )
})

/* ─── Dashboard ───────────────────────────────────────────────── */
export default function Dashboard() {
  const toast    = useToast()
  const navigate = useNavigate()
  const user     = useMemo(() => safeParse('user'), [])

  const [summary, setSummary]   = useState({ total_income:0, total_expense:0, balance:0 })
  const [transactions, setTxs]  = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ amount:'', type:'income', category:'', description:'' })
  const [confettiKey, setBurst] = useState(0)
  const [query, setQuery]       = useState('')
  const deferredQuery           = useDeferredValue(query)
  const [filter, setFilter]     = useState('all')
  const [pendingDel, setPDel]   = useState(null)
  const [insights, setInsights] = useState('')
  const [aiLoad, setAiLoad]     = useState(false)
  const [visibleCount, setVis]  = useState(15)

  const canvasRef = useRef(null)
  useStarfield(canvasRef)

  const fetchData = useCallback(async () => {
    try {
      const [sr, tr] = await Promise.all([api.get('/transactions/summary'), api.get('/transactions/')])
      setSummary(sr.data); setTxs(tr.data)
    } catch(e) { if (e.response?.status === 401) navigate('/login') }
    finally { setLoading(false) }
  }, [navigate])

  useEffect(() => { fetchData() }, [fetchData])

  const fetchInsights = useCallback(async () => {
    setAiLoad(true)
    try { const r = await api.get('/ai/insights'); setInsights(r.data.insights); toast('Insights ready!') }
    catch { setInsights('Could not load insights right now.'); toast('Failed to load insights', 'error') }
    finally { setAiLoad(false) }
  }, [toast])

  const handleAdd = useCallback(async e => {
    e.preventDefault()
    try {
      await api.post('/transactions/', { ...form, amount: parseFloat(form.amount) })
      setForm({ amount:'', type:'income', category:'', description:'' })
      setShowForm(false); setBurst(p => p+1)
      toast('Transaction added! 🎉'); fetchData()
    } catch { toast('Failed to add transaction', 'error') }
  }, [form, fetchData, toast])

  const confirmDel = useCallback(async () => {
    try { await api.delete(`/transactions/${pendingDel}`); toast('Transaction deleted'); fetchData() }
    catch { toast('Failed to delete', 'error') }
    finally { setPDel(null) }
  }, [pendingDel, fetchData, toast])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login')
  }, [navigate])

  const filtered = useMemo(() => transactions.filter(t => {
    const q = deferredQuery.toLowerCase()
    return (!q || t.category.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      && (filter === 'all' || t.type === filter)
  }), [transactions, deferredQuery, filter])

  // Reset pagination when search/filter changes
  useEffect(() => { setVis(15) }, [deferredQuery, filter])

  const topCat = useMemo(() => {
    const m = {}; transactions.filter(t => t.type==='expense').forEach(t => { m[t.category]=(m[t.category]||0)+t.amount })
    const top = Object.entries(m).sort((a,b)=>b[1]-a[1])[0]; return top ? top[0] : '—'
  }, [transactions])

  const txCount = transactions.length
  const avgTx   = txCount > 0 ? transactions.reduce((s,t)=>s+t.amount,0)/txCount : 0
  const rate    = summary.total_income > 0 ? (summary.balance/summary.total_income)*100 : 0
  const sav     = savingsMeta(rate)
  const incPct  = summary.total_income > 0 ? Math.min(summary.total_expense/summary.total_income*100,100) : 0
  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?'

  const chrome = (
    <>
      <style>{STYLES}</style>
      <div className="grain" />
      <div className="mesh-bg"><div className="orb oa"/><div className="orb ob"/><div className="orb oc"/><div className="orb od"/></div>
      <canvas ref={canvasRef} className="star-canvas" />
      <ConfettiBurst trigger={confettiKey} />
      {pendingDel !== null && <DeleteModal onConfirm={confirmDel} onCancel={() => setPDel(null)} />}
    </>
  )

  if (loading) return <div style={{minHeight:'100vh',background:'var(--void)'}}>{chrome}<Skeleton /></div>

  return (
    <div style={{ minHeight:'100vh', position:'relative' }}>
      {chrome}

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo-mark">💰</div>
          <span className="nav-wordmark">Finance<em>AI</em></span>
        </div>
        <div className="nav-right">
          <span className="nav-greeting">Hey, <strong>{user?.name}</strong> 👋</span>
          <div className="nav-avatar" title={user?.name}>{initials}</div>
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div className="content">

        {/* ── Page heading ── */}
        <div className="page-hd">
          <div className="page-eye">Financial Overview · {new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</div>
          <h1 className="page-title">Your <span>Finance</span> Dashboard</h1>
        </div>

        {/* ── Bento stat cards ── */}
        <div className="bento">
          <div className="glass card-income" style={{animationDelay:'0s'}}>
            <div className="card-eye"><span className="card-eye-dot g"/>Total Income</div>
            <div className="card-amount green"><AnimatedCounter value={summary.total_income} prefix="₹" /></div>
            <div className="card-bar"><div className="card-bar-fill green" style={{width:'100%'}}/></div>
          </div>
          <div className="glass card-expense" style={{animationDelay:'0.08s'}}>
            <div className="card-eye"><span className="card-eye-dot r"/>Total Expenses</div>
            <div className="card-amount red"><AnimatedCounter value={summary.total_expense} prefix="₹" /></div>
            <div className="card-bar"><div className="card-bar-fill red" style={{width:`${incPct}%`}}/></div>
          </div>
          <div className="glass card-balance" style={{animationDelay:'0.16s'}}>
            <div className="card-eye"><span className="card-eye-dot c"/>Net Balance</div>
            <div className="card-amount cyan"><AnimatedCounter value={summary.balance} prefix="₹" /></div>
            {summary.total_income > 0 && <div className={`sav-pill ${sav.cls}`}>{sav.txt}</div>}
            <div className="card-bar"><div className="card-bar-fill cyan" style={{width: summary.total_income > 0 ? `${Math.max(rate,0)}%` : '0%'}}/></div>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="chart-row">
          <div className="glass card-chart">
            <div className="chart-head">
              <div><div className="chart-title">Expense Breakdown</div><div className="chart-sub">By category · this period</div></div>
              <span className="chart-badge green">Pie</span>
            </div>
            <ExpensePieChart transactions={transactions} />
          </div>
          <div className="glass card-chart">
            <div className="chart-head">
              <div><div className="chart-title">Income vs Expenses</div><div className="chart-sub">Comparative view</div></div>
              <span className="chart-badge cyan">Bar</span>
            </div>
            <IncomeExpenseBar summary={summary} />
          </div>
        </div>

        {/* ── Main panel ── */}
        <div className="main-panel">

          {/* Left: transactions */}
          <div>
            <div className="panel-hd">
              <div className="panel-hl">
                <span className="panel-title">Transactions</span>
                <span className="panel-count">({filtered.length}/{txCount})</span>
              </div>
              <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
                <span className="ico">{showForm ? '✕' : '+'}</span>
                {showForm ? 'Cancel' : 'New Entry'}
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="form-card">
                <div className="form-eye">New Transaction</div>
                <form onSubmit={handleAdd}>
                  <div className="form-grid">
                    <div className="iw">
                      <label className="il">Type</label>
                      <select className="inp" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                        <option value="income">💹 Income</option>
                        <option value="expense">💸 Expense</option>
                      </select>
                    </div>
                    <div className="iw">
                      <label className="il">Amount (₹)</label>
                      <input className="inp" type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required />
                    </div>
                    <div className="iw full">
                      <label className="il">Category</label>
                      <input className="inp" type="text" placeholder="e.g. Salary, Food, Rent…" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} required />
                    </div>
                    <div className="iw full">
                      <label className="il">Description (optional)</label>
                      <input className="inp" type="text" placeholder="Brief note…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
                    </div>
                  </div>
                  <div className="form-foot">
                    <button type="button" className="btn-dismiss" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn-save">Save Entry 🎉</button>
                  </div>
                </form>
              </div>
            )}

            {/* Search + Filter */}
            <div className="search-row">
              <div className="s-wrap">
                <span className="s-ico">🔍</span>
                <input className="search-input" type="text" placeholder="Search transactions…" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              <div className="fps">
                {['all','income','expense'].map(t => (
                  <button key={t} className={`fp ${filter===t?'on':''}`} onClick={() => setFilter(t)}>
                    {t==='all'?'All':t==='income'?'↑ Income':'↓ Expense'}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-ico">{txCount===0?'🚀':'🔍'}</div>
                <div className="empty-t">{txCount===0?'No transactions yet':'Nothing found'}</div>
                <div className="empty-s">{txCount===0?'Add your first entry above to get started':'Try a different search or filter'}</div>
              </div>
            ) : (
              <div className="timeline">
                {filtered.slice(0, visibleCount).map((t,i) => (
                  <div key={t.id} className="tl-item" style={{animationDelay:`${(i%15)*0.035}s`}}>
                    <div className="tl-spine">
                      <div className={`tl-dot ${t.type==='income'?'inc':'exp'}`} />
                      <div className="tl-line" />
                    </div>
                    <div className="tx-card">
                      <div className="tx-l">
                        <span className="tx-cat">{t.category}</span>
                        <div className="tx-row">
                          {t.description && <span className="tx-desc">{t.description}</span>}
                          <span className="tx-time">{formatDistanceToNow(new Date(t.date),{addSuffix:true})}</span>
                        </div>
                      </div>
                      <div className="tx-r">
                        <span className={`tx-amt ${t.type==='income'?'inc':'exp'}`}>
                          {t.type==='income'?'+':'−'}₹{t.amount.toFixed(2)}
                        </span>
                        <button className="tx-del" onClick={() => setPDel(t.id)} title="Delete">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {visibleCount < filtered.length && (
                  <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <button className="btn-dismiss" onClick={() => setVis(v => v + 15)}>
                      Load More ({filtered.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: sticky sidebar */}
          <div className="sidebar">

            {/* AI Insights */}
            <div className="glass card-ai">
              <div className="ai-hd">
                <div className="ai-orb">🤖</div>
                <div className="ai-meta">
                  <div className="ai-title">AI Insights</div>
                  <div className="ai-sub">Powered by Gemini</div>
                </div>
              </div>
              {!insights && !aiLoad && (
                <div className="ai-idle">
                  <div className="ai-idle-ico">✦</div>
                  <div className="ai-idle-t">Spending Analysis</div>
                  <div className="ai-idle-s">Let AI surface actionable insights from your transaction history</div>
                </div>
              )}
              {aiLoad && <InsightsLoading />}
              {!aiLoad && insights && <div className="ai-body"><ReactMarkdown>{insights}</ReactMarkdown></div>}
              <div style={{marginTop:'1.25rem'}}>
                <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={fetchInsights} disabled={aiLoad}>
                  <span className="ico">✦</span>
                  {aiLoad ? 'Analyzing…' : insights ? 'Refresh' : 'Analyze Spending'}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass card-quick">
              <div className="quick-title">Quick Stats</div>
              <div className="qs"><span className="qs-k">Transactions</span><span className="qs-v c">{txCount}</span></div>
              <div className="qs"><span className="qs-k">Top spend</span><span className="qs-v c">{topCat}</span></div>
              <div className="qs"><span className="qs-k">Avg. entry</span><span className="qs-v c">₹{avgTx.toFixed(0)}</span></div>
              <div className="qs"><span className="qs-k">Savings rate</span><span className={`qs-v ${rate>=20?'g':'c'}`}>{rate.toFixed(1)}%</span></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
