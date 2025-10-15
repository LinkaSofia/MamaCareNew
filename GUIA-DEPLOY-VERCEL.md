# 🚀 GUIA COMPLETO - DEPLOY NO VERCEL

## 📋 PREPARAÇÃO

### 1. Verificar GitHub
```bash
# Verificar se está conectado
git remote -v

# Se não estiver, conectar:
git remote add origin https://github.com/SEU_USUARIO/MamaCare.git
git push -u origin main
```

### 2. Arquivos já configurados ✅
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `.vercelignore` - Arquivos ignorados
- ✅ `package.json` - Scripts de build
- ✅ CORS configurado para Vercel

## 🌐 PASSO A PASSO NO VERCEL

### 3. Criar conta
1. Acesse: https://vercel.com
2. Clique: "Sign Up"
3. Escolha: "Continue with GitHub"
4. Autorize o acesso

### 4. Conectar repositório
1. No dashboard: "New Project"
2. Importe seu repositório GitHub
3. Selecione: MamaCare

### 5. Configurar projeto
- **Framework Preset**: "Other"
- **Root Directory**: (deixe vazio)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

## 🔑 VARIÁVEIS DE AMBIENTE

### 6. Adicionar no Vercel (Settings > Environment Variables)

```env
# Banco de dados
DATABASE_URL=sua_url_do_supabase

# Sessão
SESSION_SECRET=uma_chave_secreta_longa_e_aleatoria

# Supabase
SUPABASE_URL=https://yrpbjxhtsnaxlfsazall.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycGJqeGh0c25heGxmc2F6YWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDE0MDUsImV4cCI6MjA2ODk3NzQwNX0.YH2n5rOCPfFItwWrQF9inO0gUfKRsYhj5zhVhRV07EQ

# Ambiente
NODE_ENV=production
```

## 🚀 DEPLOY

### 7. Fazer deploy
1. Clique "Deploy"
2. Aguarde build (2-5 minutos)
3. Verifique logs se houver erro

### 8. Testar aplicação
1. Acesse a URL fornecida pelo Vercel
2. Teste login/registro
3. Verifique funcionalidades

## 🔧 CONFIGURAÇÕES ADICIONAIS

### 9. Domínio personalizado (opcional)
1. Settings > Domains
2. Adicione seu domínio
3. Configure DNS

### 10. Monitoramento
- **Analytics**: Automático no Vercel
- **Logs**: Dashboard > Functions
- **Performance**: Dashboard > Analytics

## 🆘 SOLUÇÃO DE PROBLEMAS

### Erro de Build
- Verifique logs no Vercel
- Confirme variáveis de ambiente
- Teste build local: `npm run build`

### Erro de CORS
- Verifique se URL está nas origens permitidas
- Confirme configuração no `server/routes.ts`

### Erro de Banco
- Confirme `DATABASE_URL` no Supabase
- Verifique conexão no dashboard

## 📊 VANTAGENS DO VERCEL

✅ **Gratuito** para projetos pessoais
✅ **Deploy automático** do GitHub
✅ **CDN global** (rápido)
✅ **HTTPS automático**
✅ **Domínios personalizados**
✅ **Analytics integrado**
✅ **Logs detalhados**
✅ **Rollback fácil**

## 🎯 PRÓXIMOS PASSOS

1. **Deploy inicial** ✅
2. **Testar todas funcionalidades**
3. **Configurar domínio personalizado**
4. **Monitorar performance**
5. **Configurar CI/CD automático**

---

**🎉 Seu app MamaCare estará online no Vercel!**
