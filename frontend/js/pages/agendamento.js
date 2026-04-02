// pages/agendamento.js – wizard de agendamento
let _agStep = 1, _agData = {};

// Fotos de médicos (avatares ilustrativos com diversidade racial)
const MEDICO_FOTOS = {
  1: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=120&h=120&fit=crop&crop=face', // mulher branca médica
  2: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face', // homem negro médico
  3: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=120&h=120&fit=crop&crop=face', // mulher negra médica
  4: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&h=120&fit=crop&crop=face', // homem branco médico
  5: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face', // mulher branca nutricionista
  6: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&h=120&fit=crop&crop=face', // homem negro psicólogo
};

async function renderAgendamento(container) {
  _agStep = 1; _agData = {};
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-calendar-plus" style="color:var(--primary)"></i> &nbsp;Novo Agendamento</div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="stepper" id="ag-stepper"></div>
        <div id="ag-step-content"></div>
      </div>
    </div>
  `;
  renderAgStepper();
  await renderAgStep();
}

function renderAgStepper() {
  const steps = ['Especialidade','Médico','Data/Hora','Paciente','Confirmação'];
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
  const container = document.getElementById('ag-step-content');
  container.innerHTML = loadingHTML();
  if      (_agStep === 1) await agStep1(container);
  else if (_agStep === 2) await agStep2(container);
  else if (_agStep === 3) await agStep3(container);
  else if (_agStep === 4) await agStep4(container);
  else if (_agStep === 5) await agStep5(container);
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
        <div class="text-small mt-4"><i class="fa fa-clock"></i> ${e.duracao_minutos} min por consulta</div>
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
    let html = `
      <h3 style="margin-bottom:16px">Selecione o médico</h3>
      <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()">
        <i class="fa fa-arrow-left"></i> Voltar
      </button>
      <div class="doctor-cards" style="margin-top:16px">`;

    medicos.forEach(m => {
      const foto = MEDICO_FOTOS[m.id];
      const avatarHTML = foto
        ? `<img src="${foto}" alt="${m.nome}" class="doctor-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
      const initials = m.nome.split(' ').map(n=>n[0]).slice(0,2).join('');
      html += `<div class="card doctor-card" onclick="agSelectMedico(${m.id},'${m.nome.replace(/'/g,"\\'")}')">
        <div class="doctor-avatar-wrap">
          ${foto ? `<img src="${foto}" alt="${m.nome}" class="doctor-photo"
            onerror="this.style.display='none';this.nextSibling.style.display='flex'">` : ''}
          <div class="doctor-avatar" style="${foto ? 'display:none' : ''}">${initials}</div>
        </div>
        <div class="doctor-name">${m.nome}</div>
        <div class="doctor-esp"><i class="fa fa-stethoscope"></i> ${m.especialidade_nome}</div>
        <div class="text-small mt-4 text-muted"><i class="fa fa-id-card"></i> ${m.crm}</div>
        ${m.bio ? `<div class="text-small mt-4" style="color:#555">${m.bio}</div>` : ''}
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

// ── STEP 3: Data e Horário ────────────────────────────────────────────────────
async function agStep3(c) {
  const minDate = Utils.today();
  const maxDate = Utils.addDays(60);
  c.innerHTML = `
    <h3 style="margin-bottom:16px">Selecione a data e horário</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()">
      <i class="fa fa-arrow-left"></i> Voltar
    </button>
    <div class="form-row" style="margin-top:16px;max-width:420px">
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
    <div id="ag-slots-container"></div>
  `;
  document.getElementById('ag-data').addEventListener('change', async (e) => {
    await loadSlots(e.target.value);
  });
  await loadSlots(minDate);
}

async function loadSlots(data) {
  const container = document.getElementById('ag-slots-container');
  if (!container) return;
  container.innerHTML = loadingHTML('Buscando horários disponíveis...');
  try {
    const {slots, duracao} = await API.disponibilidade(_agData.medico_id, data);
    if (!slots.length) {
      container.innerHTML = `<div class="empty-state"><i class="fa fa-calendar-xmark"></i><h3>Sem horários neste dia</h3><p>Selecione outro dia.</p></div>`;
      return;
    }
    let html = `<div style="margin-bottom:8px;font-weight:600">Horários disponíveis (${duracao} min cada):</div><div class="slots-grid">`;
    slots.forEach(s => {
      html += `<div class="slot-btn${!s.disponivel?' unavailable':''}"
        data-dt="${s.datetime}" onclick="agSelectSlot('${s.datetime}','${s.hora}')">${s.hora}</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch(e) {
    container.innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}

function agSelectSlot(datetime, hora) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`[data-dt="${datetime}"]`)?.classList.add('selected');
  _agData.data_hora = datetime;
  _agData.hora_display = hora;
  _agData.tipo = document.getElementById('ag-tipo')?.value || 'presencial';
  _agData.data_display = document.getElementById('ag-data')?.value || '';
  setTimeout(() => { _agStep++; renderAgStepper(); renderAgStep(); }, 300);
}

// ── STEP 4: Paciente ──────────────────────────────────────────────────────────
async function agStep4(c) {
  const user = App.getUser();

  // Paciente → busca seus dados pela rota segura /api/auth/meu-perfil
  if (user.perfil === 'paciente') {
    c.innerHTML = loadingHTML('Identificando seus dados...');
    try {
      const perfil = await API.meuPerfil();
      _agData.paciente_id   = perfil.id;
      _agData.paciente_nome = perfil.nome || user.nome;
      _agData.convenio      = perfil.convenio || '';
      if (!_agData.paciente_id) throw new Error('ID não encontrado');
      _agStep++; renderAgStepper(); renderAgStep();
    } catch(e) {
      // Último recurso: usa dados direto do token
      _agData.paciente_id   = user.id_ref || user.sub;
      _agData.paciente_nome = user.nome;
      _agData.convenio      = '';
      if (_agData.paciente_id) {
        _agStep++; renderAgStepper(); renderAgStep();
      } else {
        c.innerHTML = `<div style="text-align:center;padding:30px">
          <i class="fa fa-circle-exclamation" style="font-size:40px;color:var(--danger);display:block;margin-bottom:12px"></i>
          <p style="margin-bottom:16px">Não foi possível identificar seus dados.<br>Tente sair e entrar novamente.</p>
          <button class="btn btn-secondary" onclick="_agStep--;renderAgStepper();renderAgStep()">
            <i class="fa fa-arrow-left"></i> Voltar
          </button>
        </div>`;
      }
    }
    return;
  }

  // Admin/Recepcionista → lista de pacientes para selecionar
  c.innerHTML = `
    <h3 style="margin-bottom:16px">Selecione o paciente</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()">
      <i class="fa fa-arrow-left"></i> Voltar
    </button>
    <div style="margin-top:16px" id="ag-pac-search-wrap"></div>
    <div class="card" style="margin-top:12px">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nome</th><th>CPF</th><th>Convênio</th><th></th></tr></thead>
          <tbody id="ag-pac-tbody"></tbody>
        </table>
      </div>
    </div>
  `;
  const sw = document.getElementById('ag-pac-search-wrap');
  sw.appendChild(Components.searchBar('Buscar paciente...', Utils.debounce(async q => {
    try {
      const data = await API.pacientes(q);
      renderAgPacientes(data);
    } catch(e) { showToast(e.message, 'error'); }
  }, 300)));
  try {
    const data = await API.pacientes('');
    renderAgPacientes(data);
  } catch(e) {
    document.getElementById('ag-pac-tbody').innerHTML =
      `<tr><td colspan="4" class="text-muted" style="padding:20px;text-align:center">${e.message}</td></tr>`;
  }
}

