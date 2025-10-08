# 🚀 Guia Completo de Deploy - MamaCare

## Arquitetura do Deploy

```
┌─────────────────┐
│    NETLIFY      │ ← Frontend (React + Vite)
│   (Frontend)    │   URL: https://seu-app.netlify.app
└────────┬────────┘
         │
         │ API Calls
         ↓
┌─────────────────┐
│     RENDER      │ ← Backend (Express + Node.js)
│    (Backend)    │   URL: https://seu-app.onrender.com
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│  SUPABASE (PostgreSQL)          │
│  + GOOGLE CLOUD STORAGE         │
└─────────────────────────────────┘
```

---

## 📦 PARTE 1: Deploy do Backend no Render

### 1.1 - Preparar o Projeto

Certifique-se que seu `package.json` tem os scripts corretos:
```json
{
  "scripts": {
    "build": "npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### 1.2 - Criar Conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started"** ou **"Sign Up"**
3. Conecte sua conta do GitHub

### 1.3 - Criar Web Service

1. No Dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório GitHub do MamaCare
4. Preencha as configurações:

**Configurações Básicas:**
- **Name:** `mamacare-backend` (ou o nome que preferir)
- **Region:** `Oregon (US West)` ou mais próximo
- **Branch:** `main` (ou sua branch principal)
- **Root Directory:** (deixe vazio)
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** `Free` (para começar)

**Variáveis de Ambiente (Environment Variables):**

Adicione as seguintes variáveis:

```env
NODE_ENV=production
PORT=10000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# Session
SESSION_SECRET=um_secret_muito_seguro_aqui_12345

# Email (Gmail - opcional, mas recomendado)
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_de_app_do_gmail

# Google Cloud Storage (se estiver usando)
PUBLIC_OBJECT_SEARCH_PATHS=/seu-bucket/public
PRIVATE_OBJECT_DIR=/seu-bucket/private
```

5. Clique em **"Create Web Service"**
6. Aguarde o build e deploy (5-10 minutos)

### 1.4 - Copiar URL do Backend

Após o deploy, você terá uma URL tipo:
```
https://mamacare-backend.onrender.com
```

**⚠️ IMPORTANTE:** Copie essa URL, você vai precisar dela!

---

## 🌐 PARTE 2: Deploy do Frontend no Netlify

### 2.1 - Configurar Variável de Ambiente da API

Antes de fazer o deploy, precisamos configurar a URL do backend.

**Opção A: Criar arquivo de configuração (Recomendado)**

Crie um arquivo `netlify.toml` na raiz do projeto (já existe, vamos atualizar):

```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
  VITE_API_URL = "https://mamacare-backend.onrender.com"

[[redirects]]
  from = "/api/*"
  to = "https://mamacare-backend.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Opção B: Atualizar código do frontend**

Se seu código faz chamadas diretas para a API, você precisa configurar a base URL.

### 2.2 - Criar Conta no Netlify

1. Acesse: https://netlify.com
2. Clique em **"Sign up"**
3. Conecte sua conta do GitHub

### 2.3 - Criar Novo Site

1. No Dashboard do Netlify, clique em **"Add new site"**
2. Selecione **"Import an existing project"**
3. Escolha **"Deploy with GitHub"**
4. Selecione o repositório do MamaCare
5. Configure o build:

**Build Settings:**
- **Branch to deploy:** `main`
- **Build command:** `npm run build`
- **Publish directory:** `dist/public`

**Environment Variables:**
Clique em "Show advanced" e adicione:
```
VITE_API_URL=https://mamacare-backend.onrender.com
```

6. Clique em **"Deploy site"**
7. Aguarde o build (3-5 minutos)

### 2.4 - Configurar Domínio Personalizado (Opcional)

1. No painel do site, vá em **"Domain settings"**
2. Você terá um domínio tipo: `random-name-123456.netlify.app`
3. Clique em **"Change site name"** para personalizar
4. Ou adicione um domínio customizado próprio

---

## 🔧 PARTE 3: Configurar CORS e Conexão

### 3.1 - Atualizar CORS no Backend

O arquivo `server/routes.ts` já tem configuração de CORS. Vamos adicionar a URL do Netlify:

