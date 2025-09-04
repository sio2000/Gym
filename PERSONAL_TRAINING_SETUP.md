# Personal Training Schedule System

## Περιγραφή
Αυτό το σύστημα επιτρέπει στον admin να δημιουργεί προσωποποιημένα μηνιαία προγράμματα Personal Training για χρήστες που έχουν ειδικούς κωδικούς πρόσβασης.

## Δομή Βάσης Δεδομένων

### 1. Personal Training Codes Table
```sql
CREATE TABLE personal_training_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('personal', 'kickboxing', 'combo')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    used_by UUID REFERENCES users(id),
    used_at TIMESTAMP WITH TIME ZONE
);
```

### 2. Personal Training Schedules Table
```sql
CREATE TABLE personal_training_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    schedule_data JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    decline_reason TEXT
);
```

## Χρήση του Συστήματος

### Για τον Admin:

1. **Δημιουργία Κωδικού Πρόσβασης:**
   - Πηγαίνετε στο Admin Panel → "Personal Training Πρόγραμμα"
   - Κάντε κλικ στο "Δημιουργία Κωδικού"
   - Εισάγετε κωδικό (π.χ. PERSONAL2024)
   - Επιλέξτε τύπο πακέτου (Personal Training, Kick Boxing, Combo)
   - Κάντε κλικ "Δημιουργία"

2. **Δημιουργία Προγράμματος:**
   - Επιλέξτε χρήστη από τη λίστα (χρήστες με κωδικούς Personal Training)
   - Κάντε κλικ "Επεξεργασία"
   - Προσθέστε σεσίες με:
     - Ημέρα εβδομάδας
     - Ώρα έναρξης/λήξης
     - Τύπο προπόνησης
     - Προπονητή
     - Σημειώσεις
   - Κάντε κλικ "Αποθήκευση"

### Για τον Χρήστη:

1. **Πρόσβαση στο Πρόγραμμα:**
   - Συνδεθείτε στο σύστημα
   - Πηγαίνετε στο "Personal Training" από το μενού
   - Θα εμφανιστεί το προσωποποιημένο πρόγραμμα

2. **Αποδοχή/Απόρριψη:**
   - Ελέγξτε το πρόγραμμα
   - Κάντε κλικ "Αποδοχή" για να το αποδεχτείτε
   - Ή κάντε κλικ "Απόρριψη" για να το απορρίψετε

3. **Μετά την Απόρριψη:**
   - Εμφανίζεται μήνυμα: "Παρακαλώ περάστε από το γυμναστήριο για να συζητήσουμε τις ώρες που σας βολεύουν."

## Routes

- `/personal-training-schedule` - Σελίδα προγράμματος για χρήστες
- `/personal-training` - Δημόσια σελίδα Personal Training (πρόσβαση με κωδικό)

## Features

- ✅ Δημιουργία κωδικών πρόσβασης από admin
- ✅ Προσωποποιημένα μηνιαία προγράμματα
- ✅ Accept/Decline functionality
- ✅ Status tracking (pending, accepted, declined)
- ✅ Responsive UI
- ✅ Mock data για testing

## Testing

1. Συνδεθείτε ως admin
2. Δημιουργήστε κωδικό Personal Training
3. Δημιουργήστε πρόγραμμα για χρήστη
4. Συνδεθείτε ως χρήστης
5. Ελέγξτε το πρόγραμμα και κάντε Accept/Decline

## Σημειώσεις

- Το σύστημα χρησιμοποιεί mock data για testing
- Σε production, θα χρειαστεί να συνδεθείτε με πραγματική βάση δεδομένων
- Οι κωδικοί πρόσβασης είναι hardcoded στο Membership page (PERSONAL2024)
