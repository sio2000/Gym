import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './env.config' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to execute SQL queries
export const executeSQL = async (sql: string, params: any[] = []) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql,
      sql_params: params
    });

    if (error) {
      throw new Error(`SQL execution error: ${error.message}`);
    }

    return data;
  } catch (error) {
    // Fallback to direct query if RPC is not available
    console.warn('RPC not available, using direct query...');
    return await executeDirectSQL(sql, params);
  }
};

// Fallback direct SQL execution
const executeDirectSQL = async (sql: string, params: any[] = []) => {
  try {
    const { data, error } = await supabase
      .from('_dummy_table_for_sql')
      .select('*')
      .limit(0);

    if (error) {
      throw new Error(`Direct SQL not supported: ${error.message}`);
    }

    // This is a placeholder - in practice, you'd need to use Supabase's SQL editor
    // or create a custom function for this
    throw new Error('Direct SQL execution not available in this setup');
  } catch (error) {
    throw error;
  }
};

// Helper function to check connection
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return { success: true, message: 'Connected to Supabase' };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}` };
  }
};
