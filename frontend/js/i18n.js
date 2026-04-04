// i18n.js — Traduções PT/EN + Dark Mode
// Carregado no <head> — NÃO acessa DOM diretamente

const I18N = {
  pt: {
    'login.subtitle':'Sistema de Gestão Clínica',
    'login.user':'Usuário','login.password':'Senha','login.enter':'Entrar',
    'login.hint':'Logins cadastrados',
    'login.side_title':'Cuidando de quem cuida de você',
    'login.side_desc':'Agendamento online, prontuários digitais e gestão completa para sua clínica.',
    'nav.dashboard':'Dashboard','nav.new_appt':'Novo Agendamento',
    'nav.consults':'Consultas','nav.patients':'Pacientes',
    'nav.doctors':'Médicos','nav.records':'Prontuários',
    'nav.financial':'Financeiro','nav.reports':'Relatórios',
    'nav.my_dashboard':'Meu Dashboard','nav.my_consults':'Minhas Consultas',
    'nav.my_records':'Meus Prontuários','nav.my_patients':'Meus Pacientes',
    'nav.my_billing':'Meu Faturamento','nav.book':'Agendar Consulta','nav.start':'Início',
    'page.dashboard':'Dashboard','page.consults':'Consultas',
    'page.patients':'Pacientes','page.doctors':'Médicos',
    'page.records':'Prontuários','page.financial':'Financeiro','page.reports':'Relatórios',
    'btn.save':'Salvar','btn.cancel':'Cancelar','btn.close':'Fechar',
    'btn.back':'Voltar','btn.new_appt':'Novo Agendamento','btn.schedule':'Agendar',
    'status.scheduled':'Agendada','status.confirmed':'Confirmada',
    'status.done':'Realizada','status.cancelled':'Cancelada','status.absent':'Falta',
    'dash.today':'Agenda de Hoje','dash.next7':'Próximas Consultas (7 dias)',
    'dash.patients':'Pacientes cadastrados','dash.doctors':'Médicos ativos',
    'dash.today_count':'Consultas hoje','dash.month_count':'Consultas no mês',
    'dash.revenue':'Receita mês','dash.absence':'Absenteísmo',
    'dash.my_next':'Minhas Próximas Consultas','dash.done_count':'Consultas realizadas',
    'dash.upcoming':'Próximas consultas','dash.no_today':'Sem consultas hoje',
    'dash.no_next7':'Sem consultas nos próximos 7 dias',
    'dash.by_specialty':'Por Especialidade','dash.next7_short':'Próximas (7 dias)',
    'dash.monthly_rev':'Receita Mensal','dash.consult_details':'Detalhes da Consulta',
    'appt.specialty':'Especialidade','appt.doctor':'Médico',
    'appt.datetime':'Data/Hora','appt.patient':'Paciente','appt.confirm':'Confirmação',
    'appt.select_specialty':'Selecione a especialidade',
    'appt.select_doctor':'Selecione o médico',
    'appt.select_datetime':'Selecione a data e horário',
    'appt.select_patient':'Selecione ou cadastre o paciente',
    'appt.new_patient':'Novo paciente',
    'appt.confirm_title':'Confirme o Agendamento',
    'appt.obs':'Observações (opcional)',
    'appt.btn_confirm':'Confirmar Agendamento',
    'appt.registered_patients':'Pacientes cadastrados',
    'appt.success':'Consulta agendada com sucesso!',
    'appt.no_slots':'Sem horários neste dia',
    'appt.slots_label':'Horários disponíveis',
    'appt.register_patient':'Cadastrar novo paciente',
    'appt.save_select':'Cadastrar e selecionar',
    'fin.title':'Financeiro','fin.my_title':'Meu Faturamento',
    'fin.patient':'Paciente','fin.specialty':'Especialidade','fin.doctor':'Médico',
    'fin.value':'Valor','fin.status':'Status','fin.payment':'Pagamento',
    'fin.actions':'Ações','fin.pay':'Registrar pagamento',
    'rec.title':'Prontuários','rec.new':'Novo Prontuário',
    'rec.anamnesis':'Anamnese','rec.diagnosis':'Diagnóstico',
    'rec.prescription':'Prescrição','rec.observations':'Observações',
    'doc.title':'Médicos','doc.new':'Novo Médico','doc.book':'Agendar consulta',
    'general.loading':'Carregando...','general.logout':'Sair',
    'general.no_data':'Nenhum registro encontrado',
  },
  en: {
    'login.subtitle':'Clinic Management System',
    'login.user':'Username','login.password':'Password','login.enter':'Sign In',
    'login.hint':'Registered logins',
    'login.side_title':'Caring for those who care for you',
    'login.side_desc':'Online scheduling, digital records and complete management for your clinic.',
    'nav.dashboard':'Dashboard','nav.new_appt':'New Appointment',
    'nav.consults':'Appointments','nav.patients':'Patients',
    'nav.doctors':'Doctors','nav.records':'Medical Records',
    'nav.financial':'Financial','nav.reports':'Reports',
    'nav.my_dashboard':'My Dashboard','nav.my_consults':'My Appointments',
    'nav.my_records':'My Records','nav.my_patients':'My Patients',
    'nav.my_billing':'My Billing','nav.book':'Book Appointment','nav.start':'Home',
    'page.dashboard':'Dashboard','page.consults':'Appointments',
    'page.patients':'Patients','page.doctors':'Doctors',
    'page.records':'Medical Records','page.financial':'Financial','page.reports':'Reports',
    'btn.save':'Save','btn.cancel':'Cancel','btn.close':'Close',
    'btn.back':'Back','btn.new_appt':'New Appointment','btn.schedule':'Schedule',
    'status.scheduled':'Scheduled','status.confirmed':'Confirmed',
    'status.done':'Completed','status.cancelled':'Cancelled','status.absent':'No-show',
    'dash.today':"Today's Schedule",'dash.next7':'Upcoming Appointments (7 days)',
    'dash.patients':'Registered patients','dash.doctors':'Active doctors',
    'dash.today_count':"Today's appointments",'dash.month_count':'Monthly appointments',
    'dash.revenue':'Monthly revenue','dash.absence':'Absence rate',
    'dash.my_next':'My Next Appointments','dash.done_count':'Completed appointments',
    'dash.upcoming':'Upcoming appointments','dash.no_today':'No appointments today',
    'dash.no_next7':'No appointments in the next 7 days',
    'dash.by_specialty':'By Specialty','dash.next7_short':'Upcoming (7 days)',
    'dash.monthly_rev':'Monthly Revenue','dash.consult_details':'Appointment Details',
    'appt.specialty':'Specialty','appt.doctor':'Doctor',
    'appt.datetime':'Date/Time','appt.patient':'Patient','appt.confirm':'Confirmation',
    'appt.select_specialty':'Select specialty',
    'appt.select_doctor':'Select doctor',
    'appt.select_datetime':'Select date and time',
    'appt.select_patient':'Select or register patient',
    'appt.new_patient':'New patient',
    'appt.confirm_title':'Confirm Appointment',
    'appt.obs':'Notes (optional)',
    'appt.btn_confirm':'Confirm Appointment',
    'appt.registered_patients':'Registered patients',
    'appt.success':'Appointment scheduled successfully!',
    'appt.no_slots':'No available slots this day',
    'appt.slots_label':'Available slots',
    'appt.register_patient':'Register new patient',
    'appt.save_select':'Register and select',
    'fin.title':'Financial','fin.my_title':'My Billing',
    'fin.patient':'Patient','fin.specialty':'Specialty','fin.doctor':'Doctor',
    'fin.value':'Amount','fin.status':'Status','fin.payment':'Payment',
    'fin.actions':'Actions','fin.pay':'Record payment',
    'rec.title':'Medical Records','rec.new':'New Record',
    'rec.anamnesis':'Anamnesis','rec.diagnosis':'Diagnosis',
    'rec.prescription':'Prescription','rec.observations':'Notes',
    'doc.title':'Doctors','doc.new':'New Doctor','doc.book':'Book appointment',
    'general.loading':'Loading...','general.logout':'Sign out',
    'general.no_data':'No records found',
  }
};

