# 💳 NETLIFY - QUANDO USA CRÉDITOS (BUILD MINUTES)

## 🔍 **O QUE SÃO BUILD MINUTES?**

Build Minutes são créditos que o Netlify usa para:
- **Compilar** seu código (build)
- **Deployar** sua aplicação
- **Executar** comandos durante o build
- **Processar** assets e otimizações

## ⚡ **QUANDO O NETLIFY USA CRÉDITOS:**

### **1. DEPLOY AUTOMÁTICO (Git Integration)**
- ✅ **Push para GitHub/GitLab** → Trigger automático
- ✅ **Pull Request** → Preview deployment
- ✅ **Merge para main** → Production deployment
- ✅ **Branch deployment** → Deploy de branches

### **2. DEPLOY MANUAL**
- ✅ **Drag & Drop** de arquivos
- ✅ **CLI deploy** (`netlify deploy`)
- ✅ **API deploy**

### **3. BUILD PROCESSING**
- ✅ **npm install** (instalação de dependências)
- ✅ **npm run build** (compilação)
- ✅ **Vite build** (seu projeto atual)
- ✅ **TypeScript compilation**
- ✅ **Asset optimization**
- ✅ **Image processing**

## 📊 **CRÉDITOS GRATUITOS:**

### **PLANO FREE:**
- **300 Build Minutes/mês** (grátis)
- **100GB Bandwidth/mês**
- **Concurrent builds: 1**

### **PLANO PRO ($19/mês):**
- **3,000 Build Minutes/mês**
- **1TB Bandwidth/mês**
- **Concurrent builds: 3**

## ⏱️ **QUANTO TEMPO CADA OPERAÇÃO USA:**

### **SEU PROJETO MAMACARE:**
```
npm install          → ~2-5 minutos
npm run build        → ~1-3 minutos
Deploy upload        → ~30 segundos
Total por deploy     → ~3-8 minutos
```

### **FATORES QUE INFLUENCIAM:**
- **Tamanho do projeto** (mais arquivos = mais tempo)
- **Dependências** (mais packages = mais tempo)
- **Assets** (imagens, vídeos = mais tempo)
- **Complexidade do build** (TypeScript, otimizações)

## 🚨 **QUANDO MAIS CRÉDITOS SÃO USADOS:**

### **1. MUITOS DEPLOYS:**
- Cada push = 1 deploy = 3-8 minutos
- 10 pushes/dia = 30-80 minutos/dia
- 30 dias = 900-2400 minutos/mês

### **2. BUILD LENTOS:**
- Dependências pesadas
- Assets grandes
- Scripts complexos

### **3. FAILED BUILDS:**
- Build que falha = créditos usados mesmo assim
- Retry automático = mais créditos

## 💡 **COMO ECONOMIZAR CRÉDITOS:**

### **1. OTIMIZAR BUILD:**
```bash
# Remover dependências desnecessárias
npm audit
npm prune

# Usar .npmrc para cache
echo "cache-max=86400000" > .npmrc

# Ignorar arquivos desnecessários no .gitignore
echo "node_modules/" >> .gitignore
echo ".env.local" >> .gitignore
```

### **2. REDUZIR FREQUÊNCIA DE DEPLOY:**
```bash
# Fazer commits maiores ao invés de muitos pequenos
git add .
git commit -m "feat: múltiplas mudanças"
git push
```

### **3. USAR NETLIFY.TOML OTIMIZADO:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--production=false"

# Cache dependencies
[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

### **4. CONFIGURAR BUILD SETTINGS:**
```toml
# netlify.toml
[build]
  # Comando mais rápido
  command = "npm ci && npm run build"
  
  # Pasta de publicação
  publish = "dist"
  
  # Variáveis de ambiente
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--production=false"
  
# Ignorar arquivos
[build.ignore]
  ignore = "node_modules"
```

## 📈 **MONITORAR USO DE CRÉDITOS:**

### **1. NO NETLIFY DASHBOARD:**
- Acesse: https://app.netlify.com
- Vá em **Account settings**
- Veja **Usage** → **Build minutes**

### **2. NO SITE:**
- Vá no seu site
- Clique em **Site settings**
- Veja **Build & deploy** → **Build logs**

### **3. COMANDO CLI:**
```bash
# Ver informações do site
netlify status

# Ver logs de build
netlify logs
```

## 🔧 **CONFIGURAÇÕES PARA SEU PROJETO:**

### **1. NETLIFY.TOML OTIMIZADO:**
```toml
[build]
  command = "npm ci && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--production=false"

# Headers para cache
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"

# Redirects
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **2. PACKAGE.JSON OTIMIZADO:**
```json
{
  "scripts": {
    "build": "vite build",
    "build:fast": "vite build --mode production",
    "preview": "vite preview"
  }
}
```

## ⚠️ **SINAIS DE USO EXCESSIVO:**

### **1. BUILD MINUTES ACABANDO:**
- Email de aviso quando restam 10%
- Site pode parar de fazer deploy

### **2. SOLUÇÕES:**
- **Upgrade para Pro** ($19/mês)
- **Otimizar builds**
- **Reduzir deploys**

## 🎯 **RECOMENDAÇÕES PARA SEU PROJETO:**

### **1. PARA DESENVOLVIMENTO:**
- Use **deploy manual** para testes
- Faça **commits maiores** ao invés de muitos pequenos
- Use **preview deploys** apenas quando necessário

### **2. PARA PRODUÇÃO:**
- Configure **build otimizado**
- Use **cache** para dependências
- Monitore **build logs**

### **3. MONITORAMENTO:**
- Verifique **usage** semanalmente
- Configure **notifications** para limites
- Use **build logs** para otimizar

## 📊 **EXEMPLO DE USO TÍPICO:**

```
Projeto pequeno (como o seu):
- 1 deploy/dia = 5 minutos
- 30 dias = 150 minutos/mês
- Sobra: 150 minutos (plano free)

Projeto ativo:
- 5 deploys/dia = 25 minutos
- 30 dias = 750 minutos/mês
- Precisa: Upgrade para Pro
```

## 🚀 **COMANDOS ÚTEIS:**

```bash
# Ver status do Netlify
netlify status

# Deploy manual (usa créditos)
netlify deploy

# Deploy preview (usa créditos)
netlify deploy --dir=dist

# Ver logs de build
netlify logs

# Ver informações de uso
netlify api getCurrentUser
```
