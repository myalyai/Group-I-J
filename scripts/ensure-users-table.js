const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function ensureUsersTable() {
  try {
    console.log('Ensuring users table exists...')
    
    // Create the users table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_users_table_if_not_exists')
    
    if (createError) {
      console.error('Error calling RPC function:', createError)
      
      // If the RPC function doesn't exist, create the table directly
      console.log('Creating users table directly...')
      
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            last_sign_in_at TIMESTAMP WITH TIME ZONE,
            status TEXT DEFAULT 'active'
          );
          
          -- Enable RLS but we won't rely on it
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        `
      })
      
      if (sqlError) {
        console.error('Error creating users table:', sqlError)
        
        // Last resort: try to create a simple record to force table creation
        console.log('Attempting to create users table by insertion...')
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'system@example.com',
            role: 'system'
          })
        
        if (insertError && insertError.code === '42P01') {
          console.error('Failed to create users table:', insertError)
          return
        }
      }
    }
    
    // Add the admin user to the users table
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return
    }
    
    const adminUser = userData.users.find(user => 
      user.email === 'admin@example.com' || 
      (user.user_metadata && user.user_metadata.role === 'admin')
    )
    
    if (!adminUser) {
      console.error('No admin user found!')
      return
    }
    
    console.log('Found admin user:', adminUser.email)
    
    // Add the admin to the users table
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
    
    console.log('Users table setup complete!')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

ensureUsersTable()