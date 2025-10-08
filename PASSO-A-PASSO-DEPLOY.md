# 🚀 PASSO A PASSO RÁPIDO - Deploy MamaCare

## ✅ PRÉ-REQUISITOS

- [ ] Conta GitHub com o código do projeto
- [ ] Conta no Render (https://render.com) - GRÁTIS
- [ ] Conta no Netlify (https://netlify.com) - GRÁTIS
- [ ] Banco Supabase já configurado (você já tem!)

---

## 🎯 ETAPA 1: DEPLOY DO BACKEND (Render)

### 1️⃣ Criar Web Service no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub do MamaCare
4. Preencha:

```
Name: mamacare-backend
Region: Oregon (US West)
Branch: main
Root Directory: (vazio)
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free
```

### 2️⃣ Adicionar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
SESSION_SECRET=mamacare_secret_2024_super_secure_random_string_12345
```

**📧 OPCIONAL - Email (Gmail):**
```env
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_de_app_gmail
```

### 3️⃣ Deploy!

- Clique em **"Create Web Service"**
- Aguarde 5-10 minutos
- Copie a URL gerada (ex: `https://mamacarenew.onrender.com`)

---

## 🌐 ETAPA 2: DEPLOY DO FRONTEND (Netlify)

### 1️⃣ Criar Site no Netlify

1. Acesse: https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha **"Deploy with GitHub"**
4. Selecione o repositório MamaCare
5. Configure:

```
Branch: main
Build command: npm run build
Publish directory: dist/public
```

### 2️⃣ Adicionar Variável de Ambiente

Clique em **"Show advanced"** e adicione:

```env
VITE_API_URL=https://mamacarenew.onrender.com
```

**⚠️ IMPORTANTE:** Use a URL real do Render da etapa anterior!

### 3️⃣ Deploy!

- Clique em **"Deploy site"**
- Aguarde 3-5 minutos
- Copie a URL gerada (ex: `https://seu-site-123456.netlify.app`)

### 4️⃣ Personalizar Nome (Opcional)

- Vá em **"Site settings"** → **"Change site name"**
- Escolha algo como: `mamacare-app`
- Nova URL: `https://mamacare-app.netlify.app`

---

## 🔗 ETAPA 3: CONECTAR FRONTEND E BACKEND

### 1️⃣ Atualizar CORS no Backend

1. Abra o arquivo `server/routes.ts`
2. Localize a linha 29 (configuração CORS)
3. Adicione a URL do Netlify:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://mamacare-app.netlify.app',  // ← SUA URL DO NETLIFY
    'https://splendorous-rabanadas-6fe8f2.netlify.app',
    'https://joyful-bavarois-e44cbe.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Cache-Control', 'Pragma', 'Expires']
}));
```

### 2️⃣ Fazer Commit e Push

```bash
git add server/routes.ts
git commit -m "Add Netlify URL to CORS"
git push
```

**O Render vai fazer redeploy automaticamente!** ✨

---

## ✅ ETAPA 4: TESTAR

### 1️⃣ Abrir o App

Acesse sua URL do Netlify: `https://mamacare-app.netlify.app`

### 2️⃣ Testar Funcionalidades

- [ ] Criar conta (registro)
- [ ] Fazer login
- [ ] Cadastrar gravidez
- [ ] Ver desenvolvimento do bebê
- [ ] Adicionar peso
- [ ] Ver artigos

### 3️⃣ Verificar Logs (se houver erro)

**No Render:**
- Dashboard → Seu serviço → **"Logs"** (menu superior)

**No Netlify:**
- Dashboard → Seu site → **"Deploys"** → Último deploy → **"Deploy log"**

---

## 🎉 PRONTO!

Seu app está no ar! 🚀

**Suas URLs:**
- **Frontend:** `https://seu-site.netlify.app`
- **Backend:** `https://mamacarenew.onrender.com`

**Compartilhe o link do frontend com qualquer pessoa!**

---

## 🚨 TROUBLESHOOTING

### ❌ Erro: "Cannot connect to server"

**Causa:** Backend está "dormindo" (plano free dorme após 15min sem uso)

**Solução:** Aguarde 30-60 segundos na primeira requisição. O backend vai "acordar".

**Alternativa:** Use serviço como https://cron-job.org para fazer ping a cada 14 minutos em `https://mamacarenew.onrender.com/`

---

### ❌ Erro: "CORS blocked"

**Causa:** URL do Netlify não está no CORS do backend

**Solução:** 
1. Adicione a URL no arquivo `server/routes.ts` (linha 29)
2. Faça commit e push
3. Aguarde redeploy automático

---

### ❌ Erro: "Database connection failed"

**Causa:** DATABASE_URL incorreta

**Solução:**
1. Vá no Render → Environment Variables
2. Verifique se DATABASE_URL está correta
3. Clique em "Save Changes"
4. Aguarde redeploy

---

### ❌ Build falha no Netlify

**Causa:** Erro de build ou variável faltando

**Solução:**
1. Verifique os logs em Deploy log
2. Certifique-se que `VITE_API_URL` está configurada
3. Verifique se o comando de build está correto: `npm run build`

---

## 💡 DICAS

1. **Backend "dorme" no plano free?** 
   - É normal! Primeira requisição leva ~30s
   - Upgrade para $7/mês para ficar sempre ativo

2. **Quer domínio próprio?**
   - Compre em Namecheap, GoDaddy, etc
   - Configure no Netlify (Site settings → Domain management)

3. **Banco de dados cheio?**
   - Supabase free tem 500MB de database
   - Upgrade para plano pago ($25/mês) se necessário

4. **Compartilhe o link!**
   - Apenas a URL do Netlify (frontend)
   - Usuários não precisam da URL do backend

---

**Precisa de ajuda? Me chame! 🤝**

