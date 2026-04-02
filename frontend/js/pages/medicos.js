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
  if (canEdit) document.getElementById('btn-novo-medico')?.addEventListener('click', () => openFormMedico());
  await loadMedicos();
}

async function loadMedicos() {
  const c = document.getElementById('medicos-content');
  if (!c) return;
  c.innerHTML = loadingHTML();
  try {
    const [medicos, esps] = await Promise.all([API.medicos(), API.especialidades()]);
    const byEsp = {};
    esps.forEach(e => { byEsp[e.nome] = []; });
    medicos.forEach(m => {
      if (!byEsp[m.especialidade_nome]) byEsp[m.especialidade_nome] = [];
      byEsp[m.especialidade_nome].push(m);
    });

    let html = '';
    Object.entries(byEsp).forEach(([esp, lista]) => {
      if (!lista.length) return;
      html += `<div style="margin-bottom:28px">
        <h3 style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:14px">
          <i class="fa fa-stethoscope" style="color:var(--primary)"></i> ${esp}
        </h3>
        <div class="doctor-cards">`;
      lista.forEach(m => {
        const foto = MEDICO_FOTOS_PAGE[m.id];
        const init = m.nome.split(' ').map(n=>n[0]).slice(0,2).join('');
        html += `<div class="card doctor-card">
          <!-- Foto ou avatar -->
          <div class="doctor-card-header">
            ${foto
              ? `<img src="${foto}" alt="${m.nome}" class="doctor-card-photo"
                   onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
              : ''}
            <div class="doctor-avatar doctor-card-avatar" style="${foto?'display:none':''}">
              ${init}
            </div>
          </div>
          <div class="doctor-name">${m.nome}</div>
          <div class="doctor-esp"><i class="fa fa-stethoscope"></i> ${m.especialidade_nome}</div>
          <div class="text-small mt-4 text-muted"><i class="fa fa-id-card"></i> ${m.crm}</div>
          <div class="text-small mt-4 text-muted"><i class="fa fa-envelope"></i> ${m.email}</div>
          ${m.bio ? `<div class="text-small mt-4" style="color:#555">${m.bio}</div>` : ''}
        </div>`;
      });
      html += '</div></div>';
    });
    c.innerHTML = html || emptyStateHTML('user-doctor','Nenhum médico cadastrado');
  } catch(e) { c.innerHTML = `<div class="error-msg">${e.message}</div>`; }
}

async function openFormMedico() {
  const esps = await API.especialidades();
  openModal(`
    <h2 class="modal-title"><i class="fa fa-user-plus"></i> Novo Médico</h2>
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
        ${esps.map(e=>`<option value="${e.id}">${e.nome}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Biografia</label>
      <textarea id="fm-bio" rows="2" placeholder="Breve descrição profissional..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="fm-salvar"><i class="fa fa-save"></i> Cadastrar</button>
    </div>`);
  document.getElementById('fm-salvar').addEventListener('click', async () => {
    const d = {
      nome: document.getElementById('fm-nome').value.trim(),
      crm:  document.getElementById('fm-crm').value.trim(),
      email: document.getElementById('fm-email').value.trim(),
      telefone: document.getElementById('fm-tel').value.trim(),
      id_especialidade: document.getElementById('fm-esp').value,
      bio: document.getElementById('fm-bio').value.trim(),
    };
    if (!d.nome||!d.crm||!d.email||!d.id_especialidade) return showToast('Preencha os campos obrigatórios','warning');
    try {
      await API.criarMedico(d);
      showToast('Médico cadastrado!','success');
      closeModal(); await loadMedicos();
    } catch(e) { showToast(e.message,'error'); }
  });
}