**Linha 29-38 em server/routes.ts:**
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://seu-site.netlify.app',  // ← Adicione sua URL do Netlify aqui
    'https://splendorous-rabanadas-6fe8f2.netlify.app',
    'https://joyful-bavarois-e44cbe.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Cache-Control', 'Pragma', 'Expires']
}));
```

### 3.2 - Fazer Commit e Push

Após atualizar o CORS:
```bash
git add .
git commit -m "Add Netlify URL to CORS"
git push
```

O Render e o Netlify vão fazer redeploy automaticamente!

---

## 🗄️ PARTE 4: Configurar Banco de Dados (Supabase)

### 4.1 - Banco Supabase (Você já tem configurado!)

Você já está usando Supabase PostgreSQL com a connection string:
```
postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

**Se precisar criar um novo banco:**
1. Acesse: https://supabase.com
2. Faça login/cadastro
3. Crie um novo projeto: **"MamaCare"**
4. Vá em **Settings** → **Database**
5. Copie a **Connection String** (URI mode)

### 4.2 - Adicionar no Render

1. Vá no seu Web Service no Render
2. Clique em **"Environment"** (menu lateral)
3. Adicione/atualize a variável:
```
DATABASE_URL=sua_connection_string_aqui
```
4. Clique em **"Save Changes"**

### 4.3 - Rodar Migrações

**Opção A: Pelo terminal local**
```bash
npm run db:push
```

**Opção B: Pelo Render Shell**
1. No painel do Render, clique em **"Shell"** (menu superior)
2. Execute:
```bash
npm run db:push
```

---

## ✅ PARTE 5: Testar a Aplicação

### 5.1 - URLs Finais

Você terá:
- **Frontend:** `https://seu-app.netlify.app`
- **Backend:** `https://seu-app.onrender.com`
- **Database:** Neon (PostgreSQL)

### 5.2 - Testar Funcionalidades

1. Acesse o frontend pelo link do Netlify
2. Tente fazer cadastro de usuário
3. Tente fazer login
4. Teste as funcionalidades principais

### 5.3 - Verificar Logs

**Render:**
- No painel, vá em **"Logs"** para ver erros do backend

**Netlify:**
- No painel, vá em **"Deploys"** → Selecione o deploy → **"Deploy log"**

---

## 🔒 PARTE 6: Configurar Email (Gmail)

### 6.1 - Gerar Senha de App no Gmail

1. Acesse: https://myaccount.google.com/security
2. Ative **"Verificação em duas etapas"**
3. Vá em **"Senhas de app"**
4. Selecione **"Outro (nome personalizado)"**
5. Digite: "MamaCare"
6. Copie a senha gerada (16 caracteres)

### 6.2 - Adicionar no Render

```env
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 📱 PARTE 7: PWA - Tornar o App Instalável

O app já está configurado como PWA! Para torná-lo instalável:

1. No Netlify, certifique-se que o arquivo `manifest.json` está sendo servido
2. O arquivo já existe em: `client/public/manifest.json`
3. O Service Worker está em: `client/public/sw.js`

Usuários poderão instalar o app no celular! 📱

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ Erro: "CORS blocked"
**Solução:** Adicione a URL do Netlify no CORS do backend

### ❌ Erro: "Cannot connect to database"
**Solução:** Verifique a `DATABASE_URL` no Render

### ❌ Backend "dormindo" (Free Tier)
**Problema:** O plano free do Render "dorme" após 15 min de inatividade
**Solução:** 
- Upgrade para plano pago ($7/mês)
- Ou use um serviço de "ping" como Cron-job.org para manter ativo

### ❌ Build falha no Netlify
**Solução:** Verifique se o comando de build está correto: `npm run build`

### ❌ Upload de imagens não funciona
**Problema:** Google Cloud Storage precisa estar configurado
**Solução:** Configure as variáveis `PUBLIC_OBJECT_SEARCH_PATHS` e `PRIVATE_OBJECT_DIR`

---

## 🎉 PRONTO!

Seu app MamaCare está no ar! 🚀

**Links úteis:**
- Dashboard Render: https://dashboard.render.com
- Dashboard Netlify: https://app.netlify.com
- Dashboard Supabase: https://supabase.com/dashboard

---

## 📊 Resumo de Custos

| Serviço | Plano Free | Plano Pago |
|---------|-----------|------------|
| **Netlify** | ✅ 100GB/mês | $19/mês (300GB) |
| **Render** | ✅ 750h/mês (1 serviço) | $7/mês (sempre ativo) |
| **Supabase** | ✅ 500MB database + 1GB storage | $25/mês (8GB + 100GB) |
| **Total** | **$0/mês** | **~$51/mês** |

---

**Precisa de ajuda?** Me avise qual etapa você está! 🤝

