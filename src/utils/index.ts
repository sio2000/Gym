import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time.substring(0, 5); // HH:mm format
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  return days[dayOfWeek];
}

export function getShortDayName(dayOfWeek: number): string {
  const days = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];
  return days[dayOfWeek];
}

export function getLessonCategoryName(category: string): string {
  const categories: Record<string, string> = {
    pilates: 'Πιλάτες',
    kickboxing: 'Kick Boxing',
    personal: 'Personal Training',
    freegym: 'Ελεύθερο Gym',
    other: 'Άλλο'
  };
  return categories[category] || category;
}

export function getLessonDifficultyName(difficulty: string): string {
  const difficulties: Record<string, string> = {
    beginner: 'Αρχάριος',
    intermediate: 'Μέσος',
    advanced: 'Προχωρημένος'
  };
  return difficulties[difficulty] || difficulty;
}

export function getBookingStatusName(status: string): string {
  const statuses: Record<string, string> = {
    confirmed: 'Επιβεβαιωμένη',
    cancelled: 'Ακυρωμένη',
    completed: 'Ολοκληρωμένη',
    'no-show': 'Απουσία'
  };
  return statuses[status] || status;
}

export function getMembershipStatusName(status: string): string {
  const statuses: Record<string, string> = {
    active: 'Ενεργή',
    expired: 'Ληγμένη',
    cancelled: 'Ακυρωμένη',
    pending: 'Σε εκκρεμότητα'
  };
  return statuses[status] || status;
}

export function getPaymentStatusName(status: string): string {
  const statuses: Record<string, string> = {
    pending: 'Σε εκκρεμότητα',
    approved: 'Εγκεκριμένη',
    rejected: 'Απορριφθείσα',
    expired: 'Ληγμένη'
  };
  return statuses[status] || status;
}

export function getReferralStatusName(status: string): string {
  const statuses: Record<string, string> = {
    pending: 'Σε εκκρεμότητα',
    completed: 'Ολοκληρωμένη',
    expired: 'Ληγμένη'
  };
  return statuses[status] || status;
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // Τουλάχιστον 8 χαρακτήρες, 1 κεφαλαίο, 1 πεζό, 1 αριθμό
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function isValidPhone(phone: string): boolean {
  // Ελληνικό τηλέφωνο: +30, 69, 70, 21, 22, 23, 24, 25, 26, 27, 28, 29
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'μόλις τώρα';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} λεπτό${minutes > 1 ? 'ά' : ''} πριν`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ώρα${hours > 1 ? 'ες' : ''} πριν`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} μέρα${days > 1 ? 'ες' : ''} πριν`;
  } else {
    return formatDate(date);
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
