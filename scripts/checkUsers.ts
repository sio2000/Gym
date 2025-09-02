import dotenv from 'dotenv';
import { supabase } from '../src/config/supabaseClient';

// Load environment variables
dotenv.config({ path: './env.config' });

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, is_active');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log('📊 Users found:', users?.length || 0);
    users?.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Active: ${user.is_active}`);
    });
    
    // Check user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, last_name, referral_code');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log('📊 Profiles found:', profiles?.length || 0);
    profiles?.forEach(profile => {
      console.log(`   - ${profile.first_name} ${profile.last_name} (${profile.user_id}) - Code: ${profile.referral_code}`);
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run check
checkUsers();
