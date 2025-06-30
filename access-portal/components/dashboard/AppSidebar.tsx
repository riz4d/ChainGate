"use client"

import {
  BarChart3,
  Bell,
  ChevronDown,
  Database,
  Home,
  LogOut,
  NfcIcon,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useNavigation } from "@/components/navigation/NavigationContext"

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", section: "dashboard" as const, icon: Home },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "NFC Tags", section: "nfc-tags" as const, icon: NfcIcon },
      { title: "Verification Logs", section: "verification-logs" as const, icon: Shield },
      { title: "User Management", section: "user-management" as const, icon: Users },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Blockchain Status", section: "blockchain-status" as const, icon: Database },
      { title: "Settings", section: "settings" as const, icon: Settings },
    ],
  },
]

export function AppSidebar() {
  const { currentSection, setCurrentSection } = useNavigation()

  return (
    <Sidebar variant="inset" className="border-r-2 border-blue-100 w-[280px] h-full">
      <SidebarHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-3 p-2">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                  <Zap className="size-5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ChainGate
                  </span>
                  <span className="truncate text-sm text-muted-foreground font-medium">
                    NFC Verification System
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="bg-gradient-to-b from-blue-50/30 to-transparent flex-1 overflow-y-auto">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title} className="px-2">
            <SidebarGroupLabel className="text-blue-700 font-semibold text-xs uppercase tracking-wider mb-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={currentSection === item.section}
                      className={`
                        rounded-lg transition-all duration-200 hover:bg-blue-100 hover:text-blue-700
                        ${currentSection === item.section ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:text-white' : ''}
                      `}
                    >
                      <button 
                        onClick={() => setCurrentSection(item.section)} 
                        className="flex items-center gap-3 px-3 py-2 w-full text-left"
                      >
                        <item.icon className="size-4" />
                        <span className="font-medium">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-blue-100 data-[state=open]:text-blue-700 hover:bg-blue-100 transition-colors duration-200 rounded-lg"
                >
                  <Avatar className="h-9 w-9 rounded-xl border-2 border-blue-200">
                    <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-gray-900">Admin User</span>
                    <span className="truncate text-xs text-blue-600">admin@chaingate.com</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-blue-600" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-blue-200 shadow-xl"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border border-blue-200">
                      <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Admin User</span>
                      <span className="truncate text-xs text-muted-foreground">admin@chaingate.com</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-blue-50 transition-colors">
                  <Settings className="mr-2 h-4 w-4 text-blue-600" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-blue-50 transition-colors">
                  <Bell className="mr-2 h-4 w-4 text-blue-600" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
