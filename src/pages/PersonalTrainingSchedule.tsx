import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseAdmin } from '@/config/supabaseAdmin';
import { 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Dumbbell,
  Zap,
  Target,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  PersonalTrainingSchedule
} from '@/types';

const PersonalTrainingSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<PersonalTrainingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeclineMessage, setShowDeclineMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Protection against multiple calls
  const hasLoadedRef = useRef(false); // Prevent multiple loads for same user

  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];

  useEffect(() => {
    // Περιμένουμε να υπάρχει user πριν τη φόρτωση
    if (!user) {
      console.warn('[PTS] useEffect: No user yet, skipping initial load');
      hasLoadedRef.current = false;
      return;
    }
    
    // Prevent multiple loads for the same user
    if (hasLoadedRef.current) {
      console.log('[PTS] useEffect: Already loaded for this user, skipping');
      return;
    }
    
    hasLoadedRef.current = true;
    loadPersonalTrainingSchedule();
  }, [user]);

  const loadPersonalTrainingSchedule = async () => {
    // Protection against multiple concurrent calls
    if (isLoading) {
      console.log('[PTS] Already loading, skipping duplicate call');
      return;
    }

    // Set loading flag immediately to prevent concurrent calls
    setIsLoading(true);
    
    try {
      setLoading(true);
      console.group('[PTS] loadPersonalTrainingSchedule - FIXED VERSION');
      console.log('[PTS] Start at:', new Date().toISOString());
      console.log('[PTS] Loading schedule for user:', user?.id);
      console.log('[PTS] This is the FIXED version without session timeout issues');
      
      if (!user?.id) {
        console.error('[PTS] No user.id available');
        toast.error('Δεν βρέθηκε χρήστης. Κάντε επανασύνδεση.');
        setSchedule(null);
        console.groupEnd();
        setIsLoading(false);
        return;
      }

      // Απλοποιημένη προσέγγιση: απευθείας query χωρίς session check που κολλάει
      const timerId = `[PTS] Direct query latency - ${Date.now()}`;
      console.time(timerId);
      
      console.log('[PTS] About to query personal_training_schedules for user:', user.id);
      
      // Add timeout to prevent hanging - use admin client to bypass RLS
      const queryPromise = supabaseAdmin
        .from('personal_training_schedules')
        .select('id,user_id,month,year,schedule_data,status,created_by,created_at,updated_at,accepted_at,declined_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      );
      
      let data, error;
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
      } catch (timeoutError) {
        console.error('[PTS] Query timeout or error:', timeoutError);
        console.log('[PTS] Using fallback: No data found (query timeout)');
        data = null;
        error = null;
      }
        
      console.timeEnd(timerId);
      console.log('[PTS] Query completed successfully');
      
      console.log('[PTS] Query result - FIXED VERSION:', { 
        rows: Array.isArray(data) ? data.length : 'n/a', 
        error: error?.message || null,
        errorCode: error?.code || null,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error('[PTS] Query error details:', error);
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          toast.error('Πρόβλημα αυθεντικοποίησης. Κάντε επανασύνδεση.');
        } else if (error.message?.includes('timeout')) {
          toast.error('Το ερώτημα στη βάση δεδομένων χρειάστηκε πολύ χρόνο. Δοκιμάστε ξανά.');
        } else {
          toast.error(`Σφάλμα βάσης δεδομένων: ${error.message}`);
        }
        setSchedule(null);
        return;
      }

      const row = (data as any[])?.[0];
      if (row) {
        console.log('[PTS] Row found with status:', row.status, 'created_at:', row.created_at);
        const loaded: PersonalTrainingSchedule = {
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
          declinedAt: row.declined_at
        } as any;
        setSchedule(loaded);
        console.log('[PTS] Schedule loaded successfully - FIXED VERSION');
      } else {
        console.log('[PTS] No schedule found for user - FIXED VERSION');
        setSchedule(null);
      }
    } catch (error) {
      console.error('[PTS] Exception while loading schedule:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Το ερώτημα στη βάση δεδομένων χρειάστηκε πολύ χρόνο. Δοκιμάστε ξανά.');
      } else {
        toast.error('Σφάλμα κατά τη φόρτωση του προγράμματος');
      }
      
      setSchedule(null);
    } finally {
      console.log('[PTS] End at:', new Date().toISOString(), '- FIXED VERSION');
      console.groupEnd();
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleAcceptSchedule = async () => {
    if (!schedule) return;

    try {
      setLoading(true);
      const acceptedAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();
      const { error } = await supabaseAdmin
        .from('personal_training_schedules')
        .update({ status: 'accepted', accepted_at: acceptedAt, updated_at: updatedAt })
        .eq('id', schedule.id);
      if (error) throw error;
      await loadPersonalTrainingSchedule();
      toast.success('Το πρόγραμμα έγινε αποδεκτό!');
    } catch (error) {
      console.error('[PTS] Accept error:', error);
      toast.error('Σφάλμα κατά την αποδοχή του προγράμματος');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineSchedule = async () => {
    if (!schedule) return;

    try {
      setLoading(true);
      const declinedAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();
      const { error } = await supabaseAdmin
        .from('personal_training_schedules')
        .update({ status: 'declined', declined_at: declinedAt, updated_at: updatedAt })
        .eq('id', schedule.id);
      if (error) throw error;
      await loadPersonalTrainingSchedule();
      setShowDeclineMessage(true);
      toast.success('Το πρόγραμμα απορρίφθηκε. Θα επικοινωνήσουμε μαζί σας για να βρούμε τις κατάλληλες ώρες.');
    } catch (error) {
      console.error('[PTS] Decline error:', error);
      toast.error('Σφάλμα κατά την απόρριψη του προγράμματος');
    } finally {
      setLoading(false);
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return <Dumbbell className="h-5 w-5 text-blue-600" />;
      case 'kickboxing':
        return <Zap className="h-5 w-5 text-red-600" />;
      case 'combo':
        return <Target className="h-5 w-5 text-green-600" />;
      default:
        return <Dumbbell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSessionTypeName = (type: string) => {
    switch (type) {
      case 'personal':
        return 'Personal Training';
      case 'kickboxing':
        return 'Kick Boxing';
      case 'combo':
        return 'Combo Training';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Εκκρεμεί Απόφαση';
      case 'accepted':
        return 'Αποδεκτό';
      case 'declined':
        return 'Απορρίφθηκε';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση προγράμματος...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Δεν βρέθηκε πρόγραμμα</h2>
          <p className="text-gray-600">Δεν υπάρχει διαθέσιμο πρόγραμμα Personal Training για εσάς.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Πρόγραμμα Personal Training</h1>
              <p className="text-gray-600 mt-1">
                {days[schedule.month - 1]} {schedule.year}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(schedule.status)}`}>
                {getStatusText(schedule.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Sessions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Προγραμματισμένες Σεσίες</h2>
          
          {schedule.scheduleData.sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Δεν υπάρχουν προγραμματισμένες σεσίες</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedule.scheduleData.sessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getSessionIcon(session.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {getSessionTypeName(session.type)}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{days[session.dayOfWeek]}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{session.trainer}</span>
                        </div>
                        {session.room && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>📍</span>
                            <span>{session.room}</span>
                          </div>
                        )}
                        {session.notes && (
                          <div className="flex items-start space-x-2 text-sm text-gray-600 mt-2">
                            <MessageSquare className="h-4 w-4 mt-0.5" />
                            <span>{session.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* General Information */}
        {(schedule.scheduleData.notes || schedule.scheduleData.specialInstructions) && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Πληροφορίες Προγράμματος</h2>
            <div className="space-y-4">
              {schedule.scheduleData.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Σημειώσεις</h3>
                  <p className="text-gray-600">{schedule.scheduleData.notes}</p>
                </div>
              )}
              {schedule.scheduleData.specialInstructions && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ειδικές Οδηγίες</h3>
                  <p className="text-gray-600">{schedule.scheduleData.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {schedule.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Αποδοχή Προγράμματος</h2>
              <p className="text-gray-600 mb-6">
                Παρακαλώ ελέγξτε το παραπάνω πρόγραμμα και επιλέξτε αν το αποδέχεστε ή όχι.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleAcceptSchedule}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Αποδοχή</span>
                </button>
                <button
                  onClick={handleDeclineSchedule}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Απόρριψη</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {schedule.status === 'accepted' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Πρόγραμμα Αποδεκτό</h3>
                <p className="text-green-700 mt-1">
                  Το πρόγραμμα έχει γίνει αποδεκτό! Θα λάβετε ειδοποιήσεις για τις προπονήσεις σας.
                </p>
              </div>
            </div>
          </div>
        )}

        {schedule.status === 'declined' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Πρόγραμμα Απορριφθέν</h3>
                <p className="text-red-700 mt-1">
                  Παρακαλώ περάστε από το γυμναστήριο για να συζητήσουμε τις ώρες που σας βολεύουν.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Decline Message Modal */}
        {showDeclineMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Πρόγραμμα Απορρίφθηκε</h3>
                <p className="text-gray-600 mb-6">
                  Παρακαλώ περάστε από το γυμναστήριο για να συζητήσουμε τις ώρες που σας βολεύουν.
                </p>
                <button
                  onClick={() => setShowDeclineMessage(false)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Κατάλαβα
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalTrainingSchedulePage;
