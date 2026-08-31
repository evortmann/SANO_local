require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;

const pool = new Pool({
  connectionString,
  user: process.env.DB_USER || process.env.PGUSER || process.env.POSTGRES_USER,
  host: process.env.DB_HOST || process.env.PGHOST || process.env.POSTGRES_HOST || (isProduction ? undefined : "localhost"),
  database: process.env.DB_DATABASE || process.env.PGDATABASE || process.env.POSTGRES_DB,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  port: Number(process.env.DB_PORT || process.env.PGPORT || process.env.POSTGRES_PORT || 5432),
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const patientColumns = [
  "nome_completo",
  "telefone",
  "data_nascimento",
  "sexo",
  "peso",
  "altura",
  "tipo_cancer",
  "estadiamento",
  "medicamentos_atuais",
  "comorbidades",
  "alergias",
  "observacoes",
  "status",
];

function normalisePatient(data = {}) {
  return {
    nome_completo: String(data.nome_completo || "").trim(),
    telefone: String(data.telefone || "").trim() || null,
    data_nascimento: data.data_nascimento || null,
    sexo: data.sexo || null,
    peso: data.peso === "" || data.peso === undefined ? null : Number(data.peso),
    altura: data.altura === "" || data.altura === undefined ? null : Number(data.altura),
    tipo_cancer: String(data.tipo_cancer || "").trim(),
    estadiamento: data.estadiamento || null,
    medicamentos_atuais: Array.isArray(data.medicamentos_atuais) ? data.medicamentos_atuais : [],
    comorbidades: Array.isArray(data.comorbidades) ? data.comorbidades : [],
    alergias: data.alergias || null,
    observacoes: data.observacoes || null,
    status: data.status || "Ativo",
  };
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      nome_completo TEXT NOT NULL,
      telefone TEXT,
      data_nascimento DATE,
      sexo TEXT,
      peso NUMERIC,
      altura NUMERIC,
      tipo_cancer TEXT NOT NULL,
      estadiamento TEXT,
      medicamentos_atuais JSONB NOT NULL DEFAULT '[]'::jsonb,
      comorbidades JSONB NOT NULL DEFAULT '[]'::jsonb,
      alergias TEXT,
      observacoes TEXT,
      status TEXT NOT NULL DEFAULT 'Ativo',
      created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Compatibilidade com bases criadas pela versão antiga do projecto.
  await pool.query(`
    ALTER TABLE patients
      ADD COLUMN IF NOT EXISTS nome_completo TEXT,
      ADD COLUMN IF NOT EXISTS telefone TEXT,
      ADD COLUMN IF NOT EXISTS data_nascimento DATE,
      ADD COLUMN IF NOT EXISTS sexo TEXT,
      ADD COLUMN IF NOT EXISTS peso NUMERIC,
      ADD COLUMN IF NOT EXISTS altura NUMERIC,
      ADD COLUMN IF NOT EXISTS tipo_cancer TEXT,
      ADD COLUMN IF NOT EXISTS estadiamento TEXT,
      ADD COLUMN IF NOT EXISTS medicamentos_atuais JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS comorbidades JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS alergias TEXT,
      ADD COLUMN IF NOT EXISTS observacoes TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Ativo',
      ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", message: "Banco de dados indisponível." });
  }
});

app.get("/api/patients", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM patients ORDER BY updated_date DESC");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    res.status(500).json({ message: "Não foi possível carregar os pacientes locais." });
  }
});

app.post("/api/patients", async (req, res) => {
  const patient = normalisePatient(req.body);

  if (!patient.nome_completo || !patient.tipo_cancer) {
    return res.status(400).json({ message: "Nome completo e tipo de câncer são obrigatórios." });
  }

  if ((patient.peso !== null && Number.isNaN(patient.peso)) || (patient.altura !== null && Number.isNaN(patient.altura))) {
    return res.status(400).json({ message: "Peso e altura devem ser números válidos." });
  }

  try {
    const values = patientColumns.map((column) =>
      ["medicamentos_atuais", "comorbidades"].includes(column) ? JSON.stringify(patient[column]) : patient[column]
    );
    const placeholders = patientColumns.map((_, index) => `$${index + 1}`).join(", ");
    const { rows } = await pool.query(
      `INSERT INTO patients (${patientColumns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    res.status(500).json({ message: "Não foi possível gravar o paciente localmente." });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Identificador de paciente inválido." });
  }

  try {
    const { rows } = await pool.query("DELETE FROM patients WHERE id = $1 RETURNING id", [id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Paciente não encontrado." });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    res.status(500).json({ message: "Não foi possível excluir o paciente localmente." });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  const id = Number(req.params.id);
  const patient = normalisePatient(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Identificador de paciente inválido." });
  }
  if (!patient.nome_completo || !patient.tipo_cancer) {
    return res.status(400).json({ message: "Nome completo e tipo de câncer são obrigatórios." });
  }

  try {
    const assignments = patientColumns.map((column, index) => `${column} = $${index + 1}`).join(", ");
    const values = [
      ...patientColumns.map((column) =>
        ["medicamentos_atuais", "comorbidades"].includes(column) ? JSON.stringify(patient[column]) : patient[column]
      ),
      id,
    ];
    const { rows } = await pool.query(
      `UPDATE patients SET ${assignments}, updated_date = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Paciente não encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    res.status(500).json({ message: "Não foi possível atualizar o paciente localmente." });
  }
});

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") return next();
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Aplicação SANO disponível na porta ${port}`);

  ensureSchema().catch((error) => {
    console.error("Não foi possível inicializar a tabela patients. Verifique DATABASE_URL ou as variáveis PG* do Railway.", error.message);
  });
});
