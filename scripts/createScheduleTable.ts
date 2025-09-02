import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

async function createScheduleTable() {
  try {
    console.log('🔧 Creating monthly_schedule table...');

    // Check if table already exists
    const { data: existingTable } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'monthly_schedule')
      .eq('table_schema', 'public');

    if (existingTable && existingTable.length > 0) {
      console.log('✅ monthly_schedule table already exists!');
      return;
    }

    console.log('⚠️  Table monthly_schedule does not exist.');
    console.log('📝 Please create the table manually in Supabase dashboard with the following SQL:');
    console.log(`
CREATE TABLE monthly_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  lesson_name VARCHAR(255) NOT NULL,
  trainer_name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  room VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_monthly_schedule_day_time ON monthly_schedule(day_of_week, start_time);

-- Add RLS policies
ALTER TABLE monthly_schedule ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage schedule
CREATE POLICY "Admins can manage schedule" ON monthly_schedule
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policy for users to view schedule
CREATE POLICY "Users can view schedule" ON monthly_schedule
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('user', 'trainer', 'admin')
    )
  );
    `);

  } catch (error) {
    console.error('❌ Failed to check monthly_schedule table:', error);
    process.exit(1);
  }
}

createScheduleTable();
