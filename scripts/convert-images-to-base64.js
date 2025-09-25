const fs = require('fs');
const path = require('path');

// Caminho das imagens
const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');
const outputPath = path.join(__dirname, 'image-data.sql');

// Lista de imagens
const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

let sqlStatements = [];

imageFiles.forEach((filename, index) => {
  const imagePath = path.join(imagesPath, filename);
  
  try {
    // Ler a imagem como buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Converter para base64
    const base64String = imageBuffer.toString('base64');
    
    // Converter base64 para hex (formato bytea do PostgreSQL)
    const hexString = imageBuffer.toString('hex');
    
    // Gerar SQL para inserir/atualizar
    const sql = `UPDATE articles SET image = '\\x${hexString}' WHERE id = 'article_${index + 1}';`;
    
    sqlStatements.push(sql);
    
    console.log(`✅ Processada: ${filename} (${imageBuffer.length} bytes)`);
  } catch (error) {
    console.error(`❌ Erro ao processar ${filename}:`, error.message);
  }
});

// Salvar SQL em arquivo
fs.writeFileSync(outputPath, sqlStatements.join('\n'));

console.log(`\n📄 SQL gerado em: ${outputPath}`);
console.log(`📊 Total de imagens processadas: ${sqlStatements.length}`);
