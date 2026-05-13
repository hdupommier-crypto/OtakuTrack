// ===== DATA LOADING =====
let DB = { animes: [], mangas: [] };
let dbLoaded = false;
let supabaseClient = null;

// Configuration Supabase (pré-remplie)
const SUPABASE_URL = 'https://alzbwiqgoaosyohwiakr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsemJ3aXFnb2Fvc3lvaHdpYWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODM3MTQsImV4cCI6MjA5NDI1OTcxNH0.s7CwqRz4DKdtZAlNQ9Yw5iaahS_LE52gsMlxSeZo_ys';

let manualSupabaseUrl = '';
let manualSupabaseKey = '';

async function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase JS non chargé');
    return false;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

async function connectSupabasePreconfig() {
  console.log('Connexion Supabase avec identifiants pré-configurés...');
  
  useSupabase = true;
  
  console.log('Initialisation client Supabase...');
  if (!window.supabase) {
    console.error('Librairie Supabase non chargée!');
    return alert('Erreur: Librairie Supabase non chargée. Vérifiez votre connexion internet.');
  }
  
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Client Supabase créé');
  
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

function enableManualInput() {
  document.getElementById('supabase-url').removeAttribute('readonly');
  document.getElementById('supabase-key').removeAttribute('readonly');
  document.getElementById('supabase-url').style.background = 'var(--bg)';
  document.getElementById('supabase-key').style.background = 'var(--bg)';
  document.getElementById('supabase-url').style.color = 'var(--text)';
  document.getElementById('supabase-key').style.color = 'var(--text)';
  document.getElementById('btn-connect-manual').style.display = 'block';
  document.getElementById('supabase-url').focus();
}

async function connectSupabaseManual() {
  const url = document.getElementById('supabase-url').value.trim();
  const key = document.getElementById('supabase-key').value.trim();
  
  if (!url || !key) {
    return alert('URL et clé requises');
  }
  
  console.log('Connexion Supabase avec identifiants manuels...');
  useSupabase = true;
  
  if (!window.supabase) {
    console.error('Librairie Supabase non chargée!');
    return alert('Erreur: Librairie Supabase non chargée.');
  }
  
  supabaseClient = window.supabase.createClient(url, key);
  console.log('Client Supabase créé avec identifiants manuels');
  
  try {
    console.log('Test de connexion...');
    const { data, error } = await supabaseClient.from('animes').select('*').limit(1);
    if (error && error.code !== 'PGRST102') {
      console.error('Erreur test Supabase:', error);
      alert('Erreur de connexion à Supabase: ' + error.message);
      return;
    }
    
    // Sauvegarder les identifiants manuels pour usage futur
    manualSupabaseUrl = url;
    manualSupabaseKey = key;
    
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
let currentSort = 'default';
let editingId = null;
let modalType = 'anime';
let useSupabase = true;
let timeDisplayMode = 0; // 0: jours, 1: heures, 2: minutes

// ===== SUPABASE SYNC =====
async function syncToSupabase() {
  if (!supabaseClient || !useSupabase) return;
  
  const dot = document.getElementById('sync-dot');
  dot.className = 'sync-dot syncing';
  
  try {
    // SÉCURITÉ CRITIQUE : Ne jamais synchroniser si les tableaux sont vides
    // Cela empêche d'effacer la base de données par accident
    if (DB.animes.length === 0 && DB.mangas.length === 0) {
      console.warn('⚠️ TENTATIVE DE SYNCHRONISATION VIDE BLOQUÉE ! Les données locales sont vides, on annule pour protéger la DB.');
      dot.className = 'sync-dot error';
      showNotification('Synchronisation annulée: Données locales vides', 'error');
      return;
    }

    // Utiliser upsert au lieu de delete+insert pour éviter les pertes de données
    // Upsert met à jour les lignes existantes et ajoute les nouvelles sans toucher aux autres
    if (DB.animes.length > 0) {
      console.log(`Sauvegarde de ${DB.animes.length} animes...`);
      const { error: animeError } = await supabaseClient
        .from('animes')
        .upsert(DB.animes, { onConflict: 'id' });
      
      if (animeError) throw animeError;
    }

    if (DB.mangas.length > 0) {
      console.log(`Sauvegarde de ${DB.mangas.length} mangas...`);
      const { error: mangaError } = await supabaseClient
        .from('mangas')
        .upsert(DB.mangas, { onConflict: 'id' });
      
      if (mangaError) throw mangaError;
    }
    
    dot.className = 'sync-dot synced';
    localStorage.setItem('otakutrack-lastsync', new Date().toISOString());
    console.log('✅ Synchronisation réussie et sécurisée');
  } catch (error) {
    console.error('❌ Erreur critique sync Supabase:', error);
    dot.className = 'sync-dot error';
    showNotification('Erreur de synchronisation: ' + error.message, 'error');
    // En cas d'erreur, on recharge les données depuis Supabase pour éviter toute perte
    await syncFromSupabase();
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
    // Recharger les données après synchronisation pour récupérer les timestamps
    await syncFromSupabase();
  }
}

function loadConfig() {
  const stored = localStorage.getItem('otakutrack-config');
  if (stored) {
    try {
      const config = JSON.parse(stored);
      useSupabase = config.useSupabase !== false;
      updateSyncIndicator();
    } catch(e) {}
  }
}

function saveConfig() {
  const config = { useSupabase: useSupabase };
  localStorage.setItem('otakutrack-config', JSON.stringify(config));
}

function updateSyncIndicator() {
  const dot = document.getElementById('sync-dot');
  const text = document.getElementById('sync-text');
  if (useSupabase && supabaseClient) {
    dot.className = 'sync-dot synced';
    text.textContent = 'Supabase';
  } else {
    dot.className = 'sync-dot';
    text.textContent = 'Local';
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

function formatTimeInteractive(mins) {
  if (timeDisplayMode === 0) {
    // Jours
    if (mins < 60) return mins + 'min';
    const h = Math.floor(mins/60);
    if (h < 24) return h + 'h';
    const d = Math.floor(h/24);
    const rh = h % 24;
    return d + 'j ' + (rh > 0 ? rh + 'h' : '');
  } else if (timeDisplayMode === 1) {
    // Heures
    const h = Math.floor(mins/60);
    const m = mins % 60;
    return h + 'h ' + (m > 0 ? m + 'min' : '');
  } else {
    // Minutes
    return mins + ' minutes';
  }
}

function cycleTimeDisplay() {
  timeDisplayMode = (timeDisplayMode + 1) % 3;
  renderStats();
  renderAll();
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
  
  // Calculs pour les stats détaillées
  const episodesAVoir = DB.animes.reduce((sum, a) => {
    const total = a.seasons.reduce((s, se) => s + se.eps, 0);
    const watched = a.seasons.reduce((s, se) => s + se.watched, 0);
    return sum + (total - watched);
  }, 0);
  const tomesALire = DB.mangas.reduce((sum, m) => sum + (m.total - m.read), 0);

  document.getElementById('hdr-eps').textContent = totalEpsWatched;
  document.getElementById('hdr-tomes').textContent = totalTomesLus;
  document.getElementById('hdr-time').textContent = formatTimeInteractive(totalTimeMin);

  if (currentTab === 'anime') {
    document.getElementById('stats-row').innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Épisodes vus</div>
        <div class="stat-value accent">${totalEpsWatched}</div>
        <div class="stat-sub">${formatTimeInteractive(totalTimeMin)} de visionnage</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Épisodes à voir</div>
        <div class="stat-value blue">${episodesAVoir}</div>
        <div class="stat-sub">restants</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Animes terminés</div>
        <div class="stat-value green">${animesTermines}</div>
        <div class="stat-sub">sur ${DB.animes.length} titres</div>
      </div>
      <div class="stat-card" style="cursor:pointer;" onclick="cycleTimeDisplay()" title="Cliquer pour changer l'unité">
        <div class="stat-label">Temps de visionnage ⏱️</div>
        <div class="stat-value purple">${formatTimeInteractive(totalTimeMin)}</div>
        <div class="stat-sub">cliquer pour changer</div>
      </div>
    `;
  } else {
    document.getElementById('stats-row').innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Tomes lus</div>
        <div class="stat-value purple">${totalTomesLus}</div>
        <div class="stat-sub">tomes</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tomes à lire</div>
        <div class="stat-value blue">${tomesALire}</div>
        <div class="stat-sub">restants</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Mangas terminés</div>
        <div class="stat-value green">${mangasTermines}</div>
        <div class="stat-sub">sur ${DB.mangas.length} séries</div>
      </div>
    `;
  }
}

function renderAll() {
  renderStats();
  const search = document.getElementById('search-input').value.toLowerCase();
  let data = currentTab === 'anime' ? DB.animes : DB.mangas;

  document.getElementById('pill-anime').textContent = DB.animes.length;
  document.getElementById('pill-manga').textContent = DB.mangas.length;

  // Appliquer le filtre
  let filtered = data.filter(item => {
    const status = getStatus(item);
    if (currentFilter !== 'all' && status !== currentFilter) return false;
    if (search && !item.title.toLowerCase().includes(search)) return false;
    return true;
  });

  // Appliquer le tri
  filtered = sortDataArray(filtered);

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

function sortDataArray(data) {
  const arr = [...data];
  
  if (currentSort === 'default' || currentSort === '') return arr;
  
  switch (currentSort) {
    case 'alpha-asc':
      arr.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'alpha-desc':
      arr.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'recent':
      arr.sort((a, b) => {
        const timeA = a.lastModified || 0;
        const timeB = b.lastModified || 0;
        return timeB - timeA;
      });
      break;
    case 'progress':
      arr.sort((a, b) => getProgress(b) - getProgress(a));
      break;
    case 'duration':
      arr.sort((a, b) => {
        if (a.type === 'anime') {
          const durA = a.seasons.reduce((s, se) => s + se.eps * se.epDur, 0);
          const durB = b.seasons.reduce((s, se) => s + se.eps * se.epDur, 0);
          return durB - durA;
        } else {
          return (b.total || 0) - (a.total || 0);
        }
      });
      break;
  }
  
  return arr;
}

function sortData() {
  currentSort = document.getElementById('sort-select').value;
  renderAll();
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
  m.lastModified = Date.now();
  syncData();
  renderAll();
}

function quickEpisode(animeId, seasonIdx) {
  const a = DB.animes.find(x => x.id === animeId);
  if (!a) return;
  const se = a.seasons[seasonIdx];
  if (se.watched < se.eps) {
    se.watched++;
    a.lastModified = Date.now();
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
  const now = Date.now();
  
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
      if (a) { a.title = title; a.seasons = seasons; a.lastModified = now; }
    } else {
      DB.animes.push({ id: genId(), title, type: 'anime', seasons, lastModified: now });
    }
  } else {
    const title = document.getElementById('m-manga-title').value.trim();
    const total = parseInt(document.getElementById('m-total').value) || 0;
    const read = Math.min(parseInt(document.getElementById('m-read').value) || 0, total);
    const notes = document.getElementById('m-notes').value.trim();
    if (!title) return alert('Titre requis');
    if (editingId) {
      const m = DB.mangas.find(x => x.id === editingId);
      if (m) { m.title = title; m.total = total; m.read = read; m.notes = notes; m.lastModified = now; }
    } else {
      DB.mangas.push({ id: genId(), title, type: 'manga', total, read, notes, lastModified: now });
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
  document.getElementById('supabase-url').value = SUPABASE_URL;
  document.getElementById('supabase-key').value = SUPABASE_ANON_KEY;
  
  let status = 'Déconnecté';
  if (useSupabase && supabaseClient) {
    status = 'Supabase ✓';
  }
  document.getElementById('config-status').textContent = status;
  
  const lastSync = localStorage.getItem('otakutrack-lastsync');
  if (lastSync) {
    const date = new Date(lastSync);
    document.getElementById('config-last-sync').textContent = date.toLocaleString('fr-FR');
  }
}

// Rendre les fonctions accessibles globalement pour les onclick HTML
window.showConfigModal = showConfigModal;
window.closeConfigModal = closeConfigModal;
window.connectSupabasePreconfig = connectSupabasePreconfig;
window.connectSupabaseManual = connectSupabaseManual;
window.enableManualInput = enableManualInput;
window.switchTab = switchTab;
window.setFilter = setFilter;
window.sortData = sortData;
window.cycleTimeDisplay = cycleTimeDisplay;
window.formatTimeInteractive = formatTimeInteractive;
window.openModal = openModal;
window.closeModal = closeModal;
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;
window.quickUpdateManga = quickUpdateManga;
window.quickEpisode = quickEpisode;
window.toggleSeasons = toggleSeasons;
window.saveEntry = saveEntry;
window.addSeasonField = addSeasonField;
window.removeSeasonField = removeSF;

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('config-modal').addEventListener('click', function(e) {
  if (e.target === this) closeConfigModal();
});

async function initApp() {
  loadConfig();
  
  // Initialiser Supabase automatiquement avec les identifiants pré-configurés
  useSupabase = true;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  updateSyncIndicator();
  
  loadDatabase();
}

// ===== INIT =====
initApp();
