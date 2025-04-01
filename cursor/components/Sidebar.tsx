'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  Settings,
  BarChart2,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Prompt Management', href: '/dashboard/prompts', icon: MessageSquareText },
  { name: 'User Management', href: '/dashboard/users', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen flex flex-col shadow-xl relative overflow-hidden fixed left-0">
      <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-10"></div>
      <div className="relative z-10 h-full flex flex-col">
        <div className="p-6 border-b border-gray-800/50">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">
            Admin Dashboard
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-900/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-white' : 'text-purple-300'
                  }`}
                  size={20}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
          >
            <LogOut
              className="mr-3 h-5 w-5 text-purple-300"
              size={20}
              aria-hidden="true"
            />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}