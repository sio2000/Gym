import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { supabase } from '../src/config/supabaseClient';

// Load environment variables
dotenv.config({ path: './env.config' });

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    const email = 'test@freegym.gr';
    const password = 'password123';
    const firstName = 'Test';
    const lastName = 'User';
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      console.log('⚠️  User already exists, updating password...');
      
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('email', email);
      
      if (updateError) {
        throw new Error('Failed to update password');
      }
      
      console.log('✅ Password updated successfully');
      return;
    }
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'user',
        is_active: true,
        email_verified: true
      })
      .select('id')
      .single();
    
    if (userError || !newUser) {
      throw new Error('Failed to create user');
    }
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: newUser.id,
        first_name: firstName,
        last_name: lastName,
        referral_code: `TEST${Date.now()}`
      });
    
    if (profileError) {
      throw new Error('Failed to create user profile');
    }
    
    console.log('✅ Test user created successfully');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 User ID: ${newUser.id}`);
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  }
}

// Run creation
createTestUser();
