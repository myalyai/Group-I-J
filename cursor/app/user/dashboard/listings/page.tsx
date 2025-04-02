'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Loading from '@/components/Loading'

export default function ListingsPage() {
  const { user } = useAuth()
  
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchUserSubmissions() {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('product_submissions')
          .select('*, platform:platforms(*)')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setSubmissions(data || [])
      } catch (err: any) {
        console.error('Error fetching submissions:', err)
        setError(err.message || 'Failed to load your submissions')
      } finally {
        setLoading(false)
      }
    }

    fetchUserSubmissions()
  }, [user])

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-400">Please log in to view your listings</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">
          My Product Listings
        </h1>
        <p className="text-gray-400 mt-1">
          View and manage all your product submissions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : submissions.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-gray-400">You haven't submitted any products yet.</p>
          <a 
            href="/user/dashboard/new-product" 
            className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Submit a New Product
          </a>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Platform</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">STL URL</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">
                      {submission.platform?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="max-w-xs overflow-hidden text-ellipsis">
                        {submission.description ? 
                          (submission.description.length > 100 ? 
                            `${submission.description.substring(0, 100)}...` : 
                            submission.description) : 
                          'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {submission.stl_url ? (
                        <a 
                          href={submission.stl_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 truncate block max-w-xs"
                        >
                          {new URL(submission.stl_url).hostname}
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${submission.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 
                          submission.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                          submission.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                          'bg-gray-500/10 text-gray-400'}`
                      }>
                        {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(submission.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}