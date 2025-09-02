import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, UserProfile, AuthContextType } from '@/types';
import toast from 'react-hot-toast';
import { supabase } from '@/config/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        localStorage.removeItem('freegym_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get user from Supabase Auth (email + role from metadata)
      const { data: authUser } = await supabase.auth.getUser();
      
      const userData: User = {
        id: userId,
        email: authUser.user?.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: (authUser.user?.user_metadata as any)?.role || 'user',
        referralCode: '', // Not in current schema
        language: 'el', // Default language
        createdAt: profile.created_at || new Date().toISOString(),
        updatedAt: profile.updated_at || new Date().toISOString()
      };

      setUser(userData);
      localStorage.setItem('freegym_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        toast.success(`Καλώς ήρθες, ${user?.firstName || 'Χρήστη'}!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Σφάλμα κατά τη σύνδεση';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const waitForProfile = async (userId: string, timeoutMs = 15000, intervalMs = 600): Promise<boolean> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) return true;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const { email, password, firstName, lastName, phone, referralCode, language } = data;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone?.trim() || null
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.user.email_confirmed_at === null) {
          toast.success('Εγγραφή ολοκληρώθηκε! Ελέγξτε το email σας για επιβεβαίωση.');
          return;
        }

        // Περιμένουμε να δημιουργηθεί το profile από το trigger
        const profileReady = await waitForProfile(authData.user.id);

        // Αν δεν προλάβει, κάνουμε ένα ασφαλές insert μόνο με τα βασικά πεδία
        if (!profileReady) {
          const { error: insertFallbackError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: authData.user.id,
              first_name: firstName || '',
              last_name: lastName || '',
              phone: phone?.trim() || null
            });

          if (insertFallbackError) {
            console.error('Profile insert fallback error:', insertFallbackError);
          }
        }

        // Φόρτωση προφίλ
        await loadUserProfile(authData.user.id);
        toast.success('Εγγραφή ολοκληρώθηκε επιτυχώς!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Σφάλμα κατά την εγγραφή';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('freegym_user');
      toast.success('Αποσυνδέθηκες επιτυχώς');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if logout fails
      setUser(null);
      localStorage.removeItem('freegym_user');
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) throw new Error('Δεν είσαι συνδεδεμένος');
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Reload user profile
      await loadUserProfile(user.id);
      toast.success('Το προφίλ ενημερώθηκε επιτυχώς');
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
