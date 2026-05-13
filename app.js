// ===== DATA LOADING =====
let DB = { animes: [], mangas: [] };
let dbLoaded = false;
let supabaseClient = null;

// Initialisation Supabase
let SUPABASE_URL = 'https://VOTRE_PROJET.supabase.co';
let SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON';

async function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase JS non chargé');
    return false;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

async function loadDatabase() {
  // Essayer de charger depuis Supabase en premier
  if (supabaseClient) {
    try {
      const { data: animes, error: err1 } = await supabaseClient.from('animes').select('*');
      const { data: mangas, error: err2 } = await supabaseClient.from('mangas').select('*');
      
      if (!err1 && !err2) {
        DB = { 
          animes: animes || [], 
          mangas: mangas || [] 
        };
        dbLoaded = true;
        renderAll();
        return;
      }
    } catch (error) {
      console.log('Pas de données dans Supabase, utilisation du local');
    }
  }
  
  // Fallback: charger depuis db.json local
  try {
    const response = await fetch('db.json');
    if (!response.ok) throw new Error('Erreur chargement db.json');
    DB = await response.json();
    dbLoaded = true;
    renderAll();
  } catch (error) {
    console.error('Erreur DB:', error);
    DB = { animes: [], mangas: [] };
    renderAll();
  }
}

// ===== STATE =====
let currentTab = 'anime';
let currentFilter = 'all';
let editingId = null;
let modalType = 'anime';
let githubToken = null;
let gistId = null;
let useSupabase = false;

// ===== SUPABASE SYNC =====
async function syncToSupabase() {
  if (!supabaseClient || !useSupabase) return;
  
  const dot = document.getElementById('sync-dot');
  dot.className = 'sync-dot syncing';
  
  try {
    // Supprimer toutes les données existantes et réinsérer
    await supabaseClient.from('animes').delete().neq('id', '');
    await supabaseClient.from('mangas').delete().neq('id', '');
    
    // Insérer les nouvelles données
    if (DB.animes.length > 0) {
      await supabaseClient.from('animes').insert(DB.animes);
    }
    if (DB.mangas.length > 0) {
      await supabaseClient.from('mangas').insert(DB.mangas);
    }
    
    dot.className = 'sync-dot synced';
    localStorage.setItem('otakutrack-lastsync', new Date().toISOString());
  } catch (error) {
    console.error('Erreur sync Supabase:', error);
    dot.className = 'sync-dot';
  }
}

async function syncFromSupabase() {
  if (!supabaseClient || !useSupabase) return;
  
  try {
    const { data: animes, error: err1 } = await supabaseClient.from('animes').select('*');
    const { data: mangas, error: err2 } = await supabaseClient.from('mangas').select('*');
    
    if (!err1 && !err2) {
      DB = { 
        animes: animes || [], 
        mangas: mangas || [] 
      };
      renderAll();
      localStorage.setItem('otakutrack-lastsync', new Date().toISOString());
    }
  } catch (error) {
    console.error('Erreur sync Supabase:', error);
  }
}

async function syncData() {
  if (useSupabase && supabaseClient) {
    await syncToSupabase();
  } else if (githubToken) {
    await syncToGithub();
  }
}

// ===== GITHUB SYNC =====
function loadConfig() {
  const stored = localStorage.getItem('otakutrack-config');
  if (stored) {
    try {
      const config = JSON.parse(stored);
      githubToken = config.token || null;
      gistId = config.gistId || null;
      useSupabase = config.useSupabase || false;
      // Charger les identifiants Supabase s'ils existent
      if (config.supabaseUrl) SUPABASE_URL = config.supabaseUrl;
      if (config.supabaseKey) SUPABASE_ANON_KEY = config.supabaseKey;
      updateSyncIndicator();
    } catch(e) {}
  }
}

function saveConfig() {
  const config = { 
    token: githubToken, 
    gistId: gistId, 
    useSupabase: useSupabase,
    supabaseUrl: SUPABASE_URL !== 'https://VOTRE_PROJET.supabase.co' ? SUPABASE_URL : null,
    supabaseKey: SUPABASE_ANON_KEY !== 'VOTRE_CLE_ANON' ? SUPABASE_ANON_KEY : null
  };
  localStorage.setItem('otakutrack-config', JSON.stringify(config));
}

function updateSyncIndicator() {
  const dot = document.getElementById('sync-dot');
  const text = document.getElementById('sync-text');
  if (useSupabase && supabaseClient) {
    dot.className = 'sync-dot synced';
    text.textContent = 'Supabase';
  } else if (githubToken) {
    dot.className = 'sync-dot synced';
    text.textContent = 'Connecté';
  } else {
    dot.className = 'sync-dot';
    text.textContent = 'Local';
  }
}

async function syncToGithub() {
  if (!githubToken) return;
  
  const dot = document.getElementById('sync-dot');
  dot.className = 'sync-dot syncing';
  
  try {
    if (!gistId) {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          description: 'OtakuTrack Data',
          public: false,
          files: {
            'otakutrack.json': {
              content: JSON.stringify(DB, null, 2)
            }
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        gistId = data.id;
        saveConfig();
      }
    } else {
      await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          files: {
            'otakutrack.json': {
              content: JSON.stringify(DB, null, 2)
            }
          }
        })
      });
    }
    
    dot.className = 'sync-dot synced';
    localStorage.setItem('otakutrack-lastsync', new Date().toISOString());
  } catch (error) {
    console.error('Erreur sync:', error);
    dot.className = 'sync-dot';
  }
}

