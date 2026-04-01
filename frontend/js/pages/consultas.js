// pages/consultas.js
async function renderConsultas(container) {
  const user = App.getUser();
  const hoje = Utils.today();
  const inicioMes = hoje.substring(0,7) + '-01';

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-calendar-check" style="color:var(--primary)"></i> &nbsp;Consultas</div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="App.navigate('agendamento')">
          <i class="fa fa-plus"></i> Novo Agendamento
        </button>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <div class="filters" id="consultas-filters">
          <div class="form-group">
            <label>Data início</label>
            <input type="date" id="f-data-i" value="${inicioMes}">
          </div>
          <div class="form-group">
            <label>Data fim</label>
            <input type="date" id="f-data-f" value="${hoje}">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="f-status">
              <option value="">Todos</option>
              <option value="agendada">Agendada</option>
              <option value="confirmada">Confirmada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
              <option value="falta">Falta</option>
            </select>
          </div>
          <div class="form-group" style="align-self:flex-end">
            <button class="btn btn-primary" id="btn-filtrar">
              <i class="fa fa-filter"></i> Filtrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div id="consultas-loading">${loadingHTML()}</div>
        <div class="table-wrapper hidden" id="consultas-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th><th>Paciente</th><th>Médico</th>
                <th>Especialidade</th><th>Status</th><th>Tipo</th>
                <th>Valor</th><th>Ações</th>
              </tr>
            </thead>
            <tbody id="consultas-tbody"></tbody>
          </table>
        </div>
        <div id="consultas-empty" class="hidden"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-filtrar').addEventListener('click', loadConsultas);
  await loadConsultas();
}

async function loadConsultas() {
  const loading = document.getElementById('consultas-loading');
  const tableWrap = document.getElementById('consultas-table-wrap');
  const empty = document.getElementById('consultas-empty');
  const tbody = document.getElementById('consultas-tbody');
  if (!tbody) return;

  loading.classList.remove('hidden');
  tableWrap.classList.add('hidden');
  empty.classList.add('hidden');
  tbody.innerHTML = '';

  try {
    const params = {
      data_inicio: document.getElementById('f-data-i').value,
      data_fim:    document.getElementById('f-data-f').value,
    };
    const status = document.getElementById('f-status').value;
    if (status) params.status = status;

    const data = await API.consultas(params);
    loading.classList.add('hidden');

    if (!data.length) {
      empty.className = '';
      empty.innerHTML = emptyStateHTML('calendar-xmark','Nenhuma consulta encontrada','Ajuste os filtros ou agende uma nova consulta.');
      return;
    }

    tableWrap.classList.remove('hidden');
    const user = App.getUser();

    data.forEach(c => {
      const actions = [];

      // Ver/editar prontuário (médico ou admin)
      if (['medico','admin'].includes(user.perfil) && ['agendada','confirmada','realizada'].includes(c.status)) {
        actions.push({ icon:'file-medical', title:'Prontuário', cls:'btn-secondary',
          fn: (c) => App.navigate('prontuario', { consulta: c }) });
      }

      // Confirmar consulta
      if (['admin','recepcionista'].includes(user.perfil) && c.status === 'agendada') {
        actions.push({ icon:'circle-check', title:'Confirmar', cls:'btn-success btn-sm',
          fn: async (c) => {
            await API.atualizarConsulta(c.id, { status:'confirmada' });
            showToast('Consulta confirmada', 'success');
            loadConsultas();
          }
        });
      }

      // Registrar falta
      if (['admin','recepcionista'].includes(user.perfil) && ['agendada','confirmada'].includes(c.status)) {
        actions.push({ icon:'user-slash', title:'Registrar falta', cls:'btn-warning btn-sm',
          fn: async (c) => {
            if (!confirm('Registrar falta para esta consulta?')) return;
            await API.atualizarConsulta(c.id, { status:'falta' });
            showToast('Falta registrada', 'warning');
            loadConsultas();
          }
        });
      }

      // Cancelar
      if (['admin','recepcionista'].includes(user.perfil) && !['cancelada','realizada'].includes(c.status)) {
        actions.push({ icon:'times-circle', title:'Cancelar', cls:'btn-danger btn-sm',
          fn: async (c) => {
            if (!confirm('Deseja cancelar esta consulta?')) return;
            await API.cancelarConsulta(c.id);
            showToast('Consulta cancelada', 'success');
            loadConsultas();
          }
        });
      }

      tbody.appendChild(Components.consultaRow(c, actions));
    });

  } catch(e) {
    loading.classList.add('hidden');
    showToast('Erro ao carregar consultas: ' + e.message, 'error');
  }
}
