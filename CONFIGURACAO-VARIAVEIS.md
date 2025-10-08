# 🔧 Configuração de Variáveis de Ambiente

## 📋 Variáveis para RENDER (Backend)

Adicione estas variáveis no dashboard do Render:

```env
NODE_ENV=production
PORT=10000

# Database - Supabase PostgreSQL (Você já tem configurado!)
DATABASE_URL=postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# Session Secret (troque por algo único e seguro)
SESSION_SECRET=mamacare_secret_production_2024_change_this_12345

# Email - OPCIONAL (Gmail)
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_de_app_do_gmail

# Google Cloud Storage - OPCIONAL (só se usar Replit Object Storage)
PUBLIC_OBJECT_SEARCH_PATHS=/seu-bucket/public
PRIVATE_OBJECT_DIR=/seu-bucket/private
```

---

## 🌐 Variáveis para NETLIFY (Frontend)

Adicione esta variável no dashboard do Netlify:

```env
VITE_API_URL=https://mamacarenew.onrender.com
```

**⚠️ IMPORTANTE:** Substitua pela URL REAL do seu backend no Render após o deploy!

---

## 🏠 Variáveis para DESENVOLVIMENTO LOCAL

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=5000

# Database (mesma que você usa)
DATABASE_URL=postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# Session
SESSION_SECRET=dev_secret_local

# API URL para frontend local
VITE_API_URL=http://localhost:5000

# Email (opcional)
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_app
```

---

## 📧 Como Obter Senha de App do Gmail (OPCIONAL)

1. Acesse: https://myaccount.google.com/security
2. Ative **"Verificação em duas etapas"** (se ainda não tiver)
3. Vá em **"Senhas de app"** (ou "App passwords")
4. Selecione **"Outro"** e digite: **"MamaCare"**
5. Copie a senha gerada (16 caracteres tipo: `xxxx xxxx xxxx xxxx`)
6. Use essa senha na variável `GMAIL_APP_PASSWORD`

**Nota:** Isso permite que o app envie emails de recuperação de senha.

---

## 🔒 IMPORTANTE - SEGURANÇA

- ❌ **NUNCA** faça commit do arquivo `.env`
- ❌ **NUNCA** coloque senhas no código
- ✅ Use variáveis de ambiente sempre
- ✅ Troque `SESSION_SECRET` para algo único em produção
- ✅ O arquivo `.env` já está no `.gitignore`

---

## ✅ Checklist de Configuração

### Para Deploy Completo:

- [ ] Render criado com todas as variáveis
- [ ] Netlify criado com VITE_API_URL
- [ ] URL do Netlify adicionada no CORS do backend (`server/routes.ts`)
- [ ] Commit e push do código com CORS atualizado
- [ ] Testado registro de usuário
- [ ] Testado login
- [ ] Testado funcionalidades principais

---

**Pronto! Agora siga o arquivo `PASSO-A-PASSO-DEPLOY.md` 🚀**

