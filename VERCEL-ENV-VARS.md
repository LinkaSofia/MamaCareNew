# 🔧 VARIÁVEIS DE AMBIENTE PARA VERCEL

## 📋 **VARIÁVEIS OBRIGATÓRIAS:**

### **1️⃣ BANCO DE DADOS:**
```
DATABASE_URL=postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### **2️⃣ SESSÃO:**
```
SESSION_SECRET=maternity-app-secret-key-for-mama-care-app-v2-production
```

### **3️⃣ SUPABASE (para anexos do diário):**
```
SUPABASE_URL=https://yrpbjxhtsnaxlfsazall.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycGJqeGh0c25heGxmc2F6YWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDE0MDUsImV4cCI6MjA2ODk3NzQwNX0.YH2n5rOCPfFItwWrQF9inO0gUfKRsYhj5zhVhRV07EQ
```

## 📧 **VARIÁVEIS OPCIONAIS (EMAIL):**

### **4️⃣ GMAIL (para recuperação de senha):**
```
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=sua-senha-de-app
```

## 🚀 **COMO CONFIGURAR NO VERCEL:**

### **PASSO 1: Acessar o Dashboard do Vercel**
1. Vá para [vercel.com](https://vercel.com)
2. Faça login com sua conta
3. Clique em "New Project"

### **PASSO 2: Conectar o Repositório**
1. Conecte seu repositório GitHub
2. Selecione o projeto MamaCare

### **PASSO 3: Configurar Variáveis de Ambiente**
1. Na seção "Environment Variables"
2. Adicione cada variável:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`
   - **Environment**: `Production`, `Preview`, `Development`

3. Repita para todas as variáveis obrigatórias

### **PASSO 4: Configurações de Build**
- **Framework Preset**: `Other`
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **PASSO 5: Deploy**
1. Clique em "Deploy"
2. Aguarde o build completar
3. Teste a aplicação

## ⚠️ **IMPORTANTE:**

1. **Nunca commite** o arquivo `.env` no Git
2. **Use sempre** HTTPS em produção
3. **Teste** todas as funcionalidades após o deploy
4. **Monitore** os logs do Vercel

## 🔍 **VERIFICAÇÃO PÓS-DEPLOY:**

1. ✅ **Registro de usuário** funciona
2. ✅ **Login** funciona  
3. ✅ **Dados de gravidez** são criados
4. ✅ **Upload de imagens** funciona
5. ✅ **Diário** funciona
6. ✅ **Anexos** são salvos

## 📞 **SUPORTE:**

Se houver problemas:
1. Verifique os logs do Vercel
2. Confirme se todas as variáveis estão configuradas
3. Teste localmente primeiro
