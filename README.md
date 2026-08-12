# SANO+

Projeto local do SANO+, organizado em três partes: PostgreSQL executado via Docker, backend Node/Express e frontend React/Vite exportado da Base44.

## Estrutura

```text
SANO/
├── sano-app/
│   ├── backend/       # API Node/Express
│   ├── frontend/      # React/Vite/Base44
│   └── docker-compose.yml
└── .env.example
```

## Configuração local

Os ficheiros `.env` e `sano-app/frontend/.env.local` são locais e não devem ser enviados para o GitHub. Crie-os a partir dos exemplos ou mantenha os ficheiros já configurados na máquina de desenvolvimento.

O vínculo local da Base44 está em `sano-app/frontend/base44/.app.jsonc`. Esse ficheiro é ignorado pelo Git por conter a identificação local da aplicação.

## Execução em desenvolvimento

Na raiz `sano-app`, iniciar o PostgreSQL:

```bash
docker compose up -d db
```

Em outro terminal, iniciar o backend:

```bash
cd sano-app/backend
npm ci
npm start
```

Em outro terminal, iniciar o frontend:

```bash
cd sano-app/frontend
npm ci
npm run dev
```

O frontend fica normalmente disponível em `http://localhost:5173` e o backend em `http://localhost:3000`.

## Validação

Para validar a compilação do frontend:

```bash
cd sano-app/frontend
npm run build
```

Para validar a sintaxe do backend:

```bash
cd sano-app/backend
node --check server.js
```

Nunca fazer `git add -f` dos ficheiros `.env`, `.env.local`, `backend/.env` ou `base44/.app.jsonc`.
