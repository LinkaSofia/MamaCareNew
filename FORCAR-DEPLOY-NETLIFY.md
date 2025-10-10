# 🚀 FORÇAR NOVO DEPLOY NO NETLIFY

## 🎯 PROBLEMA:
O Netlify pode estar servindo código antigo em cache.

---

## ✅ SOLUÇÃO 1: Rebuild Limpo

### No Dashboard do Netlify:

1. Acesse: https://app.netlify.com/sites/friendly-alpaca-bf0d68/deploys
2. Clique em **"Trigger deploy"** (botão no topo direito)
3. Selecione **"Clear cache and deploy site"**
4. Aguarde 2-3 minutos

---

## ✅ SOLUÇÃO 2: Via Git (Forçar Commit)

### No terminal/VSCode:

```bash
# Cria um arquivo vazio para forçar commit
echo "# Deploy forçado" > DEPLOY-FORCE.txt

# Commit e push
git add DEPLOY-FORCE.txt
git commit -m "Force Netlify rebuild"
git push

# Remove o arquivo temporário
git rm DEPLOY-FORCE.txt
git commit -m "Clean up force deploy file"
git push
```

---

## ✅ SOLUÇÃO 3: Atualizar Variável de Ambiente

### No Netlify Dashboard:

1. Acesse: https://app.netlify.com/sites/friendly-alpaca-bf0d68/settings/deploys
2. Vá em **"Environment variables"**
3. Adicione uma nova variável:
   - **Key:** `FORCE_REBUILD`
   - **Value:** `true`
4. Clique em **"Save"**
5. Vá em **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**

---

## 🔍 VERIFICAR SE FUNCIONOU:

Após o deploy:

1. **Ctrl+Shift+Delete** (limpe cache do navegador)
2. **Feche o navegador completamente**
3. Abra e acesse: https://friendly-alpaca-bf0d68.netlify.app/login
4. **F12** → Console
5. Procure por: `🔧 API Config:`
6. **DEVE mostrar:** `VITE_API_URL: 'https://mamacare-w5ir.onrender.com'`

---

## 🎯 TESTE FINAL:

1. Digite email e senha
2. Clique em "Entrar"
3. **No Network** DEVE aparecer:
   ```
   Name
   login  ← POST para mamacare-w5ir.onrender.com/api/auth/login
   ```

4. No Console digite: `localStorage.getItem('authToken')`
5. **DEVE retornar uma string longa** (não `null`)

---

**FAÇA A SOLUÇÃO 1 (mais rápida!)** 🚀

