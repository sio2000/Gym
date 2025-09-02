import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { supabase } from '../config/supabase';

// Get user dashboard statistics
export const getUserDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get user's current membership info
    const membership = await queryOne(`
      SELECT 
        m.credits_remaining,
        m.credits_total,
        m.end_date,
        mp.name as package_name
      FROM memberships m
      LEFT JOIN membership_packages mp ON m.package_id = mp.id
      WHERE m.user_id = $1 AND m.status = 'active'
      ORDER BY m.end_date DESC
      LIMIT 1
    `, [userId]);

    // Get upcoming bookings count
    const upcomingBookings = await queryOne(`
      SELECT COUNT(*) as count
      FROM bookings b
      WHERE b.user_id = $1 
      AND b.status = 'confirmed' 
      AND b.lesson_date > CURRENT_DATE
    `, [userId]);

    // Get today's bookings
    const todayBookings = await queryOne(`
      SELECT COUNT(*) as count
      FROM bookings b
      WHERE b.user_id = $1 
      AND b.status = 'confirmed' 
      AND b.lesson_date = CURRENT_DATE
    `, [userId]);

    // Get total lessons attended
    const totalAttended = await queryOne(`
      SELECT COUNT(*) as count
      FROM bookings b
      WHERE b.user_id = $1 
      AND b.check_in_time IS NOT NULL
    `, [userId]);

    // Get recent activity (last 5 bookings)
    const recentActivity = await query(`
      SELECT 
        b.lesson_date,
        b.status,
        l.name as lesson_name,
        lc.name as category_name,
        lc.color as category_color,
        up.first_name as trainer_first_name,
        up.last_name as trainer_last_name
      FROM bookings b
      LEFT JOIN lessons l ON b.lesson_id = l.id
      LEFT JOIN lesson_categories lc ON l.category_id = lc.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      LEFT JOIN user_profiles up ON t.user_id = up.user_id
      WHERE b.user_id = $1
      ORDER BY b.lesson_date DESC, b.created_at DESC
      LIMIT 5
    `, [userId]);

    const formattedRecentActivity = recentActivity.rows.map(activity => ({
      lessonDate: activity.lesson_date,
      status: activity.status,
      lessonName: activity.lesson_name,
      category: {
        name: activity.category_name,
        color: activity.category_color
      },
      trainer: {
        firstName: activity.trainer_first_name,
        lastName: activity.trainer_last_name
      }
    }));

    // Get available lessons for today
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const availableLessons = await query(`
      SELECT 
        l.id,
        l.name,
        l.start_time,
        l.end_time,
        l.difficulty,
        lc.name as category_name,
        lc.color as category_color,
        up.first_name as trainer_first_name,
        up.last_name as trainer_last_name,
        r.name as room_name,
        COALESCE(booking_count.count, 0) as current_bookings
      FROM lessons l
      LEFT JOIN lesson_categories lc ON l.category_id = lc.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      LEFT JOIN user_profiles up ON t.user_id = up.user_id
      LEFT JOIN rooms r ON l.room_id = r.id
      LEFT JOIN (
        SELECT 
          lesson_id,
          COUNT(*) as count
        FROM bookings
        WHERE lesson_date = CURRENT_DATE AND status != 'cancelled'
        GROUP BY lesson_id
      ) booking_count ON l.id = booking_count.lesson_id
      WHERE l.day_of_week = $1 
      AND l.is_active = true
      AND l.start_time > CURRENT_TIME
      ORDER BY l.start_time
      LIMIT 5
    `, [dayOfWeek]);

    const formattedAvailableLessons = availableLessons.rows.map(lesson => ({
      id: lesson.id,
      name: lesson.name,
      startTime: lesson.start_time,
      endTime: lesson.end_time,
      difficulty: lesson.difficulty,
      category: {
        name: lesson.category_name,
        color: lesson.category_color
      },
      trainer: {
        firstName: lesson.trainer_first_name,
        lastName: lesson.trainer_last_name
      },
      room: {
        name: lesson.room_name
      },
      availableSpots: lesson.capacity - lesson.current_bookings
    }));

    res.json({
      success: true,
      data: {
        membership: membership ? {
          creditsRemaining: membership.credits_remaining,
          creditsTotal: membership.credits_total,
          endDate: membership.end_date,
          packageName: membership.package_name
        } : null,
        statistics: {
          upcomingBookings: parseInt(upcomingBookings.count),
          todayBookings: parseInt(todayBookings.count),
          totalAttended: parseInt(totalAttended.count)
        },
        recentActivity: formattedRecentActivity,
        availableLessons: formattedAvailableLessons
      }
    });

  } catch (error) {
    console.error('Get user dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των στατιστικών dashboard'
    });
  }
};

