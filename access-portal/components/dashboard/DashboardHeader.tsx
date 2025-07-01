"use client"

import { 
  Bell, 
  Database, 
  Home, 
  LogOut, 
  NfcIcon, 
  Settings, 
  Shield, 
  Users,
  Zap 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigation } from "@/components/navigation/NavigationContext"
import { SearchBar } from "@/components/dashboard/SearchBar"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

const navigationItems = [
  { title: "Dashboard", section: "dashboard" as const, icon: Home },
  { title: "NFC Tags", section: "nfc-tags" as const, icon: NfcIcon },
  { title: "Verification Logs", section: "verification-logs" as const, icon: Shield },
  { title: "User Management", section: "user-management" as const, icon: Users },
  { title: "Blockchain Status", section: "blockchain-status" as const, icon: Database },
  { title: "Settings", section: "settings" as const, icon: Settings },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function DashboardHeader() {
  const { currentSection, setCurrentSection } = useNavigation()
  const { logout, sessionId } = useAuth()
  const router = useRouter()
  const [adminInfo, setAdminInfo] = useState<{name: string, email: string} | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const adminData = sessionStorage.getItem('admin')
    if (adminData) {
      try {
        const admin = JSON.parse(adminData)
        setAdminInfo(admin)
      } catch (error) {
        console.error('Failed to parse admin data:', error)
      }
    }
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/supervisor/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionId ? `Bearer ${sessionId}` : '',
        },
      })

      if (response.ok) {
        toast({
          title: "Logged Out Successfully",
          description: "You have been logged out of your account.",
          variant: "default"
        })
      } else {
        console.warn('Logout API failed, but proceeding with local logout')
        toast({
          title: "Logged Out",
          description: "Session cleared locally.",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
      toast({
        title: "Logged Out",
        description: "Session cleared locally.",
        variant: "default"
      })
    } finally {
      logout()
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 px-4 w-full border-b border-blue-100 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
          <Zap className="size-4" />
        </div>
        <div className="hidden sm:block">
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ChainGate
          </span>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <SearchBar />
      </div>
      <div className="flex items-center gap-1">
        {navigationItems.map((item) => (
          <Button
            key={item.section}
            variant="ghost"
            size="icon"
            onClick={() => setCurrentSection(item.section)}
            title={item.title}
            className={`
              h-9 w-9 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:text-blue-700
              ${currentSection === item.section ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:text-white' : 'text-gray-600'}
            `}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-200 group h-9 w-9"
        >
          <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg animate-pulse">
            3
          </span>
        </Button> */}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-xl hover:bg-blue-100 transition-colors">
              <Avatar className="h-8 w-8 border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                  {adminInfo?.name ? adminInfo.name.substring(0, 2).toUpperCase() : 'AD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 rounded-xl border-blue-200 shadow-xl" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-semibold leading-none text-gray-900">
                  {adminInfo?.name || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-blue-600">
                  {adminInfo?.email || 'admin@chaingate.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => setCurrentSection("settings")}
            >
              <Settings className="mr-2 h-4 w-4 text-blue-600" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className={`mr-2 h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
