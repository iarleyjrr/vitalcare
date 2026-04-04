// pages/dashboard.js — dashboard filtrado por perfil
async function renderDashboard(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-gauge-high" style="color:var(--primary)"></i> &nbsp;Dashboard</div>
      <div id="dash-date" class="text-muted text-small"></div>
    </div>
    <div id="dash-content">${loadingHTML('Carregando dashboard...')}</div>
  `;
  document.getElementById('dash-date').textContent =
    new Date().toLocaleDateString('pt-BR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  try {
    const data = await API.dashboard();
    const perfil = data.perfil || App.getUser().perfil;

    if      (perfil === 'paciente')       renderDashPaciente(data);
    else if (perfil === 'medico')         renderDashMedico(data);
    else if (perfil === 'recepcionista')  renderDashRecepcao(data);
    else                                   renderDashAdmin(data);
  } catch(e) {
    document.getElementById('dash-content').innerHTML =
      `<div class="error-msg"><i class="fa fa-circle-exclamation"></i> Erro: ${e.message}</div>`;
  }
}

// ── DASHBOARD PACIENTE ────────────────────────────────────────────────────────
function renderDashPaciente(data) {
  const s = data.stats || {};
  let html = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green"><i class="fa fa-calendar-check"></i></div>
        <div><div class="stat-value">${s.total_consultas_realizadas || 0}</div>
             <div class="stat-label"><span data-t="dash.done_count">Consultas realizadas</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fa fa-clock"></i></div>
        <div><div class="stat-value">${(data.proximas_consultas || []).length}</div>
             <div class="stat-label"><span data-t="dash.upcoming">Próximas consultas</span></div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fa fa-calendar" style="color:var(--primary)"></i> &nbsp;<span data-t="dash.my_next">Minhas Próximas Consultas</span></span>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('agendamento')">
          <i class="fa fa-plus"></i> Agendar
        </button>
      </div>
      <div class="card-body">`;

  if (!data.proximas_consultas?.length) {
    html += emptyStateHTML('calendar','Nenhuma consulta agendada','Clique em Agendar para marcar uma consulta.');
  } else {
    data.proximas_consultas.forEach(c => {
      html += `<div class="agenda-day">
        <div class="agenda-time">${Utils.fmtTime(c.data_hora)}</div>
        <div class="agenda-card">
          <div style="font-weight:700">${Utils.fmtDateBR(c.data_hora)}</div>
          <div class="text-small text-muted">
            <i class="fa fa-user-doctor"></i> ${c.medico}
            &nbsp;·&nbsp; <i class="fa fa-stethoscope"></i> ${c.especialidade}
          </div>
          <div class="mt-4">${Utils.statusBadge(c.status)}</div>
        </div>
      </div>`;
    });
  }
  html += `</div></div>`;
  document.getElementById('dash-content').innerHTML = html;
}

