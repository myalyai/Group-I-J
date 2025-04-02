'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Loading from '@/components/Loading'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type Platform = {
  id: number
  name: string
  created_at: string
}

export default function PlatformsPage() {
  const { user } = useAuth()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [platformName, setPlatformName] = useState('')
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    
    // Check if user is admin
    const userRole = user.user_metadata?.role
    setIsAdmin(userRole === 'admin')
    
    fetchPlatforms()
  }, [user])

  async function fetchPlatforms() {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('id')
      
      if (error) throw error
      
      setPlatforms(data || [])
    } catch (err: any) {
      console.error('Error fetching platforms:', err)
      setError(err.message || 'Failed to load platforms')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlatform = () => {
    setEditingPlatform(null)
    setPlatformName('')
    setIsModalOpen(true)
  }

  const handleEditPlatform = (platform: Platform) => {
    setEditingPlatform(platform)
    setPlatformName(platform.name)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!platformName.trim()) return
    
    setIsSubmitting(true)
    try {
      if (editingPlatform) {
        // Update existing platform
        const { error } = await supabase
          .from('platforms')
          .update({ name: platformName })
          .eq('id', editingPlatform.id)
        
        if (error) throw error
      } else {
        // Add new platform
        const { error } = await supabase
          .from('platforms')
          .insert([{ name: platformName }])
        
        if (error) throw error
      }
      
      // Refresh platforms list and close modal
      await fetchPlatforms()
      setIsModalOpen(false)
      setPlatformName('')
      setEditingPlatform(null)
    } catch (err: any) {
      console.error('Error saving platform:', err)
      setError(err.message || 'Failed to save platform')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlatform = async (id: number) => {
    try {
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Refresh platforms list and reset state
      await fetchPlatforms()
      setDeleteConfirmId(null)
    } catch (err: any) {
      console.error('Error deleting platform:', err)
      setError(err.message || 'Failed to delete platform')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-400">Please log in to view this page</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-400">You don't have permission to access this page</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">
            Platforms Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage all available platforms for product submissions
          </p>
        </div>
        
        <button
          onClick={handleAddPlatform}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Platform
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : platforms.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-gray-400">No platforms have been added yet.</p>
          <button
            onClick={handleAddPlatform}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Your First Platform
          </button>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created At</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {platforms.map((platform) => (
                  <tr key={platform.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300">{platform.id}</td>
                    <td className="px-6 py-4 text-sm text-white">{platform.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(platform.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      {deleteConfirmId === platform.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-red-400 text-xs">Confirm delete?</span>
                          <button
                            onClick={() => handleDeletePlatform(platform.id)}
                            disabled={isSubmitting}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditPlatform(platform)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(platform.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Platform Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPlatform ? 'Edit Platform' : 'Add New Platform'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="platformName" className="block text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  id="platformName"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter platform name"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}