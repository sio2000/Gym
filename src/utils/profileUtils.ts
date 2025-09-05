import { supabase } from '@/config/supabase';

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('[ProfileUtils] ===== UPLOAD PROFILE PHOTO STARTED =====');
    console.log('[ProfileUtils] File:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('[ProfileUtils] User ID:', userId);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Παρακαλώ επιλέξτε ένα αρχείο εικόνας');
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 5MB');
    }
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile_photo.${fileExt}`;
    
    console.log('[ProfileUtils] Uploading to:', fileName);
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('[ProfileUtils] Upload error:', error);
      throw error;
    }

    console.log('[ProfileUtils] Upload successful, data:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    console.log('[ProfileUtils] Public URL:', publicUrl);
    console.log('[ProfileUtils] ===== UPLOAD PROFILE PHOTO COMPLETED =====');
    return publicUrl;
  } catch (error) {
    console.error('[ProfileUtils] ===== UPLOAD PROFILE PHOTO FAILED =====');
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

export const deleteProfilePhoto = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([`${userId}/profile_photo.jpg`, `${userId}/profile_photo.png`, `${userId}/profile_photo.jpeg`]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw error;
  }
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
