// app.js – controlador principal da aplicação
const App = {
  _user: null,
  _currentPage: null,
  _pageParams: null,

  getUser: () => App._user,

  // ── Menus por perfil (permissões revisadas) ───────────
  _menus: {
    admin: [
      { group: 'Principal', groupI18n: 'nav.group.main' },
      { id:'dashboard',   icon:'gauge-high',     label:'Dashboard',          i18n:'nav.dashboard' },
      { id:'agendamento', icon:'calendar-plus',  label:'Novo Agendamento',   i18n:'nav.new_appt' },
      { group: 'Gestão Clínica', groupI18n: 'nav.group.clinic' },
      { id:'consultas',   icon:'calendar-check', label:'Consultas',          i18n:'nav.consults' },
      { id:'pacientes',   icon:'users',          label:'Pacientes',          i18n:'nav.patients' },
      { id:'medicos',     icon:'user-doctor',    label:'Médicos',            i18n:'nav.doctors' },
      { id:'prontuario',  icon:'file-medical',   label:'Prontuários',        i18n:'nav.records' },
      { group: 'Financeiro & Relatórios', groupI18n: 'nav.group.fin_reports' },
      { id:'financeiro',  icon:'dollar-sign',    label:'Financeiro',         i18n:'nav.financial' },
      { id:'relatorios',  icon:'chart-bar',      label:'Relatórios',         i18n:'nav.reports' },
    ],
    recepcionista: [
      { group: 'Principal', groupI18n: 'nav.group.main' },
      { id:'dashboard',   icon:'gauge-high',     label:'Dashboard',          i18n:'nav.dashboard' },
      { id:'agendamento', icon:'calendar-plus',  label:'Novo Agendamento',   i18n:'nav.new_appt' },
      { group: 'Gestão', groupI18n: 'nav.group.management' },
      { id:'consultas',   icon:'calendar-check', label:'Consultas',          i18n:'nav.consults' },
      { id:'pacientes',   icon:'users',          label:'Pacientes',          i18n:'nav.patients' },
      { id:'medicos',     icon:'user-doctor',    label:'Médicos',            i18n:'nav.doctors' },
    ],
    medico: [
      { group: 'Minha Agenda', groupI18n: 'nav.group.my_schedule' },
      { id:'dashboard',   icon:'gauge-high',     label:'Meu Dashboard',      i18n:'nav.my_dashboard' },
      { id:'consultas',   icon:'calendar-check', label:'Minhas Consultas',   i18n:'nav.my_consults' },
      { id:'prontuario',  icon:'file-medical',   label:'Prontuários',        i18n:'nav.records' },
      { group: 'Meus Dados', groupI18n: 'nav.group.my_data' },
      { id:'pacientes',   icon:'users',          label:'Meus Pacientes',     i18n:'nav.my_patients' },
      { id:'financeiro',  icon:'dollar-sign',    label:'Meu Faturamento',    i18n:'nav.my_billing' },
    ],
    paciente: [
      { group: 'Minha Saúde', groupI18n: 'nav.group.my_health' },
      { id:'dashboard',   icon:'gauge-high',     label:'Início',             i18n:'nav.start' },
      { id:'agendamento', icon:'calendar-plus',  label:'Agendar Consulta',   i18n:'nav.book' },
      { id:'consultas',   icon:'calendar-check', label:'Minhas Consultas',   i18n:'nav.my_consults' },
      { id:'prontuario',  icon:'file-medical',   label:'Meus Prontuários',   i18n:'nav.my_records' },
    ],
  },

  // ── Sidebar mobile ────────────────────────────────────
  _sidebarOpen: false,

  openSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay  = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    App._sidebarOpen = true;
    sidebar.classList.add('open');
    if (hamburger) hamburger.classList.add('open');
    if (overlay)   overlay.classList.add('visible');
  },

  closeSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay  = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    App._sidebarOpen = false;
    sidebar.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
    if (overlay)   overlay.classList.remove('visible');
  },

  // ── Inicialização ─────────────────────────────────────
  init() {

    // Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const login = document.getElementById('login-input').value.trim();
      const senha = document.getElementById('senha-input').value.trim();
      const errEl = document.getElementById('login-error');
      errEl.textContent = '';
      if (!login || !senha) { errEl.textContent = Lang.t('login.fill'); return; }
      try {
        const res = await API.login(login, senha);
        localStorage.setItem('vc_token', res.token);
        App._user = res;
        App.showApp();
      } catch(err) {
        errEl.textContent = err.message || 'Credenciais inválidas.';
      }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('vc_token');
      App._user = null;
      App.closeSidebar();
      document.getElementById('app').classList.add('hidden');
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('login-input').value = '';
      document.getElementById('senha-input').value = '';
    });

    // Modal – fechar
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) closeModal();
    });

    // Hambúrguer – abrir/fechar sidebar no mobile
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('sidebar-overlay');
    if (hamburger) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        App._sidebarOpen ? App.closeSidebar() : App.openSidebar();
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => App.closeSidebar());
    }

    // Fechar sidebar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        App.closeSidebar();
      }
    });

    // Tentar recuperar sessão salva
    const token = localStorage.getItem('vc_token');
    if (token) {
      API.me().then(user => {
        App._user = user;
        App.showApp();
      }).catch(() => {
        localStorage.removeItem('vc_token');
      });
    }
  },

  // ── Mostrar app após login ────────────────────────────
  showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    const user = App._user;
    const avatarTxt = Utils.avatar(user.nome || user.login);

    document.getElementById('user-name').textContent   = user.nome || user.login;
    document.getElementById('user-role').textContent   = Utils.perfilLabel(user.perfil);
    document.getElementById('user-avatar').textContent = avatarTxt;

    const topbarAvatar = document.getElementById('topbar-avatar');
    if (topbarAvatar) topbarAvatar.textContent = avatarTxt;

    App.buildMenu();
    App.navigate('dashboard');
  },

  // ── Construir menu lateral ────────────────────────────
  buildMenu() {
    const user  = App._user;
    const items = App._menus[user.perfil] || App._menus.paciente;
    const nav   = document.getElementById('sidebar-nav');
    nav.innerHTML = '';

    items.forEach(item => {
      if (item.group) {
        const label = document.createElement('div');
        label.className   = 'nav-group-label';
        label.textContent = item.groupI18n ? Lang.t(item.groupI18n) : item.group;
        if (item.groupI18n) label.dataset.t = item.groupI18n;
        nav.appendChild(label);
        return;
      }
      const el = document.createElement('div');
      el.className    = 'nav-item';
      el.dataset.page = item.id;
      const label = item.i18n ? Lang.t(item.i18n) : item.label;
      el.innerHTML    = `<i class="fa fa-${item.icon}"></i><span>${label}</span>`;
      if (item.i18n) el.dataset.i18nKey = item.i18n;
      el.addEventListener('click', () => App.navigate(item.id));
      nav.appendChild(el);
    });
  },

  // ── Navegar entre páginas ─────────────────────────────
  navigate(page, params = null) {
    App._currentPage = page;
    App._pageParams  = params;

    // Fecha sidebar no mobile ao navegar
    App.closeSidebar();

    // Atualizar item ativo no menu
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Renderizar conteúdo da página
    const container = document.getElementById('page-container');
    container.innerHTML = '';

    const renderers = {
      dashboard:   () => renderDashboard(container),
      pacientes:   () => renderPacientes(container),
      consultas:   () => renderConsultas(container),
      agendamento: () => renderAgendamento(container),
      prontuario:  () => renderProntuario(container, params || {}),
      medicos:     () => renderMedicos(container),
      financeiro:  () => renderFinanceiro(container),
      relatorios:  () => renderRelatorios(container),
    };

    const fn = renderers[page];
    if (fn) {
      fn();
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa fa-triangle-exclamation"></i>
          <h3>${Lang.t('page.not_found')}</h3>
        </div>`;
    }

    // Aplicar idioma atual
    try { Lang._applyLogin(Lang._lang); } catch(e) {}
    // Scroll ao topo do conteúdo
    const main = document.getElementById('main-content');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }
};

// Inicializar ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => App.init());
