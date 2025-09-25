// Script para gerar comandos SQL para inserir imagens como bytea
const fs = require('fs');
const path = require('path');

async function generateImageSQL() {
  console.log('🖼️  Gerando comandos SQL para inserir imagens como bytea...\n');

  // Caminho das imagens
  const imagesPath = path.join(__dirname, '../client/src/assets/imagem_artigos');
  
  // Lista de imagens
  const imageFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

  let sqlCommands = [];
  let allImagesFound = true;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const articleId = i + 1; // ID 1, 2, 3, 4, 5, 6
    const imagePath = path.join(imagesPath, filename);
    
    try {
      // Verificar se a imagem existe
      if (!fs.existsSync(imagePath)) {
        console.log(`❌ Imagem não encontrada: ${filename}`);
        allImagesFound = false;
        continue;
      }

      // Ler a imagem como buffer
      const imageBuffer = fs.readFileSync(imagePath);
      const fileSizeKB = (imageBuffer.length / 1024).toFixed(1);
      
      console.log(`📸 Processando: ${filename} (${fileSizeKB} KB) para artigo ID ${articleId}`);

      // Converter buffer para hex string (formato bytea do PostgreSQL)
      const hexString = imageBuffer.toString('hex');
      
      // Gerar comando SQL
      const sqlCommand = `UPDATE articles SET image = decode('${hexString}', 'hex') WHERE id = ${articleId};`;
      sqlCommands.push(sqlCommand);

    } catch (error) {
      console.error(`❌ Erro ao processar ${filename}:`, error.message);
      allImagesFound = false;
    }
  }

  if (allImagesFound) {
    console.log('\n✅ Todas as imagens processadas com sucesso!');
  } else {
    console.log('\n⚠️  Algumas imagens não foram encontradas.');
  }

  // Salvar comandos SQL em arquivo
  const outputPath = path.join(__dirname, 'article-images-bytea.sql');
  const fullSQL = sqlCommands.join('\n\n');
  
  fs.writeFileSync(outputPath, fullSQL);

  console.log(`\n📄 Comandos SQL gerados em: ${outputPath}`);
  console.log(`📊 Total de comandos: ${sqlCommands.length}`);
  
  console.log('\n📋 INSTRUÇÕES:');
  console.log('1. Abra seu cliente de banco de dados (pgAdmin, DBeaver, etc.)');
  console.log('2. Conecte-se ao seu banco Neon');
  console.log('3. Execute o arquivo: scripts/article-images-bytea.sql');
  console.log('4. Verifique com: SELECT id, title, length(image) as image_size FROM articles WHERE id IN (1,2,3,4,5,6);');

  console.log('\n🔍 Comandos SQL gerados:');
  console.log('=' .repeat(60));
  sqlCommands.forEach((cmd, index) => {
    console.log(`-- Artigo ${index + 1}`);
    console.log(cmd);
    console.log('');
  });
}

generateImageSQL();

