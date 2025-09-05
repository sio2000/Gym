import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, UserProfile, AuthContextType } from '@/types';
import toast from 'react-hot-toast';
import { supabase } from '@/config/supabase';
import { cleanupSupabaseAdmin } from '@/config/supabaseAdmin';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Utility function to clear all auth data
  const clearAllAuthData = () => {
    setUser(null);
    localStorage.removeItem('freegym_user');
    localStorage.removeItem('sb-freegym-auth');
    localStorage.removeItem('sb-freegym-admin');
    sessionStorage.clear();
  };

  useEffect(() => {
    console.log('[Auth] ===== AUTH CONTEXT USEEFFECT STARTED =====');
    console.log('[Auth] isInitialized:', isInitialized);
    
    // Prevent multiple initializations
    if (isInitialized) {
      console.log('[Auth] Already initialized, skipping...');
      return;
    }
    
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[Auth] Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('[Auth] Session query result - session:', session?.user?.email, 'error:', error);
        
        if (error) {
          console.error('[Auth] Session error:', error);
          if (mounted) {
            console.log('[Auth] Clearing auth data due to session error');
            clearAllAuthData();
          }
          return;
        }
        
        console.log('[Auth] Initial session:', session?.user?.email);
        console.log('[Auth] User ID from session:', session?.user?.id);
        
        if (mounted && session?.user) {
          console.log('[Auth] Session found, loading user profile...');
          await loadUserProfile(session.user.id);
        } else if (mounted) {
          console.log('[Auth] No session found, setting loading to false and marking as initialized');
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('[Auth] Error getting initial session:', error);
        console.error('[Auth] Error stack:', error instanceof Error ? error.stack : 'No stack');
        if (mounted) {
          console.log('[Auth] Clearing auth data due to exception');
          clearAllAuthData();
          console.log('[Auth] Setting isLoading to false and marking as initialized after error');
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    console.log('[Auth] Calling getInitialSession...');
    getInitialSession();

    // Listen for auth changes
    console.log('[Auth] Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state change:', event, session?.user?.email);
      console.log('[Auth] Mounted:', mounted);
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Auth] SIGNED_IN event, loading user profile...');
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] SIGNED_OUT event, clearing user data');
        setUser(null);
        localStorage.removeItem('freegym_user');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('[Auth] TOKEN_REFRESHED event, loading user profile...');
        // Handle token refresh to maintain session
        await loadUserProfile(session.user.id);
      }
    });

    return () => {
      console.log('[Auth] Cleaning up auth context useEffect');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('[Auth] ===== LOADING USER PROFILE =====');
      console.log('[Auth] User ID:', userId);
      console.log('[Auth] Supabase client:', supabase);
      
      console.log('[Auth] Starting profile query...');
      
      // Add timeout to prevent hanging
      const profileQueryPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 5000)
      );
      
      const { data: profile, error } = await Promise.race([
        profileQueryPromise,
        timeoutPromise
      ]) as any;

      console.log('[Auth] Profile query completed');
      console.log('[Auth] Profile data:', profile);
      console.log('[Auth] Profile error:', error);

      if (error) {
        console.error('[Auth] Profile query error:', error);
        console.error('[Auth] Error code:', error.code);
        console.error('[Auth] Error message:', error.message);
        console.error('[Auth] Error details:', error.details);
        console.error('[Auth] Error hint:', error.hint);
        throw error;
      }

      console.log('[Auth] Profile data from database:', JSON.stringify(profile, null, 2));
      console.log('[Auth] Profile role from database:', profile.role);
      console.log('[Auth] Profile dob:', profile.dob);
      console.log('[Auth] Profile address:', profile.address);
      console.log('[Auth] Profile emergency_contact:', profile.emergency_contact);
      console.log('[Auth] Profile profile_photo:', profile.profile_photo);
      console.log('[Auth] Profile profile_photo_locked:', profile.profile_photo_locked);
      console.log('[Auth] Profile dob_locked:', profile.dob_locked);

      console.log('[Auth] Getting auth user data...');
      // Get user from Supabase Auth (email only)
      const { data: authUser } = await supabase.auth.getUser();
      console.log('[Auth] Auth user data:', authUser.user?.email);
      console.log('[Auth] Auth user metadata:', authUser.user?.user_metadata);
      
      // Determine role: prefer database role, fallback to metadata, then default to 'user'
      // TEMPORARY FIX: Force admin role for admin@freegym.gr
      let userRole = profile.role || (authUser.user?.user_metadata as any)?.role || 'user';
      
      // Force admin role for admin@freegym.gr if database shows 'user'
      if (authUser.user?.email === 'admin@freegym.gr' && userRole === 'user') {
        console.warn('[Auth] TEMPORARY FIX: Forcing admin role for admin@freegym.gr');
        userRole = 'admin';
      }
      
      console.log('[Auth] Final user role determined:', userRole);
      
      console.log('[Auth] Creating user data object...');
      const userData: User = {
        id: userId,
        email: authUser.user?.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: userRole,
        referralCode: profile.referral_code || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
        language: profile.language || 'el',
        createdAt: profile.created_at || new Date().toISOString(),
        updatedAt: profile.updated_at || new Date().toISOString(),
        // New profile fields
        dob: profile.dob || '',
        address: profile.address || '',
        emergency_contact: profile.emergency_contact || '',
        profile_photo: profile.profile_photo || '',
        profile_photo_locked: profile.profile_photo_locked || false,
        dob_locked: profile.dob_locked || false
      };

      console.log('[Auth] Final user data:', JSON.stringify(userData, null, 2));
      console.log('[Auth] Setting user state...');
      setUser(userData);
      console.log('[Auth] Saving to localStorage...');
      localStorage.setItem('freegym_user', JSON.stringify(userData));
      console.log('[Auth] ===== USER PROFILE LOADED SUCCESSFULLY =====');
    } catch (error) {
      console.error('[Auth] ===== ERROR LOADING USER PROFILE =====');
      console.error('[Auth] Error details:', error);
      console.error('[Auth] Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      console.log('[Auth] Attempting to create fallback user...');
      // Create a fallback user with basic info to prevent infinite loading
      try {
        // Add timeout to fallback user creation as well
        const fallbackPromise = supabase.auth.getUser();
        const fallbackTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fallback user creation timeout')), 3000)
        );
        
        const { data: authUser } = await Promise.race([
          fallbackPromise,
          fallbackTimeoutPromise
        ]) as any;
        
        console.log('[Auth] Fallback auth user data:', authUser.user?.email);
        
        if (authUser.user) {
          console.log('[Auth] Creating fallback user due to profile loading error');
          const fallbackUser: User = {
            id: userId,
            email: authUser.user.email || '',
            firstName: '',
            lastName: '',
            role: 'user',
            referralCode: '',
            language: 'el',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          console.log('[Auth] Fallback user data:', fallbackUser);
          setUser(fallbackUser);
          localStorage.setItem('freegym_user', JSON.stringify(fallbackUser));
          console.log('[Auth] ===== FALLBACK USER CREATED =====');
        } else {
          console.log('[Auth] No auth user available, setting user to null');
          setUser(null);
        }
      } catch (fallbackError) {
        console.error('[Auth] Error creating fallback user:', fallbackError);
        // Create a minimal fallback user even if auth fails
        const minimalUser: User = {
          id: userId,
          email: 'unknown@example.com',
          firstName: '',
          lastName: '',
          role: 'user',
          referralCode: '',
          language: 'el',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('[Auth] Creating minimal fallback user due to auth error');
        setUser(minimalUser);
        localStorage.setItem('freegym_user', JSON.stringify(minimalUser));
      }
      
      // Mark as initialized immediately after fallback user creation
      console.log('[Auth] Marking as initialized after fallback user creation');
      setIsLoading(false);
      setIsInitialized(true);
      console.log('[Auth] ===== LOADUSERPROFILE COMPLETED =====');
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    console.log('[Auth] ===== LOGIN STARTED =====');
    console.log('[Auth] Login attempt for email:', credentials.email);
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log('[Auth] Login response:', { user: data.user?.email, error });

      if (error) {
        console.error('[Auth] Login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('[Auth] Login successful, loading user profile...');
        await loadUserProfile(data.user.id);
        console.log('[Auth] Login completed successfully for:', data.user.email);
        toast.success(`Καλώς ήρθες, ${data.user.user_metadata?.first_name || 'Χρήστη'}!`);
      }
    } catch (error) {
      console.error('[Auth] Login failed:', error);
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

      console.log('[Auth] ===== REGISTRATION STARTED =====');
      console.log('[Auth] Registering user:', email);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone.trim()
          }
        }
      });

      console.log('[Auth] Auth signup response:', { user: authData.user?.email, error: authError });

      if (authError) {
        console.error('[Auth] Auth error:', authError);
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
    console.log('[Auth] ===== LOGOUT STARTED =====');
    console.log('[Auth] Current user:', user?.email);
    try {
      setIsLoading(true);
      
      // Clear all auth data
      await supabase.auth.signOut();
      console.log('[Auth] Supabase signOut completed');
      
      // Cleanup admin client to avoid GoTrueClient conflicts
      cleanupSupabaseAdmin();
      
      // Clear all auth data
      clearAllAuthData();
      
      console.log('[Auth] Logout completed successfully');
      toast.success('Αποσυνδέθηκες επιτυχώς');
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
      // Still clear local state even if logout fails
      cleanupSupabaseAdmin();
      clearAllAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      console.log('[Auth] ===== UPDATE PROFILE STARTED =====');
      console.log('[Auth] Update data:', JSON.stringify(data, null, 2));
      console.log('[Auth] Current user ID:', user?.id);
      
      setIsLoading(true);
      
      if (!user) throw new Error('Δεν είσαι συνδεδεμένος');
      
      const updateData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        dob: data.dob,
        address: data.address,
        emergency_contact: data.emergency_contact,
        profile_photo: data.profile_photo,
        profile_photo_locked: data.profile_photo_locked,
        dob_locked: data.dob_locked,
        updated_at: new Date().toISOString()
      };
      
      console.log('[Auth] Update payload:', JSON.stringify(updateData, null, 2));
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('[Auth] Update error:', error);
        throw error;
      }

      console.log('[Auth] Update successful, updating local state...');
      
      // Update local user state instead of reloading
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('freegym_user', JSON.stringify(updatedUser));
      
      console.log('[Auth] ===== UPDATE PROFILE COMPLETED =====');
      toast.success('Το προφίλ ενημερώθηκε επιτυχώς');
    } catch (error) {
      console.error('[Auth] ===== UPDATE PROFILE FAILED =====');
      console.error('[Auth] Update error details:', error);
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
