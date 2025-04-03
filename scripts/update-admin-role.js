const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateAdminRole() {
  try {
    // Get all users
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    
    // Find the admin user (assuming it's the one with email admin@admin.com)
    const adminUser = data.users.find(user => user.email === 'admin@admin.com')
    
    if (!adminUser) {
      console.error('Admin user not found')
      return
    }
    
    console.log('Found admin user:', adminUser.email)
    
    // Update the admin user's role metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { user_metadata: { role: 'admin' } }
    )
    
    if (updateError) {
      console.error('Error updating admin role:', updateError)
      return
    }
    
    console.log('Admin role updated successfully')
    
    // Also update the users table
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
      console.error('Error upserting admin in users table:', upsertError)
      return
    }
    
    console.log('Admin user added to users table')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

updateAdminRole()