'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function UserRegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const router = useRouter()

  // Password requirements state
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSpecial: false,
  })

  // Check password requirements
  useEffect(() => {
    setRequirements({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Check password requirements
    const allRequirementsMet = Object.values(requirements).every(req => req)
    if (!allRequirementsMet) {
      setError('Please meet all password requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await signUp(email, password)
      setError('Please check your email to verify your account') // Success message
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Failed to create account')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            User Registration
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full mt-3 px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Password"
              />
              <div className="mt-2 space-y-2 text-sm">
                {Object.entries(requirements).map(([key, met]) => (
                  <div
                    key={key}
                    className={`flex items-center ${
                      met ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {met ? (
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    {key === 'minLength' && 'At least 8 characters'}
                    {key === 'hasNumber' && 'Contains a number'}
                    {key === 'hasUppercase' && 'Contains uppercase letter'}
                    {key === 'hasLowercase' && 'Contains lowercase letter'}
                    {key === 'hasSpecial' && 'Contains special character'}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full mt-3 px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}