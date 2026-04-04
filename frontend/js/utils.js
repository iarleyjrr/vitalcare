// utils.js
const Utils = {
  fmtDate(iso) {
    if (!iso) return '–';
    try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return iso; }
  },
  fmtDateTime(iso) {
    if (!iso) return '–';
    try { return new Date(iso).toLocaleString('pt-BR', {dateStyle:'short',timeStyle:'short'}); } catch { return iso; }
  },
  fmtTime(iso) {
    if (!iso) return '–';
    try { return iso.length > 5 ? iso.substring(11,16) : iso; } catch { return iso; }
  },
  fmtMoney(v) {
    return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
  },
  fmtDateBR(iso) {
    if (!iso) return '–';
    const [y,m,d] = iso.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  },
  today() { return new Date().toISOString().split('T')[0]; },
  addDays(days) {
    const d = new Date(); d.setDate(d.getDate()+days);
    return d.toISOString().split('T')[0];
  },
  statusBadge(s) {
    const map = {
      agendada:  ['badge-blue','calendar-check', () => Lang.t('status.scheduled')],
      confirmada:['badge-purple','circle-check',  () => Lang.t('status.confirmed')],
      realizada: ['badge-green','check-circle',   () => Lang.t('status.done')],
      cancelada: ['badge-red','times-circle',     () => Lang.t('status.cancelled')],
      falta:     ['badge-gray','user-slash',      () => Lang.t('status.absent')],
      pago:      ['badge-green','check-circle',   () => Lang.t('status.paid')],
      pendente:  ['badge-yellow','clock',         () => Lang.t('status.pending')],
      cancelado: ['badge-red','times-circle',     () => Lang.t('status.cancelled_fin')],
    };
    const [cls, icon, labelFn] = map[s] || ['badge-gray','circle', () => '–'];
    return `<span class="badge ${cls}"><i class="fa fa-${icon}"></i> ${labelFn()}</span>`;
  },
  perfilLabel(p) {
    const map = {
      admin: () => Lang.t('profile.admin'),
      medico: () => Lang.t('profile.medico'),
      recepcionista: () => Lang.t('profile.recepcionista'),
      paciente: () => Lang.t('profile.paciente'),
    };
    return (map[p] ? map[p]() : p);
  },
  avatar(nome) {
    return nome ? nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '?';
  },
  debounce(fn, ms = 400) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(()=>fn(...args), ms); };
  },
};

// Toast notifications
function showToast(msg, type = 'info') {
  const icons = { success:'check-circle', error:'exclamation-circle', warning:'exclamation-triangle', info:'info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa fa-${icons[type]||'info-circle'}"></i> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Modal helpers
function openModal(content, maxWidth = '600px') {
  document.getElementById('modal-content').innerHTML = content;
  document.getElementById('modal-box').style.maxWidth = maxWidth;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}

// Loading helpers
function loadingHTML(msg) {
  return `<div class="loading"><div class="spinner"></div>${msg !== undefined ? msg : Lang.t('general.loading')}</div>`;
}
function emptyStateHTML(icon, title, desc='') {
  return `<div class="empty-state"><i class="fa fa-${icon}"></i><h3>${title}</h3><p>${desc}</p></div>`;
}