// Get admin dashboard statistics
export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    // Get active memberships count
    const { count: activeMemberships } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total revenue from approved payments
    const { data: totalRevenueData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'approved');

    const totalRevenue = totalRevenueData?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

    // Get monthly revenue (current month)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const { data: monthlyRevenueData } = await supabase
      .from('payments')
      .select('amount, approved_at')
      .eq('status', 'approved')
      .not('approved_at', 'is', null);

    const monthlyRevenue = monthlyRevenueData?.filter(payment => {
      const approvedDate = new Date(payment.approved_at);
      return approvedDate.getFullYear() === currentYear && approvedDate.getMonth() + 1 === currentMonth;
    }).reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

    // Get pending payments count
    const { count: pendingPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total lessons count
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);



    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers || 0,
          activeMemberships: activeMemberships || 0,
          totalRevenue: totalRevenue,
          pendingPayments: pendingPayments || 0,
          monthlyRevenue: monthlyRevenue,
          totalLessons: totalLessons || 0
        }
      }
    });

  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των στατιστικών admin dashboard'
    });
  }
};

// Get trainer dashboard statistics
export const getTrainerDashboardStats = async (req: Request, res: Response) => {
  try {
    const trainerId = req.user!.userId;

    // Get trainer's lessons count
    const totalLessons = await queryOne(`
      SELECT COUNT(*) as count
      FROM lessons
      WHERE trainer_id = $1 AND is_active = true
    `, [trainerId]);

    // Get today's lessons
    const todayLessons = await queryOne(`
      SELECT COUNT(*) as count
      FROM lessons l
      LEFT JOIN bookings b ON l.id = b.lesson_id
      WHERE l.trainer_id = $1 
      AND l.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
      AND l.is_active = true
    `, [trainerId]);

    // Get total students
    const totalStudents = await queryOne(`
      SELECT COUNT(DISTINCT b.user_id) as count
      FROM lessons l
      LEFT JOIN bookings b ON l.id = b.lesson_id
      WHERE l.trainer_id = $1
      AND b.status != 'cancelled'
    `, [trainerId]);

    // Get this month's bookings
    const monthlyBookings = await queryOne(`
      SELECT COUNT(*) as count
      FROM lessons l
      LEFT JOIN bookings b ON l.id = b.lesson_id
      WHERE l.trainer_id = $1
      AND b.created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND b.status != 'cancelled'
    `, [trainerId]);

    // Get upcoming lessons
    const upcomingLessons = await query(`
      SELECT 
        l.name,
        l.start_time,
        l.end_time,
        lc.name as category_name,
        r.name as room_name,
        COUNT(b.id) as booking_count
      FROM lessons l
      LEFT JOIN lesson_categories lc ON l.category_id = lc.id
      LEFT JOIN rooms r ON l.room_id = r.id
      LEFT JOIN bookings b ON l.id = b.lesson_id AND b.status != 'cancelled'
      WHERE l.trainer_id = $1 
      AND l.is_active = true
      AND l.day_of_week >= EXTRACT(DOW FROM CURRENT_DATE)
      GROUP BY l.id, l.name, l.start_time, l.end_time, lc.name, r.name
      ORDER BY l.day_of_week, l.start_time
      LIMIT 10
    `, [trainerId]);

    const formattedUpcomingLessons = upcomingLessons.rows.map(lesson => ({
      name: lesson.name,
      startTime: lesson.start_time,
      endTime: lesson.end_time,
      category: lesson.category_name,
      room: lesson.room_name,
      bookingCount: parseInt(lesson.booking_count)
    }));

    // Get lesson performance
    const lessonPerformance = await query(`
      SELECT 
        l.name,
        lc.name as category_name,
        COUNT(b.id) as total_bookings,
        COUNT(CASE WHEN b.check_in_time IS NOT NULL THEN 1 END) as attended_bookings,
        ROUND(
          (COUNT(CASE WHEN b.check_in_time IS NOT NULL THEN 1 END)::DECIMAL / 
           NULLIF(COUNT(b.id), 0)::DECIMAL) * 100, 2
        ) as attendance_rate
      FROM lessons l
      LEFT JOIN lesson_categories lc ON l.category_id = lc.id
      LEFT JOIN bookings b ON l.id = b.lesson_id
      WHERE l.trainer_id = $1
      AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'
      AND b.status != 'cancelled'
      GROUP BY l.id, l.name, lc.name
      ORDER BY total_bookings DESC
      LIMIT 5
    `, [trainerId]);

    const formattedLessonPerformance = lessonPerformance.rows.map(lesson => ({
      name: lesson.name,
      category: lesson.category_name,
      totalBookings: parseInt(lesson.total_bookings),
      attendedBookings: parseInt(lesson.attended_bookings),
      attendanceRate: parseFloat(lesson.attendance_rate)
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalLessons: parseInt(totalLessons.count),
          todayLessons: parseInt(todayLessons.count),
          totalStudents: parseInt(totalStudents.count),
          monthlyBookings: parseInt(monthlyBookings.count)
        },
        upcomingLessons: formattedUpcomingLessons,
        lessonPerformance: formattedLessonPerformance
      }
    });

  } catch (error) {
    console.error('Get trainer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των στατισ