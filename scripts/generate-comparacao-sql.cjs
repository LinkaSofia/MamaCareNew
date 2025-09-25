const fs = require('fs');
const path = require('path');

async function generateComparacaoSql() {
  console.log('🖼️ Gerando comandos SQL para imagens de comparação...');
  
  const comparacaoPath = path.join(__dirname, '../client/src/assets/comparacao');
  
  if (!fs.existsSync(comparacaoPath)) {
    console.log('❌ Pasta comparacao não encontrada:', comparacaoPath);
    return;
  }

  const files = fs.readdirSync(comparacaoPath);
  console.log('📁 Arquivos encontrados:', files);

  const imageFiles = files.filter(file =>
    file.match(/\.(png|jpg|jpeg|gif|webp)$/i)
  );
  console.log('🖼️ Imagens encontradas:', imageFiles);

  const sqlCommands = [];
  const results = [];

  for (const file of imageFiles) {
    const weekMatch = file.match(/^(\d+)\./);
    if (!weekMatch) {
      console.log(`⚠️ Arquivo ${file} não segue o padrão de nome (número.png)`);
      continue;
    }

    const week = parseInt(weekMatch[1]);
    const imageUrl = `/client/src/assets/comparacao/${file}`;
    console.log(`📝 Semana ${week}: ${file} → ${imageUrl}`);
    
    sqlCommands.push(`UPDATE baby_development SET fruit_image_url = '${imageUrl}' WHERE week = ${week};`);
    results.push({ week, file, imageUrl, status: 'success' });
  }

  const sqlContent = sqlCommands.join('\n');
  const outputPath = path.join(__dirname, 'insert-comparacao-images.sql');
  fs.writeFileSync(outputPath, sqlContent);
  console.log(`\n💾 Comandos SQL salvos em: ${outputPath}`);

  console.log('\n📊 Resumo:');
  console.log(`✅ Total: ${results.length} comandos SQL gerados`);
  console.log(`📁 Arquivo salvo: ${outputPath}`);

  console.log('\n💡 Para executar no banco:');
  console.log('1. Acesse o painel do Supabase');
  console.log('2. Vá em SQL Editor');
  console.log('3. Execute o arquivo insert-comparacao-images.sql');
  console.log('4. Ou copie e cole os comandos SQL abaixo:');
  console.log('\n==================================================');
  console.log(sqlContent);
  console.log('==================================================');
}

generateComparacaoSql();






