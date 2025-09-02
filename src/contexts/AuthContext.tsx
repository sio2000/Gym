import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, UserProfile, AuthContextType } from '@/types';
import toast from 'react-hot-toast';
import { apiFetch } from '@/config/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('freegym_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('freegym_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const res = await apiFetch<{ token: string; user: User }>(
        '/auth/login',
        { method: 'POST', body: credentials }
      );

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Αποτυχία σύνδεσης');
      }

      const { token, user: loggedInUser } = res.data;
      setUser(loggedInUser);
      localStorage.setItem('freegym_user', JSON.stringify(loggedInUser));
      localStorage.setItem('freegym_token', token);

      toast.success(`Καλώς ήρθες, ${loggedInUser.firstName}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Σφάλμα κατά τη σύνδεση';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const { email, password, firstName, lastName, phone, referralCode, language } = data;
      const payload: any = { email, password, firstName, lastName };
      if (phone && phone.trim()) payload.phone = phone.trim();
      if (referralCode && referralCode.trim()) payload.referralCode = referralCode.trim();
      if (language) payload.language = language;

      const res = await apiFetch<{ token: string; user: User }>(
        '/auth/register',
        { method: 'POST', body: payload }
      );

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Αποτυχία εγγραφής');
      }

      const { token, user: newUser } = res.data;
      setUser(newUser);
      localStorage.setItem('freegym_user', JSON.stringify(newUser));
      localStorage.setItem('freegym_token', token);

      toast.success('Εγγραφή ολοκληρώθηκε επιτυχώς!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Σφάλμα κατά την εγγραφή';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('freegym_user');
    localStorage.removeItem('freegym_token');
    toast.success('Αποσυνδέθηκες επιτυχώς');
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (user) {
        const updatedUser = { ...user };
        // In real app, update user profile in database
        setUser(updatedUser);
        localStorage.setItem('freegym_user', JSON.stringify(updatedUser));
        
        toast.success('Το προφίλ ενημερώθηκε επιτυχώς');
      }
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση του προφίλ');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
