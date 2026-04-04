// i18n.js — Traduções PT/EN + Dark Mode
// Carregado no <head> — NÃO acessa DOM diretamente

const I18N = {
  pt: {
    // Login
    'login.subtitle':'Sistema de Gestão Clínica',
    'login.user':'Usuário','login.password':'Senha','login.enter':'Entrar',
    'login.hint':'Logins cadastrados',
    'login.side_title':'Cuidando de quem cuida de você',
    'login.side_desc':'Agendamento online, prontuários digitais e gestão completa para sua clínica.',
    'login.fill':'Preencha login e senha.',

    // Navegação
    'nav.dashboard':'Dashboard','nav.new_appt':'Novo Agendamento',
    'nav.consults':'Consultas','nav.patients':'Pacientes',
    'nav.doctors':'Médicos','nav.records':'Prontuários',
    'nav.financial':'Financeiro','nav.reports':'Relatórios',
    'nav.my_dashboard':'Meu Dashboard','nav.my_consults':'Minhas Consultas',
    'nav.my_records':'Meus Prontuários','nav.my_patients':'Meus Pacientes',
    'nav.my_billing':'Meu Faturamento','nav.book':'Agendar Consulta','nav.start':'Início',

    // Grupos de navegação
    'nav.group.main':'Principal',
    'nav.group.clinic':'Gestão Clínica',
    'nav.group.fin_reports':'Financeiro & Relatórios',
    'nav.group.management':'Gestão',
    'nav.group.my_schedule':'Minha Agenda',
    'nav.group.my_data':'Meus Dados',
    'nav.group.my_health':'Minha Saúde',

    // Títulos de página
    'page.dashboard':'Dashboard','page.consults':'Consultas',
    'page.patients':'Pacientes','page.doctors':'Médicos',
    'page.records':'Prontuários','page.financial':'Financeiro','page.reports':'Relatórios',
    'page.not_found':'Página não encontrada',

    // Botões comuns
    'btn.save':'Salvar','btn.cancel':'Cancelar','btn.close':'Fechar',
    'btn.back':'Voltar','btn.new_appt':'Novo Agendamento','btn.schedule':'Agendar',
    'btn.filter':'Filtrar','btn.register':'Cadastrar','btn.select':'Selecionar',
    'btn.save_changes':'Salvar alterações','btn.confirm':'Confirmar',
    'btn.view_consults':'Ver consultas',

    // Status de consulta
    'status.scheduled':'Agendada','status.confirmed':'Confirmada',
    'status.done':'Realizada','status.cancelled':'Cancelada','status.absent':'Falta',
    'status.paid':'Pago','status.pending':'Pendente','status.cancelled_fin':'Cancelado',

    // Perfis
    'profile.admin':'Administrador','profile.medico':'Médico(a)',
    'profile.recepcionista':'Recepcionista','profile.paciente':'Paciente',

    // Geral
    'general.loading':'Carregando...','general.logout':'Sair',
    'general.no_data':'Nenhum registro encontrado',
    'general.saving':'Salvando...','general.date_start':'Data início',
    'general.date_end':'Data fim','general.presential':'Presencial',
    'general.telemedicine':'Telemedicina','general.private':'Particular',
    'general.required_fields':'Preencha os campos obrigatórios',

    // Dashboard
    'dash.loading':'Carregando dashboard...',
    'dash.today':'Agenda de Hoje','dash.next7':'Próximas Consultas (7 dias)',
    'dash.patients':'Pacientes cadastrados','dash.doctors':'Médicos ativos',
    'dash.today_count':'Consultas hoje','dash.month_count':'Consultas no mês',
    'dash.revenue':'Receita mês','dash.absence':'Absenteísmo',
    'dash.my_next':'Minhas Próximas Consultas','dash.done_count':'Consultas realizadas',
    'dash.upcoming':'Próximas consultas','dash.no_today':'Sem consultas hoje',
    'dash.no_next7':'Sem consultas nos próximos 7 dias',
    'dash.by_specialty':'Por Especialidade','dash.next7_short':'Próximas (7 dias)',
    'dash.monthly_rev':'Receita Mensal','dash.consult_details':'Detalhes da Consulta',
    'dash.my_billing':'Meu faturamento (mês)','dash.absence_my':'Taxa de faltas (meus pacs.)',
    'dash.welcome':'Bem-vindo(a),','dash.my_data_subtitle':'Seus dados e agenda pessoal',
    'dash.no_today_all':'Nenhuma consulta hoje',
    'dash.no_next7_all':'Sem consultas agendadas nos próximos 7 dias',
    'dash.no_appt':'Sem consultas agendadas',
    'dash.patients_stat':'Pacientes','dash.doctors_stat':'Médicos',
    'dash.detail_patient':'Paciente:','dash.detail_specialty':'Especialidade:',
    'dash.detail_date':'Data:','dash.detail_type':'Tipo:',
    'dash.detail_status':'Status:','dash.detail_obs':'Observações:',
    'dash.no_obs':'Nenhuma observação registrada.',

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
    'appt.registered_patients':'Pacientes cadastrados',
    'appt.success':'Consulta agendada com sucesso!',
    'appt.no_slots':'Sem horários neste dia',
    'appt.slots_label':'Horários disponíveis',
    'appt.register_patient':'Cadastrar novo paciente',
    'appt.save_select':'Cadastrar e selecionar',
    'appt.preparing':'Preparando agendamento...',
    'appt.loading_slots':'Buscando horários...',
    'appt.date_lbl':'Data','appt.type_lbl':'Tipo',
    'appt.no_patient':'Nenhum paciente encontrado',
    'appt.full_name':'Nome completo *','appt.cpf_lbl':'CPF *',
    'appt.email_lbl':'E-mail *','appt.phone_lbl':'Telefone',
    'appt.insurance_lbl':'Convênio','appt.card_lbl':'Nº Carteirinha',
    'appt.scheduling':'Agendando...',
    'appt.obs_ph':'Ex: paciente em jejum, queixa principal...',
    'appt.error_identify':'Erro ao identificar paciente. Tente sair e entrar novamente.',
    'appt.error_doctor':'Erro ao carregar dados do médico. Atualize a página e tente novamente.',
    'appt.cancel_form':'Cancelar',

    // Consultas
    'cons.date_start':'Data início','cons.date_end':'Data fim',
    'cons.status_lbl':'Status','cons.all':'Todos','cons.filter_btn':'Filtrar',
    'cons.col_datetime':'Data/Hora','cons.col_patient':'Paciente',
    'cons.col_doctor':'Médico','cons.col_specialty':'Especialidade',
    'cons.col_status':'Status','cons.col_type':'Tipo',
    'cons.col_value':'Valor','cons.col_actions':'Ações',
    'cons.not_found':'Nenhuma consulta encontrada',
    'cons.adj_filter':'Ajuste os filtros ou agende uma nova consulta.',
    'cons.confirm_btn':'Confirmar','cons.absence_btn':'Registrar falta',
    'cons.cancel_btn':'Cancelar',
    'cons.confirm_cancel_msg':'Deseja cancelar esta consulta?',
    'cons.confirm_absence_msg':'Registrar falta para esta consulta?',
    'cons.confirmed_toast':'Consulta confirmada',
    'cons.absence_toast':'Falta registrada',
    'cons.cancelled_toast':'Consulta cancelada',
    'cons.records_btn':'Prontuário',

    // Pacientes
    'pat.new_btn':'Novo Paciente',
    'pat.col_name':'Nome','pat.col_cpf':'CPF','pat.col_phone':'Telefone',
    'pat.col_email':'E-mail','pat.col_insurance':'Convênio',
    'pat.col_date':'Cadastro','pat.col_actions':'Ações',
    'pat.not_found':'Nenhum paciente encontrado',
    'pat.try_search':'Tente outro termo de busca.',
    'pat.first_register':'Cadastre o primeiro paciente.',
    'pat.edit_title':'Editar Paciente','pat.new_title':'Novo Paciente',
    'pat.full_name':'Nome completo *','pat.cpf_lbl':'CPF *',
    'pat.birth_lbl':'Data de Nascimento','pat.phone_lbl':'Telefone',
    'pat.email_lbl':'E-mail *','pat.address_lbl':'Endereço',
    'pat.insurance_lbl':'Convênio','pat.card_lbl':'Nº Carteirinha',
    'pat.save_changes':'Salvar alterações','pat.register_btn':'Cadastrar',
    'pat.history_title':'Histórico de Consultas',
    'pat.no_consult':'Nenhuma consulta registrada',
    'pat.col_date_h':'Data','pat.col_spec_h':'Especialidade',
    'pat.col_doc_h':'Médico','pat.col_status_h':'Status','pat.col_value_h':'Valor',
    'pat.search_ph':'Buscar por nome, CPF ou e-mail...',
    'pat.cpf_detail':'CPF:','pat.birth_detail':'Nascimento:',
    'pat.phone_detail':'Telefone:','pat.email_detail':'E-mail:',
    'pat.address_detail':'Endereço:','pat.insurance_detail':'Convênio:',
    'pat.card_detail':'Carteirinha:',
    'pat.updated_toast':'Paciente atualizado com sucesso',
    'pat.created_toast':'Paciente cadastrado com sucesso',

    // Médicos
    'doc.title':'Médicos','doc.new':'Novo Médico','doc.book':'Agendar consulta',
    'doc.details':'Ver detalhes',
    'doc.crm_lbl':'CRM','doc.email_lbl':'E-mail','doc.phone_lbl':'Telefone',
    'doc.about_lbl':'Sobre','doc.full_name':'Nome completo *',
    'doc.crm_form':'CRM *','doc.email_form':'E-mail *','doc.phone_form':'Telefone',
    'doc.specialty_lbl':'Especialidade *','doc.bio_lbl':'Biografia',
    'doc.register_btn':'Cadastrar','doc.created_toast':'Médico cadastrado!',
    'doc.select_ph':'Selecione...','doc.no_doctors':'Nenhum médico cadastrado',
    'doc.schedule_btn':'Agendar consulta',

    // Financeiro
    'fin.title':'Financeiro','fin.my_title':'Meu Faturamento',
    'fin.patient':'Paciente','fin.specialty':'Especialidade','fin.doctor':'Médico',
    'fin.value':'Valor','fin.status':'Status','fin.payment':'Pagamento',
    'fin.actions':'Ações','fin.pay':'Registrar pagamento',
    'fin.date_start':'Data início','fin.date_end':'Data fim',
    'fin.filter_btn':'Filtrar','fin.invoices':'Faturas',
    'fin.received':'Receita recebida','fin.pending_stat':'A receber',
    'fin.cancelled_stat':'Cancelado','fin.total_inv':'Total de faturas',
    'fin.col_date':'Data','fin.col_consult':'Consulta',
    'fin.not_found':'Nenhuma fatura encontrada',
    'fin.adj_period':'Ajuste o período de busca.',
    'fin.reg_payment_title':'Registrar Pagamento',
    'fin.payment_method':'Forma de pagamento',
    'fin.confirm_payment':'Confirmar Pagamento',
    'fin.cash':'Dinheiro','fin.debit':'Cartão de Débito',
    'fin.credit':'Cartão de Crédito','fin.pix':'PIX',
    'fin.conv':'Convênio','fin.transfer':'Transferência Bancária',
    'fin.paid_toast':'Pagamento registrado com sucesso!',
    'fin.patient_lbl':'Paciente:','fin.value_lbl':'Valor:',

    // Relatórios
    'rep.loading':'Gerando relatório...',
    'rep.select_period':'Selecione o período e clique em Gerar Relatório',
    'rep.generate_btn':'Gerar Relatório',
    'rep.date_start':'Data início','rep.date_end':'Data fim',
    'rep.total':'Total atendimentos','rep.absences':'Faltas no período',
    'rep.absence_rate':'Taxa de absenteísmo','rep.avg_ticket':'Ticket médio',
    'rep.by_specialty':'Atendimentos por Especialidade',
    'rep.by_doctor':'Atendimentos por Médico',
    'rep.daily_evolution':'Evolução Diária',
    'rep.col_specialty':'Especialidade','rep.col_total':'Total',
    'rep.col_ticket':'Ticket Médio','rep.col_doctor':'Médico',
    'rep.col_appts':'Atendimentos','rep.col_absences':'Faltas',
    'rep.no_data':'Sem dados no período',

    // Prontuários
    'rec.title':'Prontuários','rec.new':'Novo Prontuário',
    'rec.anamnesis':'Anamnese','rec.diagnosis':'Diagnóstico',
    'rec.prescription':'Prescrição','rec.observations':'Observações',
    'pront.consult_title':'Prontuário da Consulta',
    'pront.search_ph':'Buscar paciente por nome, CPF ou e-mail...',
    'pront.col_patient':'Paciente','pront.col_cpf':'CPF',
    'pront.col_email':'E-mail','pront.col_insurance':'Convênio','pront.col_actions':'Ações',
    'pront.view_btn':'Ver prontuários','pront.not_found':'Nenhum paciente encontrado',
    'pront.clinical_record':'Registro Clínico',
    'pront.saved_badge':'Prontuário salvo','pront.pending_badge':'Pendente',
    'pront.save_btn':'Salvar Prontuário',
    'pront.exams_title':'Exames Solicitados','pront.request_exam':'Solicitar exame',
    'pront.save_first':'Salve o prontuário para solicitar exames.',
    'pront.no_exams':'Nenhum exame solicitado',
    'pront.saving':'Salvando...','pront.saved_ok':'Prontuário salvo com sucesso!',
    'pront.select_patient':'Selecione o paciente...',
    'pront.assoc_consult':'Consulta associada *',
    'pront.select_consult':'Selecione a consulta...',
    'pront.no_consult_err':'Este paciente não tem consultas registradas.',
    'pront.select_patient_err':'Selecione um paciente.',
    'pront.select_consult_err':'Selecione a consulta associada.',
    'pront.ph_anamnesis':'Queixas, histórico, sintomas...',
    'pront.ph_anamnesis_new':'Histórico, queixas principais...',
    'pront.ph_diagnosis':'Hipótese diagnóstica, CID...',
    'pront.ph_diagnosis_new':'CID, hipóteses diagnósticas...',
    'pront.ph_prescription':'Medicamentos, posologia, orientações...',
    'pront.ph_observations':'Informações adicionais...',
    'pront.no_pront':'Nenhum prontuário encontrado',
    'pront.no_pront_desc':'Este paciente ainda não possui prontuários.',
    'pront.select_patient_lbl':'Paciente *',
  },
  en: {
    // Login
    'login.subtitle':'Clinic Management System',
    'login.user':'Username','login.password':'Password','login.enter':'Sign In',
    'login.hint':'Registered logins',
    'login.side_title':'Caring for those who care for you',
    'login.side_desc':'Online scheduling, digital records and complete management for your clinic.',
    'login.fill':'Please fill in your username and password.',

    // Navigation
    'nav.dashboard':'Dashboard','nav.new_appt':'New Appointment',
    'nav.consults':'Appointments','nav.patients':'Patients',
    'nav.doctors':'Doctors','nav.records':'Medical Records',
    'nav.financial':'Financial','nav.reports':'Reports',
    'nav.my_dashboard':'My Dashboard','nav.my_consults':'My Appointments',
    'nav.my_records':'My Records','nav.my_patients':'My Patients',
    'nav.my_billing':'My Billing','nav.book':'Book Appointment','nav.start':'Home',

    // Navigation groups
    'nav.group.main':'Main',
    'nav.group.clinic':'Clinic Management',
    'nav.group.fin_reports':'Financial & Reports',
    'nav.group.management':'Management',
    'nav.group.my_schedule':'My Schedule',
    'nav.group.my_data':'My Data',
    'nav.group.my_health':'My Health',

    // Page titles
    'page.dashboard':'Dashboard','page.consults':'Appointments',
    'page.patients':'Patients','page.doctors':'Doctors',
    'page.records':'Medical Records','page.financial':'Financial','page.reports':'Reports',
    'page.not_found':'Page not found',

    // Common buttons
    'btn.save':'Save','btn.cancel':'Cancel','btn.close':'Close',
    'btn.back':'Back','btn.new_appt':'New Appointment','btn.schedule':'Schedule',
    'btn.filter':'Filter','btn.register':'Register','btn.select':'Select',
    'btn.save_changes':'Save changes','btn.confirm':'Confirm',
    'btn.view_consults':'View appointments',

    // Appointment status
    'status.scheduled':'Scheduled','status.confirmed':'Confirmed',
    'status.done':'Completed','status.cancelled':'Cancelled','status.absent':'No-show',
    'status.paid':'Paid','status.pending':'Pending','status.cancelled_fin':'Cancelled',

    // Profiles
    'profile.admin':'Administrator','profile.medico':'Doctor',
    'profile.recepcionista':'Receptionist','profile.paciente':'Patient',

    // General
    'general.loading':'Loading...','general.logout':'Sign out',
    'general.no_data':'No records found',
    'general.saving':'Saving...','general.date_start':'Start date',
    'general.date_end':'End date','general.presential':'In-person',
    'general.telemedicine':'Telemedicine','general.private':'Private',
    'general.required_fields':'Fill in the required fields',

    // Dashboard
    'dash.loading':'Loading dashboard...',
    'dash.today':"Today's Schedule",'dash.next7':'Upcoming Appointments (7 days)',
    'dash.patients':'Registered patients','dash.doctors':'Active doctors',
    'dash.today_count':"Today's appointments",'dash.month_count':'Monthly appointments',
    'dash.revenue':'Monthly revenue','dash.absence':'Absence rate',
    'dash.my_next':'My Next Appointments','dash.done_count':'Completed appointments',
    'dash.upcoming':'Upcoming appointments','dash.no_today':'No appointments today',
    'dash.no_next7':'No appointments in the next 7 days',
    'dash.by_specialty':'By Specialty','dash.next7_short':'Upcoming (7 days)',
    'dash.monthly_rev':'Monthly Revenue','dash.consult_details':'Appointment Details',
    'dash.my_billing':'My billing (month)','dash.absence_my':'Absence rate (my patients)',
    'dash.welcome':'Welcome,','dash.my_data_subtitle':'Your data and personal schedule',
    'dash.no_today_all':'No appointments today',
    'dash.no_next7_all':'No appointments in the next 7 days',
    'dash.no_appt':'No appointments scheduled',
    'dash.patients_stat':'Patients','dash.doctors_stat':'Doctors',
    'dash.detail_patient':'Patient:','dash.detail_specialty':'Specialty:',
    'dash.detail_date':'Date:','dash.detail_type':'Type:',
    'dash.detail_status':'Status:','dash.detail_obs':'Notes:',
    'dash.no_obs':'No notes recorded.',

    // Appointment wizard
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
    'appt.preparing':'Preparing scheduling...',
    'appt.loading_slots':'Loading time slots...',
    'appt.date_lbl':'Date','appt.type_lbl':'Type',
    'appt.no_patient':'No patients found',
    'appt.full_name':'Full name *','appt.cpf_lbl':'CPF *',
    'appt.email_lbl':'E-mail *','appt.phone_lbl':'Phone',
    'appt.insurance_lbl':'Insurance','appt.card_lbl':'Card Number',
    'appt.scheduling':'Scheduling...',
    'appt.obs_ph':'E.g.: fasting patient, chief complaint...',
    'appt.error_identify':'Error identifying patient. Please sign out and sign in again.',
    'appt.error_doctor':'Error loading doctor data. Refresh the page and try again.',
    'appt.cancel_form':'Cancel',

    // Appointments page
    'cons.date_start':'Start date','cons.date_end':'End date',
    'cons.status_lbl':'Status','cons.all':'All','cons.filter_btn':'Filter',
    'cons.col_datetime':'Date/Time','cons.col_patient':'Patient',
    'cons.col_doctor':'Doctor','cons.col_specialty':'Specialty',
    'cons.col_status':'Status','cons.col_type':'Type',
    'cons.col_value':'Amount','cons.col_actions':'Actions',
    'cons.not_found':'No appointments found',
    'cons.adj_filter':'Adjust filters or schedule a new appointment.',
    'cons.confirm_btn':'Confirm','cons.absence_btn':'Record absence',
    'cons.cancel_btn':'Cancel',
    'cons.confirm_cancel_msg':'Do you want to cancel this appointment?',
    'cons.confirm_absence_msg':'Record absence for this appointment?',
    'cons.confirmed_toast':'Appointment confirmed',
    'cons.absence_toast':'Absence recorded',
    'cons.cancelled_toast':'Appointment cancelled',
    'cons.records_btn':'Medical Records',

    // Patients
    'pat.new_btn':'New Patient',
    'pat.col_name':'Name','pat.col_cpf':'CPF','pat.col_phone':'Phone',
    'pat.col_email':'E-mail','pat.col_insurance':'Insurance',
    'pat.col_date':'Registration','pat.col_actions':'Actions',
    'pat.not_found':'No patients found',
    'pat.try_search':'Try another search term.',
    'pat.first_register':'Register the first patient.',
    'pat.edit_title':'Edit Patient','pat.new_title':'New Patient',
    'pat.full_name':'Full name *','pat.cpf_lbl':'CPF *',
    'pat.birth_lbl':'Date of Birth','pat.phone_lbl':'Phone',
    'pat.email_lbl':'E-mail *','pat.address_lbl':'Address',
    'pat.insurance_lbl':'Insurance','pat.card_lbl':'Card Number',
    'pat.save_changes':'Save changes','pat.register_btn':'Register',
    'pat.history_title':'Appointment History',
    'pat.no_consult':'No appointments recorded',
    'pat.col_date_h':'Date','pat.col_spec_h':'Specialty',
    'pat.col_doc_h':'Doctor','pat.col_status_h':'Status','pat.col_value_h':'Amount',
    'pat.search_ph':'Search by name, CPF or email...',
    'pat.cpf_detail':'CPF:','pat.birth_detail':'Date of Birth:',
    'pat.phone_detail':'Phone:','pat.email_detail':'E-mail:',
    'pat.address_detail':'Address:','pat.insurance_detail':'Insurance:',
    'pat.card_detail':'Card:',
    'pat.updated_toast':'Patient updated successfully',
    'pat.created_toast':'Patient registered successfully',

    // Doctors
    'doc.title':'Doctors','doc.new':'New Doctor','doc.book':'Book appointment',
    'doc.details':'View details',
    'doc.crm_lbl':'CRM','doc.email_lbl':'E-mail','doc.phone_lbl':'Phone',
    'doc.about_lbl':'About','doc.full_name':'Full name *',
    'doc.crm_form':'CRM *','doc.email_form':'E-mail *','doc.phone_form':'Phone',
    'doc.specialty_lbl':'Specialty *','doc.bio_lbl':'Biography',
    'doc.register_btn':'Register','doc.created_toast':'Doctor registered!',
    'doc.select_ph':'Select...','doc.no_doctors':'No doctors registered',
    'doc.schedule_btn':'Book appointment',

    // Financial
    'fin.title':'Financial','fin.my_title':'My Billing',
    'fin.patient':'Patient','fin.specialty':'Specialty','fin.doctor':'Doctor',
    'fin.value':'Amount','fin.status':'Status','fin.payment':'Payment',
    'fin.actions':'Actions','fin.pay':'Record payment',
    'fin.date_start':'Start date','fin.date_end':'End date',
    'fin.filter_btn':'Filter','fin.invoices':'Invoices',
    'fin.received':'Revenue received','fin.pending_stat':'Receivable',
    'fin.cancelled_stat':'Cancelled','fin.total_inv':'Total invoices',
    'fin.col_date':'Date','fin.col_consult':'Appointment',
    'fin.not_found':'No invoices found',
    'fin.adj_period':'Adjust the search period.',
    'fin.reg_payment_title':'Register Payment',
    'fin.payment_method':'Payment method',
    'fin.confirm_payment':'Confirm Payment',
    'fin.cash':'Cash','fin.debit':'Debit Card',
    'fin.credit':'Credit Card','fin.pix':'PIX',
    'fin.conv':'Insurance','fin.transfer':'Bank Transfer',
    'fin.paid_toast':'Payment recorded successfully!',
    'fin.patient_lbl':'Patient:','fin.value_lbl':'Amount:',

    // Reports
    'rep.loading':'Generating report...',
    'rep.select_period':'Select the period and click Generate Report',
    'rep.generate_btn':'Generate Report',
    'rep.date_start':'Start date','rep.date_end':'End date',
    'rep.total':'Total appointments','rep.absences':'Absences in period',
    'rep.absence_rate':'Absence rate','rep.avg_ticket':'Average ticket',
    'rep.by_specialty':'Appointments by Specialty',
    'rep.by_doctor':'Appointments by Doctor',
    'rep.daily_evolution':'Daily Evolution',
    'rep.col_specialty':'Specialty','rep.col_total':'Total',
    'rep.col_ticket':'Average Ticket','rep.col_doctor':'Doctor',
    'rep.col_appts':'Appointments','rep.col_absences':'Absences',
    'rep.no_data':'No data in period',

    // Medical Records
    'rec.title':'Medical Records','rec.new':'New Record',
    'rec.anamnesis':'Anamnesis','rec.diagnosis':'Diagnosis',
    'rec.prescription':'Prescription','rec.observations':'Notes',
    'pront.consult_title':'Consultation Record',
    'pront.search_ph':'Search patient by name, CPF or email...',
    'pront.col_patient':'Patient','pront.col_cpf':'CPF',
    'pront.col_email':'E-mail','pront.col_insurance':'Insurance','pront.col_actions':'Actions',
    'pront.view_btn':'View records','pront.not_found':'No patients found',
    'pront.clinical_record':'Clinical Record',
    'pront.saved_badge':'Record saved','pront.pending_badge':'Pending',
    'pront.save_btn':'Save Record',
    'pront.exams_title':'Requested Exams','pront.request_exam':'Request exam',
    'pront.save_first':'Save the record to request exams.',
    'pront.no_exams':'No exams requested',
    'pront.saving':'Saving...','pront.saved_ok':'Record saved successfully!',
    'pront.select_patient':'Select patient...',
    'pront.assoc_consult':'Associated appointment *',
    'pront.select_consult':'Select appointment...',
    'pront.no_consult_err':'This patient has no registered appointments.',
    'pront.select_patient_err':'Select a patient.',
    'pront.select_consult_err':'Select the associated appointment.',
    'pront.ph_anamnesis':'Complaints, history, symptoms...',
    'pront.ph_anamnesis_new':'History, main complaints...',
    'pront.ph_diagnosis':'Diagnostic hypothesis, ICD...',
    'pront.ph_diagnosis_new':'ICD, diagnostic hypotheses...',
    'pront.ph_prescription':'Medications, dosage, instructions...',
    'pront.ph_observations':'Additional information...',
    'pront.no_pront':'No records found',
    'pront.no_pront_desc':'This patient has no records yet.',
    'pront.select_patient_lbl':'Patient *',
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
      App.buildMenu();
      App.navigate(App._currentPage, App._pageParams);
    }
  },

  // Alias para compatibilidade (usado em chamadas legadas)
  apply() { return this.applyAll(); },

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
