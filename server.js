// ================================================================
// ROZGARCONNECT — Complete Backend Server
// NO DATABASE SETUP NEEDED — runs out of the box!
// Just deploy and go live.
// ================================================================
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { v4: uid } = require('uuid');
const path     = require('path');

const app    = express();

const HTML = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>RozgarConnect – नौकरी खोजें</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --saffron: #FF6B00;
  --saffron-light: #FF8C33;
  --saffron-pale: #FFF3E8;
  --green: #00A550;
  --green-light: #00C060;
  --green-pale: #E6F7EE;
  --blue: #1A73E8;
  --navy: #0D1B3E;
  --navy-light: #1A2D5A;
  --gold: #F5A623;
  --text: #1A1A2E;
  --text-mid: #4A4A6A;
  --text-light: #8888AA;
  --bg: #F5F5FA;
  --white: #FFFFFF;
  --card: #FFFFFF;
  --border: #E0E0F0;
  --shadow: 0 2px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
  --radius: 16px;
  --radius-sm: 10px;
  --font-main: 'Baloo 2', 'Noto Sans Devanagari', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

body {
  font-family: var(--font-main);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
}

/* SPLASH SCREEN */
#splash {
  position: fixed; inset: 0; z-index: 1000;
  background: linear-gradient(160deg, #0D1B3E 0%, #1A3A6E 60%, #0D1B3E 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; transition: opacity 0.5s ease;
}
#splash .logo-ring {
  width: 90px; height: 90px; border-radius: 50%;
  background: linear-gradient(135deg, var(--saffron), var(--gold));
  display: flex; align-items: center; justify-content: center;
  font-size: 40px; box-shadow: 0 0 40px rgba(255,107,0,0.5);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
#splash h1 { color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
#splash p { color: rgba(255,255,255,0.6); font-size: 14px; }
#splash .tagline { color: var(--saffron-light); font-size: 16px; font-weight: 600; }
.loader-bar {
  width: 200px; height: 4px; background: rgba(255,255,255,0.2);
  border-radius: 2px; margin-top: 24px; overflow: hidden;
}
.loader-fill { height: 100%; background: var(--saffron); border-radius: 2px; animation: load 2s ease forwards; }
@keyframes load { from{width:0} to{width:100%} }

/* ONBOARDING */
#onboarding {
  display: none; position: fixed; inset: 0; z-index: 900;
  background: white; flex-direction: column;
}
.onboard-slide { display: none; flex-direction: column; height: 100%; }
.onboard-slide.active { display: flex; }
.onboard-hero {
  background: linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%);
  height: 45vh; display: flex; align-items: center; justify-content: center;
  font-size: 80px; position: relative; overflow: hidden;
}
.onboard-hero::after {
  content: ''; position: absolute; bottom: -20px; left: 0; right: 0;
  height: 40px; background: white; border-radius: 30px 30px 0 0;
}
.onboard-body { padding: 32px 24px 24px; flex: 1; display: flex; flex-direction: column; }
.onboard-body h2 { font-size: 26px; font-weight: 800; color: var(--text); margin-bottom: 12px; }
.onboard-body p { color: var(--text-mid); font-size: 15px; line-height: 1.6; flex: 1; }
.onboard-dots { display: flex; gap: 8px; justify-content: center; margin: 16px 0; }
.onboard-dot { width: 8px; height: 8px; border-radius: 4px; background: var(--border); transition: all 0.3s; }
.onboard-dot.active { width: 24px; background: var(--saffron); }
.btn-primary {
  background: linear-gradient(135deg, var(--saffron), var(--saffron-light));
  color: white; border: none; border-radius: 14px; padding: 16px 24px;
  font-family: var(--font-main); font-size: 17px; font-weight: 700;
  width: 100%; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(255,107,0,0.35);
}
.btn-primary:active { transform: scale(0.97); }
.btn-secondary {
  background: transparent; color: var(--text-mid); border: 2px solid var(--border);
  border-radius: 14px; padding: 14px 24px; font-family: var(--font-main);
  font-size: 16px; font-weight: 600; width: 100%; cursor: pointer; margin-top: 10px;
}

/* ROLE SELECT */
#role-select {
  display: none; position: fixed; inset: 0; z-index: 880;
  background: white; flex-direction: column; padding: 48px 24px 32px;
  gap: 20px; align-items: center;
}
#role-select h2 { font-size: 24px; font-weight: 800; text-align: center; }
#role-select p { color: var(--text-mid); font-size: 15px; text-align: center; }
.role-card {
  width: 100%; padding: 24px; border-radius: 20px; border: 3px solid var(--border);
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 16px;
  background: white;
}
.role-card:active, .role-card.selected { border-color: var(--saffron); background: var(--saffron-pale); }
.role-icon { font-size: 44px; width: 64px; text-align: center; }
.role-info h3 { font-size: 20px; font-weight: 700; }
.role-info p { font-size: 13px; color: var(--text-mid); margin-top: 4px; }

/* MAIN APP */
#app { display: none; flex-direction: column; min-height: 100vh; }

/* TOP BAR */
.topbar {
  background: var(--navy);
  padding: 16px 20px 12px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
}
.topbar-logo { display: flex; align-items: center; gap: 8px; color: white; }
.topbar-logo .logo-dot { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--saffron), var(--gold)); display: flex; align-items: center; justify-content: center; font-size: 16px; }
.topbar-logo span { font-size: 18px; font-weight: 800; }
.topbar-actions { display: flex; gap: 12px; align-items: center; }
.icon-btn { background: rgba(255,255,255,0.12); border: none; border-radius: 10px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 18px; position: relative; }
.notif-badge { position: absolute; top: -4px; right: -4px; background: var(--saffron); color: white; font-size: 10px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* CONTENT AREA */
.content { flex: 1; padding-bottom: 80px; }

/* BOTTOM NAV */
.bottom-nav {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 430px; background: white;
  border-top: 1px solid var(--border); display: flex;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  z-index: 100;
}
.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 3px; cursor: pointer; padding: 6px 4px; color: var(--text-light);
  font-size: 11px; font-weight: 600; transition: color 0.2s; border: none; background: none; font-family: var(--font-main);
}
.nav-item .nav-icon { font-size: 22px; line-height: 1; }
.nav-item.active { color: var(--saffron); }
.nav-item.active .nav-icon { transform: scale(1.1); }

/* SCREENS */
.screen { display: none; animation: fadeIn 0.25s ease; }
.screen.active { display: block; }
@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

/* SECTION HEADER */
.section-pad { padding: 20px 20px 0; }
.section-title { font-size: 22px; font-weight: 800; color: var(--text); }
.section-sub { font-size: 13px; color: var(--text-light); margin-top: 2px; }

/* CARDS */
.card {
  background: var(--card); border-radius: var(--radius);
  box-shadow: var(--shadow); margin: 16px 20px 0;
  overflow: hidden;
}
.card-pad { padding: 16px; }

