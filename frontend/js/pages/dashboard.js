// pages/dashboard.js
async function renderDashboard(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-gauge-high" style="color:var(--primary)"></i> &nbsp;Dashboard</div>
      <div id="dash-date" class="text-muted text-small"></div>
    </div>
    <div id="dash-content">${loadingHTML('Carregando dashboard...')}</div>
  `;
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  try {
    const data = await API.dashboard();
    const s = data.stats;

    let html = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fa fa-users"></i></div>
        <div><div class="stat-value">${s.total_pacientes}</div><div class="stat-label">Pacientes cadastrados</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fa fa-user-doctor"></i></div>
        <div><div class="stat-value">${s.total_medicos}</div><div class="stat-label">Médicos ativos</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fa fa-calendar-day"></i></div>
        <div><div class="stat-value">${s.consultas_hoje}</div><div class="stat-label">Consultas hoje</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fa fa-calendar"></i></div>
        <div><div class="stat-value">${s.consultas_mes}</div><div class="stat-label">Consultas no mês</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal"><i class="fa fa-dollar-sign"></i></div>
        <div><div class="stat-value">${Utils.fmtMoney(s.receita_mes)}</div><div class="stat-label">Receita no mês</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fa fa-user-slash"></i></div>
        <div><div class="stat-value">${s.taxa_absenteismo}%</div><div class="stat-label">Taxa absenteísmo</div></div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- CONSULTAS HOJE -->
      <div class="card full">
        <div class="card-header">
          <span class="card-title"><i class="fa fa-calendar-day" style="color:var(--primary)"></i> &nbsp;Agenda de Hoje</span>
        </div>
        <div class="card-body">
    `;

    if (!data.consultas_hoje.length) {
      html += emptyStateHTML('calendar-xmark','Nenhuma consulta hoje');
    } else {
      data.consultas_hoje.forEach(c => {
        html += `
          <div class="agenda-day">
            <div class="agenda-time">${Utils.fmtTime(c.data_hora)}</div>
            <div class="agenda-card ${c.status}">
              <div style="font-weight:700">${c.paciente}</div>
              <div class="text-small text-muted"><i class="fa fa-user-doctor"></i> ${c.medico} &nbsp;·&nbsp; <i class="fa fa-stethoscope"></i> ${c.especialidade}</div>
              <div class="mt-4">${Utils.statusBadge(c.status)}</div>
            </div>
          </div>`;
      });
    }

    html += `</div></div>

      <!-- GRÁFICO POR ESPECIALIDADE -->
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fa fa-chart-bar" style="color:var(--primary)"></i> &nbsp;Consultas por Especialidade</span></div>
        <div class="card-body">
          <div class="bar-chart" id="bar-esp"></div>
        </div>
      </div>

      <!-- PRÓXIMAS CONSULTAS -->
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fa fa-clock" style="color:var(--primary)"></i> &nbsp;Próximas Consultas (7 dias)</span></div>
        <div class="card-body">`;

    if (!data.proximas_consultas.length) {
      html += emptyStateHTML('calendar','Sem consultas nos próximos 7 dias');
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

      <!-- RECEITA MENSAL -->
      <div class="card full">
        <div class="card-header"><span class="card-title"><i class="fa fa-chart-line" style="color:var(--primary)"></i> &nbsp;Receita dos Últimos 6 Meses</span></div>
        <div class="card-body" id="receita-chart-wrap">
          <div class="bar-chart" id="bar-receita"></div>
        </div>
      </div>
    </div>`;

    document.getElementById('dash-content').innerHTML = html;

    // Renderizar gráfico especialidades
    const maxEsp = Math.max(...data.por_especialidade.map(e=>e.total), 1);
    const barEsp = document.getElementById('bar-esp');
    data.por_especialidade.forEach(e => {
      barEsp.innerHTML += `
        <div class="bar-row">
          <div class="bar-label">${e.especialidade}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(e.total/maxEsp*100).toFixed(1)}%"></div></div>
          <div class="bar-value">${e.total}</div>
        </div>`;
    });

    // Renderizar gráfico receita
    const receitaData = [...data.receita_mensal].reverse();
    const maxRec = Math.max(...receitaData.map(r=>r.total), 1);
    const barRec = document.getElementById('bar-receita');
    receitaData.forEach(r => {
      const [y,m] = r.mes.split('-');
      const nomeMes = new Date(+y,+m-1,1).toLocaleDateString('pt-BR',{month:'short',year:'2-digit'});
      barRec.innerHTML += `
        <div class="bar-row">
          <div class="bar-label">${nomeMes}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(r.total/maxRec*100).toFixed(1)}%;background:var(--secondary)"></div></div>
          <div class="bar-value" style="min-width:80px">${Utils.fmtMoney(r.total)}</div>
        </div>`;
    });

  } catch(e) {
    document.getElementById('dash-content').innerHTML = `<div class="error-msg">Erro ao carregar dashboard: ${e.message}</div>`;
  }
}
