'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/Loading'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

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