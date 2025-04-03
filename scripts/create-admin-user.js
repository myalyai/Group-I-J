const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Create a new admin user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: { role: 'admin' }
    })
    
    if (createError) {
      console.error('Error creating admin user:', createError)
      
      // If the user already exists, try to update their role
      if (createError.message.includes('already exists')) {
        console.log('Admin user already exists, updating role...')
        
        // Get all users to find the admin
        const { data, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) {
          console.error('Error listing users:', listError)
          return
        }
        
        const adminUser = data.users.find(user => user.email === 'admin@example.com')
        
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
        
        // Add the admin to the users table
        await addAdminToUsersTable(adminUser)
      }
      return
    }
    
    console.log('Admin user created successfully:', userData.user.email)
    
    // Add the admin to the users table
    await addAdminToUsersTable(userData.user)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

async function addAdminToUsersTable(adminUser) {
  try {
    // First, check if the users table exists
    try {
      const { error: checkError } = await supabase
        .from('users')
        .select('count(*)')
        .limit(1)
      
      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist, create it
        console.log('Creating users table...')
        
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
        
        // Create RLS policies
        await supabase.sql(`
          -- Create policy for admins (can see all users)
          CREATE POLICY admin_users_policy ON public.users 
            FOR ALL 
            TO authenticated 
            USING (auth.jwt() ->> 'role' = 'admin');
          
          -- Create policy for users (can only see themselves)
          CREATE POLICY users_self_policy ON public.users 
            FOR SELECT 
            TO authenticated 
            USING (id = auth.uid());
        `)
      }
    } catch (tableError) {
      console.error('Error checking/creating users table:', tableError)
    }
    
    // Add the admin to the users table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        created_at: adminUser.created_at,
        last_sign_in_at: adminUser.last_sign_in_at || null,
        status: 'active'
      })
    
    if (upsertError) {
      console.error('Error adding admin to users table:', upsertError)
      return
    }
    
    console.log('Admin added to users table successfully')
  } catch (error) {
    console.error('Error adding admin to users table:', error)
  }
}

createAdminUser()