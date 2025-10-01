# 🚀 Guia Completo de Deploy - MamaCare

## ✅ Projeto preparado com sucesso!

O build foi concluído e os arquivos estão prontos para deploy.

## 📋 Passos para Deploy no Vercel

### 1. 🌐 Criar conta no Vercel
1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel a acessar seus repositórios

### 2. 📁 Subir projeto para GitHub
1. Acesse: https://github.com
2. Clique em "New repository"
3. Nome: `mamacare-app`
4. Deixe público
5. Clique "Create repository"

### 3. 📤 Fazer upload dos arquivos
**IMPORTANTE: NÃO inclua o arquivo .env!**

**Opção A - Via GitHub Web:**
1. No repositório criado, clique "uploading an existing file"
2. Arraste todos os arquivos da pasta do projeto **EXCETO o arquivo .env**
3. Commit message: "Initial commit"
4. Clique "Commit changes"

**Arquivos que NÃO devem ser enviados:**
- ❌ `.env` (contém senhas)
- ❌ `node_modules/` (muito grande)
- ❌ `sessions/` (dados temporários)

**Opção B - Via Git (se souber usar):**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mamacare-app.git
git push -u origin main
```

### 4. 🚀 Deploy no Vercel
1. Volte para o Vercel
2. Clique "New Project"
3. Clique "Import Git Repository"
4. Selecione `mamacare-app`
5. Clique "Import"

### 5. ⚙️ Configurar variáveis de ambiente
**IMPORTANTE: Configure as variáveis no painel do Vercel, NÃO no código!**

1. No Vercel, vá em "Settings" → "Environment Variables"
2. Adicione cada variável:

**DATABASE_URL:**
```
postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

**GMAIL_USER:**
```
mamacaresup@gmail.com
```

**GMAIL_APP_PASSWORD:**
```
fref srra undd wvdt
```

**NODE_ENV:**
```
production
```

3. Marque todas como "Production"
4. Clique "Save"

### 6. 🎯 Deploy
1. Clique "Deploy"
2. Aguarde alguns minutos
3. O Vercel fornecerá uma URL como: `https://mamacare-app-xxx.vercel.app`

## 📱 Instalação no Celular

### Android (Chrome):
1. Abra a URL no Chrome
2. Menu (3 pontos) → "Adicionar à tela inicial"
3. Confirme a instalação

### iPhone (Safari):
1. Abra a URL no Safari
2. Botão de compartilhar → "Adicionar à tela inicial"
3. Confirme a instalação

## 🎉 Pronto!
Seu app estará disponível online e poderá ser instalado no celular como um app nativo!

## 🔧 Se der algum problema:
- Verifique se todas as variáveis de ambiente estão configuradas
- Confira se o build foi feito corretamente
- Verifique os logs no painel do Vercel
