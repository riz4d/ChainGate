"use client"

import { useState, useEffect, useRef } from "react"
import { Search, User, Mail, Shield, Briefcase, X, Send, MessageCircle, Clock, CreditCard, Database } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
interface SearchUser {
  id: string
  name: string
  email: string
  access_level: string
  position: string
}

interface SearchApiResponse {
  message: string
  users: SearchUser[]
  response_time_ms: number
}

interface UserDetails {
  name: string
  email: string
  nfc_id: string
  access_level: string
  created_at: string
  active: boolean
  position: string
  updated_at: string
  last_access: string
  last_gate_id: string
  last_gate_name: string
  access_history: Array<{
    timestamp: string
    access_time: {
      date: string
      time: string
      unix_time: number
    }
    nfc_id: string
    card_data: {
      hex_uid: string
      processed_hex: string
    }
    blockchain_data: {
      tx_hash: string
      block_time: string
      stored_value: string
    }
    access_status: "granted" | "denied"
    access_method: string
    success: boolean
  }>
}

interface UserDetailsApiResponse {
  message: string
  user: UserDetails
  response_time_ms: number
}

interface SummarizeApiResponse {
  message: string
  user_summary?: string
  response?: string
  response_time_ms: number
}

interface ChatMessage {
  id: string
  message: string
  timestamp: string
  isUser: boolean
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data: SearchApiResponse = await response.json()
      setSuggestions(data.users.slice(0, 4))
      setShowSuggestions(data.users.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(query)
    }, 300)
  }

  const fetchUserSummary = async (userId: string) => {
    try {
      setIsLoadingSummary(true)
      const response = await fetch(`${API_BASE_URL}/api/summarize/${userId}/`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user summary: ${response.statusText}`)
      }

      const data: SummarizeApiResponse = await response.json()
      
      setChatMessages([{
        id: Date.now().toString(),
        message: data.user_summary || "No summary available",
        timestamp: new Date().toLocaleTimeString(),
        isUser: false
      }])
    } catch (error) {
      console.error('Error fetching user summary:', error)
      setChatMessages([{
        id: Date.now().toString(),
        message: "Sorry, I couldn't load the user summary at this time. Please try asking a specific question.",
        timestamp: new Date().toLocaleTimeString(),
        isUser: false
      }])
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const handleUserSelect = async (user: SearchUser) => {
    try {
      setIsLoadingUser(true)
      setShowUserModal(true)
      setShowSuggestions(false)
      setSearchQuery("")
      setChatMessages([])

      const response = await fetch(`${API_BASE_URL}/api/search/${user.id}/`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.statusText}`)
      }

      const data: UserDetailsApiResponse = await response.json()
      setSelectedUser(data.user)
      
      await fetchUserSummary(user.id)
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedUser) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: chatInput,
      timestamp: new Date().toLocaleTimeString(),
      isUser: true
    }

    setChatMessages(prev => [...prev, userMessage])
    const messageToSend = chatInput
    setChatInput("")

    try {
      setIsLoadingSummary(true)
        const response = await fetch(`${API_BASE_URL}/api/summarize/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: selectedUser.nfc_id,
          message: messageToSend
        })
      })

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`)
      }

      const data: SummarizeApiResponse = await response.json()
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: data.response || "No response received",
        timestamp: new Date().toLocaleTimeString(),
        isUser: false
      }
      
      setChatMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error sending chat message:', error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "Sorry, I couldn't process your request at this time. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
        isUser: false
      }
      setChatMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoadingSummary(false)
    }
  }
  const handleModalClose = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setChatMessages([])
    setChatInput("")
    setIsLoadingSummary(false)
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const getAccessLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'executive':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'employee':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'contractor':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <div ref={searchRef} className="relative w-full max-w-md font-exo">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
        <Input 
          type="search" 
          placeholder="Search users..." 
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 w-full bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl transition-all duration-200" 
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2 px-2">
                Found {suggestions.length} user{suggestions.length !== 1 ? 's' : ''}
              </div>
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                >
                  <Avatar className="h-8 w-8 border border-blue-200">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {user.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1.5 py-0.5 ${getAccessLevelColor(user.access_level)}`}
                      >
                        {user.access_level}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    <div className="text-xs text-gray-400 truncate">{user.position}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showSuggestions && suggestions.length === 0 && !isLoading && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-200 rounded-xl shadow-lg z-50">
            <div className="p-4 text-center text-gray-500 text-sm">
              No users found for "{searchQuery}"
            </div>
          </div>
        )}
      </div>
      <Dialog open={showUserModal} onOpenChange={handleModalClose}>
        <DialogContent className="font-exo max-w-6xl max-h-[95vh] p-0 bg-transparent border-0 shadow-none overflow-hidden focus:outline-none focus-visible:outline-none">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden focus:outline-none focus-visible:outline-none">
            <DialogHeader className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <DialogTitle className="flex items-center gap-3 text-xl font-medium text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                User Profile
              </DialogTitle>
            </DialogHeader>
            
            {isLoadingUser ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading user details...</p>
              </div>
            ) : selectedUser ? (
              <div className="flex h-[calc(95vh-140px)]">
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 focus:outline-none">
                  <div className="space-y-6 max-w-4xl">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                      <Avatar className="h-14 w-14 border-2 border-blue-100">
                        <AvatarImage src="/placeholder-user.jpg" alt={selectedUser.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                          {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">{selectedUser.name}</h3>
                          <div className={`h-2 w-2 rounded-full ${selectedUser.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                        <p className="text-gray-600 text-sm mb-2 truncate">{selectedUser.position}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`px-2 py-0.5 text-xs ${getAccessLevelColor(selectedUser.access_level)}`}
                          >
                            {selectedUser.access_level}
                          </Badge>
                          <span className="text-xs text-gray-500">{selectedUser.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            Contact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="p-1.5 bg-blue-100 rounded-md">
                              <Mail className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="p-1.5 bg-purple-100 rounded-md">
                              <CreditCard className="h-3 w-3 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">NFC ID</p>
                              <p className="text-sm font-medium text-gray-900 font-mono truncate">{selectedUser.nfc_id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="p-1.5 bg-green-100 rounded-md">
                              <Shield className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Last Gate</p>
                              <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.last_gate_name}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Database className="h-4 w-4 text-indigo-500" />
                            Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-600 font-medium">Member Since</p>
                              <p className="text-sm font-semibold text-blue-900 truncate">{selectedUser.created_at}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                              <p className="text-xs text-green-600 font-medium">Last Access</p>
                              <p className="text-sm font-semibold text-green-900 truncate">{selectedUser.last_access}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                              <p className="text-xs text-purple-600 font-medium">Total</p>
                              <p className="text-sm font-semibold text-purple-900">{selectedUser.access_history.length}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                              <p className="text-xs text-orange-600 font-medium">Status</p>
                              <p className={`text-sm font-semibold capitalize ${selectedUser.active ? 'text-green-700' : 'text-gray-700'}`}>
                                {selectedUser.active ? 'Active' : 'Inactive'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-0 shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48 focus:outline-none">
                          <div className="space-y-2">
                            {selectedUser.access_history.slice(0, 8).map((access, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${access.success ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{access.access_time.date}</p>
                                    <p className="text-xs text-gray-500 truncate">{access.access_time.time} • {access.access_method}</p>
                                  </div>
                                </div>
                                <Badge 
                                  variant={access.success ? "default" : "destructive"} 
                                  className="px-2 py-0.5 text-xs"
                                >
                                  {access.access_status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="w-80 border-l border-gray-200 flex flex-col bg-white focus:outline-none">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <MessageCircle className="h-3 w-3 text-blue-600" />
                      </div>
                      AI Assistant (Beta)
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Ask questions about this user</p>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4 focus:outline-none">
                    <div className="space-y-3">
                      {isLoadingSummary && chatMessages.length === 0 && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] p-3 rounded-xl shadow-sm bg-gray-100 border border-gray-200">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                              <p className="text-xs text-gray-600">Loading user summary...</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-xl shadow-sm ${
                            message.isUser 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900 border border-gray-200'
                          }`}>
                            <p className="text-xs leading-relaxed">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.isUser ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {isLoadingSummary && chatMessages.length > 0 && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] p-3 rounded-xl shadow-sm bg-gray-100 border border-gray-200">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                              <p className="text-xs text-gray-600">Thinking...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this user..."
                        className="flex-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoadingSummary}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        size="icon"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md h-9 w-9"
                        disabled={isLoadingSummary || !chatInput.trim()}
                      >
                        {isLoadingSummary ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
