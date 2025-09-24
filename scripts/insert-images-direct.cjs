// Script para inserir imagens diretamente no banco usando SQL
const fs = require('fs');
const path = require('path');

async function insertImagesDirect() {
  try {
    console.log('🖼️ Iniciando inserção direta de imagens...');
    
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
    
    // Gerar comandos SQL
    const sqlCommands = [];
    
    for (const file of imageFiles) {
      // Extrair número da semana do nome do arquivo
      const weekMatch = file.match(/^(\d+)\./);
      if (!weekMatch) {
        console.log(`⚠️ Arquivo ${file} não segue o padrão de nome (número.png)`);
        continue;
      }
      
      const week = parseInt(weekMatch[1]);
      const imageUrl = `@assets/comparacao/${file}`;
      
      const sqlCommand = `UPDATE baby_development SET fruit_image_url = '${imageUrl}' WHERE week = ${week};`;
      sqlCommands.push(sqlCommand);
      
      console.log(`📝 Semana ${week}: ${file} → ${imageUrl}`);
    }
    
    // Salvar comandos SQL em arquivo
    const sqlFile = path.join(process.cwd(), 'scripts', 'insert-images.sql');
    fs.writeFileSync(sqlFile, sqlCommands.join('\n'));
    
    console.log(`\n📄 Comandos SQL salvos em: ${sqlFile}`);
    console.log('\n📊 Resumo:');
    console.log(`✅ Total: ${sqlCommands.length} comandos SQL gerados`);
    
    console.log('\n💡 Para executar no banco, use:');
    console.log('1. Acesse o painel do banco de dados');
    console.log('2. Execute o arquivo insert-images.sql');
    console.log('3. Ou copie e cole os comandos SQL abaixo:');
    console.log('\n' + '='.repeat(50));
    console.log(sqlCommands.join('\n'));
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

insertImagesDirect();





