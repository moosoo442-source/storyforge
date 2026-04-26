/* ============================================================
 * StoryForge — Storage layer (localStorage abstraction)
 * No external dependencies. Safe to load multiple times.
 * ============================================================ */
(function (global) {
  'use strict';

  if (global.SF) return; // idempotent

  const KEY_USERS   = 'sf_users';
  const KEY_SESSION = 'sf_session';
  const KEY_DATA    = 'sf_data';

  function getJSON(k, fb) {
    try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); }
    catch (e) { console.warn('[SF] parse err', k, e); return fb; }
  }
  function setJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  function uid(prefix) {
    return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  const SF = {
    /* ---------- Users ---------- */
    _users()       { return getJSON(KEY_USERS, []); },
    _saveUsers(u)  { setJSON(KEY_USERS, u); },
    hasAnyUser()   { return this._users().length > 0; },

    signup(opts) {
      const username = String(opts.username || '').trim();
      const password = String(opts.password || '');
      const displayName = String(opts.displayName || '').trim() || username;
      if (!username) throw new Error('아이디를 입력하세요.');
      if (username.length < 2) throw new Error('아이디는 2자 이상이어야 합니다.');
      if (password.length < 4) throw new Error('비밀번호는 4자 이상이어야 합니다.');
      const users = this._users();
      if (users.some(u => u.username === username)) {
        throw new Error('이미 존재하는 아이디입니다.');
      }
      const user = {
        id: uid('u_'),
        username,
        passHash: djb2(password + '|' + username),
        displayName,
        createdAt: Date.now()
      };
      users.push(user);
      this._saveUsers(users);
      this._initData(user.id);
      localStorage.setItem(KEY_SESSION, user.id);
      return user;
    },

    login(username, password) {
      username = String(username || '').trim();
      password = String(password || '');
      const u = this._users().find(x => x.username === username);
      if (!u || u.passHash !== djb2(password + '|' + username)) {
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
      localStorage.setItem(KEY_SESSION, u.id);
      return u;
    },

    logout() { localStorage.removeItem(KEY_SESSION); },

    currentUser() {
      const id = localStorage.getItem(KEY_SESSION);
      if (!id) return null;
      return this._users().find(u => u.id === id) || null;
    },

    requireAuth() {
      if (!this.currentUser()) {
        // Avoid redirect loop on the auth page itself
        if (!/index\.html$|\/$/.test(location.pathname)) {
          location.href = 'index.html';
        }
        return false;
      }
      return true;
    },

    updateUser(patch) {
      const u = this.currentUser(); if (!u) return null;
      const users = this._users();
      const i = users.findIndex(x => x.id === u.id);
      users[i] = { ...users[i], ...patch };
      this._saveUsers(users);
      return users[i];
    },

    /* ---------- Per-user data ---------- */
    _all() { return getJSON(KEY_DATA, {}); },
    _saveAll(d) { setJSON(KEY_DATA, d); },

    _initData(uid) {
      const d = this._all();
      if (!d[uid]) {
        d[uid] = {
          projects: [],
          settings: { theme: 'dark', font: 'Noto Sans KR', accent: '#7c5cff' }
        };
        this._saveAll(d);
      }
    },

    data() {
      const u = this.currentUser(); if (!u) return null;
      const all = this._all();
      if (!all[u.id]) { this._initData(u.id); return this._all()[u.id]; }
      return all[u.id];
    },

    saveData(d) {
      const u = this.currentUser(); if (!u) return;
      const all = this._all();
      all[u.id] = d;
      this._saveAll(all);
    },

    /* ---------- Projects ---------- */
    getProjects() { return (this.data() && this.data().projects) || []; },
    getProject(id) { return this.getProjects().find(p => p.id === id) || null; },

    addProject(opts) {
      const d = this.data();
      const p = {
        id: uid('p_'),
        title: opts.title,
        genre: opts.genre || '미지정',
        summary: opts.summary || '',
        cover: opts.cover || '',
        createdAt: Date.now(),
        characters: [],
        relations: [],          // { id, from, to, label, color }
        tree: { nodes: [], edges: [] },
        world: { sections: [] },
        timeline: [],
        items: [],              // { id, name, type, rarity, desc, image, tags }
        gallery: [],            // { id, src, caption }
        docs: [],               // { id, title, content, type:'md'|'html' }
        genres: []              // custom genre tags
      };
      d.projects.push(p);
      this.saveData(d);
      return p;
    },

    updateProject(id, patch) {
      const d = this.data();
      const i = d.projects.findIndex(p => p.id === id);
      if (i < 0) return null;
      d.projects[i] = { ...d.projects[i], ...patch };
      this.saveData(d);
      return d.projects[i];
    },

    deleteProject(id) {
      const d = this.data();
      d.projects = d.projects.filter(p => p.id !== id);
      this.saveData(d);
    },

    /* ---------- Characters ---------- */
    addCharacter(projId, char) {
      const d = this.data();
      const p = d.projects.find(p => p.id === projId); if (!p) return null;
      char.id = uid('c_');
      char.createdAt = Date.now();
      p.characters = p.characters || [];
      p.characters.push(char);
      this.saveData(d);
      return char;
    },

    updateCharacter(projId, charId, patch) {
      const d = this.data();
      const p = d.projects.find(p => p.id === projId); if (!p) return null;
      const i = (p.characters || []).findIndex(c => c.id === charId);
      if (i < 0) return null;
      p.characters[i] = { ...p.characters[i], ...patch };
      this.saveData(d);
      return p.characters[i];
    },

    deleteCharacter(projId, charId) {
      const d = this.data();
      const p = d.projects.find(p => p.id === projId); if (!p) return;
      p.characters = (p.characters || []).filter(c => c.id !== charId);
      // also clean up relations referencing this character
      p.relations = (p.relations || []).filter(r => r.from !== charId && r.to !== charId);
      this.saveData(d);
    },

    /* ---------- Settings ---------- */
    getSettings() {
      const d = this.data();
      return (d && d.settings) || { theme: 'dark', font: 'Noto Sans KR', accent: '#7c5cff' };
    },
    saveSettings(s) {
      const d = this.data(); if (!d) return;
      d.settings = { ...d.settings, ...s };
      this.saveData(d);
    },

    /* ---------- Backup ---------- */
    exportJSON() {
      const u = this.currentUser(); if (!u) return null;
      return JSON.stringify({
        version: 1,
        user: { username: u.username, displayName: u.displayName },
        data: this.data()
      }, null, 2);
    },

    importJSON(text) {
      const obj = JSON.parse(text);
      if (!obj || !obj.data) throw new Error('잘못된 백업 파일입니다.');
      const u = this.currentUser(); if (!u) throw new Error('로그인이 필요합니다.');
      const all = this._all();
      all[u.id] = obj.data;
      this._saveAll(all);
    },

    wipeMyData() {
      const u = this.currentUser(); if (!u) return;
      const all = this._all();
      delete all[u.id];
      this._saveAll(all);
      this._initData(u.id);
    },

    /* ---------- Utils exposed ---------- */
    _uid: uid
  };

  global.SF = SF;
})(window);

/* ---------- DOM helpers (always available) ---------- */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );
}
function escapeAttr(s) {
  return String(s == null ? '' : s).replace(/[<>"&]/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])
  );
}
function getQuery(name) { return new URLSearchParams(location.search).get(name); }

function ensureToastWrap() {
  let w = document.querySelector('.toast-wrap');
  if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
  return w;
}
function toast(msg, type) {
  const w = ensureToastWrap();
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  w.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 250); }, 2600);
}

function applyTheme() {
  const s = SF.getSettings();
  if (!s) return;
  document.documentElement.setAttribute('data-theme', s.theme || 'dark');
  if (s.font) document.body.style.fontFamily =
    `'${s.font}', system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`;
  if (s.accent) {
    document.documentElement.style.setProperty('--primary', s.accent);
    document.documentElement.style.setProperty('--primary-hover', s.accent);
  }
}

/* Global error surface (helpful for debugging on GitHub Pages) */
window.addEventListener('error', e => {
  console.error('[SF error]', e.message, e.filename, e.lineno);
});
