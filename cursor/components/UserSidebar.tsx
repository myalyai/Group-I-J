'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  PlusCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react';

// Add type definitions at the top of the file after imports
type SubItem = {
  name: string;
  href: string;
}

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubItem[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/user/dashboard', icon: HomeIcon },
  { name: 'My Listings', href: '/user/dashboard/listings', icon: DocumentTextIcon },
  {
    name: 'New Product',
    href: '#',
    icon: PlusCircleIcon,
    subItems: [
      { name: 'Create New Product', href: '/user/dashboard/new-product' },
      { name: 'Upload STL', href: '/user/dashboard/upload-stl' }
    ]
  },
  { name: 'Profile', href: '/user/dashboard/profile', icon: UserIcon },
  { name: 'History', href: '/user/dashboard/history', icon: ClockIcon },
]

export default function UserSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut()
      // Explicitly redirect to user login page after logout
      router.push('/user/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen flex flex-col shadow-xl relative overflow-hidden fixed left-0">
      <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-10"></div>
      <div className="relative z-10 h-full flex flex-col">
        <div className="p-6 border-b border-gray-800/50">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">
            User Dashboard
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedItem === item.name;
            const hasSubItems = 'subItems' in item && item.subItems !== undefined;
            const isSubItemActive = hasSubItems && item.subItems?.some(subItem => pathname === subItem.href);

            return (
              <div key={item.name}>
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      setExpandedItem(isExpanded ? null : item.name);
                    } else {
                      router.push(item.href);
                    }
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive || isSubItemActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-900/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive || isSubItemActive ? 'text-white' : 'text-purple-300'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </button>
                
                {hasSubItems && isExpanded && item.subItems && (
                  <div className="ml-9 mt-2 space-y-2">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                          pathname === subItem.href
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
          >
            <ArrowLeftOnRectangleIcon
              className="mr-3 h-5 w-5 text-purple-300"
              aria-hidden="true"
            />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}