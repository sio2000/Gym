// Use the main Supabase client for admin operations
// This avoids creating multiple GoTrueClient instances
import { supabase } from './supabase';

// For admin operations, we'll use the main client
// The RLS policies should allow admin access based on user role
export const supabaseAdmin = supabase;

// Cleanup function to clear admin client data
export const cleanupSupabaseAdmin = () => {
  // Clear any stored data
  localStorage.removeItem('sb-freegym-admin-service-only');
};

// Helper function to check admin connection
export const checkAdminConnection = async () => {
  try {
    const { error } = await supabaseAdmin
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
