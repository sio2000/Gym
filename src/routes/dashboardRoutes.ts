import { Router } from 'express';
import {
  getUserDashboardStats,
  getAdminDashboardStats,
  getTrainerDashboardStats
} from '../controllers/dashboardController';
import { authenticateToken, requireUser, requireAdmin, requireTrainer } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User dashboard
router.get('/user', requireUser, getUserDashboardStats);

// Admin dashboard
router.get('/admin', requireAdmin, getAdminDashboardStats);

// Trainer dashboard
router.get('/trainer', requireTrainer, getTrainerDashboardStats);

export default router;
