"""
VitalCare - Backend API
Flask + SQLite
Permissões revisadas por perfil
"""

from flask import Flask, request, jsonify, send_from_directory
import sqlite3, hashlib, hmac, base64, json, os, datetime, time

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
_DATA_DIR = os.environ.get('DATA_DIR', os.path.join(BASE_DIR, '..', 'data'))
os.makedirs(_DATA_DIR, exist_ok=True)
DB_PATH   = os.path.join(_DATA_DIR, 'vitalcare.db')
FRONT_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(__name__, static_folder=FRONT_DIR, static_url_path='')
SECRET = os.environ.get('SECRET_KEY', 'vitalcare_secret_2025_pim3_unip')

# ─── JWT ──────────────────────────────────────────────────────────────────────
def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64url_decode(s: str) -> bytes:
    pad = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + '=' * pad)

def jwt_create(payload: dict) -> str:
    header = _b64url(json.dumps({"alg":"HS256","typ":"JWT"}).encode())
    body   = _b64url(json.dumps(payload).encode())
    sig    = _b64url(hmac.new(SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
    return f"{header}.{body}.{sig}"

def jwt_verify(token: str) -> dict | None:
    try:
        h, b, s = token.split('.')
        expected = _b64url(hmac.new(SECRET.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(s, expected): return None
        payload = json.loads(_b64url_decode(b))
        if payload.get('exp', 0) < time.time(): return None
        return payload
    except Exception:
        return None

def require_auth(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        auth  = request.headers.get('Authorization', '')
        token = auth.replace('Bearer ', '').strip()
        payload = jwt_verify(token)
        if not payload:
            return jsonify({'error': 'Não autorizado'}), 401
        request.user = payload
        return f(*args, **kwargs)
    return decorated

# ─── HELPERS DE PERMISSÃO ─────────────────────────────────────────────────────
def is_admin():      return request.user['perfil'] == 'admin'
def is_medico():     return request.user['perfil'] == 'medico'
def is_recepcao():   return request.user['perfil'] == 'recepcionista'
def is_paciente():   return request.user['perfil'] == 'paciente'
def is_admin_recepcao(): return request.user['perfil'] in ('admin', 'recepcionista')
def is_admin_medico():   return request.user['perfil'] in ('admin', 'medico')
def is_clinico():    return request.user['perfil'] in ('admin', 'medico', 'recepcionista')

# ─── TRADUÇÃO DE ESPECIALIDADE ───────────────────────────────────────────────
ESP_EN = {
    'Clinica Geral':'General Practice','Clínica Geral':'General Practice',
    'Pediatria':'Pediatrics','Cardiologia':'Cardiology',
    'Ortopedia':'Orthopedics','Nutrição':'Nutrition',
    'Nutricao':'Nutrition','Psicologia':'Psychology',
}
BIO_EN = {
    'Clínica Geral há 15 anos.':'General practice for 15 years.',
    'Pediatra especialista em neonatologia.':'Pediatrician specialized in neonatology.',
    'Cardiologista com foco em prevenção.':'Cardiologist focused on prevention.',
    'Ortopedista com especialização em joelho.':'Orthopedist specialized in knee surgery.',
    'Nutricionista clínica e esportiva.':'Clinical and sports nutritionist.',
    'Psicólogo cognitivo-comportamental.':'Cognitive-behavioral psychologist.',
}
PRONT_EN = {
    'anamnese': {
        'Paciente relata queixas há aproximadamente 7 dias. Nega alergias conhecidas.':
        'Patient reports symptoms for approximately 7 days. Denies known allergies.'
    },
    'diagnostico': {
        'Diagnóstico dentro dos parâmetros normais para a faixa etária.':
        'Diagnosis within normal parameters for the age group.'
    },
    'prescricao': {
        'Recomendado repouso e hidratação. Retorno em 30 dias se necessário.':
        'Rest and hydration recommended. Return in 30 days if necessary.'
    }
}

def get_lang():
    return request.args.get('lang', request.headers.get('X-Lang', 'pt'))

def tr(row_dict, lang):
    if lang != 'en': return row_dict
    d = dict(row_dict)
    for field in ('especialidade', 'especialidade_nome'):
        if field in d and d[field]:
            d[field] = ESP_EN.get(d[field], d[field])
    if 'bio' in d and d['bio']:
        d['bio'] = BIO_EN.get(d['bio'], d['bio'])
    # Traduzir campos de prontuário
    for field, tdict in PRONT_EN.items():
        if field in d and d[field]:
            d[field] = tdict.get(d[field], d[field])
    return d

def tr_list(rows, lang):
    if lang != 'en': return [dict(r) for r in rows]
    return [tr(dict(r), lang) for r in rows]

# ─── BANCO ────────────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS especialidades (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT,
        nome_en TEXT,
        descricao_en TEXT,
        duracao_minutos INTEGER DEFAULT 30,
        icone TEXT DEFAULT 'stethoscope'
    );
    CREATE TABLE IF NOT EXISTS medicos (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        nome        TEXT NOT NULL,
        crm         TEXT NOT NULL UNIQUE,
        email       TEXT NOT NULL UNIQUE,
        telefone    TEXT,
        id_especialidade INTEGER REFERENCES especialidades(id),
        bio         TEXT,
        ativo       INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS pacientes (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        nome            TEXT NOT NULL,
        cpf             TEXT NOT NULL UNIQUE,
        data_nascimento TEXT,
        telefone        TEXT,
        email           TEXT NOT NULL UNIQUE,
        endereco        TEXT,
        convenio        TEXT,
        numero_carteira TEXT,
        created_at      TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS usuarios (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        login       TEXT NOT NULL UNIQUE,
        senha_hash  TEXT NOT NULL,
        perfil      TEXT NOT NULL CHECK(perfil IN ('admin','medico','recepcionista','paciente')),
        id_ref      INTEGER,
        ativo       INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS horarios_medico (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        id_medico   INTEGER NOT NULL REFERENCES medicos(id),
        dia_semana  INTEGER NOT NULL,
        hora_inicio TEXT NOT NULL,
        hora_fim    TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS consultas (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        id_paciente INTEGER NOT NULL REFERENCES pacientes(id),
        id_medico   INTEGER NOT NULL REFERENCES medicos(id),
        data_hora   TEXT NOT NULL,
        duracao     INTEGER DEFAULT 30,
        status      TEXT DEFAULT 'agendada' CHECK(status IN ('agendada','confirmada','realizada','cancelada','falta')),
        tipo        TEXT DEFAULT 'presencial' CHECK(tipo IN ('presencial','telemedicina')),
        valor       REAL DEFAULT 0,
        convenio    TEXT,
        observacoes TEXT,
        created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS prontuarios (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        id_consulta INTEGER NOT NULL UNIQUE REFERENCES consultas(id),
        id_paciente INTEGER NOT NULL REFERENCES pacientes(id),
        anamnese    TEXT,
        diagnostico TEXT,
        prescricao  TEXT,
        observacoes TEXT,
        created_at  TEXT DEFAULT (datetime('now')),
        updated_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS exames (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        id_prontuario INTEGER NOT NULL REFERENCES prontuarios(id),
        tipo          TEXT NOT NULL,
        descricao     TEXT,
        resultado     TEXT,
        status        TEXT DEFAULT 'solicitado',
        data_solicitacao TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS faturas (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        id_consulta     INTEGER NOT NULL UNIQUE REFERENCES consultas(id),
        id_paciente     INTEGER NOT NULL REFERENCES pacientes(id),
        valor           REAL NOT NULL,
        status          TEXT DEFAULT 'pendente' CHECK(status IN ('pendente','pago','cancelado')),
        forma_pagamento TEXT,
        data_emissao    TEXT DEFAULT (datetime('now')),
        data_pagamento  TEXT
    );
    """)

    # Migração: adicionar colunas EN se não existirem
    for col in ['nome_en', 'descricao_en']:
        try:
            c.execute(f"ALTER TABLE especialidades ADD COLUMN {col} TEXT")
        except Exception:
            pass  # Coluna já existe

    # Seed especialidades com traduções EN
    for e in [
        ('Clínica Geral','Medicina geral e preventiva','General Practice','General and preventive medicine',30,'stethoscope'),
        ('Pediatria','Saúde infantil e adolescente','Pediatrics','Child and adolescent health',30,'baby'),
        ('Cardiologia','Coração e sistema cardiovascular','Cardiology','Heart and cardiovascular system',45,'heart-pulse'),
        ('Ortopedia','Sistema músculo-esquelético','Orthopedics','Musculoskeletal system',30,'bone'),
        ('Nutrição','Orientação alimentar e nutricional','Nutrition','Nutritional and dietary guidance',45,'apple'),
        ('Psicologia','Saúde mental e bem-estar','Psychology','Mental health and well-being',50,'brain'),
    ]:
        c.execute(
            "INSERT OR IGNORE INTO especialidades(nome,descricao,nome_en,descricao_en,duracao_minutos,icone) VALUES(?,?,?,?,?,?)", e
        )
        # Atualizar registros existentes com as traduções EN
        c.execute(
            "UPDATE especialidades SET nome_en=?, descricao_en=? WHERE nome=? AND (nome_en IS NULL OR nome_en='')",
            (e[2], e[3], e[0])
        )

    # Seed médicos
    for m in [
        ('Dra. Ana Lima','CRM-SP 12345','ana.lima@vitalcare.med.br','(11) 99001-0001',1,'Clínica Geral há 15 anos.'),
        ('Dr. Carlos Souza','CRM-SP 23456','carlos.souza@vitalcare.med.br','(11) 99002-0002',2,'Pediatra especialista em neonatologia.'),
        ('Dra. Beatriz Costa','CRM-SP 34567','beatriz.costa@vitalcare.med.br','(11) 99003-0003',3,'Cardiologista com foco em prevenção.'),
        ('Dr. Rafael Mendes','CRM-SP 45678','rafael.mendes@vitalcare.med.br','(11) 99004-0004',4,'Ortopedista com especialização em joelho.'),
        ('Nutr. Patrícia Rocha','CRM-SP 56789','patricia.rocha@vitalcare.med.br','(11) 99005-0005',5,'Nutricionista clínica e esportiva.'),
        ('Psi. Marcos Andrade','CRM-SP 67890','marcos.andrade@vitalcare.med.br','(11) 99006-0006',6,'Psicólogo cognitivo-comportamental.'),
    ]:
        c.execute("INSERT OR IGNORE INTO medicos(nome,crm,email,telefone,id_especialidade,bio) VALUES(?,?,?,?,?,?)", m)

    # Seed horários
    for mid in range(1, 7):
        for dia in range(0, 5):
            c.execute("INSERT OR IGNORE INTO horarios_medico(id_medico,dia_semana,hora_inicio,hora_fim) VALUES(?,?,?,?)", (mid, dia, '08:00', '12:00'))
            c.execute("INSERT OR IGNORE INTO horarios_medico(id_medico,dia_semana,hora_inicio,hora_fim) VALUES(?,?,?,?)", (mid, dia, '13:00', '17:00'))

    # Seed pacientes
    for p in [
        ('Maria Silva','123.456.789-00','1990-03-15','(11) 98001-0001','maria.silva@email.com','Rua das Flores, 123 - Lapa - SP','Unimed','123456789'),
        ('João Santos','234.567.890-11','1985-07-22','(11) 98002-0002','joao.santos@email.com','Av. Paulista, 456 - Bela Vista - SP','SulAmérica','234567890'),
        ('Ana Oliveira','345.678.901-22','2005-11-30','(11) 98003-0003','ana.oliveira@email.com','Rua Augusta, 789 - Consolação - SP','Bradesco Saúde','345678901'),
        ('Pedro Costa','456.789.012-33','1978-01-10','(11) 98004-0004','pedro.costa@email.com','Rua Vergueiro, 321 - Paraíso - SP',None,None),
        ('Carla Mendes','567.890.123-44','1995-06-18','(11) 98005-0005','carla.mendes@email.com','Rua Tutóia, 654 - Paraíso - SP','Amil','567890123'),
    ]:
        c.execute("INSERT OR IGNORE INTO pacientes(nome,cpf,data_nascimento,telefone,email,endereco,convenio,numero_carteira) VALUES(?,?,?,?,?,?,?,?)", p)

    # Seed usuários – login individual por especialidade com senhas próprias
    def h(pw): return hashlib.sha256(pw.encode()).hexdigest()
    for u in [
        # Administrativo
        ('admin',              h('admin123'),      'admin',         None),
        ('fabio.recepcao',     h('fabio123'),      'recepcionista', None),
        # Médicos – 1 login por especialidade
        ('ana.clinicageral',   h('ana123'),        'medico',        1),
        ('carlos.pediatria',   h('carlos123'),     'medico',        2),
        ('beatriz.cardiologia',h('beatriz123'),    'medico',        3),
        ('rafael.ortopedia',   h('rafael123'),     'medico',        4),
        ('patricia.nutricao',  h('patricia123'),   'medico',        5),
        ('marcos.psicologia',  h('marcos123'),     'medico',        6),
        # Pacientes
        ('maria.paciente',     h('maria123'),      'paciente',      1),
        ('joao.paciente',      h('joao123'),       'paciente',      2),
    ]:
        c.execute("INSERT OR IGNORE INTO usuarios(login,senha_hash,perfil,id_ref) VALUES(?,?,?,?)", u)

    # Seed consultas históricas e futuras
    import random; random.seed(42)
    hoje = datetime.date.today()
    status_opts = ['realizada','realizada','realizada','realizada','cancelada','falta']
    for i in range(40):
        dias_atras = random.randint(1, 90)
        data = hoje - datetime.timedelta(days=dias_atras)
        if data.weekday() >= 5: data -= datetime.timedelta(days=data.weekday()-4)
        hora = random.choice(['08:30','09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'])
        mid  = random.randint(1,6); pid = random.randint(1,5)
        st   = random.choice(status_opts)
        valor = random.choice([150.0, 200.0, 250.0, 300.0, 180.0])
        c.execute("INSERT OR IGNORE INTO consultas(id_paciente,id_medico,data_hora,status,valor,tipo) VALUES(?,?,?,?,?,?)",
                  (pid, mid, f"{data}T{hora}:00", st, valor, 'presencial'))
    for i in range(15):
        dias = random.randint(1, 30)
        data = hoje + datetime.timedelta(days=dias)
        if data.weekday() >= 5: data += datetime.timedelta(days=7-data.weekday())
        hora = random.choice(['08:30','09:00','09:30','10:00','14:00','14:30','15:00'])
        mid  = random.randint(1,6); pid = random.randint(1,5)
        valor = random.choice([150.0, 200.0, 250.0, 300.0])
        c.execute("INSERT OR IGNORE INTO consultas(id_paciente,id_medico,data_hora,status,valor,tipo) VALUES(?,?,?,?,?,?)",
                  (pid, mid, f"{data}T{hora}:00", 'agendada', valor, 'presencial'))

    # Prontuários para realizadas
    c.execute("SELECT id, id_paciente FROM consultas WHERE status='realizada'")
    for row in c.fetchall():
        c.execute("INSERT OR IGNORE INTO prontuarios(id_consulta,id_paciente,anamnese,diagnostico,prescricao) VALUES(?,?,?,?,?)",
                  (row['id'], row['id_paciente'],
                   'Paciente relata queixas há aproximadamente 7 dias. Nega alergias conhecidas.',
                   'Diagnóstico dentro dos parâmetros normais para a faixa etária.',
                   'Recomendado repouso e hidratação. Retorno em 30 dias se necessário.'))

    # Faturas
    c.execute("SELECT id, id_paciente, valor FROM consultas WHERE status IN ('realizada','agendada','confirmada')")
    for row in c.fetchall():
        st = 'pago' if row['id'] <= 40 else 'pendente'
        c.execute("INSERT OR IGNORE INTO faturas(id_consulta,id_paciente,valor,status) VALUES(?,?,?,?)",
                  (row['id'], row['id_paciente'], row['valor'], st))

    conn.commit()
    conn.close()
    print("✅ Banco de dados inicializado.")

# ══════════════════════════════════════════════════════════════════════════════
# AUTENTICAÇÃO
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/auth/login', methods=['POST'])
def login():
    data      = request.json or {}
    login_val = data.get('login','').strip()
    senha     = data.get('senha','').strip()
    if not login_val or not senha:
        return jsonify({'error':'Login e senha obrigatórios'}), 400

    senha_hash = hashlib.sha256(senha.encode()).hexdigest()
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM usuarios WHERE login=? AND senha_hash=? AND ativo=1",
        (login_val, senha_hash)
    ).fetchone()
    if not user:
        conn.close()
        return jsonify({'error':'Credenciais inválidas'}), 401

    nome = login_val
    if user['perfil'] == 'paciente':
        p = conn.execute("SELECT nome FROM pacientes WHERE id=?", (user['id_ref'],)).fetchone()
        if p: nome = p['nome']
    elif user['perfil'] == 'medico':
        m = conn.execute("SELECT nome FROM medicos WHERE id=?", (user['id_ref'],)).fetchone()
        if m: nome = m['nome']
    elif user['perfil'] == 'admin':       nome = 'Administrador'
    elif user['perfil'] == 'recepcionista': nome = 'Recepcionista'
    conn.close()

    payload = {
        'sub':    user['id'],
        'login':  user['login'],
        'perfil': user['perfil'],
        'id_ref': user['id_ref'],
        'nome':   nome,
        'exp':    time.time() + 86400
    }
    return jsonify({'token': jwt_create(payload), 'perfil': user['perfil'], 'nome': nome})

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def me():
    return jsonify(request.user)

@app.route('/api/auth/meu-medico', methods=['GET'])
@require_auth
def meu_medico():
    """Retorna os dados do médico logado — busca pelo login se id_ref falhar"""
    if not is_medico():
        return jsonify({'error': 'Apenas médicos'}), 403
    user = request.user
    conn = get_db()
    mid = user.get('id_ref')
    medico = None
    if mid:
        medico = conn.execute("""
            SELECT m.*, e.nome as especialidade_nome FROM medicos m
            JOIN especialidades e ON e.id=m.id_especialidade WHERE m.id=?
        """, (mid,)).fetchone()
    # Fallback: busca pelo login/nome
    if not medico:
        nome = user.get('nome','')
        login = user.get('login','')
        medico = conn.execute("""
            SELECT m.*, e.nome as especialidade_nome FROM medicos m
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE m.nome LIKE ? OR m.email LIKE ?
        """, (f'%{nome.split(" ")[1] if " " in nome else nome}%',
                f'%{login.split(".")[0]}%')).fetchone()
    conn.close()
    if not medico:
        return jsonify({'error': 'Médico não encontrado'}), 404
    return jsonify(dict(medico))

@app.route('/api/auth/meu-perfil', methods=['GET'])
@require_auth
def meu_perfil():
    """Retorna os dados do paciente logado — acessível pelo próprio paciente"""
    user = request.user
    conn = get_db()
    if user['perfil'] == 'paciente':
        pid = user.get('id_ref') or user.get('sub')
        # Se id_ref é None, tenta encontrar pelo login
        if not pid:
            login = user.get('login','')
            # tenta achar paciente pelo e-mail que corresponde ao login
            p = conn.execute(
                "SELECT id FROM pacientes WHERE email LIKE ?", (f'%{login.replace(".","%")}%',)
            ).fetchone()
            if p: pid = p['id']
        if pid:
            paciente = conn.execute("SELECT * FROM pacientes WHERE id=?", (pid,)).fetchone()
            conn.close()
            if paciente:
                return jsonify({'id': paciente['id'], 'nome': paciente['nome'],
                                'convenio': paciente['convenio'], 'perfil': 'paciente'})
        conn.close()
        # último recurso: retorna dados do token
        return jsonify({'id': pid, 'nome': user.get('nome'), 'convenio': '', 'perfil': 'paciente'})
    conn.close()
    return jsonify(user)

# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD — conteúdo filtrado por perfil
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/dashboard', methods=['GET'])
@require_auth
def dashboard():
    conn  = get_db()
    hoje  = datetime.date.today().isoformat()
    mes_i = datetime.date.today().replace(day=1).isoformat()
    perfil = request.user['perfil']
    id_ref = request.user['id_ref']

    # ── PACIENTE: vê apenas suas próprias consultas ───────────────────────────
    if perfil == 'paciente':
        proximas = conn.execute("""
            SELECT c.id, c.data_hora, c.status, c.tipo,
                   m.nome as medico, e.nome as especialidade
            FROM consultas c
            JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE c.id_paciente=?
              AND date(c.data_hora) >= ?
              AND c.status IN ('agendada','confirmada')
            ORDER BY c.data_hora LIMIT 10
        """, (id_ref, hoje)).fetchall()

        total_consultas = conn.execute(
            "SELECT COUNT(*) as n FROM consultas WHERE id_paciente=? AND status='realizada'", (id_ref,)
        ).fetchone()['n']

        conn.close()
        return jsonify({
            'perfil': 'paciente',
            'proximas_consultas': [dict(r) for r in proximas],
            'stats': {'total_consultas_realizadas': total_consultas}
        })

    # ── MÉDICO: vê apenas suas consultas e seu faturamento ───────────────────
    if perfil == 'medico':
        mid = id_ref
        consultas_hoje = conn.execute("""
            SELECT c.id, c.data_hora, c.status, c.tipo, c.observacoes,
                   p.nome as paciente, e.nome as especialidade
            FROM consultas c
            JOIN pacientes p ON p.id=c.id_paciente
            JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE c.id_medico=? AND date(c.data_hora)=?
            ORDER BY c.data_hora
        """, (mid, hoje)).fetchall()

        proximas = conn.execute("""
            SELECT c.id, c.data_hora, c.status, c.tipo, c.observacoes,
                   p.nome as paciente, e.nome as especialidade
            FROM consultas c
            JOIN pacientes p ON p.id=c.id_paciente
            JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE c.id_medico=?
              AND date(c.data_hora) > ?
              AND date(c.data_hora) <= date(?,'+7 days')
              AND c.status IN ('agendada','confirmada')
            ORDER BY c.data_hora LIMIT 10
        """, (mid, hoje, hoje)).fetchall()

        stats = {}
        stats['consultas_hoje'] = conn.execute(
            "SELECT COUNT(*) as n FROM consultas WHERE id_medico=? AND date(data_hora)=? AND status NOT IN ('cancelada')",
            (mid, hoje)
        ).fetchone()['n']
        stats['consultas_mes'] = conn.execute(
            "SELECT COUNT(*) as n FROM consultas WHERE id_medico=? AND date(data_hora)>=? AND status NOT IN ('cancelada')",
            (mid, mes_i)
        ).fetchone()['n']
        # Faturamento apenas do próprio médico
        stats['faturamento_mes'] = conn.execute("""
            SELECT COALESCE(SUM(f.valor),0) as v FROM faturas f
            JOIN consultas c ON c.id=f.id_consulta
            WHERE c.id_medico=? AND date(f.data_emissao)>=? AND f.status='pago'
        """, (mid, mes_i)).fetchone()['v']
        stats['taxa_absenteismo'] = conn.execute("""
            SELECT ROUND(100.0*SUM(CASE WHEN status='falta' THEN 1 ELSE 0 END)/MAX(COUNT(*),1),1) as t
            FROM consultas WHERE id_medico=? AND date(data_hora)>=?
        """, (mid, mes_i)).fetchone()['t'] or 0

        conn.close()
        return jsonify({
            'perfil': 'medico',
            'stats': stats,
            'consultas_hoje': [dict(r) for r in consultas_hoje],
            'proximas_consultas': [dict(r) for r in proximas],
        })

    # ── RECEPCIONISTA: agenda do dia e próximas, sem financeiro ───────────────
    if perfil == 'recepcionista':
        consultas_hoje = conn.execute("""
            SELECT c.id, c.data_hora, c.status, c.tipo,
                   p.nome as paciente, m.nome as medico, e.nome as especialidade
            FROM consultas c
            JOIN pacientes p ON p.id=c.id_paciente
            JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE date(c.data_hora)=?
            ORDER BY c.data_hora
        """, (hoje,)).fetchall()

        proximas = conn.execute("""
            SELECT c.id, c.data_hora, c.status, c.tipo,
                   p.nome as paciente, m.nome as medico, e.nome as especialidade
            FROM consultas c
            JOIN pacientes p ON p.id=c.id_paciente
            JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE date(c.data_hora) > ? AND date(c.data_hora) <= date(?,'+7 days')
              AND c.status IN ('agendada','confirmada')
            ORDER BY c.data_hora LIMIT 10
        """, (hoje, hoje)).fetchall()

        stats = {
            'total_pacientes':  conn.execute("SELECT COUNT(*) as n FROM pacientes").fetchone()['n'],
            'total_medicos':    conn.execute("SELECT COUNT(*) as n FROM medicos WHERE ativo=1").fetchone()['n'],
            'consultas_hoje':   conn.execute("SELECT COUNT(*) as n FROM consultas WHERE date(data_hora)=? AND status NOT IN ('cancelada')", (hoje,)).fetchone()['n'],
            'consultas_mes':    conn.execute("SELECT COUNT(*) as n FROM consultas WHERE date(data_hora)>=? AND status NOT IN ('cancelada')", (mes_i,)).fetchone()['n'],
        }
        conn.close()
        return jsonify({
            'perfil': 'recepcionista',
            'stats': stats,
            'consultas_hoje': [dict(r) for r in consultas_hoje],
            'proximas_consultas': [dict(r) for r in proximas],
        })

    # ── ADMIN: visão completa ─────────────────────────────────────────────────
    stats = {
        'total_pacientes':  conn.execute("SELECT COUNT(*) as n FROM pacientes").fetchone()['n'],
        'total_medicos':    conn.execute("SELECT COUNT(*) as n FROM medicos WHERE ativo=1").fetchone()['n'],
        'consultas_hoje':   conn.execute("SELECT COUNT(*) as n FROM consultas WHERE date(data_hora)=? AND status NOT IN ('cancelada')", (hoje,)).fetchone()['n'],
        'consultas_mes':    conn.execute("SELECT COUNT(*) as n FROM consultas WHERE date(data_hora)>=? AND status NOT IN ('cancelada')", (mes_i,)).fetchone()['n'],
        'receita_mes':      conn.execute("SELECT COALESCE(SUM(valor),0) as v FROM faturas WHERE date(data_emissao)>=? AND status='pago'", (mes_i,)).fetchone()['v'],
        'taxa_absenteismo': conn.execute("SELECT ROUND(100.0*SUM(CASE WHEN status='falta' THEN 1 ELSE 0 END)/MAX(COUNT(*),1),1) as t FROM consultas WHERE date(data_hora)>=?", (mes_i,)).fetchone()['t'] or 0,
    }
    consultas_hoje = conn.execute("""
        SELECT c.id, c.data_hora, c.status, c.tipo,
               p.nome as paciente, m.nome as medico, e.nome as especialidade
        FROM consultas c JOIN pacientes p ON p.id=c.id_paciente
        JOIN medicos m ON m.id=c.id_medico JOIN especialidades e ON e.id=m.id_especialidade
        WHERE date(c.data_hora)=? ORDER BY c.data_hora
    """, (hoje,)).fetchall()
    por_esp = conn.execute("""
        SELECT e.nome as especialidade, COUNT(*) as total
        FROM consultas c JOIN medicos m ON m.id=c.id_medico
        JOIN especialidades e ON e.id=m.id_especialidade
        WHERE date(c.data_hora)>=? AND c.status NOT IN ('cancelada')
        GROUP BY e.nome ORDER BY total DESC
    """, (mes_i,)).fetchall()
    receita_mensal = conn.execute("""
        SELECT strftime('%Y-%m', data_emissao) as mes, SUM(valor) as total
        FROM faturas WHERE status='pago'
        GROUP BY mes ORDER BY mes DESC LIMIT 6
    """).fetchall()
    proximas = conn.execute("""
        SELECT c.id, c.data_hora, c.status, c.tipo,
               p.nome as paciente, m.nome as medico, e.nome as especialidade
        FROM consultas c JOIN pacientes p ON p.id=c.id_paciente
        JOIN medicos m ON m.id=c.id_medico JOIN especialidades e ON e.id=m.id_especialidade
        WHERE date(c.data_hora) > ? AND date(c.data_hora) <= date(?,'+7 days')
          AND c.status IN ('agendada','confirmada')
        ORDER BY c.data_hora LIMIT 10
    """, (hoje, hoje)).fetchall()
    conn.close()
    return jsonify({
        'perfil': 'admin',
        'stats': stats,
        'consultas_hoje': [dict(r) for r in consultas_hoje],
        'por_especialidade': [dict(r) for r in por_esp],
        'receita_mensal': [dict(r) for r in receita_mensal],
        'proximas_consultas': [dict(r) for r in proximas],
    })

# ══════════════════════════════════════════════════════════════════════════════
# ESPECIALIDADES
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/especialidades', methods=['GET'])
@require_auth
def get_especialidades():
    lang = request.args.get('lang', 'pt')
    conn = get_db()
    # Adicionar coluna nome_en se não existir (migração automática)
    try:
        conn.execute("ALTER TABLE especialidades ADD COLUMN nome_en TEXT")
        conn.execute("ALTER TABLE especialidades ADD COLUMN descricao_en TEXT")
        conn.commit()
    except Exception:
        pass  # Colunas já existem
    rows = conn.execute("SELECT * FROM especialidades ORDER BY nome").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if lang == 'en':
            d['nome']     = d.get('nome_en')     or d['nome']
            d['descricao']= d.get('descricao_en') or d.get('descricao','')
        result.append(d)
    return jsonify(result)

# ══════════════════════════════════════════════════════════════════════════════
# MÉDICOS
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/medicos', methods=['GET'])
@require_auth
def get_medicos():
    esp_id = request.args.get('especialidade')
    lang   = get_lang()
    conn = get_db()
    if esp_id:
        rows = conn.execute("""
            SELECT m.*, e.nome as especialidade_nome FROM medicos m
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE m.id_especialidade=? AND m.ativo=1 ORDER BY m.nome
        """, (esp_id,)).fetchall()
    else:
        rows = conn.execute("""
            SELECT m.*, e.nome as especialidade_nome FROM medicos m
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE m.ativo=1 ORDER BY m.nome
        """).fetchall()
    conn.close()
    return jsonify(tr_list(rows, lang))

@app.route('/api/medicos/<int:mid>', methods=['GET'])
@require_auth
def get_medico(mid):
    lang = get_lang()
    conn = get_db()
    m = conn.execute("""
        SELECT m.*, e.nome as especialidade_nome FROM medicos m
        JOIN especialidades e ON e.id=m.id_especialidade WHERE m.id=?
    """, (mid,)).fetchone()
    conn.close()
    if not m: return jsonify({'error':'Não encontrado'}), 404
    return jsonify(tr(dict(m), lang))

@app.route('/api/medicos', methods=['POST'])
@require_auth
def create_medico():
    if not is_admin():
        return jsonify({'error':'Sem permissão. Apenas administradores podem cadastrar médicos.'}), 403
    d = request.json or {}
    conn = get_db()
    try:
        cur = conn.execute(
            "INSERT INTO medicos(nome,crm,email,telefone,id_especialidade,bio) VALUES(?,?,?,?,?,?)",
            (d['nome'],d['crm'],d['email'],d.get('telefone'),d['id_especialidade'],d.get('bio',''))
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Médico cadastrado com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# ══════════════════════════════════════════════════════════════════════════════
# DISPONIBILIDADE
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/medicos/<int:mid>/disponibilidade', methods=['GET'])
@require_auth
def get_disponibilidade(mid):
    data_str = request.args.get('data')
    if not data_str:
        return jsonify({'error':'Parâmetro data obrigatório'}), 400
    try:
        data = datetime.date.fromisoformat(data_str)
    except Exception:
        return jsonify({'error':'Data inválida'}), 400

    dia_semana = data.weekday()
    conn = get_db()
    medico = conn.execute("SELECT * FROM medicos WHERE id=? AND ativo=1", (mid,)).fetchone()
    if not medico:
        conn.close()
        return jsonify({'error':'Médico não encontrado'}), 404
    duracao = conn.execute("SELECT duracao_minutos FROM especialidades WHERE id=?", (medico['id_especialidade'],)).fetchone()['duracao_minutos']
    horarios = conn.execute("SELECT hora_inicio, hora_fim FROM horarios_medico WHERE id_medico=? AND dia_semana=?", (mid, dia_semana)).fetchall()
    ocupados = conn.execute(
        "SELECT strftime('%H:%M', data_hora) as hora FROM consultas WHERE id_medico=? AND date(data_hora)=? AND status NOT IN ('cancelada')",
        (mid, data_str)
    ).fetchall()
    ocupados_set = {r['hora'] for r in ocupados}

    slots = []
    for h in horarios:
        inicio = datetime.datetime.strptime(f"{data_str} {h['hora_inicio']}", "%Y-%m-%d %H:%M")
        fim    = datetime.datetime.strptime(f"{data_str} {h['hora_fim']}",    "%Y-%m-%d %H:%M")
        atual  = inicio
        while atual + datetime.timedelta(minutes=duracao) <= fim:
            hora_str = atual.strftime('%H:%M')
            slots.append({'hora': hora_str, 'disponivel': hora_str not in ocupados_set, 'datetime': f"{data_str}T{hora_str}:00"})
            atual += datetime.timedelta(minutes=duracao)
    conn.close()
    return jsonify({'data': data_str, 'slots': slots, 'duracao': duracao})

# ══════════════════════════════════════════════════════════════════════════════
# PACIENTES
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/pacientes', methods=['GET'])
@require_auth
def get_pacientes():
    # Paciente não pode listar outros pacientes
    if is_paciente():
        return jsonify({'error': 'Sem permissão'}), 403
    q = request.args.get('q', '')
    conn = get_db()
    # Médico só vê pacientes que já atendeu
    if is_medico():
        mid = request.user['id_ref']
        if q:
            rows = conn.execute("""
                SELECT DISTINCT p.* FROM pacientes p
                JOIN consultas c ON c.id_paciente=p.id
                WHERE c.id_medico=? AND (p.nome LIKE ? OR p.cpf LIKE ? OR p.email LIKE ?)
                ORDER BY p.nome LIMIT 50
            """, (mid, f'%{q}%', f'%{q}%', f'%{q}%')).fetchall()
        else:
            rows = conn.execute("""
                SELECT DISTINCT p.* FROM pacientes p
                JOIN consultas c ON c.id_paciente=p.id
                WHERE c.id_medico=?
                ORDER BY p.nome LIMIT 100
            """, (mid,)).fetchall()
    else:
        if q:
            rows = conn.execute(
                "SELECT * FROM pacientes WHERE nome LIKE ? OR cpf LIKE ? OR email LIKE ? ORDER BY nome LIMIT 50",
                (f'%{q}%', f'%{q}%', f'%{q}%')
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM pacientes ORDER BY nome LIMIT 100").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/pacientes/<int:pid>', methods=['GET'])
@require_auth
def get_paciente(pid):
    # Paciente só pode ver a si mesmo
    if is_paciente() and request.user['id_ref'] != pid:
        return jsonify({'error': 'Sem permissão'}), 403
    # Médico só vê pacientes que atendeu
    if is_medico():
        mid = request.user['id_ref']
        conn = get_db()
        atendeu = conn.execute(
            "SELECT id FROM consultas WHERE id_medico=? AND id_paciente=? LIMIT 1", (mid, pid)
        ).fetchone()
        if not atendeu:
            conn.close()
            return jsonify({'error': 'Sem permissão'}), 403
        conn.close()

    conn = get_db()
    p = conn.execute("SELECT * FROM pacientes WHERE id=?", (pid,)).fetchone()
    if not p:
        conn.close()
        return jsonify({'error':'Não encontrado'}), 404

    # Médico vê só consultas que ele realizou
    if is_medico():
        consultas = conn.execute("""
            SELECT c.*, m.nome as medico, e.nome as especialidade
            FROM consultas c JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE c.id_paciente=? AND c.id_medico=?
            ORDER BY c.data_hora DESC LIMIT 20
        """, (pid, request.user['id_ref'])).fetchall()
    else:
        consultas = conn.execute("""
            SELECT c.*, m.nome as medico, e.nome as especialidade
            FROM consultas c JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE c.id_paciente=? ORDER BY c.data_hora DESC LIMIT 20
        """, (pid,)).fetchall()
    conn.close()
    return jsonify({'paciente': dict(p), 'consultas': [dict(c) for c in consultas]})

@app.route('/api/pacientes', methods=['POST'])
@require_auth
def create_paciente():
    # Admin, recepcionista e médico podem cadastrar pacientes
    if not (is_admin_recepcao() or is_medico()):
        return jsonify({'error':'Sem permissão'}), 403
    d = request.json or {}
    conn = get_db()
    try:
        cur = conn.execute(
            "INSERT INTO pacientes(nome,cpf,data_nascimento,telefone,email,endereco,convenio,numero_carteira) VALUES(?,?,?,?,?,?,?,?)",
            (d['nome'],d['cpf'],d.get('data_nascimento'),d.get('telefone'),d['email'],d.get('endereco'),d.get('convenio'),d.get('numero_carteira'))
        )
        conn.commit()
        new_id = cur.lastrowid
        login_u = d['email'].split('@')[0].lower().replace('.','_')[:20]
        senha_h = hashlib.sha256('paciente123'.encode()).hexdigest()
        try:
            conn.execute("INSERT INTO usuarios(login,senha_hash,perfil,id_ref) VALUES(?,?,?,?)", (login_u, senha_h, 'paciente', new_id))
            conn.commit()
        except Exception:
            pass
        conn.close()
        return jsonify({'id': new_id, 'message': 'Paciente cadastrado com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/pacientes/<int:pid>', methods=['PUT'])
@require_auth
def update_paciente(pid):
    if not is_admin_recepcao():
        return jsonify({'error':'Sem permissão'}), 403
    d = request.json or {}
    conn = get_db()
    conn.execute(
        "UPDATE pacientes SET nome=?,telefone=?,email=?,endereco=?,convenio=?,numero_carteira=? WHERE id=?",
        (d.get('nome'),d.get('telefone'),d.get('email'),d.get('endereco'),d.get('convenio'),d.get('numero_carteira'),pid)
    )
    conn.commit()
    conn.close()
    return jsonify({'message':'Paciente atualizado com sucesso'})

# ══════════════════════════════════════════════════════════════════════════════
# CONSULTAS
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/consultas', methods=['GET'])
@require_auth
def get_consultas():
    data_i = request.args.get('data_inicio')
    data_f = request.args.get('data_fim')
    mid    = request.args.get('medico_id')
    pid    = request.args.get('paciente_id')
    status = request.args.get('status')

    # Paciente → apenas suas consultas
    if is_paciente():
        pid = str(request.user['id_ref'])
        mid = None  # ignora qualquer filtro de médico
    # Médico → apenas suas consultas
    elif is_medico():
        mid = str(request.user['id_ref'])

    where  = ['1=1']
    params = []
    if data_i: where.append("date(c.data_hora) >= ?"); params.append(data_i)
    if data_f: where.append("date(c.data_hora) <= ?"); params.append(data_f)
    if mid:    where.append("c.id_medico=?");          params.append(mid)
    if pid:    where.append("c.id_paciente=?");        params.append(pid)
    if status: where.append("c.status=?");             params.append(status)

    conn = get_db()
    lang = get_lang()
    rows = conn.execute(f"""
        SELECT c.*, p.nome as paciente_nome, m.nome as medico_nome, e.nome as especialidade
        FROM consultas c
        JOIN pacientes p ON p.id=c.id_paciente
        JOIN medicos   m ON m.id=c.id_medico
        JOIN especialidades e ON e.id=m.id_especialidade
        WHERE {' AND '.join(where)}
        ORDER BY c.data_hora DESC LIMIT 200
    """, params).fetchall()
    conn.close()
    return jsonify(tr_list(rows, lang))

@app.route('/api/consultas', methods=['POST'])
@require_auth
def create_consulta():
    d = request.json or {}
    # Paciente só pode agendar para si mesmo
    if is_paciente() and d.get('id_paciente') != request.user['id_ref']:
        return jsonify({'error': 'Sem permissão para agendar para outro paciente.'}), 403
    # Médico só pode agendar consultas para si mesmo
    if is_medico() and d.get('id_medico') != request.user['id_ref']:
        return jsonify({'error': 'Você só pode agendar consultas para si mesmo.'}), 403

    conn = get_db()
    try:
        existe = conn.execute(
            "SELECT id FROM consultas WHERE id_medico=? AND data_hora=? AND status NOT IN ('cancelada')",
            (d['id_medico'], d['data_hora'])
        ).fetchone()
        if existe:
            conn.close()
            return jsonify({'error':'Horário já ocupado para este médico'}), 409
        cur = conn.execute(
            "INSERT INTO consultas(id_paciente,id_medico,data_hora,tipo,valor,convenio,observacoes) VALUES(?,?,?,?,?,?,?)",
            (d['id_paciente'],d['id_medico'],d['data_hora'],d.get('tipo','presencial'),d.get('valor',0),d.get('convenio'),d.get('observacoes'))
        )
        conn.commit()
        cid = cur.lastrowid
        if d.get('valor',0) > 0:
            conn.execute("INSERT INTO faturas(id_consulta,id_paciente,valor,status) VALUES(?,?,?,?)",
                         (cid, d['id_paciente'], d['valor'], 'pendente'))
            conn.commit()
        conn.close()
        return jsonify({'id': cid, 'message':'Consulta agendada com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/consultas/<int:cid>', methods=['PUT'])
@require_auth
def update_consulta(cid):
    # Paciente não pode alterar status de consultas
    if is_paciente():
        return jsonify({'error':'Sem permissão'}), 403
    # Médico só atualiza consultas dele
    if is_medico():
        conn = get_db()
        consulta = conn.execute("SELECT id_medico FROM consultas WHERE id=?", (cid,)).fetchone()
        conn.close()
        if not consulta or consulta['id_medico'] != request.user['id_ref']:
            return jsonify({'error':'Sem permissão para esta consulta'}), 403
    d = request.json or {}
    conn = get_db()
    conn.execute("UPDATE consultas SET status=?, observacoes=? WHERE id=?", (d.get('status'), d.get('observacoes'), cid))
    conn.commit()
    conn.close()
    return jsonify({'message':'Consulta atualizada'})

@app.route('/api/consultas/<int:cid>', methods=['DELETE'])
@require_auth
def cancel_consulta(cid):
    # Paciente pode cancelar só as suas
    if is_paciente():
        conn = get_db()
        consulta = conn.execute("SELECT id_paciente FROM consultas WHERE id=?", (cid,)).fetchone()
        conn.close()
        if not consulta or consulta['id_paciente'] != request.user['id_ref']:
            return jsonify({'error':'Sem permissão para cancelar esta consulta'}), 403
    elif is_medico():
        return jsonify({'error':'Médicos não cancelam consultas — contate a recepção'}), 403
    conn = get_db()
    conn.execute("UPDATE consultas SET status='cancelada' WHERE id=?", (cid,))
    conn.execute("UPDATE faturas SET status='cancelado' WHERE id_consulta=?", (cid,))
    conn.commit()
    conn.close()
    return jsonify({'message':'Consulta cancelada'})

# ══════════════════════════════════════════════════════════════════════════════
# PRONTUÁRIOS
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/prontuarios/<int:pid>', methods=['GET'])
@require_auth
def get_prontuarios_paciente(pid):
    # Paciente só vê os SEUS PRÓPRIOS prontuários — direito garantido
    if is_paciente():
        if request.user['id_ref'] != pid:
            return jsonify({'error': 'Sem permissão para ver prontuários de outro paciente'}), 403
        # Paciente pode ver seus prontuários normalmente — cai no bloco final
    # Recepcionista não vê prontuários (dado clínico restrito)
    if is_recepcao():
        return jsonify({'error': 'Recepcionistas não têm acesso a prontuários clínicos'}), 403
    # Médico só vê prontuários de pacientes que atendeu
    if is_medico():
        mid = request.user['id_ref']
        conn = get_db()
        atendeu = conn.execute(
            "SELECT id FROM consultas WHERE id_medico=? AND id_paciente=? LIMIT 1", (mid, pid)
        ).fetchone()
        if not atendeu:
            conn.close()
            return jsonify({'error': 'Sem permissão'}), 403
        lang = get_lang()
        rows = conn.execute("""
            SELECT pr.*, c.data_hora, m.nome as medico, e.nome as especialidade
            FROM prontuarios pr
            JOIN consultas c ON c.id=pr.id_consulta
            JOIN medicos m ON m.id=c.id_medico
            JOIN especialidades e ON e.id=m.id_especialidade
            WHERE pr.id_paciente=? AND c.id_medico=?
            ORDER BY c.data_hora DESC
        """, (pid, mid)).fetchall()
        conn.close()
        return jsonify(tr_list(rows, lang))

    lang = get_lang()
    conn = get_db()
    rows = conn.execute("""
        SELECT pr.*, c.data_hora, m.nome as medico, e.nome as especialidade
        FROM prontuarios pr
        JOIN consultas c ON c.id=pr.id_consulta
        JOIN medicos m ON m.id=c.id_medico
        JOIN especialidades e ON e.id=m.id_especialidade
        WHERE pr.id_paciente=? ORDER BY c.data_hora DESC
    """, (pid,)).fetchall()
    conn.close()
    return jsonify(tr_list(rows, lang))

@app.route('/api/prontuarios/consulta/<int:cid>', methods=['GET'])
@require_auth
def get_prontuario_consulta(cid):
    if is_recepcao() or is_paciente():
        return jsonify({'error': 'Sem permissão'}), 403
    if is_medico():
        conn = get_db()
        consulta = conn.execute("SELECT id_medico FROM consultas WHERE id=?", (cid,)).fetchone()
        if not consulta or consulta['id_medico'] != request.user['id_ref']:
            conn.close()
            return jsonify({'error': 'Sem permissão'}), 403
        conn.close()
    conn = get_db()
    pr = conn.execute("SELECT * FROM prontuarios WHERE id_consulta=?", (cid,)).fetchone()
    conn.close()
    if not pr: return jsonify(None)
    return jsonify(dict(pr))

@app.route('/api/prontuarios', methods=['POST'])
@require_auth
def create_prontuario():
    if not is_admin_medico():
        return jsonify({'error':'Sem permissão'}), 403
    # Médico só salva prontuário de consulta sua
    if is_medico():
        d = request.json or {}
        conn = get_db()
        consulta = conn.execute("SELECT id_medico FROM consultas WHERE id=?", (d.get('id_consulta'),)).fetchone()
        conn.close()
        if not consulta or consulta['id_medico'] != request.user['id_ref']:
            return jsonify({'error':'Sem permissão para esta consulta'}), 403
    d = request.json or {}
    conn = get_db()
    try:
        existing = conn.execute("SELECT id FROM prontuarios WHERE id_consulta=?", (d['id_consulta'],)).fetchone()
        if existing:
            conn.execute(
                "UPDATE prontuarios SET anamnese=?,diagnostico=?,prescricao=?,observacoes=?,updated_at=datetime('now') WHERE id=?",
                (d.get('anamnese'),d.get('diagnostico'),d.get('prescricao'),d.get('observacoes'),existing['id'])
            )
        else:
            conn.execute(
                "INSERT INTO prontuarios(id_consulta,id_paciente,anamnese,diagnostico,prescricao,observacoes) VALUES(?,?,?,?,?,?)",
                (d['id_consulta'],d['id_paciente'],d.get('anamnese'),d.get('diagnostico'),d.get('prescricao'),d.get('observacoes'))
            )
        conn.execute("UPDATE consultas SET status='realizada' WHERE id=?", (d['id_consulta'],))
        conn.commit()
        conn.close()
        return jsonify({'message':'Prontuário salvo com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# ══════════════════════════════════════════════════════════════════════════════
# FINANCEIRO — apenas admin
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/financeiro', methods=['GET'])
@require_auth
def get_financeiro():
    if not is_admin():
        return jsonify({'error':'Acesso restrito ao Administrador'}), 403
    data_i = request.args.get('data_inicio', datetime.date.today().replace(day=1).isoformat())
    data_f = request.args.get('data_fim', datetime.date.today().isoformat())
    conn = get_db()
    lang = get_lang()
    faturas = conn.execute("""
        SELECT f.*, p.nome as paciente_nome, e.nome as especialidade,
               c.data_hora as data_consulta, m.nome as medico_nome
        FROM faturas f
        JOIN pacientes p ON p.id=f.id_paciente
        JOIN consultas c ON c.id=f.id_consulta
        JOIN medicos m ON m.id=c.id_medico
        JOIN especialidades e ON e.id=m.id_especialidade
        WHERE date(f.data_emissao) BETWEEN ? AND ?
        ORDER BY f.data_emissao DESC
        LIMIT 10
    """, (data_i, data_f)).fetchall()
    resumo = conn.execute("""
        SELECT
            SUM(CASE WHEN status='pago'      THEN valor ELSE 0 END) as receita,
            SUM(CASE WHEN status='pendente'  THEN valor ELSE 0 END) as pendente,
            SUM(CASE WHEN status='cancelado' THEN valor ELSE 0 END) as cancelado,
            COUNT(*) as total_faturas
        FROM faturas WHERE date(data_emissao) BETWEEN ? AND ?
    """, (data_i, data_f)).fetchone()
    conn.close()
    return jsonify({'faturas': tr_list(faturas, lang), 'resumo': dict(resumo)})

@app.route('/api/financeiro/<int:fid>/pagar', methods=['POST'])
@require_auth
def pagar_fatura(fid):
    d = request.json or {}
    conn = get_db()
    # Médico só pode confirmar pagamentos das suas próprias consultas
    if is_medico():
        mid = request.user['id_ref']
        fatura = conn.execute(
            "SELECT f.id FROM faturas f JOIN consultas c ON c.id=f.id_consulta WHERE f.id=? AND c.id_medico=?",
            (fid, mid)
        ).fetchone()
        if not fatura:
            conn.close()
            return jsonify({'error':'Sem permissão para esta fatura'}), 403
    elif not is_admin_recepcao():
        conn.close()
        return jsonify({'error':'Sem permissão'}), 403
    conn.execute(
        "UPDATE faturas SET status='pago', forma_pagamento=?, data_pagamento=datetime('now') WHERE id=?",
        (d.get('forma_pagamento','dinheiro'), fid)
    )
    conn.commit()
    conn.close()
    return jsonify({'message':'Pagamento registrado com sucesso'})

# Faturamento do próprio médico
@app.route('/api/financeiro/medico', methods=['GET'])
@require_auth
def get_financeiro_medico():
    if not is_medico():
        return jsonify({'error':'Rota exclusiva para médicos'}), 403
    mid    = request.user['id_ref']
    data_i = request.args.get('data_inicio', datetime.date.today().replace(day=1).isoformat())
    data_f = request.args.get('data_fim', datetime.date.today().isoformat())
    conn   = get_db()
    lang = get_lang()
    faturas = conn.execute("""
        SELECT f.*, p.nome as paciente_nome, e.nome as especialidade, c.data_hora as data_consulta
        FROM faturas f
        JOIN pacientes p ON p.id=f.id_paciente
        JOIN consultas c ON c.id=f.id_consulta
        JOIN medicos m ON m.id=c.id_medico
        JOIN especialidades e ON e.id=m.id_especialidade
        WHERE c.id_medico=? AND date(f.data_emissao) BETWEEN ? AND ?
        ORDER BY f.data_emissao DESC
        LIMIT 10
    """, (mid, data_i, data_f)).fetchall()
    resumo = conn.execute("""
        SELECT
            SUM(CASE WHEN f.status='pago'      THEN f.valor ELSE 0 END) as receita,
            SUM(CASE WHEN f.status='pendente'  THEN f.valor ELSE 0 END) as pendente,
            COUNT(*) as total_faturas
        FROM faturas f JOIN consultas c ON c.id=f.id_consulta
        WHERE c.id_medico=? AND date(f.data_emissao) BETWEEN ? AND ?
    """, (mid, data_i, data_f)).fetchone()
    conn.close()
    return jsonify({'faturas': [dict(r) for r in faturas], 'resumo': dict(resumo)})

# ══════════════════════════════════════════════════════════════════════════════
# RELATÓRIOS — apenas admin
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/relatorios/atendimentos', methods=['GET'])
@require_auth
def relatorio_atendimentos():
    if not is_admin():
        return jsonify({'error':'Relatórios gerenciais são restritos ao Administrador'}), 403
    data_i = request.args.get('data_inicio', (datetime.date.today() - datetime.timedelta(days=30)).isoformat())
    data_f = request.args.get('data_fim', datetime.date.today().isoformat())
    conn   = get_db()
    por_dia = conn.execute("""
        SELECT date(data_hora) as dia, COUNT(*) as total,
               SUM(CASE WHEN status='falta' THEN 1 ELSE 0 END) as faltas
        FROM consultas WHERE date(data_hora) BETWEEN ? AND ? AND status NOT IN ('cancelada')
        GROUP BY dia ORDER BY dia
    """, (data_i, data_f)).fetchall()
    por_esp = conn.execute("""
        SELECT e.nome as especialidade, COUNT(*) as total, AVG(c.valor) as ticket_medio
        FROM consultas c JOIN medicos m ON m.id=c.id_medico
        JOIN especialidades e ON e.id=m.id_especialidade
        WHERE date(c.data_hora) BETWEEN ? AND ? AND c.status NOT IN ('cancelada')
        GROUP BY e.nome ORDER BY total DESC
    """, (data_i, data_f)).fetchall()
    por_medico = conn.execute("""
        SELECT m.nome as medico, COUNT(*) as total,
               SUM(CASE WHEN c.status='falta' THEN 1 ELSE 0 END) as faltas
        FROM consultas c JOIN medicos m ON m.id=c.id_medico
        WHERE date(c.data_hora) BETWEEN ? AND ? AND c.status NOT IN ('cancelada')
        GROUP BY m.nome ORDER BY total DESC
    """, (data_i, data_f)).fetchall()
    conn.close()
    return jsonify({
        'por_dia': [dict(r) for r in por_dia],
        'por_especialidade': [dict(r) for r in por_esp],
        'por_medico': [dict(r) for r in por_medico],
    })

# ══════════════════════════════════════════════════════════════════════════════
# RESET BANCO (apenas admin — recria seeds sem apagar dados de produção)
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/admin/reset-users', methods=['POST'])
@require_auth
def reset_users():
    if not is_admin():
        return jsonify({'error': 'Apenas admin'}), 403
    conn = get_db()
    # Remove usuários de seed antigos e recria
    logins_antigos = [
        'recepcao','ana.lima','carlos.souza','beatriz.costa',
        'rafael.mendes','patricia.rocha','marcos.andrade',
        'maria.silva','joao.santos'
    ]
    for l in logins_antigos:
        conn.execute("DELETE FROM usuarios WHERE login=?", (l,))
    conn.commit()
    conn.close()
    # Reinicia o seed
    init_db()
    return jsonify({'message': 'Usuários atualizados com sucesso!'})

# ══════════════════════════════════════════════════════════════════════════════
# FRONT-END
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path='index.html'):
    try:    return send_from_directory(FRONT_DIR, path)
    except: return send_from_directory(FRONT_DIR, 'index.html')

# Inicialização automática
with app.app_context():
    init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n{'='*55}")
    print("   🏥  VitalCare - Sistema de Gestão Clínica")
    print(f"{'='*55}")
    print(f"  🌐  Acesse: http://localhost:{port}\n")
    print("  👤  USUÁRIOS:")
    print("      admin                / admin123    (Administrador)")
    print("      fabio.recepcao       / fabio123    (Recepcionista)")
    print("      ana.clinicageral     / ana123      (Dra. Ana Lima - Clínica Geral)")
    print("      carlos.pediatria     / carlos123   (Dr. Carlos - Pediatria)")
    print("      beatriz.cardiologia  / beatriz123  (Dra. Beatriz - Cardiologia)")
    print("      rafael.ortopedia     / rafael123   (Dr. Rafael - Ortopedia)")
    print("      patricia.nutricao    / patricia123 (Nutr. Patrícia - Nutrição)")
    print("      marcos.psicologia    / marcos123   (Psi. Marcos - Psicologia)")
    print("      maria.paciente       / maria123    (Paciente Maria)")
    print("      joao.paciente        / joao123     (Paciente João)")
    print(f"{'='*55}\n")
    app.run(debug=False, host='0.0.0.0', port=port)
