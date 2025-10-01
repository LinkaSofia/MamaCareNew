# 🚀 Deploy do MamaCare

## 📋 Pré-requisitos
- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [GitHub](https://github.com) (gratuita)

## 🔧 Passos para Deploy

### 1. Preparar o projeto
```bash
# Instalar dependências
npm install

# Fazer build
npm run build
```

### 2. Subir para o GitHub
1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Faça commit e push

### 3. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte com GitHub
4. Selecione o repositório
5. Configure as variáveis de ambiente:
   - `DATABASE_URL`: postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   - `GMAIL_USER`: mamacaresup@gmail.com
   - `GMAIL_APP_PASSWORD`: fref srra undd wvdt
   - `NODE_ENV`: production
6. Clique em "Deploy"

### 4. Acessar o app
- O Vercel fornecerá uma URL como: `https://mamacare-xxx.vercel.app`
- Acesse essa URL no celular
- Instale como PWA (Progressive Web App)

## 📱 Instalação no Celular
1. Abra a URL no navegador
2. **Android**: Menu → "Adicionar à tela inicial"
3. **iPhone**: Compartilhar → "Adicionar à tela inicial"

## 🔑 Variáveis de Ambiente Necessárias
- `DATABASE_URL`: URL do banco PostgreSQL
- `GMAIL_USER`: Email do Gmail
- `GMAIL_APP_PASSWORD`: Senha de app do Gmail
- `NODE_ENV`: production
