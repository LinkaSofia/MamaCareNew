// Migração para adicionar colunas necessárias ao Supabase
import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrateDatabase() {
  console.log("🔄 Starting database migration...");
  
  try {
    // Adicionar created_at na tabela users se não existir
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);
    console.log("✅ Added created_at to users table");

    // Criar tabela de analytics se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_analytics (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id),
        session_id TEXT NOT NULL,
        action TEXT NOT NULL,
        page TEXT NOT NULL,
        element TEXT,
        duration INTEGER,
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Created user_analytics table");

    // Criar tabela de sessions se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        session_id TEXT NOT NULL UNIQUE,
        start_time TIMESTAMP DEFAULT NOW(),
        end_time TIMESTAMP,
        total_duration INTEGER,
        pages_visited JSONB DEFAULT '[]'::jsonb,
        actions_count INTEGER DEFAULT 0,
        user_agent TEXT,
        ip_address TEXT
      )
    `);
    console.log("✅ Created user_sessions table");

    // Criar tabela access_logs se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS access_logs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id),
        email TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        session_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Created access_logs table");

    console.log("🎉 Database migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Executar migração se este arquivo for chamado diretamente
if (require.main === module) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateDatabase };