// pages/pacientes.js
let _pacientesData = [];

async function renderPacientes(container) {
  const user = App.getUser();
  const canEdit = ['admin','recepcionista'].includes(user.perfil);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-users" style="color:var(--primary)"></i> &nbsp;${Lang.t('page.patients')}</div>
      <div class="page-actions">
        ${canEdit ? `<button class="btn btn-primary" id="btn-novo-paciente"><i class="fa fa-plus"></i> ${Lang.t('pat.new_btn')}</button>` : ''}
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div id="pacientes-search-wrap"></div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>${Lang.t('pat.col_name')}</th><th>${Lang.t('pat.col_cpf')}</th><th>${Lang.t('pat.col_phone')}</th><th>${Lang.t('pat.col_email')}</th>
                <th>${Lang.t('pat.col_insurance')}</th><th>${Lang.t('pat.col_date')}</th><th>${Lang.t('pat.col_actions')}</th>
              </tr>
            </thead>
            <tbody id="pacientes-tbody"></tbody>
          </table>
        </div>
        <div id="pacientes-loading" class="loading"><div class="spinner"></div>${Lang.t('general.loading')}</div>
        <div id="pacientes-empty" class="hidden"></div>
      </div>
    </div>
  `;

  const searchWrap = document.getElementById('pacientes-search-wrap');
  const searchEl = Components.searchBar(Lang.t('pat.search_ph'), async (q) => {
    await loadPacientes(q);
  });
  searchWrap.appendChild(searchEl);

  if (canEdit) {
    document.getElementById('btn-novo-paciente').addEventListener('click', () => openFormPaciente());
  }

  await loadPacientes('');
}

async function loadPacientes(q = '') {
  const tbody = document.getElementById('pacientes-tbody');
  const loading = document.getElementById('pacientes-loading');
  const empty = document.getElementById('pacientes-empty');
  if (!tbody) return;

  loading.classList.remove('hidden');
  tbody.innerHTML = '';
  empty.classList.add('hidden');

  try {
    const data = await API.pacientes(q);
    _pacientesData = data;
    loading.classList.add('hidden');

    if (!data.length) {
      empty.className = '';
      empty.innerHTML = emptyStateHTML('users', Lang.t('pat.not_found'),
        q ? Lang.t('pat.try_search') : Lang.t('pat.first_register'));
      return;
    }

    const user = App.getUser();
    const canEdit = ['admin','recepcionista'].includes(user.perfil);

    data.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div style="font-weight:600">${p.nome}</div></td>
        <td class="text-muted">${p.cpf}</td>
        <td>${p.telefone || '–'}</td>
        <td>${p.email}</td>
        <td>${p.convenio ? `<span class="badge badge-blue">${p.convenio}</span>` : '<span class="text-muted">–</span>'}</td>
        <td class="text-muted text-small">${Utils.fmtDateBR(p.created_at)}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap"></td>
      `;
      const actCell = tr.lastElementChild;
      const btnVer = document.createElement('button');
      btnVer.className = 'btn btn-sm btn-secondary';
      btnVer.innerHTML = '<i class="fa fa-eye"></i>';
      btnVer.title = Lang.t('doc.details');
      btnVer.addEventListener('click', () => openDetalhePaciente(p.id));
      actCell.appendChild(btnVer);

      if (canEdit) {
        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn btn-sm btn-secondary';
        btnEdit.innerHTML = '<i class="fa fa-edit"></i>';
        btnEdit.title = Lang.t('btn.save_changes');
        btnEdit.addEventListener('click', () => openFormPaciente(p));
        actCell.appendChild(btnEdit);
      }

      tbody.appendChild(tr);
    });
  } catch(e) {
    loading.classList.add('hidden');
    showToast(e.message, 'error');
  }
}

