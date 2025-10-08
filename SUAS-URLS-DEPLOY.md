# 🔗 Suas URLs de Deploy - MamaCare

## ✅ Backend (Render) - CONFIGURADO

**URL do Backend:** https://mamacare-w5ir.onrender.com

✅ Arquivo `netlify.toml` já está configurado com essa URL
✅ Arquivo `client/src/lib/apiConfig.ts` já está configurado

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

### 4️⃣ Adicionar URL do Netlify no CORS

Abra o arquivo `server/routes.ts` e adicione a URL do Netlify na linha 29:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://sua-url-aqui.netlify.app',  // ← ADICIONE SUA URL DO NETLIFY AQUI
    'https://splendorous-rabanadas-6fe8f2.netlify.app',
    'https://joyful-bavarois-e44cbe.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Cache-Control', 'Pragma', 'Expires']
}));
```

Depois faça commit e push:

```bash
git add server/routes.ts
git commit -m "Add Netlify URL to CORS"
git push
```

O Render vai fazer redeploy automático!

---

## 🎉 PRONTO!

Depois de todos os passos, seu app estará completamente no ar!

**URLs finais:**
- **Frontend (Netlify):** [Preencher após deploy do Netlify]
- **Backend (Render):** https://mamacare-w5ir.onrender.com
- **Database (Supabase):** Já configurado ✅

---

## 📋 Checklist

- [x] Backend no Render configurado
- [x] `netlify.toml` atualizado
- [x] `apiConfig.ts` atualizado
- [ ] Commit e push das alterações
- [ ] Frontend no Netlify configurado
- [ ] URL do Netlify adicionada no CORS
- [ ] Testado: registro de usuário
- [ ] Testado: login
- [ ] Testado: funcionalidades principais

---

**Próximo passo:** Faça commit e push! 🚀

