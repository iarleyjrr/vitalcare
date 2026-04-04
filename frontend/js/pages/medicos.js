// pages/medicos.js
const MEDICO_FOTOS_PAGE = {
  1: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
  2: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
  3: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face',
  4: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
  5: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
  6: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
};

async function renderMedicos(container) {
  const user = App.getUser();
  const canEdit = user.perfil === 'admin';
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title"><i class="fa fa-user-doctor" style="color:var(--primary)"></i> &nbsp;Médicos</div>
      <div class="page-actions">
        ${canEdit ? '<button class="btn btn-primary" id="btn-novo-medico"><i class="fa fa-plus"></i> Novo Médico</button>' : ''}
      </div>
    </div>
    <div id="medicos-content">${loadingHTML()}</div>`;

  if (canEdit) {
    document.getElementById('btn-novo-medico')?.addEventListener('click', () => openFormMedico());
  }
  await loadMedicos();
}

async function loadMedicos() {
  const c = document.getElementById('medicos-content');
  if (!c) return;
  c.innerHTML = loadingHTML();
  try {
    const [medicos, esps] = await Promise.all([API.medicos(), API.especialidades()]);

    // Agrupar por especialidade
    const byEsp = {};
    esps.forEach(e => { byEsp[e.nome] = []; });
    medicos.forEach(m => {
      if (!byEsp[m.especialidade_nome]) byEsp[m.especialidade_nome] = [];
      byEsp[m.especialidade_nome].push(m);
    });

    let html = '';
    Object.entries(byEsp).forEach(([esp, lista]) => {
      if (!lista.length) return;
      html += `
        <div style="margin-bottom:32px">
          <h3 style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:14px;display:flex;align-items:center;gap:8px">
            <i class="fa fa-stethoscope" style="color:var(--primary)"></i> ${esp}
          </h3>
          <div class="doctor-cards">`;

      lista.forEach(m => {
        const foto = MEDICO_FOTOS_PAGE[m.id];
        const init = m.nome.split(' ').map(n => n[0]).slice(0, 2).join('');
        html += `
          <div class="card doctor-card" onclick="abrirDetalhesMedico(${m.id})" style="cursor:pointer">
            <div class="doctor-card-header">
              ${foto
                ? `<img src="${foto}" alt="${m.nome}" class="doctor-card-photo"
                     onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
                : ''}
              <div class="doctor-card-avatar doctor-avatar" style="${foto ? 'display:none' : ''}">${init}</div>
            </div>
            <div class="doctor-name">${m.nome}</div>
            <div class="doctor-esp"><i class="fa fa-stethoscope"></i> ${m.especialidade_nome}</div>
            <div class="text-small mt-4 text-muted"><i class="fa fa-id-card"></i> ${m.crm}</div>
            ${m.bio ? `<div class="text-small mt-4" style="color:var(--text-muted)">${m.bio}</div>` : ''}
            <div class="mt-4" style="font-size:11px;color:var(--primary)">
              <i class="fa fa-eye"></i> Ver detalhes
            </div>
          </div>`;
      });
      html += '</div></div>';
    });

    c.innerHTML = html || emptyStateHTML('user-doctor', 'Nenhum médico cadastrado');

    // Guarda os dados para usar no modal
    window._medicosData = medicos;
  } catch(e) {
    c.innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
}

