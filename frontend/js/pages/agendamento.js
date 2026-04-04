// pages/agendamento.js
// Fluxos:
//   medico   → Data/Hora → Paciente → Confirmação
//   paciente → Especialidade → Médico → Data/Hora → Confirmação
//   admin/recepcao → Especialidade → Médico → Data/Hora → Paciente → Confirmação

let _agStep = 1, _agData = {};

const MEDICO_FOTOS = {
  1: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=120&h=120&fit=crop&crop=face',
  2: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face',
  3: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=120&h=120&fit=crop&crop=face',
  4: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&h=120&fit=crop&crop=face',
  5: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face',
  6: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&h=120&fit=crop&crop=face',
};

function getSteps() {
  const p = App.getUser().perfil;
  if (p === 'medico')   return ['Data/Hora','Paciente','Confirmação'];
  if (p === 'paciente') return ['Especialidade','Médico','Data/Hora','Confirmação'];
  return ['Especialidade','Médico','Data/Hora','Paciente','Confirmação'];
}

async function renderAgendamento(container) {
  _agStep = 1; _agData = {};
  const user = App.getUser();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-calendar-plus" style="color:var(--primary)"></i> &nbsp;Novo Agendamento</div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="stepper" id="ag-stepper"></div>
        <div id="ag-step-content">${loadingHTML('Preparando agendamento...')}</div>
      </div>
    </div>`;

  // Médico: busca seus próprios dados pela rota segura
  if (user.perfil === 'medico') {
    try {
      const medico = await API.meuMedico();
      _agData.medico_id          = medico.id;
      _agData.medico_nome        = medico.nome;
      _agData.especialidade_id   = medico.id_especialidade;
      _agData.especialidade_nome = medico.especialidade_nome;
    } catch(e) {
      // fallback pelo token
      _agData.medico_id   = user.id_ref;
      _agData.medico_nome = user.nome;
    }
  }

  renderAgStepper();
  await renderAgStep();
}

function renderAgStepper() {
  const steps = getSteps();
  let html = '';
  steps.forEach((s, i) => {
    const n = i + 1;
    const cls = n < _agStep ? 'step done' : n === _agStep ? 'step active' : 'step';
    html += `<div class="${cls}">
      ${i > 0 ? '<div class="step-line"></div>' : ''}
      <div class="step-num">${n < _agStep ? '<i class="fa fa-check"></i>' : n}</div>
      <div class="step-label">${s}</div>
    </div>`;
  });
  document.getElementById('ag-stepper').innerHTML = html;
}

async function renderAgStep() {
  const c   = document.getElementById('ag-step-content');
  c.innerHTML = loadingHTML();
  const p = App.getUser().perfil;

  if (p === 'medico') {
    if      (_agStep === 1) await agStep3(c);
    else if (_agStep === 2) await agStep4(c);
    else if (_agStep === 3) await agStep5(c);
  } else if (p === 'paciente') {
    if      (_agStep === 1) await agStep1(c);
    else if (_agStep === 2) await agStep2(c);
    else if (_agStep === 3) await agStep3(c);
    else if (_agStep === 4) await agAutoFillPaciente(c);
    else if (_agStep === 5) await agStep5(c);
  } else {
    if      (_agStep === 1) await agStep1(c);
    else if (_agStep === 2) await agStep2(c);
    else if (_agStep === 3) await agStep3(c);
    else if (_agStep === 4) await agStep4(c);
    else if (_agStep === 5) await agStep5(c);
  }
}

// Paciente: auto-preenche e avança
async function agAutoFillPaciente(c) {
  c.innerHTML = loadingHTML('Identificando seus dados...');
  try {
    const perfil = await API.meuPerfil();
    _agData.paciente_id   = perfil.id;
    _agData.paciente_nome = perfil.nome || App.getUser().nome;
    _agData.convenio      = perfil.convenio || '';
    if (!_agData.paciente_id) throw new Error('sem id');
    _agStep++; renderAgStepper(); renderAgStep();
  } catch(e) {
    const u = App.getUser();
    _agData.paciente_id   = u.id_ref || u.sub;
    _agData.paciente_nome = u.nome;
    _agData.convenio      = '';
    if (_agData.paciente_id) { _agStep++; renderAgStepper(); renderAgStep(); }
    else c.innerHTML = `<div class="error-msg">Erro ao identificar paciente. Tente sair e entrar novamente.</div>`;
  }
}

// ── STEP 1: Especialidade ─────────────────────────────────────────────────────
async function agStep1(c) {
  try {
    const esps = await API.especialidades();
    const colors = ['blue','green','orange','purple','red','teal'];
    let html = '<h3 style="margin-bottom:16px">Selecione a especialidade</h3><div class="doctor-cards">';
    esps.forEach((e, i) => {
      html += `<div class="card doctor-card" onclick="agSelectEsp(${e.id},'${e.nome.replace(/'/g,"\\'")}')">
        <div class="doctor-avatar" style="background:var(--${colors[i%colors.length]},var(--primary))">
          <i class="fa fa-${e.icone||'stethoscope'}"></i>
        </div>
        <div class="doctor-name">${e.nome}</div>
        <div class="text-muted text-small">${e.descricao||''}</div>
        <div class="text-small mt-4"><i class="fa fa-clock"></i> ${e.duracao_minutos} min</div>
      </div>`;
    });
    html += '</div>';
    c.innerHTML = html;
  } catch(e) { c.innerHTML = `<div class="error-msg">${e.message}</div>`; }
}
function agSelectEsp(id, nome) {
  _agData.especialidade_id = id; _agData.especialidade_nome = nome;
  _agStep++; renderAgStepper(); renderAgStep();
}

// ── STEP 2: Médico ────────────────────────────────────────────────────────────
async function agStep2(c) {
  try {
    const medicos = await API.medicos(_agData.especialidade_id);
    let html = `<h3 style="margin-bottom:16px">Selecione o médico</h3>
      <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()">
        <i class="fa fa-arrow-left"></i> Voltar
      </button>
      <div class="doctor-cards" style="margin-top:16px">`;
    medicos.forEach(m => {
      const foto = MEDICO_FOTOS[m.id];
      const init = m.nome.split(' ').map(n=>n[0]).slice(0,2).join('');
      html += `<div class="card doctor-card" onclick="agSelectMedico(${m.id},'${m.nome.replace(/'/g,"\\'")}')">
        <div class="doctor-avatar-wrap">
          ${foto ? `<img src="${foto}" alt="${m.nome}" class="doctor-photo"
            onerror="this.style.display='none';this.nextSibling.style.display='flex'">` : ''}
          <div class="doctor-avatar" style="${foto?'display:none':''}">${init}</div>
        </div>
        <div class="doctor-name">${m.nome}</div>
        <div class="doctor-esp"><i class="fa fa-stethoscope"></i> ${m.especialidade_nome}</div>
        <div class="text-small mt-4 text-muted"><i class="fa fa-id-card"></i> ${m.crm}</div>
        ${m.bio ? `<div class="text-small mt-4" style="color:var(--text-muted)">${m.bio}</div>` : ''}
      </div>`;
    });
    html += '</div>';
    c.innerHTML = html;
  } catch(e) { c.innerHTML = `<div class="error-msg">${e.message}</div>`; }
}
function agSelectMedico(id, nome) {
  _agData.medico_id = id; _agData.medico_nome = nome;
  _agStep++; renderAgStepper(); renderAgStep();
}

// ── STEP 3: Data/Hora ─────────────────────────────────────────────────────────
async function agStep3(c) {
  const perfil  = App.getUser().perfil;
  const minDate = Utils.today();
  const maxDate = Utils.addDays(60);

  // Garante que medico_id está definido (pode ter vindo do token no fallback)
  if (!_agData.medico_id) {
    c.innerHTML = `<div class="error-msg">Erro ao carregar dados do médico. Atualize a página e tente novamente.</div>`;
    return;
  }

  const voltarBtn = perfil !== 'medico'
    ? `<button class="btn btn-secondary btn-sm" style="margin-bottom:12px"
         onclick="_agStep--;renderAgStepper();renderAgStep()">
         <i class='fa fa-arrow-left'></i> Voltar
       </button>` : '';

  const medicoInfo = (perfil === 'medico' && _agData.medico_nome)
    ? `<div class="ag-medico-banner">
         <div class="doctor-avatar" style="width:42px;height:42px;font-size:16px;flex-shrink:0">
           ${_agData.medico_nome.split(' ').map(n=>n[0]).slice(0,2).join('')}
         </div>
         <div>
           <div style="font-weight:700">${_agData.medico_nome}</div>
           <div class="text-small text-muted">
             <i class="fa fa-stethoscope"></i> ${_agData.especialidade_nome||''}
           </div>
         </div>
       </div>` : '';

  c.innerHTML = `
    <h3 style="margin-bottom:12px">Selecione a data e horário</h3>
    ${voltarBtn}
    ${medicoInfo}
    <div class="form-row" style="margin-top:12px;max-width:420px">
      <div class="form-group">
        <label><i class="fa fa-calendar"></i> Data</label>
        <input type="date" id="ag-data" min="${minDate}" max="${maxDate}" value="${minDate}">
      </div>
      <div class="form-group">
        <label><i class="fa fa-stethoscope"></i> Tipo</label>
        <select id="ag-tipo">
          <option value="presencial">Presencial</option>
          <option value="telemedicina">Telemedicina</option>
        </select>
      </div>
    </div>
    <div id="ag-slots-container"></div>`;

  document.getElementById('ag-data').addEventListener('change', e => loadSlots(e.target.value));
  await loadSlots(minDate);
}

async function loadSlots(data) {
  const container = document.getElementById('ag-slots-container');
  if (!container || !_agData.medico_id) return;
  container.innerHTML = loadingHTML('Buscando horários...');
  try {
    const {slots, duracao} = await API.disponibilidade(_agData.medico_id, data);
    if (!slots.length) {
      container.innerHTML = `<div class="empty-state"><i class="fa fa-calendar-xmark"></i><h3>Sem horários neste dia</h3><p>Selecione outro dia da semana.</p></div>`;
      return;
    }
    let html = `<div style="margin-bottom:8px;font-weight:600">Horários disponíveis (${duracao} min):</div><div class="slots-grid">`;
    slots.forEach(s => {
      html += `<div class="slot-btn${!s.disponivel?' unavailable':''}"
        data-dt="${s.datetime}" onclick="agSelectSlot('${s.datetime}','${s.hora}')">${s.hora}</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch(e) {
    container.innerHTML = `<div class="error-msg">Erro ao buscar horários: ${e.message}</div>`;
  }
}

