require('dotenv').config();
const postgres = require('postgres');

async function main() {
  try {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

    console.log('📦 Connecting to database...');
    const sql = postgres(databaseUrl);

    console.log('🚀 Adding image_url column to feedbacks table...');
    
    // Adicionar coluna image_url se não existir
    await sql`
      ALTER TABLE feedbacks 
      ADD COLUMN IF NOT EXISTS image_url TEXT
    `;

    console.log('✅ Migration completed successfully!');
    console.log('   - Added "image_url" column to feedbacks table');

    // Verificar se a coluna foi criada
    console.log('\n🔍 Verifying column...');
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'feedbacks' 
      AND column_name = 'image_url'
    `;
    
    if (result.length > 0) {
      console.log('✅ Column verified:', result[0]);
    } else {
      console.log('⚠️  Column not found after creation');
    }

    await sql.end();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

