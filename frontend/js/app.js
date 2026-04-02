// app.js – controlador principal da aplicação
const App = {
  _user: null,
  _currentPage: null,
  _pageParams: null,

  getUser: () => App._user,

  // Menu por perfil
  _menus: {
    admin: [
      { group: 'Principal' },
      { id:'dashboard',   icon:'gauge-high',     label:'Dashboard' },
      { id:'agendamento', icon:'calendar-plus',  label:'Novo Agendamento' },
      { group: 'Gestão' },
      { id:'consultas',   icon:'calendar-check', label:'Consultas' },
      { id:'pacientes',   icon:'users',          label:'Pacientes' },
      { id:'medicos',     icon:'user-doctor',    label:'Médicos' },
      { id:'prontuario',  icon:'file-medical',   label:'Prontuários' },
      { group: 'Financeiro' },
      { id:'financeiro',  icon:'dollar-sign',    label:'Financeiro' },
      { id:'relatorios',  icon:'chart-bar',      label:'Relatórios' },
    ],
    recepcionista: [
      { group: 'Principal' },
      { id:'dashboard',   icon:'gauge-high',     label:'Dashboard' },
      { id:'agendamento', icon:'calendar-plus',  label:'Novo Agendamento' },
      { group: 'Gestão' },
      { id:'consultas',   icon:'calendar-check', label:'Consultas' },
      { id:'pacientes',   icon:'users',          label:'Pacientes' },
      { id:'medicos',     icon:'user-doctor',    label:'Médicos' },
      { group: 'Financeiro' },
      { id:'financeiro',  icon:'dollar-sign',    label:'Financeiro' },
    ],
    medico: [
      { group: 'Minha Agenda' },
      { id:'dashboard',   icon:'gauge-high',     label:'Dashboard' },
      { id:'consultas',   icon:'calendar-check', label:'Consultas' },
      { id:'prontuario',  icon:'file-medical',   label:'Prontuários' },
      { group: 'Pacientes' },
      { id:'pacientes',   icon:'users',          label:'Pacientes' },
    ],
    paciente: [
      { group: 'Minha Saúde' },
      { id:'dashboard',   icon:'gauge-high',     label:'Início' },
      { id:'agendamento', icon:'calendar-plus',  label:'Agendar Consulta' },
      { id:'consultas',   icon:'calendar-check', label:'Minhas Consultas' },
      { id:'prontuario',  icon:'file-medical',   label:'Meus Prontuários' },
    ],
  },

  init() {
    // Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const login = document.getElementById('login-input').value.trim();
      const senha = document.getElementById('senha-input').value.trim();
      const errEl = document.getElementById('login-error');
      errEl.textContent = '';

      if (!login || !senha) { errEl.textContent = 'Preencha login e senha.'; return; }

      try {
        const res = await API.login(login, senha);
        localStorage.setItem('vc_token', res.token);
        App._user = res;
        App.showApp();
      } catch(e) {
        errEl.textContent = e.message || 'Erro ao fazer login.';
      }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('vc_token');
      App._user = null;
      document.getElementById('app').classList.add('hidden');
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('login-input').value = '';
      document.getElementById('senha-input').value = '';
    });

    // Fechar modal
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) closeModal();
    });

    // Menu hamburguer (mobile)
    const hamburger = document.getElementById('hamburger');
    const sidebarEl = document.getElementById('sidebar');
    const overlayEl = document.getElementById('sidebar-overlay');
    function openSidebar()  {
      sidebarEl.classList.add('open'); hamburger.classList.add('open');
      overlayEl.classList.add('visible'); document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebarEl.classList.remove('open'); hamburger.classList.remove('open');
      overlayEl.classList.remove('visible'); document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', () => sidebarEl.classList.contains('open') ? closeSidebar() : openSidebar());
    overlayEl.addEventListener('click', closeSidebar);
    App._closeSidebar = closeSidebar;

    // Tentar recuperar sessão
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

  showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    const user = App._user;
    const avatarTxt = Utils.avatar(user.nome || user.login);
    document.getElementById('user-name').textContent = user.nome || user.login;
    document.getElementById('user-role').textContent = Utils.perfilLabel(user.perfil);
    document.getElementById('user-avatar').textContent = avatarTxt;
    const tb = document.getElementById('topbar-avatar');
    if (tb) tb.textContent = avatarTxt;

    App.buildMenu();
    App.navigate('dashboard');
  },

  buildMenu() {
    const user = App._user;
    const items = App._menus[user.perfil] || App._menus.paciente;
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';

    items.forEach(item => {
      if (item.group) {
        const label = document.createElement('div');
        label.className = 'nav-group-label';
        label.textContent = item.group;
        nav.appendChild(label);
        return;
      }
      const el = document.createElement('div');
      el.className = 'nav-item';
      el.dataset.page = item.id;
      el.innerHTML = `<i class="fa fa-${item.icon}"></i><span>${item.label}</span>`;
      el.addEventListener('click', () => App.navigate(item.id));
      nav.appendChild(el);
    });
  },

  navigate(page, params = null) {
    App._currentPage = page;
    App._pageParams = params;

    // Atualizar menu ativo
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Renderizar página
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
    if (fn) fn();
    else container.innerHTML = `<div class="empty-state"><i class="fa fa-triangle-exclamation"></i><h3>Página não encontrada</h3></div>`;

    // Fecha sidebar no mobile ao navegar
    if (App._closeSidebar) App._closeSidebar();
    // Scroll ao topo
    document.getElementById('main-content').scrollTo(0,0);
  }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => App.init());
