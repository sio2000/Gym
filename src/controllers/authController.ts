import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient';

// User registration
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, referralCode } = req.body;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Το email χρησιμοποιείται ήδη'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate referral code if not provided
    const userReferralCode = referralCode || `USER${Date.now()}`;

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'user',
        is_active: true,
        email_verified: false
      })
      .select('id')
      .single();

    if (userError || !newUser) {
      throw new Error('Failed to create user');
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: newUser.id,
        first_name: firstName,
        last_name: lastName,
        referral_code: userReferralCode
      });

    if (profileError) {
      throw new Error('Failed to create user profile');
    }

    // Process referral if provided
    if (referralCode) {
      // Find referrer
      const { data: referrer, error: referrerError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('referral_code', referralCode)
        .single();

      if (referrer) {
        // Create referral record
        await supabase
          .from('referrals')
          .insert({
            referrer_id: referrer.user_id,
            referred_id: newUser.id,
            referral_code: referralCode,
            status: 'pending'
          });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email, role: 'user' },
      process.env.JWT_SECRET || 'fallback-secret'
    );

    res.status(201).json({
      success: true,
      message: 'Εγγραφή ολοκληρώθηκε επιτυχώς',
      data: {
        token,
        user: {
          id: newUser.id,
          email,
          firstName,
          lastName,
          role: 'user'
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την εγγραφή'
    });
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, role, is_active')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Λάθος email ή κωδικός πρόσβασης'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Ο λογαριασμός είναι απενεργοποιημένος'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Λάθος email ή κωδικός πρόσβασης'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret'
    );

    res.json({
      success: true,
      message: 'Σύνδεση επιτυχής',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά τη σύνδεση'
    });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_active, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'Ο χρήστης δεν βρέθηκε'
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new Error('Failed to get user profile');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          createdAt: user.created_at
        },
        profile
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση του προφίλ'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error('Failed to update profile');
    }

    res.json({
      success: true,
      message: 'Το προφίλ ενημερώθηκε επιτυχώς'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ενημέρωση του προφίλ'
    });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'Ο χρήστης δεν βρέθηκε'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Ο τρέχων κωδικός πρόσβασης είναι λάθος'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update password');
    }

    res.json({
      success: true,
      message: 'Ο κωδικός πρόσβασης άλλαξε επιτυχώς'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την αλλαγή του κωδικού πρόσβασης'
    });
  }
};

// Logout (client-side token removal)
export const logout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Αποσυνδέθηκες επιτυχώς'
  });
};
