// Script para inserir conteúdo PDF na semana 3
import { db } from '../server/db.ts';
import { articles } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function insertPdfContent() {
  try {
    console.log('📄 Inserindo conteúdo PDF na semana 3...');
    
    // Dados do PDF para inserir
    const pdfContent = {
      title: 'GUIA DA GESTANTE: PASSO A PASSO PARA UM PARTO ADEQUADO',
      week: 3,
      video_url: 'https://www.gov.br/ans/pt-br/arquivos/assuntos/gestao-em-saude/parto-adequado/GuiaDaGestante_dez241.pdf',
      source: 'GOVBR',
      type: 'pdf',
      description: 'Guia oficial da ANS com orientações para um parto adequado'
    };
    
    // Inserir o conteúdo PDF
    const result = await db.insert(articles).values(pdfContent).returning();
    
    if (result.length > 0) {
      console.log('✅ Conteúdo PDF inserido com sucesso!');
      console.log('Resultado:', result[0]);
    } else {
      console.log('❌ Erro ao inserir conteúdo PDF');
    }
    
    // Verificar se foi inserido corretamente
    const insertedContent = await db.select()
      .from(articles)
      .where(eq(articles.week, 3))
      .orderBy(articles.createdAt);
    
    console.log('\n📋 Conteúdos da semana 3:');
    insertedContent.forEach((content, index) => {
      console.log(`${index + 1}. ${content.title}`);
      console.log(`   Tipo: ${content.type}`);
      console.log(`   URL: ${content.video_url}`);
      console.log(`   Fonte: ${content.source}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao inserir conteúdo PDF:', error.message);
  }
}

insertPdfContent();
