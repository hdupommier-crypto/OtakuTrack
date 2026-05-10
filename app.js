// ===== DATA =====
const INITIAL_ANIMES = [
  { id:'a1', title:'Black Clover', type:'anime', seasons:[
    {name:'s1', eps:170, watched:170, epDur:20},
    {name:'SP', eps:1, watched:1, epDur:20},
    {name:'Film', eps:1, watched:1, epDur:110}
  ]},
  { id:'a2', title:'Sword Art Online', type:'anime', seasons:[
    {name:'s1', eps:25, watched:25, epDur:20},
    {name:'s2', eps:24, watched:24, epDur:20},
    {name:'GGO s1', eps:12, watched:12, epDur:20},
    {name:'GGO s2', eps:12, watched:0, epDur:20},
    {name:'s3', eps:24, watched:24, epDur:20},
    {name:'s4', eps:23, watched:23, epDur:20},
    {name:'Films', eps:4, watched:4, epDur:110}
  ]},
];

const INITIAL_MANGAS = [
  { id:'m1', title:'Gloutons et Dragons', type:'manga', total:11, read:11, notes:'' },
  { id:'m2', title:'Fullmetal Alchemist', type:'manga', total:27, read:27, notes:'' },
];

// ===== STATE =====
let currentTab = 'anime';
let currentFilter = 'all';
let editingId = null;
let modalType = 'anime';
let seasonFields = [];

let DB = loadData();
let githubToken = localStorage.getItem('otakutrack-token') || null;
let gistId = localStorage.getItem('otakutrack-gistid') || null;

// ===== STORAGE =====
function loadData() {
  try {
    const stored = localStorage.getItem('otakutrack-data');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return { animes: INITIAL_ANIMES, mangas: INITIAL_MANGAS };
}

function saveData(data) {
  localStorage.setItem('otakutrack-data', JSON.stringify(data));
  localStorage.setItem('otakutrack-lastupdate', Date.now());
  updateSyncStatus();
  syncToGithub();
}

// ===== GITHUB SYNC =====
async function syncToGithub() {
  if (!githubToken || !gistId) return;
  
  updateSyncStatus('syncing');
  try {
    const content = JSON.stringify(DB, null, 2);
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'otakutrack-data.json': { content }
        }
      })
    });
    if (response.ok) {
      localStorage.setItem('otakutrack-lastupdate', Date.now());
      updateSyncStatus('synced');
    }
  } catch(e) {
    console.error('Sync error:', e);
    updateSyncStatus('error');
  }
}

async function syncFromGithub() {
  if (!githubToken || !gistId) return;
  
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 'Authorization': `token ${githubToken}` }
    });
    if (response.ok) {
      const gist = await response.json();
      const file = gist.files['otakutrack-data.json'];
      if (file) {
        DB = JSON.parse(file.content);
        localStorage.setItem('otakutrack-data', file.content);
        renderAll();
        updateSyncStatus('synced');
      }
    }
  } catch(e) {
    console.error('Sync error:', e);
  }
}

async function testSync() {
  if (!githubToken || !gistId) {
    alert('Non connecté');
    return;
  }
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 'Authorization': `token ${githubToken}` }
    });
    if (response.ok) {
      alert('✅ Connexion à GitHub OK !');
    } else {
      alert('❌ Erreur: ' + response.status);
    }
  } catch(e) {
    alert('❌ Erreur: ' + e.message);
  }
}

// ===== SYNC STATUS =====
function updateSyncStatus(status = null) {
  const dot = document.getElementById('sync-dot');
  const text = document.getElementById('sync-text');
  
  if (status === 'syncing') {
    dot.className = 'sync-dot syncing';
    text.textContent = 'Sync...';
  } else if (status === 'synced' || (githubToken && gistId)) {
    dot.className = 'sync-dot synced';
    text.textContent = 'Synced';
  } else if (status === 'error') {
    dot.className = 'sync-dot';
    text.textContent = 'Erreur';
  } else {
    dot.className = 'sync-dot';
    text.textContent = 'Local';
  }

  // Mise à jour tab Etat
  const connected = document.getElementById('status-connected');
  if (connected) {
    if (githubToken && gistId) {
      connected.textContent = '✓ Connecté';
      connected.className = 'status-value connected';
    } else {
      connected.textContent = 'Déconnecté';
      connected.className = 'status-value error';
    }
  }
  
  const lastSync = document.getElementById('status-last-sync');
  if (lastSync) {
    const ts = localStorage.getItem('otakutrack-lastupdate');
    if (ts) {
      const date = new Date(parseInt(ts));
      lastSync.textContent = date.toLocaleTimeString();
    } else {
      lastSync.textContent = 'Jamais';
    }
  }

  const storage = document.getElementById('status-storage');
  if (storage) {
    const total = DB.animes.length + DB.mangas.length;
    storage.textContent = total + ' items';
  }

  const gistIdEl = document.getElementById('status-gist-id');
  if (gistIdEl) {
    gistIdEl.textContent = gistId ? gistId.substring(0, 8) + '...' : 'N/A';
  }
}

