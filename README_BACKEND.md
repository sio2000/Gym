# FreeGym MVP Backend

Το backend του FreeGym MVP είναι ένας πλήρως λειτουργικός Express.js server με PostgreSQL βάση δεδομένων που παρέχει όλα τα απαραίτητα API endpoints για την εφαρμογή.

## 🚀 Τεχνολογίες

- **Runtime**: Node.js με TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT tokens με bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Database Client**: pg (node-postgres)

## 📁 Δομή Project

```
src/
├── config/
│   └── database.ts          # Database connection configuration
├── controllers/
│   ├── authController.ts     # Authentication & user management
│   ├── lessonController.ts   # Lesson management
│   ├── bookingController.ts  # Booking management
│   ├── membershipController.ts # Membership & payment management
│   ├── referralController.ts # Referral system
│   └── dashboardController.ts # Dashboard statistics
├── middleware/
│   ├── auth.ts              # Authentication & authorization middleware
│   └── validation.ts        # Input validation middleware
├── routes/
│   ├── index.ts             # Main router
│   ├── authRoutes.ts        # Authentication routes
│   ├── lessonRoutes.ts      # Lesson routes
│   ├── bookingRoutes.ts     # Booking routes
│   ├── membershipRoutes.ts  # Membership routes
│   ├── referralRoutes.ts    # Referral routes
│   └── dashboardRoutes.ts   # Dashboard routes
├── utils/
│   └── jwt.ts               # JWT utility functions
└── server.ts                # Main server file

database/
├── schema.sql               # Database schema
└── sample_data.sql          # Sample data

scripts/
├── setupDatabase.ts         # Database setup script
└── migrateDatabase.ts       # Database migration script
```

## 🗄️ Database Schema

### Core Tables

- **users** - User authentication and basic info
- **user_profiles** - Extended user information
- **lessons** - Gym lessons and classes
- **lesson_categories** - Lesson categories (Yoga, Pilates, etc.)
- **rooms** - Gym rooms and spaces
- **trainers** - Trainer information
- **bookings** - Lesson reservations
- **qr_codes** - QR codes for bookings
- **memberships** - User subscription packages
- **membership_packages** - Available packages
- **payments** - Payment records
- **referrals** - Referral system
- **audit_logs** - System audit trail

### Key Features

- **UUID primary keys** for security
- **Automatic timestamps** (created_at, updated_at)
- **Foreign key constraints** for data integrity
- **Indexes** for performance optimization
- **Triggers** for automatic updates
- **Stored functions** for complex operations

## 🔐 Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT authentication** with configurable expiration
- **Role-based access control** (user, trainer, admin)
- **Input validation** with express-validator
- **SQL injection prevention** with parameterized queries
- **CORS protection** with configurable origins
- **Helmet security headers**
- **Rate limiting** (basic implementation)

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /password` - Change password
- `POST /logout` - User logout

### Lessons (`/api/lessons`)
- `GET /` - Get all lessons with filters
- `GET /:id` - Get lesson by ID
- `GET /date/:date` - Get lessons for specific date
- `GET /categories` - Get lesson categories
- `GET /trainers` - Get trainers
- `GET /rooms` - Get rooms

### Bookings (`/api/bookings`)
- `POST /` - Create new booking
- `GET /` - Get user's bookings
- `GET /stats` - Get booking statistics
- `DELETE /:id` - Cancel booking
- `POST /checkin` - Check-in with QR code

### Memberships (`/api/memberships`)
- `GET /packages` - Get available packages
- `GET /current` - Get user's current membership
- `POST /purchase` - Purchase membership package
- `GET /payments` - Get payment history
- `GET /stats` - Get membership statistics
- `PUT /payments/:id/approve` - Approve/reject payment (admin)
- `GET /payments/pending` - Get pending payments (admin)

### Referrals (`/api/referrals`)
- `GET /validate/:code` - Validate referral code
- `GET /info` - Get user's referral info
- `GET /history` - Get referral history
- `GET /` - Get all referrals (admin)
- `GET /stats` - Get referral statistics (admin)
- `PUT /:id/complete` - Complete referral (admin)

### Dashboard (`/api/dashboard`)
- `GET /user` - User dashboard statistics
- `GET /admin` - Admin dashboard statistics
- `GET /trainer` - Trainer dashboard statistics

## 🚀 Εγκατάσταση & Εκκίνηση

### 1. Εγκατάσταση Dependencies

```bash
npm install
```

### 2. Ρύθμιση Environment Variables

Δημιουργήστε το αρχείο `env.config` με τα απαραίτητα credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173
```

### 3. Ρύθμιση Βάσης Δεδομένων

```bash
# Εκτέλεση αρχικής ρύθμισης
npm run db:setup

# Εκτέλεση migrations
npm run db:migrate
```

### 4. Εκκίνηση Server

```bash
# Development mode με auto-reload
npm run server:dev

# Production mode
npm run server
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Sample API Calls

#### User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

## 🔑 Sample Accounts

Μετά την εκτέλεση του `db:setup`, θα έχετε τα εξής sample accounts:

- **Admin**: `admin@freegym.gr` / `password123`
- **Trainer**: `maria@freegym.gr` / `password123`
- **User**: `user1@freegym.gr` / `password123`

## 📊 Database Functions

### Built-in Functions

- `check_booking_availability()` - Check if lesson can be booked
- `create_booking_with_qr()` - Create booking with QR code
- `process_referral_completion()` - Process referral rewards
- `generate_referral_code()` - Generate unique referral codes

## 🔒 Business Logic

### Credit System
- Κάθε μάθημα κοστίζει 1 πιστώση
- Πιστώσεις προστίθενται με συνδρομές
- Πιστώσεις επιστρέφονται με ακύρωση κράτησης
- Bonus πιστώσεις από παραπομπές (5 πιστώσεις)

### Booking Rules
- Κράτηση μόνο για μελλοντικές ημερομηνίες
- Έλεγχος διαθεσιμότητας πιστώσεων
- Έλεγχος χωρητικότητας αίθουσας
- Cancellation policy (48h πριν το μάθημα)

### Payment Workflow
- Δημιουργία πληρωμής με pending status
- Admin έγκριση/απόρριψη
- 48ωρη λήξη pending πληρωμών
- Αυτόματη ενεργοποίηση μετά έγκριση

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use production PostgreSQL instance
3. **SSL**: Enable HTTPS with proper certificates
4. **Logging**: Implement proper logging system
5. **Monitoring**: Add health checks and monitoring
6. **Backup**: Regular database backups
7. **Rate Limiting**: Implement production-grade rate limiting

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "run", "server"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

Για ερωτήσεις ή προβλήματα, παρακαλώ δημιουργήστε ένα issue στο repository.

---

**FreeGym MVP Backend** - Πλήρως λειτουργικό backend για την εφαρμογή διαχείρισης γυμναστηρίου 🏋️‍♂️
