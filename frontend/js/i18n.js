// i18n.js — Traduções PT/EN aplicadas em todo o site
const I18N = {
  pt: {
    // Login
    'login.user':'Usuário','login.password':'Senha','login.enter':'Entrar',
    'login.hint':'Logins cadastrados','login.darkmode':'Modo escuro',
    'login.side_title':'Cuidando de quem cuida de você',
    'login.side_desc':'Agendamento online, prontuários digitais e gestão completa para sua clínica.',
    // Menu
    'nav.dashboard':'Dashboard','nav.new_appt':'Novo Agendamento',
    'nav.consults':'Consultas','nav.patients':'Pacientes',
    'nav.doctors':'Médicos','nav.records':'Prontuários',
    'nav.financial':'Financeiro','nav.reports':'Relatórios',
    'nav.my_dashboard':'Meu Dashboard','nav.my_consults':'Minhas Consultas',
    'nav.my_records':'Meus Prontuários','nav.my_patients':'Meus Pacientes',
    'nav.my_billing':'Meu Faturamento','nav.book':'Agendar Consulta',
    'nav.start':'Início',
    // Páginas
    'page.dashboard':'Dashboard','page.schedule':'Novo Agendamento',
    'page.consults':'Consultas','page.patients':'Pacientes',
    'page.doctors':'Médicos','page.records':'Prontuários',
    'page.financial':'Financeiro','page.reports':'Relatórios',
    // Botões comuns
    'btn.save':'Salvar','btn.cancel':'Cancelar','btn.close':'Fechar',
    'btn.back':'Voltar','btn.confirm':'Confirmar','btn.edit':'Editar',
    'btn.new':'Novo','btn.filter':'Filtrar','btn.search':'Buscar',
    'btn.schedule':'Agendar','btn.new_appt':'Novo Agendamento',
    // Status
    'status.scheduled':'Agendada','status.confirmed':'Confirmada',
    'status.done':'Realizada','status.cancelled':'Cancelada','status.absent':'Falta',
    // Agendamento
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
    // Dashboard
    'dash.today':'Agenda de Hoje','dash.next7':'Próximas Consultas (7 dias)',
    'dash.patients':'Pacientes cadastrados','dash.doctors':'Médicos ativos',
    'dash.today_count':'Consultas hoje','dash.month_count':'Consultas no mês',
    'dash.revenue':'Receita mês','dash.absence':'Absenteísmo',
    // Financeiro
    'fin.title':'Financeiro','fin.my_title':'Meu Faturamento',
    'fin.date':'Data','fin.patient':'Paciente','fin.specialty':'Especialidade',
    'fin.doctor':'Médico','fin.value':'Valor','fin.status':'Status','fin.payment':'Pagamento',
    'fin.actions':'Ações','fin.pay':'Registrar pagamento',
    // Prontuário
    'rec.title':'Prontuários','rec.new':'Novo Prontuário','rec.search':'Buscar paciente...',
    'rec.anamnesis':'Anamnese','rec.diagnosis':'Diagnóstico',
    'rec.prescription':'Prescrição','rec.observations':'Observações',
    // Médicos
    'doc.title':'Médicos','doc.new':'Novo Médico','doc.crm':'CRM',
    'doc.email':'E-mail','doc.phone':'Telefone','doc.about':'Sobre',
    'doc.book':'Agendar consulta',
    // Geral
    'general.loading':'Carregando...','general.error':'Erro',
    'general.no_data':'Nenhum registro encontrado',
    'general.logout':'Sair',
    // Dashboard extra
    'dash.my_next':'Minhas Próximas Consultas',
    'dash.done_count':'Consultas realizadas',
    'dash.upcoming':'Próximas consultas',
    'dash.no_today':'Sem consultas hoje',
    'dash.no_next7':'Sem consultas nos próximos 7 dias',
    'dash.by_specialty':'Por Especialidade',
    'dash.next7_short':'Próximas (7 dias)',
    'dash.monthly_rev':'Receita Mensal',
    'dash.consult_details':'Detalhes da Consulta',
    'dash.date':'Data', 'dash.type':'Tipo', 'dash.status':'Status',
    'dash.obs':'Observações',
    // Agendamento extra
    'appt.no_slots':'Sem horários neste dia',
    'appt.slots_label':'Horários disponíveis',
    'appt.registered_patients':'Pacientes cadastrados',
    'appt.success':'Consulta agendada com sucesso!',
    'appt.back':'Voltar',
    // Médicos extra
    'doc.details':'Detalhes do Médico',
    'doc.book_btn':'Agendar consulta',
    // Geral extra
    'general.no_appts_today':'Nenhuma consulta hoje',
    'general.no_next_appts':'Sem consultas agendadas',
    'general.save_select':'Cadastrar e selecionar',
  },
  en: {
    'login.user':'Username','login.password':'Password','login.enter':'Sign In',
    'login.hint':'Registered logins','login.darkmode':'Dark mode',
    'login.side_title':'Caring for those who care for you',
    'login.side_desc':'Online scheduling, digital records and complete management for your clinic.',
    'nav.dashboard':'Dashboard','nav.new_appt':'New Appointment',
    'nav.consults':'Appointments','nav.patients':'Patients',
    'nav.doctors':'Doctors','nav.records':'Medical Records',
    'nav.financial':'Financial','nav.reports':'Reports',
    'nav.my_dashboard':'My Dashboard','nav.my_consults':'My Appointments',
    'nav.my_records':'My Records','nav.my_patients':'My Patients',
    'nav.my_billing':'My Billing','nav.book':'Book Appointment',
    'nav.start':'Home',
    'page.dashboard':'Dashboard','page.schedule':'New Appointment',
    'page.consults':'Appointments','page.patients':'Patients',
    'page.doctors':'Doctors','page.records':'Medical Records',
    'page.financial':'Financial','page.reports':'Reports',
    'btn.save':'Save','btn.cancel':'Cancel','btn.close':'Close',
    'btn.back':'Back','btn.confirm':'Confirm','btn.edit':'Edit',
    'btn.new':'New','btn.filter':'Filter','btn.search':'Search',
    'btn.schedule':'Schedule','btn.new_appt':'New Appointment',
    'status.scheduled':'Scheduled','status.confirmed':'Confirmed',
    'status.done':'Completed','status.cancelled':'Cancelled','status.absent':'No-show',
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
    'dash.today':"Today's Schedule",'dash.next7':'Upcoming (7 days)',
    'dash.patients':'Registered patients','dash.doctors':'Active doctors',
    'dash.today_count':'Today\'s appointments','dash.month_count':'Monthly appointments',
    'dash.revenue':'Monthly revenue','dash.absence':'Absence rate',
    'fin.title':'Financial','fin.my_title':'My Billing',
    'fin.date':'Date','fin.patient':'Patient','fin.specialty':'Specialty',
    'fin.doctor':'Doctor','fin.value':'Amount','fin.status':'Status',
    'fin.payment':'Payment','fin.actions':'Actions','fin.pay':'Record payment',
    'rec.title':'Medical Records','rec.new':'New Record','rec.search':'Search patient...',
    'rec.anamnesis':'Anamnesis','rec.diagnosis':'Diagnosis',
    'rec.prescription':'Prescription','rec.observations':'Notes',
    'doc.title':'Doctors','doc.new':'New Doctor','doc.crm':'Medical ID',
    'doc.email':'E-mail','doc.phone':'Phone','doc.about':'About',
    'doc.book':'Book appointment',
    'general.loading':'Loading...','general.error':'Error',
    'general.no_data':'No records found',
    'general.logout':'Sign out',
    'dash.my_next':'My Next Appointments',
    'dash.done_count':'Completed appointments',
    'dash.upcoming':'Upcoming appointments',
    'dash.no_today':'No appointments today',
    'dash.no_next7':'No appointments in the next 7 days',
    'dash.by_specialty':'By Specialty',
    'dash.next7_short':'Upcoming (7 days)',
    'dash.monthly_rev':'Monthly Revenue',
    'dash.consult_details':'Appointment Details',
    'dash.date':'Date', 'dash.type':'Type', 'dash.status':'Status',
    'dash.obs':'Notes',
    'appt.no_slots':'No available slots this day',
    'appt.slots_label':'Available slots',
    'appt.registered_patients':'Registered patients',
    'appt.success':'Appointment scheduled successfully!',
    'appt.back':'Back',
    'doc.details':'Doctor Details',
    'doc.book_btn':'Book appointment',
    'general.no_appts_today':'No appointments today',
    'general.no_next_appts':'No upcoming appointments',
    'general.save_select':'Register and select',
  }
};

