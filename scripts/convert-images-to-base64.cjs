// Script para converter imagens para base64 e gerar SQL para bytea
const fs = require('fs');
const path = require('path');

// Caminho das imagens
const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');
const outputPath = path.join(__dirname, 'articles-images-update.sql');

// Lista de imagens
const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

let sqlStatements = [];

console.log('🖼️  Convertendo imagens para base64...\n');

imageFiles.forEach((filename, index) => {
  const imagePath = path.join(imagesPath, filename);
  
  try {
    // Ler a imagem como buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Converter para base64
    const base64String = imageBuffer.toString('base64');
    
    // Gerar SQL usando decode() do PostgreSQL
    const sql = `-- ${filename} (${(imageBuffer.length / 1024).toFixed(1)} KB)
UPDATE articles SET image = decode('${base64String}', 'base64') WHERE id = 'article_${index + 1}';`;
    
    sqlStatements.push(sql);
    
    console.log(`✅ Processada: ${filename} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
  } catch (error) {
    console.error(`❌ Erro ao processar ${filename}:`, error.message);
  }
});

// Salvar SQL em arquivo
const fullSQL = sqlStatements.join('\n\n');
fs.writeFileSync(outputPath, fullSQL);

console.log(`\n📄 SQL gerado em: ${outputPath}`);
console.log(`📊 Total de imagens processadas: ${sqlStatements.length}`);
console.log('\n💡 Execute o arquivo SQL no seu banco de dados PostgreSQL');
