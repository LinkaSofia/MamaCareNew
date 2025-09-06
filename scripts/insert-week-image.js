// Script para inserir imagens do bebê por semana
// Como usar:
// 1. Coloque sua imagem na pasta attached_assets/
// 2. Execute: node scripts/insert-week-image.js SEMANA NOME_DA_IMAGEM
// Exemplo: node scripts/insert-week-image.js 5 minha_imagem_semana5.png

const { exec } = require('child_process');

// Pegar argumentos da linha de comando
const week = process.argv[2];
const imageName = process.argv[3];

if (!week || !imageName) {
  console.log('❌ Uso: node scripts/insert-week-image.js SEMANA NOME_DA_IMAGEM');
  console.log('📝 Exemplo: node scripts/insert-week-image.js 5 minha_imagem_semana5.png');
  process.exit(1);
}

// Validar semana
const weekNum = parseInt(week);
if (isNaN(weekNum) || weekNum < 1 || weekNum > 40) {
  console.log('❌ Semana deve ser um número entre 1 e 40');
  process.exit(1);
}

// Criar o caminho da imagem no formato que o sistema espera
const imagePath = `@assets/${imageName}`;

console.log(`🖼️ Inserindo imagem da semana ${week}: ${imageName}`);

// Fazer requisição para o endpoint
const command = `curl -X POST -H "Content-Type: application/json" -d '{"week": ${week}, "imageUrl": "${imagePath}"}' http://localhost:5000/api/baby-development/insert-image`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erro ao executar comando:', error);
    return;
  }
  
  try {
    const response = JSON.parse(stdout);
    if (response.success) {
      console.log(`✅ Sucesso! Imagem da semana ${week} inserida no banco de dados`);
      console.log(`🔗 URL: ${response.imageUrl}`);
    } else {
      console.log('❌ Erro:', response.error || response.message);
    }
  } catch (e) {
    console.log('📝 Resposta:', stdout);
  }
});