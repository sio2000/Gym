import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockLessons, mockBookings } from '@/data/mockData';
import { Calendar, Users, StickyNote, BarChart2, CheckCircle, XCircle, UserCheck, UserX, Edit3, Save, Plus } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lessonId: string;
  lessonName: string;
  date: string;
  attended: boolean;
}

interface PerformanceNote {
  id: string;
  userId: string;
  userName: string;
  note: string;
  createdAt: string;
}

const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance' | 'notes'>('schedule');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [performanceNotes, setPerformanceNotes] = useState<PerformanceNote[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // Lessons που ανήκουν στον συγκεκριμένο trainer
  const trainerLessons = useMemo(() => {
    return mockLessons.filter(l => l.trainerId === (user?.id || ''));
  }, [user?.id]);

  // Συμμετέχοντες ανά μάθημα (mock bookings)
  const participantsByLesson: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    mockBookings.forEach(b => {
      const lesson = mockLessons.find(l => l.id === b.lessonId);
      if (lesson && lesson.trainerId === (user?.id || '')) {
        map[lesson.id] = (map[lesson.id] || 0) + 1;
      }
    });
    return map;
  }, [user?.id]);

  // Στατιστικά trainer
  const stats = useMemo(() => {
    const totalLessons = trainerLessons.length;
    const totalParticipants = Object.values(participantsByLesson).reduce((a, b) => a + b, 0);
    return { totalLessons, totalParticipants };
  }, [trainerLessons, participantsByLesson]);

  // Fake attendance data
  const fakeAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Μαρία Παπαδάκη',
      userEmail: 'maria.p@email.com',
      lessonId: '1',
      lessonName: 'Pilates',
      date: '2024-01-22T09:00:00Z',
      attended: true
    },
    {
      id: '2',
      userId: '2',
      userName: 'Γιώργος Νικολάου',
      userEmail: 'giorgos.n@email.com',
      lessonId: '1',
      lessonName: 'Pilates',
      date: '2024-01-22T09:00:00Z',
      attended: false
    },
    {
      id: '3',
      userId: '3',
      userName: 'Σοφία Μητσοτάκη',
      userEmail: 'sofia.m@email.com',
      lessonId: '2',
      lessonName: 'Kick Boxing',
      date: '2024-01-23T20:00:00Z',
      attended: true
    }
  ];

  // Fake performance notes
  const fakePerformanceNotes: PerformanceNote[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Μαρία Παπαδάκη',
      note: 'Χρειάζεται βελτίωση στο posture. Προτείνω περισσότερες ασκήσεις ενδυνάμωσης κορμού.',
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Γιώργος Νικολάου',
      note: 'Εξαιρετική πρόοδος! Έχει βελτιώσει σημαντικά την αντοχή του.',
      createdAt: '2024-01-18T14:30:00Z'
    }
  ];

  // Initialize fake data
  React.useEffect(() => {
    setAttendanceRecords(fakeAttendanceRecords);
    setPerformanceNotes(fakePerformanceNotes);
  }, []);

  const handleAttendanceToggle = (recordId: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, attended: !record.attended }
          : record
      )
    );
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: PerformanceNote = {
        id: Date.now().toString(),
        userId: '1', // Mock user ID
        userName: 'Νέος Χρήστης',
        note: newNote,
        createdAt: new Date().toISOString()
      };
      setPerformanceNotes(prev => [note, ...prev]);
      setNewNote('');
    }
  };

  const handleEditNote = (noteId: string, newText: string) => {
    setPerformanceNotes(prev => 
      prev.map(note => 
        note.id === noteId 
          ? { ...note, note: newText }
          : note
      )
    );
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    setPerformanceNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const tabs = [
    { id: 'schedule', name: 'Μηνιαίο Πρόγραμμα', icon: Calendar },
    { id: 'attendance', name: 'Σύστημα Απουσιών', icon: UserCheck },
    { id: 'notes', name: 'Performance Notes', icon: StickyNote }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Πίνακας Ελέγχου</h1>
          <p className="text-gray-600">Συγκεντρωτική εικόνα για τα μαθήματά σου</p>
        </div>
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
          {/* Στατιστικά */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg"><BarChart2 className="h-6 w-6 text-blue-600"/></div>
                <div>
                  <p className="text-sm text-gray-600">Σύνολο Μαθημάτων</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.totalLessons}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg"><Users className="h-6 w-6 text-green-600"/></div>
                <div>
                  <p className="text-sm text-gray-600">Συνολικοί Συμμετέχοντες</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.totalParticipants}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-lg"><StickyNote className="h-6 w-6 text-yellow-600"/></div>
                <div>
                  <p className="text-sm text-gray-600">Σημείωση</p>
                  <p className="text-sm text-gray-800">Ενημέρωσε τον admin για αλλαγές προγράμματος.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Μηνιαίο Πρόγραμμα</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4"><Calendar className="inline h-4 w-4 mr-1"/>Μάθημα</th>
                      <th className="py-2 pr-4">Κατηγορία</th>
                      <th className="py-2 pr-4">Ημέρα</th>
                      <th className="py-2 pr-4">Ώρες</th>
                      <th className="py-2 pr-4">Χωρητικότητα</th>
                      <th className="py-2 pr-4">Συμμετέχοντες</th>
                      <th className="py-2 pr-4">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerLessons.map(lesson => (
                      lesson.schedule.map(s => (
                        <tr key={`${lesson.id}-${s.id}`} className="border-t">
                          <td className="py-2 pr-4 font-medium text-gray-900">{lesson.name}</td>
                          <td className="py-2 pr-4 capitalize">{lesson.category}</td>
                          <td className="py-2 pr-4">{['Κυρ','Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ'][s.dayOfWeek]}</td>
                          <td className="py-2 pr-4">{s.startTime} - {s.endTime}</td>
                          <td className="py-2 pr-4">{lesson.capacity}</td>
                          <td className="py-2 pr-4">
                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                              {participantsByLesson[lesson.id] || 0} (κλικ για λεπτομέρειες)
                            </button>
                          </td>
                          <td className="py-2 pr-4">
                            <button className="text-green-600 hover:text-green-800 text-sm">
                              Δείτε συμμετέχοντες
                            </button>
                          </td>
                        </tr>
                      ))
                    ))}
                    {trainerLessons.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-gray-500">Δεν υπάρχουν μαθήματα στο πρόγραμμα.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Σύστημα Απουσιών</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Μάθημα</th>
                      <th className="py-2 pr-4">Ημερομηνία</th>
                      <th className="py-2 pr-4">Χρήστης</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Παρουσία</th>
                      <th className="py-2 pr-4">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map(record => (
                      <tr key={record.id} className="border-t">
                        <td className="py-2 pr-4 font-medium text-gray-900">{record.lessonName}</td>
                        <td className="py-2 pr-4">{new Date(record.date).toLocaleDateString('el-GR')}</td>
                        <td className="py-2 pr-4">{record.userName}</td>
                        <td className="py-2 pr-4">{record.userEmail}</td>
                        <td className="py-2 pr-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.attended ? 'Παρών' : 'Απών'}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <button
                            onClick={() => handleAttendanceToggle(record.id)}
                            className={`p-1 rounded ${
                              record.attended 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={record.attended ? 'Σημείωση απουσίας' : 'Σημείωση παρουσίας'}
                          >
                            {record.attended ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Performance Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Performance Notes</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Νέα σημείωση..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  />
                  <button
                    onClick={handleAddNote}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Προσθήκη</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {performanceNotes.map(note => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{note.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString('el-GR')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingNote(note.id)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Επεξεργασία"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Διαγραφή"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {editingNote === note.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          defaultValue={note.note}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEditNote(note.id, e.currentTarget.value);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleEditNote(note.id, (document.querySelector(`input[defaultValue="${note.note}"]`) as HTMLInputElement)?.value || note.note)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">{note.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Σημείωση προς Admin/Trainers/Users */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-md font-semibold text-blue-900 mb-2">Σημείωση</h3>
            <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
              <li><b>Προς Admin:</b> Εγκρίνετε/ενημερώστε αλλαγές στο πρόγραμμα εφόσον χρειάζεται.</li>
              <li><b>Προς Trainers:</b> Επικαιροποιείτε τα ωράριά σας εβδομαδιαίως.</li>
              <li><b>Προς Users:</b> Κλείστε εγκαίρως θέσεις – οι δημοφιλείς ώρες γεμίζουν.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;


