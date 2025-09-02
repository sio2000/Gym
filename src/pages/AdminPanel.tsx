import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/config/api';
import { 
  CreditCard, 
  Users, 
  BarChart3, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  User,
  Mail,
  Package,
  TrendingUp,
  Activity,
  Plus,
  Save,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingPayment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: string;
  expiresAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  package: {
    name: string;
    credits: number;
  } | null;
}

interface AdminStats {
  totalUsers: number;
  activeMemberships: number;
  totalRevenue: number;
  pendingPayments: number;
  monthlyRevenue: number;
  totalLessons: number;
}

interface ScheduleEntry {
  id?: string;
  day: number;
  time: string;
  lesson: string;
  trainer: string;
  capacity: number;
  room: string;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'stats'>('users');
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);

  const tabs = [
    { id: 'users', name: 'Διαχείριση Χρηστών', icon: Users },
    { id: 'payments', name: 'Διαχείριση Πληρωμών', icon: CreditCard },
    { id: 'stats', name: 'Στατιστικά', icon: BarChart3 }
  ];

  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPendingPayments();
    } else if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'users') {
      loadSchedule();
    }
  }, [activeTab]);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ payments: PendingPayment[] }>(
        '/memberships/payments/pending',
        { token: localStorage.getItem('freegym_token') || '' }
      );
      if (response.success && response.data) {
        setPendingPayments(response.data.payments);
      }
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση των πληρωμών');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ stats: AdminStats }>(
        '/dashboard/admin',
        { token: localStorage.getItem('freegym_token') || '' }
      );
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση των στατιστικών');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ schedule: any[] }>(
        '/schedule',
        { token: localStorage.getItem('freegym_token') || '' }
      );
      if (response.success && response.data) {
        const formattedSchedule = response.data.schedule.map((entry: any) => ({
          id: entry.id,
          day: entry.day_of_week,
          time: entry.start_time,
          lesson: entry.lesson_name,
          trainer: entry.trainer_name,
          capacity: entry.capacity,
          room: entry.room
        }));
        setSchedule(formattedSchedule);
      }
    } catch (error) {
      // Fallback to mock data if API fails
      const mockSchedule: ScheduleEntry[] = [
        { id: '1', day: 1, time: '09:00', lesson: 'Pilates', trainer: 'Μαρία Παπαδοπούλου', capacity: 12, room: 'Αίθουσα 1' },
        { id: '2', day: 1, time: '18:00', lesson: 'Kick Boxing', trainer: 'Γιάννης Κωνσταντίνου', capacity: 15, room: 'Αίθουσα 2' },
        { id: '3', day: 2, time: '10:00', lesson: 'Personal Training', trainer: 'Αννα Στεφανίδου', capacity: 1, room: 'Αίθουσα 3' },
        { id: '4', day: 3, time: '19:00', lesson: 'Ελεύθερο Gym', trainer: 'Δημήτρης Αντωνίου', capacity: 20, room: 'Κύρια Αίθουσα' },
      ];
      setSchedule(mockSchedule);
      toast.error('Σφάλμα κατά τη φόρτωση του προγράμματος - χρησιμοποιούνται δοκιμαστικά δεδομένα');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'approved' | 'rejected') => {
    try {
      const response = await apiFetch(
        `/memberships/payments/${paymentId}/approve`,
        {
          method: 'PUT',
          body: { status: action },
          token: localStorage.getItem('freegym_token') || ''
        }
      );

      if (response.success) {
        toast.success(`Η πληρωμή ${action === 'approved' ? 'εγκρίθηκε' : 'απορρίφθηκε'} επιτυχώς`);
        loadPendingPayments();
      }
    } catch (error) {
      toast.error('Σφάλμα κατά την επεξεργασία της πληρωμής');
    }
  };

  const addScheduleEntry = () => {
    const newEntry: ScheduleEntry = {
      day: 1,
      time: '09:00',
      lesson: '',
      trainer: '',
      capacity: 10,
      room: ''
    };
    setSchedule([...schedule, newEntry]);
  };

  const updateScheduleEntry = (index: number, field: keyof ScheduleEntry, value: any) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const removeScheduleEntry = (index: number) => {
    const updated = schedule.filter((_, i) => i !== index);
    setSchedule(updated);
  };

  const saveSchedule = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(
        '/schedule',
        {
          method: 'POST',
          body: { schedule },
          token: localStorage.getItem('freegym_token') || ''
        }
      );

      if (response.success) {
        toast.success('Το πρόγραμμα αποθηκεύτηκε επιτυχώς!');
        setEditingSchedule(false);
        loadSchedule(); // Reload to get updated data
      }
    } catch (error) {
      toast.error('Σφάλμα κατά την αποθήκευση του προγράμματος');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
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
        <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Συστήματος</h1>
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

          {/* Users Tab - Μηνιαίο Πρόγραμμα */}
          {activeTab === 'users' && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Μηνιαίο Πρόγραμμα Γυμναστηρίου</h2>
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
                        onClick={addScheduleEntry}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Προσθήκη</span>
                      </button>
                      <button
                        onClick={saveSchedule}
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

              {/* Excel-style Schedule Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Ημέρα</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Ώρα</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Μάθημα</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Προπονητής</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Χωρητικότητα</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Αίθουσα</th>
                      {editingSchedule && (
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Ενέργειες</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((entry, index) => (
                      <tr key={entry.id || index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {editingSchedule ? (
                            <select
                              value={entry.day}
                              onChange={(e) => updateScheduleEntry(index, 'day', parseInt(e.target.value))}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                            >
                              {days.map((day, dayIndex) => (
                                <option key={dayIndex} value={dayIndex}>{day}</option>
                              ))}
                            </select>
                          ) : (
                            days[entry.day]
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {editingSchedule ? (
                            <select
                              value={entry.time}
                              onChange={(e) => updateScheduleEntry(index, 'time', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                            >
                              {timeSlots.map((time) => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          ) : (
                            entry.time
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {editingSchedule ? (
                            <input
                              type="text"
                              value={entry.lesson}
                              onChange={(e) => updateScheduleEntry(index, 'lesson', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              placeholder="Όνομα μαθήματος"
                            />
                          ) : (
                            entry.lesson
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {editingSchedule ? (
                            <input
                              type="text"
                              value={entry.trainer}
                              onChange={(e) => updateScheduleEntry(index, 'trainer', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              placeholder="Όνομα προπονητή"
                            />
                          ) : (
                            entry.trainer
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {editingSchedule ? (
                            <input
                              type="number"
                              value={entry.capacity}
                              onChange={(e) => updateScheduleEntry(index, 'capacity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              min="1"
                            />
                          ) : (
                            entry.capacity
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {editingSchedule ? (
                            <input
                              type="text"
                              value={entry.room}
                              onChange={(e) => updateScheduleEntry(index, 'room', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1"
                              placeholder="Αίθουσα"
                            />
                          ) : (
                            entry.room
                          )}
                        </td>
                        {editingSchedule && (
                          <td className="border border-gray-300 px-4 py-2">
                            <button
                              onClick={() => removeScheduleEntry(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {schedule.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>Δεν υπάρχουν προγραμματισμένα μαθήματα</p>
                  {editingSchedule && (
                    <button
                      onClick={addScheduleEntry}
                      className="mt-4 flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Προσθήκη πρώτου μαθήματος</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Εκκρεμείς Πληρωμές</h2>
                <button
                  onClick={loadPendingPayments}
                  className="btn-secondary text-sm"
                >
                  Ανανέωση
                </button>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>Δεν υπάρχουν εκκρεμείς πληρωμές</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {payment.user.firstName} {payment.user.lastName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{payment.user.email}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <Euro className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-600">
                                {formatCurrency(payment.amount)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">
                                {payment.package?.name} ({payment.package?.credits} πιστώσεις)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-gray-600">
                                {formatDate(payment.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePaymentAction(payment.id, 'approved')}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Έγκριση</span>
                          </button>
                          <button
                            onClick={() => handlePaymentAction(payment.id, 'rejected')}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Απόρριψη</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && !loading && stats && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Στατιστικά Συστήματος</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Συνολικοί Χρήστες</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Ενεργές Συνδρομές</p>
                      <p className="text-2xl font-bold text-green-900">{stats.activeMemberships}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Euro className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Συνολικά Έσοδα</p>
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Εκκρεμείς Πληρωμές</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.pendingPayments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-indigo-600">Μηνιαία Έσοδα</p>
                      <p className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.monthlyRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-pink-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-pink-600">Συνολικά Μαθήματα</p>
                      <p className="text-2xl font-bold text-pink-900">{stats.totalLessons}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;