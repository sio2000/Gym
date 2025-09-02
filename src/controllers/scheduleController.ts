import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get monthly schedule
export const getMonthlySchedule = async (req: Request, res: Response) => {
  try {
    const { data: schedule, error } = await supabase
      .from('monthly_schedule')
      .select('*')
      .order('day_of_week')
      .order('start_time');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        schedule: schedule || []
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

// Save monthly schedule
export const saveMonthlySchedule = async (req: Request, res: Response) => {
  try {
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: 'Το πρόγραμμα πρέπει να είναι ένας πίνακας'
      });
    }

    // Delete existing schedule
    const { error: deleteError } = await supabase
      .from('monthly_schedule')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      throw deleteError;
    }

    // Insert new schedule
    const { data: newSchedule, error: insertError } = await supabase
      .from('monthly_schedule')
      .insert(schedule.map(entry => ({
        day_of_week: entry.day,
        start_time: entry.time,
        lesson_name: entry.lesson,
        trainer_name: entry.trainer,
        capacity: entry.capacity,
        room: entry.room
      })))
      .select();

    if (insertError) {
      throw insertError;
    }

    res.json({
      success: true,
      message: 'Το μηνιαίο πρόγραμμα αποθηκεύτηκε επιτυχώς',
      data: {
        schedule: newSchedule
      }
    });

  } catch (error) {
    console.error('Save monthly schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την αποθήκευση του μηνιαίου προγράμματος'
    });
  }
};
