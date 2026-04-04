// components.js – componentes reutilizáveis de UI

const Components = {

  // Barra de busca
  searchBar(placeholder, onSearch) {
    const wrap = document.createElement('div');
    wrap.className = 'search-bar';
    wrap.innerHTML = `<i class="fa fa-search"></i><input type="text" placeholder="${placeholder}">`;
    const inp = wrap.querySelector('input');
    inp.addEventListener('input', Utils.debounce(e => onSearch(e.target.value), 350));
    return wrap;
  },

  // Paginação simples
  pagination(current, total, onPage) {
    if (total <= 1) return '';
    let html = '<div class="pagination">';
    for (let i = 1; i <= total; i++) {
      html += `<button class="page-btn${i===current?' active':''}" data-p="${i}">${i}</button>`;
    }
    html += '</div>';
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    wrap.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => onPage(+b.dataset.p)));
    return wrap;
  },

  // Card de médico
  doctorCard(medico, onClick) {
    const div = document.createElement('div');
    div.className = 'card doctor-card';
    const initial = medico.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
    div.innerHTML = `
      <div class="doctor-avatar">${initial}</div>
      <div class="doctor-name">${medico.nome}</div>
      <div class="doctor-esp"><i class="fa fa-stethoscope"></i> ${medico.especialidade_nome}</div>
      <div class="text-muted text-small mt-4"><i class="fa fa-id-card"></i> CRM ${medico.crm}</div>
      ${medico.bio ? `<div class="text-small mt-4" style="color:var(--text-muted)">${medico.bio}</div>` : ''}
    `;
    if (onClick) div.addEventListener('click', () => onClick(medico));
    return div;
  },

  // Linha de consulta na tabela
  consultaRow(c, actions = []) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${Utils.fmtDateBR(c.data_hora)}<br><small class="text-muted">${Utils.fmtTime(c.data_hora)}</small></td>
      <td>${c.paciente_nome || c.paciente || '–'}</td>
      <td>${c.medico_nome || c.medico || '–'}</td>
      <td><span class="badge badge-blue">${c.especialidade || '–'}</span></td>
      <td>${Utils.statusBadge(c.status)}</td>
      <td>${c.tipo === 'telemedicina' ? '<span class="badge badge-purple"><i class="fa fa-video"></i> Tele</span>' : '<span class="badge badge-gray"><i class="fa fa-hospital"></i> Pres.</span>'}</td>
      <td>${Utils.fmtMoney(c.valor)}</td>
      <td class="actions-cell"></td>
    `;
    const cell = tr.querySelector('.actions-cell');
    actions.forEach(({icon, title, cls, fn}) => {
      const btn = document.createElement('button');
      btn.className = `btn btn-sm ${cls || 'btn-secondary'}`;
      btn.title = title;
      btn.innerHTML = `<i class="fa fa-${icon}"></i>`;
      btn.addEventListener('click', () => fn(c));
      cell.appendChild(btn);
    });
    return tr;
  },
};
