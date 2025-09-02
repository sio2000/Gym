import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { supabase } from '../src/config/supabaseClient';

// Load environment variables
dotenv.config({ path: './env.config' });

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Check if migrations table exists
    const { data: migrationsTable, error: checkError } = await supabase
      .from('migrations')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('📋 Creating migrations table...');
      // Note: This would need to be done manually in Supabase dashboard
      console.log('⚠️  Please create migrations table manually in Supabase dashboard');
    }
    
    console.log('📖 Reading migration files...');
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const dataPath = path.join(process.cwd(), 'database', 'sample_data.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found');
    }
    
    if (!fs.existsSync(dataPath)) {
      throw new Error('Sample data file not found');
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const sampleDataSQL = fs.readFileSync(dataPath, 'utf8');
    
    console.log('🔧 Applying schema migrations...');
    console.log('⚠️  Schema migrations need to be run manually in Supabase dashboard');
    console.log('📝 Please copy and paste the contents of schema.sql into your Supabase SQL editor');
    
    console.log('📊 Applying data migrations...');
    console.log('⚠️  Data migrations need to be run manually in Supabase dashboard');
    console.log('📝 Please copy and paste the contents of sample_data.sql into your Supabase SQL editor');
    
    console.log('✅ Migration instructions completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the contents of database/schema.sql');
    console.log('   4. Run the contents of database/sample_data.sql');
    console.log('   5. Verify tables are created and populated');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDatabase();
