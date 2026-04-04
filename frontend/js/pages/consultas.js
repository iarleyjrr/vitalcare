// pages/consultas.js
async function renderConsultas(container) {
  const user = App.getUser();
  const hoje = Utils.today();
  const inicioMes = hoje.substring(0,7) + '-01';

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-calendar-check" style="color:var(--primary)"></i> &nbsp;${Lang.t('page.consults')}</div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="App.navigate('agendamento')">
          <i class="fa fa-plus"></i> ${Lang.t('nav.new_appt')}
        </button>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <div class="filters" id="consultas-filters">
          <div class="form-group">
            <label>${Lang.t('cons.date_start')}</label>
            <input type="date" id="f-data-i" value="${inicioMes}">
          </div>
          <div class="form-group">
            <label>${Lang.t('cons.date_end')}</label>
            <input type="date" id="f-data-f" value="${hoje}">
          </div>
          <div class="form-group">
            <label>${Lang.t('cons.status_lbl')}</label>
            <select id="f-status">
              <option value="">${Lang.t('cons.all')}</option>
              <option value="agendada">${Lang.t('status.scheduled')}</option>
              <option value="confirmada">${Lang.t('status.confirmed')}</option>
              <option value="realizada">${Lang.t('status.done')}</option>
              <option value="cancelada">${Lang.t('status.cancelled')}</option>
              <option value="falta">${Lang.t('status.absent')}</option>
            </select>
          </div>
          <div class="form-group" style="align-self:flex-end">
            <button class="btn btn-primary" id="btn-filtrar">
              <i class="fa fa-filter"></i> ${Lang.t('cons.filter_btn')}
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
                <th>${Lang.t('cons.col_datetime')}</th><th>${Lang.t('cons.col_patient')}</th><th>${Lang.t('cons.col_doctor')}</th>
                <th>${Lang.t('cons.col_specialty')}</th><th>${Lang.t('cons.col_status')}</th><th>${Lang.t('cons.col_type')}</th>
                <th>${Lang.t('cons.col_value')}</th><th>${Lang.t('cons.col_actions')}</th>
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
      empty.innerHTML = emptyStateHTML('calendar-xmark', Lang.t('cons.not_found'), Lang.t('cons.adj_filter'));
      return;
    }

    tableWrap.classList.remove('hidden');
    const user = App.getUser();

    data.forEach(c => {
      const actions = [];

      // Ver/editar prontuário (médico ou admin)
      if (['medico','admin'].includes(user.perfil) && ['agendada','confirmada','realizada'].includes(c.status)) {
        actions.push({ icon:'file-medical', title: Lang.t('cons.records_btn'), cls:'btn-secondary',
          fn: (c) => App.navigate('prontuario', { consulta: c }) });
      }

      // Confirmar consulta
      if (['admin','recepcionista'].includes(user.perfil) && c.status === 'agendada') {
        actions.push({ icon:'circle-check', title: Lang.t('cons.confirm_btn'), cls:'btn-success btn-sm',
          fn: async (c) => {
            await API.atualizarConsulta(c.id, { status:'confirmada' });
            showToast(Lang.t('cons.confirmed_toast'), 'success');
            loadConsultas();
          }
        });
      }

      // Registrar falta
      if (['admin','recepcionista'].includes(user.perfil) && ['agendada','confirmada'].includes(c.status)) {
        actions.push({ icon:'user-slash', title: Lang.t('cons.absence_btn'), cls:'btn-warning btn-sm',
          fn: async (c) => {
            if (!confirm(Lang.t('cons.confirm_absence_msg'))) return;
            await API.atualizarConsulta(c.id, { status:'falta' });
            showToast(Lang.t('cons.absence_toast'), 'warning');
            loadConsultas();
          }
        });
      }

      // Cancelar
      const podeCancelar = ['admin','recepcionista'].includes(user.perfil) ||
        (user.perfil === 'paciente' && !['cancelada','realizada'].includes(c.status));
      if (podeCancelar && !['cancelada','realizada'].includes(c.status)) {
        actions.push({ icon:'times-circle', title: Lang.t('cons.cancel_btn'), cls:'btn-danger btn-sm',
          fn: async (c) => {
            if (!confirm(Lang.t('cons.confirm_cancel_msg'))) return;
            await API.cancelarConsulta(c.id);
            showToast(Lang.t('cons.cancelled_toast'), 'success');
            loadConsultas();
          }
        });
      }

      tbody.appendChild(Components.consultaRow(c, actions));
    });

  } catch(e) {
    loading.classList.add('hidden');
    showToast(e.message, 'error');
  }
}
