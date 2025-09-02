import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Bell,
  Settings,
  Key
} from 'lucide-react';
import { formatDate, calculateAge } from '@/utils';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    notifications: true,
    emailUpdates: true,
    language: 'el' as 'el' | 'en'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationsData, setNotificationsData] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    lessonReminders: true,
    paymentReminders: true,
    referralUpdates: true
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle notification changes
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationsData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Το προφίλ ενημερώθηκε επιτυχώς!');
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση του προφίλ');
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Οι κωδικοί δεν ταιριάζουν');
      return;
    }
    
    // In real app, make API call to change password
    toast.success('Ο κωδικός πρόσβασης άλλαξε επιτυχώς!');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Handle notifications save
  const handleNotificationsSave = () => {
    // In real app, make API call to save notification preferences
    toast.success('Οι προτιμήσεις ειδοποιήσεων αποθηκεύτηκαν!');
    setShowNotificationsModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Προφίλ Χρήστη</h1>
          <p className="text-gray-600">Διαχειριστείτε τις πληροφορίες και τις ρυθμίσεις του λογαριασμού σας</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="btn-secondary flex items-center"
          >
            <Bell className="h-4 w-4 mr-2" />
            Ειδοποιήσεις
          </button>
          
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn-secondary flex items-center"
          >
            <Key className="h-4 w-4 mr-2" />
            Αλλαγή Κωδικού
          </button>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Επεξεργασία
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Ακύρωση
              </button>
              
              <button
                onClick={handleSubmit}
                className="btn-primary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Αποθήκευση
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Πληροφορίες Προφίλ</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-primary-600" />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                  <p className="text-sm text-gray-500">
                    Μέλος από {formatDate(user?.createdAt || '')}
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Όνομα</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="form-label">Επώνυμο</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="form-label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Τηλέφωνο</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="+30 69XXXXXXXX"
                      className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Ημερομηνία Γέννησης</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  {formData.dateOfBirth && (
                    <p className="text-sm text-gray-500 mt-1">
                      Ηλικία: {calculateAge(formData.dateOfBirth)} ετών
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Γλώσσα</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="el">Ελληνικά</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="form-label">Διεύθυνση</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Οδός, Αριθμός, Πόλη, ΤΚ"
                    className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="form-label">Επείγουσα Επικοινωνία</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Όνομα και τηλέφωνο επείγουσας επικοινωνίας"
                  className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Προτιμήσεις</h4>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Ειδοποιήσεις push
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="emailUpdates"
                    checked={formData.emailUpdates}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Ενημερώσεις μέσω email
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Κατάσταση Λογαριασμού</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ρόλος:</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Κωδικός παραπομπής:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {user?.referralCode}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Εγγραφή:</span>
                <span className="font-medium">{formatDate(user?.createdAt || '')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Τελευταία ενημέρωση:</span>
                <span className="font-medium">{formatDate(user?.updatedAt || '')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Γρήγορες Ενέργειες</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full btn-secondary text-left flex items-center"
              >
                <Key className="h-4 w-4 mr-2" />
                Αλλαγή κωδικού πρόσβασης
              </button>
              
              <button
                onClick={() => setShowNotificationsModal(true)}
                className="w-full btn-secondary text-left flex items-center"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ρυθμίσεις ειδοποιήσεων
              </button>
              
              <button className="w-full btn-secondary text-left flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Ασφάλεια λογαριασμού
              </button>
              
              <button className="w-full btn-secondary text-left flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Ρυθμίσεις εφαρμογής
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ενέργειες Λογαριασμού</h3>
            
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left">
                Εξαγωγή δεδομένων
              </button>
              
              <button className="w-full btn-secondary text-left">
                Απενεργοποίηση λογαριασμού
              </button>
              
              <button className="w-full btn-error text-left">
                Διαγραφή λογαριασμού
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Αλλαγή Κωδικού Πρόσβασης</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="form-label">Τρέχων Κωδικός</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="form-label">Νέος Κωδικός</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="form-label">Επιβεβαίωση Νέου Κωδικού</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-secondary flex-1"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Αλλαγή Κωδικού
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ρυθμίσεις Ειδοποιήσεων</h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Push ειδοποιήσεις</label>
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={notificationsData.pushNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Email ειδοποιήσεις</label>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationsData.emailNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">SMS ειδοποιήσεις</label>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={notificationsData.smsNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Marketing emails</label>
                  <input
                    type="checkbox"
                    name="marketingEmails"
                    checked={notificationsData.marketingEmails}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Υπενθυμίσεις μαθημάτων</label>
                  <input
                    type="checkbox"
                    name="lessonReminders"
                    checked={notificationsData.lessonReminders}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Υπενθυμίσεις πληρωμών</label>
                  <input
                    type="checkbox"
                    name="paymentReminders"
                    checked={notificationsData.paymentReminders}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Ενημερώσεις παραπομπών</label>
                  <input
                    type="checkbox"
                    name="referralUpdates"
                    checked={notificationsData.referralUpdates}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="btn-secondary flex-1"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={handleNotificationsSave}
                  className="btn-primary flex-1"
                >
                  Αποθήκευση
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