function openFormPaciente(p = null) {
  openModal(`
    <h2 class="modal-title"><i class="fa fa-user-plus"></i> ${p ? Lang.t('pat.edit_title') : Lang.t('pat.new_title')}</h2>
    <div class="form-row">
      <div class="form-group"><label>${Lang.t('pat.full_name')}</label><input id="fp-nome" value="${p?.nome||''}" placeholder="${Lang.t('pat.full_name')}"></div>
      <div class="form-group"><label>${Lang.t('pat.cpf_lbl')}</label><input id="fp-cpf" value="${p?.cpf||''}" placeholder="000.000.000-00"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>${Lang.t('pat.birth_lbl')}</label><input type="date" id="fp-nasc" value="${p?.data_nascimento||''}"></div>
      <div class="form-group"><label>${Lang.t('pat.phone_lbl')}</label><input id="fp-tel" value="${p?.telefone||''}" placeholder="(11) 99999-9999"></div>
    </div>
    <div class="form-group"><label>${Lang.t('pat.email_lbl')}</label><input type="email" id="fp-email" value="${p?.email||''}" placeholder="email@exemplo.com"></div>
    <div class="form-group"><label>${Lang.t('pat.address_lbl')}</label><input id="fp-end" value="${p?.endereco||''}" placeholder="${Lang.t('pat.address_lbl')}"></div>
    <div class="form-row">
      <div class="form-group"><label>${Lang.t('pat.insurance_lbl')}</label>
        <select id="fp-conv">
          <option value="">${Lang.t('general.private')}</option>
          <option value="Unimed"${p?.convenio==='Unimed'?' selected':''}>Unimed</option>
          <option value="SulAmérica"${p?.convenio==='SulAmérica'?' selected':''}>SulAmérica</option>
          <option value="Bradesco Saúde"${p?.convenio==='Bradesco Saúde'?' selected':''}>Bradesco Saúde</option>
          <option value="Amil"${p?.convenio==='Amil'?' selected':''}>Amil</option>
          <option value="Hapvida"${p?.convenio==='Hapvida'?' selected':''}>Hapvida</option>
          <option value="NotreDame"${p?.convenio==='NotreDame'?' selected':''}>NotreDame</option>
        </select>
      </div>
      <div class="form-group"><label>${Lang.t('pat.card_lbl')}</label><input id="fp-cart" value="${p?.numero_carteira||''}" placeholder="${Lang.t('pat.card_lbl')}"></div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">${Lang.t('btn.cancel')}</button>
      <button class="btn btn-primary" id="fp-salvar">${p ? Lang.t('pat.save_changes') : Lang.t('pat.register_btn')}</button>
    </div>
  `);

  document.getElementById('fp-salvar').addEventListener('click', async () => {
    const d = {
      nome: document.getElementById('fp-nome').value.trim(),
      cpf:  document.getElementById('fp-cpf').value.trim(),
      data_nascimento: document.getElementById('fp-nasc').value,
      telefone: document.getElementById('fp-tel').value.trim(),
      email: document.getElementById('fp-email').value.trim(),
      endereco: document.getElementById('fp-end').value.trim(),
      convenio: document.getElementById('fp-conv').value,
      numero_carteira: document.getElementById('fp-cart').value.trim(),
    };
    if (!d.nome || !d.cpf || !d.email) return showToast(Lang.t('general.required_fields'), 'warning');
    try {
      if (p) {
        await API.atualizarPaciente(p.id, d);
        showToast(Lang.t('pat.updated_toast'), 'success');
      } else {
        await API.criarPaciente(d);
        showToast(Lang.t('pat.created_toast'), 'success');
      }
      closeModal();
      await loadPacientes('');
    } catch(e) {
      showToast(e.message, 'error');
    }
  });
}

async function openDetalhePaciente(pid) {
  openModal(loadingHTML(Lang.t('general.loading')), '700px');
  try {
    const {paciente: p, consultas} = await API.pacienteById(pid);
    let html = `
      <h2 class="modal-title"><i class="fa fa-user-circle"></i> ${p.nome}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        <div><b>${Lang.t('pat.cpf_detail')}</b> ${p.cpf}</div>
        <div><b>${Lang.t('pat.birth_detail')}</b> ${Utils.fmtDateBR(p.data_nascimento)}</div>
        <div><b>${Lang.t('pat.phone_detail')}</b> ${p.telefone||'–'}</div>
        <div><b>${Lang.t('pat.email_detail')}</b> ${p.email}</div>
        <div style="grid-column:1/-1"><b>${Lang.t('pat.address_detail')}</b> ${p.endereco||'–'}</div>
        <div><b>${Lang.t('pat.insurance_detail')}</b> ${p.convenio ? `<span class="badge badge-blue">${p.convenio}</span>` : Lang.t('general.private')}</div>
        ${p.convenio ? `<div><b>${Lang.t('pat.card_detail')}</b> ${p.numero_carteira||'–'}</div>` : ''}
      </div>
      <div class="card-title" style="margin-bottom:12px"><i class="fa fa-history"></i> ${Lang.t('pat.history_title')}</div>`;

    if (!consultas.length) {
      html += emptyStateHTML('calendar', Lang.t('pat.no_consult'));
    } else {
      html += `<div class="table-wrapper"><table>
        <thead><tr><th>${Lang.t('pat.col_date_h')}</th><th>${Lang.t('pat.col_spec_h')}</th><th>${Lang.t('pat.col_doc_h')}</th><th>${Lang.t('pat.col_status_h')}</th><th>${Lang.t('pat.col_value_h')}</th></tr></thead>
        <tbody>`;
      consultas.forEach(c => {
        html += `<tr>
          <td>${Utils.fmtDateBR(c.data_hora)} ${Utils.fmtTime(c.data_hora)}</td>
          <td>${c.especialidade}</td>
          <td>${c.medico}</td>
          <td>${Utils.statusBadge(c.status)}</td>
          <td>${Utils.fmtMoney(c.valor)}</td>
        </tr>`;
      });
      html += '</tbody></table></div>';
    }
    document.getElementById('modal-content').innerHTML = html;
  } catch(e) {
    document.getElementById('modal-content').innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}
