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
  { id:'a3', title:'Classroom of the Élite', type:'anime', seasons:[
    {name:'s1', eps:12, watched:12, epDur:20},
    {name:'s2', eps:13, watched:13, epDur:20}
  ]},
  { id:'a4', title:'Great Pretender', type:'anime', seasons:[
    {name:'s1', eps:23, watched:23, epDur:20},
    {name:'Film', eps:1, watched:0, epDur:90}
  ]},
  { id:'a5', title:'Your Name', type:'anime', seasons:[
    {name:'Film', eps:1, watched:1, epDur:100}
  ]},
  { id:'a6', title:'Le garçon et la bête', type:'anime', seasons:[
    {name:'Film', eps:1, watched:1, epDur:110}
  ]},
  { id:'a7', title:'Fire Force', type:'anime', seasons:[
    {name:'s1', eps:24, watched:24, epDur:20},
    {name:'s2', eps:24, watched:24, epDur:20},
    {name:'s3', eps:25, watched:12, epDur:20}
  ]},
  { id:'a8', title:"Jojo's Bizarre Adventure", type:'anime', seasons:[
    {name:'s1', eps:9, watched:0, epDur:20},
    {name:'s2', eps:17, watched:0, epDur:20},
    {name:'s3', eps:48, watched:0, epDur:20},
    {name:'s4', eps:39, watched:0, epDur:20},
    {name:'OAV', eps:4, watched:0, epDur:20},
    {name:'s5', eps:39, watched:0, epDur:20},
    {name:'s6', eps:38, watched:0, epDur:20}
  ]},
  { id:'a9', title:'Shibukui Bisco', type:'anime', seasons:[
    {name:'s1', eps:12, watched:12, epDur:20}
  ]},
  { id:'a10', title:'Cheat Skill Level Up', type:'anime', seasons:[
    {name:'s1', eps:13, watched:13, epDur:20}
  ]},
  { id:'a11', title:'Fairy Tails', type:'anime', seasons:[
    {name:'Films', eps:2, watched:0, epDur:90}
  ]},
  { id:'a12', title:'Level 1 Dakedo Unique Skill', type:'anime', seasons:[
    {name:'s1', eps:12, watched:12, epDur:20}
  ]},
  { id:'a13', title:'Farming Life in Another World', type:'anime', seasons:[
    {name:'s1', eps:12, watched:12, epDur:20},
    {name:'s2', eps:12, watched:0, epDur:20}
  ]},
  { id:'a14', title:'Solo Leveling', type:'anime', seasons:[
    {name:'s1', eps:12, watched:12, epDur:20},
    {name:'s2', eps:13, watched:13, epDur:20}
  ]},
  { id:'a15', title:'The Rising of the Shield Hero', type:'anime', seasons:[
    {name:'s1', eps:25, watched:25, epDur:20},
    {name:'s2', eps:13, watched:13, epDur:20},
    {name:'s3', eps:12, watched:0, epDur:20}
  ]},
  { id:'a16', title:'Tales of Demons and Gods', type:'anime', seasons:[
    {name:'s1', eps:12, watched:12, epDur:25},
    {name:'s2', eps:12, watched:12, epDur:25},
    {name:'s3', eps:12, watched:5, epDur:25},
    {name:'s4', eps:12, watched:0, epDur:25}
  ]},
  { id:'a17', title:'Zom 100', type:'anime', seasons:[
    {name:'s1', eps:12, watched:0, epDur:20}
  ]},
  { id:'a18', title:'Gate', type:'anime', seasons:[
    {name:'s1', eps:24, watched:0, epDur:20}
  ]},
  { id:'a19', title:'Undead Unluck', type:'anime', seasons:[
    {name:'s1', eps:24, watched:0, epDur:20}
  ]},
  { id:'a20', title:'Frieren', type:'anime', seasons:[
    {name:'s1', eps:28, watched:0, epDur:20}
  ]},
  { id:'a21', title:'Sakamoto Days', type:'anime', seasons:[
    {name:'s1 p1', eps:11, watched:0, epDur:20},
    {name:'s1 p2', eps:11, watched:0, epDur:20}
  ]},
  { id:'a22', title:'Lord of Mysteries', type:'anime', seasons:[
    {name:'s1', eps:13, watched:0, epDur:20},
    {name:'OAV', eps:9, watched:0, epDur:20}
  ]},
  { id:'a23', title:'One Punch Man', type:'anime', seasons:[
    {name:'s1', eps:12, watched:0, epDur:20},
    {name:'s2', eps:12, watched:0, epDur:20},
    {name:'s3', eps:5, watched:0, epDur:20},
    {name:'OAV', eps:12, watched:0, epDur:20}
  ]},
  { id:'a24', title:'Konosuba', type:'anime', seasons:[
    {name:'s1', eps:11, watched:11, epDur:20},
    {name:'s2', eps:11, watched:0, epDur:20},
    {name:'s3', eps:11, watched:0, epDur:20},
    {name:'s3 OAV', eps:2, watched:0, epDur:20},
    {name:'Film', eps:1, watched:0, epDur:90},
    {name:'Explosion', eps:12, watched:0, epDur:20}
  ]},
  { id:'a25', title:'The Eminence in Shadow', type:'anime', seasons:[
    {name:'s1', eps:20, watched:0, epDur:20},
    {name:'s2', eps:12, watched:0, epDur:20}
  ]},
  { id:'a26', title:'Re:Zero', type:'anime', seasons:[
    {name:'s1', eps:13, watched:13, epDur:45},
    {name:'s2', eps:25, watched:12, epDur:25},
    {name:'s3', eps:16, watched:0, epDur:20},
    {name:'s4', eps:2, watched:0, epDur:20},
    {name:'Films', eps:2, watched:1, epDur:70}
  ]},
  { id:'a27', title:"L'Atelier des Sorciers", type:'anime', seasons:[
    {name:'s1', eps:6, watched:6, epDur:20}
  ]},
  { id:'a28', title:'Tsugai', type:'anime', seasons:[
    {name:'s1', eps:5, watched:0, epDur:20}
  ]},
  { id:'a29', title:'Mushoku Tensei', type:'anime', seasons:[] },
  { id:'a30', title:'Overlord', type:'anime', seasons:[] },
  { id:'a31', title:'I Parry Everything', type:'anime', seasons:[] },
];

