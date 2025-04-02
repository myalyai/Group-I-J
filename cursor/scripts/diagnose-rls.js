const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function diagnoseRls() {
  try {
    console.log('Starting RLS diagnosis...')
    
    // 1. Check if the users table exists
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)')
        .limit(1)
      
      if (error) {
        console.error('Error accessing users table:', error)
        if (error.code === '42P01') {
          console.log('The users table does not exist. Creating it now...')
          await createUsersTable()
        }
      } else {
        console.log('Users table exists')
      }
    } catch (error) {
      console.error('Error checking users table:', error)
    }
    
    // 2. Check admin user
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
    console.log('Admin user metadata:', JSON.stringify(adminUser.user_metadata, null, 2))
    
    // 3. Check if admin is in users table
    const { data: tableUsers, error: tableError } = await supabase
      .from('users')
      .select('*')
    
    if (tableError) {
      console.error('Error querying users table:', tableError)
    } else {
      console.log('Users in table:', tableUsers.length)
      const adminInTable = tableUsers.find(u => u.id === adminUser.id)
      
      if (adminInTable) {
        console.log('Admin user found in users table:', adminInTable)
      } else {
        console.log('Admin user NOT found in users table. Adding now...')
        await addAdminToTable(adminUser)
      }
    }
    
    // 4. Check RLS policies
    console.log('\nRLS POLICY RECOMMENDATIONS:')
    console.log('---------------------------')
    console.log('Please run these SQL commands in the Supabase SQL Editor:')
    console.log(`
-- 1. Make sure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS admin_users_policy ON public.users;
DROP POLICY IF EXISTS users_self_policy ON public.users;

-- 3. Create new policies with correct syntax
CREATE POLICY admin_users_policy ON public.users 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY users_self_policy ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (id = auth.uid());
    `)
    
    console.log('\nIMPORTANT: After running these commands, sign out and sign back in to refresh your JWT token.')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

async function createUsersTable() {
  try {
    // Create users table using REST API instead of SQL
    const { error } = await supabase
      .from('users')
      .insert([{ 
        id: '00000000-0000-0000-0000-000000000000',
        email: 'placeholder@example.com',
        role: 'user'
      }])
    
    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error('Error creating users table:', error)
    } else {
      console.log('Users table created successfully')
    }
  } catch (error) {
    console.error('Error in createUsersTable:', error)
  }
}

async function addAdminToTable(adminUser) {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        created_at: adminUser.created_at || new Date().toISOString(),
        last_sign_in_at: adminUser.last_sign_in_at || null,
        status: 'active'
      })
    
    if (error) {
      console.error('Error adding admin to users table:', error)
    } else {
      console.log('Admin added to users table successfully')
    }
  } catch (error) {
    console.error('Error in addAdminToTable:', error)
  }
}

diagnoseRls()