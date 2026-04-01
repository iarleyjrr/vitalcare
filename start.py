#!/usr/bin/env python3
"""
VitalCare – Script de inicialização
Execute: python start.py
"""
import subprocess, sys, os

BASE = os.path.dirname(os.path.abspath(__file__))
APP  = os.path.join(BASE, 'backend', 'app.py')

print("""
╔══════════════════════════════════════════════════════╗
║        🏥  VitalCare – Sistema de Gestão Clínica     ║
╠══════════════════════════════════════════════════════╣
║  Iniciando o servidor...                             ║
║  Acesse: http://localhost:5000                       ║
╚══════════════════════════════════════════════════════╝
""")

try:
    subprocess.run([sys.executable, APP], check=True)
except KeyboardInterrupt:
    print("\n⚠️  Servidor encerrado.")
except FileNotFoundError:
    print(f"❌ Arquivo não encontrado: {APP}")
    sys.exit(1)
