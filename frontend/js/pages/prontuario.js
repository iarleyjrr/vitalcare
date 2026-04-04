// pages/prontuario.js
async function renderProntuario(container, params = {}) {
  const user = App.getUser();
  const consulta = params.consulta || null;

  if (consulta) {
    await renderProntuarioConsulta(container, consulta, user);
    return;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-file-medical" style="color:var(--primary)"></i> &nbsp;${Lang.t('rec.title')}</div>
      <div class="page-actions">
        ${(user.perfil === 'admin' || user.perfil === 'medico') ? `<button class="btn btn-primary" onclick="abrirNovoProntuario()"><i class="fa fa-plus"></i> ${Lang.t('rec.new')}</button>` : ''}
      </div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-body">
        <div id="pront-search-wrap"></div>
      </div>
    </div>
    <div id="pront-list"></div>
  `;

  const sw = document.getElementById('pront-search-wrap');
  sw.appendChild(Components.searchBar(Lang.t('pront.search_ph'), Utils.debounce(async q => {
    await loadProntPacientes(q);
  }, 350)));

  await loadProntPacientes('');
}

async function loadProntPacientes(q) {
  const list = document.getElementById('pront-list');
  if (!list) return;
  list.innerHTML = loadingHTML();
  try {
    const pacientes = await API.pacientes(q);
    if (!pacientes.length) {
      list.innerHTML = emptyStateHTML('users', Lang.t('pront.not_found'));
      return;
    }
    list.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr>
                <th>${Lang.t('pront.col_patient')}</th>
                <th>${Lang.t('pront.col_cpf')}</th>
                <th>${Lang.t('pront.col_email')}</th>
                <th>${Lang.t('pront.col_insurance')}</th>
                <th>${Lang.t('pront.col_actions')}</th>
              </tr></thead>
              <tbody id="pront-pac-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>`;
    const tbody = document.getElementById('pront-pac-tbody');
    pacientes.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${p.nome}</b></td>
        <td class="text-muted">${p.cpf}</td>
        <td>${p.email}</td>
        <td>${p.convenio ? `<span class="badge badge-blue">${p.convenio}</span>` : '–'}</td>
        <td></td>`;
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-primary';
      btn.innerHTML = `<i class="fa fa-file-medical"></i> ${Lang.t('pront.view_btn')}`;
      btn.addEventListener('click', () => openProntPaciente(p));
      tr.lastElementChild.appendChild(btn);
      tbody.appendChild(tr);
    });
  } catch(e) {
    list.innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}

async function openProntPaciente(paciente) {
  openModal(loadingHTML(Lang.t('general.loading')), '750px');
  try {
    const pronts = await API.prontuariosPaciente(paciente.id);
    let html = `
      <div class="pront-header">
        <div class="pront-patient"><i class="fa fa-user-circle"></i> ${paciente.nome}</div>
        <div class="pront-meta">
          <span><i class="fa fa-id-card"></i> ${Lang.t('pat.cpf_detail')} ${paciente.cpf}</span>
          <span><i class="fa fa-phone"></i> ${paciente.telefone || '–'}</span>
          <span><i class="fa fa-heart"></i> ${paciente.convenio || Lang.t('general.private')}</span>
        </div>
      </div>`;

    if (!pronts.length) {
      html += emptyStateHTML('file-medical', Lang.t('pront.no_pront'), Lang.t('pront.no_pront_desc'));
    } else {
      pronts.forEach(pr => {
        html += `
          <div class="card" style="margin-bottom:12px;padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <div>
                <b>${Utils.fmtDateBR(pr.data_hora)}</b> às ${Utils.fmtTime(pr.data_hora)}
                &nbsp;·&nbsp; <span class="badge badge-blue">${pr.especialidade}</span>
              </div>
              <div class="text-muted text-small"><i class="fa fa-user-doctor"></i> ${pr.medico}</div>
            </div>
            <div class="divider"></div>
            ${pr.anamnese ? `<div style="margin-bottom:8px"><b>${Lang.t('rec.anamnesis')}:</b><p class="text-small" style="margin-top:4px">${pr.anamnese}</p></div>` : ''}
            ${pr.diagnostico ? `<div style="margin-bottom:8px"><b>${Lang.t('rec.diagnosis')}:</b><p class="text-small" style="margin-top:4px">${pr.diagnostico}</p></div>` : ''}
            ${pr.prescricao ? `<div style="margin-bottom:8px"><b>${Lang.t('rec.prescription')}:</b><p class="text-small" style="margin-top:4px">${pr.prescricao}</p></div>` : ''}
            ${pr.observacoes ? `<div><b>${Lang.t('rec.observations')}:</b><p class="text-small" style="margin-top:4px">${pr.observacoes}</p></div>` : ''}
          </div>`;
      });
    }
    document.getElementById('modal-content').innerHTML = html;
  } catch(e) {
    document.getElementById('modal-content').innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}

async function renderProntuarioConsulta(container, consulta, user) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-file-medical" style="color:var(--primary)"></i> &nbsp;${Lang.t('pront.consult_title')}</div>
      <button class="btn btn-secondary" onclick="App.navigate('consultas')">
        <i class="fa fa-arrow-left"></i> ${Lang.t('btn.back')}
      </button>
    </div>
    <div class="pront-header">
      <div class="pront-patient"><i class="fa fa-user-circle"></i> ${consulta.paciente_nome}</div>
      <div class="pront-meta">
        <span><i class="fa fa-calendar"></i> ${Utils.fmtDateBR(consulta.data_hora)} às ${Utils.fmtTime(consulta.data_hora)}</span>
        <span><i class="fa fa-stethoscope"></i> ${consulta.especialidade}</span>
        <span><i class="fa fa-user-doctor"></i> ${consulta.medico_nome}</span>
        ${Utils.statusBadge(consulta.status)}
      </div>
    </div>
    <div id="pront-form-container">${loadingHTML()}</div>
  `;

  try {
    const existing = await API.prontuarioConsulta(consulta.id);
    const readOnly = user.perfil !== 'medico' && user.perfil !== 'admin';

    document.getElementById('pront-form-container').innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-stethoscope"></i> ${Lang.t('pront.clinical_record')}</span>
          ${existing
            ? `<span class="badge badge-green"><i class="fa fa-check"></i> ${Lang.t('pront.saved_badge')}</span>`
            : `<span class="badge badge-yellow"><i class="fa fa-clock"></i> ${Lang.t('pront.pending_badge')}</span>`}
        </div>
        <div class="card-body">
          <div class="form-group">
            <label><i class="fa fa-comments"></i> ${Lang.t('rec.anamnesis')}</label>
            <textarea id="pr-anamnese" rows="4" ${readOnly?'readonly':''} placeholder="${Lang.t('pront.ph_anamnesis')}">${existing?.anamnese||''}</textarea>
          </div>
          <div class="form-group">
            <label><i class="fa fa-diagnoses"></i> ${Lang.t('rec.diagnosis')}</label>
            <textarea id="pr-diagnostico" rows="3" ${readOnly?'readonly':''} placeholder="${Lang.t('pront.ph_diagnosis')}">${existing?.diagnostico||''}</textarea>
          </div>
          <div class="form-group">
            <label><i class="fa fa-prescription"></i> ${Lang.t('rec.prescription')}</label>
            <textarea id="pr-prescricao" rows="4" ${readOnly?'readonly':''} placeholder="${Lang.t('pront.ph_prescription')}">${existing?.prescricao||''}</textarea>
          </div>
          <div class="form-group">
            <label><i class="fa fa-notes-medical"></i> ${Lang.t('rec.observations')}</label>
            <textarea id="pr-obs" rows="2" ${readOnly?'readonly':''} placeholder="${Lang.t('pront.ph_observations')}">${existing?.observacoes||''}</textarea>
          </div>
          ${!readOnly ? `
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
            <button class="btn btn-primary" id="btn-salvar-pront">
              <i class="fa fa-save"></i> ${Lang.t('pront.save_btn')}
            </button>
          </div>` : ''}
        </div>
      </div>

      <!-- EXAMES -->
      <div class="card" style="margin-top:16px">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-flask"></i> ${Lang.t('pront.exams_title')}</span>
          ${!readOnly ? `<button class="btn btn-sm btn-secondary" id="btn-add-exame"><i class="fa fa-plus"></i> ${Lang.t('pront.request_exam')}</button>` : ''}
        </div>
        <div class="card-body">
          ${existing ? await getExamesHTML(existing.id) : `<p class="text-muted">${Lang.t('pront.save_first')}</p>`}
        </div>
      </div>
    `;

    if (!readOnly) {
      document.getElementById('btn-salvar-pront')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-salvar-pront');
        btn.disabled = true; btn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${Lang.t('pront.saving')}`;
        try {
          await API.salvarProntuario({
            id_consulta: consulta.id,
            id_paciente: consulta.id_paciente,
            anamnese:    document.getElementById('pr-anamnese').value,
            diagnostico: document.getElementById('pr-diagnostico').value,
            prescricao:  document.getElementById('pr-prescricao').value,
            observacoes: document.getElementById('pr-obs').value,
          });
          showToast(Lang.t('pront.saved_ok'), 'success');
          btn.innerHTML = `<i class="fa fa-check"></i> ${Lang.t('pront.saved_badge')}`;
          setTimeout(() => { btn.disabled=false; btn.innerHTML=`<i class="fa fa-save"></i> ${Lang.t('pront.save_btn')}`; }, 2000);
        } catch(e) {
          showToast(e.message, 'error');
          btn.disabled=false; btn.innerHTML=`<i class="fa fa-save"></i> ${Lang.t('pront.save_btn')}`;
        }
      });
    }

  } catch(e) {
    document.getElementById('pront-form-container').innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}

