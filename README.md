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

## Envio de orientações pelo WhatsApp

O cadastro de pacientes inclui o campo **Telefone / WhatsApp**. Informe o número com código do país e DDD, por exemplo `+55 11 99999-9999`. Depois de gerar uma orientação, use o botão **Enviar pelo WhatsApp** para abrir o WhatsApp Web ou a aplicação WhatsApp com uma mensagem preenchida.

Esta implementação não envia mensagens automaticamente pela API oficial do WhatsApp: ela prepara a mensagem e deixa a confirmação final ao profissional. O número é normalizado no navegador; números brasileiros com 10 ou 11 dígitos recebem automaticamente o prefixo `55`.

As orientações podem conter informação clínica sensível. Confirme o destinatário antes de enviar e utilize apenas um canal autorizado pelo paciente e pela instituição.

## Alterações desta versão

- Adicionado o campo `telefone` à tabela `patients`, com migração compatível para bases existentes.
- Adicionado o campo Telefone / WhatsApp ao formulário de pacientes.
- Adicionado o botão Enviar pelo WhatsApp à visualização da orientação.
- A mensagem inclui as orientações gerais, alimentos a evitar e recomendados, suplementação, horários, observações e validade.
- Mantida a proteção para não versionar ficheiros `.env`, `.env.local`, `node_modules` e `dist`.

## Validação realizada

- `npm run build` no frontend: concluído com sucesso.
- `node --check sano-app/backend/server.js`: concluído com sucesso.

A compilação do frontend emite apenas o aviso já existente sobre o tamanho de um dos chunks JavaScript.

## Comorbidades do paciente

O cadastro permite selecionar e adicionar uma ou várias comorbidades: HAS, DM, Ansiedade, Dislipidemia, Arritmia, DPOC, Asma, Hipotireoidismo, Depressão, Doença hepática, Hepatite, Doença coronariana, Insuficiência cardíaca, Fibromialgia e/ou dor crônica, Doença neurológica degenerativa e Refluxo.

As opções escolhidas são armazenadas no campo `comorbidades` como uma lista JSONB no PostgreSQL. O backend cria essa coluna automaticamente em bases existentes, e as comorbidades são incluídas no contexto utilizado para gerar a orientação nutricional.

## Base de Interações agrupada por medicamento

A Base de Interações apresenta agora cada medicamento num único grupo expansível. Ao abrir um grupo, o utilizador vê todas as interações registadas para esse medicamento, incluindo nutriente afetado, tipo de interação, severidade e orientação nutricional. A pesquisa por medicamento ou nutriente e o filtro por severidade continuam disponíveis; ao aplicar um filtro, são mostradas apenas as interações correspondentes dentro de cada grupo.

Cada interação individual continua a poder ser editada ou excluída a partir do respetivo grupo.

## Catálogo farmacoterapêutico e antineoplásico

A entrada **Base de Interações** apresenta duas segmentações independentes:

- **Farmacoterapêutico → Medicamentos → Medicamento → Ficha detalhada**
- **Antineoplásicos → Protocolos → Protocolo → Ficha detalhada**

O catálogo inicial foi importado das páginas públicas do [Guia Farmacoterapêutico do Hospital Erasto Gaertner](https://guiafarmaco.erastogaertner.com.br/), com a fonte e a data de consulta preservadas em `sano-app/frontend/src/data/referenceCatalog.json`. O script de importação está em `tools/extract_reference_catalog.py`.

A importação deve ser revista e autorizada pelo responsável pelos conteúdos antes de uma utilização institucional ou de uma redistribuição pública. O conteúdo clínico não substitui protocolos internos nem a avaliação de profissional habilitado.
