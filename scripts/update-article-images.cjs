// Script para atualizar imagens dos artigos
// Execute: node scripts/update-article-images.js

const fs = require('fs');
const path = require('path');

// Caminho das imagens
const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');

// Lista de imagens disponíveis
const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

console.log('🖼️  Imagens disponíveis:');
imageFiles.forEach((file, index) => {
  const fullPath = path.join(imagesPath, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`  ${index + 1}. ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`  ${index + 1}. ${file} (❌ não encontrada)`);
  }
});

console.log('\n📝 Opções para atualizar o banco:');
console.log('\n1. Usar URLs (Recomendado):');
console.log('   UPDATE articles SET image = \'/src/assets/imagem_artigos/1.jpg\' WHERE id = \'seu_id\';');

console.log('\n2. Usar base64 (para bytea):');
console.log('   -- Primeiro converta a imagem para base64');
console.log('   -- Depois use: UPDATE articles SET image = decode(\'base64_string\', \'base64\') WHERE id = \'seu_id\';');

console.log('\n3. Script automático:');
console.log('   node scripts/convert-images-to-base64.js');