async function abrirDetalhesMedico(mid) {
  const m = (window._medicosData || []).find(x => x.id === mid);
  if (!m) return;
  const foto = MEDICO_FOTOS_PAGE[m.id];
  const init = m.nome.split(' ').map(n => n[0]).slice(0, 2).join('');

  openModal(
    `<div style="text-align:center;margin-bottom:20px">
      ${foto
        ? `<img src="${foto}" alt="${m.nome}"
             style="width:100px;height:100px;border-radius:50%;object-fit:cover;object-position:top;
                    border:4px solid var(--primary-lt);box-shadow:0 4px 16px rgba(0,0,0,.15);margin:0 auto"
             onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
        : ''}
      <div class="doctor-avatar"
           style="width:100px;height:100px;font-size:32px;margin:0 auto;${foto?'display:none':''}">${init}</div>
      <h2 style="margin-top:14px;font-size:20px;font-weight:700">${m.nome}</h2>
      <div style="color:var(--primary);font-weight:600;margin-top:4px">
        <i class="fa fa-stethoscope"></i> ${m.especialidade_nome}
      </div>
    </div>

    <div style="display:grid;gap:12px;padding:0 4px">
      <div class="info-row-box">
        <i class="fa fa-id-card" style="color:var(--primary);width:18px"></i>
        <div><div style="font-size:11px;color:var(--text-muted)">CRM</div><div style="font-weight:600">${m.crm}</div></div>
      </div>
      <div class="info-row-box">
        <i class="fa fa-envelope" style="color:var(--primary);width:18px"></i>
        <div><div style="font-size:11px;color:var(--text-muted)">E-mail</div><div style="font-weight:600">${m.email}</div></div>
      </div>
      ${m.telefone ? `
      <div class="info-row-box">
        <i class="fa fa-phone" style="color:var(--primary);width:18px"></i>
        <div><div style="font-size:11px;color:var(--text-muted)">Telefone</div><div style="font-weight:600">${m.telefone}</div></div>
      </div>` : ''}
      ${m.bio ? `
      <div style="padding:12px;background:var(--primary-lt);border-radius:8px;border-left:3px solid var(--primary)">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px"><i class="fa fa-user"></i> Sobre</div>
        <div style="font-size:13px">${m.bio}</div>
      </div>` : ''}
    </div>

    <div style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end">
      <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
      <button class="btn btn-primary" onclick="closeModal();App.navigate('agendamento')">
        <i class="fa fa-calendar-plus"></i> Agendar consulta
      </button>
    </div>`
  );
}

async function openFormMedico() {
  const esps = await API.especialidades();
  openModal(
    `<h2 class="modal-title"><i class="fa fa-user-plus"></i> Novo Médico</h2>
    <div class="form-row">
      <div class="form-group"><label>Nome completo *</label><input id="fm-nome" placeholder="Dr. Nome Sobrenome"></div>
      <div class="form-group"><label>CRM *</label><input id="fm-crm" placeholder="CRM-SP 00000"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>E-mail *</label><input type="email" id="fm-email" placeholder="email@vitalcare.med.br"></div>
      <div class="form-group"><label>Telefone</label><input id="fm-tel" placeholder="(11) 99999-9999"></div>
    </div>
    <div class="form-group"><label>Especialidade *</label>
      <select id="fm-esp">
        <option value="">Selecione...</option>
        ${esps.map(e => `<option value="${e.id}">${e.nome}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Biografia</label>
      <textarea id="fm-bio" rows="2" placeholder="Breve descrição profissional..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="fm-salvar"><i class="fa fa-save"></i> Cadastrar</button>
    </div>`
  );
  document.getElementById('fm-salvar').addEventListener('click', async () => {
    const d = {
      nome: document.getElementById('fm-nome').value.trim(),
      crm:  document.getElementById('fm-crm').value.trim(),
      email: document.getElementById('fm-email').value.trim(),
      telefone: document.getElementById('fm-tel').value.trim(),
      id_especialidade: document.getElementById('fm-esp').value,
      bio: document.getElementById('fm-bio').value.trim(),
    };
    if (!d.nome || !d.crm || !d.email || !d.id_especialidade) {
      return showToast('Preencha os campos obrigatórios', 'warning');
    }
    try {
      await API.criarMedico(d);
      showToast('Médico cadastrado!', 'success');
      closeModal();
      await loadMedicos();
    } catch(e) { showToast(e.message, 'error'); }
  });
}
