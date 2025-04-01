'use client'

import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { supabase } from '@/lib/supabase'
import type { Platform } from '@/types/platform'
import type { Category } from '@/types/category'
import type { Prompt } from '@/types/prompt'
import type { Model } from '@/types/model'
import { webhookConfig } from '@/config/webhook'
import Loading from '@/components/Loading'
import TestResult from '@/components/TestResult'

export default function PromptsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [temperature, setTemperature] = useState('0.7')
  const [maxTokens, setMaxTokens] = useState('4096')
  const [prompt, setPrompt] = useState('')
  const [currentVersion, setCurrentVersion] = useState(1.0)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testProductDescription, setTestProductDescription] = useState('')

  // Get all versions for current platform and category
  const currentVersions = prompts
    .filter(p => p.platform_id === selectedPlatform?.id && p.category_id === selectedCategory?.id)
    .sort((a, b) => b.version - a.version)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch platforms
        const { data: platformsData, error: platformsError } = await supabase
          .from('platforms')
          .select('*')
          .order('id')

        if (platformsError) {
          throw platformsError
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('id')

        if (categoriesError) {
          throw categoriesError
        }

        // Fetch models
        const { data: modelsData, error: modelsError } = await supabase
          .from('models')
          .select('*')
          .order('id')

        if (modelsError) {
          throw modelsError
        }

        // Fetch prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('*')

        if (promptsError) {
          throw promptsError
        }

        setPlatforms(platformsData)
        setCategories(categoriesData)
        setModels(modelsData)
        setPrompts(promptsData)

        if (platformsData.length > 0) {
          setSelectedPlatform(platformsData[0])
        }
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0])
        }
        if (modelsData.length > 0) {
          setSelectedModel(modelsData[0])
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

  // Update form when platform or category changes
  useEffect(() => {
    if (selectedPlatform && selectedCategory) {
      const currentPrompt = prompts.find(
        p => p.platform_id === selectedPlatform.id &&
          p.category_id === selectedCategory.id &&
          p.is_active
      )

      if (currentPrompt) {
        setPrompt(currentPrompt.prompt_text)
        setTemperature(currentPrompt.temperature.toString())
        setMaxTokens(currentPrompt.max_tokens.toString())
        setCurrentVersion(currentPrompt.version)
        const promptModel = models.find(m => m.id === currentPrompt.model_id)
        if (promptModel) {
          setSelectedModel(promptModel)
        }
      } else {
        // Reset form if no active prompt exists for this combination
        setPrompt('')
        setTemperature('0.7')
        setMaxTokens('4096')
        setCurrentVersion(1.0)
        if (models.length > 0) {
          setSelectedModel(models[0])
        }
      }
      // Clear test result when changing platform or category
      setTestResult(null)
    }
  }, [selectedPlatform, selectedCategory, prompts, models])

  // Handle version change
  const handleVersionChange = (version: number) => {
    const selectedPrompt = prompts.find(
      p => p.platform_id === selectedPlatform?.id &&
        p.category_id === selectedCategory?.id &&
        p.version === version
    )

    if (selectedPrompt) {
      setPrompt(selectedPrompt.prompt_text)
      setTemperature(selectedPrompt.temperature.toString())
      setMaxTokens(selectedPrompt.max_tokens.toString())
      setCurrentVersion(selectedPrompt.version)
      const promptModel = models.find(m => m.id === selectedPrompt.model_id)
      if (promptModel) {
        setSelectedModel(promptModel)
      }
    }
  }

  async function handleSave() {
    if (!selectedPlatform || !selectedCategory || !selectedModel) return

    // Validate that prompt contains the required placeholder
    if (!prompt.includes('{{product_description}}')) {
      setError('Prompt must include {{product_description}} placeholder')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // First, set all existing prompts for this platform and category to inactive
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ is_active: false })
        .match({
          platform_id: selectedPlatform.id,
          category_id: selectedCategory.id
        })

      if (updateError) throw updateError

      // Find the highest version for this platform and category
      const existingPrompts = prompts.filter(
        p => p.platform_id === selectedPlatform.id &&
          p.category_id === selectedCategory.id
      )

      const highestVersion = existingPrompts.length > 0
        ? Math.max(...existingPrompts.map(p => p.version))
        : 0

      const newVersion = Number((highestVersion + 0.1).toFixed(1))
      const promptData = {
        platform_id: selectedPlatform.id,
        category_id: selectedCategory.id,
        version: newVersion,
        prompt_text: prompt,
        temperature: parseFloat(temperature),
        max_tokens: parseInt(maxTokens, 10),
        is_active: true,
        model_id: selectedModel.id
      }

      const { error: upsertError } = await supabase
        .from('prompts')
        .upsert(promptData)

      if (upsertError) throw upsertError

      // Refresh prompts after save
      const { data: newPrompts, error: fetchError } = await supabase
        .from('prompts')
        .select('*')

      if (fetchError) throw fetchError

      setPrompts(newPrompts)
      setCurrentVersion(newVersion)
    } catch (err) {
      console.error('Error saving prompt:', err)
      setError('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  // Generate a unique session ID
  function generateSessionId() {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `session_${timestamp}_${randomStr}`
  }

  async function handleTest() {
    if (!selectedPlatform || !selectedCategory || !selectedModel) return

    try {
      setTesting(true)
      setError(null)
      setTestResult(null)

      // Find the active prompt for current platform and category
      const activePrompt = prompts.find(
        p => p.platform_id === selectedPlatform.id &&
          p.category_id === selectedCategory.id &&
          p.is_active
      )

      if (!activePrompt) {
        throw new Error('No active prompt found for this platform and category')
      }

      console.log('Sending test request with:', {
        id: activePrompt.id,
        product_description: testProductDescription
      })

      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${webhookConfig.username}:${webhookConfig.password}`)
        },
        body: JSON.stringify({
          prompt_id: activePrompt.id,
          product_description: testProductDescription.trim(),
          session_id: generateSessionId()
        })
      })

      const data = await response.json()
      console.log('Response:', data)

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.output) {
        throw new Error('No output received from the webhook')
      }
      console.log(data)
      setTestResult(data.output)
    } catch (err) {
      console.error('Error testing prompt:', err)
      setError(err instanceof Error ? err.message : 'Failed to test prompt')
      setTestResult(null)
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <Loading/>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Prompt Management</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <Tab.Group
          selectedIndex={platforms.findIndex(p => p.id === selectedPlatform?.id)}
          onChange={index => setSelectedPlatform(platforms[index])}
        >
          <Tab.List className="flex space-x-2 mb-6">
            {platforms.map((platform) => (
              <Tab
                key={platform.id}
                className={({ selected }: { selected: boolean }) =>
                  `px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${selected
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`
                }
              >
                {platform.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {platforms.map((platform) => (
              <Tab.Panel key={platform.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 text-sm font-medium rounded-md ${selectedCategory?.id === category.id
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Version:</span>
                      <select
                        value={currentVersion}
                        onChange={(e) => handleVersionChange(Number(e.target.value))}
                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {currentVersions.map((p) => (
                          <option key={p.version} value={p.version}>
                            {p.version.toFixed(1)} {p.is_active ? '(Active)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="relative">
                      <textarea
                        className="w-full h-64 bg-gray-900 text-white resize-none focus:outline-none"
                        placeholder="Enter your prompt template here... (Must include {{product_description}})"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                      {!prompt.includes('{{product_description}}') && prompt.length > 0 && (
                        <div className="absolute bottom-2 right-2 text-red-500 text-sm">
                          Missing required placeholder: {'{{product_description}}'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Temperature
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        step="0.1"
                        min="0"
                        max="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(e.target.value)}
                        min="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Model
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={selectedModel?.id || ''}
                        onChange={(e) => {
                          const model = models.find(m => m.id === Number(e.target.value))
                          if (model) {
                            setSelectedModel(model)
                          }
                        }}
                      >
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Test Product Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Enter product description to test..."
                      value={testProductDescription}
                      onChange={(e) => setTestProductDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleTest}
                      disabled={testing || !prompt.includes('{{product_description}}') || !testProductDescription.trim()}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center space-x-2 ${testing || !prompt.includes('{{product_description}}') || !testProductDescription.trim()
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                    >
                      {testing ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Testing...</span>
                        </>
                      ) : (
                        'Test Prompt'
                      )}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !prompt.includes('{{product_description}}')}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center space-x-2 ${saving || !prompt.includes('{{product_description}}')
                          ? 'bg-purple-700 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>

                  {testResult && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                      <TestResult testResult={testResult} />
                    </div>
                  )}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
} 