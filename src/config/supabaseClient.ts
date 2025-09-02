import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './env.config' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const executeSQL = async (sql: string, params: any[] = []) => {
  try {
    // Try to use RPC first
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql,
      sql_params: params
    });

    if (error) {
      throw new Error(`SQL execution error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.warn('RPC not available, using direct query...');
    return await executeDirectSQL(sql, params);
  }
};

const executeDirectSQL = async (sql: string, params: any[] = []) => {
  try {
    // This is a fallback - direct SQL execution is not fully supported in Supabase
    const { data, error } = await supabase
      .from('_dummy_table_for_sql')
      .select('*')
      .limit(0);

    if (error) {
      throw new Error(`Direct SQL not supported: ${error.message}`);
    }
    throw new Error('Direct SQL execution not available in this setup');
  } catch (error) {
    throw error;
  }
};

export const checkConnection = async () => {
  try {
    // Try to access a table to test connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, message: 'Connected to Supabase - Table does not exist yet (expected)' };
      }
      throw error;
    }
    
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}` };
  }
};