async function syncFromGithub() {
  if (!githubToken || !gistId) return;
  
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const file = data.files['otakutrack.json'];
      if (file) {
        DB = JSON.parse(file.content);
        renderAll();
        localStorage.setItem('otakutrack-lastsync', new Date().toISOString());
      }
    }
  } catch (error) {
    console.error('Erreur sync:', error);
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
  syncData();
  renderAll();
}

function quickEpisode(animeId, seasonIdx) {
  const a = DB.animes.find(x => x.id === animeId);
  if (!a) return;
  const se = a.seasons[seasonIdx];
  if (se.watched < se.eps) {
    se.watched++;
    syncData();
    renderAll();
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
  syncData();
  renderAll();
}

// ===== MODAL =====
let seasonFields = [];

function openModal(id = null) {
  editingId = id;
  seasonFields = [];

  if (id) {
    const item = [...DB.animes, ...DB.mangas].find(x => x.id === id);
    document.getElementById('modal-title').textContent = 'Modifier';
    selectModalType(item.type);
    if (item.type === 'anime') {
      document.getElementById('m-title').value = item.title;
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
    if (modalType === 'anime') addSeasonField();
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
  if (type === 'anime' && seasonFields.length === 0) addSeasonField();
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
  syncData();
  closeModal();
  if (modalType !== currentTab) switchTab(modalType);
  renderAll();
}

function editEntry(id) { openModal(id); }

// ===== CONFIG MODAL =====
function showConfigModal() {
  document.getElementById('config-modal').classList.add('open');
  loadConfigUI();
}

function closeConfigModal() {
  document.getElementById('config-modal').classList.remove('open');
}

function loadConfigUI() {
  document.getElementById('config-token').value = githubToken || '';
  document.getElementById('supabase-url').value = SUPABASE_URL === 'https://VOTRE_PROJET.supabase.co' ? '' : SUPABASE_URL;
  document.getElementById('supabase-key').value = SUPABASE_ANON_KEY === 'VOTRE_CLE_ANON' ? '' : SUPABASE_ANON_KEY;
  
  let status = 'Déconnecté';
  if (useSupabase && supabaseClient) {
    status = 'Supabase ✓';
  } else if (githubToken) {
    status = 'GitHub ✓';
  }
  document.getElementById('config-status').textContent = status;
  
  const lastSync = localStorage.getItem('otakutrack-lastsync');
  if (lastSync) {
    const date = new Date(lastSync);
    document.getElementById('config-last-sync').textContent = date.toLocaleString('fr-FR');
  }
}

async function connectSync() {
  const token = document.getElementById('config-token').value.trim();
  if (!token) return alert('Veuillez entrer un token');
  
  githubToken = token;
  useSupabase = false;
  saveConfig();
  updateSyncIndicator();
  await syncData();
  loadConfigUI();
  alert('Connecté ! Les données seront synchronisées.');
}

async function connectSupabase() {
  console.log('Début connexion Supabase...');
  const url = document.getElementById('supabase-url').value.trim();
  const key = document.getElementById('supabase-key').value.trim();
  console.log('URL:', url);
  console.log('Clé:', key ? 'définie' : 'vide');
  
  if (!url || !key) {
    console.log('URL ou clé manquante');
    return alert('URL et clé requises');
  }
  
  // Mettre à jour les variables globales
  window.SUPABASE_URL = url;
  window.SUPABASE_ANON_KEY = key;
  useSupabase = true;
  githubToken = null;
  gistId = null;
  
  // Initialiser le client Supabase
  console.log('Initialisation client Supabase...');
  if (!window.supabase) {
    console.error('Librairie Supabase non chargée!');
    return alert('Erreur: Librairie Supabase non chargée. Vérifiez votre connexion internet.');
  }
  
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Client Supabase créé');
  
  // Tester la connexion
  try {
    console.log('Test de connexion...');
    const { data, error } = await supabaseClient.from('animes').select('*').limit(1);
    if (error && error.code !== 'PGRST102') {
      console.error('Erreur test Supabase:', error);
      alert('Erreur de connexion à Supabase: ' + error.message);
      return;
    }
    
    console.log('Connexion réussie, sauvegarde config...');
    saveConfig();
    updateSyncIndicator();
    await syncData();
    loadConfigUI();
    alert('Connecté à Supabase ! Synchronisation activée.');
  } catch (error) {
    console.error('Erreur connexion Supabase:', error);
    alert('Erreur de connexion à Supabase: ' + error.message);
  }
}

// Rendre les fonctions accessibles globalement pour les onclick HTML
window.showConfigModal = showConfigModal;
window.closeConfigModal = closeConfigModal;
window.connectSupabase = connectSupabase;
window.connectSync = connectSync;
window.switchTab = switchTab;
window.setFilter = setFilter;
window.openModal = openModal;
window.closeModal = closeModal;
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;
window.quickUpdateManga = quickUpdateManga;
window.quickEpisode = quickEpisode;
window.toggleSeasons = toggleSeasons;
window.saveEntry = saveEntry;
window.addSeasonField = addSeasonField;
window.removeSeasonField = removeSeasonField;

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('config-modal').addEventListener('click', function(e) {
  if (e.target === this) closeConfigModal();
});

async function initApp() {
  loadConfig();
  
  // Initialiser Supabase si configuré
  if (useSupabase && SUPABASE_URL !== 'https://VOTRE_PROJET.supabase.co') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    updateSyncIndicator();
  }
  
  loadDatabase();
}

// ===== INIT =====
initApp();
