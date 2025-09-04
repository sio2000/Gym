# Δημιουργία .env File

## Βήμα 1: Δημιούργησε το .env file

Δημιούργησε ένα αρχείο με όνομα `.env` στο root directory του project (στον ίδιο φάκελο με το `package.json`) με το παρακάτω περιεχόμενο:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://izltxhsnpvzmcibnjhxq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bHR4aHNucHZ6bWNpYm5qaHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzUzMzksImV4cCI6MjA3MjM1MTMzOX0.DRjgBGuqsp2eZilr6r4nUlz3AP8R6yvvNRcXhg2wXOk
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bHR4aHNucHZ6bWNpYm5qaHhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc3NTMzOSwiZXhwIjoyMDcyMzUxMzM5fQ.CFZ5mG7uakyqqPjR-_dyz-yvz4fVcwWkKVP-Vc7F5V4
```

## Βήμα 2: Restart το Development Server

Μετά τη δημιουργία του `.env` file:

1. **Σταμάτα το development server** (Ctrl+C στο terminal)
2. **Ξεκίνα το ξανά:**
   ```bash
   npm run dev
   ```

## Βήμα 3: Δοκιμή

1. Πήγαινε στο Admin Panel
2. Πάτα "Test DB" - θα πρέπει να δεις "Admin database connection successful!"
3. Πάτα "Ανανέωση Χρηστών"
4. Πάτα "Δημιουργία Κωδικού" για να ανοίξει το modal
5. Δες το dropdown "Επιλογή Χρήστη" - θα πρέπει να εμφανίζονται όλοι οι χρήστες

## Σημείωση

Το service key έχει πλήρη πρόσβαση στη βάση δεδομένων και bypass τα RLS policies, οπότε ο admin θα μπορεί να δει όλους τους χρήστες.
