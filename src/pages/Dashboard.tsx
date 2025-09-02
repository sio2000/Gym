import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  CreditCard, 
  Users, 
  TrendingUp, 
  Clock,
  Activity,
  Target,
  Award,
  BarChart3,
  Weight,
  Ruler,
  Heart,
  TrendingDown
} from 'lucide-react';
import { mockDashboardStats, mockBookings, mockLessons } from '@/data/mockData';
import { formatDate, formatTime, getLessonCategoryName, getLessonDifficultyName } from '@/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Συνολικές Κρατήσεις',
      value: mockDashboardStats.totalBookings,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Ενεργές Συνδρομές',
      value: mockDashboardStats.activeMemberships,
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Διαθέσιμες Πιστώσεις',
      value: mockDashboardStats.availableCredits,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Επερχόμενα Μαθήματα',
      value: mockDashboardStats.upcomingLessons,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const upcomingBookings = mockBookings
    .filter(booking => new Date(booking.date) > new Date())
    .slice(0, 3);

  const recentLessons = mockLessons.slice(0, 4);

  // Προσωπικά στατιστικά χρήστη
  const personalStats = {
    monthlyVisits: 12,
    weight: 75.5,
    height: 175,
    bodyFat: 18.2,
    muscleMass: 45.8,
    targetWeight: 72.0,
    targetBodyFat: 15.0
  };

  const personalStatsCards = [
    {
      name: 'Επισκέψεις τον Μήνα',
      value: personalStats.monthlyVisits,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+2 από τον προηγούμενο μήνα'
    },
    {
      name: 'Βάρος',
      value: `${personalStats.weight} kg`,
      icon: Weight,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '-1.2 kg από τον προηγούμενο μήνα'
    },
    {
      name: 'Ύψος',
      value: `${personalStats.height} cm`,
      icon: Ruler,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'Σταθερό'
    },
    {
      name: 'Λίπος',
      value: `${personalStats.bodyFat}%`,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: '-0.8% από τον προηγούμενο μήνα'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Καλώς ήρθες, {user?.firstName}! 👋
        </h1>
        <p className="text-primary-100">
          Εδώ είναι η επισκόπηση της δραστηριότητάς σου στο FreeGym
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Προσωπικά Στατιστικά */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Προσωπικά Στατιστικά</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {personalStatsCards.map((stat) => (
            <div key={stat.name} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Πρόοδος προς τους Στόχους</h3>
          
          {/* Βάρος Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Βάρος</span>
              <span className="text-sm text-gray-500">
                {personalStats.weight} kg / {personalStats.targetWeight} kg
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((personalStats.targetWeight / personalStats.weight) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Στόχος: {personalStats.targetWeight} kg</span>
              <span className="text-green-600 font-medium">
                {((personalStats.targetWeight / personalStats.weight) * 100).toFixed(1)}% προόδου
              </span>
            </div>
          </div>

          {/* Λίπος Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Λίπος</span>
              <span className="text-sm text-gray-500">
                {personalStats.bodyFat}% / {personalStats.targetBodyFat}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((personalStats.targetBodyFat / personalStats.bodyFat) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Στόχος: {personalStats.targetBodyFat}%</span>
              <span className="text-red-600 font-medium">
                {((personalStats.targetBodyFat / personalStats.bodyFat) * 100).toFixed(1)}% προόδου
              </span>
            </div>
          </div>

          {/* Μυϊκή Μάζα Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Μυϊκή Μάζα</span>
              <span className="text-sm text-gray-500">
                {personalStats.muscleMass} kg
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((personalStats.muscleMass / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Στόχος: 50 kg</span>
              <span className="text-blue-600 font-medium">
                {((personalStats.muscleMass / 50) * 100).toFixed(1)}% προόδου
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Επερχόμενες Κρατήσεις</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Προβολή Όλων
            </button>
          </div>
          <div className="space-y-3">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => {
                const lesson = mockLessons.find(l => l.id === booking.lessonId);
                if (!lesson) return null;
                
                return (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lesson.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(booking.date)} • {lesson.schedule[0]?.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-success">
                        Επιβεβαιωμένη
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>Δεν έχετε επερχόμενες κρατήσεις</p>
                <button className="btn-primary mt-3">
                  Κράτηση Μαθήματος
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Lessons */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Διαθέσιμα Μαθήματα</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Προβολή Όλων
            </button>
          </div>
          <div className="space-y-3">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    lesson.category === 'cardio' ? 'bg-red-100' :
                    lesson.category === 'strength' ? 'bg-blue-100' :
                    lesson.category === 'yoga' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    <Activity className={`h-4 w-4 ${
                      lesson.category === 'cardio' ? 'text-red-600' :
                      lesson.category === 'strength' ? 'text-blue-600' :
                      lesson.category === 'yoga' ? 'text-green-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lesson.name}</p>
                    <p className="text-sm text-gray-500">
                      {getLessonCategoryName(lesson.category)} • {getLessonDifficultyName(lesson.difficulty)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-600">{lesson.credits} πιστώση</p>
                  <p className="text-xs text-gray-500">{lesson.duration} λεπτά</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Γρήγορες Ενέργειες</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2 transition-colors" />
              <p className="font-medium text-gray-900 group-hover:text-primary-700">Κράτηση Μαθήματος</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group">
            <div className="text-center">
              <CreditCard className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2 transition-colors" />
              <p className="font-medium text-gray-900 group-hover:text-primary-700">Ανανέωση Συνδρομής</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group">
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2 transition-colors" />
              <p className="font-medium text-gray-900 group-hover:text-primary-700">Κωδικός Παραπομπής</p>
            </div>
          </button>
        </div>
      </div>

      {/* Referral Rewards */}
      {mockDashboardStats.referralRewards > 0 && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-yellow-800">
                Συγχαρητήρια! 🎉
              </h3>
              <p className="text-yellow-700">
                Έχετε κερδίσει {mockDashboardStats.referralRewards} πιστώσεις από παραπομπές!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
