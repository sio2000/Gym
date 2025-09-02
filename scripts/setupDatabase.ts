import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { supabase } from '../src/config/supabaseClient';

// Load environment variables
dotenv.config({ path: './env.config' });

async function setupDatabase() {
  try {
    console.log('🚀 Setting up FreeGym MVP database...');
    
    // Check if database is already set up
    const { data: existingTables, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (existingTables && existingTables.length > 0) {
      console.log('✅ Database already has data. Skipping setup.');
      return;
    }
    
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading sample data file...');
    const dataPath = path.join(process.cwd(), 'database', 'sample_data.sql');
    const sampleDataSQL = fs.readFileSync(dataPath, 'utf8');
    
    console.log('🔧 Creating database schema...');
    
    // Split schema into individual statements
    const schemaStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of schemaStatements) {
      if (statement.trim()) {
        try {
          // Note: Supabase doesn't support direct SQL execution easily
          // We'll need to use the Supabase dashboard or CLI for schema creation
          console.log('⚠️  Schema creation requires Supabase dashboard or CLI');
          console.log('📝 Please run the schema.sql file in your Supabase SQL editor');
          break;
        } catch (error) {
          console.error('❌ Error executing schema statement:', error);
        }
      }
    }
    
    console.log('📊 Inserting sample data...');
    
    // Split sample data into individual statements
    const dataStatements = sampleDataSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of dataStatements) {
      if (statement.trim()) {
        try {
          // Note: Supabase doesn't support direct SQL execution easily
          // We'll need to use the Supabase dashboard or CLI for data insertion
          console.log('⚠️  Data insertion requires Supabase dashboard or CLI');
          console.log('📝 Please run the sample_data.sql file in your Supabase SQL editor');
          break;
        } catch (error) {
          console.error('❌ Error executing data statement:', error);
        }
      }
    }
    
    console.log('✅ Database setup completed!');
    console.log('📝 Note: Schema and data files need to be run manually in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
