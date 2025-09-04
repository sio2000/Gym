import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseAdmin } from '@/config/supabaseAdmin';
import { 
  CreditCard, 
  User,
  Plus,
  Save,
  Edit3,
  BarChart3,
  UserCheck,
  Calendar,
  Key,
  Trash2
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
  const [personalTrainingUsers, setPersonalTrainingUsers] = useState<UserWithPersonalTraining[]>([]);
  const [allUsers, setAllUsers] = useState<UserWithPersonalTraining[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithPersonalTraining | null>(null);
  const [personalTrainingSchedule, setPersonalTrainingSchedule] = useState<PersonalTrainingSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [newCode, setNewCode] = useState({ 
    code: '', 
    packageType: 'personal' as 'personal' | 'kickboxing' | 'combo',
    selectedUserId: '' 
  });
  // Προσωποποιημένο πρόγραμμα που θα σταλεί μαζί με τον κωδικό (demo αποθήκευση σε localStorage)
  const [programTrainer, setProgramTrainer] = useState('');
  const [programNotes, setProgramNotes] = useState('');
  const [programSessions, setProgramSessions] = useState<PersonalTrainingSession[]>([
    { id: 'tmp-1', dayOfWeek: 1, startTime: '18:00', endTime: '19:00', type: 'personal', trainer: '', room: 'Αίθουσα Personal Training', notes: '' }
  ]);

  const tabs = [
    { id: 'personal-training', name: 'Personal Training Πρόγραμμα', icon: Calendar },
    { id: 'payments', name: 'Αιτήματα Πληρωμών', icon: CreditCard },
    { id: 'analytics', name: 'Αναλυτικά Κρατήσεων', icon: BarChart3 },
    { id: 'users', name: 'Διαχείριση Χρηστών', icon: UserCheck }
  ];

  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Load all users from the database
  const loadAllUsers = async () => {
    try {
      setLoading(true);
      console.log('Starting to load users from database...');
      
      // Fetch all users from user_profiles table using admin client
      console.log('Querying user_profiles table with admin client...');
      const { data: userProfiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Query result:', { userProfiles, profilesError });

      if (profilesError) {
        console.error('Database error:', profilesError);
        throw profilesError;
      }

      console.log('Loaded user profiles:', userProfiles);
      console.log('Number of user profiles loaded:', userProfiles?.length || 0);

      // Transform user profiles to the format we need
      const usersWithAuthData = userProfiles?.map(profile => {
        const transformedUser = {
          id: profile.user_id,
          email: profile.email || `user-${profile.user_id.slice(0, 8)}@example.com`, // Use the email from user_profiles table
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          hasPersonalTrainingCode: false, // Will be updated when we check for codes
          personalTrainingCode: undefined,
          packageType: undefined
        } as UserWithPersonalTraining;
        
        console.log('Transformed user:', transformedUser);
        return transformedUser;
      }) || [];

      console.log('All transformed users:', usersWithAuthData);
      console.log('Number of transformed users:', usersWithAuthData.length);
      setAllUsers(usersWithAuthData);
      
      // Check which users have personal training codes
      await checkPersonalTrainingCodes(usersWithAuthData);
      
    } catch (error) {
      console.error('Error loading users:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint
      });
      toast.error(`Σφάλμα κατά τη φόρτωση των χρηστών: ${(error as any)?.message || 'Unknown error'}`);
      
      // Fallback to mock data if database fails
      const mockAllUsers = [
        {
          id: '550e8400-e29b-41d4-a716-446655440060',
          email: 'user1@freegym.gr',
          firstName: 'Γιώργος',
          lastName: 'Δημητρίου',
          hasPersonalTrainingCode: false
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440061',
          email: 'user2@freegym.gr',
          firstName: 'Αννα',
          lastName: 'Παπαδοπούλου',
          hasPersonalTrainingCode: false
        }
      ];
      console.log('Using fallback mock data:', mockAllUsers);
      setAllUsers(mockAllUsers);
    } finally {
      setLoading(false);
    }
  };

  // Check which users have personal training codes
  const checkPersonalTrainingCodes = async (users: UserWithPersonalTraining[]) => {
    try {
      // For now, we'll use mock data for personal training codes
      // In a real implementation, you would query the personal_training_codes table
      const mockPersonalTrainingCodes = [
        { userId: '550e8400-e29b-41d4-a716-446655440060', code: 'PERSONAL2024', packageType: 'personal' as const },
        { userId: '550e8400-e29b-41d4-a716-446655440061', code: 'KICKBOX2024', packageType: 'kickboxing' as const }
      ];

      const updatedUsers = users.map(user => {
        const codeData = mockPersonalTrainingCodes.find(code => code.userId === user.id);
        if (codeData) {
          return {
            ...user,
            hasPersonalTrainingCode: true,
            personalTrainingCode: codeData.code,
            packageType: codeData.packageType
          };
        }
        return user;
      });

      console.log('Updated users with codes:', updatedUsers);
      setAllUsers(updatedUsers);
      setPersonalTrainingUsers(updatedUsers.filter(u => u.hasPersonalTrainingCode));
    } catch (error) {
      console.error('Error checking personal training codes:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'personal-training') {
      loadAllUsers();
    }
  }, [activeTab]);

  const loadPersonalTrainingUsers = async () => {
    // This function is now handled by loadAllUsers
    await loadAllUsers();
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing admin database connection...');
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      console.log('Admin connection test result:', { data, error });
      
      if (error) {
        toast.error(`Admin database connection failed: ${error.message}`);
      } else {
        toast.success('Admin database connection successful!');
      }
    } catch (error) {
      console.error('Admin connection test error:', error);
      toast.error(`Admin connection test failed: ${(error as any)?.message}`);
    }
  };

  const loadPersonalTrainingSchedule = async (userId: string) => {
    try {
      setLoading(true);
      // Mock schedule data
      const mockSchedule: PersonalTrainingSchedule = {
        id: '1',
        userId: userId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        scheduleData: {
          sessions: [
            {
              id: '1',
              dayOfWeek: 1, // Monday
              startTime: '18:00',
              endTime: '19:00',
              type: 'personal',
              trainer: 'Μαρία Παπαδοπούλου',
              room: 'Αίθουσα Personal Training',
              notes: 'Ατομική προπόνηση - Δύναμη'
            },
            {
              id: '2',
              dayOfWeek: 3, // Wednesday
              startTime: '19:00',
              endTime: '20:00',
              type: 'personal',
              trainer: 'Μαρία Παπαδοπούλου',
              room: 'Αίθουσα Personal Training',
              notes: 'Ατομική προπόνηση - Καρδιο'
            },
            {
              id: '3',
              dayOfWeek: 5, // Friday
              startTime: '18:30',
              endTime: '19:30',
              type: 'personal',
              trainer: 'Μαρία Παπαδοπούλου',
              room: 'Αίθουσα Personal Training',
              notes: 'Ατομική προπόνηση - Συνδυασμός'
            }
          ],
          notes: 'Προσωποποιημένο πρόγραμμα για τον χρήστη',
          trainer: 'Μαρία Παπαδοπούλου',
          specialInstructions: 'Εστίαση στη βελτίωση της δύναμης και της αντοχής'
        },
        status: 'pending',
        createdBy: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPersonalTrainingSchedule(mockSchedule);
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση του προγράμματος');
    } finally {
      setLoading(false);
    }
  };

  // Personal Training functions
  const handleUserSelect = (selectedUser: UserWithPersonalTraining) => {
    setSelectedUser(selectedUser);
    loadPersonalTrainingSchedule(selectedUser.id);
  };

  const addPersonalTrainingSession = () => {
    if (!personalTrainingSchedule) return;
    
    const newSession: PersonalTrainingSession = {
      id: Date.now().toString(),
      dayOfWeek: 1,
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
    if (!newCode.code.trim()) {
      toast.error('Παρακαλώ εισάγετε κωδικό');
      return;
    }

    if (!newCode.selectedUserId) {
      toast.error('Παρακαλώ επιλέξτε χρήστη');
      return;
    }

    try {
      setLoading(true);
      console.log('[ADMIN] Starting to create personal training code...');
      
      // Find the selected user
      const selectedUser = allUsers.find(user => user.id === newCode.selectedUserId);
      
      if (!selectedUser) {
        toast.error('Ο επιλεγμένος χρήστης δεν βρέθηκε');
        return;
      }

      console.log('[ADMIN] Selected user:', selectedUser.firstName, selectedUser.lastName, 'ID:', selectedUser.id);
      console.log('[ADMIN] Admin user ID:', user?.id);
      console.log('[ADMIN] Code to create:', newCode.code.trim());

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

      // Δημιουργία και αποθήκευση κωδικού + προσωποποιημένου προγράμματος στη βάση (Supabase)
      console.log('[ADMIN] Inserting code into personal_training_codes...');
      const { error: codeError } = await supabaseAdmin
        .from('personal_training_codes')
        .insert({
          code: newCode.code.trim(),
          package_type: newCode.packageType,
          created_by: user?.id,
          is_active: true,
          used_by: selectedUser.id,
          used_at: new Date().toISOString()
        });
      
      if (codeError) {
        console.error('[ADMIN] Code insertion error:', codeError);
        throw codeError;
      }
      
      console.log('[ADMIN] Code inserted successfully');

      const scheduleSessions: PersonalTrainingSession[] = programSessions.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        type: s.type,
        trainer: s.trainer || programTrainer || 'Προπονητής',
        room: s.room,
        notes: s.notes
      }));

      const schedulePayload = {
        user_id: selectedUser.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        schedule_data: {
          sessions: scheduleSessions,
          notes: programNotes,
          trainer: programTrainer || scheduleSessions[0]?.trainer || 'Προπονητής',
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

      toast.success(`Ο κωδικός ${newCode.code} δημιουργήθηκε επιτυχώς για τον χρήστη ${selectedUser.firstName} ${selectedUser.lastName}!`);
      setShowCreateCodeModal(false);
      setNewCode({ code: '', packageType: 'personal', selectedUserId: '' });
      setProgramTrainer('');
      setProgramNotes('');
      setProgramSessions([{ id: 'tmp-1', dayOfWeek: 1, startTime: '18:00', endTime: '19:00', type: 'personal', trainer: '', room: 'Αίθουσα Personal Training', notes: '' }]);
      
      // Refresh the users list to show the new code
      loadPersonalTrainingUsers();
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Χρηστών</h1>
        <p className="text-gray-600 mt-1">Καλώς ήρθες, {user.firstName}! Διαχειριστείτε το γυμναστήριο από εδώ.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
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
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Personal Training Πρόγραμμα</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={testDatabaseConnection}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>🔗</span>
                    <span>Test DB</span>
                  </button>
                  <button
                    onClick={loadAllUsers}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>🔄</span>
                    <span>Ανανέωση Χρηστών</span>
                  </button>
                  <button
                    onClick={() => setShowCreateCodeModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    <span>Δημιουργία Κωδικού</span>
                  </button>
                </div>
              </div>

              {/* Debug Info */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Debug Info:</h3>
                <p className="text-sm text-gray-600">
                  Σύνολο χρηστών: {allUsers.length} | 
                  Χρήστες με Personal Training: {personalTrainingUsers.length}
                </p>
                {allUsers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Πρώτοι 3 χρήστες:</p>
                    {allUsers.slice(0, 3).map(user => (
                      <p key={user.id} className="text-xs text-gray-500">
                        {user.firstName} {user.lastName} ({user.email})
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Users with Personal Training Codes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalTrainingUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.packageType === 'personal' ? 'bg-blue-100 text-blue-800' :
                            user.packageType === 'kickboxing' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.packageType === 'personal' ? 'Personal Training' :
                             user.packageType === 'kickboxing' ? 'Kick Boxing' : 'Combo'}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">{user.personalTrainingCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Schedule Editor */}
              {selectedUser && personalTrainingSchedule && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Πρόγραμμα για {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {days[personalTrainingSchedule.month - 1]} {personalTrainingSchedule.year}
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
                              <select
                                value={session.dayOfWeek}
                                onChange={(e) => updatePersonalTrainingSession(session.id, 'dayOfWeek', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                              >
                                {days.map((day, index) => (
                                  <option key={index} value={index}>{day}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="text-sm text-gray-900">{days[session.dayOfWeek]}</p>
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

      {/* Create Code Modal */}
      {showCreateCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Δημιουργία Κωδικού Personal Training</h3>
              <button
                onClick={() => setShowCreateCodeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Επιλογή Χρήστη</label>
                <select
                  className="input-field"
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
                {/* Debug info for dropdown */}
                <div className="text-xs text-gray-500 mt-1">
                  Debug: {allUsers.length} χρήστες διαθέσιμοι
                </div>
              </div>

              <div>
                <label className="form-label">Κωδικός</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="π.χ. PERSONAL2024"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                />
              </div>
              
              <div>
                <label className="form-label">Τύπος Πακέτου</label>
                <select
                  className="input-field"
                  value={newCode.packageType}
                  onChange={(e) => setNewCode({ ...newCode, packageType: e.target.value as any })}
                >
                  <option value="personal">Personal Training</option>
                  <option value="kickboxing">Kick Boxing</option>
                  <option value="combo">Combo</option>
                </select>
              </div>

              {/* Προσωποποιημένο Πρόγραμμα */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Προσωποποιημένο Πρόγραμμα</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="form-label">Προπονητής</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="π.χ. Μαρία Παπαδοπούλου"
                      value={programTrainer}
                      onChange={(e) => setProgramTrainer(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Γενικές Σημειώσεις</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Σύντομες οδηγίες ή στόχοι"
                      value={programNotes}
                      onChange={(e) => setProgramNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {programSessions.map((s, idx) => (
                    <div key={s.id} className="grid grid-cols-1 md:grid-cols-6 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Ημέρα</label>
                        <select className="input-field" value={s.dayOfWeek} onChange={(e)=>{
                          const v = parseInt(e.target.value);
                          setProgramSessions(prev => prev.map((ps,i)=> i===idx ? { ...ps, dayOfWeek: v } : ps));
                        }}>
                          <option value={0}>Κυριακή</option>
                          <option value={1}>Δευτέρα</option>
                          <option value={2}>Τρίτη</option>
                          <option value={3}>Τετάρτη</option>
                          <option value={4}>Πέμπτη</option>
                          <option value={5}>Παρασκευή</option>
                          <option value={6}>Σάββατο</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Έναρξη</label>
                        <input type="time" className="input-field" value={s.startTime} onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, startTime: e.target.value } : ps))} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Λήξη</label>
                        <input type="time" className="input-field" value={s.endTime} onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, endTime: e.target.value } : ps))} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Τύπος</label>
                        <select className="input-field" value={s.type} onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, type: e.target.value as any } : ps))}>
                          <option value="personal">Personal</option>
                          <option value="kickboxing">Kick Boxing</option>
                          <option value="combo">Combo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Προπονητής</label>
                        <input className="input-field" type="text" value={s.trainer} onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, trainer: e.target.value } : ps))} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Σημειώσεις</label>
                        <input className="input-field" type="text" value={s.notes || ''} onChange={(e)=> setProgramSessions(prev=> prev.map((ps,i)=> i===idx ? { ...ps, notes: e.target.value } : ps))} />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <button type="button" className="px-3 py-1 border rounded hover:bg-gray-50" onClick={()=> setProgramSessions(prev=> [...prev, { id: `tmp-${prev.length+1}`, dayOfWeek: 3, startTime: '19:00', endTime: '20:00', type: 'personal', trainer: '', room: 'Αίθουσα Personal Training', notes: '' }])}>Προσθήκη Σεσίας</button>
                    {programSessions.length > 1 && (
                      <button type="button" className="px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50" onClick={()=> setProgramSessions(prev=> prev.slice(0, -1))}>Αφαίρεση Τελευταίας</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateCodeModal(false)}
                className="btn-secondary flex-1"
              >
                Ακύρωση
              </button>
              <button
                onClick={createPersonalTrainingCode}
                disabled={!newCode.code.trim() || !newCode.selectedUserId}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Δημιουργία
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

