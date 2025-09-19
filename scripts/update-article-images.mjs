// Script para atualizar imagens dos artigos baseado nos títulos
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mamacare';
const client = postgres(connectionString);
const db = drizzle(client);

// Schema da tabela articles
const articles = {
  id: 'id',
  title: 'title',
  week: 'week',
  video_url: 'video_url',
  image: 'image',
  source: 'source',
  type: 'type',
  description: 'description',
  isActive: 'is_active',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

// URLs de imagens baseadas nos títulos dos artigos
const articleImages = {
  // Artigo sobre candidíase na gravidez
  'candidíase': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  
  // Guia da gestante
  'guia da gestante': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  
  // Imagens genéricas para gravidez
  'gravidez': 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=300&fit=crop&crop=center',
  'gestante': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  'parto': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
  'ginecologista': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  'consulta': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  'médico': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  'saúde': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  'cuidados': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center'
};

async function updateArticleImages() {
  try {
    console.log('🖼️ Iniciando atualização de imagens dos artigos...');
    
    // Buscar todos os artigos
    const allArticles = await client`SELECT * FROM articles ORDER BY week, created_at`;
    
    console.log(`📋 Encontrados ${allArticles.length} artigos`);
    
    for (const article of allArticles) {
      console.log(`\n📄 Processando: "${article.title}"`);
      
      // Se já tem imagem, pular
      if (article.image) {
        console.log('   ✅ Já possui imagem, pulando...');
        continue;
      }
      
      // Buscar imagem baseada no título
      const title = article.title.toLowerCase();
      let imageUrl = null;
      
      // Procurar por palavras-chave no título
      for (const [keyword, url] of Object.entries(articleImages)) {
        if (title.includes(keyword)) {
          imageUrl = url;
          console.log(`   🎯 Encontrada imagem para palavra-chave: "${keyword}"`);
          break;
        }
      }
      
      // Se não encontrou, usar imagem genérica de gravidez
      if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center';
        console.log('   🎨 Usando imagem genérica de gravidez');
      }
      
      // Atualizar o artigo com a imagem
      await client`
        UPDATE articles 
        SET image = ${imageUrl}
        WHERE id = ${article.id}
      `;
      
      console.log(`   ✅ Imagem atualizada: ${imageUrl}`);
    }
    
    console.log('\n🎉 Atualização de imagens concluída!');
    
    // Mostrar resultado final
    const updatedArticles = await client`SELECT * FROM articles ORDER BY week, created_at`;
    
    console.log('\n📋 Artigos com imagens:');
    updatedArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Semana: ${article.week}`);
      console.log(`   Imagem: ${article.image ? '✅' : '❌'}`);
      if (article.image) {
        console.log(`   URL: ${article.image}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar imagens:', error.message);
  } finally {
    await client.end();
  }
}

// Executar o script
updateArticleImages();