async function getExamesHTML(prontId) {
  return `<div class="empty-state" style="padding:20px">
    <i class="fa fa-flask" style="font-size:28px;opacity:.3"></i>
    <p style="margin-top:8px">${Lang.t('pront.no_exams')}</p>
  </div>`;
}

async function abrirNovoProntuario() {
  try {
    const [pacientes, consultas] = await Promise.all([
      API.pacientes(''),
      API.consultas({})
    ]);

    const consultasAbertas = consultas.filter(c => !['cancelada'].includes(c.status));
    let optsPac = pacientes.map(p =>
      `<option value="${p.id}">${p.nome} — ${p.cpf}</option>`
    ).join('');

    openModal(
      `<h2 class="modal-title"><i class="fa fa-file-medical"></i> ${Lang.t('rec.new')}</h2>
      <div class="form-group">
        <label>${Lang.t('pront.select_patient_lbl')}</label>
        <select id="np-pid">
          <option value="">${Lang.t('pront.select_patient')}</option>
          ${optsPac}
        </select>
      </div>
      <div class="form-group" id="np-consulta-wrap" style="display:none">
        <label>${Lang.t('pront.assoc_consult')}</label>
        <select id="np-cid">
          <option value="">${Lang.t('pront.select_consult')}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${Lang.t('rec.anamnesis')}</label>
        <textarea id="np-anam" rows="3" placeholder="${Lang.t('pront.ph_anamnesis_new')}"></textarea>
      </div>
      <div class="form-group">
        <label>${Lang.t('rec.diagnosis')}</label>
        <textarea id="np-diag" rows="2" placeholder="${Lang.t('pront.ph_diagnosis_new')}"></textarea>
      </div>
      <div class="form-group">
        <label>${Lang.t('rec.prescription')}</label>
        <textarea id="np-presc" rows="2" placeholder="${Lang.t('pront.ph_prescription')}"></textarea>
      </div>
      <div class="form-group">
        <label>${Lang.t('rec.observations')}</label>
        <textarea id="np-obs" rows="2" placeholder="${Lang.t('pront.ph_observations')}"></textarea>
      </div>
      <div id="np-error" class="error-msg"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn btn-secondary" onclick="closeModal()">${Lang.t('btn.cancel')}</button>
        <button class="btn btn-primary" id="np-salvar">
          <i class="fa fa-save"></i> ${Lang.t('pront.save_btn')}
        </button>
      </div>`
    );

    document.getElementById('np-pid').addEventListener('change', function() {
      const pid = this.value;
      const wrap = document.getElementById('np-consulta-wrap');
      const sel  = document.getElementById('np-cid');
      if (!pid) { wrap.style.display='none'; return; }
      const pacs = consultasAbertas.filter(c => String(c.id_paciente) === String(pid));
      if (pacs.length === 0) {
        wrap.style.display='none';
        document.getElementById('np-error').textContent = Lang.t('pront.no_consult_err');
        return;
      }
      document.getElementById('np-error').textContent = '';
      sel.innerHTML = `<option value="">${Lang.t('pront.select_consult')}</option>` +
        pacs.map(c =>
          `<option value="${c.id}">${Utils.fmtDateBR(c.data_hora)} ${Utils.fmtTime(c.data_hora)} — ${c.medico_nome||''} — ${c.status}</option>`
        ).join('');
      wrap.style.display = 'block';
    });

    document.getElementById('np-salvar').addEventListener('click', async () => {
      const pid = document.getElementById('np-pid').value;
      const cid = document.getElementById('np-cid').value;
      const errEl = document.getElementById('np-error');
      errEl.textContent = '';
      if (!pid) { errEl.textContent = Lang.t('pront.select_patient_err'); return; }
      if (!cid) { errEl.textContent = Lang.t('pront.select_consult_err'); return; }

      const btn = document.getElementById('np-salvar');
      btn.disabled = true;
      btn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${Lang.t('pront.saving')}`;
      try {
        await API.salvarProntuario({
          id_consulta:  parseInt(cid),
          id_paciente:  parseInt(pid),
          anamnese:     document.getElementById('np-anam').value,
          diagnostico:  document.getElementById('np-diag').value,
          prescricao:   document.getElementById('np-presc').value,
          observacoes:  document.getElementById('np-obs').value,
        });
        showToast(Lang.t('pront.saved_ok'), 'success');
        closeModal();
        renderProntuario(document.getElementById('page-container'));
      } catch(e) {
        errEl.textContent = e.message;
        btn.disabled = false;
        btn.innerHTML = `<i class="fa fa-save"></i> ${Lang.t('pront.save_btn')}`;
      }
    });

  } catch(e) { showToast(e.message, 'error'); }
}
