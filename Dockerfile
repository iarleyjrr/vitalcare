FROM python:3.11-slim

WORKDIR /app

# Copia todos os arquivos
COPY . .

# Instala dependências
RUN pip install --no-cache-dir flask==3.1.0 gunicorn==21.2.0

# Expõe a porta (Railway define via $PORT)
EXPOSE 8080

# Inicia o servidor
CMD gunicorn --chdir backend app:app --bind 0.0.0.0:${PORT:-8080} --workers 1 --timeout 120
