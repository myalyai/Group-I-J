'use client'

import UserSidebar from '@/components/UserSidebar'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/Loading'
import { useState, useEffect } from 'react'

export default function ModelDescriptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (loading) {
    return <Loading />
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <UserSidebar />
      <div className="flex-1 ml-8">
        {children}
      </div>
    </div>
  )
}