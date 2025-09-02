import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Get all lessons with optional filtering
export const getLessons = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, trainer, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('lessons')
      .select(`
        *,
        lesson_categories(name, description, color),
        trainers(user_id, bio, specialties),
        rooms(name, capacity, description)
      `)
      .eq('is_active', true);
    
    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    if (trainer) {
      query = query.eq('trainer_id', trainer);
    }
    
    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query = query.range(offset, offset + parseInt(limit as string) - 1);
    
    const { data: lessons, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data: lessons,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: count || 0
      }
    });
    
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των μαθημάτων'
    });
  }
};

// Get lesson by ID
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        lesson_categories(name, description, color),
        trainers(user_id, bio, specialties),
        rooms(name, capacity, description)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error || !lesson) {
      return res.status(404).json({
        success: false,
        message: 'Το μάθημα δεν βρέθηκε'
      });
    }
    
    res.json({
      success: true,
      data: lesson
    });
    
  } catch (error) {
    console.error('Get lesson by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση του μαθήματος'
    });
  }
};

// Get lessons by date
export const getLessonsByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    // Parse date and get day of week
    const lessonDate = new Date(date);
    const dayOfWeek = lessonDate.getDay();
    
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select(`
        *,
        lesson_categories(name, description, color),
        trainers(user_id, bio, specialties),
        rooms(name, capacity, description)
      `)
      .eq('is_active', true)
      .eq('day_of_week', dayOfWeek);
    
    if (error) {
      throw error;
    }
    
    // Get current booking counts for each lesson
    const lessonsWithBookings = await Promise.all(
      lessons?.map(async (lesson) => {
        const { count: bookingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id)
          .eq('lesson_date', date)
          .neq('status', 'cancelled');
        
        return {
          ...lesson,
          currentBookings: bookingCount || 0,
          availableSpots: lesson.capacity - (bookingCount || 0)
        };
      }) || []
    );
    
    res.json({
      success: true,
      data: lessonsWithBookings
    });
    
  } catch (error) {
    console.error('Get lessons by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των μαθημάτων'
    });
  }
};

// Get lesson categories
export const getLessonCategories = async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Get lesson categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των κατηγοριών μαθημάτων'
    });
  }
};

// Get monthly schedule (admin)
export const getMonthlySchedule = async (req: Request, res: Response) => {
  try {
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select(`
        id,
        name,
        start_time,
        end_time,
        day_of_week,
        capacity,
        lesson_categories(name, color),
        trainers(user_id, bio, specialties)
      `)
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time');
    
    if (error) {
      throw error;
    }
    
    // Get current booking counts for each lesson
    const lessonsWithBookings = await Promise.all(
      lessons?.map(async (lesson) => {
        const { count: bookingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id)
          .neq('status', 'cancelled');
        
        // Get trainer profile
        const { data: trainerProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', lesson.trainers?.user_id)
          .single();
        
        return {
          id: lesson.id,
          name: lesson.name,
          startTime: lesson.start_time,
          endTime: lesson.end_time,
          dayOfWeek: lesson.day_of_week,
          capacity: lesson.capacity,
          currentBookings: bookingCount || 0,
          trainer: trainerProfile ? {
            firstName: trainerProfile.first_name,
            lastName: trainerProfile.last_name
          } : { firstName: 'N/A', lastName: 'N/A' },
          category: {
            name: lesson.lesson_categories?.name || 'N/A',
            color: lesson.lesson_categories?.color || '#6B7280'
          }
        };
      }) || []
    );
    
    res.json({
      success: true,
      data: {
        lessons: lessonsWithBookings
      }
    });
    
  } catch (error) {
    console.error('Get monthly schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση του μηνιαίου προγράμματος'
    });
  }
};

// Get trainers
export const getTrainers = async (req: Request, res: Response) => {
  try {
    const { data: trainers, error } = await supabase
      .from('trainers')
      .select(`
        *,
        user_profiles(first_name, last_name)
      `)
      .eq('is_active', true);
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data: trainers
    });
    
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των προπονητών'
    });
  }
};

// Get rooms
export const getRooms = async (req: Request, res: Response) => {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data: rooms
    });
    
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των αίθουσων'
    });
  }
};
