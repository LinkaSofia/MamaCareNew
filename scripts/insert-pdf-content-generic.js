// Script genérico para inserir conteúdo PDF em qualquer semana
import { db } from '../server/db.ts';
import { articles } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function insertPdfContent(week, title, pdfUrl, source, description) {
  try {
    console.log(`📄 Inserindo conteúdo PDF na semana ${week}...`);
    
    // Dados do PDF para inserir
    const pdfContent = {
      title: title,
      week: week,
      video_url: pdfUrl, // Usando video_url para armazenar a URL do PDF
      source: source,
      type: 'pdf',
      description: description
    };
    
    // Inserir o conteúdo PDF
    const result = await db.insert(articles).values(pdfContent).returning();
    
    if (result.length > 0) {
      console.log(`✅ Conteúdo PDF inserido com sucesso na semana ${week}!`);
      console.log('Resultado:', result[0]);
      return true;
    } else {
      console.log(`❌ Erro ao inserir conteúdo PDF na semana ${week}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Erro ao inserir conteúdo PDF na semana ${week}:`, error.message);
    return false;
  }
}

// Exemplo de uso - descomente e modifique conforme necessário
/*
insertPdfContent(
  3, // semana
  'GUIA DA GESTANTE: PASSO A PASSO PARA UM PARTO ADEQUADO', // título
  'https://www.gov.br/ans/pt-br/arquivos/assuntos/gestao-em-saude/parto-adequado/GuiaDaGestante_dez241.pdf', // URL do PDF
  'GOVBR', // fonte
  'Guia oficial da ANS com orientações para um parto adequado' // descrição
);
*/

// Verificar conteúdos de uma semana específica
async function checkWeekContent(week) {
  try {
    const content = await db.select()
      .from(articles)
      .where(eq(articles.week, week))
      .orderBy(articles.createdAt);
    
    console.log(`\n📋 Conteúdos da semana ${week}:`);
    content.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Tipo: ${item.type}`);
      console.log(`   URL: ${item.video_url}`);
      console.log(`   Fonte: ${item.source}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar conteúdos:', error.message);
  }
}

// Verificar todas as semanas com conteúdo
async function checkAllContent() {
  try {
    const allContent = await db.select()
      .from(articles)
      .orderBy(articles.week, articles.createdAt);
    
    console.log('\n📋 Todos os conteúdos por semana:');
    const groupedByWeek = allContent.reduce((acc, item) => {
      if (!acc[item.week]) acc[item.week] = [];
      acc[item.week].push(item);
      return acc;
    }, {});
    
    Object.keys(groupedByWeek).forEach(week => {
      console.log(`\n📅 Semana ${week}:`);
      groupedByWeek[week].forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.type})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar todos os conteúdos:', error.message);
  }
}

// Executar verificação
checkAllContent();
