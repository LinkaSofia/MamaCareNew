const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variáveis de ambiente para desenvolvimento local...\n');

// Configurações para desenvolvimento local
const envContent = `# Configuração do Banco de Dados Local
DATABASE_URL=postgresql://postgres:password@localhost:5432/mamacare

# Configuração do Gmail para recuperação de senha
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=dlhr kvje eqki amam

# Configuração do Servidor
PORT=3001
NODE_ENV=development

# Configuração de JWT
JWT_SECRET=sua-chave-secreta-jwt-aqui

# Configuração de CORS
CORS_ORIGIN=http://localhost:3001
`;

// Caminhos para os arquivos .env
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', 'server', '.env')
];

// Criar arquivos .env
envPaths.forEach(envPath => {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Arquivo .env criado em: ${envPath}`);
  } catch (error) {
    console.log(`⚠️  Não foi possível criar .env em: ${envPath}`);
    console.log(`   Erro: ${error.message}`);
  }
});

console.log('\n📋 Instruções para configurar o banco de dados:');
console.log('1. Instale o PostgreSQL: https://www.postgresql.org/download/');
console.log('2. Configure a senha como "password" (ou altere no .env)');
console.log('3. Execute: node scripts/setup-local-db.cjs');
console.log('4. Execute: npm run dev');
console.log('\n🌐 A aplicação estará disponível em: http://localhost:3001');
console.log('\n✅ Configuração concluída!');