// ── DASHBOARD MÉDICO ──────────────────────────────────────────────────────────
function renderDashMedico(data) {
  const s = data.stats || {};
  const user = App.getUser();
  let html = `
    <div style="margin-bottom:16px">
      <div style="font-size:18px;font-weight:700;color:var(--text)">
        Bem-vindo(a), ${user.nome}
      </div>
      <div class="text-muted text-small">Seus dados e agenda pessoal</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fa fa-calendar-day"></i></div>
        <div><div class="stat-value">${s.consultas_hoje || 0}</div>
             <div class="stat-label"><span data-t="dash.today_count">Consultas hoje</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fa fa-calendar"></i></div>
        <div><div class="stat-value">${s.consultas_mes || 0}</div>
             <div class="stat-label"><span data-t="dash.month_count">Consultas no mês</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal"><i class="fa fa-dollar-sign"></i></div>
        <div><div class="stat-value">${Utils.fmtMoney(s.faturamento_mes || 0)}</div>
             <div class="stat-label">Meu faturamento (mês)</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fa fa-user-slash"></i></div>
        <div><div class="stat-value">${s.taxa_absenteismo || 0}%</div>
             <div class="stat-label">Taxa de faltas (meus pacs.)</div></div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card full">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-calendar-day" style="color:var(--primary)"></i> &nbsp;<span data-t="dash.today">Minha <span data-t="dash.today">Agenda de Hoje</span></span></span>
        </div>
        <div class="card-body">`;

  if (!data.consultas_hoje?.length) {
    html += emptyStateHTML('calendar-xmark','<span data-t="dash.no_today">Sem consultas hoje</span>','Aproveite para revisar prontuários ou atualizar registros.');
  } else {
    data.consultas_hoje.forEach(c => {
      html += `<div class="agenda-day">
        <div class="agenda-time">${Utils.fmtTime(c.data_hora)}</div>
        <div class="agenda-card ${c.status}" style="position:relative">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div>
              <div style="font-weight:700">${c.paciente}</div>
              <div class="text-small text-muted"><i class="fa fa-stethoscope"></i> ${c.especialidade}</div>
              <div class="mt-4">${Utils.statusBadge(c.status)}</div>
              ${c.observacoes ? `<div class="ag-obs-tag"><i class="fa fa-notes-medical"></i> ${c.observacoes}</div>` : ''}
            </div>
            <button class="btn-ver-consulta" title="Ver detalhes" onclick="abrirDetalhesConsulta(${JSON.stringify(c).replace(/"/g,'&quot;')})">
              <i class="fa fa-eye"></i>
            </button>
          </div>
        </div>
      </div>`;
    });
  }
  html += `</div></div>

      <div class="card full">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-clock" style="color:var(--primary)"></i> &nbsp;<span data-t="dash.next7">Próximas Consultas (7 dias)</span></span>
        </div>
        <div class="card-body">`;

  if (!data.proximas_consultas?.length) {
    html += emptyStateHTML('calendar','<span data-t="dash.no_next7">Sem consultas nos próximos 7 dias</span>','');
  } else {
    data.proximas_consultas.forEach(c => {
      html += `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
          <div>
            <div style="font-weight:600">${c.paciente}</div>
            <div class="text-small text-muted">${Utils.fmtDateBR(c.data_hora)} às ${Utils.fmtTime(c.data_hora)}</div>
            <div class="mt-4">${Utils.statusBadge(c.status)}</div>
            ${c.observacoes ? `<div class="ag-obs-tag"><i class="fa fa-notes-medical"></i> ${c.observacoes}</div>` : ''}
          </div>
          <button class="btn-ver-consulta" title="Ver detalhes" onclick="abrirDetalhesConsulta(${JSON.stringify(c).replace(/"/g,'&quot;')})">
            <i class="fa fa-eye"></i>
          </button>
        </div>
      </div>`;
    });
  }
  html += `</div></div></div>`;
  document.getElementById('dash-content').innerHTML = html;
}

