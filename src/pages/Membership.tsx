import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { 
  mockMemberships, 
  mockMembershipPackages, 
  mockPayments,
  mockDashboardStats 
} from '@/data/mockData';
import { formatDate, formatCurrency, getMembershipStatusName, getPaymentStatusName } from '@/utils';
import toast from 'react-hot-toast';

const Membership: React.FC = () => {
  const { user } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Get user's active membership
  const userMembership = mockMemberships.find(m => m.userId === user?.id);
  
  // Get user's payments
  const userPayments = mockPayments.filter(p => p.userId === user?.id);

  // Handle package purchase
  const handlePurchasePackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPurchaseModal(true);
  };

  // Handle purchase confirmation
  const handleConfirmPurchase = () => {
    if (!selectedPackage) return;
    
    // In real app, make API call to create payment
    toast.success('Η πληρωμή δημιουργήθηκε επιτυχώς! Εκκρεμεί έγκριση από διαχειριστή.');
    setShowPurchaseModal(false);
    setSelectedPackage(null);
  };

  // Calculate days remaining in membership
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Get membership progress percentage
  const getMembershipProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Συνδρομής</h1>
          <p className="text-gray-600">Διαχειριστείτε τη συνδρομή και τις πιστώσεις σας</p>
        </div>
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Αγορά Πακέτου
        </button>
      </div>

      {/* Current Membership Status */}
      {userMembership && (
        <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-600 rounded-lg">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-900">
                  Ενεργή Συνδρομή
                </h2>
                <p className="text-primary-700">
                  {mockMembershipPackages.find(p => p.id === userMembership.packageId)?.name}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-900">
                {userMembership.credits} πιστώσεις
              </div>
              <p className="text-primary-700">διαθέσιμες</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-primary-700 mb-2">
              <span>Πρόοδος συνδρομής</span>
              <span>{getDaysRemaining(userMembership.endDate)} ημέρες ακόμα</span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getMembershipProgress(userMembership.startDate, userMembership.endDate)}%` }}
              ></div>
            </div>
          </div>

          {/* Membership Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-primary-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-900">
                {formatDate(userMembership.startDate)}
              </div>
              <p className="text-sm text-primary-700">Ημερομηνία έναρξης</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-900">
                {formatDate(userMembership.endDate)}
              </div>
              <p className="text-sm text-primary-700">Ημερομηνία λήξης</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-900">
                {userMembership.autoRenew ? 'Ναι' : 'Όχι'}
              </div>
              <p className="text-sm text-primary-700">Αυτόματη ανανέωση</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Packages */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Διαθέσιμα Πακέτα</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockMembershipPackages.map((pkg) => {
            const isCurrentPackage = userMembership?.packageId === pkg.id;
            const isRecommended = pkg.id === '2'; // Προηγμένο πακέτο

            return (
              <div 
                key={pkg.id} 
                className={`
                  border rounded-lg p-6 relative transition-all duration-200
                  ${isCurrentPackage 
                    ? 'border-primary-300 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                  }
                  ${isRecommended ? 'ring-2 ring-primary-500' : ''}
                `}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Προτεινόμενο
                    </span>
                  </div>
                )}

                {isCurrentPackage && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ενεργό
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                  
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {formatCurrency(pkg.price)}
                  </div>
                  <p className="text-gray-500 text-sm">ανά μήνα</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Πιστώσεις:</span>
                    <span className="font-semibold text-gray-900">{pkg.credits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Διάρκεια:</span>
                    <span className="font-semibold text-gray-900">{pkg.validityDays} ημέρες</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Κόστος/μάθημα:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(pkg.price / pkg.credits)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchasePackage(pkg.id)}
                  disabled={isCurrentPackage}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium transition-colors
                    ${isCurrentPackage
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'btn-primary hover:bg-primary-700'
                    }
                  `}
                >
                  {isCurrentPackage ? 'Τρέχον Πακέτο' : 'Επιλογή Πακέτου'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ιστορικό Πληρωμών</h2>
        
        <div className="space-y-3">
          {userPayments.length > 0 ? (
            userPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    payment.status === 'approved' ? 'bg-green-100' :
                    payment.status === 'pending' ? 'bg-yellow-100' :
                    payment.status === 'rejected' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    <CreditCard className={`h-5 w-5 ${
                      payment.status === 'approved' ? 'text-green-600' :
                      payment.status === 'pending' ? 'text-yellow-600' :
                      payment.status === 'rejected' ? 'text-red-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {formatCurrency(payment.amount)} - {payment.paymentMethod}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(payment.createdAt)} • {getPaymentStatusName(payment.status)}
                    </p>
                    {payment.transactionId && (
                      <p className="text-xs text-gray-500">ID: {payment.transactionId}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`badge ${
                    payment.status === 'approved' ? 'badge-success' :
                    payment.status === 'pending' ? 'badge-warning' :
                    payment.status === 'rejected' ? 'badge-error' :
                    'badge-info'
                  }`}>
                    {getPaymentStatusName(payment.status)}
                  </span>
                  
                  {payment.status === 'pending' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Λήγει {formatDate(payment.expiresAt)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Δεν έχετε ιστορικό πληρωμών</p>
            </div>
          )}
        </div>
      </div>

      {/* Credit Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {mockDashboardStats.totalBookings}
          </h3>
          <p className="text-gray-600">Συνολικές κρατήσεις</p>
        </div>
        
        <div className="card text-center">
          <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {mockDashboardStats.referralRewards}
          </h3>
          <p className="text-gray-600">Πιστώσεις παραπομπών</p>
        </div>
        
        <div className="card text-center">
          <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {mockDashboardStats.availableCredits}
          </h3>
          <p className="text-gray-600">Διαθέσιμες πιστώσεις</p>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Αγορά Πακέτου</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Επιλέξτε πακέτο</label>
                <select
                  className="input-field"
                  value={selectedPackage || ''}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                >
                  <option value="">Επιλέξτε πακέτο</option>
                  {mockMembershipPackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatCurrency(pkg.price)} ({pkg.credits} πιστώσεις)
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedPackage && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {(() => {
                    const pkg = mockMembershipPackages.find(p => p.id === selectedPackage);
                    if (!pkg) return null;
                    
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Πακέτο:</span>
                          <span className="font-medium">{pkg.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Πιστώσεις:</span>
                          <span className="font-medium">{pkg.credits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Διάρκεια:</span>
                          <span className="font-medium">{pkg.validityDays} ημέρες</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Σύνολο:</span>
                          <span className="text-primary-600">{formatCurrency(pkg.price)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="btn-secondary flex-1"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={!selectedPackage}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Επιβεβαίωση Αγοράς
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
