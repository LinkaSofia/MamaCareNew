// Script para inserir imagens da pasta comparacao no campo fruit_image_url
import { db } from '../server/db.ts';
import { babyDevelopment } from '../shared/schema.ts';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function insertComparacaoImages() {
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
      
      console.log(`📝 Inserindo imagem para semana ${week}: ${imageUrl}`);
      
      try {
        // Verificar se a semana existe no banco
        const existingWeek = await db.select()
          .from(babyDevelopment)
          .where(sql`${babyDevelopment.week} = ${week}`)
          .limit(1);
        
        if (existingWeek.length === 0) {
          console.log(`⚠️ Semana ${week} não encontrada no banco de dados`);
          results.push({
            week,
            file,
            status: 'error',
            message: 'Semana não encontrada no banco'
          });
          continue;
        }
        
        // Atualizar a imagem
        await db.update(babyDevelopment)
          .set({ fruit_image_url: imageUrl })
          .where(sql`${babyDevelopment.week} = ${week}`);
        
        console.log(`✅ Semana ${week} atualizada com sucesso!`);
        results.push({
          week,
          file,
          imageUrl,
          status: 'success'
        });
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar semana ${week}:`, error.message);
        results.push({
          week,
          file,
          status: 'error',
          message: error.message
        });
      }
    }
    
    // Mostrar resumo
    console.log('\n📊 Resumo da inserção:');
    results.forEach(result => {
      if (result.status === 'success') {
        console.log(`✅ Semana ${result.week}: ${result.file} → ${result.imageUrl}`);
      } else {
        console.log(`❌ Semana ${result.week}: ${result.file} - ${result.message}`);
      }
    });
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`\n🎯 Total: ${successCount} sucessos, ${errorCount} erros`);
    
    // Verificar semanas que já têm imagens
    console.log('\n🔍 Verificando semanas com imagens no banco:');
    const weeksWithImages = await db.select({
      week: babyDevelopment.week,
      fruit_image_url: babyDevelopment.fruit_image_url
    })
    .from(babyDevelopment)
    .where(sql`${babyDevelopment.fruit_image_url} IS NOT NULL`)
    .orderBy(babyDevelopment.week);
    
    weeksWithImages.forEach(row => {
      console.log(`📸 Semana ${row.week}: ${row.fruit_image_url}`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

insertComparacaoImages();
