// Script para adicionar coluna description na tabela articles
import { db } from '../server/db.ts';
import { sql } from 'drizzle-orm';

async function addDescriptionColumn() {
  try {
    console.log('🔧 Adicionando coluna description na tabela articles...');
    
    // Adicionar coluna description se não existir
    await db.execute(sql`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS description TEXT
    `);
    
    console.log('✅ Coluna description adicionada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
  }
}

addDescriptionColumn();
