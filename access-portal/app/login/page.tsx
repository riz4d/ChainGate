"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Lock, Mail, Fingerprint, Wifi, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const router = useRouter()

  const fullText = "Do you really want to sign in?"

  useEffect(() => {
    if (!showLoginForm) {
      let currentIndex = 0
      const typewriterInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypewriterText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typewriterInterval)
        }
      }, 100)

      return () => clearInterval(typewriterInterval)
    }
  }, [showLoginForm])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  const handleShowLoginForm = async () => {
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    setShowLoginForm(true)
    setIsTransitioning(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password")
      }

      const response = await fetch(`${API_BASE_URL}/api/supervisor/access/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      sessionStorage.setItem('admin', JSON.stringify({
        id: data.admin_id,
        name: data.name,
        email: data.email
      }))
      
      console.log('Login successful:', {
        admin_id: data.admin_id,
        email: data.email,
        name: data.name
      })
      
      router.push("/")
      
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-exo bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg md:text-2xl  text-gray-900 font-russone">ChainGate Access Control</h1>
            <p className="text-gray-600 text-sm mt-1">Secure Authentication Portal</p>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Wifi className="h-3 w-3 mr-1" />
            System Online
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Blockchain Synced
          </Badge>
        </div>

        <div className="relative">
          {!showLoginForm && !isTransitioning ? (
            <div className="animate-in fade-in duration-500">
              <div className="transform transition-all duration-300">
                <div className="space-y-6 p-6 text-center">
                  <div className="space-y-6">
                    <div className="min-h-[2rem] flex items-center justify-center">
                      <h2 className="text-base font-medium font-exo text-gray-800 ">
                        {typewriterText}
                        <span className={`inline-block w-0.5 h-4 bg-blue-500 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
                      </h2>
                    </div>
                    
                    <div className={`transition-all duration-500 ${typewriterText === fullText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <Button
                        onClick={handleShowLoginForm}
                        disabled={isTransitioning || typewriterText !== fullText}
                        className="w-full max-w-40 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isTransitioning ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Loading...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-center">
                            <Shield className="h-4 w-4" />
                            Yes, Sign In
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isTransitioning ? (
            <div className="animate-in fade-in duration-300">
              <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 animate-pulse">Preparing secure login...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-500">
              <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowLoginForm(false)
                        setError("")
                        setEmail("")
                        setPassword("")
                      }}
                      className="h-8 w-8 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Sign In to Dashboard
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-center text-gray-600">
                    Enter your credentials to access the control panel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@chaingate.corp"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-gray-50/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-gray-50/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg transition-all duration-200"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-transparent transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="animate-in slide-in-from-top duration-300">
                        <Alert className="bg-red-50 border-red-200">
                          <AlertDescription className="text-red-700 text-sm">
                            {error}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Authenticating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Sign In
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Secured by authentication technology
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span>© 2025 ChainGate</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  )
}
