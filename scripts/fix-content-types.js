// Script para corrigir tipos de conteúdo
import { db } from '../server/db.ts';
import { articles } from '../shared/schema.ts';
import { eq, sql } from 'drizzle-orm';

async function fixContentTypes() {
  try {
    console.log('🔧 Corrigindo tipos de conteúdo...');
    
    // Verificar conteúdos sem tipo definido
    const contentWithoutType = await db.select()
      .from(articles)
      .where(sql`${articles.type} IS NULL`);
    
    console.log(`📊 Encontrados ${contentWithoutType.length} conteúdos sem tipo`);
    
    // Atualizar conteúdos sem tipo para 'article' (padrão)
    if (contentWithoutType.length > 0) {
      await db.update(articles)
        .set({ type: 'article' })
        .where(sql`${articles.type} IS NULL`);
      
      console.log('✅ Tipos atualizados para "article"');
    }
    
    // Verificar conteúdos com video_url que não são PDFs
    const videoContent = await db.select()
      .from(articles)
      .where(sql`${articles.video_url} IS NOT NULL AND ${articles.type} != 'pdf'`);
    
    console.log(`📊 Encontrados ${videoContent.length} conteúdos com vídeo`);
    
    // Atualizar conteúdos com vídeo para tipo 'video'
    if (videoContent.length > 0) {
      await db.update(articles)
        .set({ type: 'video' })
        .where(sql`${articles.video_url} IS NOT NULL AND ${articles.type} != 'pdf'`);
      
      console.log('✅ Conteúdos com vídeo atualizados para tipo "video"');
    }
    
    // Verificar estado final
    const allContent = await db.select()
      .from(articles)
      .orderBy(articles.week, articles.createdAt);
    
    console.log('\n📋 Estado final dos conteúdos por semana:');
    const groupedByWeek = allContent.reduce((acc, item) => {
      if (!acc[item.week]) acc[item.week] = [];
      acc[item.week].push(item);
      return acc;
    }, {});
    
    Object.keys(groupedByWeek).forEach(week => {
      console.log(`\n📅 Semana ${week}:`);
      groupedByWeek[week].forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.type})`);
        if (item.video_url) {
          console.log(`     URL: ${item.video_url}`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tipos:', error.message);
  }
}

fixContentTypes();
