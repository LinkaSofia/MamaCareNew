// Script simples para inserir imagens da pasta comparacao
const fs = require('fs');
const path = require('path');

async function insertImages() {
  try {
    console.log('🖼️ Iniciando inserção de imagens da pasta comparacao...');
    
    // Caminho da pasta de imagens
    const assetsPath = path.join(process.cwd(), 'client/src/assets/comparacao');
    
    // Verificar se a pasta existe
    if (!fs.existsSync(assetsPath)) {
      console.error('❌ Pasta comparacao não encontrada:', assetsPath);
      return;
    }
    
    // Listar arquivos na pasta
    const files = fs.readdirSync(assetsPath);
    console.log('📁 Arquivos encontrados:', files);
    
    // Filtrar apenas arquivos de imagem
    const imageFiles = files.filter(file => 
      file.match(/\.(png|jpg|jpeg|gif|webp)$/i)
    );
    
    console.log('🖼️ Imagens encontradas:', imageFiles);
    
    // Simular inserção no banco
    const results = [];
    
    for (const file of imageFiles) {
      // Extrair número da semana do nome do arquivo
      const weekMatch = file.match(/^(\d+)\./);
      if (!weekMatch) {
        console.log(`⚠️ Arquivo ${file} não segue o padrão de nome (número.png)`);
        continue;
      }
      
      const week = parseInt(weekMatch[1]);
      const imageUrl = `@assets/comparacao/${file}`;
      
      console.log(`📝 Imagem para semana ${week}: ${imageUrl}`);
      
      results.push({
        week,
        file,
        imageUrl,
        status: 'ready'
      });
    }
    
    // Mostrar resumo
    console.log('\n📊 Resumo das imagens encontradas:');
    results.forEach(result => {
      console.log(`✅ Semana ${result.week}: ${result.file} → ${result.imageUrl}`);
    });
    
    console.log(`\n🎯 Total: ${results.length} imagens encontradas`);
    console.log('\n💡 Para inserir no banco, execute o endpoint:');
    console.log('POST http://localhost:5000/api/baby-development/insert-comparacao-images');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

insertImages();