/* HOME SCREEN - WORKER */
.greeting-banner {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
  padding: 20px 20px 28px; position: relative; overflow: hidden;
}
.greeting-banner::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 24px; background: var(--bg); border-radius: 24px 24px 0 0;
}
.greeting-banner .greet-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.greeting-banner h2 { color: white; font-size: 22px; font-weight: 700; }
.greeting-banner p { color: rgba(255,255,255,0.65); font-size: 13px; margin-top: 4px; }
.availability-toggle {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 14px;
  margin-top: 12px; cursor: pointer;
}
.toggle-pill {
  width: 44px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.3);
  position: relative; transition: background 0.3s;
}
.toggle-pill.on { background: var(--green); }
.toggle-pill::after {
  content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%;
  background: white; top: 3px; left: 3px; transition: transform 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.toggle-pill.on::after { transform: translateX(20px); }
.toggle-label { color: white; font-size: 14px; font-weight: 600; }

/* STATS ROW */
.stats-row { display: flex; gap: 12px; padding: 16px 20px 0; }
.stat-card {
  flex: 1; background: white; border-radius: 14px; padding: 14px 12px;
  box-shadow: var(--shadow); text-align: center;
}
.stat-card .stat-num { font-size: 26px; font-weight: 800; color: var(--saffron); }
.stat-card .stat-lbl { font-size: 11px; color: var(--text-light); margin-top: 2px; font-weight: 600; }

/* JOB MATCH CARD */
.job-match-card {
  background: white; border-radius: var(--radius); margin: 12px 20px 0;
  box-shadow: var(--shadow); overflow: hidden; cursor: pointer;
  transition: transform 0.15s;
}
.job-match-card:active { transform: scale(0.98); }
.job-match-top {
  display: flex; align-items: flex-start; gap: 14px; padding: 16px 16px 12px;
}
.employer-avatar {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
  font-weight: 800; color: white;
}
.job-info { flex: 1; min-width: 0; }
.job-title { font-size: 16px; font-weight: 700; margin-bottom: 3px; }
.employer-name { font-size: 12px; color: var(--text-light); }
.job-salary { font-size: 15px; font-weight: 700; color: var(--green); }
.job-tags { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
.tag {
  background: var(--saffron-pale); color: var(--saffron); font-size: 11px;
  font-weight: 600; padding: 4px 10px; border-radius: 20px;
}
.tag.green { background: var(--green-pale); color: var(--green); }
.tag.blue { background: #EAF1FD; color: var(--blue); }
.job-footer {
  border-top: 1px solid var(--border); padding: 10px 16px;
  display: flex; align-items: center; justify-content: space-between;
}
.job-footer-left { font-size: 12px; color: var(--text-light); }
.btn-sm {
  background: var(--saffron); color: white; border: none; border-radius: 10px;
  padding: 8px 16px; font-family: var(--font-main); font-size: 13px; font-weight: 700; cursor: pointer;
}
.btn-sm.outline { background: transparent; color: var(--saffron); border: 2px solid var(--saffron); }
.btn-sm.green { background: var(--green); }

/* WORKER CARD (for employer view) */
.worker-card {
  background: white; border-radius: var(--radius); margin: 12px 20px 0;
  box-shadow: var(--shadow); overflow: hidden; cursor: pointer;
}
.worker-card-top { display: flex; gap: 14px; padding: 16px; align-items: flex-start; }
.worker-avatar {
  width: 58px; height: 58px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
  color: white; font-weight: 800; position: relative;
}
.verified-badge {
  position: absolute; bottom: 0; right: 0; width: 18px; height: 18px;
  background: var(--blue); border-radius: 50%; border: 2px solid white;
  display: flex; align-items: center; justify-content: center; font-size: 9px; color: white;
}
.worker-main { flex: 1; }
.worker-name { font-size: 17px; font-weight: 700; }
.worker-skill { font-size: 13px; color: var(--saffron); font-weight: 600; margin-top: 2px; }
.stars { color: var(--gold); font-size: 13px; margin-top: 4px; }
.worker-salary { font-size: 15px; font-weight: 700; color: var(--green); margin-top: 4px; }
.worker-actions { display: flex; gap: 10px; padding: 0 16px 16px; }
.btn-like {
  flex: 1; background: linear-gradient(135deg, var(--saffron), var(--saffron-light));
  color: white; border: none; border-radius: 12px; padding: 12px;
  font-family: var(--font-main); font-size: 14px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-skip {
  width: 48px; background: var(--bg); border: 2px solid var(--border);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-size: 20px; cursor: pointer;
}

/* MATCHES SCREEN */
.match-item {
  background: white; border-radius: 14px; margin: 10px 20px 0;
  box-shadow: var(--shadow); padding: 14px 16px;
  display: flex; align-items: center; gap: 14px; cursor: pointer;
  transition: transform 0.15s;
}
.match-item:active { transform: scale(0.98); }
.match-avatar {
  width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
  color: white; font-weight: 700;
}
.match-info { flex: 1; }
.match-name { font-size: 15px; font-weight: 700; }
.match-meta { font-size: 12px; color: var(--text-light); margin-top: 2px; }
.match-time { font-size: 11px; color: var(--text-light); }
.match-status {
  font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
}
.match-status.pending { background: #FFF3E8; color: var(--saffron); }
.match-status.matched { background: var(--green-pale); color: var(--green); }
.match-status.new { background: #EAF1FD; color: var(--blue); }

.unlock-banner {
  background: linear-gradient(135deg, #FF6B00, #FF8C33);
  border-radius: var(--radius); margin: 16px 20px 0; padding: 16px;
  color: white; display: flex; align-items: center; gap: 14px;
}
.unlock-banner .lock-icon { font-size: 32px; }
.unlock-banner h3 { font-size: 15px; font-weight: 700; }
.unlock-banner p { font-size: 12px; opacity: 0.85; margin-top: 3px; }

/* NOTIFICATIONS */
.notif-item {
  background: white; margin: 8px 20px 0; border-radius: 14px;
  padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start;
  box-shadow: var(--shadow); cursor: pointer;
}
.notif-item.unread { border-left: 3px solid var(--saffron); }
.notif-dot { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.notif-content { flex: 1; }
.notif-text { font-size: 14px; color: var(--text); line-height: 1.4; }
.notif-text b { color: var(--saffron); }
.notif-time { font-size: 11px; color: var(--text-light); margin-top: 4px; }

/* PROFILE SCREEN */
.profile-hero {
  background: linear-gradient(160deg, var(--navy), var(--navy-light));
  padding: 28px 20px 40px; position: relative;
}
.profile-hero::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 24px; background: var(--bg); border-radius: 24px 24px 0 0;
}
.profile-avatar-wrap { display: flex; align-items: flex-end; gap: 16px; }
.profile-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  border: 3px solid var(--saffron); display: flex; align-items: center;
  justify-content: center; font-size: 34px; color: white;
  background: linear-gradient(135deg, #2A4080, #1A3060);
}
.profile-info { flex: 1; }
.profile-name { color: white; font-size: 22px; font-weight: 800; }
.profile-skill { color: var(--saffron-light); font-size: 14px; font-weight: 600; margin-top: 2px; }
.profile-rating { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
.rating-num { color: white; font-size: 15px; font-weight: 700; }

.profile-stats { display: flex; background: white; border-radius: var(--radius); margin: 12px 20px 0; box-shadow: var(--shadow); }
.profile-stat { flex: 1; padding: 14px 8px; text-align: center; }
.profile-stat:not(:last-child) { border-right: 1px solid var(--border); }
.profile-stat .pstat-num { font-size: 20px; font-weight: 800; color: var(--saffron); }
.profile-stat .pstat-lbl { font-size: 11px; color: var(--text-light); margin-top: 2px; }

.info-section { margin: 16px 20px 0; }
.info-section h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.info-row {
  background: white; border-radius: 12px; padding: 14px 16px;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.info-row-left { display: flex; align-items: center; gap: 12px; }
.info-row-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.info-label { font-size: 13px; color: var(--text-light); }
.info-value { font-size: 15px; font-weight: 600; }
.info-row-right { font-size: 18px; color: var(--text-light); }

/* EMPLOYER POST JOB */
.form-section { padding: 16px 20px 0; }
.form-group { margin-bottom: 16px; }
.form-label { font-size: 14px; font-weight: 600; color: var(--text-mid); margin-bottom: 8px; display: block; }
.form-input {
  width: 100%; padding: 14px 16px; border: 2px solid var(--border);
  border-radius: 12px; font-family: var(--font-main); font-size: 15px; color: var(--text);
  background: white; transition: border-color 0.2s; outline: none;
}
.form-input:focus { border-color: var(--saffron); }
.category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.cat-btn {
  background: white; border: 2px solid var(--border); border-radius: 12px;
  padding: 12px 6px; text-align: center; cursor: pointer; transition: all 0.2s;
  font-family: var(--font-main);
}
.cat-btn.selected { border-color: var(--saffron); background: var(--saffron-pale); }
.cat-btn .cat-icon { font-size: 24px; margin-bottom: 4px; }
.cat-btn .cat-name { font-size: 11px; font-weight: 600; color: var(--text-mid); }

/* FILTER PANEL */
.filter-bar {
  display: flex; gap: 8px; padding: 12px 20px;
  overflow-x: auto; scrollbar-width: none;
}
.filter-bar::-webkit-scrollbar { display: none; }
.filter-chip {
  background: white; border: 2px solid var(--border); border-radius: 20px;
  padding: 7px 14px; font-family: var(--font-main); font-size: 13px; font-weight: 600;
  color: var(--text-mid); cursor: pointer; white-space: nowrap; transition: all 0.2s;
  display: flex; align-items: center; gap: 5px;
}
.filter-chip.active { background: var(--saffron-pale); border-color: var(--saffron); color: var(--saffron); }

/* MATCH ANIMATION */
.match-popup {
  position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.8);
  display: none; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 32px;
}
.match-popup.show { display: flex; animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes popIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
.match-popup-inner { background: white; border-radius: 28px; padding: 32px; text-align: center; width: 100%; }
.match-emojis { font-size: 48px; margin-bottom: 16px; }
.match-popup h2 { font-size: 28px; font-weight: 800; color: var(--text); }
.match-popup p { color: var(--text-mid); margin-top: 8px; font-size: 15px; }
.confetti { position: absolute; top: 0; left: 0; right: 0; height: 200px; overflow: hidden; }

/* BOTTOM SHEET */
.bottom-sheet-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 400;
  display: none; align-items: flex-end;
}
.bottom-sheet-overlay.show { display: flex; }
.bottom-sheet {
  background: white; border-radius: 24px 24px 0 0; width: 100%; max-width: 430px;
  margin: 0 auto; padding: 12px 24px 32px; animation: slideUp 0.3s ease;
}
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
.sheet-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }
.sheet-title { font-size: 20px; font-weight: 800; margin-bottom: 16px; }

/* PAY MODAL */
.pay-option {
  background: var(--bg); border: 2px solid var(--border); border-radius: 14px;
  padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: space-between;
}
.pay-option.selected { border-color: var(--saffron); background: var(--saffron-pale); }
.pay-option h4 { font-size: 16px; font-weight: 700; }
.pay-option p { font-size: 13px; color: var(--text-mid); margin-top: 2px; }
.pay-price { font-size: 20px; font-weight: 800; color: var(--saffron); }

/* EMPTY STATE */
.empty-state { text-align: center; padding: 48px 32px; }
.empty-state .empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.empty-state p { color: var(--text-light); font-size: 14px; line-height: 1.6; }

/* EMPLOYER DASHBOARD */
.employer-hero {
  background: linear-gradient(135deg, #0D1B3E 0%, #1A3A6E 100%);
  padding: 20px 20px 32px; position: relative; overflow: hidden;
}
.employer-hero::before {
  content: ''; position: absolute; top: -30px; right: -30px;
  width: 120px; height: 120px; border-radius: 50%;
  background: rgba(255,107,0,0.15); border: 2px solid rgba(255,107,0,0.3);
}
.employer-hero::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 24px; background: var(--bg); border-radius: 24px 24px 0 0;
}
.employer-hero h2 { color: white; font-size: 20px; font-weight: 800; }
.employer-hero p { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 4px; }
.emp-stat-row { display: flex; gap: 10px; margin-top: 16px; position: relative; z-index: 1; }
.emp-stat { background: rgba(255,255,255,0.12); border-radius: 12px; padding: 12px; flex: 1; text-align: center; }
.emp-stat .n { color: white; font-size: 22px; font-weight: 800; }
.emp-stat .l { color: rgba(255,255,255,0.6); font-size: 11px; }

.top-workers-label {
  padding: 20px 20px 0; font-size: 18px; font-weight: 700;
  display: flex; align-items: center; justify-content: space-between;
}
.view-all { font-size: 13px; color: var(--saffron); font-weight: 600; cursor: pointer; }

/* SCROLL FADE */
.scroll-hint { text-align: center; padding: 16px; color: var(--text-light); font-size: 12px; }

/* CHIP GROUP */
.chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  background: var(--bg); border: 2px solid var(--border); border-radius: 20px;
  padding: 8px 16px; font-family: var(--font-main); font-size: 13px; font-weight: 600;
  color: var(--text-mid); cursor: pointer; transition: all 0.2s;
}
.chip.active { background: var(--saffron-pale); border-color: var(--saffron); color: var(--saffron); }

/* RATING STARS INPUT */
.star-input { display: flex; gap: 8px; }
.star-btn { font-size: 28px; cursor: pointer; opacity: 0.3; transition: opacity 0.2s, transform 0.2s; }
.star-btn.on { opacity: 1; }
.star-btn:active { transform: scale(1.2); }

/* BOOST CARD */
.boost-card {
  background: linear-gradient(135deg, var(--navy), #2A4080);
  border-radius: var(--radius); margin: 12px 20px 0; padding: 18px;
  display: flex; align-items: center; gap: 14px; cursor: pointer;
}
.boost-icon { font-size: 36px; }
.boost-info { flex: 1; }
.boost-info h3 { color: white; font-size: 16px; font-weight: 700; }
.boost-info p { color: rgba(255,255,255,0.65); font-size: 12px; margin-top: 3px; }
.boost-price { color: var(--gold); font-size: 16px; font-weight: 800; }

/* CONTACT CARD */
.contact-card {
  background: var(--green-pale); border: 2px solid var(--green); border-radius: 16px;
  padding: 16px; margin: 12px 20px 0; display: flex; align-items: center; gap: 14px;
}
.contact-card .cc-info h4 { font-size: 15px; font-weight: 700; color: var(--green); }
.contact-card .cc-info p { font-size: 13px; color: var(--text-mid); margin-top: 2px; }
.contact-card .cc-btn { background: var(--green); color: white; border: none; border-radius: 10px; padding: 10px 16px; font-family: var(--font-main); font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }

/* RESPONSIVE TWEAKS */
@media (max-width: 360px) {
  .category-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
</head>
<body>

<!-- SPLASH SCREEN -->
<div id="splash">
  <div class="logo-ring">🔧</div>
  <h1>RozgarConnect</h1>
  <div class="tagline">काम ढूंढो, आगे बढ़ो</div>
  <p>Tier 2 & Tier 3 India का अपना जॉब प्लेटफॉर्म</p>
  <div class="loader-bar"><div class="loader-fill"></div></div>
</div>

<!-- ONBOARDING -->
<div id="onboarding" style="display:flex">
  <!-- Slide 1 -->
  <div class="onboard-slide active" id="slide-1">
    <div class="onboard-hero">🤝</div>
    <div class="onboard-body">
      <h2>सही काम, सही मजदूरी</h2>
      <p>RozgarConnect पर लाखों नौकरियां आपके शहर में। बिना दलाल, बिना झंझट – सीधा नियोक्ता से मिलें।</p>
      <div class="onboard-dots">
        <div class="onboard-dot active"></div>
        <div class="onboard-dot"></div>
        <div class="onboard-dot"></div>
      </div>
      <button class="btn-primary" onclick="nextSlide(2)">आगे बढ़ें →</button>
    </div>
  </div>
  <!-- Slide 2 -->
  <div class="onboard-slide" id="slide-2">
    <div class="onboard-hero">⭐</div>
    <div class="onboard-body">
      <h2>भरोसेमंद प्लेटफॉर्म</h2>
      <p>सभी नियोक्ता और कामगार वेरिफाइड हैं। रेटिंग और रिव्यू से पता चलता है कौन भरोसेमंद है।</p>
      <div class="onboard-dots">
        <div class="onboard-dot"></div>
        <div class="onboard-dot active"></div>
        <div class="onboard-dot"></div>
      </div>
      <button class="btn-primary" onclick="nextSlide(3)">आगे बढ़ें →</button>
      <button class="btn-secondary" onclick="nextSlide(1)">← वापस</button>
    </div>
  </div>
  <!-- Slide 3 -->
  <div class="onboard-slide" id="slide-3">
    <div class="onboard-hero">💰</div>
    <div class="onboard-body">
      <h2>आपकी मनचाही तनख्वाह</h2>
      <p>आप अपनी सैलरी खुद तय करें। मैचिंग सिस्टम आपको सबसे अच्छे ऑफर दिखाता है।</p>
      <div class="onboard-dots">
        <div class="onboard-dot"></div>
        <div class="onboard-dot"></div>
        <div class="onboard-dot active"></div>
      </div>
      <button class="btn-primary" onclick="showRoleSelect()">शुरू करें 🚀</button>
    </div>
  </div>
</div>

<!-- ROLE SELECT -->
<div id="role-select">
  <h2>आप कौन हैं?</h2>
  <p>सही अनुभव के लिए बताएं</p>
  <div class="role-card" onclick="selectRole('worker')">
    <div class="role-icon">👷</div>
    <div class="role-info">
      <h3>कामगार / मजदूर</h3>
      <p>नौकरी ढूंढ रहे हैं – सेल्सबॉय, लेबर, हेल्पर, आदि</p>
    </div>
  </div>
  <div class="role-card" onclick="selectRole('employer')">
    <div class="role-icon">🏪</div>
    <div class="role-info">
      <h3>नियोक्ता / मालिक</h3>
      <p>कर्मचारी ढूंढ रहे हैं – दुकान, फैक्ट्री, कंस्ट्रक्शन</p>
    </div>
  </div>
</div>

<!-- MAIN APP -->
<div id="app">
  <!-- TOP BAR -->
  <div class="topbar">
    <div class="topbar-logo">
      <div class="logo-dot">🔧</div>
      <span>RozgarConnect</span>
    </div>
    <div class="topbar-actions">
      <div class="icon-btn" onclick="showScreen('notifications')">
        🔔
        <div class="notif-badge" id="notif-count">3</div>
      </div>
      <div class="icon-btn" onclick="showScreen('profile')">👤</div>
    </div>
  </div>

  <!-- CONTENT -->
  <div class="content">

    <!-- HOME - WORKER -->
    <div class="screen active" id="screen-home-worker">
      <div class="greeting-banner">
        <div class="greet-top">
          <div>
            <h2>नमस्ते, राजेश! 👋</h2>
            <p>लखनऊ, उत्तर प्रदेश</p>
          </div>
          <div style="background:rgba(255,255,255,0.15);padding:8px 12px;border-radius:10px;text-align:center">
            <div style="color:var(--gold);font-size:13px;font-weight:700">⭐ 4.7</div>
            <div style="color:rgba(255,255,255,0.6);font-size:10px">रेटिंग</div>
          </div>
        </div>
        <div class="availability-toggle" onclick="toggleAvailability()">
          <div class="toggle-pill on" id="avail-toggle"></div>
          <span class="toggle-label" id="avail-label">✅ उपलब्ध हूं – नौकरी मिल सकती है</span>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num">7</div>
          <div class="stat-lbl">नए ऑफर</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">3</div>
          <div class="stat-lbl">मैच</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">42</div>
          <div class="stat-lbl">व्यू</div>
        </div>
      </div>

      <div style="padding:20px 20px 0;display:flex;align-items:center;justify-content:space-between">
        <div class="section-title" style="font-size:18px">आपके लिए नौकरियां</div>
        <div style="font-size:12px;color:var(--saffron);font-weight:600">सभी देखें</div>
      </div>

      <div class="job-match-card" onclick="showJobDetail()">
        <div class="job-match-top">
          <div class="employer-avatar" style="background:linear-gradient(135deg,#FF6B00,#FF8C33)">🏪</div>
          <div class="job-info">
            <div class="job-title">सेल्सबॉय – मोबाइल शॉप</div>
            <div class="employer-name">राम इलेक्ट्रॉनिक्स • ⭐ 4.5</div>
            <div class="job-salary">₹12,000/महीना</div>
          </div>
        </div>
        <div class="job-tags">
          <span class="tag">📍 2.3 km</span>
          <span class="tag green">✅ वेरिफाइड</span>
          <span class="tag blue">🕐 तुरंत जॉइनिंग</span>
        </div>
        <div class="job-footer">
          <div class="job-footer-left">👁 आपका प्रोफाइल देखा</div>
          <button class="btn-sm" onclick="event.stopPropagation();showAcceptSheet()">रुचि दिखाएं ❤️</button>
        </div>
      </div>

      <div class="job-match-card">
        <div class="job-match-top">
          <div class="employer-avatar" style="background:linear-gradient(135deg,#1A73E8,#4AA3F5)">🏗</div>
          <div class="job-info">
            <div class="job-title">कंस्ट्रक्शन हेल्पर</div>
            <div class="employer-name">सिंह बिल्डर्स • ⭐ 4.2</div>
            <div class="job-salary">₹600/दिन</div>
          </div>
        </div>
        <div class="job-tags">
          <span class="tag">📍 4.1 km</span>
          <span class="tag green">✅ वेरिफाइड</span>
          <span class="tag">6 महीने काम</span>
        </div>
        <div class="job-footer">
          <div class="job-footer-left">🆕 नई पोस्टिंग</div>
          <button class="btn-sm outline" onclick="event.stopPropagation();showAcceptSheet()">रुचि दिखाएं</button>
        </div>
      </div>

      <div class="job-match-card">
        <div class="job-match-top">
          <div class="employer-avatar" style="background:linear-gradient(135deg,#00A550,#00C060)">🚚</div>
          <div class="job-info">
            <div class="job-title">डिलीवरी बॉय</div>
            <div class="employer-name">फास्ट डिलीवरी को. • ⭐ 4.0</div>
            <div class="job-salary">₹15,000/महीना + incentive</div>
          </div>
        </div>
        <div class="job-tags">
          <span class="tag">📍 1.8 km</span>
          <span class="tag blue">बाइक चाहिए</span>
          <span class="tag green">✅ वेरिफाइड</span>
        </div>
        <div class="job-footer">
          <div class="job-footer-left">💡 आपकी सैलरी से मैच</div>
          <button class="btn-sm" onclick="event.stopPropagation()">रुचि दिखाएं ❤️</button>
        </div>
      </div>

      <div class="scroll-hint">• नीचे स्क्रॉल करें और देखें •</div>
    </div>

    <!-- HOME - EMPLOYER -->
    <div class="screen" id="screen-home-employer">
      <div class="employer-hero">
        <h2>नमस्ते, शर्मा जी! 🏪</h2>
        <p>पटना, बिहार • Sharma General Store</p>
        <div class="emp-stat-row">
          <div class="emp-stat">
            <div class="n">24</div>
            <div class="l">नए कामगार</div>
          </div>
          <div class="emp-stat">
            <div class="n">5</div>
            <div class="l">मैच हुए</div>
          </div>
          <div class="emp-stat">
            <div class="n">2</div>
            <div class="l">Active Jobs</div>
          </div>
        </div>
      </div>

      <div style="padding:16px 20px 0;display:flex;gap:12px">
        <button class="btn-primary" style="flex:1;padding:14px" onclick="showScreen('post-job')">+ नई जॉब पोस्ट करें</button>
        <button class="btn-secondary" style="flex:1;padding:14px;margin:0" onclick="showScreen('browse')">कामगार ढूंढें</button>
      </div>

      <div class="top-workers-label">
        <span>⭐ टॉप कामगार आपके लिए</span>
        <span class="view-all" onclick="showScreen('browse')">सभी देखें</span>
      </div>

      <div class="worker-card">
        <div class="worker-card-top">
          <div class="worker-avatar" style="background:linear-gradient(135deg,#FF6B00,#FF9933)">
            <span>R</span>
            <div class="verified-badge">✓</div>
          </div>
          <div class="worker-main">
            <div class="worker-name">Ramesh Kumar</div>
            <div class="worker-skill">🛍 सेल्सबॉय / Shop Helper</div>
            <div class="stars">⭐⭐⭐⭐⭐ <span style="font-size:11px;color:var(--text-light)">(4.8 • 12 जॉब)</span></div>
            <div class="worker-salary">₹12,000–₹14,000/महीना</div>
          </div>
          <div style="font-size:11px;color:var(--green);font-weight:700;white-space:nowrap">🟢 उपलब्ध</div>
        </div>
        <div style="padding:0 16px 10px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag">📍 1.2 km</span>
          <span class="tag green">✅ वेरिफाइड</span>
          <span class="tag blue">3 साल अनुभव</span>
        </div>
        <div class="worker-actions">
          <button class="btn-like" onclick="showMatchPopup()">❤️ Interest दिखाएं</button>
          <button class="btn-skip">⟩</button>
        </div>
      </div>

      <div class="worker-card">
        <div class="worker-card-top">
          <div class="worker-avatar" style="background:linear-gradient(135deg,#1A73E8,#4AA3F5)">
            <span>S</span>
            <div class="verified-badge">✓</div>
          </div>
          <div class="worker-main">
            <div class="worker-name">Suresh Yadav</div>
            <div class="worker-skill">🏗 कंस्ट्रक्शन वर्कर</div>
            <div class="stars">⭐⭐⭐⭐⭐ <span style="font-size:11px;color:var(--text-light)">(4.6 • 8 जॉब)</span></div>
            <div class="worker-salary">₹500–₹700/दिन</div>
          </div>
          <div style="font-size:11px;color:var(--green);font-weight:700;white-space:nowrap">🟢 उपलब्ध</div>
        </div>
        <div style="padding:0 16px 10px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag">📍 3.4 km</span>
          <span class="tag green">✅ वेरिफाइड</span>
          <span class="tag blue">5 साल अनुभव</span>
        </div>
        <div class="worker-actions">
          <button class="btn-like">❤️ Interest दिखाएं</button>
          <button class="btn-skip">⟩</button>
        </div>
      </div>

      <div class="boost-card" onclick="showBoostSheet()">
        <div class="boost-icon">🚀</div>
        <div class="boost-info">
          <h3>Job Boost करें</h3>
          <p>10x ज्यादा कामगार देखें आपकी जॉब</p>
        </div>
        <div class="boost-price">₹99</div>
      </div>

      <div class="scroll-hint">• और कामगार देखने के लिए स्क्रॉल करें •</div>
    </div>

    <!-- BROWSE WORKERS (Employer) -->
    <div class="screen" id="screen-browse">
      <div class="section-pad">
        <div class="section-title">कामगार ढूंढें</div>
        <div class="section-sub">24 कामगार उपलब्ध हैं आपके पास</div>
      </div>
      <div class="filter-bar">
        <div class="filter-chip active">सभी 🔽</div>
        <div class="filter-chip" onclick="toggleFilter(this)">📍 5 km</div>
        <div class="filter-chip" onclick="toggleFilter(this)">⭐ 4+ रेटिंग</div>
        <div class="filter-chip" onclick="toggleFilter(this)">✅ वेरिफाइड</div>
        <div class="filter-chip" onclick="toggleFilter(this)">🟢 उपलब्ध</div>
        <div class="filter-chip" onclick="toggleFilter(this)">💰 सैलरी</div>
      </div>

      <div class="category-grid" style="padding:0 20px">
        <div class="cat-btn selected"><div class="cat-icon">🛍</div><div class="cat-name">सेल्सबॉय</div></div>
        <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🏗</div><div class="cat-name">कंस्ट्रक्शन</div></div>
        <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🚚</div><div class="cat-name">डिलीवरी</div></div>
        <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🏭</div><div class="cat-name">फैक्ट्री</div></div>
        <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🧑‍💼</div><div class="cat-name">ऑफिस हेल्पर</div></div>
        <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">👐</div><div class="cat-name">लेबर</div></div>
      </div>

      <div style="margin-top:12px">
        <div class="worker-card">
          <div class="worker-card-top">
            <div class="worker-avatar" style="background:linear-gradient(135deg,#FF6B00,#FF9933)">R<div class="verified-badge">✓</div></div>
            <div class="worker-main">
              <div class="worker-name">Ramesh Kumar</div>
              <div class="worker-skill">🛍 सेल्सबॉय</div>
              <div class="stars">⭐⭐⭐⭐⭐ 4.8</div>
              <div class="worker-salary">₹12,000–14,000/मा.</div>
            </div>
            <div style="font-size:11px;color:var(--green);font-weight:700">🟢 Active</div>
          </div>
          <div style="padding:0 16px 10px;display:flex;gap:6px;flex-wrap:wrap">
            <span class="tag">📍 1.2 km</span><span class="tag green">✅</span><span class="tag blue">3 yr exp</span>
          </div>
          <div class="worker-actions">
            <button class="btn-like" onclick="showMatchPopup()">❤️ Interest दिखाएं</button>
            <button class="btn-skip">⟩</button>
          </div>
        </div>

        <div class="worker-card">
          <div class="worker-card-top">
            <div class="worker-avatar" style="background:linear-gradient(135deg,#9B59B6,#C39BD3)">M<div class="verified-badge">✓</div></div>
            <div class="worker-main">
              <div class="worker-name">Mukesh Prasad</div>
              <div class="worker-skill">🛍 Shop Helper</div>
              <div class="stars">⭐⭐⭐⭐ 4.3</div>
              <div class="worker-salary">₹9,000–11,000/मा.</div>
            </div>
            <div style="font-size:11px;color:var(--green);font-weight:700">🟢 Active</div>
          </div>
          <div style="padding:0 16px 10px;display:flex;gap:6px;flex-wrap:wrap">
            <span class="tag">📍 2.8 km</span><span class="tag green">✅</span><span class="tag blue">1 yr exp</span>
          </div>
          <div class="worker-actions">
            <button class="btn-like" onclick="showMatchPopup()">❤️ Interest दिखाएं</button>
            <button class="btn-skip">⟩</button>
          </div>
        </div>
      </div>
    </div>

    <!-- POST JOB (Employer) -->
    <div class="screen" id="screen-post-job">
      <div class="section-pad">
        <div class="section-title">नई जॉब पोस्ट करें</div>
        <div class="section-sub">जल्दी और आसानी से भर्ती करें</div>
      </div>
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">📋 काम का प्रकार चुनें</label>
          <div class="category-grid">
            <div class="cat-btn selected"><div class="cat-icon">🛍</div><div class="cat-name">सेल्सबॉय</div></div>
            <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🏗</div><div class="cat-name">कंस्ट्रक्शन</div></div>
            <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🚚</div><div class="cat-name">डिलीवरी</div></div>
            <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🏭</div><div class="cat-name">फैक्ट्री</div></div>
            <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">🧑‍💼</div><div class="cat-name">ऑफिस</div></div>
            <div class="cat-btn" onclick="selectCat(this)"><div class="cat-icon">👐</div><div class="cat-name">लेबर</div></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">💰 सैलरी (₹)</label>
          <div style="display:flex;gap:10px">
            <input class="form-input" placeholder="कम से कम" type="number" style="flex:1">
            <input class="form-input" placeholder="ज्यादा से ज्यादा" type="number" style="flex:1">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">📅 सैलरी का प्रकार</label>
          <div class="chip-group">
            <div class="chip active" onclick="selectChip(this)">महीना</div>
            <div class="chip" onclick="selectChip(this)">दिन</div>
            <div class="chip" onclick="selectChip(this)">घंटा</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">📍 काम की जगह</label>
          <input class="form-input" placeholder="जैसे: पटना जंक्शन के पास, बिहार" type="text">
        </div>
        <div class="form-group">
          <label class="form-label">📝 काम का विवरण (optional)</label>
          <textarea class="form-input" rows="3" placeholder="जैसे: सुबह 9 से शाम 6 बजे, दुकान पर ग्राहकों की मदद करना..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">⏰ कब से शुरू</label>
          <div class="chip-group">
            <div class="chip active" onclick="selectChip(this)">तुरंत</div>
            <div class="chip" onclick="selectChip(this)">इस हफ्ते</div>
            <div class="chip" onclick="selectChip(this)">इस महीने</div>
          </div>
        </div>
        <button class="btn-primary" onclick="showJobPostedConfirm()" style="margin-top:8px">✅ जॉब पोस्ट करें</button>
      </div>
    </div>

    <!-- MATCHES SCREEN -->
    <div class="screen" id="screen-matches">
      <div class="section-pad">
        <div class="section-title" id="matches-title">आपके मैच</div>
        <div class="section-sub" id="matches-sub">3 नए मैच हैं आज</div>
      </div>

      <div class="unlock-banner" id="unlock-banner">
        <div class="lock-icon">🔓</div>
        <div>
          <h3>2 और free unlock बाकी है</h3>
          <p>Contact number देखने के लिए unlock करें • ₹15/unlock</p>
        </div>
      </div>

      <div class="match-item" onclick="showContactSheet()">
        <div class="match-avatar" style="background:linear-gradient(135deg,#FF6B00,#FF9933)">R</div>
        <div class="match-info">
          <div class="match-name">Ram Electronics</div>
          <div class="match-meta">🛍 सेल्सबॉय • ₹12,000/मा. • 2.3 km</div>
        </div>
        <div style="text-align:right">
          <div class="match-status matched">🎉 मैच!</div>
          <div class="match-time" style="margin-top:4px">2 घंटे पहले</div>
        </div>
      </div>

      <div class="match-item" onclick="showContactSheet()">
        <div class="match-avatar" style="background:linear-gradient(135deg,#1A73E8,#4AA3F5)">S</div>
        <div class="match-info">
          <div class="match-name">Singh Builders</div>
          <div class="match-meta">🏗 कंस्ट्रक्शन • ₹600/दिन • 4.1 km</div>
        </div>
        <div style="text-align:right">
          <div class="match-status matched">🎉 मैच!</div>
          <div class="match-time" style="margin-top:4px">कल</div>
        </div>
      </div>

      <div class="match-item">
        <div class="match-avatar" style="background:linear-gradient(135deg,#9B59B6,#C39BD3)">F</div>
        <div class="match-info">
          <div class="match-name">Fast Delivery Co.</div>
          <div class="match-meta">🚚 डिलीवरी • ₹15,000/मा. • 1.8 km</div>
        </div>
        <div style="text-align:right">
          <div class="match-status pending">⏳ वेटिंग</div>
          <div class="match-time" style="margin-top:4px">अभी</div>
        </div>
      </div>

      <div style="padding:20px 20px 8px;font-size:16px;font-weight:700;color:var(--text-mid)">📥 Interested Employers</div>

      <div class="match-item">
        <div class="match-avatar" style="background:linear-gradient(135deg,#00A550,#00C060)">G</div>
        <div class="match-info">
          <div class="match-name">Gupta Store</div>
          <div class="match-meta">🛍 Shop Helper • ₹10,000/मा. • 3.2 km</div>
        </div>
        <div style="text-align:right">
          <div class="match-status new">🆕 New</div>
          <div class="match-time" style="margin-top:4px">5 min पहले</div>
        </div>
      </div>
    </div>

    <!-- NOTIFICATIONS -->
    <div class="screen" id="screen-notifications">
      <div class="section-pad" style="padding-bottom:12px">
        <div class="section-title">सूचनाएं</div>
        <div class="section-sub">आज की अपडेट</div>
      </div>

      <div class="notif-item unread">
        <div class="notif-dot" style="background:#FFF3E8">❤️</div>
        <div class="notif-content">
          <div class="notif-text"><b>Ram Electronics</b> ने आपका प्रोफाइल देखा और Interest दिखाया!</div>
          <div class="notif-time">2 घंटे पहले • SMS भी भेजा गया</div>
        </div>
      </div>

      <div class="notif-item unread">
        <div class="notif-dot" style="background:#E6F7EE">🎉</div>
        <div class="notif-content">
          <div class="notif-text"><b>Match हो गया!</b> Singh Builders से मैच हुआ। Contact unlock करें।</div>
          <div class="notif-time">5 घंटे पहले</div>
        </div>
      </div>

      <div class="notif-item unread">
        <div class="notif-dot" style="background:#EAF1FD">🆕</div>
        <div class="notif-content">
          <div class="notif-text"><b>3 नई नौकरियां</b> आपके area में आईं – तुरंत देखें!</div>
          <div class="notif-time">आज सुबह 9 बजे</div>
        </div>
      </div>

      <div class="notif-item">
        <div class="notif-dot" style="background:#F5F5FA">👁</div>
        <div class="notif-content">
          <div class="notif-text"><b>Fast Delivery Co.</b> ने आपका प्रोफाइल देखा</div>
          <div class="notif-time">कल शाम 4 बजे</div>
        </div>
      </div>

      <div class="notif-item">
        <div class="notif-dot" style="background:#F5F5FA">💰</div>
        <div class="notif-content">
          <div class="notif-text">Payment सफल – ₹15 में 1 contact unlock हुआ</div>
          <div class="notif-time">परसों</div>
        </div>
      </div>
    </div>

    <!-- PROFILE SCREEN -->
    <div class="screen" id="screen-profile">
      <div class="profile-hero">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar">👷</div>
          <div class="profile-info">
            <div class="profile-name" id="profile-name">Rajesh Sharma</div>
            <div class="profile-skill" id="profile-skill">🛍 Salesboy / Shop Helper</div>
            <div class="profile-rating">
              <span>⭐⭐⭐⭐⭐</span>
              <span class="rating-num">4.7</span>
              <span style="color:rgba(255,255,255,0.5);font-size:12px">(23 reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="pstat-num">23</div>
          <div class="pstat-lbl">जॉब पूरे</div>
        </div>
        <div class="profile-stat">
          <div class="pstat-num">4.7</div>
          <div class="pstat-lbl">रेटिंग</div>
        </div>
        <div class="profile-stat">
          <div class="pstat-num">87%</div>
          <div class="pstat-lbl">Response</div>
        </div>
        <div class="profile-stat">
          <div class="pstat-num">✅</div>
          <div class="pstat-lbl">वेरिफाइड</div>
        </div>
      </div>

      <div class="info-section">
        <h3>📋 मेरी जानकारी</h3>
        <div class="info-row">
          <div class="info-row-left">
            <div class="info-row-icon" style="background:#FFF3E8">💰</div>
            <div><div class="info-label">Expected Salary</div><div class="info-value">₹12,000–₹15,000/माह</div></div>
          </div>
          <div class="info-row-right">✏️</div>
        </div>
        <div class="info-row">
          <div class="info-row-left">
            <div class="info-row-icon" style="background:#EAF1FD">📍</div>
            <div><div class="info-label">Location</div><div class="info-value">लखनऊ, UP</div></div>
          </div>
          <div class="info-row-right">✏️</div>
        </div>
        <div class="info-row">
          <div class="info-row-left">
            <div class="info-row-icon" style="background:#E6F7EE">📱</div>
            <div><div class="info-label">Phone</div><div class="info-value">+91 98765 XXXXX</div></div>
          </div>
          <div class="info-row-right">✏️</div>
        </div>
        <div class="info-row">
          <div class="info-row-left">
            <div class="info-row-icon" style="background:#F5F5FA">🗣</div>
            <div><div class="info-label">भाषा</div><div class="info-value">हिंदी, अवधी</div></div>
          </div>
          <div class="info-row-right">✏️</div>
        </div>
      </div>

      <div class="info-section">
        <h3>🏆 काम का अनुभव</h3>
        <div class="info-row">
          <div class="info-row-left">
            <div class="info-row-icon" style="background:#FFF3E8">🛍</div>
            <div><div class="info-label">Sharma Electronics</div><div class="info-value">2 साल • सेल्सबॉय</div></div>
          </div>
          <div class="info-row-right">⭐4.8</div>
        </div>
        <div class="info-row">
          <div class="info-row-left">
            <div class="info-row-icon" style="background:#EAF1FD">🏪</div>
            <div><div class="info-label">Gupta General Store</div><div class="info-value">1 साल • Shop Helper</div></div>
          </div>
          <div class="info-row-right">⭐4.5</div>
        </div>
      </div>

      <div style="padding:16px 20px 0">
        <button class="btn-secondary" onclick="switchRole()" style="width:100%">🔄 Role बदलें (Worker / Employer)</button>
      </div>
      <div style="padding:10px 20px 0">
        <button class="btn-secondary" style="width:100%;color:#E53935;border-color:#E53935" onclick="logout()">🚪 Logout</button>
      </div>
      <div style="height:20px"></div>
    </div>

  </div>

  <!-- BOTTOM NAV -->
  <nav class="bottom-nav" id="bottom-nav">
    <button class="nav-item active" onclick="showScreen('home')" id="nav-home">
      <span class="nav-icon">🏠</span>
      <span>होम</span>
    </button>
    <button class="nav-item" onclick="showScreen('browse')" id="nav-browse">
      <span class="nav-icon">🔍</span>
      <span id="nav-browse-label">ढूंढें</span>
    </button>
    <button class="nav-item" onclick="showScreen('matches')" id="nav-matches">
      <span class="nav-icon">🤝</span>
      <span>मैच</span>
    </button>
    <button class="nav-item" onclick="showScreen('notifications')" id="nav-notifs">
      <span class="nav-icon">🔔</span>
      <span>सूचनाएं</span>
    </button>
    <button class="nav-item" onclick="showScreen('profile')" id="nav-profile">
      <span class="nav-icon">👤</span>
      <span>प्रोफाइल</span>
    </button>
  </nav>
</div>

<!-- MATCH POPUP -->
<div class="match-popup" id="match-popup">
  <div class="match-popup-inner">
    <div class="match-emojis">🎉🤝🎉</div>
    <h2>Match हो गया!</h2>
    <p>Ramesh Kumar ने आपकी जॉब में Interest दिखाया। अब contact unlock करें।</p>
    <div style="height:20px"></div>
    <button class="btn-primary" onclick="closeMatchPopup();showContactSheet()">📞 Contact देखें (Free)</button>
    <button class="btn-secondary" onclick="closeMatchPopup()">बाद में</button>
  </div>
</div>

<!-- ACCEPT JOB SHEET (Worker) -->
<div class="bottom-sheet-overlay" id="accept-sheet">
  <div class="bottom-sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">क्या आप interested हैं?</div>
    <div style="background:var(--saffron-pale);border-radius:12px;padding:14px;margin-bottom:16px">
      <div style="font-size:16px;font-weight:700">Ram Electronics – सेल्सबॉय</div>
      <div style="font-size:14px;color:var(--text-mid);margin-top:4px">₹12,000/मा. • 2.3 km • ⭐4.5</div>
    </div>
    <p style="font-size:14px;color:var(--text-mid);margin-bottom:16px">हां करने पर employer को नोटिफिकेशन जाएगी। Match होने पर contact मिलेगा।</p>
    <button class="btn-primary" onclick="closeSheet('accept-sheet');showMatchConfirm()">✅ हां, मुझे Interest है!</button>
    <button class="btn-secondary" onclick="closeSheet('accept-sheet')">नहीं, बाद में</button>
  </div>
</div>

<!-- CONTACT UNLOCK SHEET -->
<div class="bottom-sheet-overlay" id="contact-sheet">
  <div class="bottom-sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">Contact Unlock करें</div>
    <div class="contact-card" style="margin:0 0 16px">
      <div style="font-size:36px">📞</div>
      <div class="cc-info">
        <h4>Contact Number देखें</h4>
        <p>Ram Electronics – आपसे बात करना चाहते हैं</p>
      </div>
    </div>
    <div style="background:var(--green-pale);border-radius:12px;padding:12px;margin-bottom:16px;text-align:center">
      <div style="color:var(--green);font-weight:700;font-size:15px">🎁 आपके पास 2 FREE unlock बाकी हैं!</div>
    </div>
    <button class="btn-primary" style="background:linear-gradient(135deg,var(--green),var(--green-light))" onclick="closeSheet('contact-sheet');showContactReveal()">🆓 Free में Unlock करें</button>
    <button class="btn-secondary" onclick="closeSheet('contact-sheet')">बाद में</button>
  </div>
</div>

<!-- BOOST SHEET (Employer) -->
<div class="bottom-sheet-overlay" id="boost-sheet">
  <div class="bottom-sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">🚀 Job Boost</div>
    <p style="color:var(--text-mid);font-size:14px;margin-bottom:16px">ज्यादा लोगों तक पहुंचें, जल्दी hire करें</p>
    <div class="pay-option selected" onclick="selectPay(this)">
      <div><h4>Basic Boost</h4><p>3 दिन • 5x ज्यादा लोग</p></div>
      <div class="pay-price">₹49</div>
    </div>
    <div class="pay-option" onclick="selectPay(this)">
      <div><h4>Super Boost ⭐</h4><p>7 दिन • 10x ज्यादा • Priority listing</p></div>
      <div class="pay-price">₹99</div>
    </div>
    <div class="pay-option" onclick="selectPay(this)">
      <div><h4>Max Boost 🔥</h4><p>15 दिन • 20x • Highlighted + SMS</p></div>
      <div class="pay-price">₹199</div>
    </div>
    <button class="btn-primary" onclick="closeSheet('boost-sheet')" style="margin-top:8px">💳 Pay करें – UPI / Cash</button>
    <button class="btn-secondary" onclick="closeSheet('boost-sheet')">बाद में</button>
  </div>
</div>

<!-- CONTACT REVEAL POPUP -->
<div class="match-popup" id="contact-reveal">
  <div class="match-popup-inner">
    <div style="font-size:48px;margin-bottom:12px">📱</div>
    <h2>Contact Unlocked!</h2>
    <div style="background:var(--green-pale);border:2px solid var(--green);border-radius:14px;padding:16px;margin:16px 0">
      <div style="color:var(--text-mid);font-size:12px">Ram Electronics</div>
      <div style="font-size:22px;font-weight:800;color:var(--text);margin-top:4px">+91 98123 45678</div>
      <div style="color:var(--text-mid);font-size:12px;margin-top:4px">📍 Gandhi Nagar, Lucknow</div>
    </div>
    <button class="btn-primary" style="background:linear-gradient(135deg,#25D366,#128C7E)" onclick="closeContact()">📱 WhatsApp पर बात करें</button>
    <button class="btn-secondary" onclick="closeContact()">📞 Call करें</button>
  </div>
</div>

<script>
let currentRole = 'worker';
let availableToggled = true;

// SPLASH
setTimeout(() => {
  const splash = document.getElementById('splash');
  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
    document.getElementById('onboarding').style.display = 'flex';
  }, 500);
}, 2500);

function nextSlide(n) {
  document.querySelectorAll('.onboard-slide').forEach(s => s.classList.remove('active'));
  document.getElementById('slide-' + n).classList.add('active');
}

function showRoleSelect() {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('role-select').style.display = 'flex';
}

function selectRole(role) {
  currentRole = role;
  document.getElementById('role-select').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  document.getElementById('app').style.flexDirection = 'column';
  setupRole();
  showScreen('home');
}

function setupRole() {
  const browse = document.getElementById('nav-browse-label');
  if (currentRole === 'employer') {
    browse.textContent = 'ढूंढें';
  } else {
    browse.textContent = 'जॉब्स';
  }
  // Update matches title
  if (currentRole === 'employer') {
    document.getElementById('matches-title').textContent = 'आपके Matches';
    document.getElementById('matches-sub').textContent = '5 नए Workers ने Accept किया';
    document.getElementById('unlock-banner').style.display = 'none';
  }
}

function showScreen(name) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  let screenId;
  if (name === 'home') {
    screenId = currentRole === 'employer' ? 'screen-home-employer' : 'screen-home-worker';
    document.getElementById('nav-home').classList.add('active');
  } else if (name === 'browse') {
    screenId = currentRole === 'employer' ? 'screen-browse' : 'screen-home-worker';
    document.getElementById('nav-browse').classList.add('active');
  } else if (name === 'post-job') {
    screenId = 'screen-post-job';
    document.getElementById('nav-browse').classList.add('active');
  } else if (name === 'matches') {
    screenId = 'screen-matches';
    document.getElementById('nav-matches').classList.add('active');
  } else if (name === 'notifications') {
    screenId = 'screen-notifications';
    document.getElementById('nav-notifs').classList.add('active');
    document.getElementById('notif-count').style.display = 'none';
  } else if (name === 'profile') {
    screenId = 'screen-profile';
    document.getElementById('nav-profile').classList.add('active');
    // Update profile for employer
    if (currentRole === 'employer') {
      document.getElementById('profile-name').textContent = 'Sharma Ji';
      document.getElementById('profile-skill').textContent = '🏪 Employer – General Store';
    }
  }

  if (screenId) {
    document.getElementById(screenId).classList.add('active');
  }
}

function toggleAvailability() {
  availableToggled = !availableToggled;
  const toggle = document.getElementById('avail-toggle');
  const label = document.getElementById('avail-label');
  if (availableToggled) {
    toggle.classList.add('on');
    label.textContent = '✅ उपलब्ध हूं – नौकरी मिल सकती है';
  } else {
    toggle.classList.remove('on');
    label.textContent = '❌ अभी उपलब्ध नहीं हूं';
  }
}

function toggleFilter(el) { el.classList.toggle('active'); }
function selectCat(el) {
  el.closest('.category-grid').querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}
function selectChip(el) {
  el.closest('.chip-group').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function showJobDetail() {}

function showAcceptSheet() {
  document.getElementById('accept-sheet').classList.add('show');
}
function closeSheet(id) {
  document.getElementById(id).classList.remove('show');
}

function showMatchConfirm() {
  // Show a brief confirmation toast-like
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#0D1B3E;color:white;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;z-index:600;animation:fadeIn 0.3s ease';
  toast.textContent = '✅ Interest दिखा दिया! Employer को नोटिफाई किया गया।';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showMatchPopup() {
  document.getElementById('match-popup').classList.add('show');
}
function closeMatchPopup() {
  document.getElementById('match-popup').classList.remove('show');
}

function showContactSheet() {
  document.getElementById('contact-sheet').classList.add('show');
}

function showContactReveal() {
  document.getElementById('contact-sheet').classList.remove('show');
  document.getElementById('contact-reveal').classList.add('show');
}
function closeContact() {
  document.getElementById('contact-reveal').classList.remove('show');
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--green);color:white;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;z-index:600;white-space:nowrap';
  toast.textContent = '📞 Number copy हो गया!';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function showBoostSheet() {
  document.getElementById('boost-sheet').classList.add('show');
}
function selectPay(el) {
  el.closest('.bottom-sheet').querySelectorAll('.pay-option').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

function showJobPostedConfirm() {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--green);color:white;padding:14px 24px;border-radius:14px;font-size:15px;font-weight:700;z-index:600;white-space:nowrap;box-shadow:0 4px 20px rgba(0,165,80,0.4)';
  toast.textContent = '🎉 जॉब पोस्ट हो गई! Matching शुरू...';
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); showScreen('home'); }, 2500);
}

function switchRole() {
  currentRole = currentRole === 'worker' ? 'employer' : 'worker';
  setupRole();
  showScreen('home');
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--navy);color:white;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;z-index:600';
  toast.textContent = currentRole === 'employer' ? '🏪 Employer mode में गए' : '👷 Worker mode में गए';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function logout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('onboarding').style.display = 'flex';
  nextSlide(1);
}

// Close sheets by tapping overlay
document.querySelectorAll('.bottom-sheet-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
  });
});
document.querySelectorAll('.match-popup').forEach(popup => {
  popup.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
  });
});
</script>
</body>
</html>
`;

const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'rozgar_secret_key_2024';

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(morgan('tiny'));


// ================================================================
// IN-MEMORY DATABASE (no signup, no Atlas, works instantly)
// ================================================================
const DB = { workers: [], employers: [], jobs: [], matches: [] };

// ── SEED DEMO DATA ───────────────────────────────────────────────
;(function seed() {
  const W = [
    { _id:uid(), name:'Ramesh Kumar',   phone:'9876543210', skill_category:'salesboy',      ask_price:12000, salary_type:'monthly', location:{city:'Lucknow',  state:'UP',    lat:26.85,lng:80.95}, rating:4.8, rating_count:12, is_available:true, is_verified:true,  experience_years:3, views_count:42, free_unlocks_left:3, response_rate:0.9  },
    { _id:uid(), name:'Sunita Devi',    phone:'9876543211', skill_category:'cook',           ask_price:9000,  salary_type:'monthly', location:{city:'Patna',    state:'Bihar', lat:25.60,lng:85.12}, rating:4.5, rating_count:8,  is_available:true, is_verified:false, experience_years:2, views_count:28, free_unlocks_left:3, response_rate:0.8  },
    { _id:uid(), name:'Mukesh Yadav',   phone:'9876543212', skill_category:'construction',   ask_price:550,   salary_type:'daily',   location:{city:'Varanasi', state:'UP',    lat:25.32,lng:83.00}, rating:4.6, rating_count:20, is_available:true, is_verified:true,  experience_years:5, views_count:55, free_unlocks_left:3, response_rate:0.95 },
    { _id:uid(), name:'Priya Singh',    phone:'9876543213', skill_category:'tailor',         ask_price:8000,  salary_type:'monthly', location:{city:'Jaipur',   state:'Raj',   lat:26.91,lng:75.79}, rating:0,   rating_count:0,  is_available:true, is_verified:false, experience_years:0, views_count:10, free_unlocks_left:3, response_rate:1.0  },
    { _id:uid(), name:'Arjun Patel',    phone:'9876543214', skill_category:'driver',         ask_price:15000, salary_type:'monthly', location:{city:'Bhopal',   state:'MP',    lat:23.26,lng:77.41}, rating:4.3, rating_count:6,  is_available:true, is_verified:true,  experience_years:4, views_count:33, free_unlocks_left:3, response_rate:0.75 },
    { _id:uid(), name:'Ravi Sharma',    phone:'9876543215', skill_category:'electrician',    ask_price:600,   salary_type:'daily',   location:{city:'Lucknow',  state:'UP',    lat:26.84,lng:80.92}, rating:4.2, rating_count:9,  is_available:true, is_verified:false, experience_years:3, views_count:19, free_unlocks_left:3, response_rate:0.85 },
    { _id:uid(), name:'Geeta Kumari',   phone:'9876543216', skill_category:'housekeeping',   ask_price:7000,  salary_type:'monthly', location:{city:'Gaya',     state:'Bihar', lat:24.80,lng:85.00}, rating:4.7, rating_count:15, is_available:true, is_verified:true,  experience_years:6, views_count:61, free_unlocks_left:3, response_rate:0.92 },
    { _id:uid(), name:'Suresh Verma',   phone:'9876543217', skill_category:'delivery',       ask_price:13000, salary_type:'monthly', location:{city:'Agra',     state:'UP',    lat:27.18,lng:78.01}, rating:3.9, rating_count:4,  is_available:true, is_verified:false, experience_years:1, views_count:22, free_unlocks_left:3, response_rate:0.7  },
    { _id:uid(), name:'Meena Devi',     phone:'9876543218', skill_category:'babysitter',     ask_price:6000,  salary_type:'monthly', location:{city:'Kanpur',   state:'UP',    lat:26.46,lng:80.33}, rating:4.9, rating_count:22, is_available:true, is_verified:true,  experience_years:7, views_count:78, free_unlocks_left:3, response_rate:0.98 },
    { _id:uid(), name:'Vijay Maurya',   phone:'9876543219', skill_category:'security_guard', ask_price:10000, salary_type:'monthly', location:{city:'Allahabad',state:'UP',    lat:25.44,lng:81.84}, rating:4.1, rating_count:7,  is_available:true, is_verified:false, experience_years:8, views_count:35, free_unlocks_left:3, response_rate:0.88 },
    { _id:uid(), name:'Deepa Rani',     phone:'9876543220', skill_category:'tailor',         ask_price:9500,  salary_type:'monthly', location:{city:'Lucknow',  state:'UP',    lat:26.86,lng:80.96}, rating:4.4, rating_count:11, is_available:true, is_verified:true,  experience_years:4, views_count:29, free_unlocks_left:3, response_rate:0.9  },
    { _id:uid(), name:'Santosh Kumar',  phone:'9876543221', skill_category:'plumber',        ask_price:650,   salary_type:'daily',   location:{city:'Patna',    state:'Bihar', lat:25.61,lng:85.13}, rating:4.0, rating_count:5,  is_available:true, is_verified:false, experience_years:6, views_count:17, free_unlocks_left:3, response_rate:0.8  },
    { _id:uid(), name:'Kavita Sharma',  phone:'9876543222', skill_category:'cook',           ask_price:10000, salary_type:'monthly', location:{city:'Jaipur',   state:'Raj',   lat:26.92,lng:75.80}, rating:4.6, rating_count:18, is_available:true, is_verified:true,  experience_years:5, views_count:44, free_unlocks_left:3, response_rate:0.93 },
    { _id:uid(), name:'Mohan Das',      phone:'9876543223', skill_category:'painter',        ask_price:500,   salary_type:'daily',   location:{city:'Varanasi', state:'UP',    lat:25.33,lng:83.01}, rating:3.8, rating_count:3,  is_available:true, is_verified:false, experience_years:2, views_count:12, free_unlocks_left:3, response_rate:0.75 },
    { _id:uid(), name:'Rekha Devi',     phone:'9876543224', skill_category:'housekeeping',   ask_price:6500,  salary_type:'monthly', location:{city:'Lucknow',  state:'UP',    lat:26.85,lng:80.94}, rating:4.3, rating_count:9,  is_available:true, is_verified:false, experience_years:3, views_count:25, free_unlocks_left:3, response_rate:0.87 },
  ];
  const E = [
    { _id:uid(), business_name:'Ram Electronics', owner_name:'Ram Gupta',    phone:'8888800001', whatsapp:'8888800001', business_type:'retail',       location:{city:'Lucknow',state:'UP',   lat:26.85,lng:80.95}, rating:4.5, is_verified:true,  plan:'super', boost_active:true,  direct_fetch_used:3, direct_fetch_quota:5 },
    { _id:uid(), business_name:'Singh Builders',  owner_name:'Vikram Singh', phone:'8888800002', whatsapp:'8888800002', business_type:'construction', location:{city:'Patna',  state:'Bihar',lat:25.60,lng:85.12}, rating:4.2, is_verified:false, plan:'free',  boost_active:false, direct_fetch_used:1, direct_fetch_quota:5 },
    { _id:uid(), business_name:'Gupta Kirana',    owner_name:'Deepak Gupta', phone:'8888800003', whatsapp:'8888800003', business_type:'retail',       location:{city:'Jaipur', state:'Raj',  lat:26.91,lng:75.79}, rating:3.8, is_verified:false, plan:'free',  boost_active:false, direct_fetch_used:0, direct_fetch_quota:5 },
  ];
  W.forEach(w => DB.workers.push(w));
  E.forEach(e => DB.employers.push(e));
  // Seed a demo job
  DB.jobs.push({ _id:uid(), employer_id:E[0]._id, title:'Salesboy for Mobile Shop', category:'salesboy', bid_low:10000, bid_high:14000, salary_type:'monthly', description:'Mobile shop, 9am-6pm, good commission', location:{city:'Lucknow',state:'UP',lat:26.85,lng:80.95}, radius_km:10, status:'active', boost_active:true, views_count:23, likes_count:4, createdAt:new Date() });
  DB.jobs.push({ _id:uid(), employer_id:E[1]._id, title:'Construction Mazdoor', category:'construction', bid_low:500, bid_high:650, salary_type:'daily', description:'Building construction site work', location:{city:'Patna',state:'Bihar',lat:25.60,lng:85.12}, radius_km:15, status:'active', boost_active:false, views_count:11, likes_count:2, createdAt:new Date() });
  DB.jobs.push({ _id:uid(), employer_id:E[2]._id, title:'Kirana Shop Helper', category:'kirana_helper', bid_low:8000, bid_high:11000, salary_type:'monthly', description:'Help manage store, stock keeping', location:{city:'Jaipur',state:'Raj',lat:26.91,lng:75.79}, radius_km:5, status:'active', boost_active:false, views_count:7, likes_count:1, createdAt:new Date() });
  console.log(`✅ Demo data seeded: ${DB.workers.length} workers, ${DB.employers.length} employers, ${DB.jobs.length} jobs`);
})();

// ================================================================
// HELPERS
// ================================================================
const sign = (payload) => jwt.sign(payload, SECRET, { expiresIn: '30d' });
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Login karein pehle (No token)' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token — please login again' }); }
};

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, d2r = Math.PI/180;
  const dLat = (lat2-lat1)*d2r, dLng = (lng2-lng1)*d2r;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function matchScore(worker, job) {
  const ratingScore   = (worker.rating / 5) * 35;
  const dist          = haversine(worker.location?.lat||26.85, worker.location?.lng||80.95, job.location?.lat||26.85, job.location?.lng||80.95);
  const distScore     = Math.max(0, (1 - dist / (job.radius_km||10))) * 25;
  const salaryFit     = worker.ask_price <= job.bid_high ? ((job.bid_high - worker.ask_price) / job.bid_high) * 25 : 0;
  const verifiedScore = worker.is_verified ? 10 : 0;
  const respScore     = (worker.response_rate||0.5) * 5;
  return Math.round(ratingScore + distScore + salaryFit + verifiedScore + respScore);
}

// ================================================================
// CATEGORIES
// ================================================================
const CATS = [
  {id:'salesboy',name:'Salesboy / Sales Girl',hindi:'सेल्सबॉय',icon:'🛍',sector:'retail'},
  {id:'shop_helper',name:'Shop Helper',hindi:'दुकान सहायक',icon:'🏪',sector:'retail'},
  {id:'kirana_helper',name:'Kirana Store Helper',hindi:'किराना सहायक',icon:'📦',sector:'retail'},
  {id:'medical_store',name:'Medical Store Helper',hindi:'दवाई दुकान',icon:'💊',sector:'retail'},
  {id:'cloth_shop',name:'Cloth Shop Helper',hindi:'कपड़ा दुकान',icon:'👗',sector:'retail'},
  {id:'construction',name:'Construction Worker',hindi:'निर्माण मजदूर',icon:'🏗',sector:'construction'},
  {id:'mason',name:'Mason / Raj Mistri',hindi:'राज मिस्त्री',icon:'🧱',sector:'construction'},
  {id:'painter',name:'Painter / Rang Mistri',hindi:'रंग मिस्त्री',icon:'🎨',sector:'construction'},
  {id:'carpenter',name:'Carpenter / Badhai',hindi:'बढ़ई',icon:'🪚',sector:'construction'},
  {id:'electrician',name:'Electrician',hindi:'बिजली मिस्त्री',icon:'⚡',sector:'construction'},
  {id:'plumber',name:'Plumber',hindi:'नलका मिस्त्री',icon:'🔧',sector:'construction'},
  {id:'welder',name:'Welder / Lohar',hindi:'वेल्डर',icon:'🔩',sector:'construction'},
  {id:'tile_worker',name:'Tile / Floor Worker',hindi:'टाइल मिस्त्री',icon:'🪟',sector:'construction'},
  {id:'sanitation',name:'Sanitation Worker',hindi:'सफाई मजदूर',icon:'🪣',sector:'construction'},
  {id:'delivery',name:'Delivery Worker',hindi:'डिलीवरी बॉय',icon:'🚚',sector:'transport'},
  {id:'driver',name:'Driver / Chalak',hindi:'ड्राइवर',icon:'🚗',sector:'transport'},
  {id:'bike_rider',name:'Bike Rider',hindi:'बाइक राइडर',icon:'🏍',sector:'transport'},
  {id:'truck_driver',name:'Truck Driver',hindi:'ट्रक ड्राइवर',icon:'🚜',sector:'transport'},
  {id:'warehouse',name:'Warehouse Worker',hindi:'गोदाम मजदूर',icon:'📦',sector:'transport'},
  {id:'cook',name:'Cook / Chef / Bawarchi',hindi:'बावर्ची',icon:'🍳',sector:'food'},
  {id:'halwai',name:'Halwai / Mithai Maker',hindi:'हलवाई',icon:'🫓',sector:'food'},
  {id:'waiter',name:'Waiter / Hotel Staff',hindi:'वेटर',icon:'🍽',sector:'food'},
  {id:'chai_stall',name:'Chai Stall Worker',hindi:'चाय वाला',icon:'☕',sector:'food'},
  {id:'factory',name:'Factory / Mill Worker',hindi:'फैक्ट्री मजदूर',icon:'🏭',sector:'factory'},
  {id:'tailor',name:'Tailor / Darzi',hindi:'दर्जी',icon:'🧵',sector:'factory'},
  {id:'embroidery',name:'Embroidery Worker',hindi:'कढ़ाई कारीगर',icon:'🪡',sector:'factory'},
  {id:'machine_operator',name:'Machine Operator',hindi:'मशीन ऑपरेटर',icon:'⚙',sector:'factory'},
  {id:'housekeeping',name:'Housekeeping / Maid',hindi:'घरेलू काम',icon:'🧹',sector:'household'},
  {id:'babysitter',name:'Baby Sitter / Aya',hindi:'आया',icon:'🍼',sector:'household'},
  {id:'elder_care',name:'Elder Care',hindi:'बुजुर्ग सेवा',icon:'👴',sector:'household'},
  {id:'gardener',name:'Gardener / Mali',hindi:'माली',icon:'🌿',sector:'household'},
  {id:'dhobi',name:'Washerman / Dhobi',hindi:'धोबी',icon:'🚿',sector:'household'},
  {id:'mobile_repair',name:'Mobile Repair',hindi:'मोबाइल मिस्त्री',icon:'📱',sector:'repair'},
  {id:'ac_repair',name:'AC / Fridge Repair',hindi:'AC फ्रिज रिपेयर',icon:'❄',sector:'repair'},
  {id:'barber',name:'Barber / Nai',hindi:'नाई',icon:'💇',sector:'repair'},
  {id:'beautician',name:'Beautician / Parlour',hindi:'ब्यूटीशियन',icon:'💆',sector:'repair'},
  {id:'locksmith',name:'Locksmith',hindi:'चाबी मिस्त्री',icon:'🔑',sector:'repair'},
  {id:'agriculture',name:'Agriculture Worker',hindi:'खेत मजदूर',icon:'🌾',sector:'agriculture'},
  {id:'dairy',name:'Dairy Worker',hindi:'डेयरी',icon:'🐄',sector:'agriculture'},
  {id:'tractor_operator',name:'Tractor Operator',hindi:'ट्रैक्टर चालक',icon:'🚜',sector:'agriculture'},
  {id:'poultry',name:'Poultry Worker',hindi:'मुर्गी पालन',icon:'🐔',sector:'agriculture'},
  {id:'security_guard',name:'Security Guard',hindi:'चौकीदार',icon:'🛡',sector:'security'},
  {id:'office_peon',name:'Office Peon',hindi:'पियून',icon:'🧑‍💼',sector:'security'},
  {id:'tutor',name:'Tutor / Home Teacher',hindi:'ट्यूटर',icon:'📚',sector:'security'},
  {id:'photographer',name:'Photographer',hindi:'फोटोग्राफर',icon:'📷',sector:'security'},
  {id:'printer_operator',name:'Printer / Xerox',hindi:'प्रिंट',icon:'🖨',sector:'security'},
];

// ================================================================
// ROUTES
// ================================================================

// Health check
app.get('/api/health', (_, res) => res.json({ status:'ok', message:'RozgarConnect is live 🚀', workers:DB.workers.length, employers:DB.employers.length, jobs:DB.jobs.length }));

// Categories
app.get('/api/categories', (req, res) => {
  const { sector } = req.query;
  res.json({ categories: sector ? CATS.filter(c=>c.sector===sector) : CATS, total: CATS.length });
});

// ── AUTH ─────────────────────────────────────────────────────────

// Register Worker
app.post('/api/auth/register/worker', async (req, res) => {
  try {
    const { name, phone, skill_category, ask_price, salary_type, location, experience_years, sub_skill, language, gender } = req.body;
    if (!name||!phone||!skill_category||!ask_price) return res.status(400).json({ error:'Name, phone, skill aur ask_price zaroori hai' });
    if (DB.workers.find(w=>w.phone===phone)) return res.status(409).json({ error:'Yeh phone number pehle se registered hai' });
    const worker = { _id:uid(), name, phone, skill_category, sub_skill:sub_skill||'', ask_price:Number(ask_price), salary_type:salary_type||'monthly', location:location||{city:'',state:'',lat:26.85,lng:80.95}, experience_years:Number(experience_years)||0, language:language||'hindi', gender:gender||'male', rating:0, rating_count:0, is_available:true, is_verified:false, free_unlocks_left:3, response_rate:1.0, views_count:0, work_history:[], createdAt:new Date() };
    DB.workers.push(worker);
    const token = sign({ id:worker._id, role:'worker' });
    res.status(201).json({ message:'Worker registered! Welcome to RozgarConnect 🎉', token, worker });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Register Employer
app.post('/api/auth/register/employer', async (req, res) => {
  try {
    const { business_name, owner_name, phone, whatsapp, business_type, location, gstin } = req.body;
    if (!business_name||!owner_name||!phone) return res.status(400).json({ error:'Business name, owner name aur phone zaroori hai' });
    if (DB.employers.find(e=>e.phone===phone)) return res.status(409).json({ error:'Yeh phone number pehle se registered hai' });
    const employer = { _id:uid(), business_name, owner_name, phone, whatsapp:whatsapp||phone, business_type:business_type||'retail', location:location||{city:'',state:'',lat:26.85,lng:80.95}, gstin:gstin||'', rating:0, is_verified:false, plan:'free', boost_active:false, boost_expires_at:null, direct_fetch_used:0, direct_fetch_quota:5, daily_like_quota:50, likes_used_today:0, createdAt:new Date() };
    DB.employers.push(employer);
    const token = sign({ id:employer._id, role:'employer' });
    res.status(201).json({ message:'Employer registered! Ab job post karein 🎉', token, employer });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Login Worker
app.post('/api/auth/login/worker', (req, res) => {
  const { phone } = req.body;
  const worker = DB.workers.find(w=>w.phone===phone);
  if (!worker) return res.status(404).json({ error:'Is phone se koi worker registered nahi hai' });
  res.json({ message:'Login ho gaya!', token:sign({ id:worker._id, role:'worker' }), worker });
});

// Login Employer
app.post('/api/auth/login/employer', (req, res) => {
  const { phone } = req.body;
  const employer = DB.employers.find(e=>e.phone===phone);
  if (!employer) return res.status(404).json({ error:'Is phone se koi employer registered nahi hai' });
  res.json({ message:'Login ho gaya!', token:sign({ id:employer._id, role:'employer' }), employer });
});

// Me
app.get('/api/auth/me', auth, (req, res) => {
  if (req.user.role==='worker') {
    const w = DB.workers.find(w=>w._id===req.user.id);
    return w ? res.json({ role:'worker', user:w }) : res.status(404).json({ error:'Not found' });
  }
  const e = DB.employers.find(e=>e._id===req.user.id);
  return e ? res.json({ role:'employer', user:e }) : res.status(404).json({ error:'Not found' });
});

// ── WORKERS ──────────────────────────────────────────────────────

// Browse workers (employer)
app.get('/api/workers', auth, (req, res) => {
  const { category, city, min_rating, max_ask, verified_only } = req.query;
  let workers = DB.workers.filter(w => w.is_available);
  if (category) workers = workers.filter(w=>w.skill_category===category);
  if (city) workers = workers.filter(w=>w.location?.city?.toLowerCase().includes(city.toLowerCase()));
  if (min_rating) workers = workers.filter(w=>w.rating>=Number(min_rating));
  if (max_ask) workers = workers.filter(w=>w.ask_price<=Number(max_ask));
  if (verified_only==='true') workers = workers.filter(w=>w.is_verified);
  workers = workers.sort((a,b)=>b.rating-a.rating || b.is_verified-a.is_verified);
  res.json({ workers, total:workers.length });
});

// Get worker profile
app.get('/api/workers/:id', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Worker not found' });
  w.views_count = (w.views_count||0)+1;
  res.json({ worker:w });
});

// Toggle availability
app.patch('/api/workers/:id/availability', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Not found' });
  w.is_available = !w.is_available;
  res.json({ is_available:w.is_available, message:`Ab aap ${w.is_available?'available':'unavailable'} hain` });
});

// Update ask price
app.patch('/api/workers/:id/ask-price', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Not found' });
  w.ask_price = Number(req.body.ask_price);
  res.json({ message:'ASK price update ho gayi!', ask_price:w.ask_price });
});

// Update worker profile
app.patch('/api/workers/:id', auth, (req, res) => {
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Not found' });
  ['name','description','skill_category','sub_skill','experience_years','location'].forEach(k=>{ if(req.body[k]!==undefined) w[k]=req.body[k]; });
  res.json({ worker:w });
});

// Direct fetch (employer king feature)
app.post('/api/workers/:id/direct-fetch', auth, (req, res) => {
  if (req.user.role!=='employer') return res.status(403).json({ error:'Sirf employers ke liye' });
  const w = DB.workers.find(w=>w._id===req.params.id);
  if (!w) return res.status(404).json({ error:'Worker not found' });
  const emp = DB.employers.find(e=>e._id===req.user.id);
  if (emp) emp.direct_fetch_used = (emp.direct_fetch_used||0)+1;
  res.json({ message:'✅ Direct fetch successful! Contact details mil gayi.', worker_name:w.name, phone:w.phone, whatsapp:w.phone, location:w.location, skill_category:w.skill_category, ask_price:w.ask_price, rating:w.rating, charge:'₹29' });
});

// ── EMPLOYERS ────────────────────────────────────────────────────

app.get('/api/employers/profile', auth, (req, res) => {
  const e = DB.employers.find(e=>e._id===req.user.id);
  if (!e) return res.status(404).json({ error:'Not found' });
  res.json({ employer:e });
});

app.patch('/api/employers/profile', auth, (req, res) => {
  const e = DB.employers.find(e=>e._id===req.user.id);
  if (!e) return res.status(404).json({ error:'Not found' });
  ['business_name','owner_name','whatsapp','business_type','location'].forEach(k=>{ if(req.body[k]!==undefined) e[k]=req.body[k]; });
  res.json({ employer:e });
});

// ── JOBS ─────────────────────────────────────────────────────────

// Post a job (BID placement)
app.post('/api/jobs', auth, (req, res) => {
  if (req.user.role!=='employer') return res.status(403).json({ error:'Sirf employers job post kar sakte hain' });
  const { title, category, bid_low, bid_high, salary_type, description, location, radius_km, start_date } = req.body;
  if (!category||!bid_high) return res.status(400).json({ error:'Category aur maximum salary zaroori hai' });
  const emp = DB.employers.find(e=>e._id===req.user.id);
  const job = { _id:uid(), employer_id:req.user.id, employer_name:emp?.business_name||'Employer', title:title||category, category, bid_low:Number(bid_low)||0, bid_high:Number(bid_high), salary_type:salary_type||'monthly', description:description||'', location:location||emp?.location||{city:'',state:'',lat:26.85,lng:80.95}, radius_km:Number(radius_km)||10, start_date:start_date||'Turant / Immediate', status:'active', boost_active:false, views_count:0, likes_count:0, createdAt:new Date() };
  DB.jobs.push(job);
  // BID-ASK ENGINE: find eligible workers immediately
  const eligible = bidAskEngine(job);
  res.status(201).json({ message:`Job post ho gayi! ${eligible.length} workers eligible hain!`, job, eligible_workers_count:eligible.length, eligible_workers:eligible.slice(0,10) });
});

// Browse all jobs (public)
app.get('/api/jobs', (req, res) => {
  const { category, city } = req.query;
  let jobs = DB.jobs.filter(j=>j.status==='active');
  if (category) jobs = jobs.filter(j=>j.category===category);
  if (city) jobs = jobs.filter(j=>j.location?.city?.toLowerCase().includes(city.toLowerCase()));
  jobs = jobs.sort((a,b)=>b.boost_active-a.boost_active || new Date(b.createdAt)-new Date(a.createdAt));
  // Attach employer info
  const withEmp = jobs.map(j=>({ ...j, employer_id:{ _id:j.employer_id, business_name:j.employer_name||'Employer', location:j.location } }));
  res.json({ jobs:withEmp, total:withEmp.length });
});

// Worker job feed — only jobs where bid >= worker ask
app.get('/api/jobs/feed', auth, (req, res) => {
  if (req.user.role!=='worker') return res.status(403).json({ error:'Sirf workers ke liye' });
  const worker = DB.workers.find(w=>w._id===req.user.id);
  if (!worker) return res.status(404).json({ error:'Worker not found' });
  let jobs = DB.jobs.filter(j => j.status==='active' && j.bid_high>=worker.ask_price && j.salary_type===worker.salary_type);
  jobs = jobs.sort((a,b)=>b.boost_active-a.boost_active || new Date(b.createdAt)-new Date(a.createdAt));
  const withEmp = jobs.map(j=>({ ...j, employer_id:{ _id:j.employer_id, business_name:j.employer_name||'Employer', location:j.location } }));
  res.json({ jobs:withEmp, worker_ask:worker.ask_price, total:withEmp.length });
});

// Employer's own jobs
app.get('/api/jobs/my-jobs', auth, (req, res) => {
  const jobs = DB.jobs.filter(j=>j.employer_id===req.user.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  res.json({ jobs, total:jobs.length });
});

// Get eligible workers for a job (BID-ASK engine)
app.get('/api/jobs/:id/eligible-workers', auth, (req, res) => {
  const job = DB.jobs.find(j=>j._id===req.params.id);
  if (!job) return res.status(404).json({ error:'Job not found' });
  job.views_count = (job.views_count||0)+1;
  const workers = bidAskEngine(job);
  res.json({ workers, total:workers.length, job });
});

// Boost a job
app.post('/api/jobs/:id/boost', auth, (req, res) => {
  const job = DB.jobs.find(j=>j._id===req.params.id && j.employer_id===req.user.id);
  if (!job) return res.status(404).json({ error:'Job not found' });
  const days = { basic:3, super:7, max:15 };
  job.boost_active = true;
  job.boost_plan = req.body.plan||'basic';
  job.boost_expires = new Date(Date.now()+(days[job.boost_plan]||3)*86400000);
  res.json({ message:`Job ko ${job.boost_plan} boost mil gaya!`, job });
});

// Like a worker (employer)
app.post('/api/jobs/:id/like-worker/:workerId', auth, (req, res) => {
  if (req.user.role!=='employer') return res.status(403).json({ error:'Sirf employers ke liye' });
  const job = DB.jobs.find(j=>j._id===req.params.id);
  if (!job) return res.status(404).json({ error:'Job not found' });
  const existing = DB.matches.find(m=>m.employer_id===req.user.id && m.worker_id===req.params.workerId && m.job_id===req.params.id);
  if (existing) return res.status(409).json({ error:'Pehle se like kar diya hai', match:existing });
  const worker = DB.workers.find(w=>w._id===req.params.workerId);
  const score = worker ? matchScore(worker, job) : 0;
  const match = { _id:uid(), employer_id:req.user.id, worker_id:req.params.workerId, job_id:req.params.id, match_score:score, status:'employer_liked', contact_unlocked:false, expires_at:new Date(Date.now()+72*3600000), createdAt:new Date() };
  DB.matches.push(match);
  job.likes_count = (job.likes_count||0)+1;
  res.status(201).json({ message:'Worker ko like kar diya! Unke accept karne par match hoga.', match });
});

// ── MATCHES ──────────────────────────────────────────────────────

// My matches
app.get('/api/matches/my-matches', auth, (req, res) => {
  let matches;
  if (req.user.role==='worker') {
    matches = DB.matches.filter(m=>m.worker_id===req.user.id && m.status!=='expired').map(m=>{
      const emp = DB.employers.find(e=>e._id===m.employer_id);
      const job = DB.jobs.find(j=>j._id===m.job_id);
      return { ...m, employer_id:{ _id:m.employer_id, business_name:emp?.business_name, location:emp?.location, rating:emp?.rating, business_type:emp?.business_type }, job_id:{ _id:m.job_id, title:job?.title, category:job?.category, bid_high:job?.bid_high, salary_type:job?.salary_type, description:job?.description } };
    });
  } else {
    matches = DB.matches.filter(m=>m.employer_id===req.user.id && m.status!=='expired').map(m=>{
      const wk = DB.workers.find(w=>w._id===m.worker_id);
      const job = DB.jobs.find(j=>j._id===m.job_id);
      return { ...m, worker_id:{ _id:m.worker_id, name:wk?.name, skill_category:wk?.skill_category, ask_price:wk?.ask_price, location:wk?.location, rating:wk?.rating, is_verified:wk?.is_verified, phone:m.contact_unlocked?wk?.phone:undefined }, job_id:{ _id:m.job_id, title:job?.title, category:job?.category, bid_high:job?.bid_high } };
    });
  }
  matches = matches.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  res.json({ matches, total:matches.length });
});

// Accept match (worker)
app.patch('/api/matches/:id/accept', auth, (req, res) => {
  const match = DB.matches.find(m=>m._id===req.params.id && m.worker_id===req.user.id);
  if (!match) return res.status(404).json({ error:'Match not found' });
  match.status = 'mutual';
  match.contact_unlocked = true;
  res.json({ message:'🎉 Match confirm ho gaya! Employer ko notify kar diya.', match });
});

// Reject match
app.patch('/api/matches/:id/reject', auth, (req, res) => {
  const match = DB.matches.find(m=>m._id===req.params.id);
  if (!match) return res.status(404).json({ error:'Match not found' });
  match.status = 'rejected';
  res.json({ message:'Match decline kar diya', match });
});

// ── BID-ASK ENGINE ───────────────────────────────────────────────
function bidAskEngine(job) {
  return DB.workers
    .filter(w => w.is_available && w.skill_category===job.category && w.ask_price<=job.bid_high && w.salary_type===job.salary_type)
    .map(w => ({ ...w, match_score:matchScore(w,job), distance_km:+haversine(w.location?.lat||26.85,w.location?.lng||80.95,job.location?.lat||26.85,job.location?.lng||80.95).toFixed(1) }))
    .filter(w => w.distance_km <= (job.radius_km||10))
    .sort((a,b)=>b.match_score-a.match_score);
}

// ── CATCH ALL → serve frontend ───────────────────────────────────
app.get('*', (_, res) => res.send(HTML));

// ── START ────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`\n✅ RozgarConnect running at http://localhost:${PORT}\n`));
