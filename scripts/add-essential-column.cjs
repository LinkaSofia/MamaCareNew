require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('📦 Connecting to database...');
    const sql = neon(databaseUrl);

    console.log('📝 Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add-essential-shopping-items.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Executing migration...');
    await sql(migration);

    console.log('✅ Migration completed successfully!');
    console.log('   - Added "essential" column to shopping_items table');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

