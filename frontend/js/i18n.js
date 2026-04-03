// i18n.js — Traduções PT/EN + Dark Mode
const I18N = {
  pt: {
    // Login
    'login.title': 'VitalCare', 'login.subtitle': 'Sistema de Gestão Clínica',
    'login.user': 'Usuário', 'login.password': 'Senha', 'login.enter': 'Entrar',
    'login.hint': 'Logins cadastrados', 'login.side_title': 'Cuidando de quem cuida de você',
    'login.side_desc': 'Agendamento online, prontuários digitais e gestão completa para sua clínica.',
    'login.lang': 'Idioma', 'login.darkmode': 'Modo escuro',
    // Menu
    'menu.dashboard': 'Dashboard', 'menu.schedule': 'Novo Agendamento',
    'menu.consults': 'Consultas', 'menu.patients': 'Pacientes',
    'menu.doctors': 'Médicos', 'menu.records': 'Prontuários',
    'menu.financial': 'Financeiro', 'menu.reports': 'Relatórios',
    'menu.my_dashboard': 'Meu Dashboard', 'menu.my_consults': 'Minhas Consultas',
    'menu.my_records': 'Meus Prontuários', 'menu.my_patients': 'Meus Pacientes',
    'menu.my_billing': 'Meu Faturamento', 'menu.book': 'Agendar Consulta',
  },
  en: {
    'login.title': 'VitalCare', 'login.subtitle': 'Clinic Management System',
    'login.user': 'Username', 'login.password': 'Password', 'login.enter': 'Sign In',
    'login.hint': 'Registered logins', 'login.side_title': 'Caring for those who care for you',
    'login.side_desc': 'Online scheduling, digital records and complete management for your clinic.',
    'login.lang': 'Language', 'login.darkmode': 'Dark mode',
    'menu.dashboard': 'Dashboard', 'menu.schedule': 'New Appointment',
    'menu.consults': 'Appointments', 'menu.patients': 'Patients',
    'menu.doctors': 'Doctors', 'menu.records': 'Medical Records',
    'menu.financial': 'Financial', 'menu.reports': 'Reports',
    'menu.my_dashboard': 'My Dashboard', 'menu.my_consults': 'My Appointments',
    'menu.my_records': 'My Records', 'menu.my_patients': 'My Patients',
    'menu.my_billing': 'My Billing', 'menu.book': 'Book Appointment',
  }
};

const Lang = {
  _lang: localStorage.getItem('vc_lang') || 'pt',
  get: (key) => (I18N[Lang._lang] || I18N.pt)[key] || key,
  set: (lang) => { Lang._lang = lang; localStorage.setItem('vc_lang', lang); Lang.apply(); },
  apply: () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = Lang.get(el.dataset.i18n);
      if (el.tagName === 'INPUT' && el.placeholder !== undefined) el.placeholder = val;
      else el.textContent = val;
    });
  }
};

const DarkMode = {
  _dark: localStorage.getItem('vc_dark') === '1',
  init: () => { if (DarkMode._dark) document.documentElement.classList.add('dark'); },
  toggle: () => {
    DarkMode._dark = !DarkMode._dark;
    localStorage.setItem('vc_dark', DarkMode._dark ? '1' : '0');
    document.documentElement.classList.toggle('dark', DarkMode._dark);
    // Atualiza ícone do botão
    const btn = document.getElementById('dark-toggle');
    if (btn) btn.innerHTML = DarkMode._dark
      ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
  }
};

// Inicializa dark mode imediatamente para evitar flash
DarkMode.init();
