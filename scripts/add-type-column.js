// Script para adicionar coluna type na tabela articles
import { db } from '../server/db.ts';
import { sql } from 'drizzle-orm';

async function addTypeColumn() {
  try {
    console.log('🔧 Adicionando coluna type na tabela articles...');
    
    // Adicionar coluna type se não existir
    await db.execute(sql`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'article'
    `);
    
    console.log('✅ Coluna type adicionada com sucesso!');
    
    // Verificar estrutura da tabela
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'articles'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela articles:');
    tableInfo.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
  }
}

addTypeColumn();
