import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL não encontrada. Usando URL de exemplo...");
  process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/mamacare";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
