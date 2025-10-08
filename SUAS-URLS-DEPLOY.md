# 🔗 Suas URLs de Deploy - MamaCare

## ✅ Backend (Render) - CONFIGURADO

**URL do Backend:** https://mamacare-w5ir.onrender.com

✅ Arquivo `netlify.toml` já está configurado com essa URL
✅ Arquivo `client/src/lib/apiConfig.ts` já está configurado

## ✅ Frontend (Netlify) - CONFIGURADO

**URL do Frontend:** https://friendly-alpaca-bf0d68.netlify.app

✅ Arquivo `server/routes.ts` já está configurado com essa URL no CORS

---

## 🚀 PRÓXIMOS PASSOS

### 1️⃣ Fazer Commit e Push das Alterações

Abra o terminal e execute:

```bash
git add .
git commit -m "Configure production API URL for Render"
git push
```

Isso vai fazer o Render fazer **redeploy automático** com as novas configurações!

---

### 2️⃣ Configurar o Netlify (Frontend)

Agora vá configurar o deploy do frontend no Netlify:

1. Acesse: https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte o GitHub e selecione o repositório MamaCare
4. Configure:

```
Branch: main
Build command: npm run build
Publish directory: dist/public
```

5. **IMPORTANTE:** Adicione a variável de ambiente:

Clique em **"Show advanced"** → **"Add environment variable"**:

```
Key: VITE_API_URL
Value: https://mamacare-w5ir.onrender.com
```

6. Clique em **"Deploy site"**

---

### 3️⃣ Após Deploy do Netlify

Quando o Netlify terminar o deploy, você receberá uma URL tipo:

```
https://random-name-123456.netlify.app
```

**Copie essa URL do Netlify!**

---

### 4️⃣ ✅ URL do Netlify adicionada no CORS

✅ **JÁ CONFIGURADO!** A URL `https://friendly-alpaca-bf0d68.netlify.app` foi adicionada no CORS.

Agora faça commit e push:

```bash
git add .
git commit -m "Add Netlify URL to CORS and update all configs"
git push
```

O Render vai fazer redeploy automático em 2-3 minutos!

---

## 🎉 PRONTO!

Depois de todos os passos, seu app estará completamente no ar!

**URLs finais:**
- **Frontend (Netlify):** https://friendly-alpaca-bf0d68.netlify.app ✅
- **Backend (Render):** https://mamacare-w5ir.onrender.com ✅
- **Database (Supabase):** Já configurado ✅

---

## 📋 Checklist

- [x] Backend no Render configurado
- [x] `netlify.toml` atualizado
- [x] `apiConfig.ts` atualizado
- [x] Frontend no Netlify configurado
- [x] URL do Netlify adicionada no CORS
- [ ] **FAZER AGORA:** Commit e push das alterações
- [ ] Aguardar redeploy do Render (2-3 min)
- [ ] Testar: abrir https://friendly-alpaca-bf0d68.netlify.app
- [ ] Testar: registro de usuário
- [ ] Testar: login
- [ ] Testar: funcionalidades principais

---

**Próximo passo:** Faça commit e push! 🚀

