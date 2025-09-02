import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { mockLessons, mockBookings, mockRooms, mockTrainers } from '@/data/mockData';
import { 
  formatDate, 
  formatTime, 
  getDayName, 
  getLessonCategoryName, 
  getLessonDifficultyName,
  getBookingStatusName
} from '@/utils';
import toast from 'react-hot-toast';

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  // Get current month and year
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getYear();

  // Generate calendar days
  const getDaysInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth, currentYear);

  // Get lessons for selected date
  const getLessonsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return mockLessons.filter(lesson => 
      lesson.schedule.some(schedule => schedule.dayOfWeek === dayOfWeek)
    );
  };

  // Get user's bookings for selected date
  const getUserBookingsForDate = (date: Date) => {
    const dateString = date.toDateString();
    return mockBookings.filter(booking => 
      booking.userId === user?.id && 
      new Date(booking.date).toDateString() === dateString
    );
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const lessons = getLessonsForDate(date);
    if (lessons.length > 0) {
      setSelectedLesson(lessons[0].id);
    }
  };

  // Handle lesson booking
  const handleBookLesson = (lessonId: string, date: Date) => {
    // Check if user already has a booking for this lesson and date
    const existingBooking = mockBookings.find(booking => 
      booking.userId === user?.id && 
      booking.lessonId === lessonId &&
      new Date(booking.date).toDateString() === date.toDateString()
    );

    if (existingBooking) {
      toast.error('Έχετε ήδη κράτηση για αυτό το μάθημα');
      return;
    }

    // In real app, make API call to create booking
    toast.success('Η κράτηση δημιουργήθηκε επιτυχώς!');
    setShowBookingModal(false);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Κρατήσεις Μαθημάτων</h1>
          <p className="text-gray-600">Διαχειριστείτε τις κρατήσεις και κλείστε νέα μαθήματα</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Νέα Κράτηση
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Ημερολόγιο</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-lg font-medium text-gray-900">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2" />;
                }

                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                const lessons = getLessonsForDate(day);
                const userBookings = getUserBookingsForDate(day);
                const hasBookings = userBookings.length > 0;

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`
                      p-2 text-left min-h-[80px] border rounded-lg transition-colors relative
                      ${isSelected 
                        ? 'bg-primary-100 border-primary-300 text-primary-900' 
                        : 'hover:bg-gray-50 border-gray-200'
                      }
                      ${isToday ? 'ring-2 ring-primary-500' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </span>
                    
                    {/* Lesson indicators */}
                    {lessons.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {lessons.slice(0, 2).map((lesson) => (
                          <div
                            key={lesson.id}
                            className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                            title={lesson.name}
                          >
                            {lesson.name}
                          </div>
                        ))}
                        {lessons.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{lessons.length - 2} ακόμα
                          </div>
                        )}
                      </div>
                    )}

                    {/* User booking indicator */}
                    {hasBookings && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Lessons for selected date */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Μαθήματα για {formatDate(selectedDate)}
            </h3>
            
            <div className="space-y-3">
              {getLessonsForDate(selectedDate).map((lesson) => {
                const room = mockRooms.find(r => r.id === lesson.roomId);
                const trainer = mockTrainers.find(t => t.id === lesson.trainerId);
                const userBookings = getUserBookingsForDate(selectedDate);
                const isBooked = userBookings.some(b => b.lessonId === lesson.id);
                const schedule = lesson.schedule.find(s => s.dayOfWeek === selectedDate.getDay());

                return (
                  <div key={lesson.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lesson.name}</h4>
                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {schedule?.startTime} - {schedule?.endTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {room?.name}
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {trainer?.bio ? trainer.bio.split(' ').slice(0, 3).join(' ') + '...' : 'Trainer'}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="badge badge-info">
                            {getLessonCategoryName(lesson.category)}
                          </span>
                          <span className="badge badge-info">
                            {getLessonDifficultyName(lesson.difficulty)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary-600">
                          {lesson.credits} πιστώση
                        </div>
                        {isBooked ? (
                          <span className="badge badge-success text-xs">
                            Κρατημένο
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBookLesson(lesson.id, selectedDate)}
                            className="btn-primary text-xs py-1 px-2"
                          >
                            Κράτηση
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {getLessonsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>Δεν υπάρχουν διαθέσιμα μαθήματα για αυτή την ημερομηνία</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User's Bookings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Οι Κρατήσεις μου</h2>
        
        <div className="space-y-3">
          {mockBookings
            .filter(booking => booking.userId === user?.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((booking) => {
              const lesson = mockLessons.find(l => l.id === booking.lessonId);
              const room = mockRooms.find(r => r.id === lesson?.roomId);
              const trainer = mockTrainers.find(t => t.id === lesson?.trainerId);
              
              if (!lesson) return null;

              return (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{lesson.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.date)} • {lesson.schedule[0]?.startTime} • {room?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Προπονητής: {trainer?.bio ? trainer.bio.split(' ').slice(0, 3).join(' ') + '...' : 'Trainer'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${
                      booking.status === 'confirmed' ? 'badge-success' :
                      booking.status === 'cancelled' ? 'badge-error' :
                      booking.status === 'completed' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {getBookingStatusName(booking.status)}
                    </span>
                    
                    {booking.status === 'confirmed' && (
                      <button className="btn-secondary text-xs py-1 px-2">
                        Ακύρωση
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          
          {mockBookings.filter(booking => booking.userId === user?.id).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Δεν έχετε κρατήσεις ακόμα</p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="btn-primary mt-3"
              >
                Κράτηση Πρώτου Μαθήματος
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Νέα Κράτηση</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Ημερομηνία</label>
                <input
                  type="date"
                  className="input-field"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Μάθημα</label>
                <select
                  className="input-field"
                  value={selectedLesson || ''}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                >
                  <option value="">Επιλέξτε μάθημα</option>
                  {getLessonsForDate(selectedDate).map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.name} ({lesson.schedule[0]?.startTime})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedLesson && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Κόστος: 1 πιστώση
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="btn-secondary flex-1"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => {
                  if (selectedLesson) {
                    handleBookLesson(selectedLesson, selectedDate);
                  }
                }}
                disabled={!selectedLesson}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Επιβεβαίωση Κράτησης
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