// ── DASHBOARD RECEPCIONISTA ───────────────────────────────────────────────────
function renderDashRecepcao(data) {
  const s = data.stats || {};
  let html = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fa fa-users"></i></div>
        <div><div class="stat-value">${s.total_pacientes || 0}</div>
             <div class="stat-label"><span data-t="dash.patients">Pacientes cadastrados</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fa fa-user-doctor"></i></div>
        <div><div class="stat-value">${s.total_medicos || 0}</div>
             <div class="stat-label"><span data-t="dash.doctors">Médicos ativos</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fa fa-calendar-day"></i></div>
        <div><div class="stat-value">${s.consultas_hoje || 0}</div>
             <div class="stat-label">Consultas hoje</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fa fa-calendar"></i></div>
        <div><div class="stat-value">${s.consultas_mes || 0}</div>
             <div class="stat-label">Consultas no mês</div></div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card full">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-calendar-day" style="color:var(--primary)"></i> &nbsp;Agenda de Hoje</span>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('agendamento')">
            <i class="fa fa-plus"></i> Novo Agendamento
          </button>
        </div>
        <div class="card-body">`;

  if (!data.consultas_hoje?.length) {
    html += emptyStateHTML('calendar-xmark','Nenhuma consulta hoje','');
  } else {
    data.consultas_hoje.forEach(c => {
      html += `<div class="agenda-day">
        <div class="agenda-time">${Utils.fmtTime(c.data_hora)}</div>
        <div class="agenda-card ${c.status}">
          <div style="font-weight:700">${c.paciente}</div>
          <div class="text-small text-muted">
            <i class="fa fa-user-doctor"></i> ${c.medico}
            &nbsp;·&nbsp; <i class="fa fa-stethoscope"></i> ${c.especialidade}
          </div>
          <div class="mt-4">${Utils.statusBadge(c.status)}</div>
        </div>
      </div>`;
    });
  }

  html += `</div></div>

      <div class="card full">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-clock" style="color:var(--primary)"></i> &nbsp;Próximas Consultas (7 dias)</span>
        </div>
        <div class="card-body">`;

  if (!data.proximas_consultas?.length) {
    html += emptyStateHTML('calendar','Sem consultas agendadas nos próximos 7 dias','');
  } else {
    data.proximas_consultas.forEach(c => {
      html += `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-weight:600">${c.paciente}</div>
        <div class="text-small text-muted">
          ${Utils.fmtDateBR(c.data_hora)} às ${Utils.fmtTime(c.data_hora)}
          &nbsp;·&nbsp; ${c.medico} &nbsp;·&nbsp; ${c.especialidade}
        </div>
        <div class="mt-4">${Utils.statusBadge(c.status)}</div>
      </div>`;
    });
  }
  html += `</div></div></div>`;
  document.getElementById('dash-content').innerHTML = html;
}

// ── DASHBOARD ADMIN ───────────────────────────────────────────────────────────
function renderDashAdmin(data) {
  const s = data.stats || {};
  let html = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fa fa-users"></i></div>
        <div><div class="stat-value">${s.total_pacientes || 0}</div><div class="stat-label">Pacientes</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fa fa-user-doctor"></i></div>
        <div><div class="stat-value">${s.total_medicos || 0}</div><div class="stat-label">Médicos</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fa fa-calendar-day"></i></div>
        <div><div class="stat-value">${s.consultas_hoje || 0}</div><div class="stat-label"><span data-t="dash.today_count">Hoje</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fa fa-calendar"></i></div>
        <div><div class="stat-value">${s.consultas_mes || 0}</div><div class="stat-label"><span data-t="dash.month_count">Mês</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal"><i class="fa fa-dollar-sign"></i></div>
        <div><div class="stat-value">${Utils.fmtMoney(s.receita_mes || 0)}</div><div class="stat-label"><span data-t="dash.revenue">Receita mês</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fa fa-user-slash"></i></div>
        <div><div class="stat-value">${s.taxa_absenteismo || 0}%</div><div class="stat-label"><span data-t="dash.absence">Absenteísmo</span></div></div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card full">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-calendar-day" style="color:var(--primary)"></i> &nbsp;Agenda de Hoje</span>
        </div>
        <div class="card-body">`;

  if (!data.consultas_hoje?.length) {
    html += emptyStateHTML('calendar-xmark','Nenhuma consulta hoje','');
  } else {
    data.consultas_hoje.forEach(c => {
      html += `<div class="agenda-day">
        <div class="agenda-time">${Utils.fmtTime(c.data_hora)}</div>
        <div class="agenda-card ${c.status}">
          <div style="font-weight:700">${c.paciente}</div>
          <div class="text-small text-muted">
            <i class="fa fa-user-doctor"></i> ${c.medico}
            &nbsp;·&nbsp; <i class="fa fa-stethoscope"></i> ${c.especialidade}
          </div>
          <div class="mt-4">${Utils.statusBadge(c.status)}</div>
        </div>
      </div>`;
    });
  }

  html += `</div></div>

      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fa fa-chart-bar" style="color:var(--primary)"></i> &nbsp;<span data-t="dash.by_specialty">Por Especialidade</span></span></div>
        <div class="card-body"><div class="bar-chart" id="bar-esp"></div></div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fa fa-clock" style="color:var(--primary)"></i> &nbsp;<span data-t="dash.next7_short">Próximas (7 dias)</span></span></div>
        <div class="card-body">`;

  if (!data.proximas_consultas?.length) {
    html += emptyStateHTML('calendar','Sem consultas agendadas','');
  } else {
    data.proximas_consultas.forEach(c => {
      html += `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-weight:600">${c.paciente}</div>
        <div class="text-small text-muted">${Utils.fmtDateBR(c.data_hora)} ${Utils.fmtTime(c.data_hora)} · ${c.especialidade}</div>
        <div class="mt-4">${Utils.statusBadge(c.status)}</div>
      </div>`;
    });
  }

  html += `</div></div>

      <div class="card full">
        <div class="card-header"><span class="card-title"><i class="fa fa-chart-line" style="color:var(--primary)"></i> &nbsp;<span data-t="dash.monthly_rev">Receita Mensal</span></span></div>
        <div class="card-body"><div class="bar-chart" id="bar-receita"></div></div>
      </div>
    </div>`;

  document.getElementById('dash-content').innerHTML = html;

  // Gráfico especialidades
  const maxEsp = Math.max(...(data.por_especialidade || []).map(e => e.total), 1);
  const barEsp = document.getElementById('bar-esp');
  (data.por_especialidade || []).forEach(e => {
    barEsp.innerHTML += `<div class="bar-row">
      <div class="bar-label">${e.especialidade}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(e.total/maxEsp*100).toFixed(1)}%"></div></div>
      <div class="bar-value">${e.total}</div>
    </div>`;
  });

  // Gráfico receita
  const receitaData = [...(data.receita_mensal || [])].reverse();
  const maxRec = Math.max(...receitaData.map(r => r.total), 1);
  const barRec = document.getElementById('bar-receita');
  receitaData.forEach(r => {
    const [y, m] = r.mes.split('-');
    const nomeMes = new Date(+y, +m-1, 1).toLocaleDateString('pt-BR', {month:'short', year:'2-digit'});
    barRec.innerHTML += `<div class="bar-row">
      <div class="bar-label">${nomeMes}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(r.total/maxRec*100).toFixed(1)}%;background:var(--secondary)"></div></div>
      <div class="bar-value" style="min-width:80px">${Utils.fmtMoney(r.total)}</div>
    </div>`;
  });
}