const INITIAL_MANGAS = [
  { id:'m1', title:'Gloutons et Dragons', type:'manga', total:11, read:11, notes:'' },
  { id:'m2', title:'Fullmetal Alchemist', type:'manga', total:27, read:27, notes:'' },
  { id:'m3', title:'Hunter x Hunter', type:'manga', total:37, read:36, notes:'' },
  { id:'m4', title:'My Hero Academia', type:'manga', total:35, read:35, notes:'' },
  { id:'m5', title:'Magus of the Library', type:'manga', total:4, read:4, notes:'' },
  { id:'m6', title:'One Piece', type:'manga', total:101, read:21, notes:'' },
  { id:'m7', title:'Naruto', type:'manga', total:72, read:33, notes:'' },
  { id:'m8', title:'Fairy Tail', type:'manga', total:63, read:63, notes:'' },
  { id:'m9', title:'Eden Zero', type:'manga', total:16, read:16, notes:'' },
  { id:'m10', title:'Créatures Fantastiques', type:'manga', total:5, read:5, notes:'' },
  { id:'m11', title:"Félin pour l'autre", type:'manga', total:6, read:6, notes:'' },
  { id:'m12', title:'Black Clover', type:'manga', total:9, read:9, notes:'Scans lus jusqu\'au chap. 383/389' },
];

// ===== STATE =====
let currentTab = 'anime';
let currentFilter = 'all';
let editingId = null;
let modalType = 'anime';
let currentQRToken = null;

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
}

let DB = loadData();

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
    const toggleEl = document.getElementById('toggle-' + animeId);
    if (detailEl && detailEl.classList.contains('open')) {
      const wasOpen = true;
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
  saveData(DB);
  closeModal();
  if (modalType !== currentTab) switchTab(modalType);
  renderAll();
}

function editEntry(id) { openModal(id); }

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ===== CONFIG MODAL =====
function showConfigModal() {
  document.getElementById('config-modal').classList.add('open');
  updateConfigStatus();
}

function closeConfigModal() {
  document.getElementById('config-modal').classList.remove('open');
}

function switchConfigTab(tab) {
  document.querySelectorAll('.config-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  
  document.querySelector(`.config-tab:nth-child(${tab === 'scan' ? 1 : tab === 'manual' ? 2 : 3})`).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  
  if (tab === 'scan') {
    const token = localStorage.getItem('otakutrack-token');
    if (token) {
      currentQRToken = token;
      generateQRCode();
    }
  }
}

function generateQRCode() {
  const token = document.getElementById('config-token').value.trim() || localStorage.getItem('otakutrack-token');
  
  if (!token) {
    alert('Merci d\'entrer un token d\'abord (onglet Manuel)');
    switchConfigTab('manual');
    return;
  }

  currentQRToken = token;
  const qrContainer = document.getElementById('qr-code');
  qrContainer.innerHTML = '';
  
  QRCode.toCanvas(qrContainer, token, {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  }, function(error) {
    if (error) console.error(error);
  });

  document.getElementById('qr-display').style.display = 'block';
}

function copyQRToken() {
  if (!currentQRToken) return;
  navigator.clipboard.writeText(currentQRToken).then(() => {
    alert('Token copié! 📋');
  });
}

function useScannedToken() {
  const token = document.getElementById('config-token-scan').value.trim();
  if (!token) return alert('Colle un token');
  
  document.getElementById('config-token').value = token;
  connectSync();
  switchConfigTab('status');
}

function connectSync() {
  const token = document.getElementById('config-token').value.trim();
  
  if (!token) {
    alert('Merci d\'entrer un token');
    return;
  }

  localStorage.setItem('otakutrack-token', token);
  alert('✅ Token sauvegardé! Synchronisation activée.');
  updateConfigStatus();
  closeConfigModal();
  renderAll();
}

function updateConfigStatus() {
  const token = localStorage.getItem('otakutrack-token');
  const gistId = localStorage.getItem('otakutrack-gist-id');
  const lastSync = localStorage.getItem('otakutrack-last-sync');

  const status = token ? '✅ Connecté' : '❌ Déconnecté';
  const syncText = lastSync ? new Date(parseInt(lastSync)).toLocaleString() : 'Jamais';
  const gistDisplay = gistId || '—';

  document.getElementById('config-status').textContent = status;
  document.getElementById('config-last-sync').textContent = syncText;
  document.getElementById('config-gist-id').textContent = gistDisplay;
  
  if (token) {
    document.getElementById('sync-dot').className = 'sync-dot synced';
    document.getElementById('sync-text').textContent = 'Synced';
  } else {
    document.getElementById('sync-dot').className = 'sync-dot';
    document.getElementById('sync-text').textContent = 'Local';
  }
}

document.getElementById('config-modal').addEventListener('click', function(e) {
  if (e.target === this) closeConfigModal();
});

// ===== INIT =====
renderAll();
updateConfigStatus();
