import { Request, Response } from 'express';
import { query, queryOne, queryMany } from '../config/database';
import { supabase } from '../config/supabase';

// Get membership packages
export const getMembershipPackages = async (req: Request, res: Response) => {
  try {
    const { isActive = 'true' } = req.query;

    const packages = await query(`
      SELECT 
        id,
        name,
        description,
        price,
        credits,
        validity_days,
        is_active,
        created_at
      FROM membership_packages
      WHERE is_active = $1
      ORDER BY price ASC
    `, [isActive === 'true']);

    const formattedPackages = packages.rows.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: parseFloat(pkg.price),
      credits: pkg.credits,
      validityDays: pkg.validity_days,
      isActive: pkg.is_active,
      createdAt: pkg.created_at
    }));

    res.json({
      success: true,
      data: {
        packages: formattedPackages
      }
    });

  } catch (error) {
    console.error('Get membership packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των πακέτων συνδρομής'
    });
  }
};

// Get user's current membership
export const getUserMembership = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const membership = await queryOne(`
      SELECT 
        m.id,
        m.status,
        m.credits_remaining,
        m.credits_total,
        m.start_date,
        m.end_date,
        m.created_at,
        mp.id as package_id,
        mp.name as package_name,
        mp.description as package_description,
        mp.price as package_price,
        mp.credits as package_credits,
        mp.validity_days as package_validity_days
      FROM memberships m
      LEFT JOIN membership_packages mp ON m.package_id = mp.id
      WHERE m.user_id = $1 AND m.status = 'active'
      ORDER BY m.end_date DESC
      LIMIT 1
    `, [userId]);

    if (!membership) {
      return res.json({
        success: true,
        data: {
          membership: null
        }
      });
    }

    const formattedMembership = {
      id: membership.id,
      status: membership.status,
      creditsRemaining: membership.credits_remaining,
      creditsTotal: membership.credits_total,
      startDate: membership.start_date,
      endDate: membership.end_date,
      createdAt: membership.created_at,
      package: {
        id: membership.package_id,
        name: membership.package_name,
        description: membership.package_description,
        price: parseFloat(membership.package_price),
        credits: membership.package_credits,
        validityDays: membership.package_validity_days
      }
    };

    res.json({
      success: true,
      data: {
        membership: formattedMembership
      }
    });

  } catch (error) {
    console.error('Get user membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση της συνδρομής'
    });
  }
};

// Purchase membership package
export const purchaseMembership = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { packageId, paymentMethod } = req.body;

    // Get package details
    const packageData = await queryOne(`
      SELECT id, name, price, credits, validity_days
      FROM membership_packages
      WHERE id = $1 AND is_active = true
    `, [packageId]);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Το πακέτο συνδρομής δεν βρέθηκε'
      });
    }

    // Check if user already has an active membership
    const existingMembership = await queryOne(`
      SELECT id FROM memberships
      WHERE user_id = $1 AND status = 'active'
    `, [userId]);

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'Έχετε ήδη ενεργή συνδρομή'
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Create payment record
      const paymentResult = await query(`
        INSERT INTO payments (user_id, amount, currency, status, payment_method, expires_at)
        VALUES ($1, $2, 'EUR', 'pending', $3, CURRENT_TIMESTAMP + INTERVAL '48 hours')
        RETURNING id
      `, [userId, packageData.price, paymentMethod]);

      const paymentId = paymentResult.rows[0].id;

      // Create membership (will be activated after payment approval)
      const membershipResult = await query(`
        INSERT INTO memberships (user_id, package_id, status, credits_remaining, credits_total, start_date, end_date)
        VALUES ($1, $2, 'pending', 0, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '$4 days')
        RETURNING id
      `, [userId, packageId, packageData.credits, packageData.validity_days]);

      const membershipId = membershipResult.rows[0].id;

      // Link payment to membership
      await query(`
        UPDATE payments
        SET membership_id = $1
        WHERE id = $2
      `, [membershipId, paymentId]);

      await query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Η αγορά του πακέτου συνδρομής δημιουργήθηκε επιτυχώς',
        data: {
          payment: {
            id: paymentId,
            amount: parseFloat(packageData.price),
            status: 'pending',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
          },
          membership: {
            id: membershipId,
            packageName: packageData.name,
            credits: packageData.credits,
            validityDays: packageData.validity_days
          }
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Purchase membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την αγορά του πακέτου συνδρομής'
    });
  }
};

