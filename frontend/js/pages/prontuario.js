// pages/prontuario.js
async function renderProntuario(container, params = {}) {
  const user = App.getUser();
  const consulta = params.consulta || null;

  // Se veio de uma consulta específica
  if (consulta) {
    await renderProntuarioConsulta(container, consulta, user);
    return;
  }

  // Listagem de prontuários do paciente
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-file-medical" style="color:var(--primary)"></i> &nbsp;Prontuários</div>
      <div class="page-actions">
        ${(user.perfil === 'admin' || user.perfil === 'medico') ? '<button class="btn btn-primary" onclick="abrirNovoProntuario()"><i class="fa fa-plus"></i> Novo Prontuário</button>' : ''}
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
  sw.appendChild(Components.searchBar('Buscar paciente por nome, CPF ou e-mail...', Utils.debounce(async q => {
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
      list.innerHTML = emptyStateHTML('users','Nenhum paciente encontrado');
      return;
    }
    list.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Paciente</th><th>CPF</th><th>E-mail</th><th>Convênio</th><th>Ações</th></tr></thead>
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
      btn.innerHTML = '<i class="fa fa-file-medical"></i> Ver prontuários';
      btn.addEventListener('click', () => openProntPaciente(p));
      tr.lastElementChild.appendChild(btn);
      tbody.appendChild(tr);
    });
  } catch(e) {
    list.innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}

async function openProntPaciente(paciente) {
  openModal(loadingHTML('Carregando prontuários...'), '750px');
  try {
    const pronts = await API.prontuariosPaciente(paciente.id);
    let html = `
      <div class="pront-header">
        <div class="pront-patient"><i class="fa fa-user-circle"></i> ${paciente.nome}</div>
        <div class="pront-meta">
          <span><i class="fa fa-id-card"></i> CPF: ${paciente.cpf}</span>
          <span><i class="fa fa-phone"></i> ${paciente.telefone || '–'}</span>
          <span><i class="fa fa-heart"></i> ${paciente.convenio || 'Particular'}</span>
        </div>
      </div>`;

    if (!pronts.length) {
      html += emptyStateHTML('file-medical','Nenhum prontuário encontrado','Este paciente ainda não possui prontuários.');
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
            ${pr.anamnese ? `<div style="margin-bottom:8px"><b>Anamnese:</b><p class="text-small" style="margin-top:4px">${pr.anamnese}</p></div>` : ''}
            ${pr.diagnostico ? `<div style="margin-bottom:8px"><b>Diagnóstico:</b><p class="text-small" style="margin-top:4px">${pr.diagnostico}</p></div>` : ''}
            ${pr.prescricao ? `<div style="margin-bottom:8px"><b>Prescrição:</b><p class="text-small" style="margin-top:4px">${pr.prescricao}</p></div>` : ''}
            ${pr.observacoes ? `<div><b>Observações:</b><p class="text-small" style="margin-top:4px">${pr.observacoes}</p></div>` : ''}
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
      <div class="page-title"><i class="fa fa-file-medical" style="color:var(--primary)"></i> &nbsp;Prontuário da Consulta</div>
      <button class="btn btn-secondary" onclick="App.navigate('consultas')">
        <i class="fa fa-arrow-left"></i> Voltar
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
          <span class="card-title"><i class="fa fa-stethoscope"></i> Registro Clínico</span>
          ${existing ? '<span class="badge badge-green"><i class="fa fa-check"></i> Prontuário salvo</span>' : '<span class="badge badge-yellow"><i class="fa fa-clock"></i> Pendente</span>'}
        </div>
        <div class="card-body">
          <div class="form-group">
            <label><i class="fa fa-comments"></i> Anamnese</label>
            <textarea id="pr-anamnese" rows="4" ${readOnly?'readonly':''} placeholder="Queixas, histórico, sintomas...">${existing?.anamnese||''}</textarea>
          </div>
          <div class="form-group">
            <label><i class="fa fa-diagnoses"></i> Diagnóstico</label>
            <textarea id="pr-diagnostico" rows="3" ${readOnly?'readonly':''} placeholder="Hipótese diagnóstica, CID...">${existing?.diagnostico||''}</textarea>
          </div>
          <div class="form-group">
            <label><i class="fa fa-prescription"></i> Prescrição / Conduta</label>
            <textarea id="pr-prescricao" rows="4" ${readOnly?'readonly':''} placeholder="Medicamentos, posologia, orientações...">${existing?.prescricao||''}</textarea>
          </div>
          <div class="form-group">
            <label><i class="fa fa-notes-medical"></i> Observações</label>
            <textarea id="pr-obs" rows="2" ${readOnly?'readonly':''} placeholder="Informações adicionais...">${existing?.observacoes||''}</textarea>
          </div>
          ${!readOnly ? `
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
            <button class="btn btn-primary" id="btn-salvar-pront">
              <i class="fa fa-save"></i> Salvar Prontuário
            </button>
          </div>` : ''}
        </div>
      </div>

      <!-- EXAMES -->
      <div class="card" style="margin-top:16px">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-flask"></i> Exames Solicitados</span>
          ${!readOnly ? `<button class="btn btn-sm btn-secondary" id="btn-add-exame"><i class="fa fa-plus"></i> Solicitar exame</button>` : ''}
        </div>
        <div class="card-body">
          ${existing ? await getExamesHTML(existing.id) : '<p class="text-muted">Salve o prontuário para solicitar exames.</p>'}
        </div>
      </div>
    `;

    if (!readOnly) {
      document.getElementById('btn-salvar-pront')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-salvar-pront');
        btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Salvando...';
        try {
          await API.salvarProntuario({
            id_consulta: consulta.id,
            id_paciente: consulta.id_paciente,
            anamnese:    document.getElementById('pr-anamnese').value,
            diagnostico: document.getElementById('pr-diagnostico').value,
            prescricao:  document.getElementById('pr-prescricao').value,
            observacoes: document.getElementById('pr-obs').value,
          });
          showToast('Prontuário salvo com sucesso!', 'success');
          btn.innerHTML = '<i class="fa fa-check"></i> Salvo';
          setTimeout(() => { btn.disabled=false; btn.innerHTML='<i class="fa fa-save"></i> Salvar Prontuário'; }, 2000);
        } catch(e) {
          showToast(e.message, 'error');
          btn.disabled=false; btn.innerHTML='<i class="fa fa-save"></i> Salvar Prontuário';
        }
      });
    }

  } catch(e) {
    document.getElementById('pront-form-container').innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}

async function getExamesHTML(prontId) {
  // Placeholder - em produção buscaria da API
  return `<div class="empty-state" style="padding:20px">
    <i class="fa fa-flask" style="font-size:28px;opacity:.3"></i>
    <p style="margin-top:8px">Nenhum exame solicitado</p>
  </div>`;
}
