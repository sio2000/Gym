import { Router } from 'express';
import {
  getLessons,
  getLessonById,
  getLessonsByDate,
  getLessonCategories,
  getTrainers,
  getRooms,
  getMonthlySchedule
} from '../controllers/lessonController';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (with optional authentication for better UX)
router.use(optionalAuth);

router.get('/', getLessons);
router.get('/categories', getLessonCategories);
router.get('/trainers', getTrainers);
router.get('/rooms', getRooms);
router.get('/date/:date', getLessonsByDate);

// Protected routes
router.use(authenticateToken);

router.get('/:id', getLessonById);

// Admin routes
router.use(requireAdmin);
router.get('/schedule', getMonthlySchedule);

export default router;
