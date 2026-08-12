# --- Variáveis de Configuração ---
$PROJECT_DIR = "sano-app"
$BACKEND_DIR = "backend"
$FRONTEND_DIR = "frontend" # Assumindo que o frontend já foi 'ejected' para esta pasta
$DB_NAME = "sano_db"
$DB_USER = "sano_user"
$DB_PASSWORD = "sano_password"
$DB_PORT = "5432"
$BACKEND_PORT = "3000"
$FRONTEND_PORT = "5173"

# --- Funções Auxiliares ---
function Log-Info { Write-Host "`e[34m[INFO]`e[0m $($args[0])" }
function Log-Success { Write-Host "`e[32m[SUCCESS]`e[0m $($args[0])" }
function Log-Warning { Write-Host "`e[33m[WARNING]`e[0m $($args[0])" }
function Log-Error { Write-Host "`e[31m[ERROR]`e[0m $($args[0])"; exit 1 }

function Check-Command {
    param([string]$CommandName)
    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        Log-Error "$CommandName não está instalado. Por favor, instale-o e tente novamente."
    }
}

# --- Início do Script ---
Log-Info "Iniciando a instalação automatizada do SANO+..."

# 1. Verificar Pré-requisitos
Log-Info "Verificando pré-requisitos: Node.js, npm e Docker..."
Check-Command "node"
Check-Command "npm"
Check-Command "docker"
Check-Command "docker-compose"

# Verificar versão do Node.js
$NODE_VERSION = (node -v).Replace("v", "") | Select-Object -First 1
$NODE_MAJOR_VERSION = [int]($NODE_VERSION.Split(".")[0])
if ($NODE_MAJOR_VERSION -lt 20) {
    Log-Warning "Node.js versão $($NODE_MAJOR_VERSION) detectada. Recomenda-se a versão 20 ou superior."
}

# Criar diretório do projeto se não existir
if (-not (Test-Path $PROJECT_DIR)) {
    New-Item -ItemType Directory -Path $PROJECT_DIR | Out-Null
    Log-Info "Diretório do projeto '$PROJECT_DIR' criado."
}
Set-Location $PROJECT_DIR -ErrorAction Stop | Out-Null

# 2. Configuração do Banco de Dados (PostgreSQL com Docker)
Log-Info "Configurando o banco de dados PostgreSQL com Docker..."

@"
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
"@ | Set-Content -Path docker-compose.yml

docker-compose up -d db -ErrorAction Stop | Out-Null
Log-Success "Contêiner PostgreSQL iniciado com sucesso na porta ${DB_PORT}."
Log-Info "Aguardando o banco de dados iniciar (pode levar alguns segundos)..."
Start-Sleep -Seconds 10 # Dar um tempo para o DB iniciar

# 3. Configuração do Backend
Log-Info "Configurando o backend Node.js..."

if (-not (Test-Path $BACKEND_DIR)) {
    New-Item -ItemType Directory -Path $BACKEND_DIR | Out-Null
    Log-Info "Diretório do backend '$BACKEND_DIR' criado."
}
Set-Location $BACKEND_DIR -ErrorAction Stop | Out-Null

# Inicializar projeto Node.js e instalar dependências
npm init -y | Out-Null
npm install express pg cors dotenv | Out-Null

# Criar arquivo .env para o backend
@"
PORT=${BACKEND_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=localhost
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_NAME}
"@ | Set-Content -Path .env

# Criar arquivo server.js (exemplo básico)
@"
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
"@ | Set-Content -Path server.js

Log-Success "Backend configurado com sucesso. Você pode iniciá-lo com 'node server.js'."
Set-Location .. | Out-Null

# 4. Configuração do Frontend
Log-Info "Configurando o frontend React..."

if (-not (Test-Path $FRONTEND_DIR)) {
    Log-Error "Diretório do frontend '$FRONTEND_DIR' não encontrado. Por favor, execute 'base44 eject' primeiro para extrair o código do frontend para esta pasta."
}

Set-Location $FRONTEND_DIR -ErrorAction Stop | Out-Null

npm install | Out-Null

# Criar arquivo .env para o frontend
@"
VITE_API_URL=http://localhost:${BACKEND_PORT}
VITE_SUPABASE_URL=sua_url_do_supabase_aqui # Substitua se usar Supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase_aqui # Substitua se usar Supabase
"@ | Set-Content -Path .env

Log-Success "Frontend configurado com sucesso. Você pode iniciá-lo com 'npm run dev'."
Set-Location .. | Out-Null

Log-Success "Instalação do SANO+ concluída!"
Log-Info "Para iniciar o aplicativo:"
Log-Info "1. Navegue até o diretório '$PROJECT_DIR\$BACKEND_DIR' e execute 'node server.js'."
Log-Info "2. Navegue até o diretório '$PROJECT_DIR\$FRONTEND_DIR' e execute 'npm run dev'."
Log-Info "3. Acesse http://localhost:${FRONTEND_PORT} no seu navegador."
Log-Warning "Lembre-se de criar as tabelas no banco de dados PostgreSQL e popular com dados iniciais, se necessário."
