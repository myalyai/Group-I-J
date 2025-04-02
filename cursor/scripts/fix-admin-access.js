const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAdminAccess() {
  try {
    console.log('Starting admin access fix...')
    
    // 1. Create or update admin user
    const adminEmail = 'admin@admin.com'
    const adminPassword = 'Admin123!'
    
    console.log(`Creating/updating admin user: ${adminEmail}`)
    
    // Try to create the admin user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    })
    
    let adminUser
    
    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log('Admin user already exists, updating role...')
        
        // Get all users to find the admin
        const { data, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) {
          console.error('Error listing users:', listError)
          return
        }
        
        adminUser = data.users.find(user => user.email === adminEmail)
        
        if (!adminUser) {
          console.error('Admin user not found')
          return
        }
        
        // Update the admin user's role
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          adminUser.id,
          { user_metadata: { role: 'admin' } }
        )
        
        if (updateError) {
          console.error('Error updating admin role:', updateError)
          return
        }
        
        console.log('Admin role updated successfully')
      } else {
        console.error('Error creating admin user:', createError)
        return
      }
    } else {
      adminUser = userData.user
      console.log('Admin user created successfully')
    }
    
    // 2. Fix the users table and RLS policies
    console.log('Setting up users table with correct RLS policies...')
    
    // Drop existing policies first
    try {
      await supabase.sql(`
        DROP POLICY IF EXISTS admin_users_policy ON public.users;
        DROP POLICY IF EXISTS users_self_policy ON public.users;
      `)
      console.log('Dropped existing policies')
    } catch (dropError) {
      console.log('No existing policies to drop or error:', dropError)
    }
    
    // Create the table if it doesn't exist
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
        
        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
      `)
      console.log('Created/verified users table')
    } catch (tableError) {
      console.error('Error creating users table:', tableError)
    }
    
    // Create new policies with correct syntax for user_metadata
    try {
      await supabase.sql(`
        -- Create policy for admins (can see all users)
        CREATE POLICY admin_users_policy ON public.users 
          FOR ALL 
          TO authenticated 
          USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
        
        -- Create policy for users (can only see themselves)
        CREATE POLICY users_self_policy ON public.users 
          FOR SELECT 
          TO authenticated 
          USING (id = auth.uid());
      `)
      console.log('Created new RLS policies')
    } catch (policyError) {
      console.error('Error creating policies:', policyError)
    }
    
    // 3. Add the admin to the users table
    console.log('Adding admin to users table...')
    
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
      console.error('Error adding admin to users table:', upsertError)
    } else {
      console.log('Admin added to users table successfully')
    }
    
    console.log('\nSetup complete!')
    console.log('---------------------')
    console.log(`Admin email: ${adminEmail}`)
    console.log(`Admin password: ${adminPassword}`)
    console.log('---------------------')
    console.log('Please sign out and sign back in with these credentials')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixAdminAccess()