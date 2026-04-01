// pages/agendamento.js – wizard de agendamento
let _agStep = 1, _agData = {};

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

// STEP 1: Especialidade
async function agStep1(c) {
  try {
    const esps = await API.especialidades();
    const colors = ['blue','green','orange','purple','red','teal'];
    let html = '<h3 style="margin-bottom:16px">Selecione a especialidade</h3><div class="doctor-cards">';
    esps.forEach((e, i) => {
      html += `<div class="card doctor-card" data-id="${e.id}" style="cursor:pointer" onclick="agSelectEsp(${e.id},'${e.nome}')">
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

// STEP 2: Médico
async function agStep2(c) {
  try {
    const medicos = await API.medicos(_agData.especialidade_id);
    let html = `<h3 style="margin-bottom:16px">Selecione o médico</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()"><i class="fa fa-arrow-left"></i> Voltar</button>
    <div class="doctor-cards" style="margin-top:16px">`;
    medicos.forEach(m => {
      const init = m.nome.split(' ').map(n=>n[0]).slice(0,2).join('');
      html += `<div class="card doctor-card" onclick="agSelectMedico(${m.id},'${m.nome.replace(/'/g,"\\'")}')">
        <div class="doctor-avatar">${init}</div>
        <div class="doctor-name">${m.nome}</div>
        <div class="doctor-esp"><i class="fa fa-stethoscope"></i> ${m.especialidade_nome}</div>
        <div class="text-small mt-4 text-muted"><i class="fa fa-id-card"></i> CRM ${m.crm}</div>
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

// STEP 3: Data e Horário
async function agStep3(c) {
  const minDate = Utils.today();
  const maxDate = Utils.addDays(60);
  c.innerHTML = `
    <h3 style="margin-bottom:16px">Selecione a data e horário</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()"><i class="fa fa-arrow-left"></i> Voltar</button>
    <div class="form-row" style="margin-top:16px;max-width:400px">
      <div class="form-group">
        <label><i class="fa fa-calendar"></i> Data da consulta</label>
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
  container.innerHTML = loadingHTML('Buscando horários disponíveis...');
  try {
    const {slots, duracao} = await API.disponibilidade(_agData.medico_id, data);
    const disponiveis = slots.filter(s => s.disponivel);
    if (!disponiveis.length && !slots.length) {
      container.innerHTML = `<div class="empty-state"><i class="fa fa-calendar-xmark"></i><h3>Sem horários neste dia</h3><p>Selecione outro dia da semana.</p></div>`;
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
  _agData.tipo = document.getElementById('ag-tipo').value;
  _agData.data_display = document.getElementById('ag-data').value;
  setTimeout(() => { _agStep++; renderAgStepper(); renderAgStep(); }, 300);
}

// STEP 4: Paciente
async function agStep4(c) {
  const user = App.getUser();
  if (user.perfil === 'paciente') {
    // Auto-selecionar o próprio paciente
    try {
      const {paciente} = await API.pacienteById(user.id_ref);
      _agData.paciente_id = paciente.id; _agData.paciente_nome = paciente.nome;
      _agStep++; renderAgStepper(); renderAgStep(); return;
    } catch(e) { /* fallthrough */ }
  }

  c.innerHTML = `
    <h3 style="margin-bottom:16px">Selecione o paciente</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()"><i class="fa fa-arrow-left"></i> Voltar</button>
    <div style="margin-top:16px" id="ag-pac-search-wrap"></div>
    <div class="table-wrapper card" style="margin-top:12px">
      <table><thead><tr><th>Nome</th><th>CPF</th><th>Convênio</th><th></th></tr></thead>
      <tbody id="ag-pac-tbody"></tbody></table>
    </div>
  `;
  const sw = document.getElementById('ag-pac-search-wrap');
  sw.appendChild(Components.searchBar('Buscar paciente...', Utils.debounce(async q => {
    const data = await API.pacientes(q);
    renderAgPacientes(data);
  }, 300)));
  const data = await API.pacientes('');
  renderAgPacientes(data);
}

function renderAgPacientes(list) {
  const tbody = document.getElementById('ag-pac-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><b>${p.nome}</b></td><td>${p.cpf}</td>
      <td>${p.convenio ? `<span class="badge badge-blue">${p.convenio}</span>` : 'Particular'}</td>
      <td><button class="btn btn-sm btn-primary">Selecionar</button></td>`;
    tr.querySelector('button').addEventListener('click', () => {
      _agData.paciente_id = p.id; _agData.paciente_nome = p.nome;
      _agData.convenio = p.convenio || '';
      _agStep++; renderAgStepper(); renderAgStep();
    });
    tbody.appendChild(tr);
  });
}

// STEP 5: Confirmação
async function agStep5(c) {
  const valores = {'Clínica Geral':150,'Pediatria':150,'Cardiologia':250,'Ortopedia':200,'Nutrição':180,'Psicologia':200};
  const valor = valores[_agData.especialidade_nome] || 200;
  _agData.valor = valor;

  c.innerHTML = `
    <h3 style="margin-bottom:16px"><i class="fa fa-check-circle" style="color:var(--secondary)"></i> Confirmação do Agendamento</h3>
    <button class="btn btn-secondary btn-sm" onclick="_agStep--;renderAgStepper();renderAgStep()"><i class="fa fa-arrow-left"></i> Voltar</button>
    <div class="card" style="margin-top:16px;padding:20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div><b>Especialidade:</b><br>${_agData.especialidade_nome}</div>
        <div><b>Médico:</b><br>${_agData.medico_nome}</div>
        <div><b>Data:</b><br>${Utils.fmtDateBR(_agData.data_hora)}</div>
        <div><b>Horário:</b><br>${_agData.hora_display}</div>
        <div><b>Paciente:</b><br>${_agData.paciente_nome}</div>
        <div><b>Tipo:</b><br><span class="badge ${_agData.tipo==='telemedicina'?'badge-purple':'badge-gray'}">
          <i class="fa fa-${_agData.tipo==='telemedicina'?'video':'hospital'}"></i> ${_agData.tipo}</span></div>
        <div><b>Convênio:</b><br>${_agData.convenio || 'Particular'}</div>
        <div><b>Valor:</b><br><b style="color:var(--secondary)">${Utils.fmtMoney(valor)}</b></div>
      </div>
    </div>
    <div class="form-group" style="margin-top:16px">
      <label>Observações (opcional)</label>
      <textarea id="ag-obs" rows="3" placeholder="Informações adicionais para o médico..."></textarea>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-primary btn-block" id="ag-confirmar">
        <i class="fa fa-calendar-check"></i> Confirmar Agendamento
      </button>
    </div>
    <div id="ag-result"></div>
  `;

  document.getElementById('ag-confirmar').addEventListener('click', async () => {
    const btn = document.getElementById('ag-confirmar');
    btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Agendando...';
    try {
      await API.criarConsulta({
        id_paciente: _agData.paciente_id,
        id_medico: _agData.medico_id,
        data_hora: _agData.data_hora,
        tipo: _agData.tipo,
        valor: _agData.valor,
        convenio: _agData.convenio,
        observacoes: document.getElementById('ag-obs').value,
      });
      document.getElementById('ag-result').innerHTML = `
        <div style="text-align:center;padding:30px">
          <i class="fa fa-check-circle" style="font-size:56px;color:var(--secondary);display:block;margin-bottom:14px"></i>
          <h2 style="color:var(--secondary)">Consulta agendada com sucesso!</h2>
          <p class="text-muted" style="margin-top:8px">Um lembrete será enviado ao paciente.</p>
          <button class="btn btn-primary" style="margin-top:16px" onclick="App.navigate('consultas')">
            <i class="fa fa-list"></i> Ver todas as consultas
          </button>
        </div>`;
      btn.remove();
      showToast('Consulta agendada com sucesso!', 'success');
    } catch(e) {
      btn.disabled = false; btn.innerHTML = '<i class="fa fa-calendar-check"></i> Confirmar Agendamento';
      showToast(e.message, 'error');
    }
  });
}