// ===== QR CODE =====
function generateQRCode() {
  if (!githubToken) {
    alert('Entre un token d\'abord');
    return;
  }
  
  const container = document.getElementById('qr-code-container');
  container.innerHTML = '';
  
  const qrData = {
    token: githubToken,
    gist: gistId || 'new'
  };
  const qrText = JSON.stringify(qrData);
  
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  script.onload = () => {
    new QRCode(container, {
      text: qrText,
      width: 200,
      height: 200,
      colorDark: '#e63946',
      colorLight: '#ffffff'
    });
  };
  document.head.appendChild(script);
}

// ===== CONFIG MODAL =====
function showConfigModal() {
  document.getElementById('config-modal').classList.add('open');
  document.getElementById('config-token').value = githubToken || '';
  updateSyncStatus();
}

function closeConfigModal() {
  document.getElementById('config-modal').classList.remove('open');
}

function switchConfigTab(tab) {
  document.querySelectorAll('.config-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.config-tab').forEach(el => el.classList.remove('active'));
  
  document.getElementById('tab-' + tab).classList.add('active');
  event.target.classList.add('active');
  
  if (tab === 'qr') generateQRCode();
}

async function connectSync() {
  const token = document.getElementById('config-token').value.trim();
  if (!token) {
    alert('Entre un token');
    return;
  }
  
  try {
    // Test token
    const response = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}` }
    });
    if (!response.ok) throw new Error('Token invalide');
    
    // Créer ou récupérer le Gist
    if (!gistId) {
      const createRes = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'OtakuTrack - Données personnelles',
          public: false,
          files: {
            'otakutrack-data.json': {
              content: JSON.stringify(DB, null, 2)
            }
          }
        })
      });
      if (!createRes.ok) throw new Error('Erreur création Gist');
      const gist = await createRes.json();
      gistId = gist.id;
      localStorage.setItem('otakutrack-gistid', gistId);
    }
    
    githubToken = token;
    localStorage.setItem('otakutrack-token', token);
    
    await syncToGithub();
    alert('✅ Connecté à GitHub !');
    updateSyncStatus('synced');
    
  } catch(e) {
    alert('❌ Erreur: ' + e.message);
  }
}

function disconnectSync() {
  if (confirm('Déconnecter GitHub ? (les données locales restent)')) {
    githubToken = null;
    gistId = null;
    localStorage.removeItem('otakutrack-token');
    localStorage.removeItem('otakutrack-gistid');
    updateSyncStatus();
    closeConfigModal();
  }
}

// ===== UTILS =====
function getStatus(item) {
  if (item.type === 'manga') {
    if (item.total === 0) return 'pas-commence';
    if (item.read >= item.total) return 'fini';
    if (item.read > 0) return 'en-cours';
    return 'pas-commence';
  }
  const totalEps = item.seasons.reduce((s,se) => s + se.eps, 0);
  const watchedEps = item.seasons.reduce((s,se) => s + se.watched, 0);
  if (totalEps === 0) return 'pas-commence';
  if (watchedEps >= totalEps) return 'fini';
  if (watchedEps > 0) return 'en-cours';
  return 'pas-commence';
}

function getProgress(item) {
  if (item.type === 'manga') {
    return item.total > 0 ? item.read / item.total : 0;
  }
  const total = item.seasons.reduce((s,se) => s + se.eps, 0);
  const watched = item.seasons.reduce((s,se) => s + se.watched, 0);
  return total > 0 ? watched / total : 0;
}

function formatTime(mins) {
  if (mins < 60) return mins + 'min';
  const h = Math.floor(mins/60);
  if (h < 24) return h + 'h';
  const d = Math.floor(h/24);
  const rh = h % 24;
  return d + 'j ' + (rh > 0 ? rh + 'h' : '');
}

function badgeHTML(status) {
  const map = {
    'fini': ['badge-fini', '✓ Fini'],
    'en-cours': ['badge-en-cours', '⟳ En cours'],
    'pas-commence': ['badge-pas-commence', '○ À voir']
  };
  const [cls, label] = map[status];
  return `<span class="card-badge ${cls}">${label}</span>`;
}

function genId() {
  return 'x' + Math.random().toString(36).substr(2, 9);
}

// ===== RENDER =====
function renderStats() {
  const totalEpsWatched = DB.animes.reduce((sum, a) =>
    sum + a.seasons.reduce((s, se) => s + se.watched, 0), 0);
  const totalTimeMin = DB.animes.reduce((sum, a) =>
    sum + a.seasons.reduce((s, se) => s + se.watched * se.epDur, 0), 0);
  const totalTomesLus = DB.mangas.reduce((sum, m) => sum + m.read, 0);
  const animesTermines = DB.animes.filter(a => getStatus(a) === 'fini').length;
  const mangasTermines = DB.mangas.filter(m => getStatus(m) === 'fini').length;

  document.getElementById('hdr-eps').textContent = totalEpsWatched;
  document.getElementById('hdr-tomes').textContent = totalTomesLus;
  document.getElementById('hdr-time').textContent = formatTime(totalTimeMin);

  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Épisodes vus</div>
      <div class="stat-value accent">${totalEpsWatched}</div>
      <div class="stat-sub">${formatTime(totalTimeMin)} de visionnage</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Animes terminés</div>
      <div class="stat-value green">${animesTermines}</div>
      <div class="stat-sub">sur ${DB.animes.length} titres</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tomes lus</div>
      <div class="stat-value purple">${totalTomesLus}</div>
      <div class="stat-sub">manga</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Mangas terminés</div>
      <div class="stat-value blue">${mangasTermines}</div>
      <div class="stat-sub">sur ${DB.mangas.length} séries</div>
    </div>
  `;
}

