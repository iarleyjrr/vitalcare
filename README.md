# 🏥 VitalCare – Sistema de Gestão Clínica
**PIM III – ADS – UNIP**

Sistema web completo para gestão de clínica de saúde fictícia, desenvolvido com Python/Flask + SQLite + HTML/CSS/JS.

---

## ⚙️ Requisitos

- **Python 3.8+** (já vem instalado no Linux/macOS)
- **Flask** (única dependência)

---

## 🚀 Como rodar

### 1. Instalar Flask (se ainda não tiver)
```bash
pip install flask
```

### 2. Iniciar o sistema
```bash
python start.py
```

### 3. Abrir no navegador
```
http://localhost:5000
```

---

## 👤 Usuários de teste

| Login          | Senha         | Perfil          |
|---------------|---------------|-----------------|
| `admin`        | `admin123`    | Administrador   |
| `recepcao`     | `recepcao123` | Recepcionista   |
| `ana.lima`     | `medico123`   | Médica          |
| `carlos.souza` | `medico123`   | Médico          |
| `beatriz.costa`| `medico123`   | Médica          |
| `maria.silva`  | `paciente123` | Paciente        |
| `joao.santos`  | `paciente123` | Paciente        |

---

## 📁 Estrutura do projeto

```
vitalcare/
├── start.py                  ← Execute este arquivo
├── README.md
├── backend/
│   └── app.py                ← API Flask + banco de dados SQLite
├── frontend/
│   ├── index.html            ← SPA principal
│   ├── css/
│   │   └── style.css         ← Estilos completos
│   └── js/
│       ├── api.js            ← Chamadas à API
│       ├── utils.js          ← Utilitários e helpers
│       ├── components.js     ← Componentes reutilizáveis
│       ├── app.js            ← Controlador principal / roteador
│       └── pages/
│           ├── dashboard.js  ← Dashboard com KPIs e gráficos
│           ├── pacientes.js  ← CRUD de pacientes
│           ├── consultas.js  ← Listagem e gestão de consultas
│           ├── agendamento.js← Wizard de agendamento (5 etapas)
│           ├── prontuario.js ← Prontuário eletrônico
│           ├── medicos.js    ← Cadastro de médicos
│           ├── financeiro.js ← Faturamento e pagamentos
│           └── relatorios.js ← Relatórios analíticos
└── data/
    └── vitalcare.db          ← Banco SQLite (criado automaticamente)
```

---

## 🔧 Funcionalidades implementadas

### Módulos disponíveis
| Módulo         | Descrição                                              |
|---------------|--------------------------------------------------------|
| **Dashboard**  | KPIs, agenda do dia, gráficos de especialidade e receita |
| **Agendamento**| Wizard em 5 etapas: especialidade → médico → horário → paciente → confirmação |
| **Consultas**  | Listagem, filtros, confirmação, registro de falta, cancelamento |
| **Pacientes**  | CRUD completo, busca, histórico de consultas           |
| **Médicos**    | Cadastro e visualização por especialidade              |
| **Prontuário** | Registro e visualização de anamnese, diagnóstico e prescrição |
| **Financeiro** | Faturas, registro de pagamentos, resumo financeiro     |
| **Relatórios** | Atendimentos por dia/especialidade/médico, taxa de absenteísmo |

### Perfis e permissões
| Funcionalidade      | Admin | Recepcionista | Médico | Paciente |
|--------------------|-------|--------------|--------|----------|
| Dashboard          | ✅    | ✅           | ✅     | ✅       |
| Agendar consultas  | ✅    | ✅           | –      | ✅       |
| Gerenciar consultas| ✅    | ✅           | Ver    | Ver      |
| Prontuário         | ✅    | –            | ✅     | Ver      |
| Cadastrar pacientes| ✅    | ✅           | –      | –        |
| Financeiro         | ✅    | ✅           | –      | –        |
| Relatórios         | ✅    | –            | –      | –        |

---

## 🛡️ Segurança
- Autenticação com JWT (JSON Web Tokens)
- Senhas armazenadas com hash SHA-256
- Controle de acesso por perfil em todas as rotas da API
- Tokens expiram em 24 horas

---

## 🗄️ Banco de dados (SQLite)
O banco é criado automaticamente em `data/vitalcare.db` na primeira execução,  
já com dados de exemplo: 6 médicos, 5 pacientes, ~55 consultas e prontuários.

Para **resetar o banco**, basta apagar o arquivo `data/vitalcare.db` e reiniciar.

---

## 📚 Disciplinas integradas (PIM III)
- **Engenharia de Software Ágil** – arquitetura em camadas, API REST
- **Modelagem de BD** – SQLite relacional com 9 tabelas normalizadas
- **POO com C#** – lógica equivalente implementada em Python/Flask (adaptação acadêmica)
- **Desenvolvimento Web Responsivo** – HTML5/CSS3/JS com design mobile-first
- **UX e UI Design** – interface limpa, feedback visual, modais, toasts
- **Machine Learning** – indicadores analíticos no dashboard e relatórios
- **Comunicação e Liderança** – documentação clara, estrutura de equipes por perfil
- **LIBRAS** – acessibilidade contemplada na arquitetura de interface
