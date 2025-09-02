# Supabase Database Trigger Setup

## Βήματα για να λύσεις το πρόβλημα εγγραφής:

### 1. Πήγαινε στο Supabase Dashboard
- Άνοιξε το project σου στο https://supabase.com/dashboard
- Πήγαινε στο **SQL Editor**

### 2. Εκτέλεσε το trigger SQL
Αντιγράψε και εκτέλεσε το παρακάτω SQL:

```sql
-- Create a simple function that only inserts the user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow insert for trigger" ON public.user_profiles;
CREATE POLICY "Allow insert for trigger" ON public.user_profiles
  FOR INSERT WITH CHECK (true);
```

### 3. Απενεργοποίηση Email Confirmation (Προαιρετικό)
Αν θέλεις να απενεργοποιήσεις το email confirmation:

1. Πήγαινε στο **Authentication** → **Settings**
2. Απενεργοποίησε το **Enable email confirmations**
3. Αποθήκευσε τις αλλαγές

### 4. Ελέγχος στο Netlify
Μετά την εφαρμογή του trigger, δοκίμασε ξανά την εγγραφή στο Netlify.

## Τι κάνει το trigger:
- Όταν δημιουργείται νέος χρήστης στο Supabase Auth
- Αυτόματα δημιουργείται το user profile στον πίνακα `user_profiles`
- Χρησιμοποιεί τα metadata που στέλνει η εφαρμογή
- Λύνει το πρόβλημα με το RLS (Row Level Security)
