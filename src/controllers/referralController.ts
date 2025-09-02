import { Request, Response } from 'express';
import { query, queryOne, queryMany } from '../config/database';

// Get user's referral information
export const getUserReferralInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get user's referral code
    const userProfile = await queryOne(`
      SELECT referral_code
      FROM user_profiles
      WHERE user_id = $1
    `, [userId]);

    if (!userProfile || !userProfile.referral_code) {
      return res.status(404).json({
        success: false,
        message: 'Δεν βρέθηκε κωδικός παραπομπής'
      });
    }

    // Get referral statistics
    const stats = await queryOne(`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_referrals,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN reward_credits ELSE 0 END), 0) as total_earned_credits
      FROM referrals
      WHERE referrer_id = $1
    `, [userId]);

    // Get recent referrals
    const recentReferrals = await query(`
      SELECT 
        r.id,
        r.status,
        r.reward_credits,
        r.created_at,
        r.completed_at,
        up.first_name,
        up.last_name,
        up.email
      FROM referrals r
      LEFT JOIN user_profiles up ON r.referred_id = up.user_id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [userId]);

    const formattedReferrals = recentReferrals.rows.map(referral => ({
      id: referral.id,
      status: referral.status,
      rewardCredits: referral.reward_credits,
      createdAt: referral.created_at,
      completedAt: referral.completed_at,
      referredUser: {
        firstName: referral.first_name,
        lastName: referral.last_name,
        email: referral.email
      }
    }));

    res.json({
      success: true,
      data: {
        referralCode: userProfile.referral_code,
        statistics: {
          totalReferrals: parseInt(stats.total_referrals),
          completedReferrals: parseInt(stats.completed_referrals),
          pendingReferrals: parseInt(stats.pending_referrals),
          expiredReferrals: parseInt(stats.expired_referrals),
          totalEarnedCredits: parseInt(stats.total_earned_credits)
        },
        recentReferrals: formattedReferrals
      }
    });

  } catch (error) {
    console.error('Get user referral info error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των πληροφοριών παραπομπής'
    });
  }
};

// Get user's referral history
export const getUserReferralHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status, page = 1, limit = 20 } = req.query;

    let whereConditions = ['r.referrer_id = $1'];
    let values: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`r.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM referrals r
      ${whereClause}
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get referrals with pagination
    const referralsQuery = `
      SELECT 
        r.id,
        r.referral_code,
        r.status,
        r.reward_credits,
        r.created_at,
        r.completed_at,
        up.first_name,
        up.last_name,
        up.email,
        up.phone
      FROM referrals r
      LEFT JOIN user_profiles up ON r.referred_id = up.user_id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const referralsResult = await query(referralsQuery, [...values, limit, offset]);
    const referrals = referralsResult.rows.map(referral => ({
      id: referral.id,
      referralCode: referral.referral_code,
      status: referral.status,
      rewardCredits: referral.reward_credits,
      createdAt: referral.created_at,
      completedAt: referral.completed_at,
      referredUser: {
        firstName: referral.first_name,
        lastName: referral.last_name,
        email: referral.email,
        phone: referral.phone
      }
    }));

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get user referral history error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση της ιστορίας παραπομπών'
    });
  }
};

// Process referral completion (when referred user completes registration)
export const processReferralCompletion = async (req: Request, res: Response) => {
  try {
    const { referralId } = req.params;

    // Get referral details
    const referral = await queryOne(`
      SELECT r.id, r.referrer_id, r.referred_id, r.status, r.reward_credits
      FROM referrals r
      WHERE r.id = $1
    `, [referralId]);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Η παραπομπή δεν βρέθηκε'
      });
    }

    if (referral.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Η παραπομπή δεν είναι σε pending status'
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Add reward credits to both users
      await query(`
        UPDATE memberships
        SET credits_remaining = credits_remaining + $1
        WHERE user_id = $2 AND status = 'active'
        ORDER BY end_date DESC
        LIMIT 1
      `, [referral.reward_credits, referral.referrer_id]);

      await query(`
        UPDATE memberships
        SET credits_remaining = credits_remaining + $1
        WHERE user_id = $2 AND status = 'active'
        ORDER BY end_date DESC
        LIMIT 1
      `, [referral.reward_credits, referral.referred_id]);

      // Mark referral as completed
      await query(`
        UPDATE referrals
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [referralId]);

      await query('COMMIT');

      res.json({
        success: true,
        message: 'Η παραπομπή ολοκληρώθηκε επιτυχώς',
        data: {
          rewardCredits: referral.reward_credits
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Process referral completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ολοκλήρωση της παραπομπής'
    });
  }
};

