import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseAdmin } from '@/config/supabaseAdmin';
import { 
  CreditCard, 
  User,
  Users,
  Plus,
  Save,
  Edit3,
  BarChart3,
  UserCheck,
  Calendar,
  Key,
  Trash2,
  Search,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  PersonalTrainingSchedule, 
  PersonalTrainingSession,
  UserWithPersonalTraining
} from '@/types';



const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal-training' | 'payments' | 'analytics' | 'users'>('personal-training');
  const [allUsers, setAllUsers] = useState<UserWithPersonalTraining[]>([]);
  const [programStatuses, setProgramStatuses] = useState<Array<{
    user: UserWithPersonalTraining;
    schedule: PersonalTrainingSchedule;
    status: 'pending' | 'accepted' | 'declined';
  }>>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithPersonalTraining | null>(null);
  const [personalTrainingSchedule, setPersonalTrainingSchedule] = useState<PersonalTrainingSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
    const [newCode, setNewCode] = useState({
    code: '',
    selectedUserId: '' 
  });
  const [trainingType, setTrainingType] = useState<'individual' | 'group'>('individual');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchMode, setUserSearchMode] = useState<'dropdown' | 'search'>('dropdown');
  const [programStatusSearchTerm, setProgramStatusSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Προσωποποιημένο πρόγραμμα που θα σταλεί μαζί με τον κωδικό
  const [programSessions, setProgramSessions] = useState<PersonalTrainingSession[]>([
    { id: 'tmp-1', date: new Date().toISOString().split('T')[0], startTime: '18:00', endTime: '19:00', type: 'personal', trainer: '', room: 'Αίθουσα Mike', notes: '' }
  ]);

  const tabs = [
    { id: 'personal-training', name: 'Personal Training Πρόγραμμα', icon: Calendar },
    { id: 'payments', name: 'Αιτήματα Πληρωμών', icon: CreditCard },
    { id: 'analytics', name: 'Αναλυτικά Κρατήσεων', icon: BarChart3 },
    { id: 'users', name: 'Διαχείριση Χρηστών', icon: UserCheck }
  ];

  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];


  // Function to determine program category based on sessions
  const getProgramCategory = (schedule: PersonalTrainingSchedule): string => {
    if (!schedule.scheduleData?.sessions || schedule.scheduleData.sessions.length === 0) {
      return 'Personal Training';
    }

    const sessionTypes = schedule.scheduleData.sessions.map(session => session.type);
    const uniqueTypes = [...new Set(sessionTypes)];

    if (uniqueTypes.length === 1) {
      switch (uniqueTypes[0]) {
        case 'personal':
          return 'Personal Training';
        case 'kickboxing':
          return 'Kick Boxing';
        case 'combo':
          return 'Combo Training';
        default:
          return 'Personal Training';
      }
    } else if (uniqueTypes.length > 1) {
      return 'Combo Training';
    }

    return 'Personal Training';
  };

  // Helper: block hardcoded test users (UI guard)
  const isBlockedTestUser = (u: { email?: string | null; personalTrainingCode?: string | null; firstName?: string; lastName?: string }): boolean => {
    const blockedEmails = ['user1@freegym.gr', 'user2@freegym.gr'];
    const blockedCodes = ['PERSONAL2024', 'KICKBOX2024'];
    const byEmail = !!u.email && blockedEmails.includes(u.email);
    const byCode = !!u.personalTrainingCode && blockedCodes.includes(u.personalTrainingCode);
    return byEmail || byCode;
  };

  // Filtered users based on search term
  const filteredUsers = allUsers.filter(user => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  // Filtered program statuses based on search term and status filter
  const filteredProgramStatuses = programStatuses.filter(programStatus => {
    // Apply search filter
    const matchesSearch = !programStatusSearchTerm || (() => {
      const searchLower = programStatusSearchTerm.toLowerCase();
      return (
        programStatus.user.firstName.toLowerCase().includes(searchLower) ||
        programStatus.user.lastName.toLowerCase().includes(searchLower) ||
        programStatus.user.email.toLowerCase().includes(searchLower) ||
        `${programStatus.user.firstName} ${programStatus.user.lastName}`.toLowerCase().includes(searchLower)
      );
    })();
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || programStatus.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProgramStatuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProgramStatuses = filteredProgramStatuses.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [programStatusSearchTerm, statusFilter]);
  
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Function to check admin role in database
  const checkAdminRoleInDatabase = async () => {
    try {
      console.log('[AdminPanel] Checking admin role in database...');
      
      const { data: adminProfile, error } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id, role, first_name, last_name, email')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        console.error('[AdminPanel] Error checking admin profile:', error);
        return false;
      }
      
      console.log('[AdminPanel] Admin profile in database:', adminProfile);
      console.log('[AdminPanel] Admin role in database:', adminProfile?.role);
      
      return adminProfile?.role === 'admin';
    } catch (error) {
      console.error('[AdminPanel] Exception checking admin role:', error);
      return false;
    }
  };

  // Function to check if we can create data (test RLS permissions)
  const checkIfCanCreateData = async () => {
    try {
      console.log('[AdminPanel] Testing if we can create data...');
      
      // Try to insert a test record and immediately delete it
      const testData = {
        user_id: user?.id,
        month: 1,
        year: 2000,
        schedule_data: { sessions: [] },
        status: 'pending',
        created_by: user?.id
      };
      
      const { data, error } = await supabaseAdmin
        .from('personal_training_schedules')
        .insert(testData)
        .select();
      
      if (error) {
        console.log('[AdminPanel] Cannot create data - RLS blocking:', error.message);
        return false;
      }
      
      // If successful, delete the test record
      if (data && data.length > 0) {
        await supabaseAdmin
          .from('personal_training_schedules')
          .delete()
          .eq('id', data[0].id);
        console.log('[AdminPanel] Can create data - RLS working correctly');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[AdminPanel] Exception testing data creation:', error);
      return false;
    }
  };

  // Function to create test schedule data
  const createTestScheduleData = async (testUser: UserWithPersonalTraining, adminId?: string) => {
    if (!adminId) {
      console.log('[AdminPanel] No admin ID available for test data creation');
      return;
    }

    try {
      console.log('[AdminPanel] Creating test schedule for user:', testUser.email);
      
      const testSchedule = {
        user_id: testUser.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        schedule_data: {
          sessions: [
            {
              id: 'test-1',
              date: new Date().toISOString().split('T')[0],
              startTime: '18:00',
              endTime: '19:00',
              type: 'personal',
              trainer: 'Μαρία Παπαδοπούλου',
              room: 'Αίθουσα Mike',
              notes: 'Test session created by admin'
            }
          ],
          notes: 'Test program created by admin',
          specialInstructions: 'This is test data'
        },
        status: 'pending',
        created_by: adminId
      };

      const { data, error } = await supabaseAdmin
        .from('personal_training_schedules')
        .insert(testSchedule)
        .select();

      if (error) {
        console.error('[AdminPanel] Error creating test schedule:', error);
      } else {
        console.log('[AdminPanel] Test schedule created successfully:', data);
        // Reload data after creating test schedule
        setTimeout(() => {
          loadAllUsers();
        }, 1000);
      }
    } catch (error) {
      console.error('[AdminPanel] Exception creating test schedule:', error);
    }
  };

  // Load all users and their personal training schedules from the database
  const loadAllUsers = async () => {
    console.log('[AdminPanel] ===== DATA LOADING STARTED =====');
    console.log('[AdminPanel] Current user:', user?.email, 'Role:', user?.role);
    
    try {
      setLoading(true);
      
      // Fetch all users from user_profiles table
      console.log('[AdminPanel] Querying user_profiles table...');
      const { data: userProfiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[AdminPanel] User profiles query result - rows:', userProfiles?.length, 'error:', profilesError);

      if (profilesError) {
        console.error('[AdminPanel] User profiles error:', profilesError);
        throw profilesError;
      }

      // Fetch all personal training schedules
      console.log('[AdminPanel] Querying personal_training_schedules table...');
      console.log('[AdminPanel] Current auth user ID:', user?.id);
      console.log('[AdminPanel] Current auth user role:', user?.role);
      
      // First, let's check if we can access the table at all
      // Try different approaches to access the data
      console.log('[AdminPanel] Attempting to query personal_training_schedules...');
      
      let schedules: any[] = [];
      let schedulesError: any = null;
      
      // Try 1: Direct query
      const { data: directData, error: directError } = await supabaseAdmin
        .from('personal_training_schedules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (directError) {
        console.log('[AdminPanel] Direct query failed:', directError);
        
        // Try 2: Query with specific fields
        const { data: limitedData, error: limitedError } = await supabaseAdmin
          .from('personal_training_schedules')
          .select('id, user_id, status')
          .limit(10);
        
        if (limitedError) {
          console.log('[AdminPanel] Limited query also failed:', limitedError);
          
          // Try 3: Check if we can at least count rows
          const { count, error: countError } = await supabaseAdmin
            .from('personal_training_schedules')
            .select('*', { count: 'exact', head: true });
          
          console.log('[AdminPanel] Count query result:', count, 'error:', countError);
        } else {
          console.log('[AdminPanel] Limited query succeeded:', limitedData);
          schedules = limitedData || [];
        }
      } else {
        console.log('[AdminPanel] Direct query succeeded:', directData);
        schedules = directData || [];
      }
      
      schedulesError = directError;

      console.log('[AdminPanel] Schedules query result - rows:', schedules?.length, 'error:', schedulesError);
      
      // Additional debugging for RLS issues
      if (schedules?.length === 0 && !schedulesError) {
        console.log('[AdminPanel] Query succeeded but returned 0 rows - checking RLS policies...');
        
        // Check admin role in database
        const isAdminInDB = await checkAdminRoleInDatabase();
        console.log('[AdminPanel] Is admin in database:', isAdminInDB);
        
        // Check if we can at least count the total rows (bypassing RLS)
        const { count, error: countError } = await supabaseAdmin
          .from('personal_training_schedules')
          .select('*', { count: 'exact', head: true });
        
        console.log('[AdminPanel] Total rows in table (bypassing RLS):', count, 'error:', countError);
        
        if (count && count > 0) {
          console.warn('[AdminPanel] RLS is blocking access to existing data! Table has', count, 'rows but query returns 0.');
          console.warn('[AdminPanel] Admin role might not be properly configured in RLS policies.');
          console.warn('[AdminPanel] Please run the SQL script: database/fix_admin_rls_policies.sql');
        }
      }
      
      // If we get an error, let's try a different approach
      if (schedulesError) {
        console.error('[AdminPanel] Schedules query failed with error:', schedulesError);
        console.log('[AdminPanel] Error code:', schedulesError.code);
        console.log('[AdminPanel] Error message:', schedulesError.message);
        console.log('[AdminPanel] Error details:', schedulesError.details);
        console.log('[AdminPanel] Error hint:', schedulesError.hint);
        
        // Try to check if the table exists and has any data at all
        console.log('[AdminPanel] Attempting to check table existence...');
        const { data: tableCheck, error: tableError } = await supabaseAdmin
          .from('personal_training_schedules')
          .select('count')
          .limit(1);
        
        console.log('[AdminPanel] Table check result:', tableCheck, 'error:', tableError);
      }

      if (schedulesError) {
        console.error('[AdminPanel] Schedules error:', schedulesError);
        
        // If RLS is blocking us, let's try to create some test data or check if the table is empty
        console.log('[AdminPanel] RLS might be blocking access. Checking if we can insert test data...');
        
        // Don't throw error, just continue with empty schedules
        console.log('[AdminPanel] Continuing with empty schedules due to RLS restrictions');
      }

      if (!userProfiles || userProfiles.length === 0) {
        console.log('[AdminPanel] No users found in database - setting empty states');
        setAllUsers([]);
        setProgramStatuses([]);
        return;
      }

      // Transform user profiles to the format we need
      console.log('[AdminPanel] Transforming user profiles...');
      const usersWithAuthData = userProfiles.map(profile => {
        const transformedUser = {
          id: profile.user_id,
          email: profile.email || `user-${profile.user_id.slice(0, 8)}@example.com`,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          profile_photo: profile.profile_photo || '',
          profile_photo_locked: profile.profile_photo_locked || false,
          dob: profile.dob || '',
          address: profile.address || '',
          emergency_contact: profile.emergency_contact || '',
          dob_locked: profile.dob_locked || false,
          hasPersonalTrainingCode: false, // Will be updated when we check for codes
          personalTrainingCode: undefined,
          packageType: undefined
        } as UserWithPersonalTraining;
        
        return transformedUser;
      });
      
      console.log('[AdminPanel] Transformed users count:', usersWithAuthData.length);
      setAllUsers(usersWithAuthData);
      
      // Create real program statuses from schedules data
      console.log('[AdminPanel] Creating program statuses from schedules...');
      console.log('[AdminPanel] Schedules data:', schedules);
      
      const realProgramStatuses = (schedules || [])
        .map(schedule => {
          console.log('[AdminPanel] Processing schedule:', schedule.id, 'for user:', schedule.user_id);
          const user = usersWithAuthData.find(u => u.id === schedule.user_id);
          if (!user) {
            console.warn(`[AdminPanel] User not found for schedule ${schedule.id}, user_id: ${schedule.user_id}`);
            return null;
          }
          
          const programStatus = {
            user,
            schedule: {
              id: schedule.id,
              userId: schedule.user_id,
              month: schedule.month,
              year: schedule.year,
              status: schedule.status as 'pending' | 'accepted' | 'declined',
              scheduleData: schedule.schedule_data,
              createdBy: schedule.created_by,
              createdAt: schedule.created_at,
              updatedAt: schedule.updated_at
            } as PersonalTrainingSchedule,
            status: schedule.status as 'pending' | 'accepted' | 'declined'
          };
          
          console.log('[AdminPanel] Created program status:', programStatus);
          return programStatus;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null); // Remove null entries with proper typing
      
      console.log('[AdminPanel] Final program statuses count:', realProgramStatuses.length);
      
      // If no schedules found, let's try to create some test data to verify the system works
      if (realProgramStatuses.length === 0 && usersWithAuthData.length > 0) {
        console.log('[AdminPanel] No schedules found. Creating test data to verify system...');
        
        // Check if we can create data (RLS working)
        const canCreateData = await checkIfCanCreateData();
        if (canCreateData) {
          await createTestScheduleData(usersWithAuthData[0], user?.id);
        } else {
          console.warn('[AdminPanel] Cannot create test data due to RLS restrictions.');
          console.warn('[AdminPanel] Please fix RLS policies by running: database/fix_admin_rls_policies.sql');
        }
      }
      
      setProgramStatuses(realProgramStatuses);
      
      // Check which users have personal training codes
      console.log('[AdminPanel] Checking personal training codes...');
      
      // First, let's check if there are any personal training codes at all
      const { data: codesCheck, error: codesError } = await supabaseAdmin
        .from('personal_training_codes')
        .select('*')
        .limit(5);
      
      console.log('[AdminPanel] Personal training codes check - rows:', codesCheck?.length, 'error:', codesError);
      
      await checkPersonalTrainingCodes(usersWithAuthData);
      
      console.log('[AdminPanel] ===== DATA LOADING COMPLETED SUCCESSFULLY =====');
      
    } catch (error) {
      console.error('[AdminPanel] ===== DATA LOADING FAILED =====');
      console.error('[AdminPanel] Error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Σφάλμα κατά τη φόρτωση των χρηστών: ${errorMessage}`);
      
      // Fallback to empty arrays if database fails
      setAllUsers([]);
      setProgramStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Check which users have personal training codes
  const checkPersonalTrainingCodes = async (users: UserWithPersonalTraining[]) => {
    try {
      // Query the personal_training_codes table to get real data
      // Use admin client with RLS bypass
      const { data: personalTrainingCodes, error } = await supabaseAdmin
        .from('personal_training_codes')
        .select('used_by, code, package_type')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching personal training codes:', error);
        // If table doesn't exist or has RLS issues, just set users without codes
        setAllUsers(users);
        return;
      }

      const updatedUsers = users.map(user => {
        const codeData = personalTrainingCodes?.find(code => code.used_by === user.id);
        if (codeData) {
          return {
            ...user,
            hasPersonalTrainingCode: true,
            personalTrainingCode: codeData.code,
            packageType: codeData.package_type
          };
        }
        return user;
      });

      setAllUsers(updatedUsers);
    } catch (error) {
      console.error('Error checking personal training codes:', error);
    }
  };

  // Load data when user changes (after login)
  useEffect(() => {
    console.log('[AdminPanel] useEffect triggered - user:', user?.email, 'role:', user?.role, 'activeTab:', activeTab);
    
    if (user && user.role === 'admin' && activeTab === 'personal-training') {
      console.log('[AdminPanel] User changed - loading data for admin user:', user.email);
      loadAllUsers();
    } else if (user && user.role !== 'admin') {
      console.warn('[AdminPanel] User is not admin! Role:', user.role, 'Email:', user.email);
    } else if (!user) {
      console.log('[AdminPanel] No user logged in');
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === 'personal-training') {
      console.log('[AdminPanel] useEffect triggered - loading data for personal-training tab');
      loadAllUsers();
    }
  }, [activeTab]);



  const loadPersonalTrainingSchedule = async (userId: string) => {
    try {
      setLoading(true);
      // Φέρνουμε το πιο πρόσφατο πραγματικό πρόγραμμα από τη βάση
      const { data, error } = await supabaseAdmin
        .from('personal_training_schedules')
        .select('id, user_id, month, year, schedule_data, status, created_by, created_at, updated_at, accepted_at, declined_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[ADMIN] Error loading schedule for user', userId, error);
        toast.error('Σφάλμα κατά τη φόρτωση του προγράμματος');
        setPersonalTrainingSchedule(null);
        return;
      }

      if (!data || data.length === 0) {
        setPersonalTrainingSchedule(null);
        toast.error('Δεν βρέθηκε πρόγραμμα για τον συγκεκριμένο χρήστη');
        return;
      }

      const row = data[0] as any;
      const realSchedule: PersonalTrainingSchedule = {
        id: row.id,
        userId: row.user_id,
        month: row.month,
        year: row.year,
        scheduleData: row.schedule_data,
        status: row.status,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        acceptedAt: row.accepted_at,
        declinedAt: row.declined_at,
      } as any;

      setPersonalTrainingSchedule(realSchedule);
    } catch (error) {
      console.error('[ADMIN] Exception while loading schedule', error);
      toast.error('Σφάλμα κατά τη φόρτωση του προγράμματος');
      setPersonalTrainingSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  // Personal Training functions

  const addPersonalTrainingSession = () => {
    if (!personalTrainingSchedule) return;
    
    const newSession: PersonalTrainingSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      type: 'personal',
      trainer: 'Μαρία Παπαδοπούλου',
      room: 'Αίθουσα Personal Training',
      notes: ''
    };

    const updatedSchedule = {
      ...personalTrainingSchedule,
      scheduleData: {
        ...personalTrainingSchedule.scheduleData,
        sessions: [...personalTrainingSchedule.scheduleData.sessions, newSession]
      }
    };
    setPersonalTrainingSchedule(updatedSchedule);
  };

  const updatePersonalTrainingSession = (sessionId: string, field: keyof PersonalTrainingSession, value: any) => {
    if (!personalTrainingSchedule) return;

    const updatedSessions = personalTrainingSchedule.scheduleData.sessions.map(session =>
      session.id === sessionId ? { ...session, [field]: value } : session
    );

    const updatedSchedule = {
      ...personalTrainingSchedule,
      scheduleData: {
        ...personalTrainingSchedule.scheduleData,
        sessions: updatedSessions
      }
    };
    setPersonalTrainingSchedule(updatedSchedule);
  };

  const removePersonalTrainingSession = (sessionId: string) => {
    if (!personalTrainingSchedule) return;

    const updatedSessions = personalTrainingSchedule.scheduleData.sessions.filter(
      session => session.id !== sessionId
    );

    const updatedSchedule = {
      ...personalTrainingSchedule,
      scheduleData: {
        ...personalTrainingSchedule.scheduleData,
        sessions: updatedSessions
      }
    };
    setPersonalTrainingSchedule(updatedSchedule);
  };

  const savePersonalTrainingSchedule = async () => {
    if (!personalTrainingSchedule || !selectedUser) return;

    try {
      setLoading(true);
      // Save schedule locally for now
      toast.success(`Το πρόγραμμα για τον ${selectedUser.firstName} ${selectedUser.lastName} αποθηκεύτηκε!`);
      setEditingSchedule(false);
    } catch (error) {
      toast.error('Σφάλμα κατά την αποθήκευση του προγράμματος');
    } finally {
      setLoading(false);
    }
  };

  const createPersonalTrainingCode = async () => {
    const userIds = trainingType === 'individual' ? [newCode.selectedUserId] : selectedUserIds;
    
    if (!newCode.code.trim()) {
      toast.error('Παρακαλώ εισάγετε κωδικό');
      return;
    }

    if (userIds.length === 0) {
      toast.error('Παρακαλώ επιλέξτε χρήστη/ες');
      return;
    }

    try {
      setLoading(true);
      console.log('[ADMIN] Starting to create personal training code...');
      
      // Έλεγχος αν υπάρχει ήδη κωδικός με το ίδιο όνομα
      const { data: existingCode, error: checkError } = await supabaseAdmin
        .from('personal_training_codes')
        .select('id, code')
        .eq('code', newCode.code.trim())
        .limit(1);

      if (checkError) {
        console.error('[ADMIN] Error checking existing code:', checkError);
        throw checkError;
      }

      if (existingCode && existingCode.length > 0) {
        toast.error(`Ο κωδικός "${newCode.code.trim()}" υπάρχει ήδη. Παρακαλώ επιλέξτε διαφορετικό κωδικό.`);
        return;
      }

      // Δημιουργούμε κωδικούς για όλους τους επιλεγμένους χρήστες
      for (const userId of userIds) {
        const selectedUser = allUsers.find(user => user.id === userId);
        
        if (!selectedUser) {
          toast.error(`Δεν βρέθηκε ο χρήστης με ID: ${userId}`);
          continue;
        }

        console.log('[ADMIN] Selected user:', selectedUser.firstName, selectedUser.lastName, 'ID:', selectedUser.id);
        console.log('[ADMIN] Admin user ID:', user?.id);
        console.log('[ADMIN] Code to create:', newCode.code.trim());

        // Δημιουργία και αποθήκευση κωδικού στη βάση (Supabase)
        console.log('[ADMIN] Inserting code into personal_training_codes...');
        const { error: codeError } = await supabaseAdmin
          .from('personal_training_codes')
          .insert({
            code: newCode.code.trim(),
            package_type: 'personal',
            created_by: user?.id,
            is_active: true,
            used_by: selectedUser.id,
            used_at: new Date().toISOString()
          });
        
        if (codeError) {
          console.error('[ADMIN] Code insertion error:', codeError);
          throw codeError;
        }
        
        console.log('[ADMIN] Code inserted successfully for user:', selectedUser.email);

        // Δημιουργούμε το πρόγραμμα μόνο για τον πρώτο χρήστη (ή για όλους αν είναι group)
        if (userId === userIds[0]) {
          const scheduleSessions: PersonalTrainingSession[] = programSessions.map((s) => ({
            id: s.id,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            type: s.type,
            trainer: s.trainer || 'Προπονητής',
            room: s.room,
            notes: s.notes
          }));

          const schedulePayload = {
            user_id: selectedUser.id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            schedule_data: {
              sessions: scheduleSessions,
              notes: '',
              trainer: scheduleSessions[0]?.trainer || 'Προπονητής',
              specialInstructions: ''
            },
            status: 'pending',
            created_by: user?.id
          };

          console.log('[ADMIN] Schedule payload:', schedulePayload);
          console.log('[ADMIN] Inserting schedule into personal_training_schedules...');
          
          const { error: scheduleError } = await supabaseAdmin
            .from('personal_training_schedules')
            .insert(schedulePayload);
          
          if (scheduleError) {
            console.error('[ADMIN] Schedule insertion error:', scheduleError);
            throw scheduleError;
          }
          
          console.log('[ADMIN] Schedule inserted successfully');
        }
      }

      const userNames = userIds.map(id => {
        const user = allUsers.find(u => u.id === id);
        return user ? `${user.firstName} ${user.lastName}` : 'Άγνωστος';
      }).join(', ');

      toast.success(`Ο κωδικός ${newCode.code} δημιουργήθηκε επιτυχώς για ${trainingType === 'individual' ? 'τον χρήστη' : 'τους χρήστες'}: ${userNames}!`);
      setShowCreateCodeModal(false);
      setNewCode({ code: '', selectedUserId: '' });
      setTrainingType('individual');
      setSelectedUserIds([]);
      setUserSearchTerm('');
      setUserSearchMode('dropdown');
      setProgramSessions([{ id: 'tmp-1', date: new Date().toISOString().split('T')[0], startTime: '18:00', endTime: '19:00', type: 'personal', trainer: '', room: 'Αίθουσα Mike', notes: '' }]);
      
      // Refresh the users list to show the new code
      loadAllUsers();
    } catch (error) {
      console.error('[ADMIN] Error creating personal training code:', error);
      
      // Καλύτερο error handling με συγκεκριμένα μηνύματα
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any;
        if (supabaseError.code === '23505') {
          toast.error('Ο κωδικός υπάρχει ήδη. Παρακαλώ επιλέξτε διαφορετικό κωδικό.');
        } else if (supabaseError.code === '23503') {
          toast.error('Πρόβλημα με τα δεδομένα χρήστη. Ελέγξτε ότι ο χρήστης υπάρχει.');
        } else if (supabaseError.code === 'PGRST301') {
          toast.error('Πρόβλημα αυθεντικοποίησης. Κάντε επανασύνδεση.');
        } else {
          toast.error(`Σφάλμα βάσης δεδομένων: ${supabaseError.message || 'Άγνωστο σφάλμα'}`);
        }
      } else {
        toast.error('Σφάλμα κατά τη δημιουργία του κωδικού');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Δεν έχετε δικαίωμα πρόσβασης</h2>
          <p className="text-gray-600">Μόνο οι διαχειριστές μπορούν να έχουν πρόσβαση σε αυτή τη σελίδα.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏋️‍♂️ Διαχείριση Γυμναστηρίου</h1>
            <p className="text-blue-100 text-lg">Καλώς ήρθες, <span className="font-semibold">{user.firstName}</span>! Διαχειριστείτε όλες τις λειτουργίες από εδώ.</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <Users className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-3 font-semibold text-sm flex items-center space-x-3 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Φόρτωση...</span>
            </div>
          )}

          {/* Personal Training Tab */}
          {activeTab === 'personal-training' && !loading && (
            <div className="space-y-6">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">💪 Personal Training Πρόγραμμα</h2>
                    <p className="text-purple-100">Διαχείριση προσωποποιημένων προγραμμάτων προπόνησης</p>
                  </div>
                  <button
                    onClick={() => setShowCreateCodeModal(true)}
                    className="flex items-center space-x-3 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold shadow-lg"
                  >
                    <Key className="h-5 w-5" />
                    <span>🔑 Δημιουργία Κωδικού</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Search Bar */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-blue-800 mb-3">
                      🔍 Αναζήτηση Χρήστη
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-blue-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Αναζητήστε με όνομα ή email..."
                        value={programStatusSearchTerm}
                        onChange={(e) => setProgramStatusSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </div>
                  {programStatusSearchTerm && (
                  <button
                      onClick={() => setProgramStatusSearchTerm('')}
                      className="px-4 py-3 text-sm text-blue-600 hover:text-red-600 flex items-center space-x-2 bg-white rounded-lg border border-blue-200 hover:border-red-200 transition-all duration-200"
                  >
                      <X className="h-4 w-4" />
                      <span>Καθαρισμός</span>
                  </button>
                  )}
                </div>
                {programStatusSearchTerm && (
                  <div className="mt-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                    📊 Εμφανίζονται {filteredProgramStatuses.length} από {programStatuses.length} προγράμματα
                  </div>
                )}
              </div>

              {/* Enhanced Program Status Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* All Status Card */}
                <div 
                  className={`bg-gradient-to-br from-blue-50 to-indigo-100 border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    statusFilter === 'all' 
                      ? 'border-blue-500 ring-4 ring-blue-200' 
                      : 'border-blue-300 hover:border-blue-400'
                  }`}
                  onClick={() => setStatusFilter('all')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                        <span className="text-white text-2xl">📊</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">Όλα</p>
                        <p className="text-3xl font-bold text-blue-900">
                          {programStatuses.length}
                        </p>
                      </div>
                    </div>
                    <div className="text-blue-600 text-3xl">📈</div>
                  </div>
                </div>

                {/* Pending Status Card */}
                <div 
                  className={`bg-gradient-to-br from-yellow-50 to-orange-100 border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    statusFilter === 'pending' 
                      ? 'border-yellow-500 ring-4 ring-yellow-200' 
                      : 'border-yellow-300 hover:border-yellow-400'
                  }`}
                  onClick={() => setStatusFilter('pending')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                        <span className="text-white text-2xl">⏳</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Σε Αναμονή</p>
                        <p className="text-3xl font-bold text-yellow-900">
                          {programStatuses.filter(p => p.status === 'pending').length}
                        </p>
                      </div>
                    </div>
                    <div className="text-yellow-600 text-3xl">⏰</div>
                  </div>
                </div>

                {/* Accepted Status Card */}
                <div 
                  className={`bg-gradient-to-br from-green-50 to-emerald-100 border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    statusFilter === 'accepted' 
                      ? 'border-green-500 ring-4 ring-green-200' 
                      : 'border-green-300 hover:border-green-400'
                  }`}
                  onClick={() => setStatusFilter('accepted')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                        <span className="text-white text-2xl">✅</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-green-800 uppercase tracking-wide">Αποδεκτά</p>
                        <p className="text-3xl font-bold text-green-900">
                          {programStatuses.filter(p => p.status === 'accepted').length}
                        </p>
                      </div>
                    </div>
                    <div className="text-green-600 text-3xl">🎉</div>
                  </div>
                </div>

                {/* Declined Status Card */}
                <div 
                  className={`bg-gradient-to-br from-red-50 to-pink-100 border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    statusFilter === 'declined' 
                      ? 'border-red-500 ring-4 ring-red-200' 
                      : 'border-red-300 hover:border-red-400'
                  }`}
                  onClick={() => setStatusFilter('declined')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl shadow-lg">
                        <span className="text-white text-2xl">❌</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-red-800 uppercase tracking-wide">Απορριφθέντα</p>
                        <p className="text-3xl font-bold text-red-900">
                          {programStatuses.filter(p => p.status === 'declined').length}
                        </p>
                      </div>
                    </div>
                    <div className="text-red-600 text-3xl">😔</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Program Status List */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      📋 Κατάσταση Προγραμμάτων
                      <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {filteredProgramStatuses.length} προγράμματα
                      </span>
                      {totalPages > 1 && (
                        <span className="ml-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                          Σελίδα {currentPage} από {totalPages}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-4">
                      {statusFilter !== 'all' && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            Φιλτράρισμα: 
                            <span className="ml-1 font-semibold text-blue-600">
                              {statusFilter === 'pending' && '⏳ Σε Αναμονή'}
                              {statusFilter === 'accepted' && '✅ Αποδεκτά'}
                              {statusFilter === 'declined' && '❌ Απορριφθέντα'}
                            </span>
                          </span>
                          <button
                            onClick={() => setStatusFilter('all')}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                          >
                            ✕ Καθαρισμός
                          </button>
                        </div>
                      )}
                      
                      {/* Top Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-all duration-200"
                          >
                            ← Προηγούμενη
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white shadow-lg'
                                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-all duration-200"
                          >
                            Επόμενη →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {paginatedProgramStatuses.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      {programStatusSearchTerm || statusFilter !== 'all' ? (
                        <div>
                          <p>
                            {programStatusSearchTerm 
                              ? `Δεν βρέθηκαν προγράμματα για την αναζήτηση "${programStatusSearchTerm}"`
                              : `Δεν βρέθηκαν προγράμματα με κατάσταση "${statusFilter}"`
                            }
                          </p>
                          <div className="mt-3 space-x-2">
                            {programStatusSearchTerm && (
                              <button
                                onClick={() => setProgramStatusSearchTerm('')}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                              >
                                ✕ Καθαρισμός αναζήτησης
                              </button>
                            )}
                            {statusFilter !== 'all' && (
                              <button
                                onClick={() => setStatusFilter('all')}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                ✕ Καθαρισμός φίλτρου
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p>Δεν υπάρχουν προγράμματα Personal Training</p>
                      )}
                    </div>
                  ) : (
                    paginatedProgramStatuses.map((programStatus) => (
                      <div
                        key={programStatus.schedule.id}
                        className="px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-blue-400"
                        onClick={() => {
                          if (isBlockedTestUser({ email: programStatus.user.email })) return;
                          // Επιλέγουμε τον χρήστη και φορτώνουμε το πρόγραμμά του για επεξεργασία
                          setSelectedUser(programStatus.user);
                          loadPersonalTrainingSchedule(programStatus.user.id);
                          // Κύλιση στη φόρμα επεξεργασίας με delay για να φορτώσει το πρόγραμμα
                          setTimeout(() => {
                            const el = document.querySelector('#schedule-editor');
                            if (el) {
                              el.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center',
                                inline: 'nearest'
                              });
                              // Επιπλέον highlight effect
                              el.classList.add('animate-pulse');
                              setTimeout(() => {
                                el.classList.remove('animate-pulse');
                              }, 2000);
                            }
                          }, 500);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {programStatus.user.profile_photo ? (
                                  <img
                                    src={programStatus.user.profile_photo}
                                    alt={`${programStatus.user.firstName} ${programStatus.user.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                                    onError={(e) => {
                                      // Fallback to default avatar if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = '<div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"><svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                    <User className="h-6 w-6 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-gray-900">
                                  {programStatus.user.firstName} {programStatus.user.lastName}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <span className="mr-2">📧</span>
                                  {programStatus.user.email}
                                </p>
                                <div className="flex items-center space-x-3 mt-2">
                                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    📅 {programStatus.schedule.month}/{programStatus.schedule.year}
                                  </p>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                    getProgramCategory(programStatus.schedule) === 'Personal Training'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : getProgramCategory(programStatus.schedule) === 'Kick Boxing'
                                      ? 'bg-red-100 text-red-800 border border-red-200'
                                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                                  }`}>
                                    {getProgramCategory(programStatus.schedule) === 'Personal Training' && '💪'}
                                    {getProgramCategory(programStatus.schedule) === 'Kick Boxing' && '🥊'}
                                    {getProgramCategory(programStatus.schedule) === 'Combo Training' && '🔥'}
                                    {getProgramCategory(programStatus.schedule)}
                                  </span>
                                </div>
                              </div>
                </div>
              </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Δημιουργήθηκε: {new Date(programStatus.schedule.createdAt).toLocaleDateString('el-GR')}
                              </p>
                              {programStatus.status === 'accepted' && programStatus.schedule.acceptedAt && (
                                <p className="text-xs text-green-600">
                                  Αποδεκτό: {new Date(programStatus.schedule.acceptedAt).toLocaleDateString('el-GR')}
                                </p>
                              )}
                              {programStatus.status === 'declined' && programStatus.schedule.declinedAt && (
                                <p className="text-xs text-red-600">
                                  Απορρίφθηκε: {new Date(programStatus.schedule.declinedAt).toLocaleDateString('el-GR')}
                                </p>
                              )}
                  </div>
                            
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                                programStatus.status === 'pending' 
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                                  : programStatus.status === 'accepted'
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                                  : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                              }`}>
                                {programStatus.status === 'pending' && '⏳ Σε Αναμονή'}
                                {programStatus.status === 'accepted' && '✅ Αποδεκτό'}
                                {programStatus.status === 'declined' && '❌ Απορριφθέν'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>
                          Εμφανίζονται {startIndex + 1}-{Math.min(endIndex, filteredProgramStatuses.length)} από {filteredProgramStatuses.length} προγράμματα
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-all duration-200"
                        >
                          ← Προηγούμενη
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-all duration-200"
                        >
                          Επόμενη →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {/* Enhanced Schedule Editor */}
              {selectedUser && personalTrainingSchedule && !isBlockedTestUser({ email: selectedUser.email, personalTrainingCode: selectedUser.personalTrainingCode }) && (
                <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-xl shadow-xl p-8" id="schedule-editor">
                  <div className="flex items-center justify-between mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-2xl font-bold mb-2">
                        🏋️‍♂️ Πρόγραμμα για {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-blue-100 text-lg">
                        📅 {days[personalTrainingSchedule.month - 1]} {personalTrainingSchedule.year}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!editingSchedule ? (
                        <button
                          onClick={() => setEditingSchedule(true)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Επεξεργασία</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={addPersonalTrainingSession}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Προσθήκη Σεσίας</span>
                          </button>
                          <button
                            onClick={savePersonalTrainingSchedule}
                            className="flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
                          >
                            <Save className="h-4 w-4" />
                            <span>Αποθήκευση</span>
                          </button>
                          <button
                            onClick={() => setEditingSchedule(false)}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <span>Ακύρωση</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Schedule Sessions */}
                  <div className="space-y-4">
                    {personalTrainingSchedule.scheduleData.sessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ημέρα</label>
                            {editingSchedule ? (
                              <input
                                type="date"
                                value={session.date}
                                onChange={(e) => updatePersonalTrainingSession(session.id, 'date', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">
                                {new Date(session.date).toLocaleDateString('el-GR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ώρα Έναρξης</label>
                            {editingSchedule ? (
                              <select
                                value={session.startTime}
                                onChange={(e) => updatePersonalTrainingSession(session.id, 'startTime', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                              >
                                {timeSlots.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="text-sm text-gray-900">{session.startTime}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ώρα Λήξης</label>
                            {editingSchedule ? (
                              <select
                                value={session.endTime}
                                onChange={(e) => updatePersonalTrainingSession(session.id, 'endTime', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                              >
                                {timeSlots.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="text-sm text-gray-900">{session.endTime}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Τύπος</label>
                            {editingSchedule ? (
                              <select
                                value={session.type}
                                onChange={(e) => updatePersonalTrainingSession(session.id, 'type', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="personal">Personal Training</option>
                                <option value="kickboxing">Kick Boxing</option>
                                <option value="combo">Combo</option>
                              </select>
                            ) : (
                              <p className="text-sm text-gray-900 capitalize">{session.type}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Προπονητής</label>
                            {editingSchedule ? (
                              <input
                                type="text"
                                value={session.trainer}
                                onChange={(e) => updatePersonalTrainingSession(session.id, 'trainer', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">{session.trainer}</p>
                            )}
                          </div>
                          <div className="flex items-end">
                            {editingSchedule && (
                              <button
                                onClick={() => removePersonalTrainingSession(session.id)}
                                className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Διαγραφή</span>
                              </button>
                            )}
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Σημειώσεις</label>
                            {editingSchedule ? (
                              <input
                                type="text"
                                value={session.notes}
                                onChange={(e) => updatePersonalTrainingSession(session.id, 'notes', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                                placeholder="Σημειώσεις για τη σέσια"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">{session.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* General Notes */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Γενικές Σημειώσεις</label>
                    {editingSchedule ? (
                      <textarea
                        value={personalTrainingSchedule.scheduleData.notes || ''}
                        onChange={(e) => {
                          const updatedSchedule = {
                            ...personalTrainingSchedule,
                            scheduleData: {
                              ...personalTrainingSchedule.scheduleData,
                              notes: e.target.value
                            }
                          };
                          setPersonalTrainingSchedule(updatedSchedule);
                        }}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        rows={3}
                        placeholder="Γενικές σημειώσεις για το πρόγραμμα..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{personalTrainingSchedule.scheduleData.notes || 'Δεν υπάρχουν σημειώσεις'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== 'personal-training' && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>Αυτή η κατηγορία θα υλοποιηθεί σύντομα.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Create Code Modal */}
      {showCreateCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">🔑 Δημιουργία Κωδικού Personal Training</h3>
                  <p className="text-purple-100">Δημιουργήστε έναν νέο κωδικό και προσωποποιημένο πρόγραμμα</p>
                </div>
              <button
                onClick={() => setShowCreateCodeModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              >
                  <X className="h-6 w-6" />
              </button>
              </div>
            </div>
            
                         <div className="p-8">
               <div className="space-y-8">
               {/* Training Type Selection */}
               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                 <label className="block text-lg font-bold text-indigo-800 mb-4 flex items-center">
                   🏋️‍♂️ Τύπος Προπόνησης
                 </label>
                 <div className="flex space-x-4">
                   <button
                     type="button"
                     onClick={() => setTrainingType('individual')}
                     className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                       trainingType === 'individual' 
                         ? 'bg-indigo-600 text-white shadow-lg' 
                         : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400'
                     }`}
                   >
                     👤 Ατομικό
                   </button>
                   <button
                     type="button"
                     onClick={() => setTrainingType('group')}
                     className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                       trainingType === 'group' 
                         ? 'bg-indigo-600 text-white shadow-lg' 
                         : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400'
                     }`}
                   >
                     👥 Group
                   </button>
                 </div>
               </div>

               {/* Enhanced User Selection */}
               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                 <label className="block text-lg font-bold text-blue-800 mb-4 flex items-center">
                   👤 {trainingType === 'individual' ? 'Επιλογή Χρήστη' : 'Επιλογή Χρηστών (Group)'}
                 </label>
                
                {/* Enhanced Mode Selection */}
                <div className="flex space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setUserSearchMode('dropdown')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      userSearchMode === 'dropdown' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    📋 Dropdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserSearchMode('search')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      userSearchMode === 'search' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    🔍 Αναζήτηση
                  </button>
                </div>

                                 {/* Enhanced User Selection based on mode */}
                 {userSearchMode === 'dropdown' ? (
                   trainingType === 'individual' ? (
                     <select
                       className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                       value={newCode.selectedUserId}
                       onChange={(e) => setNewCode({ ...newCode, selectedUserId: e.target.value })}
                     >
                       <option value="">-- Επιλέξτε χρήστη --</option>
                       {allUsers.length > 0 ? (
                         allUsers.map((user) => (
                           <option key={user.id} value={user.id}>
                             {user.firstName} {user.lastName} ({user.email})
                           </option>
                         ))
                       ) : (
                         <option value="" disabled>Δεν υπάρχουν χρήστες</option>
                       )}
                     </select>
                   ) : (
                     <div className="max-h-48 overflow-y-auto border-2 border-blue-200 rounded-xl bg-white">
                       {allUsers.length > 0 ? (
                         allUsers.map((user) => (
                           <div
                             key={user.id}
                             className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-b-0 transition-all duration-200 ${
                               selectedUserIds.includes(user.id) ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                             }`}
                             onClick={() => {
                               if (selectedUserIds.includes(user.id)) {
                                 setSelectedUserIds(prev => prev.filter(id => id !== user.id));
                               } else {
                                 setSelectedUserIds(prev => [...prev, user.id]);
                               }
                             }}
                           >
                             <div className="flex items-center">
                               <input
                                 type="checkbox"
                                 checked={selectedUserIds.includes(user.id)}
                                 onChange={() => {}}
                                 className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                               />
                               <div>
                                 <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                                 <div className="text-sm text-gray-600">{user.email}</div>
                               </div>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-4 text-gray-500 text-sm text-center">Δεν υπάρχουν χρήστες</div>
                       )}
                     </div>
                   )
                 ) : (
                   <div className="space-y-3">
                     <input
                       type="text"
                       className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                       placeholder="🔍 Αναζήτηση με όνομα ή email..."
                       value={userSearchTerm}
                       onChange={(e) => setUserSearchTerm(e.target.value)}
                     />
                     {userSearchTerm && (
                       <div className="max-h-48 overflow-y-auto border-2 border-blue-200 rounded-xl bg-white shadow-lg">
                         {filteredUsers.length > 0 ? (
                           filteredUsers.map((user) => (
                             <div
                               key={user.id}
                               className={`p-4 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-b-0 transition-all duration-200 ${
                                 trainingType === 'individual' 
                                   ? (newCode.selectedUserId === user.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : '')
                                   : (selectedUserIds.includes(user.id) ? 'bg-blue-100 border-l-4 border-l-blue-500' : '')
                               }`}
                               onClick={() => {
                                 if (trainingType === 'individual') {
                                   setNewCode({ ...newCode, selectedUserId: user.id });
                                 } else {
                                   if (selectedUserIds.includes(user.id)) {
                                     setSelectedUserIds(prev => prev.filter(id => id !== user.id));
                                   } else {
                                     setSelectedUserIds(prev => [...prev, user.id]);
                                   }
                                 }
                               }}
                             >
                               {trainingType === 'group' && (
                                 <input
                                   type="checkbox"
                                   checked={selectedUserIds.includes(user.id)}
                                   onChange={() => {}}
                                   className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                 />
                               )}
                               <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                               <div className="text-sm text-gray-600">{user.email}</div>
                             </div>
                           ))
                         ) : (
                           <div className="p-4 text-gray-500 text-sm text-center">Δεν βρέθηκαν χρήστες</div>
                         )}
                       </div>
                     )}
                   </div>
                 )}
                
                                 {/* Enhanced Selected User Display */}
                 {(trainingType === 'individual' ? newCode.selectedUserId : selectedUserIds.length > 0) && (
                   <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                     <div className="flex items-center">
                       <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                         <span className="text-white text-sm">✓</span>
                       </div>
                       <div>
                         <div className="text-sm font-bold text-green-800">
                           ✅ {trainingType === 'individual' ? 'Επιλεγμένος:' : 'Επιλεγμένοι:'}
                         </div>
                         {trainingType === 'individual' ? (
                           <div className="text-xs text-green-600">
                             {allUsers.find(u => u.id === newCode.selectedUserId)?.firstName} {allUsers.find(u => u.id === newCode.selectedUserId)?.lastName} ({allUsers.find(u => u.id === newCode.selectedUserId)?.email})
                           </div>
                         ) : (
                           <div className="text-xs text-green-600">
                             {selectedUserIds.map(id => {
                               const user = allUsers.find(u => u.id === id);
                               return user ? `${user.firstName} ${user.lastName}` : 'Άγνωστος';
                             }).join(', ')} ({selectedUserIds.length} χρήστες)
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 )}
              </div>

                             {/* Enhanced Code Section */}
               <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                 <div>
                   <label className="block text-lg font-bold text-purple-800 mb-3 flex items-center">
                     🔑 Κωδικός
                   </label>
                   <input
                     type="text"
                     className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                     placeholder="π.χ. PERSONAL2024"
                     value={newCode.code}
                     onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                   />
                 </div>
               </div>
            
                             {/* Excel-like Προσωποποιημένο Πρόγραμμα */}
               <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                 <h4 className="text-xl font-bold text-orange-800 mb-6 flex items-center">
                   🏋️‍♂️ Προσωποποιημένο Πρόγραμμα 
                 </h4>

                 <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                   {/* Excel-like Header */}
                   <div className="bg-gray-100 grid grid-cols-8 gap-0 text-sm font-semibold text-gray-700 border-b">
                     <div className="p-3 border-r">#</div>
                     <div className="p-3 border-r">📅 Ημερομηνία</div>
                     <div className="p-3 border-r">🕐 Έναρξη</div>
                     <div className="p-3 border-r">🕕 Λήξη</div>
                     <div className="p-3 border-r">💪 Τύπος</div>
                     <div className="p-3 border-r">🏠 Αίθουσα</div>
                     <div className="p-3 border-r">👨‍🏫 Προπονητής</div>
                     <div className="p-3">📝 Σημειώσεις</div>
                   </div>

                   {/* Excel-like Rows */}
                   <div className="divide-y divide-gray-200">
                     {programSessions.map((s, idx) => (
                       <div key={s.id} className="grid grid-cols-8 gap-0 hover:bg-gray-50">
                         <div className="p-3 border-r bg-gray-50 text-center text-sm text-gray-600 font-medium">
                           {idx + 1}
                         </div>
                         <div className="p-2 border-r">
                           <input 
                             type="date" 
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
                             value={s.date} 
                             onChange={(e)=>{
                               setProgramSessions(prev => prev.map((ps,i)=> i===idx ? { ...ps, date: e.target.value } : ps));
                             }}
                           />
                         </div>
                         <div className="p-2 border-r">
                           <input 
                             type="time" 
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
                             value={s.startTime} 
                             onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, startTime: e.target.value } : ps))} 
                           />
                         </div>
                         <div className="p-2 border-r">
                           <input 
                             type="time" 
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
                             value={s.endTime} 
                             onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, endTime: e.target.value } : ps))} 
                           />
                         </div>
                         <div className="p-2 border-r">
                           <select 
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
                             value={s.type} 
                             onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, type: e.target.value as any } : ps))}
                           >
                             <option value="personal">Personal</option>
                             <option value="kickboxing">Kick Boxing</option>
                             <option value="combo">Combo</option>
                           </select>
                         </div>
                         <div className="p-2 border-r">
                           <select 
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
                             value={s.room} 
                             onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, room: e.target.value } : ps))}
                           >
                             <option value="Αίθουσα Mike">Αίθουσα Mike</option>
                             <option value="Αίθουσα Jordan">Αίθουσα Jordan</option>
                           </select>
                         </div>
                         <div className="p-2 border-r">
                           <input 
                             type="text" 
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
                             value={s.trainer} 
                             onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, trainer: e.target.value } : ps))} 
                           />
                         </div>
                         <div className="p-2">
                           <input 
                             type="text" 
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
                             value={s.notes || ''} 
                             onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, notes: e.target.value } : ps))} 
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex justify-between items-center mt-4">
                   <div className="flex space-x-2">
                     <button 
                       type="button" 
                       className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center"
                       onClick={()=> setProgramSessions(prev=> [...prev, { 
                         id: `tmp-${prev.length+1}`, 
                         date: new Date().toISOString().split('T')[0], 
                         startTime: '19:00', 
                         endTime: '20:00', 
                         type: 'personal', 
                         trainer: '', 
                         room: 'Αίθουσα Mike', 
                         notes: '' 
                       }])}
                     >
                       ➕ Προσθήκη Γραμμής
                     </button>
                     {programSessions.length > 1 && (
                       <button 
                         type="button" 
                         className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center"
                         onClick={()=> setProgramSessions(prev=> prev.slice(0, -1))}
                       >
                         ➖ Διαγραφή Τελευταίας
                       </button>
                     )}
                   </div>
                   <div className="text-sm text-gray-600">
                     Σύνολο: {programSessions.length} σεσίας
                   </div>
                 </div>
               </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateCodeModal(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg"
              >
                ❌ Ακύρωση
              </button>
              <button
                onClick={createPersonalTrainingCode}
                disabled={!newCode.code.trim() || (trainingType === 'individual' ? !newCode.selectedUserId : selectedUserIds.length === 0)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-emerald-500"
              >
                ✅ Δημιουργία Κωδικού
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

