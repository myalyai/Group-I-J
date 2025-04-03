const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupUsersTable() {
  try {
    console.log('Setting up users table...')
    
    // Try to directly create the table instead of checking if it exists first
    console.log('Creating users table...')
    
    // Try to check if the table exists first
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)')
        .limit(1)
      
      if (error && error.code === '42P01') {
        // Table doesn't exist, let's create it manually
        console.log('Users table does not exist, creating it manually...')
        
        // Create the table using SQL query
        const { error: sqlError } = await supabase.sql(`
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
          
          -- Create policy for admins (can see all users)
          DROP POLICY IF EXISTS admin_users_policy ON public.users;
          CREATE POLICY admin_users_policy ON public.users 
            FOR ALL 
            TO authenticated 
            USING (auth.jwt() ->> 'role' = 'admin');
          
          -- Create policy for users (can only see themselves)
          DROP POLICY IF EXISTS users_self_policy ON public.users;
          CREATE POLICY users_self_policy ON public.users 
            FOR SELECT 
            TO authenticated 
            USING (id = auth.uid());
        `)
        
        if (sqlError) {
          console.error('Error creating users table with SQL:', sqlError)
          
          // Try an alternative approach - create the table first without policies
          console.log('Trying alternative approach...')
          
          // Create the table first
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
          
          // Then enable RLS and create policies
          await supabase.sql(`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`)
          
          // Create admin policy
          await supabase.sql(`
            DROP POLICY IF EXISTS admin_users_policy ON public.users;
            CREATE POLICY admin_users_policy ON public.users 
              FOR ALL 
              TO authenticated 
              USING (auth.jwt() ->> 'role' = 'admin');
          `)
          
          // Create user policy
          await supabase.sql(`
            DROP POLICY IF EXISTS users_self_policy ON public.users;
            CREATE POLICY users_self_policy ON public.users 
              FOR SELECT 
              TO authenticated 
              USING (id = auth.uid());
          `)
        }
      } else if (error) {
        console.error('Error checking users table:', error)
      } else {
        console.log('Users table already exists')
      }
    } catch (tableError) {
      console.error('Error checking/creating table:', tableError)
    }
    
    // Sync auth users to the public users table
    console.log('Syncing auth users to public users table...')
    
    // Get all users from auth.users
    const { data, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return
    }
    
    const authUsers = data.users
    console.log(`Found ${authUsers.length} users in auth`)
    
    // For each auth user, insert or update the corresponding record in public.users
    for (const authUser of authUsers) {
      try {
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: authUser.id,
            email: authUser.email,
            role: authUser.user_metadata?.role || 'user',
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at || null,
            status: authUser.confirmed_at ? 'active' : 'pending'
          })
        
        if (upsertError) {
          console.error(`Error upserting user ${authUser.email}:`, upsertError)
        } else {
          console.log(`Synced user: ${authUser.email}`)
        }
      } catch (upsertError) {
        console.error(`Error processing user ${authUser.email}:`, upsertError)
      }
    }
    
    console.log('Users table setup complete!')
  } catch (error) {
    console.error('Error setting up users table:', error)
  }
}

setupUsersTable()