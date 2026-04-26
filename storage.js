/* ===== Storage layer (localStorage abstraction) ===== */
const SF = {
  KEY_USERS: 'sf_users',
  KEY_SESSION: 'sf_session',
  KEY_DATA: 'sf_data', // { [userId]: { projects: [...], settings: {...} } }

  // ---------- Users ----------
  getUsers() { return JSON.parse(localStorage.getItem(this.KEY_USERS) || '[]'); },
  saveUsers(u) { localStorage.setItem(this.KEY_USERS, JSON.stringify(u)); },

  hash(str) {
    // Lightweight non-cryptographic hash. (Static-site only — not for real auth.)
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return (h >>> 0).toString(36);
  },

  signup({ username, password, displayName }) {
    const users = this.getUsers();
    if (users.find(u => u.username === username)) throw new Error('이미 존재하는 아이디입니다.');
    const user = {
      id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      username,
      passHash: this.hash(password),
      displayName: displayName || username,
      createdAt: Date.now()
    };
    users.push(user);
    this.saveUsers(users);
    this._initData(user.id);
    this.login(username, password);
    return user;
  },

  login(username, password) {
    const u = this.getUsers().find(x => x.username === username);
    if (!u || u.passHash !== this.hash(password)) throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    localStorage.setItem(this.KEY_SESSION, u.id);
    return u;
  },

  logout() { localStorage.removeItem(this.KEY_SESSION); },

  currentUser() {
    const id = localStorage.getItem(this.KEY_SESSION);
    if (!id) return null;
    return this.getUsers().find(u => u.id === id) || null;
  },

  requireAuth() {
    if (!this.currentUser()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  // ---------- Per-user data ----------
  _allData() { return JSON.parse(localStorage.getItem(this.KEY_DATA) || '{}'); },
  _saveAll(d) { localStorage.setItem(this.KEY_DATA, JSON.stringify(d)); },

  _initData(uid) {
    const d = this._allData();
    if (!d[uid]) {
      d[uid] = {
        projects: [],
        settings: { theme: 'dark', font: 'Noto Sans KR', accent: '#7c5cff' }
      };
      this._saveAll(d);
    }
  },

  data() {
    const u = this.currentUser();
    if (!u) return null;
    const all = this._allData();
    if (!all[u.id]) this._initData(u.id);
    return this._allData()[u.id];
  },

  saveData(d) {
    const u = this.currentUser();
    if (!u) return;
    const all = this._allData();
    all[u.id] = d;
    this._saveAll(all);
  },

  // ---------- Projects ----------
  getProjects() { return this.data()?.projects || []; },
  getProject(id) { return this.getProjects().find(p => p.id === id); },

  addProject({ title, genre, summary, cover }) {
    const d = this.data();
    const p = {
      id: 'p_' + Date.now().toString(36),
      title, genre: genre || '미지정', summary: summary || '', cover: cover || '',
      createdAt: Date.now(),
      characters: [],
      tree: { nodes: [], edges: [] },
      world: { sections: [] },
      timeline: [],
      docs: [], // { id, title, content, type: 'md'|'html' }
      genres: [] // custom genre tags
    };
    d.projects.push(p);
    this.saveData(d);
    return p;
  },

  updateProject(id, patch) {
    const d = this.data();
    const i = d.projects.findIndex(p => p.id === id);
    if (i < 0) return;
    d.projects[i] = { ...d.projects[i], ...patch };
    this.saveData(d);
    return d.projects[i];
  },

  deleteProject(id) {
    const d = this.data();
    d.projects = d.projects.filter(p => p.id !== id);
    this.saveData(d);
  },

  // ---------- Characters ----------
  addCharacter(projId, char) {
    const d = this.data();
    const p = d.projects.find(p => p.id === projId);
    if (!p) return;
    char.id = 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
    char.createdAt = Date.now();
    p.characters.push(char);
    this.saveData(d);
    return char;
  },
  updateCharacter(projId, charId, patch) {
    const d = this.data();
    const p = d.projects.find(p => p.id === projId);
    if (!p) return;
    const i = p.characters.findIndex(c => c.id === charId);
    if (i < 0) return;
    p.characters[i] = { ...p.characters[i], ...patch };
    this.saveData(d);
    return p.characters[i];
  },
  deleteCharacter(projId, charId) {
    const d = this.data();
    const p = d.projects.find(p => p.id === projId);
    if (!p) return;
    p.characters = p.characters.filter(c => c.id !== charId);
    this.saveData(d);
  },

  // ---------- Settings ----------
  getSettings() { return this.data()?.settings || { theme: 'dark', font: 'Noto Sans KR', accent: '#7c5cff' }; },
  saveSettings(s) {
    const d = this.data();
    d.settings = { ...d.settings, ...s };
    this.saveData(d);
  },

  // ---------- Backup ----------
  exportJSON() {
    const u = this.currentUser();
    if (!u) return null;
    return JSON.stringify({ user: { username: u.username, displayName: u.displayName }, data: this.data() }, null, 2);
  },

  importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj.data) throw new Error('잘못된 백업 파일입니다.');
    const u = this.currentUser();
    if (!u) throw new Error('로그인이 필요합니다.');
    const all = this._allData();
    all[u.id] = obj.data;
    this._saveAll(all);
  }
};

// ---------- Helpers ----------
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
function uid() { return Math.random().toString(36).slice(2, 10); }
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );
}
function getQuery(name) { return new URLSearchParams(location.search).get(name); }

function toast(msg, type = '') {
  let wrap = $('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function applyTheme() {
  const s = SF.getSettings();
  if (!s) return;
  document.documentElement.setAttribute('data-theme', s.theme || 'dark');
  if (s.font) document.body.style.fontFamily = `'${s.font}', system-ui, sans-serif`;
  if (s.accent) {
    document.documentElement.style.setProperty('--primary', s.accent);
    document.documentElement.style.setProperty('--primary-hover', s.accent);
  }
}
