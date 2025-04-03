const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixRlsPolicies() {
  try {
    console.log('Starting RLS policy fix...')
    
    // 1. First, get the admin user to ensure it exists
    const { data, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return
    }
    
    const adminUser = data.users.find(user => 
      user.email === 'admin@admin.com' || 
      (user.user_metadata && user.user_metadata.role === 'admin')
    )
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.')
      return
    }
    
    console.log(`Found admin user: ${adminUser.email}`)
    
    // 2. Update the admin user's metadata to ensure it has the admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { user_metadata: { role: 'admin' } }
    )
    
    if (updateError) {
      console.error('Error updating admin role:', updateError)
    } else {
      console.log('Admin role metadata updated successfully')
    }
    
    // 3. Drop existing policies and recreate them with the correct syntax
    console.log('Fixing RLS policies...')
    
    try {
      // Drop existing policies
      await supabase.sql(`
        DROP POLICY IF EXISTS admin_users_policy ON public.users;
        DROP POLICY IF EXISTS users_self_policy ON public.users;
      `)
      console.log('Dropped existing policies')
    } catch (dropError) {
      console.log('Error dropping policies (may not exist):', dropError.message)
    }
    
    // Create the users table if it doesn't exist
    try {
      await supabase.sql(`
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          last_sign_in_at TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'active'
        );
      `)
      console.log('Verified users table exists')
    } catch (tableError) {
      console.error('Error creating users table:', tableError.message)
    }
    
    // Enable RLS on the users table
    try {
      await supabase.sql(`
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
      `)
      console.log('Enabled RLS on users table')
    } catch (rlsError) {
      console.log('Error enabling RLS (may already be enabled):', rlsError.message)
    }
    
    // Create new policies with the correct syntax for user_metadata
    try {
      // First policy: Admin can do everything
      await supabase.sql(`
        CREATE POLICY admin_users_policy ON public.users 
        FOR ALL 
        TO authenticated 
        USING (
          (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
        );
      `)
      console.log('Created admin policy')
      
      // Second policy: Users can only see themselves
      await supabase.sql(`
        CREATE POLICY users_self_policy ON public.users 
        FOR SELECT 
        TO authenticated 
        USING (id = auth.uid());
      `)
      console.log('Created user self-view policy')
    } catch (policyError) {
      console.error('Error creating policies:', policyError.message)
    }
    
    // 4. Make sure the admin user is in the users table
    try {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: adminUser.id,
          email: adminUser.email,
          role: 'admin',
          created_at: adminUser.created_at || new Date().toISOString(),
          last_sign_in_at: adminUser.last_sign_in_at || null,
          status: 'active'
        })
      
      if (upsertError) {
        console.error('Error adding admin to users table:', upsertError.message)
      } else {
        console.log('Admin added to users table successfully')
      }
    } catch (upsertError) {
      console.error('Error upserting admin user:', upsertError.message)
    }
    
    console.log('\nRLS policy fix complete!')
    console.log('---------------------')
    console.log('Please sign out and sign back in with your admin account')
    console.log('---------------------')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixRlsPolicies()