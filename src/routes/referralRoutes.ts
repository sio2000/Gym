import { Router } from 'express';
import {
  getUserReferralInfo,
  getUserReferralHistory,
  processReferralCompletion,
  getAllReferrals,
  getReferralStats,
  validateReferralCode
} from '../controllers/referralController';
import { authenticateToken, requireUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/validate/:referralCode', validateReferralCode);

// User routes
router.use(authenticateToken);
router.use(requireUser);

router.get('/info', getUserReferralInfo);
router.get('/history', getUserReferralHistory);

// Admin routes
router.use(requireAdmin);

router.get('/', getAllReferrals);
router.get('/stats', getReferralStats);
router.put('/:referralId/complete', processReferralCompletion);

export default router;