function renderAll() {
  renderStats();
  const search = document.getElementById('search-input').value.toLowerCase();
  const data = currentTab === 'anime' ? DB.animes : DB.mangas;

  document.getElementById('pill-anime').textContent = DB.animes.length;
  document.getElementById('pill-manga').textContent = DB.mangas.length;

  let filtered = data.filter(item => {
    const status = getStatus(item);
    if (currentFilter !== 'all' && status !== currentFilter) return false;
    if (search && !item.title.toLowerCase().includes(search)) return false;
    return true;
  });

  const grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="icon">📭</div>
      <p>Aucun résultat</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => renderCard(item)).join('');
}

function renderCard(item) {
  const status = getStatus(item);
  const progress = getProgress(item);
  const color = item.type === 'manga' ? 'var(--manga)' : 'var(--anime)';

  if (item.type === 'manga') {
    const pct = Math.round(progress * 100);
    return `<div class="card" style="--card-color:${color}">
      <div class="card-header">
        <div class="card-title">${item.title}</div>
        ${badgeHTML(status)}
      </div>
      <div class="progress-wrap">
        <div class="progress-label">
          <span>Tomes lus</span>
          <strong>${item.read} / ${item.total}</strong>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      ${item.notes ? `<div style="font-size:0.72rem;color:var(--text-dim);margin-top:0.5rem;">📝 ${item.notes}</div>` : ''}
      <div class="card-actions">
        ${item.read < item.total ? `<button class="btn-sm" onclick="quickUpdateManga('${item.id}',1)">+1 tome</button>` : ''}
        <button class="btn-sm" onclick="editEntry('${item.id}')">Modifier</button>
        <button class="btn-sm danger" onclick="deleteEntry('${item.id}')">Supprimer</button>
      </div>
    </div>`;
  }

  const totalEps = item.seasons.reduce((s,se) => s + se.eps, 0);
  const watchedEps = item.seasons.reduce((s,se) => s + se.watched, 0);
  const totalTime = item.seasons.reduce((s,se) => s + se.watched * se.epDur, 0);
  const pct = totalEps > 0 ? Math.round(watchedEps/totalEps*100) : 0;

  const seasonsDetailHTML = item.seasons.map((se, idx) => {
    const isDone = se.watched >= se.eps;
    const sePct = se.eps > 0 ? Math.round(se.watched / se.eps * 100) : 0;
    return `<div class="season-row">
      <span class="season-row-name">${se.name}</span>
      <div class="season-row-bar"><div class="season-row-fill" style="width:${sePct}%"></div></div>
      <span class="season-row-count${isDone ? ' done' : ''}">${se.watched}/${se.eps}</span>
      ${isDone
        ? `<span class="season-done-badge">fini</span>`
        : `<button class="btn-ep" onclick="quickEpisode('${item.id}',${idx})">+1 ep</button>`
      }
    </div>`;
  }).join('');

  const inProgressCount = item.seasons.filter(se => se.watched > 0 && se.watched < se.eps).length;
  const notStartedCount = item.seasons.filter(se => se.watched === 0 && se.eps > 0).length;
  const toggleLabel = item.seasons.length === 1 ? '1 saison' : `${item.seasons.length} saisons`;

  return `<div class="card" style="--card-color:${color}">
    <div class="card-header">
      <div class="card-title">${item.title}</div>
      ${badgeHTML(status)}
    </div>
    ${item.seasons.length > 0 ? `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Épisodes</span>
        <strong>${watchedEps} / ${totalEps} · ${formatTime(totalTime)}</strong>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="seasons-toggle" onclick="toggleSeasons('${item.id}', this)" id="toggle-${item.id}">
      <span class="toggle-arrow">&#9654;</span>
      <span>${toggleLabel}</span>
      ${inProgressCount > 0 ? `<span style="color:var(--accent2);font-size:0.68rem;">&middot; ${inProgressCount} en cours</span>` : ''}
      ${notStartedCount > 0 && inProgressCount === 0 ? `<span style="color:var(--text-dim);font-size:0.68rem;">&middot; ${notStartedCount} &agrave; voir</span>` : ''}
    </div>
    <div class="seasons-detail" id="detail-${item.id}">${seasonsDetailHTML}</div>`
    : `<div class="card-subtitle" style="margin-top:0.5rem">Aucune saison renseignée</div>`}
    <div class="card-actions">
      <button class="btn-sm" onclick="editEntry('${item.id}')">Modifier</button>
      <button class="btn-sm danger" onclick="deleteEntry('${item.id}')">Supprimer</button>
    </div>
  </div>`;
}

