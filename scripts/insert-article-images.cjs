// Script para inserir imagens nos artigos via API
const fs = require('fs');
const path = require('path');

// Caminho das imagens
const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');

// Lista de imagens
const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

console.log('🖼️  Preparando para inserir imagens nos artigos...\n');

// Gerar comandos SQL diretos
console.log('-- COMANDOS SQL PARA EXECUTAR NO BANCO:');
console.log('-- Copie e cole estes comandos no seu cliente SQL\n');

imageFiles.forEach((filename, index) => {
  const articleId = index + 1; // IDs 1, 2, 3, 4, 5, 6
  
  console.log(`-- Artigo ${articleId}: ${filename}`);
  console.log(`UPDATE articles SET image = '/src/assets/imagem_artigos/${filename}' WHERE id = ${articleId};`);
  console.log('');
});

console.log('\n' + '='.repeat(60) + '\n');
console.log('📋 INSTRUÇÕES:');
console.log('1. Copie os comandos SQL acima');
console.log('2. Cole no seu cliente de banco de dados (pgAdmin, DBeaver, etc.)');
console.log('3. Execute os comandos');
console.log('4. Verifique com: SELECT id, title, image FROM articles WHERE id IN (1,2,3,4,5,6);');

// Verificar se as imagens existem
let existingImages = [];
imageFiles.forEach((file, index) => {
  const fullPath = path.join(imagesPath, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    existingImages.push({
      id: index + 1,
      filename: file,
      sizeKB: (stats.size / 1024).toFixed(1)
    });
  }
});

console.log('\n📊 Imagens que serão inseridas:');
existingImages.forEach((img) => {
  console.log(`  ID ${img.id}: ${img.filename} (${img.sizeKB} KB)`);
});
