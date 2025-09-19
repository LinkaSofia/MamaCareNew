// Script para adicionar coluna is_active na tabela articles
import { db } from '../server/db.ts';
import { sql } from 'drizzle-orm';

async function addIsActiveColumn() {
  try {
    console.log('🔧 Adicionando coluna is_active na tabela articles...');
    
    // Adicionar coluna is_active se não existir
    await db.execute(sql`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
    `);
    
    console.log('✅ Coluna is_active adicionada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
  }
}

addIsActiveColumn();
