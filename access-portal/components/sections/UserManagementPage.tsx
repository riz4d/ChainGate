"use client"

/*
 * UserManagementPage - NFC Verification System
 * 
 * API Integration:
 * - Fetches users from: GET /api/users/
 * - Creates users via: POST /api/users/
 * - Updates users via: PUT /api/users/{id}/
 * - Deletes users via: DELETE /api/users/{id}/
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_API_URL: Base URL for the API (default: http://localhost:8000)
 * 
 * Features:
 * - Real-time CRUD operations with API
 * - Loading states and error handling
 * - Form validation
 * - Search and filtering
 * - User status management
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Crown,
  Settings,
  MapPin
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ReactElement } from "react"

interface User {
  last_gate_name: ReactNode
  last_access: ReactNode
  _id: string
  name: string
  email: string
  nfc_id: string
  access_level: string // Changed to string to accept dynamic access level names
  created_at: string
  active: boolean
  position: string
  phone?: string
  department?: string
  last_login?: string
  avatar?: string
}

interface AccessLevel {
  _id: string
  id: number
  name: string
  description: string
  permissions: {
    mainEntrance: boolean
    serverRoom: boolean
    researchLab: boolean
    executiveOffice: boolean
    storageArea: boolean
    conferenceRoom: boolean
  }
  created_at: string
  updated_at: string
}

interface AccessLevelsResponse {
  access_levels: AccessLevel[]
  count: number
}

interface UserStats {
  total_count: number
  active_count: number
  inactive_count: number
}

interface Pagination {
  total_users: number
  total_pages: number
  current_page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

interface UserListResponse {
  users: User[]
  pagination: Pagination
  user_stats: UserStats
}

// API integration functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const fetchUsers = async (): Promise<UserListResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/`)
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

const fetchAccessLevels = async (): Promise<AccessLevelsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/access-levels/`)
    if (!response.ok) {
      throw new Error(`Failed to fetch access levels: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching access levels:', error)
    throw error
  }
}

const createUser = async (userData: {
  name: string
  email: string
  nfc_id?: string
  access_level: string
  active: boolean
  position: string
}): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`, { 
      method: 'DELETE' 
    })
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

const departments = [
  "IT Security",
  "Facilities", 
  "Operations",
  "Marketing",
  "Human Resources",
  "Finance",
  "Legal",
  "External"
]

const positions = [
  "developer",
  "manager",
  "specialist",
  "coordinator",
  "analyst",
  "director",
  "contractor",
  "intern"
]

const AccessLevelIcon = ({ access_level }: { access_level: string }) => {
  // Map access level names to icons
  const iconMap: { [key: string]: ReactElement } = {
    "Administrator": <Crown className="h-4 w-4 text-yellow-600" />,
    "Security Staff": <Shield className="h-4 w-4 text-red-600" />,
    "IT Staff": <Settings className="h-4 w-4 text-blue-600" />,
    "Research Staff": <Users className="h-4 w-4 text-green-600" />,
    "Executive": <Crown className="h-4 w-4 text-purple-600" />,
    "General Staff": <UserCheck className="h-4 w-4 text-gray-600" />
  }
  
  return iconMap[access_level] || <UserX className="h-4 w-4 text-gray-400" />
}

const StatusBadge = ({ active }: { active: boolean }) => {
  return (
    <Badge variant="outline" className={active ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  )
}

const AccessLevelBadge = ({ access_level }: { access_level: User["access_level"] }) => {
  // Define default styles for common access levels
  const getStylesForAccessLevel = (level: string) => {
    const lowerLevel = level.toLowerCase()
    
    // Map common access level patterns to styles
    if (lowerLevel.includes('admin') || lowerLevel.includes('administrator')) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    } else if (lowerLevel.includes('executive') || lowerLevel.includes('director')) {
      return "bg-purple-100 text-purple-800 border-purple-200"
    } else if (lowerLevel.includes('security') || lowerLevel.includes('staff')) {
      return "bg-red-100 text-red-800 border-red-200"
    } else if (lowerLevel.includes('it') || lowerLevel.includes('tech')) {
      return "bg-blue-100 text-blue-800 border-blue-200"
    } else if (lowerLevel.includes('research') || lowerLevel.includes('scientist')) {
      return "bg-green-100 text-green-800 border-green-200"
    } else if (lowerLevel.includes('guest') || lowerLevel.includes('visitor')) {
      return "bg-gray-100 text-gray-800 border-gray-200"
    } else {
      // Default style for unknown access levels
      return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }
  
  return (
    <Badge variant="outline" className={getStylesForAccessLevel(access_level)}>
      <AccessLevelIcon access_level={access_level} />
      <span className="ml-1 capitalize">{access_level}</span>
    </Badge>
  )
}

export function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [accessLevelFilter, setAccessLevelFilter] = useState<User["access_level"] | "All">("All")
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "All">("All")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([])
  const [isLoadingAccessLevels, setIsLoadingAccessLevels] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    access_level: "",
    active: true,
    department: "",
    position: "",
    nfc_id: ""
  })

  // Load users and access levels on component mount
  useEffect(() => {
    loadUsers()
    loadAccessLevels()
  }, [])

  const loadAccessLevels = async () => {
    try {
      setIsLoadingAccessLevels(true)
      const response = await fetchAccessLevels()
      setAccessLevels(response.access_levels)
    } catch (err) {
      console.error('Failed to load access levels from API:', err)
      // Don't set error state for access levels, just log it
    } finally {
      setIsLoadingAccessLevels(false)
    }
  }

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchUsers()
      setUsers(response.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Failed to load users from API:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      access_level: "",
      active: true,
      department: "",
      position: "",
      nfc_id: ""
    })
  }

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.access_level || !formData.position) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const userData = {
        name: formData.name,
        email: formData.email,
        nfc_id: formData.nfc_id || undefined,
        access_level: formData.access_level,
        active: formData.active,
        position: formData.position
      }

      const newUser = await createUser(userData)
      
      // Add the new user to the local state
      setUsers(prevUsers => [...prevUsers, newUser])
      setIsAddUserOpen(false)
      resetForm()
      
      toast({
        title: "Success",
        description: `User ${formData.name} has been created successfully.`
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      access_level: user.access_level,
      active: user.active,
      position: user.position,
      department: user.department || "",
      nfc_id: user.nfc_id
    })
    setIsEditUserOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      setIsSubmitting(true)
      
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        access_level: formData.access_level as User["access_level"],
        active: formData.active,
        position: formData.position,
        nfc_id: formData.nfc_id
      }

      const updatedUser = await updateUser(selectedUser._id, userData)
      
      // Update the user in local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id ? updatedUser : user
        )
      )

      setIsEditUserOpen(false)
      setSelectedUser(null)
      resetForm()
      
      toast({
        title: "Success",
        description: `User ${formData.name} has been updated successfully.`
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(user => user._id === userId)
    if (!userToDelete) return

    try {
      await deleteUser(userId)
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId))
      
      toast({
        title: "Success",
        description: `User ${userToDelete.name} has been deleted successfully.`
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u._id === userId)
    if (!user) return

    try {
      const updatedUser = await updateUser(userId, { active: !user.active })
      
      // Update user in local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? updatedUser : u
        )
      )

      const newStatus = updatedUser.active ? "Active" : "Inactive"
      
      toast({
        title: "Success",
        description: `User status changed to ${newStatus}.`
      })
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.nfc_id && user.nfc_id.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesAccessLevel = accessLevelFilter === "All" || user.access_level === accessLevelFilter
    const matchesStatus = statusFilter === "All" || 
                         (statusFilter === "active" && user.active) ||
                         (statusFilter === "inactive" && !user.active)
    return matchesSearch && matchesAccessLevel && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(user => user.active).length,
    inactive: users.filter(user => !user.active).length,
    // Calculate stats for the most common access levels
    ...accessLevels.reduce((acc, level) => {
      const count = users.filter(user => user.access_level === level.name).length
      if (count > 0) {
        acc[level.name.toLowerCase().replace(/\s+/g, '_')] = count
      }
      return acc
    }, {} as Record<string, number>)
  }

  return (
    <div className="space-y-6 font-exo">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-russone bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm italic">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={loadUsers} disabled={isLoading}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Users
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="h-4 w-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with appropriate permissions and NFC access.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter full name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter email address" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="Enter phone number" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nfcUid">NFC UID</Label>
                    <Input 
                      id="nfcUid" 
                      placeholder="04:A1:B2:C3:D4:E5:F6" 
                      value={formData.nfc_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, nfc_id: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access_level">Access Level *</Label>
                    <Select value={formData.access_level} onValueChange={(value) => setFormData(prev => ({ ...prev, access_level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingAccessLevels ? (
                          <SelectItem value="" disabled>Loading access levels...</SelectItem>
                        ) : accessLevels.length > 0 ? (
                          accessLevels.map((level) => (
                            <SelectItem key={level._id} value={level.name}>
                              {level.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No access levels available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="active">Status *</Label>
                    <Select value={formData.active ? "active" : "inactive"} onValueChange={(value) => setFormData(prev => ({ ...prev, active: value === "active" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Permissions</Label>
                    <div className="text-sm text-muted-foreground">
                      {formData.access_level ? 
                        accessLevels.find(level => level.name === formData.access_level)?.description || 
                        "Custom access level" : 
                        "Select an access level"}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsAddUserOpen(false)
                    resetForm()
                  }} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input 
                      id="edit-name" 
                      placeholder="Enter full name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input 
                      id="edit-email" 
                      type="email" 
                      placeholder="Enter email address" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input 
                      id="edit-phone" 
                      placeholder="Enter phone number" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nfcUid">NFC UID</Label>
                    <Input 
                      id="edit-nfcUid" 
                      placeholder="04:A1:B2:C3:D4:E5:F6" 
                      value={formData.nfc_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, nfc_id: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-position">Position *</Label>
                    <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-access_level">Access Level *</Label>
                    <Select value={formData.access_level} onValueChange={(value) => setFormData(prev => ({ ...prev, access_level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingAccessLevels ? (
                          <SelectItem value="" disabled>Loading access levels...</SelectItem>
                        ) : accessLevels.length > 0 ? (
                          accessLevels.map((level) => (
                            <SelectItem key={level._id} value={level.name}>
                              {level.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No access levels available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-active">Status *</Label>
                    <Select value={formData.active ? "active" : "inactive"} onValueChange={(value) => setFormData(prev => ({ ...prev, active: value === "active" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Permissions</Label>
                    <div className="text-sm text-muted-foreground">
                      {formData.access_level ? 
                        accessLevels.find(level => level.name === formData.access_level)?.description || 
                        "Custom access level" : 
                        "Select an access level"}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsEditUserOpen(false)
                    setSelectedUser(null)
                    resetForm()
                  }} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update User"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadUsers}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        {/* Dynamic Access Level Stats - show top 2 access levels */}
        {accessLevels.slice(0, 2).map((level, index) => {
          const count = users.filter(user => user.access_level === level.name).length
          const colors = ['yellow', 'purple', 'blue', 'red', 'green']
          const color = colors[index] || 'gray'
          
          return (
            <Card key={level._id} className={`border-l-4 border-l-${color}-500`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{level.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold text-${color}-600`}>{count}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Users ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Access Level: {accessLevelFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setAccessLevelFilter("All")}>All</DropdownMenuItem>
                  {accessLevels.map((level) => (
                    <DropdownMenuItem 
                      key={level._id} 
                      onClick={() => setAccessLevelFilter(level.name)}
                    >
                      {level.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status: {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>NFC UID</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user._id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {user.email}
                      </div>
                      {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AccessLevelBadge access_level={user.access_level} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={user.active} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.position}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs">
                      {user.nfc_id ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {user.nfc_id}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {user.last_access}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {user.last_gate_name}
                    </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-green-100"
                        onClick={() => handleToggleStatus(user._id)}
                        title={user.active ? "Deactivate user" : "Activate user"}
                      >
                        {user.active ? 
                          <UserX className="h-4 w-4 text-orange-600" /> : 
                          <UserCheck className="h-4 w-4 text-green-600" />
                        }
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