const Lang = {
  _lang: (function(){ try{ return localStorage.getItem('vc_lang')||'pt'; }catch(e){ return 'pt'; } })(),

  // Retorna tradução — nunca quebra
  t(key) {
    const d = I18N[this._lang] || I18N.pt;
    return d[key] !== undefined ? d[key] : (I18N.pt[key] || key);
  },

  // Alias para compatibilidade
  get(key) { return this.t(key); },

  set(lang) {
    this._lang = lang;
    try { localStorage.setItem('vc_lang', lang); } catch(e) {}
    this.applyAll();
  },

  // Aplica tradução em TODOS os elementos marcados
  applyAll() {
    const lang = this._lang;
    // Elementos com data-i18n-key (menus)
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const val = this.t(el.dataset.i18nKey);
      const span = el.querySelector('span');
      if (span) span.textContent = val;
    });
    // Elementos com data-t (textos simples)
    document.querySelectorAll('[data-t]').forEach(el => {
      el.textContent = this.t(el.dataset.t);
    });
    // Atualizar botões lang
    ['pt','en'].forEach(l => {
      const btn = document.getElementById('lang-' + l);
      if (btn) btn.classList.toggle('active', l === lang);
    });
    // Atualiza login se estiver visível
    this._applyLogin(lang);
    // Re-renderiza página atual se app estiver carregado
    if (window.App && App._currentPage) {
      App.navigate(App._currentPage, App._pageParams);
    }
  },

  _applyLogin(lang) {
    const map = {
      'login-subtitle': this.t('login.subtitle'),
      'lbl-user':  this.t('login.user'),
      'lbl-pass':  this.t('login.password'),
      'lbl-enter': this.t('login.enter'),
      'lbl-hint':  this.t('login.hint'),
    };
    Object.entries(map).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
    const loginInput = document.getElementById('login-input');
    const passInput  = document.getElementById('senha-input');
    if (loginInput) loginInput.placeholder = lang === 'en' ? 'username' : 'login';
    if (passInput)  passInput.placeholder  = lang === 'en' ? 'password' : 'senha';
  }
};

const DarkMode = {
  _dark: (function(){ try{ return localStorage.getItem('vc_dark')==='1'; }catch(e){ return false; } })(),
  init() { if (this._dark) document.documentElement.classList.add('dark'); },
  toggle() {
    this._dark = !this._dark;
    try { localStorage.setItem('vc_dark', this._dark ? '1' : '0'); } catch(e) {}
    document.documentElement.classList.toggle('dark', this._dark);
    this._updateIcons();
  },
  _updateIcons() {
    ['dark-toggle','dark-toggle-top'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = this._dark ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
    });
  }
};

// Aplica dark imediatamente para evitar flash
DarkMode.init();
