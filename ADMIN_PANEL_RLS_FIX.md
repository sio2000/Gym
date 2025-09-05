# Admin Panel RLS Fix

## Issue Identified

The Admin Panel was not showing personal training data due to **Row Level Security (RLS) policy misconfiguration**. 

### Root Cause
- RLS policies were checking the `users` table for admin role
- Admin role is actually stored in the `user_profiles` table
- This caused 403 errors when trying to access `personal_training_schedules`

### Evidence from Logs
```
[AdminPanel] Direct query succeeded: Array(0)  // Query works but returns 0 rows
Failed to load resource: the server responded with a status of 403  // INSERT fails
[AdminPanel] Personal training codes check - rows: 0 error: null  // No codes exist
```

## Solution

### 1. Fix RLS Policies
Run the SQL script to fix the RLS policies:

```sql
-- File: database/fix_admin_rls_policies.sql
-- This script updates RLS policies to check user_profiles table instead of users table
```

### 2. Enhanced Debugging
The AdminPanel now includes comprehensive debugging:

- **Role Verification**: Checks if admin role exists in `user_profiles` table
- **RLS Testing**: Tests if admin can create/read data
- **Table Count**: Checks total rows in table (bypassing RLS)
- **Error Analysis**: Detailed error logging for RLS issues

### 3. Expected Logs After Fix

```
[AdminPanel] ===== DATA LOADING STARTED =====
[AdminPanel] Current user: admin@freegym.gr Role: admin
[AdminPanel] Querying user_profiles table...
[AdminPanel] User profiles query result - rows: 59 error: null
[AdminPanel] Querying personal_training_schedules table...
[AdminPanel] Current auth user ID: [user-id]
[AdminPanel] Current auth user role: admin
[AdminPanel] Attempting to query personal_training_schedules...
[AdminPanel] Direct query succeeded: Array(X)  // Should show actual data
[AdminPanel] Schedules query result - rows: X error: null
[AdminPanel] Admin profile in database: {role: 'admin', ...}
[AdminPanel] Is admin in database: true
[AdminPanel] Total rows in table (bypassing RLS): X
[AdminPanel] Transforming user profiles...
[AdminPanel] Transformed users count: 59
[AdminPanel] Creating program statuses from schedules...
[AdminPanel] Final program statuses count: X  // Should be > 0
[AdminPanel] ===== DATA LOADING COMPLETED SUCCESSFULLY =====
```

## Files Modified

1. **`database/fix_admin_rls_policies.sql`** - New SQL script to fix RLS policies
2. **`src/pages/AdminPanel.tsx`** - Enhanced with comprehensive debugging and RLS testing

## Steps to Fix

1. **Run the complete fix script** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of database/complete_admin_fix.sql
   ```

2. **Verify the fix** by running the test script:
   ```sql
   -- Copy and paste the contents of database/test_admin_access.sql
   ```

2. **Test the Admin Panel** - The logs will now show:
   - Whether RLS is working correctly
   - Actual data counts from both tables
   - Detailed error analysis if issues persist

3. **Verify Data Loading** - The Admin Panel should now display:
   - All users from `user_profiles`
   - Personal training schedules from `personal_training_schedules`
   - Proper `programStatuses` count > 0

## Authentication Preserved

- ✅ Sign In/Sign Out flow remains completely unchanged
- ✅ No modifications to `AuthContext.tsx` authentication logic
- ✅ Only Admin Panel data loading was enhanced

## Troubleshooting

If issues persist after running the SQL script:

1. **Check Admin Role**: Verify the admin user has `role = 'admin'` in `user_profiles` table
2. **Check RLS Policies**: Ensure the new policies are active in Supabase
3. **Check Logs**: The enhanced logging will show exactly where the issue is
4. **Test Permissions**: The system now tests if admin can create data

## Expected Results

After applying the fix:
- ✅ Admin Panel loads real data from Supabase
- ✅ `programStatuses` shows actual personal training programs
- ✅ No more 403 errors
- ✅ Sign In/Sign Out continues to work perfectly
- ✅ Comprehensive logging for debugging
