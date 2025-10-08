# ✅ CHECKLIST COMPLETO DE DEPLOY

Use esta lista para garantir que tudo está configurado corretamente!

---

## 📦 ANTES DE COMEÇAR

- [ ] Código está no GitHub
- [ ] Banco de dados Supabase funcionando localmente
- [ ] App funciona em localhost sem erros
- [ ] Tem conta no Render (criar em https://render.com)
- [ ] Tem conta no Netlify (criar em https://netlify.com)

---

## 🎯 ETAPA 1: RENDER (BACKEND)

### Criar Web Service

- [ ] Acesse https://dashboard.render.com
- [ ] Clique em "New +" → "Web Service"
- [ ] Conecte repositório GitHub
- [ ] Configure build command: `npm install && npm run build`
- [ ] Configure start command: `npm start`
- [ ] Escolha plano Free

### Adicionar Variáveis de Ambiente

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `DATABASE_URL` = (sua URL do Supabase)
- [ ] `SESSION_SECRET` = (string segura aleatória)
- [ ] **OPCIONAL:** `GMAIL_USER` e `GMAIL_APP_PASSWORD`

### Verificar Deploy

- [ ] Build completou sem erros (aguarde 5-10 min)
- [ ] Service está "Live" (bolinha verde)
- [ ] Copiei a URL do backend (ex: `https://xxx.onrender.com`)
- [ ] Testei acessar: `https://xxx.onrender.com/` (deve responder)

---

## 🌐 ETAPA 2: NETLIFY (FRONTEND)

### Criar Site

- [ ] Acesse https://app.netlify.com
- [ ] Clique em "Add new site" → "Import an existing project"
- [ ] Conecte repositório GitHub
- [ ] Configure build command: `npm run build`
- [ ] Configure publish directory: `dist/public`

### Adicionar Variável de Ambiente

- [ ] Clique em "Show advanced"
- [ ] Adicione `VITE_API_URL` = (URL do Render)
- [ ] Exemplo: `https://mamacarenew.onrender.com`

### Verificar Deploy

- [ ] Build completou sem erros (aguarde 3-5 min)
- [ ] Site está "Published" (status verde)
- [ ] Copiei a URL do frontend (ex: `https://xxx.netlify.app`)
- [ ] Testei abrir o site no navegador

### Personalizar Nome (Opcional)

- [ ] Vá em "Site settings" → "Change site name"
- [ ] Escolhi um nome: `mamacare-app`
- [ ] Nova URL: `https://mamacare-app.netlify.app`

---

## 🔗 ETAPA 3: CONECTAR FRONTEND E BACKEND

### Atualizar CORS

- [ ] Abri arquivo `server/routes.ts` no VS Code
- [ ] Localizei linha 29 (configuração CORS)
- [ ] Adicionei URL do Netlify no array `origin`
- [ ] Exemplo: `'https://mamacare-app.netlify.app'`

### Fazer Deploy da Mudança

- [ ] `git add server/routes.ts`
- [ ] `git commit -m "Add Netlify URL to CORS"`
- [ ] `git push`
- [ ] Aguardei redeploy automático no Render (2-3 min)

---

## ✅ ETAPA 4: TESTAR APLICAÇÃO

### Testar Frontend

- [ ] Abri URL do Netlify no navegador
- [ ] Interface carregou corretamente
- [ ] Não há erros no console (F12)

### Testar Registro

- [ ] Cliquei em "Cadastrar" / "Criar conta"
- [ ] Preenchi: email, senha, nome
- [ ] Consegui criar conta com sucesso

### Testar Login

- [ ] Fiz logout
- [ ] Fiz login com as credenciais criadas
- [ ] Consegui entrar no dashboard

### Testar Funcionalidades Principais

- [ ] Cadastrei informações da gravidez (DUM, nome bebê)
- [ ] Vi desenvolvimento do bebê por semana
- [ ] Adicionei registro de peso
- [ ] Abri página de artigos
- [ ] Navegação entre páginas funciona

---

## 🔍 VERIFICAR LOGS (SE HOUVER ERRO)

### Logs do Backend (Render)

- [ ] Dashboard Render → Meu serviço → "Logs"
- [ ] Verifiquei se há erros em vermelho
- [ ] Anotei mensagens de erro (se houver)

### Logs do Frontend (Netlify)

- [ ] Dashboard Netlify → "Deploys" → Último deploy
- [ ] Cliquei em "Deploy log"
- [ ] Verifiquei se build completou 100%

### Console do Navegador

- [ ] Abri DevTools (F12)
- [ ] Aba "Console"
- [ ] Verifiquei erros em vermelho (se houver)
- [ ] Aba "Network" → filtro "XHR"
- [ ] Verifiquei se chamadas de API estão em 200 (sucesso)

---

## 🚨 TROUBLESHOOTING

### ❌ Erro: "Failed to fetch" ou "Network Error"

**Checklist de Solução:**
- [ ] URL do backend está correta em `VITE_API_URL` (Netlify)
- [ ] Backend está "Live" no Render (não em "Build" ou "Error")
- [ ] URL do Netlify está no CORS (`server/routes.ts`)
- [ ] Fiz commit e push após adicionar URL no CORS
- [ ] Aguardei redeploy completo no Render

### ❌ Erro: "CORS policy blocked"

**Checklist de Solução:**
- [ ] Adicionei URL do Netlify em `server/routes.ts` linha 29
- [ ] URL está completa com `https://` e sem `/` no final
- [ ] Fiz commit e push
- [ ] Render fez redeploy (verificar logs)
- [ ] Limpei cache do navegador (Ctrl+Shift+Delete)

### ❌ Backend "dorme" (demora para responder)

**Checklist de Solução:**
- [ ] Isso é NORMAL no plano Free do Render
- [ ] Backend "dorme" após 15 min sem uso
- [ ] Primeira requisição leva ~30-60 segundos
- [ ] Tentei aguardar e recarregar página
- [ ] **Solução permanente:** Upgrade para plano pago ($7/mês)

### ❌ Erro: "Database connection failed"

**Checklist de Solução:**
- [ ] `DATABASE_URL` está correta no Render
- [ ] String tem formato: `postgresql://user:pass@host:5432/db`
- [ ] Testei conexão localmente com mesma URL
- [ ] Verifiquei se Supabase Database está ativo
- [ ] Cliquei em "Save Changes" após editar variável

---

## 🎉 DEPLOY COMPLETO!

Se todos os itens acima estão marcados ✅, seu app está no ar!

**URLs finais:**
- Frontend (compartilhe esta): `___________________________`
- Backend (não compartilhe): `___________________________`

**Próximos passos:**
- [ ] Compartilhei link com amigos/usuários
- [ ] Configurei domínio próprio (opcional)
- [ ] Configurei email para recuperação de senha (opcional)
- [ ] Monitorei uso e logs regularmente

---

## 📊 CUSTOS MENSAIS

**Configuração Atual (Free):**
- Render: $0 (750h/mês - 1 serviço)
- Netlify: $0 (100GB banda/mês)
- Supabase: $0 (500MB database + 1GB storage)
- **Total: $0/mês** ✅

**Limitações do Plano Free:**
- Backend "dorme" após 15 min sem uso
- Primeira requisição leva ~30s após "acordar"
- 750h/mês de uso do backend
- Supabase: 500MB de database, 1GB de storage

**Upgrade Recomendado (Produção Real):**
- Render: $7/mês (backend sempre ativo)
- Netlify: $19/mês (mais banda, 300GB)
- Supabase: $25/mês (8GB database + 100GB storage)
- **Total: ~$51/mês**

---

**Parabéns! 🎉 Seu MamaCare está disponível para o mundo! 🚀**

