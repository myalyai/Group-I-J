const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createAdminUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@admin.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })

    if (error) {
      console.error('Error creating admin user:', error.message)
      return
    }

    console.log('Admin user created successfully:', data)

    // Set custom claims for the admin user
    const { error: claimsError } = await supabase.rpc('set_claim', {
      uid: data.user.id,
      claim: 'role',
      value: 'admin'
    })

    if (claimsError) {
      console.error('Error setting admin claims:', claimsError.message)
      return
    }

    console.log('Admin claims set successfully')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser() 