// Admin: Get all referrals
export const getAllReferrals = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`r.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM referrals r
      ${whereClause}
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get referrals with pagination
    const referralsQuery = `
      SELECT 
        r.id,
        r.referral_code,
        r.status,
        r.reward_credits,
        r.created_at,
        r.completed_at,
        referrer.first_name as referrer_first_name,
        referrer.last_name as referrer_last_name,
        referrer.email as referrer_email,
        referred.first_name as referred_first_name,
        referred.last_name as referred_last_name,
        referred.email as referred_email
      FROM referrals r
      LEFT JOIN user_profiles referrer ON r.referrer_id = referrer.user_id
      LEFT JOIN user_profiles referred ON r.referred_id = referred.user_id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const referralsResult = await query(referralsQuery, [...values, limit, offset]);
    const referrals = referralsResult.rows.map(referral => ({
      id: referral.id,
      referralCode: referral.referral_code,
      status: referral.status,
      rewardCredits: referral.reward_credits,
      createdAt: referral.created_at,
      completedAt: referral.completed_at,
      referrer: {
        firstName: referral.referrer_first_name,
        lastName: referral.referrer_last_name,
        email: referral.referrer_email
      },
      referred: {
        firstName: referral.referred_first_name,
        lastName: referral.referred_last_name,
        email: referral.referred_email
      }
    }));

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get all referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση όλων των παραπομπών'
    });
  }
};

// Admin: Get referral statistics
export const getReferralStats = async (req: Request, res: Response) => {
  try {
    const stats = await queryOne(`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_referrals,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN reward_credits ELSE 0 END), 0) as total_rewarded_credits,
        COUNT(DISTINCT referrer_id) as unique_referrers,
        COUNT(DISTINCT referred_id) as unique_referred_users
      FROM referrals
    `);

    // Get monthly referral trends
    const monthlyTrends = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as referral_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM referrals
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    const formattedTrends = monthlyTrends.rows.map(trend => ({
      month: trend.month,
      referralCount: parseInt(trend.referral_count),
      completedCount: parseInt(trend.completed_count)
    }));

    res.json({
      success: true,
      data: {
        overallStats: {
          totalReferrals: parseInt(stats.total_referrals),
          pendingReferrals: parseInt(stats.pending_referrals),
          completedReferrals: parseInt(stats.completed_referrals),
          expiredReferrals: parseInt(stats.expired_referrals),
          totalRewardedCredits: parseInt(stats.total_rewarded_credits),
          uniqueReferrers: parseInt(stats.unique_referrers),
          uniqueReferredUsers: parseInt(stats.unique_referred_users)
        },
        monthlyTrends: formattedTrends
      }
    });

  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των στατιστικών παραπομπών'
    });
  }
};

// Validate referral code
export const validateReferralCode = async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;

    // Check if referral code exists and is active
    const referralCodeData = await queryOne(`
      SELECT up.user_id, up.first_name, up.last_name
      FROM user_profiles up
      WHERE up.referral_code = $1
    `, [referralCode]);

    if (!referralCodeData) {
      return res.status(404).json({
        success: false,
        message: 'Μη έγκυρος κωδικός παραπομπής'
      });
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        referrer: {
          firstName: referralCodeData.first_name,
          lastName: referralCodeData.last_name
        }
      }
    });

  } catch (error) {
    console.error('Validate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την επικύρωση του κωδικού παραπομπής'
    });
  }
};
