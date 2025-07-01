"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  sessionId: string | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for login page
      if (pathname === '/login') {
        setLoading(false)
        return
      }

      try {
        // Check session storage for required authentication data
        const storedAdmin = sessionStorage.getItem('admin')

        if (storedAdmin) {
          // Validate admin status (should be 'true' string)
          const adminStatus = storedAdmin === 'true'
          
          setIsAdmin(adminStatus)
          setIsAuthenticated(true)
        } else {
          // Missing required authentication data, redirect to login
          setIsAuthenticated(false)
          setIsAdmin(false)
          setSessionId(null)
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // On error, treat as unauthenticated
        setIsAuthenticated(false)
        setIsAdmin(false)
        setSessionId(null)
        router.push('/login')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  const logout = () => {
    sessionStorage.removeItem('admin')
    
    // Reset state
    setIsAuthenticated(false)
    setIsAdmin(false)
    setSessionId(null)
    
    // Redirect to login
    router.push('/login')
  }

  const contextValue: AuthContextType = {
    isAuthenticated,
    isAdmin,
    sessionId,
    loading,
    logout
  }

  // Show loading screen while checking authentication (except on login page)
  if (loading && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mx-auto w-fit">
            <svg className="h-8 w-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ChainGate</h1>
            <p className="text-gray-600 text-sm">Verifying authentication...</p>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}