// ── Modal de detalhes da consulta (ícone olho) ───────────────────────────────
function abrirDetalhesConsulta(consulta) {
  const obs = consulta.observacoes
    ? `<div class="obs-box">
         <b><i class="fa fa-notes-medical" style="color:#b45309"></i> Observações:</b>
         <p class="obs-box-text" style="margin-top:6px">${consulta.observacoes}</p>
       </div>`
    : '<p class="text-muted text-small" style="margin-top:4px">Nenhuma observação registrada.</p>';

  const tipoIcon = consulta.tipo === 'telemedicina'
    ? '<span class="badge badge-purple"><i class="fa fa-video"></i> Telemedicina</span>'
    : '<span class="badge badge-gray"><i class="fa fa-hospital"></i> Presencial</span>';

  openModal(
    '<h2 class="modal-title"><i class="fa fa-calendar-check"></i> Detalhes da Consulta</h2>' +
    '<div style="display:grid;gap:14px">' +
      '<div><b><i class="fa fa-user" style="color:var(--primary)"></i> Paciente:</b> ' + (consulta.paciente || consulta.paciente_nome || '–') + '</div>' +
      '<div><b><i class="fa fa-stethoscope" style="color:var(--primary)"></i> Especialidade:</b> ' + (consulta.especialidade || '–') + '</div>' +
      '<div><b><i class="fa fa-calendar" style="color:var(--primary)"></i> Data:</b> ' + Utils.fmtDateBR(consulta.data_hora) + ' às ' + Utils.fmtTime(consulta.data_hora) + '</div>' +
      '<div><b><i class="fa fa-clinic-medical" style="color:var(--primary)"></i> Tipo:</b> ' + tipoIcon + '</div>' +
      '<div><b><i class="fa fa-circle-check" style="color:var(--primary)"></i> Status:</b> ' + Utils.statusBadge(consulta.status) + '</div>' +
      obs +
    '</div>' +
    '<div style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end">' +
      '<button class="btn btn-secondary" onclick="closeModal()">Fechar</button>' +
    '</div>'
  );
}