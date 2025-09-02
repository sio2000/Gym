import { Router } from 'express';
import authRoutes from './authRoutes';
import lessonRoutes from './lessonRoutes';
import bookingRoutes from './bookingRoutes';
import membershipRoutes from './membershipRoutes';
import referralRoutes from './referralRoutes';
import dashboardRoutes from './dashboardRoutes';
import scheduleRoutes from './scheduleRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FreeGym API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/lessons', lessonRoutes);
router.use('/bookings', bookingRoutes);
router.use('/memberships', membershipRoutes);
router.use('/referrals', referralRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/schedule', scheduleRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

export default router;
