import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockLessons, mockBookings } from '@/data/mockData';
import { Calendar, Users, StickyNote, BarChart2 } from 'lucide-react';

const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Πίνακας Ελέγχου</h1>
          <p className="text-gray-600">Συγκεντρωτική εικόνα για τα μαθήματά σου</p>
        </div>
      </div>

      {/* Στατιστικά */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg"><BarChart2 className="h-6 w-6 text-blue-600"/></div>
            <div>
              <p className="text-sm text-gray-600">Σύνολο Μαθημάτων</p>
              <p className="text-xl font-semibold text-gray-900">{stats.totalLessons}</p>
            </div>
          </div>
        </div>
        <div className="card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg"><Users className="h-6 w-6 text-green-600"/></div>
            <div>
              <p className="text-sm text-gray-600">Συνολικοί Συμμετέχοντες</p>
              <p className="text-xl font-semibold text-gray-900">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>
        <div className="card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg"><StickyNote className="h-6 w-6 text-yellow-600"/></div>
            <div>
              <p className="text-sm text-gray-600">Σημείωση</p>
              <p className="text-sm text-gray-800">Ενημέρωσε τον admin για αλλαγές προγράμματος.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Μηνιαίο Πρόγραμμα */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Μηνιαίο Πρόγραμμα</h2>
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
                    <td className="py-2 pr-4">{participantsByLesson[lesson.id] || 0}</td>
                  </tr>
                ))
              ))}
              {trainerLessons.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">Δεν υπάρχουν μαθήματα στο πρόγραμμα.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Σημείωση προς Admin/Trainers/Users */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-md font-semibold text-blue-900 mb-2">Σημείωση</h3>
        <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
          <li><b>Προς Admin:</b> Εγκρίνετε/ενημερώστε αλλαγές στο πρόγραμμα εφόσον χρειάζεται.</li>
          <li><b>Προς Trainers:</b> Επικαιροποιείτε τα ωράριά σας εβδομαδιαίως.</li>
          <li><b>Προς Users:</b> Κλείστε εγκαίρως θέσεις – οι δημοφιλείς ώρες γεμίζουν.</li>
        </ul>
      </div>
    </div>
  );
};

export default TrainerDashboard;


