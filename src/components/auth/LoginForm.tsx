import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types';
import { isValidEmail } from '@/utils';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = 'Το email είναι υποχρεωτικό';
    } else if (!isValidEmail(credentials.email)) {
      newErrors.email = 'Παρακαλώ εισάγετε ένα έγκυρο email';
    }

    if (!credentials.password) {
      newErrors.password = 'Ο κωδικός πρόσβασης είναι υποχρεωτικός';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(credentials);
      navigate('/');
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Καλώς ήρθες στο FreeGym
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Σύνδεση στην εφαρμογή διαχείρισης γυμναστηρίου
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  value={credentials.email}
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
                  autoComplete="current-password"
                  required
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="εισάγετε τον κωδικό πρόσβασης"
                  value={credentials.password}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Ξεχάσατε τον κωδικό;
              </Link>
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
                  Σύνδεση...
                </>
              ) : (
                'Σύνδεση'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Δεν έχετε λογαριασμό;{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Εγγραφείτε εδώ
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
              <span className="px-2 bg-primary-50 text-gray-500">Demo Account</span>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Email: john.doe@example.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
