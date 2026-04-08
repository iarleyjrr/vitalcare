// api.js – centraliza todas as chamadas ao backend
const API = {
  base: '/api',

  _token: () => localStorage.getItem('vc_token'),
  _lang:  () => (typeof Lang !== 'undefined' ? Lang._lang : null) || 'pt',

  async _req(method, path, body = null) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API._token()}`
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API.base + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  },

  get:    (path)        => API._req('GET',    path),
  post:   (path, body)  => API._req('POST',   path, body),
  put:    (path, body)  => API._req('PUT',    path, body),
  delete: (path)        => API._req('DELETE', path),

  // AUTH
  login:  (login, senha) => API.post('/auth/login', { login, senha }),
  me:     ()             => API.get('/auth/me'),
  meuPerfil: ()         => API.get('/auth/meu-perfil'),
  meuMedico: ()         => API.get('/auth/meu-medico'),

  // DASHBOARD
  dashboard: () => API.get('/dashboard'),

  // ESPECIALIDADES
  especialidades: () => API.get('/especialidades?lang=' + (Lang._lang || 'pt')),

  // MÉDICOS
  medicos:         (espId) => API.get('/medicos?lang=' + API._lang() + (espId ? `&especialidade=${espId}` : '')),
  medicoById:      (id)    => API.get(`/medicos/${id}?lang=` + API._lang()),
  criarMedico:     (d)     => API.post('/medicos', d),
  disponibilidade: (mid, data) => API.get(`/medicos/${mid}/disponibilidade?data=${data}`),

  // PACIENTES
  pacientes:       (q)    => API.get('/pacientes' + (q ? `?q=${encodeURIComponent(q)}` : '')),
  pacienteById:    (id)   => API.get(`/pacientes/${id}`),
  criarPaciente:   (d)    => API.post('/pacientes', d),
  atualizarPaciente:(id,d)=> API.put(`/pacientes/${id}`, d),

  // CONSULTAS
  consultas: (params = {}) => {
    params.lang = API._lang();
    const qs = new URLSearchParams(params).toString();
    return API.get('/consultas?' + qs);
  },
  criarConsulta:    (d)   => API.post('/consultas', d),
  atualizarConsulta:(id,d)=> API.put(`/consultas/${id}`, d),
  cancelarConsulta: (id)  => API.delete(`/consultas/${id}`),

  // PRONTUÁRIOS
  prontuariosPaciente: (pid) => API.get(`/prontuarios/${pid}`),
  prontuarioConsulta:  (cid) => API.get(`/prontuarios/consulta/${cid}`),
  salvarProntuario:    (d)   => API.post('/prontuarios', d),

  // FINANCEIRO
  financeiro: (params = {}) => {
    params.lang = API._lang();
    const qs = new URLSearchParams(params).toString();
    const user = JSON.parse(atob(localStorage.getItem('vc_token')?.split('.')[1] || 'e30=') || '{}');
    const rota = user.perfil === 'medico' ? '/financeiro/medico' : '/financeiro';
    return API.get(rota + '?' + qs);
  },
  pagarFatura: (id, forma) => API.post(`/financeiro/${id}/pagar`, { forma_pagamento: forma }),

  // RELATÓRIOS
  relatorioAtendimentos: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return API.get('/relatorios/atendimentos' + (qs ? `?${qs}` : ''));
  },
};
