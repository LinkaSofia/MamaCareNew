// Script para inserir imagens do bebê no campo baby_image_url
const fs = require('fs');
const path = require('path');

async function insertBabyImages() {
  try {
    console.log('🖼️ Iniciando inserção de imagens do bebê...');
    
    // Caminho da pasta de imagens do bebê
    const assetsPath = path.join(process.cwd(), 'attached_assets/generated_images');
    
    // Verificar se a pasta existe
    if (!fs.existsSync(assetsPath)) {
      console.error('❌ Pasta generated_images não encontrada:', assetsPath);
      return;
    }
    
    // Listar arquivos na pasta
    const files = fs.readdirSync(assetsPath);
    console.log('📁 Arquivos encontrados:', files);
    
    // Filtrar apenas arquivos de imagem do bebê
    const babyImageFiles = files.filter(file => 
      file.match(/\.(png|jpg|jpeg|gif|webp)$/i) && 
      file.includes('fetus_3D_realistic')
    );
    
    console.log('🖼️ Imagens do bebê encontradas:', babyImageFiles);
    
    // Mapear semanas para imagens
    const weekImageMapping = {
      8: '8-week_fetus_3D_realistic_b436f945.png',
      12: '12-week_fetus_3D_realistic_52fbd5db.png',
      16: '16-week_fetus_3D_realistic_9c0a57bb.png',
      20: '20-week_fetus_3D_realistic_87f5a187.png',
      28: '28-week_fetus_3D_realistic_1158e5df.png',
      36: '36-week_fetus_3D_realistic_e9a2b0f5.png'
    };
    
    // Gerar comandos SQL
    const sqlCommands = [];
    
    for (const [week, filename] of Object.entries(weekImageMapping)) {
      const weekNum = parseInt(week);
      const imageUrl = `@assets/generated_images/${filename}`;
      
      const sqlCommand = `UPDATE baby_development SET baby_image_url = '${imageUrl}' WHERE week = ${weekNum};`;
      sqlCommands.push(sqlCommand);
      
      console.log(`📝 Semana ${weekNum}: ${filename} → ${imageUrl}`);
    }
    
    // Salvar comandos SQL em arquivo
    const sqlFile = path.join(process.cwd(), 'scripts', 'insert-baby-images.sql');
    fs.writeFileSync(sqlFile, sqlCommands.join('\n'));
    
    console.log(`\n📄 Comandos SQL salvos em: ${sqlFile}`);
    console.log('\n📊 Resumo:');
    console.log(`✅ Total: ${sqlCommands.length} comandos SQL gerados`);
    
    console.log('\n💡 Para executar no banco, use:');
    console.log('1. Acesse o painel do banco de dados');
    console.log('2. Execute o arquivo insert-baby-images.sql');
    console.log('3. Ou copie e cole os comandos SQL abaixo:');
    console.log('\n' + '='.repeat(50));
    console.log(sqlCommands.join('\n'));
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

insertBabyImages();






