import { createClient } from '@supabase/supabase-js';

// Get environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://izltxhsnpvzmcibnjhxq.supabase.co';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bHR4aHNucHZ6bWNpYm5qaHhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc3NTMzOSwiZXhwIjoyMDcyMzUxMzM5fQ.CFZ5mG7uakyqqPjR-_dyz-yvz4fVcwWkKVP-Vc7F5V4';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase service key - admin functions may not work properly');
}

// Create Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    // Χρησιμοποιούμε άλλο storage key για να μην αγγίζει το client session
    storageKey: 'sb-freegym-admin'
  }
});

// Helper function to check admin connection
export const checkAdminConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return { success: true, message: 'Admin connection successful' };
  } catch (error) {
    return { success: false, message: `Admin connection failed: ${error}` };
  }
};