// ===== INTERACTIONS =====
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-anime').classList.toggle('active', tab === 'anime');
  document.getElementById('tab-manga').classList.toggle('active', tab === 'manga');
  renderAll();
}

function setFilter(f) {
  currentFilter = f;
  ['all','fini','en-cours','pas-commence'].forEach(id => {
    document.getElementById('filter-' + id).classList.toggle('active', id === f);
  });
  renderAll();
}

function quickUpdateManga(id, delta) {
  const m = DB.mangas.find(x => x.id === id);
  if (!m) return;
  m.read = Math.max(0, Math.min(m.total, m.read + delta));
  saveData(DB);
  renderAll();
}

function quickEpisode(animeId, seasonIdx) {
  const a = DB.animes.find(x => x.id === animeId);
  if (!a) return;
  const se = a.seasons[seasonIdx];
  if (se.watched < se.eps) {
    se.watched++;
    saveData(DB);
    const detailEl = document.getElementById('detail-' + animeId);
    if (detailEl && detailEl.classList.contains('open')) {
      renderAll();
      const newDetail = document.getElementById('detail-' + animeId);
      const newToggle = document.getElementById('toggle-' + animeId);
      if (newDetail && newToggle) {
        newDetail.classList.add('open');
        newToggle.classList.add('open');
      }
    } else {
      renderAll();
    }
  }
}

function toggleSeasons(animeId, toggleEl) {
  const detail = document.getElementById('detail-' + animeId);
  if (!detail) return;
  detail.classList.toggle('open');
  toggleEl.classList.toggle('open');
}

function deleteEntry(id) {
  if (!confirm('Supprimer cette entrée ?')) return;
  DB.animes = DB.animes.filter(x => x.id !== id);
  DB.mangas = DB.mangas.filter(x => x.id !== id);
  saveData(DB);
  renderAll();
}

// ===== MODAL =====
function openModal(id = null) {
  editingId = id;
  seasonFields = [];

  if (id) {
    const item = [...DB.animes, ...DB.mangas].find(x => x.id === id);
    document.getElementById('modal-title').textContent = 'Modifier';
    selectModalType(item.type);
    if (item.type === 'anime') {
      document.getElementById('m-title').value = item.title;
      document.getElementById('seasons-list').innerHTML = '';
      item.seasons.forEach(se => addSeasonField(se));
    } else {
      document.getElementById('m-manga-title').value = item.title;
      document.getElementById('m-total').value = item.total;
      document.getElementById('m-read').value = item.read;
      document.getElementById('m-notes').value = item.notes || '';
    }
  } else {
    document.getElementById('modal-title').textContent = 'Ajouter';
    selectModalType(currentTab === 'manga' ? 'manga' : 'anime');
    document.getElementById('m-title').value = '';
    document.getElementById('m-manga-title').value = '';
    document.getElementById('m-total').value = '';
    document.getElementById('m-read').value = '';
    document.getElementById('m-notes').value = '';
  }

  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editingId = null;
}

