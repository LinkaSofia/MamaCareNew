// Script para adicionar colunas de timestamp na tabela articles
import { db } from '../server/db.ts';
import { sql } from 'drizzle-orm';

async function addTimestampColumns() {
  try {
    console.log('🔧 Adicionando colunas de timestamp na tabela articles...');
    
    // Adicionar colunas de timestamp se não existirem
    await db.execute(sql`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);
    
    await db.execute(sql`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    
    console.log('✅ Colunas de timestamp adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
  }
}

addTimestampColumns();
