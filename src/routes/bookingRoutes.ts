import { Router } from 'express';
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  checkInWithQR,
  getBookingStats
} from '../controllers/bookingController';
import {
  validateLessonBooking,
  validateQRCode,
  handleValidationErrors
} from '../middleware/validation';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireUser);

// Booking management
router.post('/', validateLessonBooking, handleValidationErrors, createBooking);
router.get('/', getUserBookings);
router.get('/stats', getBookingStats);
router.delete('/:id', cancelBooking);

// QR code operations
router.post('/checkin', validateQRCode, handleValidationErrors, checkInWithQR);

export default router;
