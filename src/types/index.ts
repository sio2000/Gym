export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  referralCode: string;
  phone?: string;
  avatar?: string;
  language: 'el' | 'en';
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'trainer' | 'admin';

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  avatar?: string;
  language: 'el' | 'en';
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  language: 'el' | 'en';
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  roomId: string;
  trainerId: string;
  capacity: number;
  duration: number; // σε λεπτά
  schedule: LessonSchedule[];
  category: LessonCategory;
  difficulty: LessonDifficulty;
  credits: number;
  isActive: boolean;
  maxParticipants: number;
}

export interface LessonSchedule {
  id: string;
  lessonId: string;
  dayOfWeek: number; // 1-5 (Δευτέρα-Παρασκευή)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export type LessonCategory = 'pilates' | 'personal_training_a' | 'personal_training_b' | 'kick_boxing' | 'free_gym';
export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  floor: number;
  isActive: boolean;
  lessonType: LessonCategory; // Εξειδικευμένος τύπος μαθήματος
}

export interface Trainer {
  id: string;
  userId: string;
  specialties: LessonCategory[];
  bio: string;
  experience: number; // σε χρόνια
  certifications: string[];
  isActive: boolean;
  hourlyRate: number;
}

export interface Booking {
  id: string;
  userId: string;
  lessonId: string;
  date: string;
  status: BookingStatus;
  qrCode: string;
  checkInTime?: string;
  checkOutTime?: string;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'pending';

export interface Membership {
  id: string;
  userId: string;
  packageId: string;
  status: MembershipStatus;
  credits: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  frequency: '1x' | '2x' | '3x'; // φορές ανά εβδομάδα
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended';

export interface MembershipPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  validityDays: number;
  frequency: '1x' | '2x' | '3x';
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  membershipId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  approvedBy?: string;
  approvedAt?: string;
  expiresAt: string; // 48ωρη περίοδος
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PaymentMethod = 'card' | 'bank_transfer' | 'cash';

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  status: ReferralStatus;
  rewardCredits: number;
  completedAt?: string;
  createdAt: string;
}

export type ReferralStatus = 'pending' | 'completed' | 'expired';

export interface QRCode {
  id: string;
  bookingId: string;
  code: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  activeMemberships: number;
  availableCredits: number;
  upcomingLessons: number;
  referralRewards: number;
  totalUsers: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface LessonAvailability {
  lessonId: string;
  date: string;
  availableSpots: number;
  isBooked: boolean;
  canBook: boolean;
  roomCapacity: number;
  currentBookings: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  referralCode?: string;
  language?: 'el' | 'en';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: 'el' | 'en';
  setLanguage: (lang: 'el' | 'en') => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// New interfaces for specialized requirements
export interface BookingRestrictions {
  isAugustClosed: boolean;
  workingDays: number[]; // [1,2,3,4,5] for Monday-Friday
  maxBookingsPerWeek: number;
  advanceBookingDays: number;
}

export interface TrainerSchedule {
  trainerId: string;
  weekStart: string;
  lessons: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    lessonType: LessonCategory;
    roomId: string;
    maxParticipants: number;
  }[];
}

export interface AdminDashboard {
  totalUsers: number;
  totalRevenue: number;
  pendingPayments: number;
  weeklyBookings: number;
  monthlyStats: {
    users: number;
    revenue: number;
    bookings: number;
  };
}

export interface MultilingualText {
  el: string;
  en: string;
}
