'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/Loading'
<<<<<<< HEAD
import KeywordsResult from '@/components/KeywordsResult'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/user/login')
      }
    }
    checkAuth()
  }, [router])
=======

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
>>>>>>> be5b459 (By Default Login Page Opens)

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/user/dashboard')
      } else {
        router.push('/user/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return <Loading />
  }

  // This return will briefly show while redirecting
  return null
}