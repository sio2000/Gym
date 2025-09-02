import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController';
import {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors
} from '../middleware/validation';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateUserRegistration, handleValidationErrors, register);
router.post('/login', validateUserLogin, handleValidationErrors, login);

// Protected routes
router.use(authenticateToken);

router.get('/profile', requireUser, getProfile);
router.put('/profile', requireUser, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/password', requireUser, validatePasswordChange, handleValidationErrors, changePassword);
router.post('/logout', requireUser, logout);

export default router;
