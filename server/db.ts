import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

console.log("🔗 Conectando ao Supabase...");
console.log("🔗 Database URL:", connectionString.replace(/\/\/.*@/, '//***:***@'));

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export { pool, db };
