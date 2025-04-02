'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

type ProductSubmission = {
  id: string
  created_at: string
  description: string | null
  stl_url: string | null
  status: string
  platform: {
    id: number
    name: string
  } | null
  response: any
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchSubmissions() {
      try {
        const { data, error } = await supabase
          .from('product_submissions')
          .select(`
            id,
            created_at,
            description,
            stl_url,
            status,
            response,
            platform:platform_id (id, name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setSubmissions(data || [])
      } catch (err) {
        console.error('Error fetching submissions:', err)
        setError('Failed to load submission history')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const toggleExpand = (id: string) => {
    if (expandedItem === id) {
      setExpandedItem(null)
    } else {
      setExpandedItem(id)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Submission History</h1>
        <p className="text-gray-400">View your past product submissions and their responses</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <ClockIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No submissions yet</h3>
          <p className="text-gray-400">
            You haven't submitted any products for optimization yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div 
              key={submission.id} 
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden"
            >
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/30 transition-colors"
                onClick={() => toggleExpand(submission.id)}
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="h-6 w-6 text-purple-400 mr-3" />
                  <div>
                    <h3 className="text-white font-medium">
                      {submission.description ? 
                        (submission.description.length > 50 ? 
                          `${submission.description.substring(0, 50)}...` : 
                          submission.description) : 
                        'STL File Submission'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="mr-3">{formatDate(submission.created_at)}</span>
                      <span className="mr-3">•</span>
                      <span className="mr-3">{submission.platform?.name || 'Unknown Platform'}</span>
                      <span className="mr-3">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        submission.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedItem === submission.id ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              
              {expandedItem === submission.id && (
                <div className="p-4 border-t border-gray-700/50 bg-gray-800/80">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                      <p className="text-white">{submission.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">STL URL</h4>
                      <p className="text-white break-all">
                        {submission.stl_url ? (
                          <a 
                            href={submission.stl_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 underline"
                          >
                            {submission.stl_url}
                          </a>
                        ) : (
                          'No STL URL provided'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Response</h4>
                    {submission.response ? (
                      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-gray-300 whitespace-pre-wrap">
                          {typeof submission.response === 'object' 
                            ? JSON.stringify(submission.response, null, 2) 
                            : submission.response}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No response data available yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}