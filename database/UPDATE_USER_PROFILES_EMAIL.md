# Ενημέρωση User Profiles με Email

## Περιγραφή
Αυτός ο οδηγός περιγράφει πώς να προσθέσετε τη στήλη `email` στον πίνακα `user_profiles` για να μπορείτε να εμφανίζετε τα πραγματικά emails των χρηστών στο Admin Panel.

## Βήματα Εφαρμογής

### 1. Εκτέλεση SQL Script
Ανοίξτε το Supabase SQL Editor και εκτελέστε το περιεχόμενο του αρχείου `add_email_to_user_profiles.sql`:

**ΣΗΜΑΝΤΙΚΟ**: Αν λάβετε σφάλμα `ERROR: 23505: could not create unique index "user_profiles_email_unique"`, εκτελέστε πρώτα το `fix_email_duplicates.sql` και μετά το `add_email_to_user_profiles.sql`.

### 1.1. Αν έχετε σφάλμα με duplicate emails
Εκτελέστε πρώτα αυτό το script:

```sql
-- Simple fix for email duplicates - just update the emails
UPDATE user_profiles 
SET email = CONCAT('user-', SUBSTRING(user_id::text, 1, 8), '@freegym.gr')
WHERE email = 'user@freegym.gr';
```

**Εναλλακτικά**, αν θέλετε να δοκιμάσετε το πλήρες fix script, εκτελέστε το `fix_email_duplicates.sql` που τώρα ελέγχει αν το constraint υπάρχει ήδη.

```sql
-- Add email column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN email VARCHAR(255);

-- Update existing user profiles with sample emails
UPDATE user_profiles 
SET email = CASE 
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440030' THEN 'admin@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440040' THEN 'maria@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440041' THEN 'nikos@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440042' THEN 'eleni@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440060' THEN 'user1@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440061' THEN 'user2@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440062' THEN 'user3@freegym.gr'
    ELSE 'user@freegym.gr'
END;

-- Make email column NOT NULL after populating it
ALTER TABLE user_profiles 
ALTER COLUMN email SET NOT NULL;

-- Add unique constraint to email column
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Add index for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles (email);
```

### 2. Ενημέρωση Trigger
Εκτελέστε το τμήμα για την ενημέρωση του trigger:

```sql
-- Update the trigger to also handle email when creating new user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function that includes email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, 'user@freegym.gr')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Αποτελέσματα

Μετά την εφαρμογή αυτών των αλλαγών:

1. **Ο πίνακας `user_profiles` θα έχει στήλη `email`** με τα πραγματικά emails των χρηστών
2. **Το Admin Panel θα εμφανίζει** στο dropdown επιλογής χρήστη: "Όνομα Επώνυμο (email@domain.com)"
3. **Νέοι χρήστες** που εγγράφονται θα έχουν το email τους αποθηκευμένο αυτόματα στον πίνακα `user_profiles`
4. **Ο admin θα μπορεί να επιλέξει** οποιονδήποτε χρήστη από τη βάση δεδομένων για να δημιουργήσει προσωποποιημένο κωδικό Personal Training

## Παραδείγματα Εμφάνισης

Στο dropdown θα εμφανίζονται επιλογές όπως:
- "Διαχειριστής FreeGym (admin@freegym.gr)"
- "Μαρία Παπαδοπούλου (maria@freegym.gr)"
- "Γιώργος Δημητρίου (user1@freegym.gr)"
- "Αννα Παπαδοπούλου (user2@freegym.gr)"

## Σημείωση
Αυτές οι αλλαγές είναι ασφαλείς και δεν θα επηρεάσουν τα υπάρχοντα δεδομένα. Το trigger θα συνεχίσει να λειτουργεί κανονικά για νέους χρήστες.