function agSelectSlot(datetime, hora) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`[data-dt="${datetime}"]`)?.classList.add('selected');
  _agData.data_hora    = datetime;
  _agData.hora_display = hora;
  _agData.tipo         = document.getElementById('ag-tipo')?.value || 'presencial';
  setTimeout(() => { _agStep++; renderAgStepper(); renderAgStep(); }, 300);
}

// ── STEP 4: Paciente ──────────────────────────────────────────────────────────
async function agStep4(c) {
  c.innerHTML = `
    <h3 style="margin-bottom:12px">Selecione ou cadastre o paciente</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()">
      <i class="fa fa-arrow-left"></i> Voltar
    </button>
    <div style="margin:14px 0">
      <button class="btn btn-success btn-sm" id="btn-novo-pac-ag">
        <i class="fa fa-user-plus"></i> Novo paciente
      </button>
    </div>
    <div id="form-novo-pac" class="hidden form-novo-pac-dark-fix">
      <div style="font-weight:700;margin-bottom:12px;color:var(--secondary)"><i class="fa fa-user-plus"></i> Cadastrar novo paciente</div>
      <div class="form-row">
        <div class="form-group"><label>Nome completo *</label><input id="np-nome" placeholder="Nome do paciente"></div>
        <div class="form-group"><label>CPF *</label><input id="np-cpf" placeholder="000.000.000-00"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>E-mail *</label><input type="email" id="np-email" placeholder="email@exemplo.com"></div>
        <div class="form-group"><label>Telefone</label><input id="np-tel" placeholder="(11) 99999-9999"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Convênio</label>
          <select id="np-conv">
            <option value="">Particular</option>
            <option value="Unimed">Unimed</option>
            <option value="SulAmérica">SulAmérica</option>
            <option value="Bradesco Saúde">Bradesco Saúde</option>
            <option value="Amil">Amil</option>
            <option value="Hapvida">Hapvida</option>
          </select>
        </div>
        <div class="form-group"><label>Nº Carteirinha</label><input id="np-cart" placeholder="Número"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-success" id="btn-salvar-novo-pac"><i class="fa fa-save"></i> Cadastrar e selecionar</button>
        <button class="btn btn-secondary" onclick="document.getElementById('form-novo-pac').classList.add('hidden')">Cancelar</button>
      </div>
      <div id="np-error" class="error-msg"></div>
    </div>
    <div style="font-weight:600;margin-bottom:8px;color:var(--text-muted)"><i class="fa fa-users"></i> Pacientes cadastrados</div>
    <div id="ag-pac-search-wrap"></div>
    <div class="card" style="margin-top:8px">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nome</th><th>CPF</th><th>Convênio</th><th></th></tr></thead>
          <tbody id="ag-pac-tbody"></tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('btn-novo-pac-ag').addEventListener('click', () => {
    document.getElementById('form-novo-pac').classList.toggle('hidden');
  });
  document.getElementById('btn-salvar-novo-pac').addEventListener('click', async () => {
    const errEl = document.getElementById('np-error');
    errEl.textContent = '';
    const d = {
      nome: document.getElementById('np-nome').value.trim(),
      cpf:  document.getElementById('np-cpf').value.trim(),
      email: document.getElementById('np-email').value.trim(),
      telefone: document.getElementById('np-tel').value.trim(),
      convenio: document.getElementById('np-conv').value,
      numero_carteira: document.getElementById('np-cart').value.trim(),
    };
    if (!d.nome||!d.cpf||!d.email) { errEl.textContent='Preencha nome, CPF e e-mail.'; return; }
    const btn = document.getElementById('btn-salvar-novo-pac');
    btn.disabled=true; btn.innerHTML='<i class="fa fa-spinner fa-spin"></i> Cadastrando...';
    try {
      const res = await API.criarPaciente(d);
      _agData.paciente_id = res.id; _agData.paciente_nome = d.nome; _agData.convenio = d.convenio||'';
      showToast(`${d.nome} cadastrado!`,'success');
      _agStep++; renderAgStepper(); renderAgStep();
    } catch(e) {
      errEl.textContent = e.message;
      btn.disabled=false; btn.innerHTML='<i class="fa fa-save"></i> Cadastrar e selecionar';
    }
  });

  const sw = document.getElementById('ag-pac-search-wrap');
  sw.appendChild(Components.searchBar('Buscar paciente...', Utils.debounce(async q => {
    try { renderAgPacientes(await API.pacientes(q)); } catch(e) { showToast(e.message,'error'); }
  }, 300)));
  try { renderAgPacientes(await API.pacientes('')); }
  catch(e) {
    document.getElementById('ag-pac-tbody').innerHTML =
      `<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--text-muted)">${e.message}</td></tr>`;
  }
}

