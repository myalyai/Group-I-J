'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import UserSidebar from '@/components/UserSidebar'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/user/login')
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-900">
      <UserSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}