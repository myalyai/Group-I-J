'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Loading from '@/components/Loading'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import UserSidebar from '@/components/UserSidebar'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/user/login')
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <Loading/>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Mobile Sidebar Toggle */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <UserSidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
            <div className="h-full bg-gray-900 border-r border-gray-800 shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">User Dashboard</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <UserSidebar />
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}