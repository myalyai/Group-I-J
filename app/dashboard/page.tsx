'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Welcome to Admin Dashboard</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold text-white mb-4">
            Welcome back, {user?.email}
          </h2>
          <p className="text-gray-300 mb-6">
            This is your admin dashboard where you can manage prompts, users, and settings.
            Use the sidebar navigation to access different sections of the dashboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Manage AI prompts</li>
                <li>• View user statistics</li>
                <li>• Configure system settings</li>
              </ul>
            </div>
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Getting Started</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Create and edit prompts in Prompt Management</li>
                <li>• Manage users and permissions in User Management</li>
                <li>• Configure your preferences in Settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 