const Lang = {
  _lang: localStorage.getItem('vc_lang') || 'pt',
  get(key) { return (I18N[this._lang] || I18N.pt)[key] || key; },
  set(lang) {
    this._lang = lang;
    localStorage.setItem('vc_lang', lang);
    this.apply();
    // Atualiza botões de idioma
    ['pt','en'].forEach(l => {
      const btn = document.getElementById('lang-' + l);
      if (btn) btn.classList.toggle('active', l === lang);
    });
  },
  apply() {
    // Traduz elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = this.get(el.dataset.i18n);
      if (el.tagName === 'INPUT' && el.type !== 'submit') el.placeholder = val;
      else el.textContent = val;
    });
    // Traduz menus da sidebar quando construída
    document.querySelectorAll('.nav-item[data-i18n-key]').forEach(el => {
      const span = el.querySelector('span');
      if (span) span.textContent = this.get(el.dataset.i18nKey);
    });
    // Traduz page titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.textContent = this.get(el.dataset.i18nTitle);
    });
  }
};

const DarkMode = {
  _dark: localStorage.getItem('vc_dark') === '1',
  init() { if (this._dark) document.documentElement.classList.add('dark'); },
  toggle() {
    this._dark = !this._dark;
    localStorage.setItem('vc_dark', this._dark ? '1' : '0');
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

// Inicializa imediatamente
DarkMode.init();
