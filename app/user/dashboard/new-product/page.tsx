'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Platform } from '@/types/platform'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

type Tooltip = {
  title: string
  content: string
}

const tooltips: { [key: string]: Tooltip } = {
  description: {
    title: 'Product Description',
    content: 'Provide a detailed description of your 3D print product. Include key features, dimensions, and use cases.'
  },
  stlUrl: {
    title: 'STL File URL',
    content: 'Enter the URL to your STL file. Make sure the file is accessible and properly formatted.'
  },
  platform: {
    title: 'Platform Selection',
    content: 'Choose the marketplace where you want to list your product. Each platform has its own optimization rules.'
  }
}

// Add this import at the top with your other imports
import { useAuth } from '@/contexts/AuthContext'

export default function NewProductPage() {
  const { user } = useAuth()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [description, setDescription] = useState('')
  const [stlUrl, setStlUrl] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlatforms() {
      try {
        const { data, error } = await supabase
          .from('platforms')
          .select('*')
          .order('id')

        if (error) throw error
        setPlatforms(data || [])
      } catch (err) {
        console.error('Error fetching platforms:', err)
        setError('Failed to load platforms')
      } finally {
        setLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Changed from (!description && !stlUrl) to ensure at least one is provided
    if (!selectedPlatform || (description.trim() === '' && stlUrl.trim() === '')) return

    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to submit a product')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('product_submissions')
        .insert([
          {
            description: description.trim() || null, // Use null if empty
            stl_url: stlUrl.trim() || null, // Use null if empty
            platform_id: selectedPlatform.id,
            status: 'pending',
            user_id: user.id // Add the user ID here
          }
        ])

      if (error) throw error

      // Reset form
      setDescription('')
      setStlUrl('')
      setSelectedPlatform(null)
      setIsDropdownOpen(false)
      
      // Show success message
      alert('Product submitted successfully!')

    } catch (err) {
      console.error('Error submitting product:', err)
      setError('Failed to submit product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-3 py-8">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-xl p-8 border border-gray-700/50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">
            Create New Product
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Fill in the details below to submit your 3D print product
          </p>
          <p className="text-purple-400 text-xs mt-1">
            Note: You must provide either a product description or an STL file URL.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="platform" className="text-base font-medium text-gray-200">
                Platform
              </label>
              <QuestionMarkCircleIcon
                className="h-5 w-5 text-purple-400 hover:text-purple-300 transition-colors cursor-help"
                onMouseEnter={() => setActiveTooltip('platform')}
                onMouseLeave={() => setActiveTooltip(null)}
              />
            </div>
            {activeTooltip === 'platform' && (
              <div className="absolute z-10 w-72 px-4 py-3 text-sm bg-gray-700 rounded-xl shadow-xl -right-2 top-10 border border-purple-500/20">
                <p className="font-medium text-white">{tooltips.platform.title}</p>
                <p className="text-gray-300 mt-1">{tooltips.platform.content}</p>
              </div>
            )}
            <div className="relative">
              <div 
                className="mt-1 block w-full rounded-xl px-4 py-3 bg-gray-800 border-2 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200 hover:border-purple-500/50 cursor-pointer flex justify-between items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedPlatform ? selectedPlatform.name : 'Select a platform'}</span>
                <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-xl bg-gray-800 border-2 border-gray-600 shadow-lg max-h-60 overflow-auto">
                  <div 
                    className="px-4 py-3 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-500 hover:text-white cursor-pointer"
                    onClick={() => {
                      setSelectedPlatform(null);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Select a platform
                  </div>
                  {platforms.map((platform) => (
                    <div 
                      key={platform.id}
                      className="px-4 py-3 text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-500 hover:text-white cursor-pointer"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {platform.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <style jsx global>{`
              select {
                background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23A855F7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
                background-position: right 0.5rem center;
                background-repeat: no-repeat;
                background-size: 1.5em 1.5em;
                padding-right: 2.5rem;
              }
              select option {
                background-color: #1F2937;
                color: white;
                padding: 1rem;
              }
              select option:hover,
              select option:focus,
              select option:active {
                background: linear-gradient(to right, #9333EA, #A855F7) !important;
                background-color: #9333EA !important;
                color: white !important;
              }
              select:focus option:checked {
                background: linear-gradient(to right, #9333EA, #A855F7) !important;
                color: white !important;
              }
              select option:checked {
                background: linear-gradient(to right, #9333EA, #A855F7) !important;
                color: white !important;
              }
            `}</style>
          </div>

          {/* Description textarea - increase rows from 3 to 4 */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-200">
                Product Description
              </label>
              <QuestionMarkCircleIcon
                className="h-4 w-4 text-purple-400 hover:text-purple-300 transition-colors cursor-help"
                onMouseEnter={() => setActiveTooltip('description')}
                onMouseLeave={() => setActiveTooltip(null)}
              />
            </div>
            {activeTooltip === 'description' && (
              <div className="absolute z-10 w-72 px-4 py-3 text-sm bg-gray-700 rounded-xl shadow-xl -right-2 top-10 border border-purple-500/20">
                <p className="font-medium text-white">{tooltips.description.title}</p>
                <p className="text-gray-300 mt-1">{tooltips.description.content}</p>
              </div>
            )}
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg px-3 py-3 bg-gray-700/50 border-2 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200 resize-none text-sm"
              placeholder="Enter your product description"
            />
          </div>

          {/* STL URL input - with slightly more padding */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="stlUrl" className="text-sm font-medium text-gray-200">
                STL File URL
              </label>
              <QuestionMarkCircleIcon
                className="h-4 w-4 text-purple-400 hover:text-purple-300 transition-colors cursor-help"
                onMouseEnter={() => setActiveTooltip('stlUrl')}
                onMouseLeave={() => setActiveTooltip(null)}
              />
            </div>
            {activeTooltip === 'stlUrl' && (
              <div className="absolute z-10 w-72 px-4 py-3 text-sm bg-gray-700 rounded-xl shadow-xl -right-2 top-10 border border-purple-500/20">
                <p className="font-medium text-white">{tooltips.stlUrl.title}</p>
                <p className="text-gray-300 mt-1">{tooltips.stlUrl.content}</p>
              </div>
            )}
            <input
              type="url"
              id="stlUrl"
              value={stlUrl}
              onChange={(e) => setStlUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg px-3 py-3 bg-gray-700/50 border-2 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200 text-sm"
              placeholder="https://example.com/your-stl-file.stl"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Submit button - slightly larger */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={submitting || !selectedPlatform || (description.trim() === '' && stlUrl.trim() === '')}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md shadow-purple-500/20 text-sm"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}