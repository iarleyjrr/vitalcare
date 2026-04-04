// pages/relatorios.js
async function renderRelatorios(container) {
  const hoje = Utils.today();
  const inicioMes = hoje.substring(0,7) + '-01';

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-chart-bar" style="color:var(--primary)"></i> &nbsp;${Lang.t('page.reports')}</div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <div class="filters">
          <div class="form-group">
            <label>${Lang.t('rep.date_start')}</label>
            <input type="date" id="rel-di" value="${inicioMes}">
          </div>
          <div class="form-group">
            <label>${Lang.t('rep.date_end')}</label>
            <input type="date" id="rel-df" value="${hoje}">
          </div>
          <div class="form-group" style="align-self:flex-end">
            <button class="btn btn-primary" id="btn-rel-gerar">
              <i class="fa fa-chart-bar"></i> ${Lang.t('rep.generate_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div id="rel-content">${emptyStateHTML('chart-bar', Lang.t('rep.select_period'))}</div>
  `;

  document.getElementById('btn-rel-gerar').addEventListener('click', loadRelatorio);
}

async function loadRelatorio() {
  const c = document.getElementById('rel-content');
  c.innerHTML = loadingHTML(Lang.t('rep.loading'));
  try {
    const params = {
      data_inicio: document.getElementById('rel-di').value,
      data_fim:    document.getElementById('rel-df').value,
    };
    const data = await API.relatorioAtendimentos(params);

    const totalAt = data.por_especialidade.reduce((a,b)=>a+b.total,0);
    const totalFaltas = data.por_dia.reduce((a,b)=>a+b.faltas,0);
    const taxaAbs = totalAt > 0 ? ((totalFaltas/totalAt)*100).toFixed(1) : 0;
    const ticketMedio = data.por_especialidade.reduce((a,b)=>a+(b.ticket_medio||0),0) / Math.max(data.por_especialidade.length,1);

    let html = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fa fa-calendar-check"></i></div>
          <div><div class="stat-value">${totalAt}</div><div class="stat-label">${Lang.t('rep.total')}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="fa fa-user-slash"></i></div>
          <div><div class="stat-value">${totalFaltas}</div><div class="stat-label">${Lang.t('rep.absences')}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="fa fa-percent"></i></div>
          <div><div class="stat-value">${taxaAbs}%</div><div class="stat-label">${Lang.t('rep.absence_rate')}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon teal"><i class="fa fa-dollar-sign"></i></div>
          <div><div class="stat-value">${Utils.fmtMoney(ticketMedio)}</div><div class="stat-label">${Lang.t('rep.avg_ticket')}</div></div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- POR ESPECIALIDADE -->
        <div class="card">
          <div class="card-header"><span class="card-title"><i class="fa fa-stethoscope"></i> ${Lang.t('rep.by_specialty')}</span></div>
          <div class="card-body">
            <div class="bar-chart" id="bar-esp-rel"></div>
            <div class="table-wrapper" style="margin-top:16px">
              <table>
                <thead><tr><th>${Lang.t('rep.col_specialty')}</th><th>${Lang.t('rep.col_total')}</th><th>${Lang.t('rep.col_ticket')}</th></tr></thead>
                <tbody>
                  ${data.por_especialidade.map(e=>`<tr>
                    <td>${e.especialidade}</td>
                    <td><b>${e.total}</b></td>
                    <td>${Utils.fmtMoney(e.ticket_medio)}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- POR MÉDICO -->
        <div class="card">
          <div class="card-header"><span class="card-title"><i class="fa fa-user-doctor"></i> ${Lang.t('rep.by_doctor')}</span></div>
          <div class="card-body">
            <div class="bar-chart" id="bar-med-rel"></div>
            <div class="table-wrapper" style="margin-top:16px">
              <table>
                <thead><tr><th>${Lang.t('rep.col_doctor')}</th><th>${Lang.t('rep.col_appts')}</th><th>${Lang.t('rep.col_absences')}</th></tr></thead>
                <tbody>
                  ${data.por_medico.map(m=>`<tr>
                    <td>${m.medico}</td>
                    <td><b>${m.total}</b></td>
                    <td><span class="badge badge-red">${m.faltas}</span></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- EVOLUÇÃO DIÁRIA -->
        <div class="card full">
          <div class="card-header"><span class="card-title"><i class="fa fa-chart-line"></i> ${Lang.t('rep.daily_evolution')}</span></div>
          <div class="card-body">
            ${data.por_dia.length === 0 ? emptyStateHTML('chart-line', Lang.t('rep.no_data')) : `
            <div class="bar-chart" id="bar-dia-rel"></div>`}
          </div>
        </div>
      </div>
    `;

    c.innerHTML = html;

    // Renderizar gráfico especialidades
    const maxEsp = Math.max(...data.por_especialidade.map(e=>e.total), 1);
    const barEsp = document.getElementById('bar-esp-rel');
    data.por_especialidade.forEach(e => {
      barEsp.innerHTML += `<div class="bar-row">
        <div class="bar-label">${e.especialidade}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(e.total/maxEsp*100).toFixed(1)}%"></div></div>
        <div class="bar-value">${e.total}</div>
      </div>`;
    });

    // Gráfico médicos
    const maxMed = Math.max(...data.por_medico.map(m=>m.total), 1);
    const barMed = document.getElementById('bar-med-rel');
    data.por_medico.forEach(m => {
      const nomeCurto = m.medico.split(' ').slice(0,2).join(' ');
      barMed.innerHTML += `<div class="bar-row">
        <div class="bar-label">${nomeCurto}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(m.total/maxMed*100).toFixed(1)}%;background:var(--secondary)"></div></div>
        <div class="bar-value">${m.total}</div>
      </div>`;
    });

    // Gráfico diário
    if (data.por_dia.length > 0) {
      const maxDia = Math.max(...data.por_dia.map(d=>d.total), 1);
      const barDia = document.getElementById('bar-dia-rel');
      const slice = data.por_dia.slice(-20);
      slice.forEach(d => {
        const [y,m,dd] = d.dia.split('-');
        barDia.innerHTML += `<div class="bar-row">
          <div class="bar-label">${dd}/${m}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(d.total/maxDia*100).toFixed(1)}%;background:var(--info)"></div></div>
          <div class="bar-value">${d.total} ${d.faltas > 0 ? `<span class="badge badge-red" style="font-size:10px">${d.faltas}F</span>` : ''}</div>
        </div>`;
      });
    }

  } catch(e) {
    c.innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}
