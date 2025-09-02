import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types';
import { isValidEmail, isValidPassword } from '@/utils';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData & { confirmPassword: string }>>({});
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData & { confirmPassword: string }> = {};

    if (!formData.firstName) {
      newErrors.firstName = 'Το όνομα είναι υποχρεωτικό';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Το επώνυμο είναι υποχρεωτικό';
    }

    if (!formData.email) {
      newErrors.email = 'Το email είναι υποχρεωτικό';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Παρακαλώ εισάγετε ένα έγκυρο email';
    }

    if (!formData.password) {
      newErrors.password = 'Ο κωδικός πρόσβασης είναι υποχρεωτικός';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες, 1 κεφαλαίο, 1 πεζό και 1 αριθμό';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Η επιβεβαίωση κωδικού είναι υποχρεωτική';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Οι κωδικοί δεν ταιριάζουν';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Δημιουργία Λογαριασμού
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Εγγραφείτε στο FreeGym και ξεκινήστε την προπόνησή σας
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="form-label">
                  Όνομα
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={`input-field pl-10 ${errors.firstName ? 'border-error-500 focus:ring-error-500' : ''}`}
                    placeholder="εισάγετε το όνομά σας"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-error-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">
                  Επώνυμο
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={`input-field pl-10 ${errors.lastName ? 'border-error-500 focus:ring-error-500' : ''}`}
                    placeholder="εισάγετε το επώνυμο σας"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-error-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`input-field pl-10 ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="εισάγετε το email σας"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Κωδικός Πρόσβασης
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="εισάγετε τον κωδικό πρόσβασης"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Επιβεβαίωση Κωδικού
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="επιβεβαιώστε τον κωδικό πρόσβασης"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="referralCode" className="form-label">
                Κωδικός Παραπομπής (προαιρετικό)
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                className="input-field"
                placeholder="εισάγετε κωδικό παραπομπής"
                value={formData.referralCode}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Εισάγετε κωδικό παραπομπής για να λάβετε 5 δωρεάν πιστώσεις
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center py-3 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Εγγραφή...
                </>
              ) : (
                'Εγγραφή'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Έχετε ήδη λογαριασμό;{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Συνδεθείτε εδώ
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary-50 text-gray-500">Προσθήκες</span>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>• Δωρεάν πιστώσεις με παραπομπές</p>
            <p>• Ευέλικτα πακέτα συνδρομών</p>
            <p>• Προσωποποιημένα προγράμματα προπόνησης</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
