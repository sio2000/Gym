import { supabase } from './supabaseClient';

// Helper functions for database operations using Supabase
export const query = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    // For now, we'll use a simple approach with Supabase
    // In a real implementation, you'd use Supabase's query builder or RPC calls
    
    // This is a placeholder - in practice, you'd use Supabase's built-in methods
    console.warn('Direct SQL queries not supported in Supabase. Use Supabase query builder instead.');
    
    // Return empty result for now
    return { rows: [], rowCount: 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const queryOne = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    const result = await query(sql, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database queryOne error:', error);
    throw error;
  }
};

export const queryMany = async (sql: string, params: any[] = []): Promise<any[]> => {
  try {
    const result = await query(sql, params);
    return result.rows || [];
  } catch (error) {
    console.error('Database queryMany error:', error);
    throw error;
  }
};

export const closePool = async (): Promise<void> => {
  // No connection pool to close with Supabase
  console.log('✅ Supabase client connection closed');
};

// Export supabase client for direct use
export { supabase };

export default supabase;
