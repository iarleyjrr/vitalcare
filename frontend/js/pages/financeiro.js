// pages/financeiro.js
async function renderFinanceiro(container) {
  const hoje = Utils.today();
  const inicioMes = hoje.substring(0,7) + '-01';

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-dollar-sign" style="color:var(--primary)"></i> &nbsp;Financeiro</div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <div class="filters">
          <div class="form-group">
            <label>Data início</label>
            <input type="date" id="fin-di" value="${inicioMes}">
          </div>
          <div class="form-group">
            <label>Data fim</label>
            <input type="date" id="fin-df" value="${hoje}">
          </div>
          <div class="form-group" style="align-self:flex-end">
            <button class="btn btn-primary" id="btn-fin-filtrar">
              <i class="fa fa-filter"></i> Filtrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div id="fin-resumo-cards" class="stats-grid" style="margin-bottom:20px"></div>

    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fa fa-list"></i> Faturas</span>
      </div>
      <div class="card-body">
        <div id="fin-loading">${loadingHTML()}</div>
        <div class="table-wrapper hidden" id="fin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th><th>Paciente</th><th>Especialidade</th>
                <th>Consulta</th><th>Valor</th><th>Status</th><th>Pagamento</th><th>Ações</th>
              </tr>
            </thead>
            <tbody id="fin-tbody"></tbody>
          </table>
        </div>
        <div id="fin-empty" class="hidden"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-fin-filtrar').addEventListener('click', loadFinanceiro);
  await loadFinanceiro();
}

async function loadFinanceiro() {
  const loading = document.getElementById('fin-loading');
  const tableWrap = document.getElementById('fin-table-wrap');
  const empty = document.getElementById('fin-empty');
  const tbody = document.getElementById('fin-tbody');
  const resumoCards = document.getElementById('fin-resumo-cards');
  if (!tbody) return;

  loading.classList.remove('hidden');
  tableWrap.classList.add('hidden');
  empty.classList.add('hidden');
  tbody.innerHTML = '';

  try {
    const params = {
      data_inicio: document.getElementById('fin-di').value,
      data_fim:    document.getElementById('fin-df').value,
    };
    const {faturas, resumo} = await API.financeiro(params);
    loading.classList.add('hidden');

    // Cards de resumo
    resumoCards.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon teal"><i class="fa fa-check-circle"></i></div>
        <div><div class="stat-value">${Utils.fmtMoney(resumo.receita)}</div><div class="stat-label">Receita recebida</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fa fa-clock"></i></div>
        <div><div class="stat-value">${Utils.fmtMoney(resumo.pendente)}</div><div class="stat-label">A receber</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fa fa-times-circle"></i></div>
        <div><div class="stat-value">${Utils.fmtMoney(resumo.cancelado)}</div><div class="stat-label">Cancelado</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fa fa-file-invoice"></i></div>
        <div><div class="stat-value">${resumo.total_faturas}</div><div class="stat-label">Total de faturas</div></div>
      </div>
    `;

    if (!faturas.length) {
      empty.className = '';
      empty.innerHTML = emptyStateHTML('file-invoice','Nenhuma fatura encontrada','Ajuste o período de busca.');
      return;
    }

    tableWrap.classList.remove('hidden');
    faturas.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${Utils.fmtDateBR(f.data_emissao)}</td>
        <td><b>${f.paciente_nome}</b></td>
        <td><span class="badge badge-blue">${f.especialidade}</span></td>
        <td class="text-muted text-small">${Utils.fmtDateBR(f.data_consulta)} ${Utils.fmtTime(f.data_consulta)}</td>
        <td><b>${Utils.fmtMoney(f.valor)}</b></td>
        <td>${Utils.statusBadge(f.status)}</td>
        <td class="text-muted text-small">${f.forma_pagamento ? `<span class="badge badge-gray">${f.forma_pagamento}</span>` : '–'}</td>
        <td></td>
      `;

      const actCell = tr.lastElementChild;
      if (f.status === 'pendente') {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-success';
        btn.innerHTML = '<i class="fa fa-money-bill"></i> Registrar pagamento';
        btn.addEventListener('click', () => openPagamento(f));
        actCell.appendChild(btn);
      }
      tbody.appendChild(tr);
    });

  } catch(e) {
    loading.classList.add('hidden');
    showToast('Erro ao carregar financeiro: ' + e.message, 'error');
  }
}

function openPagamento(fatura) {
  openModal(`
    <h2 class="modal-title"><i class="fa fa-money-bill"></i> Registrar Pagamento</h2>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;margin-bottom:16px">
      <div><b>Paciente:</b> ${fatura.paciente_nome}</div>
      <div><b>Valor:</b> <span style="font-size:20px;font-weight:800;color:var(--secondary)">${Utils.fmtMoney(fatura.valor)}</span></div>
    </div>
    <div class="form-group">
      <label><i class="fa fa-credit-card"></i> Forma de pagamento</label>
      <select id="pay-forma">
        <option value="dinheiro">Dinheiro</option>
        <option value="cartão_débito">Cartão de Débito</option>
        <option value="cartão_crédito">Cartão de Crédito</option>
        <option value="pix">PIX</option>
        <option value="convênio">Convênio</option>
        <option value="transferência">Transferência Bancária</option>
      </select>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-success" id="btn-confirmar-pag">
        <i class="fa fa-check"></i> Confirmar Pagamento
      </button>
    </div>
  `);

  document.getElementById('btn-confirmar-pag').addEventListener('click', async () => {
    const forma = document.getElementById('pay-forma').value;
    try {
      await API.pagarFatura(fatura.id, forma);
      showToast('Pagamento registrado com sucesso!', 'success');
      closeModal();
      await loadFinanceiro();
    } catch(e) { showToast(e.message, 'error'); }
  });
}
