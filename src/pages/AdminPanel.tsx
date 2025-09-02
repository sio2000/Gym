import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  User,
  Mail,
  Package,
  Plus,
  Save,
  Edit3,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  MoreHorizontal
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

interface ScheduleEntry {
  id?: string;
  day: number;
  time: string;
  lesson: string;
  trainer: string;
  capacity: number;
  room: string;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  registrationDate: string;
  lastActivity: string;
  avatar?: string;
}

interface AnalyticsData {
  lessonPopularity: { name: string; percentage: number; color: string }[];
  capacityUtilization: { name: string; used: number; total: number; percentage: number }[];
  instructorPerformance: { name: string; classes: number; rating: number; students: number }[];
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'payments' | 'analytics' | 'users'>('schedule');
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const tabs = [
    { id: 'schedule', name: 'Μηνιαίο Πρόγραμμα', icon: Users },
    { id: 'payments', name: 'Αιτήματα Πληρωμών', icon: CreditCard },
    { id: 'analytics', name: 'Αναλυτικά Κρατήσεων', icon: BarChart3 },
    { id: 'users', name: 'Διαχείριση Χρηστών', icon: UserCheck }
  ];

  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Fake pending payments data
  const fakePayments: PendingPayment[] = [
    {
      id: '1',
      amount: 45.00,
      currency: 'EUR',
      paymentMethod: 'Bank Transfer',
      createdAt: '2025-09-01T10:30:00Z',
      expiresAt: '2025-09-03T10:30:00Z',
      user: {
        email: 'maria.papadopoulou@email.com',
        firstName: 'Μαρία',
        lastName: 'Παπαδοπούλου'
      },
      package: {
        name: 'Βασικό Πακέτο',
        credits: 20
      }
    },
    {
      id: '2',
      amount: 80.00,
      currency: 'EUR',
      paymentMethod: 'Cash',
      createdAt: '2025-09-01T14:15:00Z',
      expiresAt: '2025-09-03T14:15:00Z',
      user: {
        email: 'giannis.konstantinou@email.com',
        firstName: 'Γιάννης',
        lastName: 'Κωνσταντίνου'
      },
      package: {
        name: 'Premium Πακέτο',
        credits: 40
      }
    },
    {
      id: '3',
      amount: 35.00,
      currency: 'EUR',
      paymentMethod: 'Bank Transfer',
      createdAt: '2025-09-02T09:45:00Z',
      expiresAt: '2025-09-04T09:45:00Z',
      user: {
        email: 'anna.stefanidou@email.com',
        firstName: 'Άννα',
        lastName: 'Στεφανίδου'
      },
      package: {
        name: 'Βασικό Πακέτο',
        credits: 15
      }
    },
    {
      id: '4',
      amount: 60.00,
      currency: 'EUR',
      paymentMethod: 'Cash',
      createdAt: '2025-09-02T16:20:00Z',
      expiresAt: '2025-09-04T16:20:00Z',
      user: {
        email: 'dimitris.antoniou@email.com',
        firstName: 'Δημήτρης',
        lastName: 'Αντωνίου'
      },
      package: {
        name: 'Standard Πακέτο',
        credits: 30
      }
    },
    {
      id: '5',
      amount: 100.00,
      currency: 'EUR',
      paymentMethod: 'Bank Transfer',
      createdAt: '2025-09-02T11:10:00Z',
      expiresAt: '2025-09-04T11:10:00Z',
      user: {
        email: 'eleni.nikolaou@email.com',
        firstName: 'Ελένη',
        lastName: 'Νικολάου'
      },
      package: {
        name: 'VIP Πακέτο',
        credits: 50
      }
    }
  ];

