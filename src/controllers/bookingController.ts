import { Request, Response } from 'express';
import { query, queryOne, queryMany } from '../config/database';

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { lessonId, lessonDate } = req.body;

    // Check if user has active membership with credits
    const membership = await queryOne(`
      SELECT m.id, m.credits_remaining, m.status, m.end_date
      FROM memberships m
      WHERE m.user_id = $1 AND m.status = 'active' AND m.end_date >= CURRENT_DATE
      ORDER BY m.end_date DESC
      LIMIT 1
    `, [userId]);

    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'Δεν έχετε ενεργή συνδρομή με διαθέσιμες πιστώσεις'
      });
    }

    if (membership.credits_remaining < 1) {
      return res.status(400).json({
        success: false,
        message: 'Δεν έχετε αρκετές πιστώσεις για αυτή την κράτηση'
      });
    }

    // Check if lesson exists and is active
    const lesson = await queryOne(`
      SELECT l.id, l.capacity, l.day_of_week, l.start_time
      FROM lessons l
      WHERE l.id = $1 AND l.is_active = true
    `, [lessonId]);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Το μάθημα δεν βρέθηκε ή δεν είναι ενεργό'
      });
    }

    // Check if lesson is on the correct day
    const selectedDate = new Date(lessonDate);
    const dayOfWeek = selectedDate.getDay();
    
    if (dayOfWeek !== lesson.day_of_week) {
      return res.status(400).json({
        success: false,
        message: 'Το μάθημα δεν είναι διαθέσιμο αυτή την ημέρα'
      });
    }

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      return res.status(400).json({
        success: false,
        message: 'Δεν μπορείτε να κλείσετε μαθήματα για παρελθοντικές ή σημερινές ημερομηνίες'
      });
    }

    // Check if user already has a booking for this lesson and date
    const existingBooking = await queryOne(`
      SELECT id FROM bookings
      WHERE user_id = $1 AND lesson_id = $2 AND lesson_date = $3 AND status != 'cancelled'
    `, [userId, lessonId, lessonDate]);

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Έχετε ήδη κλείσει αυτό το μάθημα για αυτή την ημερομηνία'
      });
    }

    // Check room capacity
    const currentBookings = await queryOne(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE lesson_id = $1 AND lesson_date = $2 AND status != 'cancelled'
    `, [lessonId, lessonDate]);

    if (parseInt(currentBookings.count) >= lesson.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Το μάθημα είναι πλήρες για αυτή την ημερομηνία'
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Create booking
      const bookingResult = await query(`
        INSERT INTO bookings (user_id, lesson_id, lesson_date, status, credits_used)
        VALUES ($1, $2, $3, 'confirmed', 1)
        RETURNING id
      `, [userId, lessonId, lessonDate]);

      const bookingId = bookingResult.rows[0].id;

      // Deduct credits from membership
      await query(`
        UPDATE memberships
        SET credits_remaining = credits_remaining - 1
        WHERE id = $1
      `, [membership.id]);

      // Generate QR code
      const qrCode = generateQRCode();
      await query(`
        INSERT INTO qr_codes (booking_id, code, expires_at)
        VALUES ($1, $2, $3)
      `, [bookingId, qrCode, new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)]);

      await query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Η κράτηση δημιουργήθηκε επιτυχώς',
        data: {
          booking: {
            id: bookingId,
            lessonId,
            lessonDate,
            status: 'confirmed',
            creditsUsed: 1
          },
          qrCode,
          remainingCredits: membership.credits_remaining - 1
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά τη δημιουργία της κράτησης'
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status, page = 1, limit = 20 } = req.query;

    let whereConditions = ['b.user_id = $1'];
    let values: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`b.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      ${whereClause}
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get bookings with pagination
    const bookingsQuery = `
      SELECT 
        b.id,
        b.lesson_date,
        b.status,
        b.credits_used,
        b.check_in_time,
        b.check_out_time,
        b.notes,
        b.created_at,
        l.id as lesson_id,
        l.name as lesson_name,
        l.start_time,
        l.end_time,
        l.difficulty,
        lc.id as category_id,
        lc.name as category_name,
        lc.color as category_color,
        t.id as trainer_id,
        up.first_name as trainer_first_name,
        up.last_name as trainer_last_name,
        r.id as room_id,
        r.name as room_name,
        qr.code as qr_code,
        qr.status as qr_status,
        qr.expires_at as qr_expires_at
      FROM bookings b
      LEFT JOIN lessons l ON b.lesson_id = l.id
      LEFT JOIN lesson_categories lc ON l.category_id = lc.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      LEFT JOIN user_profiles up ON t.user_id = up.user_id
      LEFT JOIN rooms r ON l.room_id = r.id
      LEFT JOIN qr_codes qr ON b.id = qr.booking_id
      ${whereClause}
      ORDER BY b.lesson_date DESC, l.start_time
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const bookingsResult = await query(bookingsQuery, [...values, limit, offset]);
    const bookings = bookingsResult.rows.map(booking => ({
      id: booking.id,
      lessonDate: booking.lesson_date,
      status: booking.status,
      creditsUsed: booking.credits_used,
      checkInTime: booking.check_in_time,
      checkOutTime: booking.check_out_time,
      notes: booking.notes,
      createdAt: booking.created_at,
      lesson: {
        id: booking.lesson_id,
        name: booking.lesson_name,
        startTime: booking.start_time,
        endTime: booking.end_time,
        difficulty: booking.difficulty,
        category: {
          id: booking.category_id,
          name: booking.category_name,
          color: booking.category_color
        },
        trainer: {
          id: booking.trainer_id,
          firstName: booking.trainer_first_name,
          lastName: booking.trainer_last_name
        },
        room: {
          id: booking.room_id,
          name: booking.room_name
        }
      },
      qrCode: {
        code: booking.qr_code,
        status: booking.qr_status,
        expiresAt: booking.qr_expires_at
      }
    }));

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των κρατήσεων'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Get booking details
    const booking = await queryOne(`
      SELECT b.id, b.lesson_date, b.status, b.credits_used, b.user_id
      FROM bookings b
      WHERE b.id = $1
    `, [id]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Η κράτηση δεν βρέθηκε'
      });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Δεν έχετε δικαίωμα να ακυρώσετε αυτή την κράτηση'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Η κράτηση έχει ήδη ακυρωθεί'
      });
    }

    // Check if cancellation is allowed (48 hours before lesson)
    const lessonDate = new Date(booking.lesson_date);
    const now = new Date();
    const hoursUntilLesson = (lessonDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilLesson < 48) {
      return res.status(400).json({
        success: false,
        message: 'Δεν μπορείτε να ακυρώσετε την κράτηση λιγότερο από 48 ώρες πριν το μάθημα'
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Cancel booking
      await query(`
        UPDATE bookings
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      // Return credits to membership
      await query(`
        UPDATE memberships
        SET credits_remaining = credits_remaining + $1
        WHERE user_id = $2 AND status = 'active'
        ORDER BY end_date DESC
        LIMIT 1
      `, [booking.credits_used, userId]);

      // Deactivate QR code
      await query(`
        UPDATE qr_codes
        SET status = 'expired', updated_at = CURRENT_TIMESTAMP
        WHERE booking_id = $1
      `, [id]);

      await query('COMMIT');

      res.json({
        success: true,
        message: 'Η κράτηση ακυρώθηκε επιτυχώς'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ακύρωση της κράτησης'
    });
  }
};

