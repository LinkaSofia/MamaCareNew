const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { articles } = require('../shared/schema.ts');

// Configuração da conexão
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_123456789@ep-rough-king-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = postgres(connectionString);
const db = drizzle(sql);

async function insertSampleArticles() {
  try {
    console.log('📝 Inserindo artigos de exemplo...\n');
    
    // Dados de exemplo para artigos
    const sampleArticles = [
      {
        title: "Diabetes gestacional: tudo que você precisa saber",
        week: 2,
        image: "1.jpg",
        source: "Hospital Israelita Albert Einstein",
        type: "article",
        description: "Guia completo sobre diabetes gestacional, sintomas, prevenção e tratamento.",
        categoria: "saúde e bem-estar",
        isActive: true
      },
      {
        title: "Manual da gestante: recomendações para uma gravidez mais segura",
        week: 3,
        image: "2.jpg", 
        source: "Hospital Israelita Albert Einstein",
        type: "article",
        description: "Orientações essenciais para uma gestação saudável e segura.",
        categoria: "saúde e bem-estar",
        isActive: true
      },
      {
        title: "Alimentação saudável durante a gestação",
        week: 4,
        image: "3.jpg",
        source: "Ministério da Saúde",
        type: "article", 
        description: "Dicas de nutrição e alimentação balanceada para gestantes.",
        categoria: "saúde e bem-estar",
        isActive: true
      },
      {
        title: "Exercícios seguros para gestantes",
        week: 5,
        image: "4.jpg",
        source: "Sociedade Brasileira de Medicina do Exercício",
        type: "article",
        description: "Atividades físicas recomendadas durante a gravidez.",
        categoria: "saúde e bem-estar", 
        isActive: true
      },
      {
        title: "Cuidados com a saúde mental na gestação",
        week: 6,
        image: "5.jpg",
        source: "Conselho Federal de Psicologia",
        type: "article",
        description: "Importância do bem-estar emocional durante a gravidez.",
        categoria: "saúde e bem-estar",
        isActive: true
      },
      {
        title: "Sono e descanso na gestação",
        week: 7,
        image: "6.jpg",
        source: "Associação Brasileira do Sono",
        type: "article",
        description: "Dicas para melhorar a qualidade do sono durante a gravidez.",
        categoria: "saúde e bem-estar",
        isActive: true
      }
    ];

    // Inserir cada artigo
    for (const article of sampleArticles) {
      try {
        await db.insert(articles).values(article);
        console.log(`✅ Inserido: ${article.title}`);
      } catch (error) {
        console.log(`⚠️ Erro ao inserir "${article.title}": ${error.message}`);
      }
    }

    console.log('\n🎉 Inserção concluída!');
    
    // Verificar os artigos inseridos
    const insertedArticles = await db.select().from(articles).where(sql`categoria ILIKE '%saúde%'`);
    console.log(`\n📊 Total de artigos de saúde encontrados: ${insertedArticles.length}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await sql.end();
  }
}

insertSampleArticles();
