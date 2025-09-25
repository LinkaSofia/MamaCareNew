// Script para atualizar artigos com imagens
const fs = require('fs');
const path = require('path');

// Caminho das imagens
const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');

// Lista de imagens disponíveis
const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

console.log('🖼️  Gerando comandos SQL para atualizar imagens dos artigos...\n');

// Opção 1: URLs (Recomendado)
console.log('-- OPÇÃO 1: USAR URLs (RECOMENDADO)');
console.log('-- Atualize os IDs conforme seus artigos no banco\n');

imageFiles.forEach((filename, index) => {
  console.log(`-- Artigo ${index + 1}: ${filename}`);
  console.log(`UPDATE articles SET image = '/src/assets/imagem_artigos/${filename}' WHERE id = 'article_${index + 1}';`);
  console.log('');
});

console.log('\n' + '='.repeat(60) + '\n');

// Opção 2: Base64 para bytea
console.log('-- OPÇÃO 2: USAR BASE64 (para campo bytea)');
console.log('-- Execute o script: node scripts/convert-images-to-base64.cjs');
console.log('-- Depois use os comandos gerados\n');

// Verificar se as imagens existem
let existingImages = [];
imageFiles.forEach((file, index) => {
  const fullPath = path.join(imagesPath, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    existingImages.push({
      filename: file,
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(1)
    });
  }
});

console.log('📊 Resumo das imagens:');
existingImages.forEach((img, index) => {
  console.log(`  ${index + 1}. ${img.filename} - ${img.sizeKB} KB`);
});

console.log(`\n✅ Total: ${existingImages.length} imagens encontradas`);
console.log('\n💡 Recomendação: Use a Opção 1 (URLs) para melhor performance!');
