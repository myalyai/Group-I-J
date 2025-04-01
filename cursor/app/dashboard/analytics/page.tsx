'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  SparklesIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CommandLineIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('week');

  // Example data - in a real app, this would come from your API/database
  const stats = [
    {
      title: "Total Generations",
      value: "12,543",
      change: "+14%",
      trend: "up",
      icon: SparklesIcon
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+7%",
      trend: "up",
      icon: UserGroupIcon
    },
    {
      title: "Avg. Generation Time",
      value: "2.3s",
      change: "-0.5s",
      trend: "down",
      icon: ClockIcon
    },
    {
      title: "API Usage",
      value: "89%",
      change: "+2%",
      trend: "up",
      icon: CpuChipIcon
    }
  ];

  const categories = [
    { name: "Keywords", count: 5234, percentage: 45 },
    { name: "Product Listings", count: 3421, percentage: 30 },
    { name: "Descriptions", count: 2888, percentage: 25 }
  ];

  // Quick Actions section with working buttons
  const quickActions = [
    { 
      name: "View Reports", 
      icon: ChartBarIcon,
      action: () => router.push('/dashboard/reports')
    },
    { 
      name: "Manage Prompts", 
      icon: CommandLineIcon,
      action: () => router.push('/dashboard/prompts')
    },
    { 
      name: "Export Data", 
      icon: DocumentTextIcon,
      action: () => router.push('/dashboard/export')
    },
    { 
      name: "Performance Metrics", 
      icon: ArrowTrendingUpIcon,
      action: () => router.push('/dashboard/performance')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 text-gray-200 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <stat.icon className="w-6 h-6 text-purple-400" />
                <span className={`text-sm px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-gray-400 text-sm">{stat.title}</h3>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Categories */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Generation Categories</h2>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{category.name}</span>
                    <span className="text-gray-400">{category.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Updated Quick Actions Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 group"
                >
                  <action.icon className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {action.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 