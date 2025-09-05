// Auth Debug Utility
export const debugAuthState = () => {
  console.log('=== AUTH DEBUG INFO ===');
  
  // Check localStorage
  console.log('localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('freegym') || key.includes('supabase'))) {
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
  }
  
  // Check sessionStorage
  console.log('sessionStorage items:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('freegym') || key.includes('supabase'))) {
      console.log(`  ${key}:`, sessionStorage.getItem(key));
    }
  }
  
  // Check if we have any Supabase clients in window
  const w = window as any;
  if (w.__freegym_supabase) {
    console.log('Main Supabase client exists');
  }
  
  console.log('=== END AUTH DEBUG ===');
};

export const clearAllAuthData = () => {
  console.log('Clearing all auth data...');
  
  // Clear localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('freegym') || key.includes('supabase'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear any Supabase clients
  const w = window as any;
  if (w.__freegym_supabase) {
    delete w.__freegym_supabase;
  }
  
  console.log('All auth data cleared');
};
