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

async function upsertCategory(name: string, color: string, description?: string) {
  // Try find by name
  const { data: existing } = await supabase
    .from('lesson_categories')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (existing?.id) {
    // Ensure active/color/description updated
    await supabase.from('lesson_categories').update({ color, description, is_active: true }).eq('id', existing.id);
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from('lesson_categories')
    .insert({ name, color, description, is_active: true })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

async function run() {
  console.log('⏫ Updating lesson categories & lessons...');

  // 1) Ensure categories exist
  const pilatesId = await upsertCategory('Pilates', '#8B5CF6');
  const kickId = await upsertCategory('Kick Boxing', '#EF4444');
  const personalId = await upsertCategory('Personal Training', '#10B981');
  const freeId = await upsertCategory('Ελεύθερο Gym', '#3B82F6');

  // 2) Deactivate existing lessons (optional: keep history)
  await supabase.from('lessons').update({ is_active: false }).neq('id', '');

  // 3) Insert or replace the four canonical lessons (simple entries)
  const baseLessons = [
    { name: 'Pilates', category_id: pilatesId, description: 'Pilates group', day_of_week: 1, start_time: '09:00', end_time: '09:55', capacity: 20, difficulty: 'intermediate', is_active: true },
    { name: 'Kick Boxing', category_id: kickId, description: 'Kick Boxing group', day_of_week: 2, start_time: '20:00', end_time: '21:00', capacity: 18, difficulty: 'intermediate', is_active: true },
    { name: 'Personal Training', category_id: personalId, description: '1:1 training', day_of_week: 4, start_time: '17:00', end_time: '17:50', capacity: 1, difficulty: 'beginner', is_active: true },
    { name: 'Ελεύθερο Gym', category_id: freeId, description: 'Free gym time', day_of_week: 0, start_time: '10:00', end_time: '11:30', capacity: 30, difficulty: 'beginner', is_active: true },
  ];

  for (const l of baseLessons) {
    // delete by name (id unknown, no unique constraint)
    await supabase.from('lessons').delete().eq('name', l.name);
    const { error: insErr } = await supabase.from('lessons').insert(l);
    if (insErr) throw insErr;
  }

  console.log('✅ Lessons/categories updated.');
}

run().catch((e) => {
  console.error('❌ Migration failed:', e);
  process.exit(1);
});


