import dotenv from 'dotenv';
import { supabase } from '../src/config/supabaseClient';

// Load environment variables
dotenv.config({ path: './env.config' });

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Try to access a table to test connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Connected to Supabase - Table does not exist yet (expected)');
        return;
      }
      throw error;
    }
    
    console.log('✅ Connected to Supabase successfully');
    console.log('📊 Data:', data);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

// Run test
testConnection();
