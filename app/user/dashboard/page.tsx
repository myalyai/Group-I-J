'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function UserDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">User Dashboard</h1>
      <p className="text-gray-300">Welcome, {user?.email}</p>
    </div>
  )
}