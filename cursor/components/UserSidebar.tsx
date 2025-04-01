'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/user/dashboard', icon: HomeIcon },
  { name: 'My Listings', href: '/user/dashboard/listings', icon: DocumentTextIcon },
  { name: 'Profile', href: '/user/dashboard/profile', icon: UserIcon },
]

export default function UserSidebar() {
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
    <div className="flex flex-col h-full bg-gray-900 w-64 px-4 py-8">
      <div className="flex items-center mb-8">
        <h1 className="text-xl font-bold text-white">User Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ArrowLeftOnRectangleIcon
            className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-white"
            aria-hidden="true"
          />
          Logout
        </button>
      </div>
    </div>
  )
}