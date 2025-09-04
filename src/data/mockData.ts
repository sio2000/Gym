import { 
  User, 
  Lesson, 
  Room, 
  Trainer, 
  Booking, 
  Membership, 
  MembershipPackage, 
  Payment, 
  Referral,
  DashboardStats 
} from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'Ιωάννης',
    lastName: 'Δόε',
    role: 'user',
    referralCode: 'JOHN1234',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    email: 'maria.smith@example.com',
    firstName: 'Μαρία',
    lastName: 'Σμιθ',
    role: 'user',
    referralCode: 'MARIA5678',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    email: 'trainer@freegym.com',
    firstName: 'Γιώργος',
    lastName: 'Παπαδόπουλος',
    role: 'trainer',
    referralCode: 'TRAINER90',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '4',
    email: 'admin@freegym.com',
    firstName: 'Αννα',
    lastName: 'Κωνσταντίνου',
    role: 'admin',
    referralCode: 'ADMIN456',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  }
];

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Αίθουσα Καρδιο',
    capacity: 20,
    equipment: ['Treadmill', 'Elliptical', 'Rowing Machine', 'Bike'],
    floor: 1,
    isActive: true
  },
  {
    id: '2',
    name: 'Αίθουσα Δύναμης',
    capacity: 15,
    equipment: ['Dumbbells', 'Barbells', 'Weight Machines', 'Cable System'],
    floor: 1,
    isActive: true
  },
  {
    id: '3',
    name: 'Αίθουσα Γιόγκα',
    capacity: 25,
    equipment: ['Yoga Mats', 'Blocks', 'Straps', 'Bolsters'],
    floor: 2,
    isActive: true
  },
  {
    id: '4',
    name: 'Πισίνα',
    capacity: 30,
    equipment: ['Swimming Lanes', 'Pool Equipment'],
    floor: 0,
    isActive: true
  }
];

export const mockTrainers: Trainer[] = [
  {
    id: '1',
    userId: '3',
    specialties: ['Καρδιο', 'Δύναμη', 'CrossFit'],
    bio: 'Πιστοποιημένος προπονητής με 8+ χρόνια εμπειρίας',
    experience: 8,
    certifications: ['ACE Personal Trainer', 'CrossFit Level 2'],
    isActive: true
  },
  {
    id: '2',
    userId: '5',
    specialties: ['Γιόγκα', 'Πιλάτες', 'Stretching'],
    bio: 'Ειδικευμένη σε Γιόγκα και Πιλάτες με 5+ χρόνια εμπειρίας',
    experience: 5,
    certifications: ['RYT-200', 'Pilates Mat Certification'],
    isActive: true
  }
];

export const mockLessons: Lesson[] = [
  {
    id: '1',
    name: 'Pilates',
    description: 'Μαθήματα Pilates για ενδυνάμωση κορμού και ευλυγισία',
    roomId: '3',
    trainerId: '2',
    capacity: 20,
    duration: 55,
    schedule: [
      { id: '1', lessonId: '1', dayOfWeek: 1, startTime: '09:00', endTime: '09:55' },
      { id: '2', lessonId: '1', dayOfWeek: 3, startTime: '18:00', endTime: '18:55' }
    ],
    category: 'pilates',
    difficulty: 'intermediate',
    credits: 1
  },
  {
    id: '2',
    name: 'Kick Boxing',
    description: 'Δυναμικό Kick Boxing για τεχνική και φυσική κατάσταση',
    roomId: '2',
    trainerId: '1',
    capacity: 18,
    duration: 60,
    schedule: [
      { id: '3', lessonId: '2', dayOfWeek: 2, startTime: '20:00', endTime: '21:00' },
      { id: '4', lessonId: '2', dayOfWeek: 5, startTime: '19:00', endTime: '20:00' }
    ],
    category: 'kickboxing',
    difficulty: 'intermediate',
    credits: 1
  },
  {
    id: '3',
    name: 'Personal Training',
    description: 'Ατομικές προπονήσεις προσαρμοσμένες στους στόχους σου',
    roomId: '2',
    trainerId: '1',
    capacity: 1,
    duration: 50,
    schedule: [
      { id: '5', lessonId: '3', dayOfWeek: 4, startTime: '17:00', endTime: '17:50' }
    ],
    category: 'personal',
    difficulty: 'beginner',
    credits: 1
  },
  {
    id: '4',
    name: 'Ελεύθερο Gym',
    description: 'Χρήση εξοπλισμού γυμναστηρίου χωρίς προγραμματισμένο μάθημα',
    roomId: '1',
    trainerId: '1',
    capacity: 30,
    duration: 90,
    schedule: [
      { id: '6', lessonId: '4', dayOfWeek: 0, startTime: '10:00', endTime: '11:30' }
    ],
    category: 'freegym',
    difficulty: 'beginner',
    credits: 0
  }
];