  // Fake users data
  const fakeUsers: UserData[] = [
    {
      id: '1',
      email: 'maria.p@email.com',
      firstName: 'Μαρία',
      lastName: 'Παπαδάκη',
      role: 'Μέλος',
      status: 'active',
      registrationDate: '14/1/2025',
      lastActivity: '31/8/2025'
    },
    {
      id: '2',
      email: 'giorgos.n@email.com',
      firstName: 'Γιώργος',
      lastName: 'Νικολάου',
      role: 'Εκπαιδευτής',
      status: 'active',
      registrationDate: '19/11/2024',
      lastActivity: '31/8/2025'
    },
    {
      id: '3',
      email: 'sofia.m@email.com',
      firstName: 'Σοφία',
      lastName: 'Μητσοτάκη',
      role: 'Μέλος',
      status: 'inactive',
      registrationDate: '9/3/2025',
      lastActivity: '19/8/2025'
    },
    {
      id: '4',
      email: 'alex.k@email.com',
      firstName: 'Αλέξανδρος',
      lastName: 'Καραμανλής',
      role: 'Εκπαιδευτής',
      status: 'active',
      registrationDate: '4/9/2024',
      lastActivity: '30/8/2025'
    },
    {
      id: '5',
      email: 'katerina.v@email.com',
      firstName: 'Κατερίνα',
      lastName: 'Βλάχου',
      role: 'Μέλος',
      status: 'suspended',
      registrationDate: '27/2/2025',
      lastActivity: '24/8/2025'
    }
  ];