function renderAgPacientes(list) {
  const tbody = document.getElementById('ag-pac-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding:16px;text-align:center;color:var(--text-muted)">Nenhum paciente encontrado</td></tr>`;
    return;
  }
  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${p.nome}</b></td>
      <td class="text-muted">${p.cpf}</td>
      <td>${p.convenio?`<span class="badge badge-blue">${p.convenio}</span>`:'Particular'}</td>
      <td><button class="btn btn-sm btn-primary">Selecionar</button></td>`;
    tr.querySelector('button').addEventListener('click', () => {
      _agData.paciente_id = p.id; _agData.paciente_nome = p.nome; _agData.convenio = p.convenio||'';
      _agStep++; renderAgStepper(); renderAgStep();
    });
    tbody.appendChild(tr);
  });
}

// ── STEP 5: Confirmação ───────────────────────────────────────────────────────
async function agStep5(c) {
  const valores = {'Clínica Geral':150,'Pediatria':150,'Cardiologia':250,'Ortopedia':200,'Nutrição':180,'Psicologia':200};
  _agData.valor = valores[_agData.especialidade_nome] || 200;
  const foto = MEDICO_FOTOS[_agData.medico_id];
  c.innerHTML = `
    <h3 style="margin-bottom:12px"><i class="fa fa-check-circle" style="color:var(--secondary)"></i> Confirme o Agendamento</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()">
      <i class="fa fa-arrow-left"></i> Voltar
    </button>
    <div class="ag-confirm-card">
      <div class="ag-confirm-medico">
        ${foto?`<img src="${foto}" alt="${_agData.medico_nome}" class="ag-confirm-foto"
          onerror="this.style.display='none';this.nextSibling.style.display='flex'">`:'' }
        <div class="doctor-avatar ag-confirm-avatar" style="${foto?'display:none':''}">
          ${(_agData.medico_nome||'').split(' ').map(n=>n[0]).slice(0,2).join('')}
        </div>
        <div>
          <div style="font-weight:700;font-size:16px">${_agData.medico_nome}</div>
          <div class="text-muted text-small"><i class="fa fa-stethoscope"></i> ${_agData.especialidade_nome||''}</div>
        </div>
      </div>
      <div class="ag-confirm-info">
        <div class="ag-confirm-row"><i class="fa fa-calendar"></i><span>${Utils.fmtDateBR(_agData.data_hora)}</span></div>
        <div class="ag-confirm-row"><i class="fa fa-clock"></i><span>${_agData.hora_display}</span></div>
        <div class="ag-confirm-row"><i class="fa fa-user"></i><span>${_agData.paciente_nome||'–'}</span></div>
        <div class="ag-confirm-row">
          <i class="fa fa-${_agData.tipo==='telemedicina'?'video':'hospital'}"></i>
          <span>${_agData.tipo==='telemedicina'?'Telemedicina':'Presencial'}</span>
        </div>
        <div class="ag-confirm-row"><i class="fa fa-heart"></i><span>${_agData.convenio||'Particular'}</span></div>
        <div class="ag-confirm-row ag-confirm-valor">
          <i class="fa fa-dollar-sign"></i><span>${Utils.fmtMoney(_agData.valor)}</span>
        </div>
      </div>
    </div>
    <div class="form-group" style="margin-top:16px">
      <label><i class="fa fa-notes-medical"></i> Observações (opcional)</label>
      <textarea id="ag-obs" rows="2" placeholder="Ex: paciente em jejum, queixa principal..."></textarea>
    </div>
    <button class="btn btn-primary btn-block" id="ag-confirmar" style="margin-top:8px">
      <i class="fa fa-calendar-check"></i> Confirmar Agendamento
    </button>
    <div id="ag-result"></div>`;

  document.getElementById('ag-confirmar').addEventListener('click', async () => {
    const btn = document.getElementById('ag-confirmar');
    btn.disabled=true; btn.innerHTML='<i class="fa fa-spinner fa-spin"></i> Agendando...';
    try {
      await API.criarConsulta({
        id_paciente: _agData.paciente_id,
        id_medico:   _agData.medico_id,
        data_hora:   _agData.data_hora,
        tipo:        _agData.tipo,
        valor:       _agData.valor,
        convenio:    _agData.convenio,
        observacoes: document.getElementById('ag-obs').value,
      });
      document.getElementById('ag-result').innerHTML = `
        <div style="text-align:center;padding:30px">
          <i class="fa fa-check-circle" style="font-size:56px;color:var(--secondary);display:block;margin-bottom:14px"></i>
          <h2 style="color:var(--secondary)">Consulta agendada com sucesso!</h2>
          <button class="btn btn-primary" style="margin-top:16px" onclick="App.navigate('consultas')">
            <i class="fa fa-list"></i> Ver consultas
          </button>
        </div>`;
      btn.remove();
      showToast('Consulta agendada!','success');
    } catch(e) {
      btn.disabled=false; btn.innerHTML='<i class="fa fa-calendar-check"></i> Confirmar Agendamento';
      showToast(e.message,'error');
    }
  });
}