// Check-in with QR code
export const checkInWithQR = async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.body;

    // Find active QR code
    const qrCodeData = await queryOne(`
      SELECT qr.id, qr.booking_id, qr.status, qr.expires_at,
             b.id as booking_id, b.lesson_date, b.status as booking_status,
             l.name as lesson_name, l.start_time, l.end_time
      FROM qr_codes qr
      LEFT JOIN bookings b ON qr.booking_id = b.id
      LEFT JOIN lessons l ON b.lesson_id = l.id
      WHERE qr.code = $1
    `, [qrCode]);

    if (!qrCodeData) {
      return res.status(404).json({
        success: false,
        message: 'Μη έγκυρος QR κωδικός'
      });
    }

    if (qrCodeData.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ο QR κωδικός δεν είναι ενεργός'
      });
    }

    if (qrCodeData.booking_status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Η κράτηση δεν είναι επιβεβαιωμένη'
      });
    }

    // Check if lesson is today
    const today = new Date();
    const lessonDate = new Date(qrCodeData.lesson_date);
    
    if (today.toDateString() !== lessonDate.toDateString()) {
      return res.status(400).json({
        success: false,
        message: 'Ο QR κωδικός είναι έγκυρος μόνο την ημέρα του μαθήματος'
      });
    }

    // Check if already checked in
    if (qrCodeData.check_in_time) {
      return res.status(400).json({
        success: false,
        message: 'Έχετε ήδη κάνει check-in για αυτό το μάθημα'
      });
    }

    // Perform check-in
    await query(`
      UPDATE bookings
      SET check_in_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [qrCodeData.booking_id]);

    await query(`
      UPDATE qr_codes
      SET status = 'used', used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [qrCodeData.id]);

    res.json({
      success: true,
      message: 'Check-in επιτυχές',
      data: {
        lessonName: qrCodeData.lesson_name,
        startTime: qrCodeData.start_time,
        endTime: qrCodeData.end_time,
        checkInTime: new Date()
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά το check-in'
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const stats = await queryOne(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN check_in_time IS NOT NULL THEN 1 END) as attended_lessons
      FROM bookings
      WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings: parseInt(stats.total_bookings),
          confirmedBookings: parseInt(stats.confirmed_bookings),
          cancelledBookings: parseInt(stats.cancelled_bookings),
          completedBookings: parseInt(stats.completed_bookings),
          attendedLessons: parseInt(stats.attended_lessons)
        }
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των στατιστικών'
    });
  }
};

// Generate QR code
const generateQRCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
