import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  QrCode, 
  Download, 
  Share2, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { mockBookings, mockLessons, mockRooms, mockTrainers } from '@/data/mockData';
import { formatDate, formatTime, getBookingStatusName } from '@/utils';
import toast from 'react-hot-toast';

const QRCodes: React.FC = () => {
  const { user } = useAuth();
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  // Get user's bookings with QR codes
  const userBookings = mockBookings.filter(booking => booking.userId === user?.id);

  // Generate mock QR code data (in real app, this would be actual QR codes)
  const generateQRData = (bookingId: string) => {
    return `https://freegym.com/checkin/${bookingId}`;
  };

  // Handle QR code download
  const handleDownloadQR = (bookingId: string, lessonName: string) => {
    // In real app, generate and download actual QR code image
    toast.success(`QR Code για ${lessonName} κατέβηκε επιτυχώς`);
  };

  // Handle QR code sharing
  const handleShareQR = async (bookingId: string, lessonName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${lessonName}`,
          text: `QR Code για το μάθημα ${lessonName}`,
          url: generateQRData(bookingId)
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(generateQRData(bookingId));
      toast.success('Link αντιγράφηκε στο clipboard');
    }
  };

  // Check if QR code is expired
  const isQRExpired = (bookingDate: string) => {
    const lessonDate = new Date(bookingDate);
    const now = new Date();
    const diffTime = lessonDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0;
  };

  // Check if QR code is active (within 2 hours of lesson)
  const isQRActive = (bookingDate: string) => {
    const lessonDate = new Date(bookingDate);
    const now = new Date();
    const diffTime = lessonDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours >= -2 && diffHours <= 2;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-600">Διαχειριστείτε τα QR codes για τα μαθήματά σας</p>
        </div>
      </div>

      {/* Active QR Codes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ενεργά QR Codes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userBookings
            .filter(booking => !isQRExpired(booking.date))
            .map((booking) => {
              const lesson = mockLessons.find(l => l.id === booking.lessonId);
              const room = mockRooms.find(r => r.id === lesson?.roomId);
              const trainer = mockTrainers.find(t => t.id === lesson?.trainerId);
              
              if (!lesson) return null;

              const isActive = isQRActive(booking.date);
              const isExpired = isQRExpired(booking.date);

              return (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* QR Code Display */}
                  <div className="text-center mb-4">
                    <div className="inline-block p-4 bg-gray-100 rounded-lg">
                      <QrCode className="h-24 w-24 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">QR Code Preview</p>
                  </div>

                  {/* Lesson Info */}
                  <div className="space-y-2 mb-4">
                    <h3 className="font-medium text-gray-900 text-center">{lesson.name}</h3>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {lesson.schedule[0]?.startTime} - {lesson.schedule[0]?.endTime}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {room?.name}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {trainer?.bio ? trainer.bio.split(' ').slice(0, 3).join(' ') + '...' : 'Trainer'}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center mb-4">
                    <span className={`badge ${
                      isExpired ? 'badge-error' :
                      isActive ? 'badge-success' :
                      'badge-warning'
                    }`}>
                      {isExpired ? 'Ληγμένο' : isActive ? 'Ενεργό' : 'Σε αναμονή'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadQR(booking.id, lesson.name)}
                      className="btn-secondary flex-1 flex items-center justify-center text-sm py-2"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShareQR(booking.id, lesson.name)}
                      className="btn-primary flex-1 flex items-center justify-center text-sm py-2"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                  </div>

                  {/* QR Code Data */}
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono break-all">
                    {generateQRData(booking.id)}
                  </div>
                </div>
              );
            })}
          
          {userBookings.filter(booking => !isQRExpired(booking.date)).length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Δεν έχετε ενεργά QR codes</p>
              <p className="text-sm">Κλείστε ένα μάθημα για να δημιουργηθεί QR code</p>
            </div>
          )}
        </div>
      </div>

      {/* Expired QR Codes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ιστορικό QR Codes</h2>
        
        <div className="space-y-3">
          {userBookings
            .filter(booking => isQRExpired(booking.date))
            .map((booking) => {
              const lesson = mockLessons.find(l => l.id === booking.lessonId);
              const room = mockRooms.find(r => r.id === lesson?.roomId);
              
              if (!lesson) return null;

              return (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <QrCode className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{lesson.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.date)} • {lesson.schedule[0]?.startTime} • {room?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="badge badge-error">
                      Ληγμένο
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(booking.date)}
                    </span>
                  </div>
                </div>
              );
            })}
          
          {userBookings.filter(booking => isQRExpired(booking.date)).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Δεν έχετε ληγμένα QR codes</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Πώς να χρησιμοποιήσετε τα QR Codes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Κλείστε ένα μάθημα</p>
              <p>Το QR code δημιουργείται αυτόματα μετά την κράτηση</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Παρουσιάστε το QR code</p>
              <p>Στο γυμναστήριο για check-in/check-out</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Κερδίστε πιστώσεις</p>
              <p>Μετά την ολοκλήρωση του μαθήματος</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Details</h3>
              
              <div className="p-4 bg-gray-100 rounded-lg mb-4">
                <QrCode className="h-32 w-32 text-gray-600 mx-auto" />
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Σκανάρετε αυτό το QR code στο γυμναστήριο για check-in
              </p>
              
              <button
                onClick={() => setSelectedQR(null)}
                className="btn-primary w-full"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodes;
