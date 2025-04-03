'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/Loading'
import { UserIcon, EnvelopeIcon, CalendarIcon, ClockIcon, ShieldCheckIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Just a short delay to ensure user data is loaded
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [user])

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-400">Please log in to view your profile</p>
      </div>
    )
  }

  if (loading) {
    return <Loading />
  }

  // Get username from email (part before @)
  const username = user.email?.split('@')[0] || 'User'
  
  // Get role from user metadata
  const role = user.user_metadata?.role || 'user'
  
  // Get email verification status
  const emailVerified = user.user_metadata?.email_verified || false

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">
          My Profile
        </h1>
        <p className="text-gray-400 mt-1">
          View your account information
        </p>
      </div>

      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 p-6 sm:p-8 border-b border-gray-700/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-white">{username}</h2>
              <p className="text-gray-300">{user.email}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${emailVerified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`
                }>
                  {emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-300 font-medium">Role</h3>
            </div>
            <p className="text-xl text-white capitalize">{role}</p>
          </div>

          {/* Email */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <EnvelopeIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-300 font-medium">Email</h3>
            </div>
            <p className="text-xl text-white">{user.email || 'N/A'}</p>
          </div>

          {/* Account Created */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-300 font-medium">Account Created</h3>
            </div>
            <p className="text-sm text-white">{formatDate(user.created_at || '')}</p>
          </div>

          {/* Last Sign In */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <ClockIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-300 font-medium">Last Sign In</h3>
            </div>
            <p className="text-sm text-white">{formatDate(user.last_sign_in_at || '')}</p>
          </div>

          {/* Email Verification Status */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <CheckBadgeIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-300 font-medium">Email Verification</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${emailVerified ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <p className="text-sm text-white">{emailVerified ? 'Verified' : 'Not Verified'}</p>
            </div>
          </div>

          {/* User ID (for reference) */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <UserIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-300 font-medium">User ID</h3>
            </div>
            <p className="text-xs text-gray-400 break-all">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}