  // Fake analytics data
  const fakeAnalytics: AnalyticsData = {
    lessonPopularity: [
      { name: 'CrossFit', percentage: 24, color: '#ef4444' },
      { name: 'Yoga', percentage: 21, color: '#3b82f6' },
      { name: 'Pilates', percentage: 18, color: '#10b981' },
      { name: 'Spinning', percentage: 17, color: '#f59e0b' },
      { name: 'Zumba', percentage: 11, color: '#8b5cf6' },
      { name: 'Boxing', percentage: 9, color: '#06b6d4' }
    ],
    capacityUtilization: [
      { name: 'Yoga', used: 85, total: 100, percentage: 85.0 },
      { name: 'Pilates', used: 72, total: 80, percentage: 90.0 },
      { name: 'CrossFit', used: 95, total: 100, percentage: 95.0 },
      { name: 'Spinning', used: 68, total: 75, percentage: 90.7 },
      { name: 'Zumba', used: 45, total: 60, percentage: 75.0 },
      { name: 'Boxing', used: 38, total: 50, percentage: 76.0 }
    ],
    instructorPerformance: [
      { name: 'Σάρα Ι.', classes: 24, rating: 4.9, students: 156 },
      { name: 'Μάρκος Κ.', classes: 18, rating: 4.7, students: 142 },
      { name: 'Άννα Π.', classes: 22, rating: 4.8, students: 134 },
      { name: 'Γιάννης Λ.', classes: 16, rating: 4.6, students: 98 }
    ]
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPendingPayments();
    } else if (activeTab === 'schedule') {
      loadSchedule();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      // Use fake data for now since the API has issues
      setPendingPayments(fakePayments);
      
      // Using fake data for now
      console.log('Using fake payments data');
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση των πληρωμών');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(fakeUsers);
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση των χρηστών');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setAnalytics(fakeAnalytics);
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση των αναλυτικών');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      setLoading(true);
      // Using mock data for now
      const mockSchedule: ScheduleEntry[] = [
        { id: '1', day: 1, time: '09:00', lesson: 'Pilates', trainer: 'Μαρία Παπαδοπούλου', capacity: 12, room: 'Αίθουσα 1' },
        { id: '2', day: 1, time: '18:00', lesson: 'Kick Boxing', trainer: 'Γιάννης Κωνσταντίνου', capacity: 15, room: 'Αίθουσα 2' },
        { id: '3', day: 2, time: '10:00', lesson: 'Personal Training', trainer: 'Αννα Στεφανίδου', capacity: 1, room: 'Αίθουσα 3' },
        { id: '4', day: 3, time: '19:00', lesson: 'Ελεύθερο Gym', trainer: 'Δημήτρης Αντωνίου', capacity: 20, room: 'Κύρια Αίθουσα' },
      ];
      setSchedule(mockSchedule);
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση του προγράμματος');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'approved' | 'rejected') => {
    try {
      // Remove from local state immediately for better UX
      setPendingPayments(prev => prev.filter(p => p.id !== paymentId));
      
      // Payment processed locally
      console.log('Payment processed locally');

      toast.success(`Η πληρωμή ${action === 'approved' ? 'εγκρίθηκε' : 'απορρίφθηκε'} επιτυχώς`);
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
      // Schedule saved locally
      toast.success('Το πρόγραμμα αποθηκεύτηκε τοπικά!');
      setEditingSchedule(false);
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

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success(`Ο χρήστης ${action === 'suspend' ? 'αναστάλη' : action === 'activate' ? 'ενεργοποιήθηκε' : 'διαγράφηκε'} επιτυχώς`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Εκπαιδευτής': return 'bg-green-100 text-green-800';
      case 'Μέλος': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

          {/* Schedule Tab - Μηνιαίο Πρόγραμμα */}
          {activeTab === 'schedule' && !loading && (
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
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
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

          {/* Analytics Tab */}
          {activeTab === 'analytics' && !loading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Αναλυτικά Κρατήσεων</h2>
                <div className="flex items-center space-x-4">
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                    <option>Αυτή την εβδομάδα</option>
                    <option>Αυτόν τον μήνα</option>
                    <option>Τελευταίους 3 μήνες</option>
                  </select>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                    <TrendingUp className="h-4 w-4" />
                    <span>Εξαγωγή</span>
                  </button>
                </div>
              </div>

              {/* Navigation tabs for analytics */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                    Μαθήματα
                  </button>
                  <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                    Εκπαιδευτές
                  </button>
                  <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                    Τάσεις
                  </button>
                </nav>
              </div>

              {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lesson Popularity */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Δημοφιλία Μαθημάτων</h3>
                    <div className="space-y-4">
                      {analytics.lessonPopularity.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: lesson.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">{lesson.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{lesson.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capacity Utilization */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Χρήση Χωρητικότητας</h3>
                    <div className="space-y-4">
                      {analytics.capacityUtilization.map((lesson, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{lesson.name}</span>
                            <span className="text-sm text-gray-600">{lesson.used}/{lesson.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${lesson.percentage > 90 ? 'bg-red-500' : 'bg-orange-500'}`}
                              style={{ width: `${lesson.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">{lesson.percentage}% χρήση</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructor Performance */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Απόδοση Εκπαιδευτών</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {analytics.instructorPerformance.map((instructor, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{instructor.name}</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Μαθήματα:</span>
                              <span className="font-medium">{instructor.classes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Αξιολόγηση:</span>
                              <span className="font-medium">★ {instructor.rating}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Μαθητές:</span>
                              <span className="font-medium">{instructor.students}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Διαχείριση Χρηστών</h2>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Αναζήτηση χρηστών..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Όλοι οι ρόλοι</option>
                  <option value="μέλος">Μέλος</option>
                  <option value="εκπαιδευτής">Εκπαιδευτής</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Όλες οι καταστάσεις</option>
                  <option value="active">Ενεργός</option>
                  <option value="inactive">Ανενεργός</option>
                  <option value="suspended">Αναστολή</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Χρήστης</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ρόλος</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Κατάσταση</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Εγγραφή</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Τελευταία Δραστηριότητα</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Ενεργός' : user.status === 'inactive' ? 'Ανενεργός' : 'Αναστολή'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.registrationDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.lastActivity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Αναστολή"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="text-green-600 hover:text-green-900"
                                title="Ενεργοποίηση"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                              title="Διαγραφή"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900" title="Περισσότερες ενέργειες">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>Δεν βρέθηκαν χρήστες</p>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Αιτήματα Πληρωμών</h2>
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
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-purple-600" />
                              <span className="text-sm text-gray-600">
                                {payment.paymentMethod}
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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;