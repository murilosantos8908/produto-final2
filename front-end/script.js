const API = 'http://localhost:3000';

let drivers = [];
let laps = [];

setInterval(() => {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('pt-BR');
}, 1000);

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function doLogin() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const err  = document.getElementById('login-error');

  if (user === 'admin' && pass === 'racing2026') {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app').classList.add('active');
    initApp();
  } else {
    err.textContent = 'Credenciais inválidas. Tente novamente.';
  }
}

function doLogout() {
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

function navigate(pageId, element) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  if (element) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    element.classList.add('active');
  }
}

async function refreshDash() {
  await Promise.all([loadDrivers(), loadLaps()]);
  renderStandings();
  updateDashStats();
  showToast('Dados do Dashboard Atualizados!');
}

function updateDashStats() {

  if (laps.length > 0) {
    const best = Math.min(...laps.map(l => parseFloat(l.tempo_segundos)));
    document.getElementById('s-lap').textContent = formatSeconds(best);
  }

  document.getElementById('s-pod').textContent = laps.length;
  document.getElementById('s-pts').textContent = drivers.length;

  const badge = document.querySelector('.nav-badge');
  if (badge) badge.textContent = drivers.length;
}

async function loadDrivers() {
  try {
    const res = await fetch(`${API}/corredores`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    drivers = await res.json();
    renderDrivers();
    renderSelectOptions();
  } catch (err) {
    console.error('Erro ao carregar corredores:', err);
    showToast('Erro ao carregar corredores do servidor.');
  }
}

async function loadLaps() {
  try {
    const res = await fetch(`${API}/voltas`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    laps = await res.json();
    renderLaps();
  } catch (err) {
    console.error('Erro ao carregar voltas:', err);
    showToast('Erro ao carregar voltas do servidor.');
  }
}

function openAddDriver() {

  document.getElementById('d-name').value  = '';
  document.getElementById('d-equipe').value = '';
  document.getElementById('modal-driver').classList.add('open');
}

function openAddLap() {
  const select = document.getElementById('l-driver');
  select.innerHTML = drivers.map(d =>
    `<option value="${d.id}">${d.nome} (${d.equipe})</option>`
  ).join('');
  document.getElementById('l-time').value = '';
  document.getElementById('l-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('modal-lap').classList.add('open');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

async function addDriver() {
  const nome   = document.getElementById('d-name').value.trim();
  const equipe = document.getElementById('d-equipe').value.trim();

  if (!nome || !equipe) return showToast('Preencha Nome e Equipe!');

  try {
    const res = await fetch(`${API}/corredores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, equipe })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Erro ${res.status}`);
    }

    closeModal('modal-driver');
    await loadDrivers();
    renderStandings();
    showToast('Corredor adicionado com sucesso!');
  } catch (err) {
    console.error('Erro ao adicionar corredor:', err);
    showToast(`Erro: ${err.message}`);
  }
}

async function deleteDriver(id) {
  if (!confirm('Deseja remover este corredor?')) return;
  try {
    const res = await fetch(`${API}/corredores/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    await loadDrivers();
    await loadLaps();
    renderStandings();
    showToast('Corredor removido!');
  } catch (err) {
    showToast(`Erro: ${err.message}`);
  }
}

async function addLap() {
  const id_corredor  = parseInt(document.getElementById('l-driver').value);
  const timeStr      = document.getElementById('l-time').value.trim();
  const data_volta   = document.getElementById('l-date').value;

  if (!timeStr || !data_volta) return showToast('Preencha todos os campos!');

  const tempo_segundos = timeToSeconds(timeStr);
  if (isNaN(tempo_segundos)) return showToast('Formato de tempo inválido! Use mm:ss.ms (ex: 1:20.500)');

  try {
    const res = await fetch(`${API}/voltas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_corredor, tempo_segundos, data_volta })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Erro ${res.status}`);
    }

    closeModal('modal-lap');
    await loadLaps();
    showToast('Volta registrada com sucesso!');
  } catch (err) {
    console.error('Erro ao adicionar volta:', err);
    showToast(`Erro: ${err.message}`);
  }
}

async function deleteLap(id) {
  if (!confirm('Deseja remover esta volta?')) return;
  try {
    const res = await fetch(`${API}/voltas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    await loadLaps();
    showToast('Volta removida!');
  } catch (err) {
    showToast(`Erro: ${err.message}`);
  }
}

function renderDrivers() {
  const grid = document.getElementById('drivers-grid');

  if (drivers.length === 0) {
    grid.innerHTML = `<div class="empty-state">Nenhum corredor cadastrado. Clique em "+ ADICIONAR CORREDOR".</div>`;
    return;
  }

  grid.innerHTML = drivers.map((d, i) => `
    <div class="driver-card">
      <div class="driver-header">
        <div class="driver-number">${i + 1}</div>
        <div class="driver-info">
          <div class="driver-name">${d.nome}</div>
          <div class="driver-team">${d.equipe}</div>
        </div>
      </div>
      <div class="driver-footer">
        <span class="status-pill status-active">Ativo</span>
        <button class="btn-detail" onclick="deleteDriver(${d.id})">Remover</button>
      </div>
    </div>
  `).join('');
}

function renderStandings() {
  const tbody = document.getElementById('standings-body');

  if (drivers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;opacity:.5">Sem dados</td></tr>`;
    return;
  }

  const score = {};
  laps.forEach(l => {
    score[l.id_corredor] = (score[l.id_corredor] || 0) + 1;
  });

  const sorted = [...drivers].sort((a, b) => (score[b.id] || 0) - (score[a.id] || 0));

  tbody.innerHTML = sorted.map((d, i) => `
    <tr>
      <td><span class="pos-badge pos-${i + 1}">${i + 1}</span></td>
      <td>${d.nome}</td>
      <td>${d.equipe}</td>
      <td style="text-align:right">${score[d.id] || 0} <small style="opacity:.5">voltas</small></td>
    </tr>
  `).join('');
}

function renderLaps() {
  const tbody = document.getElementById('laps-body');
  const filterVal = document.getElementById('filter-driver').value;

  let filtered = [...laps];
  if (filterVal) filtered = filtered.filter(l => String(l.id_corredor) === filterVal);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;opacity:.5">Nenhuma volta encontrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.reverse().map(l => {
    const d = drivers.find(drv => drv.id === l.id_corredor);
    const nomePiloto = d ? d.nome : `Corredor #${l.id_corredor}`;
    const dataFormatada = l.data_volta ? new Date(l.data_volta).toLocaleDateString('pt-BR') : '—';
    return `
      <tr>
        <td>${nomePiloto}</td>
        <td class="lap-fastest">${formatSeconds(l.tempo_segundos)}</td>
        <td>${dataFormatada}</td>
        <td>
          <span class="sector-badge sector-n">OK</span>
          <button class="btn-detail" style="margin-left:8px" onclick="deleteLap(${l.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderSelectOptions() {
  const selectDriver = document.getElementById('filter-driver');
  let options = '<option value="">Todos os pilotos</option>';
  drivers.forEach(d => {
    options += `<option value="${d.id}">${d.nome}</option>`;
  });
  selectDriver.innerHTML = options;
  selectDriver.onchange = renderLaps;
}

function timeToSeconds(str) {
  str = str.trim();
  
  const parts = str.split(':');
  let minutes = 0, secPart;
  if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    secPart = parseFloat(parts[1]);
  } else {
    secPart = parseFloat(parts[0]);
  }
  if (isNaN(minutes) || isNaN(secPart)) return NaN;
  return minutes * 60 + secPart;
}

function formatSeconds(total) {
  total = parseFloat(total);
  if (isNaN(total)) return '—';
  const m = Math.floor(total / 60);
  const s = (total % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

async function initApp() {
  await Promise.all([loadDrivers(), loadLaps()]);
  renderStandings();
  updateDashStats();
}