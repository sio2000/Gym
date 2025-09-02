# FreeGym MVP 🏋️‍♂️

Μια σύγχρονη εφαρμογή διαχείρισης γυμναστηρίου που επιτρέπει στους χρήστες να κάνουν κρατήσεις για μαθήματα, να διαχειρίζονται τις συνδρομές τους και να χρησιμοποιούν σύστημα παραπομπών.

## ✨ Features

### 🔐 Authentication System
- Σύνδεση/Εγγραφή χρηστών
- Role-based access control (User, Trainer, Admin)
- Protected routes και session management

### 📅 Lesson Booking System
- Διαδραστικό ημερολόγιο με προβολή μαθημάτων
- Κράτηση/ακύρωση μαθημάτων
- Έλεγχος διαθεσιμότητας πιστώσεων
- Προβολή προγράμματος μαθημάτων ανά ημέρα

### 💳 Membership Management
- Διαχείριση συνδρομών και πιστώσεων
- Προβολή διαθέσιμων πακέτων
- Ιστορικό πληρωμών και ανανεώσεων

### 📱 QR Code System
- Δημιουργία μοναδικών QR codes για κάθε κράτηση
- Check-in/check-out στο γυμναστήριο
- Προβολή και διαχείριση QR codes

### 👥 Referral System
- Μοναδικοί κωδικοί παραπομπής
- Ανταμοιβές για παραπομπές (5 πιστώσεις)
- Ιστορικό παραπομπών και rewards

### 📊 Dashboard & Analytics
- Επισκόπηση στατιστικών
- Επερχόμενες κρατήσεις
- Διαθέσιμες πιστώσεις
- Γρήγορες ενέργειες

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: Date-fns
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── layout/         # Layout and navigation
├── contexts/           # React contexts
├── data/              # Mock data and utilities
├── pages/             # Page components
├── types/             # TypeScript interfaces
├── utils/             # Utility functions
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm ή yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd freegym-mvp
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open browser**
```
http://localhost:5173
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Demo Accounts

### User Account
- **Email**: john.doe@example.com
- **Password**: password123

### Trainer Account
- **Email**: trainer@freegym.com
- **Password**: password123

### Admin Account
- **Email**: admin@freegym.com
- **Password**: password123

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#22C55E)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Components
- Consistent button styles (primary, secondary, success, warning, error)
- Card layouts with shadows and borders
- Form inputs with validation states
- Badge components for status indicators
- Responsive grid system

## 📱 Responsive Design

- Mobile-first approach
- Responsive sidebar navigation
- Adaptive calendar layout
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔒 Security Features

- Protected routes με authentication
- Role-based access control
- Input validation και sanitization
- Secure password handling (mock implementation)

## 🚧 Current Status

### ✅ Completed
- Authentication system
- User dashboard
- Lesson booking system
- Calendar interface
- Responsive layout
- Mock data integration
- TypeScript types
- Component library

### 🚧 In Progress
- QR Code generation
- Membership management
- Referral system
- Profile management

### 📋 Planned
- Backend integration
- Real-time updates
- Push notifications
- Advanced analytics
- Payment gateway integration

## 🎯 Business Logic

### Credit System
- Κάθε μάθημα κοστίζει 1 πιστώση
- Πιστώσεις προστίθενται με συνδρομές
- Bonus πιστώσεις από παραπομπές

### Booking Rules
- Κράτηση μόνο για μελλοντικές ημερομηνίες
- Έλεγχος διαθεσιμότητας πιστώσεων
- Cancellation policy (48h πριν το μάθημα)

### Referral Rewards
- 5 πιστώσεις για κάθε επιτυχημένη παραπομπή
- Μοναδικοί κωδικοί ανά χρήστη
- Tracking system για παραπομπές

## 🌐 Internationalization

- **Primary Language**: Greek (Ελληνικά)
- **Secondary Language**: English (for language switcher)
- **Date Formatting**: Greek locale
- **Currency**: EUR (€)

## 📊 Performance

- Lazy loading για σελίδες
- Optimized bundle size
- Efficient re-renders
- Responsive interactions
- Smooth animations

## 🧪 Testing Strategy

- Component unit tests
- Integration tests για flows
- E2E tests για critical paths
- Accessibility testing

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Production Files
- Static files in `dist/` folder
- Optimized assets
- Environment configuration
- Bundle analysis

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation

## 🔮 Future Enhancements

### Phase 2
- Push notifications
- Advanced analytics dashboard
- Mobile app (React Native)
- Payment gateway integration
- Social features

### Phase 3
- AI-powered recommendations
- Wearable device integration
- Community features
- Advanced reporting
- Multi-location support

---

**FreeGym MVP** - Διαχείριση Γυμναστηρίου της Επόμενης Γενιάς 🚀
