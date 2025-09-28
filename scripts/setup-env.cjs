const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variáveis de ambiente para Mama Care...\n');

// Configurações do Gmail
const gmailUser = 'seu-email@gmail.com';
const gmailAppPassword = 'dlhr kvje eqki amam';

// Conteúdo do arquivo .env
const envContent = `# Configuração do Banco de Dados
DATABASE_URL=postgresql://neondb_owner:neondb_owner_password@ep-rough-king-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require

# Configuração do Gmail para recuperação de senha
GMAIL_USER=${gmailUser}
GMAIL_APP_PASSWORD=${gmailAppPassword}

# Configuração do Servidor
PORT=5000
NODE_ENV=development

# Configuração de JWT
JWT_SECRET=sua-chave-secreta-jwt-aqui

# Configuração de CORS
CORS_ORIGIN=http://localhost:5000
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

console.log('\n📧 Configuração do Gmail:');
console.log(`   Email: ${gmailUser}`);
console.log(`   Senha do App: ${gmailAppPassword}`);
console.log('\n🔐 IMPORTANTE:');
console.log('   1. Substitua "seu-email@gmail.com" pelo seu email real do Gmail');
console.log('   2. A senha do app já está configurada: "dlhr kvje eqki amam"');
console.log('   3. Certifique-se de que a autenticação de 2 fatores está ativada no Gmail');
console.log('   4. Use a senha do app, não a senha normal do Gmail');
console.log('\n✅ Configuração concluída!');
