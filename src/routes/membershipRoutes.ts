import { Router } from 'express';
import {
  getMembershipPackages,
  getUserMembership,
  purchaseMembership,
  getUserPayments,
  getMembershipStats,
  approvePayment,
  getPendingPayments
} from '../controllers/membershipController';
import {
  validateMembershipPurchase,
  validatePaymentApproval,
  handleValidationErrors
} from '../middleware/validation';
import { authenticateToken, requireUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/packages', getMembershipPackages);

// User routes
router.use(authenticateToken);
router.use(requireUser);

router.get('/current', getUserMembership);
router.post('/purchase', validateMembershipPurchase, handleValidationErrors, purchaseMembership);
router.get('/payments', getUserPayments);
router.get('/stats', getMembershipStats);

// Admin routes
router.use(requireAdmin);

router.put('/payments/:paymentId/approve', validatePaymentApproval, handleValidationErrors, approvePayment);
router.get('/payments/pending', getPendingPayments);

export default router;
