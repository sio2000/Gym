# Οδηγίες για Service Key

## Πρόβλημα
Το Admin Panel δεν μπορεί να διαβάσει όλους τους χρήστες λόγω RLS (Row Level Security) policies. Χρειάζεται service key για admin operations.

## Λύση

### Βήμα 1: Λήψη Service Key από Supabase
1. Πήγαινε στο Supabase Dashboard
2. Πήγαινε στο Settings → API
3. Αντιγράψε το **service_role** key (όχι το anon key)

### Βήμα 2: Προσθήκη στο Environment
Πρόσθεσε το service key στο `.env` file:

```env
VITE_SUPABASE_URL=https://izltxhsnpvzmcibnjhxq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # <-- Πρόσθεσε αυτό
```

### Βήμα 3: Εναλλακτική Λύση - Απενεργοποίηση RLS
Αν δεν θες να χρησιμοποιήσεις service key, μπορείς να απενεργοποιήσεις προσωρινά το RLS:

Εκτέλεσε στο Supabase SQL Editor:
```sql
-- Απενεργοποίηση RLS προσωρινά
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

### Βήμα 4: Επαναφορά RLS (μετά τη δοκιμή)
```sql
-- Ενεργοποίηση RLS ξανά
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

## Σημείωση Ασφαλείας
Το service key έχει πλήρη πρόσβαση στη βάση δεδομένων. Χρησιμοποίησε το μόνο για admin operations και μην το κάνεις public.

## Δοκιμή
Μετά την προσθήκη του service key:
1. Restart το development server
2. Πάτα "Test DB" στο Admin Panel
3. Πάτα "Ανανέωση Χρηστών"
4. Δες αν τώρα φορτώνονται όλοι οι χρήστες
