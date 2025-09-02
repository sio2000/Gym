import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

dotenv.config({ path: './env.config' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    const email = 'admin@freegym.gr';
    const password = 'admin123';
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if admin already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        email_verified: true
      })
      .select('id')
      .single();

    if (userError || !newUser) {
      throw new Error('Failed to create admin user');
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: newUser.id,
        first_name: firstName,
        last_name: lastName,
        referral_code: `ADMIN${Date.now()}`
      });

    if (profileError) {
      throw new Error('Failed to create admin profile');
    }

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('🎯 Role: admin');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
