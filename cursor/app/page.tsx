'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Platform } from '@/types/platform'
import type { Category } from '@/types/category'
import type { Prompt } from '@/types/prompt'
import { webhookConfig } from '@/config/webhook'

export default function LandingPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [productDescription, setProductDescription] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch platforms
        const { data: platformsData, error: platformsError } = await supabase
          .from('platforms')
          .select('*')
          .order('id')

        if (platformsError) throw platformsError

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('id')

        if (categoriesError) throw categoriesError

        // Fetch active prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .eq('is_active', true)

        if (promptsError) throw promptsError

        setPlatforms(platformsData)
        setCategories(categoriesData)
        setPrompts(promptsData)
        
        if (platformsData.length > 0) {
          setSelectedPlatform(platformsData[0])
        }
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate a unique session ID
  function generateSessionId() {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `session_${timestamp}_${randomStr}`
  }

  async function handleGenerate() {
    if (!selectedPlatform || !selectedCategory || !productDescription.trim()) return

    try {
      setGenerating(true)
      setError(null)
      setResult(null)

      // Find the active prompt for current platform and category
      const activePrompt = prompts.find(
        p => p.platform_id === selectedPlatform.id && 
             p.category_id === selectedCategory.id
      )

      if (!activePrompt) {
        throw new Error('No active prompt found for this platform and category')
      }

      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${webhookConfig.username}:${webhookConfig.password}`)
        },
        body: JSON.stringify({
          prompt_id: activePrompt.id,
          product_description: productDescription.trim(),
          session_id: generateSessionId()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data.output)
    } catch (err) {
      console.error('Error generating keywords:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate keywords')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">3D Print Listing Optimizer</h1>
            <p className="text-gray-400">Generate optimized keywords for your 3D print product listings</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Select Platform
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedPlatform?.id || ''}
                onChange={(e) => {
                  const platform = platforms.find(p => p.id === Number(e.target.value))
                  if (platform) {
                    setSelectedPlatform(platform)
                    setSelectedCategory(null)
                  }
                }}
              >
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlatform && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Select Category
                </label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={selectedCategory?.id || ''}
                  onChange={(e) => {
                    const category = categories.find(c => c.id === Number(e.target.value))
                    if (category) {
                      setSelectedCategory(category)
                    }
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Product Description
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your product description..."
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !selectedPlatform || !selectedCategory || !productDescription.trim()}
              className={`w-full px-4 py-3 text-sm font-medium text-white rounded-md flex items-center justify-center space-x-2 ${
                generating || !selectedPlatform || !selectedCategory || !productDescription.trim()
                  ? 'bg-purple-700 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                'Generate Keywords'
              )}
            </button>

            {result && (
              <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Generated  {selectedCategory?.name}:
                </h3>
                <pre className="text-sm text-white whitespace-pre-wrap">
                  {result}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 