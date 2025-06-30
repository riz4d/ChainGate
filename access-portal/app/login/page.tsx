"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Lock, Mail, Fingerprint, Wifi, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  const handleShowLoginForm = async () => {
    setIsTransitioning(true)
    // Small delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 300))
    setShowLoginForm(true)
    setIsTransitioning(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes - in real app, validate credentials with API
      if (email && password) {
        router.push("/")
      } else {
        setError("Please enter valid credentials")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ChainGate Access Control</h1>
            <p className="text-gray-600 text-sm mt-1">Secure Authentication Portal</p>
          </div>
        </div>

        {/* Status Indicators */}
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

        {/* Login Form */}
        <div className="relative">
          {!showLoginForm && !isTransitioning ? (
            // Initial Login Options with animation
            <div className="animate-in fade-in duration-500">
              <div className="transform transition-all duration-300">
                <div className="space-y-6 p-6">
                  {/* Authentication Options */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-4">Choose Authentication Method</p>
                    </div>
                    
                    {/* Email Login Button */}
                    <Button
                      onClick={handleShowLoginForm}
                      disabled={isTransitioning}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                    >
                      {isTransitioning ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Sign In with Email
                        </div>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-500 font-medium">Alternative Methods</span>
                      </div>
                    </div>

                    {/* NFC Login Option */}
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 hover:bg-gray-50 rounded-lg py-4 transition-all duration-200 hover:border-gray-300"
                      disabled
                    >
                      <Fingerprint className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-400">NFC Badge Authentication</span>
                      <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-600 border-orange-200">
                        Coming Soon
                      </Badge>
                    </Button>
                    
                    {/* Admin Access Note */}
                    <div className="text-center pt-2">
                      <p className="text-xs text-gray-500">
                        For administrator access, contact your system administrator
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isTransitioning ? (
            // Loading transition
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
            // Login Form with animation
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
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@chaingate.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-gray-50/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
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

                    {/* Error Message */}
                    {error && (
                      <div className="animate-in slide-in-from-top duration-300">
                        <Alert className="bg-red-50 border-red-200">
                          <AlertDescription className="text-red-700 text-sm">
                            {error}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Login Button */}
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

        {/* Footer */}
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
