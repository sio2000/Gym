import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Copy, 
  Share2, 
  Award, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Gift,
  Zap
} from 'lucide-react';
import { mockReferrals, mockDashboardStats } from '@/data/mockData';
import { formatDate, getReferralStatusName } from '@/utils';
import toast from 'react-hot-toast';

const Referral: React.FC = () => {
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  // Get user's referrals
  const userReferrals = mockReferrals.filter(ref => ref.referrerId === user?.id);
  const userReferredBy = mockReferrals.find(ref => ref.referredId === user?.id);

  // Handle copy referral code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(user?.referralCode || '');
      toast.success('Ο κωδικός αντιγράφηκε επιτυχώς!');
    } catch (error) {
      toast.error('Σφάλμα κατά την αντιγραφή');
    }
  };

  // Handle share referral code
  const handleShareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FreeGym - Κωδικός Παραπομπής',
          text: `Γίνετε μέλος στο FreeGym χρησιμοποιώντας τον κωδικό παραπομπής μου: ${user?.referralCode}`,
          url: `https://freegym.com/register?ref=${user?.referralCode}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  // Calculate total rewards earned
  const totalRewards = userReferrals.reduce((sum, ref) => sum + ref.rewardCredits, 0);

  // Calculate pending rewards
  const pendingRewards = userReferrals
    .filter(ref => ref.status === 'pending')
    .reduce((sum, ref) => sum + ref.rewardCredits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Σύστημα Παραπομπών</h1>
          <p className="text-gray-600">Κερδίστε πιστώσεις παρακαλώντας φίλους να εγγραφούν</p>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {userReferrals.length}
          </h3>
          <p className="text-gray-600">Συνολικές παραπομπές</p>
        </div>
        
        <div className="card text-center">
          <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {userReferrals.filter(ref => ref.status === 'completed').length}
          </h3>
          <p className="text-gray-600">Ολοκληρωμένες</p>
        </div>
        
        <div className="card text-center">
          <div className="p-3 bg-yellow-100 rounded-lg inline-block mb-3">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {userReferrals.filter(ref => ref.status === 'pending').length}
          </h3>
          <p className="text-gray-600">Σε εκκρεμότητα</p>
        </div>
        
        <div className="card text-center">
          <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
            <Award className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {totalRewards}
          </h3>
          <p className="text-gray-600">Συνολικές πιστώσεις</p>
        </div>
      </div>

      {/* Your Referral Code */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-primary-900 mb-2">
            Ο Κωδικός Παραπομπής σας
          </h2>
          <p className="text-primary-700">
            Μοιραστείτε αυτόν τον κωδικό με φίλους για να κερδίσετε πιστώσεις
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="bg-white px-6 py-3 rounded-lg border-2 border-primary-300">
            <span className="text-2xl font-bold text-primary-900 font-mono">
              {user?.referralCode}
            </span>
          </div>
          
          <button
            onClick={handleCopyCode}
            className="btn-secondary flex items-center"
          >
            <Copy className="h-4 w-4 mr-2" />
            Αντιγραφή
          </button>
          
          <button
            onClick={handleShareCode}
            className="btn-primary flex items-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Μοιρασμός
          </button>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-primary-800">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-primary-800 text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Μοιραστείτε τον κωδικό</p>
              <p>Με φίλους και συγγενείς</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-primary-800 text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Εγγραφή με κωδικό</p>
              <p>Ο φίλος εγγράφεται χρησιμοποιώντας τον κωδικό</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-primary-800 text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Κερδίστε πιστώσεις</p>
              <p>Και οι δύο λαμβάνετε 5 πιστώσεις</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ιστορικό Παραπομπών</h2>
        
        <div className="space-y-3">
          {userReferrals.length > 0 ? (
            userReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    referral.status === 'completed' ? 'bg-green-100' :
                    referral.status === 'pending' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <Users className={`h-5 w-5 ${
                      referral.status === 'completed' ? 'text-green-600' :
                      referral.status === 'pending' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Παραπομπή #{referral.id.slice(-4)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(referral.createdAt)} • {getReferralStatusName(referral.status)}
                    </p>
                    {referral.completedAt && (
                      <p className="text-xs text-gray-500">
                        Ολοκληρώθηκε: {formatDate(referral.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${
                      referral.status === 'completed' ? 'badge-success' :
                      referral.status === 'pending' ? 'badge-warning' :
                      'badge-error'
                    }`}>
                      {getReferralStatusName(referral.status)}
                    </span>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        +{referral.rewardCredits}
                      </div>
                      <p className="text-xs text-gray-500">πιστώσεις</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Δεν έχετε παραπομπές ακόμα</p>
              <p className="text-sm">Μοιραστείτε τον κωδικό σας για να ξεκινήσετε</p>
            </div>
          )}
        </div>
      </div>

      {/* If user was referred by someone */}
      {userReferredBy && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Κερδίσατε πιστώσεις από παραπομπή! 🎉
              </h3>
              <p className="text-green-700">
                Χρησιμοποιήσατε κωδικό παραπομπής κατά την εγγραφή και κερδίσατε {userReferredBy.rewardCredits} πιστώσεις.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Rewards Info */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          Πώς λειτουργούν οι ανταμοιβές
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-yellow-800">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 text-xs font-bold mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-medium">5 πιστώσεις για κάθε επιτυχημένη παραπομπή</p>
                <p>Όταν ο φίλος σας εγγραφεί και ενεργοποιήσει τη συνδρομή</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 text-xs font-bold mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-medium">Άμεση πίστωση</p>
                <p>Οι πιστώσεις προστίθενται άμεσα στο λογαριασμό σας</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 text-xs font-bold mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-medium">Απεριόριστες παραπομπές</p>
                <p>Δεν υπάρχει όριο στον αριθμό των παραπομπών</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 text-xs font-bold mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-medium">Win-win για όλους</p>
                <p>Και οι δύο λαμβάνετε πιστώσεις</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Μοιρασμός Κωδικού</h3>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">Κωδικός παραπομπής:</p>
                <p className="font-mono text-lg font-bold text-primary-600">
                  {user?.referralCode}
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Γίνετε μέλος στο FreeGym χρησιμοποιώντας τον κωδικό παραπομπής μου: ${user?.referralCode}`);
                    toast.success('Το μήνυμα αντιγράφηκε!');
                  }}
                  className="btn-secondary w-full"
                >
                  Αντιγραφή μηνύματος
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://freegym.com/register?ref=${user?.referralCode}`);
                    toast.success('Το link αντιγράφηκε!');
                  }}
                  className="btn-primary w-full"
                >
                  Αντιγραφή link
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 mt-4 text-sm"
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

export default Referral;