function renderAgPacientes(list) {
  const tbody = document.getElementById('ag-pac-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4">${emptyStateHTML('users','Nenhum paciente encontrado')}</td></tr>`;
    return;
  }
  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${p.nome}</b></td>
      <td class="text-muted">${p.cpf}</td>
      <td>${p.convenio ? `<span class="badge badge-blue">${p.convenio}</span>` : 'Particular'}</td>
      <td><button class="btn btn-sm btn-primary">Selecionar</button></td>`;
    tr.querySelector('button').addEventListener('click', () => {
      _agData.paciente_id   = p.id;
      _agData.paciente_nome = p.nome;
      _agData.convenio      = p.convenio || '';
      _agStep++; renderAgStepper(); renderAgStep();
    });
    tbody.appendChild(tr);
  });
}

// ── STEP 5: Confirmação ───────────────────────────────────────────────────────
async function agStep5(c) {
  const valores = {
    'Clínica Geral':150,'Pediatria':150,'Cardiologia':250,
    'Ortopedia':200,'Nutrição':180,'Psicologia':200
  };
  const valor = valores[_agData.especialidade_nome] || 200;
  _agData.valor = valor;

  const fotoMedico = MEDICO_FOTOS[_agData.medico_id];

  c.innerHTML = `
    <h3 style="margin-bottom:16px">
      <i class="fa fa-check-circle" style="color:var(--secondary)"></i> Confirme o Agendamento
    </h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()">
      <i class="fa fa-arrow-left"></i> Voltar
    </button>
    <div class="ag-confirm-card">
      <div class="ag-confirm-medico">
        ${fotoMedico
          ? `<img src="${fotoMedico}" alt="${_agData.medico_nome}" class="ag-confirm-foto"
               onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
          : ''}
        <div class="doctor-avatar ag-confirm-avatar" style="${fotoMedico?'display:none':''}">
          ${_agData.medico_nome.split(' ').map(n=>n[0]).slice(0,2).join('')}
        </div>
        <div>
          <div style="font-weight:700;font-size:16px">${_agData.medico_nome}</div>
          <div class="text-muted text-small"><i class="fa fa-stethoscope"></i> ${_agData.especialidade_nome}</div>
        </div>
      </div>
      <div class="ag-confirm-info">
        <div class="ag-confirm-row"><i class="fa fa-calendar"></i><span>${Utils.fmtDateBR(_agData.data_hora)}</span></div>
        <div class="ag-confirm-row"><i class="fa fa-clock"></i><span>${_agData.hora_display}</span></div>
        <div class="ag-confirm-row"><i class="fa fa-user"></i><span>${_agData.paciente_nome}</span></div>
        <div class="ag-confirm-row"><i class="fa fa-${_agData.tipo==='telemedicina'?'video':'hospital'}"></i>
          <span>${_agData.tipo === 'telemedicina' ? 'Telemedicina' : 'Presencial'}</span></div>
        <div class="ag-confirm-row"><i class="fa fa-heart"></i>
          <span>${_agData.convenio || 'Particular'}</span></div>
        <div class="ag-confirm-row ag-confirm-valor">
          <i class="fa fa-dollar-sign"></i><span>${Utils.fmtMoney(valor)}</span>
        </div>
      </div>
    </div>
    <div class="form-group" style="margin-top:16px">
      <label>Observações (opcional)</label>
      <textarea id="ag-obs" rows="2" placeholder="Informações adicionais..."></textarea>
    </div>
    <button class="btn btn-primary btn-block" id="ag-confirmar">
      <i class="fa fa-calendar-check"></i> Confirmar Agendamento
    </button>
    <div id="ag-result"></div>
  `;

  document.getElementById('ag-confirmar').addEventListener('click', async () => {
    const btn = document.getElementById('ag-confirmar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Agendando...';
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
          <p class="text-muted" style="margin-top:8px">Um lembrete será enviado por e-mail.</p>
          <button class="btn btn-primary" style="margin-top:16px" onclick="App.navigate('consultas')">
            <i class="fa fa-list"></i> Ver minhas consultas
          </button>
        </div>`;
      btn.remove();
      showToast('Consulta agendada com sucesso!', 'success');
    } catch(e) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa fa-calendar-check"></i> Confirmar Agendamento';
      showToast(e.message, 'error');
    }
  });
}