export const mockMembershipPackages: MembershipPackage[] = [
  {
    id: '1',
    name: 'Ελεύθερο Γυμναστήριο',
    description: 'Απεριόριστη πρόσβαση στο γυμναστήριο',
    credits: 0,
    price: 29.99,
    validityDays: 30,
    isActive: true
  },
  {
    id: '2',
    name: 'Pilates',
    description: 'Απεριόριστα μαθήματα Pilates',
    credits: 999,
    price: 59.99,
    validityDays: 30,
    isActive: true
  },
  {
    id: '3',
    name: 'Personal Training / Kick Boxing',
    description: 'Personal Training και Kick Boxing μαθήματα',
    credits: 15,
    price: 99.99,
    validityDays: 30,
    isActive: true
  }
];

export const mockMemberships: Membership[] = [
  {
    id: '1',
    userId: '1',
    packageId: '2',
    status: 'active',
    credits: 15,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-02-01T00:00:00Z',
    autoRenew: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    packageId: '1',
    status: 'active',
    credits: 8,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-02-15T00:00:00Z',
    autoRenew: false,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '1',
    lessonId: '1',
    date: '2024-01-22T09:00:00Z',
    status: 'confirmed',
    qrCode: 'QR123456789',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    lessonId: '3',
    date: '2024-01-21T10:00:00Z',
    status: 'confirmed',
    qrCode: 'QR987654321',
    createdAt: '2024-01-19T15:30:00Z',
    updatedAt: '2024-01-19T15:30:00Z'
  },
  {
    id: '3',
    userId: '2',
    lessonId: '2',
    date: '2024-01-23T07:00:00Z',
    status: 'confirmed',
    qrCode: 'QR456789123',
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    userId: '1',
    membershipId: '1',
    amount: 89.99,
    status: 'approved',
    paymentMethod: 'card',
    transactionId: 'TXN123456',
    approvedBy: '4',
    approvedAt: '2024-01-01T10:00:00Z',
    expiresAt: '2024-01-31T23:59:59Z',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    membershipId: '2',
    amount: 49.99,
    status: 'approved',
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN789012',
    approvedBy: '4',
    approvedAt: '2024-01-15T14:00:00Z',
    expiresAt: '2024-02-14T23:59:59Z',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
  }
];

export const mockReferrals: Referral[] = [
  {
    id: '1',
    referrerId: '1',
    referredId: '2',
    status: 'completed',
    rewardCredits: 5,
    completedAt: '2024-01-20T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalBookings: 3,
  activeMemberships: 2,
  availableCredits: 23,
  upcomingLessons: 2,
  referralRewards: 5
};

// Helper function to get lessons for a specific date
export function getLessonsForDate(date: Date): Lesson[] {
  const dayOfWeek = date.getDay();
  return mockLessons.filter(lesson => 
    lesson.schedule.some(schedule => schedule.dayOfWeek === dayOfWeek)
  );
}

// Helper function to get user's active membership
export function getUserActiveMembership(userId: string): Membership | undefined {
  return mockMemberships.find(membership => 
    membership.userId === userId && membership.status === 'active'
  );
}

// Helper function to get user's bookings
export function getUserBookings(userId: string): Booking[] {
  return mockBookings.filter(booking => booking.userId === userId);
}

// Helper function to check if user can book a lesson
export function canUserBookLesson(userId: string, lessonId: string, date: Date): boolean {
  const membership = getUserActiveMembership(userId);
  if (!membership || membership.credits <= 0) return false;
  
  const existingBooking = mockBookings.find(booking => 
    booking.userId === userId && 
    booking.lessonId === lessonId && 
    new Date(booking.date).toDateString() === date.toDateString()
  );
  
  return !existingBooking;
}
