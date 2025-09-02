import { Router } from 'express';
import {
  getMonthlySchedule,
  saveMonthlySchedule
} from '../controllers/scheduleController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getMonthlySchedule);
router.post('/', saveMonthlySchedule);

export default router;
