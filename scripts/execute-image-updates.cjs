// Script para executar os comandos SQL de atualização de imagens
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function executeImageUpdates() {
  // Usar a mesma URL que o servidor usa
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/mamacare";
  
  const pool = new Pool({ connectionString });

  try {
    console.log('🔌 Conectado ao banco de dados Neon');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'article-images-bytea.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    console.log(`📄 Executando ${commands.length} comandos SQL...\n`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (!command) continue;
      
      try {
        console.log(`🔄 Executando comando ${i + 1}/${commands.length}...`);
        const result = await pool.query(command);
        console.log(`✅ Comando ${i + 1} executado com sucesso (${result.rowCount} linhas afetadas)`);
      } catch (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error.message);
      }
    }

    // Verificar resultados
    console.log('\n📋 Verificando resultados...');
    const checkResult = await pool.query(`
      SELECT id, title, 
             CASE 
               WHEN image IS NOT NULL THEN 'Imagem inserida (' || length(image) || ' bytes)'
               ELSE 'Sem imagem'
             END as image_status
      FROM articles 
      WHERE id IN (1,2,3,4,5,6) 
      ORDER BY id
    `);

    console.log('\n📊 Status das imagens:');
    checkResult.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.title} - ${row.image_status}`);
    });

    console.log('\n🎉 Processo concluído!');

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    await pool.end();
  }
}

executeImageUpdates();