// Get user's payment history
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status, page = 1, limit = 20 } = req.query;

    let whereConditions = ['p.user_id = $1'];
    let values: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`p.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM payments p
      ${whereClause}
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get payments with pagination
    const paymentsQuery = `
      SELECT 
        p.id,
        p.amount,
        p.currency,
        p.status,
        p.payment_method,
        p.transaction_id,
        p.approved_by,
        p.approved_at,
        p.expires_at,
        p.created_at,
        mp.name as package_name,
        mp.credits as package_credits
      FROM payments p
      LEFT JOIN memberships m ON p.membership_id = m.id
      LEFT JOIN membership_packages mp ON m.package_id = mp.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const paymentsResult = await query(paymentsQuery, [...values, limit, offset]);
    const payments = paymentsResult.rows.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
      approvedBy: payment.approved_by,
      approvedAt: payment.approved_at,
      expiresAt: payment.expires_at,
      createdAt: payment.created_at,
      package: payment.package_name ? {
        name: payment.package_name,
        credits: payment.package_credits
      } : null
    }));

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση της ιστορίας πληρωμών'
    });
  }
};

// Admin: Approve/reject payment
export const approvePayment = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { paymentId } = req.params;
    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Μη έγκυρο status πληρωμής'
      });
    }

    // Get payment details
    const payment = await queryOne(`
      SELECT p.id, p.user_id, p.amount, p.status, p.membership_id
      FROM payments p
      WHERE p.id = $1
    `, [paymentId]);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Η πληρωμή δεν βρέθηκε'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Η πληρωμή δεν είναι σε pending status'
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Update payment status
      await query(`
        UPDATE payments
        SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [status, adminId, paymentId]);

      if (status === 'approved' && payment.membership_id) {
        // Activate membership and add credits
        const membership = await queryOne(`
          SELECT mp.credits, mp.validity_days
          FROM memberships m
          LEFT JOIN membership_packages mp ON m.package_id = mp.id
          WHERE m.id = $1
        `, [payment.membership_id]);

        if (membership) {
          await query(`
            UPDATE memberships
            SET status = 'active', credits_remaining = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [membership.credits, payment.membership_id]);
        }
      } else if (status === 'rejected' && payment.membership_id) {
        // Mark membership as cancelled
        await query(`
          UPDATE memberships
          SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [payment.membership_id]);
      }

      await query('COMMIT');

      res.json({
        success: true,
        message: `Η πληρωμή ${status === 'approved' ? 'εγκρίθηκε' : 'απορρίφθηκε'} επιτυχώς`
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την έγκριση της πληρωμής'
    });
  }
};

// Get membership statistics
export const getMembershipStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const stats = await queryOne(`
      SELECT 
        COUNT(*) as total_memberships,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_memberships,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_memberships,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_memberships,
        COALESCE(SUM(CASE WHEN status = 'active' THEN credits_remaining ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN status = 'active' THEN credits_total ELSE 0 END), 0) as total_purchased_credits
      FROM memberships
      WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      data: {
        stats: {
          totalMemberships: parseInt(stats.total_memberships),
          activeMemberships: parseInt(stats.active_memberships),
          expiredMemberships: parseInt(stats.expired_memberships),
          cancelledMemberships: parseInt(stats.cancelled_memberships),
          totalCredits: parseInt(stats.total_credits),
          totalPurchasedCredits: parseInt(stats.total_purchased_credits)
        }
      }
    });

  } catch (error) {
    console.error('Get membership stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των στατιστικών συνδρομής'
    });
  }
};

// Admin: Get all pending payments
export const getPendingPayments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get pending payments with user and package info
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        currency,
        status,
        payment_method,
        created_at,
        expires_at,
        users!inner(email),
        user_profiles!inner(first_name, last_name),
        memberships!inner(
          membership_packages!inner(name, credits)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    const formattedPayments = payments?.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at,
      expiresAt: payment.expires_at,
      user: {
        email: payment.users?.email,
        firstName: payment.user_profiles?.first_name,
        lastName: payment.user_profiles?.last_name
      },
      package: payment.memberships?.membership_packages ? {
        name: payment.memberships.membership_packages.name,
        credits: payment.memberships.membership_packages.credits
      } : null
    })) || [];

    res.json({
      success: true,
      data: {
        payments: formattedPayments
      }
    });

  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των εκκ