#!/bin/bash

# --- Variáveis de Configuração ---
PROJECT_DIR="sano-app"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend" # Assumindo que o frontend já foi 'ejected' para esta pasta
DB_NAME="sano_db"
DB_USER="sano_user"
DB_PASSWORD="sano_password"
DB_PORT="5432"
BACKEND_PORT="3000"
FRONTEND_PORT="5173"

# --- Funções Auxiliares ---
log_info() { echo -e "\e[34m[INFO]\e[0m $1"; }
log_success() { echo -e "\e[32m[SUCCESS]\e[0m $1"; }
log_warning() { echo -e "\e[33m[WARNING]\e[0m $1"; }
log_error() { echo -e "\e[31m[ERROR]\e[0m $1"; exit 1; }

check_command() {
    command -v "$1" >/dev/null 2>&1 || { log_error "$1 não está instalado. Por favor, instale-o e tente novamente."; }
}

# --- Início do Script ---
log_info "Iniciando a instalação automatizada do SANO+..."

# 1. Verificar Pré-requisitos
log_info "Verificando pré-requisitos: Node.js, npm e Docker..."
check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose"

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    log_warning "Node.js versão $NODE_VERSION detectada. Recomenda-se a versão 20 ou superior."
fi

# Criar diretório do projeto se não existir
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir "$PROJECT_DIR"
    log_info "Diretório do projeto '$PROJECT_DIR' criado."
fi
cd "$PROJECT_DIR" || log_error "Não foi possível entrar no diretório do projeto."

# 2. Configuração do Banco de Dados (PostgreSQL com Docker)
log_info "Configurando o banco de dados PostgreSQL com Docker..."

cat <<EOF > docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:${DB_PORT}"
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:
EOF

docker-compose up -d db || log_error "Falha ao iniciar o contêiner do PostgreSQL."
log_success "Contêiner PostgreSQL iniciado com sucesso na porta ${DB_PORT}."
log_info "Aguardando o banco de dados iniciar (pode levar alguns segundos)..."
sleep 10 # Dar um tempo para o DB iniciar

# 3. Configuração do Backend
log_info "Configurando o backend Node.js..."

if [ ! -d "$BACKEND_DIR" ]; then
    mkdir "$BACKEND_DIR"
    log_info "Diretório do backend '$BACKEND_DIR' criado."
fi
cd "$BACKEND_DIR" || log_error "Não foi possível entrar no diretório do backend."

# Inicializar projeto Node.js e instalar dependências
npm init -y > /dev/null || log_error "Falha ao inicializar o projeto Node.js no backend."
npm install express pg cors dotenv > /dev/null || log_error "Falha ao instalar dependências do backend."

# Criar arquivo .env para o backend
cat <<EOF > .env
PORT=${BACKEND_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=localhost
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_NAME}
EOF

# Criar arquivo server.js (exemplo básico)
cat <<EOF > server.js
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || ${BACKEND_PORT};

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
});

app.use(cors());
app.use(express.json());

// Exemplo de rota para listar pacientes
app.get("/api/patients", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM patients");
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar pacientes:", err);
        res.status(500).send("Server Error");
    }
});

// Rota de exemplo para criar paciente (simplificada)
app.post("/api/patients", async (req, res) => {
    const { nome, idade, sexo, tipo_cancer, estadiamento, imc, status, medicamentos } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO patients (nome, idade, sexo, tipo_cancer, estadiamento, imc, status, medicamentos) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [nome, idade, sexo, tipo_cancer, estadiamento, imc, status, medicamentos]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao criar paciente:", err);
        res.status(500).send("Server Error");
    }
});

// Adicione outras rotas para interações, orientações, autenticação, etc.

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
EOF

log_success "Backend configurado com sucesso. Você pode iniciá-lo com 'node server.js'."
cd ..

# 4. Configuração do Frontend
log_info "Configurando o frontend React..."

if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "Diretório do frontend '$FRONTEND_DIR' não encontrado. Por favor, execute 'base44 eject' primeiro para extrair o código do frontend para esta pasta."
fi

cd "$FRONTEND_DIR" || log_error "Não foi possível entrar no diretório do frontend."

npm install > /dev/null || log_error "Falha ao instalar dependências do frontend."

# Criar arquivo .env para o frontend
cat <<EOF > .env
VITE_API_URL=http://localhost:${BACKEND_PORT}
VITE_SUPABASE_URL=sua_url_do_supabase_aqui # Substitua se usar Supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase_aqui # Substitua se usar Supabase
EOF

log_success "Frontend configurado com sucesso. Você pode iniciá-lo com 'npm run dev'."
cd ..

log_success "Instalação do SANO+ concluída!"
log_info "Para iniciar o aplicativo:"
log_info "1. Navegue até o diretório '$PROJECT_DIR/$BACKEND_DIR' e execute 'node server.js'."
log_info "2. Navegue até o diretório '$PROJECT_DIR/$FRONTEND_DIR' e execute 'npm run dev'."
log_info "3. Acesse http://localhost:${FRONTEND_PORT} no seu navegador."
log_warning "Lembre-se de criar as tabelas no banco de dados PostgreSQL e popular com dados iniciais, se necessário."