function selectModalType(type) {
  modalType = type;
  document.getElementById('mtype-anime').classList.toggle('active', type === 'anime');
  document.getElementById('mtype-manga').classList.toggle('active', type === 'manga');
  document.getElementById('anime-form').style.display = type === 'anime' ? '' : 'none';
  document.getElementById('manga-form').style.display = type === 'manga' ? '' : 'none';
  if (type === 'anime' && seasonFields.length === 0) {
    document.getElementById('seasons-list').innerHTML = '';
    addSeasonField();
  }
}

function addSeasonField(se = null) {
  const idx = seasonFields.length;
  seasonFields.push(se || { name:'', eps:12, watched:0, epDur:20 });
  const list = document.getElementById('seasons-list');
  const div = document.createElement('div');
  div.id = 'sf-' + idx;
  div.style.cssText = 'display:grid;grid-template-columns:1fr 60px 60px 60px 30px;gap:6px;margin-bottom:6px;align-items:end;';
  div.innerHTML = `
    <div><label style="font-size:0.7rem;color:var(--text-dim);display:block;margin-bottom:3px;">Nom</label>
      <input class="form-input" style="padding:0.4rem 0.6rem" value="${seasonFields[idx].name}" oninput="updateSF(${idx},'name',this.value)"></div>
    <div><label style="font-size:0.7rem;color:var(--text-dim);display:block;margin-bottom:3px;">Eps</label>
      <input class="form-input" style="padding:0.4rem 0.6rem" type="number" min="0" value="${seasonFields[idx].eps}" oninput="updateSF(${idx},'eps',+this.value)"></div>
    <div><label style="font-size:0.7rem;color:var(--text-dim);display:block;margin-bottom:3px;">Vus</label>
      <input class="form-input" style="padding:0.4rem 0.6rem" type="number" min="0" value="${seasonFields[idx].watched}" oninput="updateSF(${idx},'watched',+this.value)"></div>
    <div><label style="font-size:0.7rem;color:var(--text-dim);display:block;margin-bottom:3px;">Min/ep</label>
      <input class="form-input" style="padding:0.4rem 0.6rem" type="number" min="1" value="${seasonFields[idx].epDur}" oninput="updateSF(${idx},'epDur',+this.value)"></div>
    <button class="btn-sm danger" style="margin-top:18px;" onclick="removeSF(${idx})">✕</button>
  `;
  list.appendChild(div);
}

function updateSF(idx, key, val) { seasonFields[idx][key] = val; }
function removeSF(idx) {
  const el = document.getElementById('sf-' + idx);
  if (el) el.remove();
  seasonFields[idx] = null;
}

function saveEntry() {
  if (modalType === 'anime') {
    const title = document.getElementById('m-title').value.trim();
    if (!title) return alert('Titre requis');
    const seasons = seasonFields.filter(Boolean).map(se => ({
      name: se.name || 's1',
      eps: +se.eps || 0,
      watched: Math.min(+se.watched || 0, +se.eps || 0),
      epDur: +se.epDur || 20
    }));
    if (editingId) {
      const a = DB.animes.find(x => x.id === editingId);
      if (a) { a.title = title; a.seasons = seasons; }
    } else {
      DB.animes.push({ id: genId(), title, type: 'anime', seasons });
    }
  } else {
    const title = document.getElementById('m-manga-title').value.trim();
    const total = parseInt(document.getElementById('m-total').value) || 0;
    const read = Math.min(parseInt(document.getElementById('m-read').value) || 0, total);
    const notes = document.getElementById('m-notes').value.trim();
    if (!title) return alert('Titre requis');
    if (editingId) {
      const m = DB.mangas.find(x => x.id === editingId);
      if (m) { m.title = title; m.total = total; m.read = read; m.notes = notes; }
    } else {
      DB.mangas.push({ id: genId(), title, type: 'manga', total, read, notes });
    }
  }
  saveData(DB);
  closeModal();
  if (modalType !== currentTab) switchTab(modalType);
  renderAll();
}

function editEntry(id) { openModal(id); }

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('config-modal').addEventListener('click', function(e) {
  if (e.target === this) closeConfigModal();
});

// ===== INIT =====
renderAll();
updateSyncStatus();
if (githubToken && gistId) syncFromGithub();
