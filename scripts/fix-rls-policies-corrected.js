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
      user.email === 'admin@example.com' || 
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
    
    // 3. Make sure the admin user is in the users table
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
      console.error('Error upserting admin user:', upsertError)
    }
    
    // 4. Update RLS policies through the Supabase dashboard instead
    console.log('\nRLS policy fix partially complete!')
    console.log('---------------------')
    console.log('IMPORTANT: You need to manually update the RLS policies in the Supabase dashboard:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to Authentication > Policies')
    console.log('3. Find the "users" table')
    console.log('4. Create a policy for admins with this USING expression:')
    console.log('   (auth.jwt() -> \'user_metadata\' ->> \'role\')::text = \'admin\'')
    console.log('5. Create a policy for users with this USING expression:')
    console.log('   id = auth.uid()')
    console.log('---------------------')
    console.log('Please sign out and sign back in with your admin account')
    console.log('---------------------')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixRlsPolicies()