"use client"

/*
 * NFCTagsPage - NFC Verification System
 * 
 * API Integration:
 * - Fetches devices from: GET /devices/
 * - Creates devices via: POST /devices/
 * - Updates devices via: PUT /devices/{id}/
 * - Deletes devices via: DELETE /devices/{id}/
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_API_URL: Base URL for the API (default: http://localhost:8000)
 * 
 * Features:
 * - Real-time CRUD operations with API
 * - Loading states and error handling
 * - Form validation
 * - Search and filtering
 * - Multi-select department assignment
 * - Export functionality
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  NfcIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  Signal,
  Filter,
  Download,
  RefreshCw
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown, X } from "lucide-react"

interface NFCTag {
  _id: string
  tag_id?: string
  name?: string
  location?: string
  status: "Active" | "Inactive" | "Maintenance"
  last_scanned?: string
  total_scans?: number
  last_restart?: string
  assigned_to?: string[]
  created_at?: string
  updated_at?: string
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

interface DeviceListResponse {
  message: string
  count: number
  devices: NFCTag[]
}

interface DeviceCreateResponse {
  message: string
  device: NFCTag
}

// API integration functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

const fetchAccessLevels = async (): Promise<AccessLevelsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/access-levels/`, {
      credentials: "include",
    })
    if (response.status === 401) {
      window.location.href = "/login"
      return Promise.reject('Unauthorized')
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch access levels: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching access levels:', error)
    throw error
  }
}

const fetchDevices = async (): Promise<DeviceListResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/`, {
      credentials: "include",
    })
    if (response.status === 401) {
      window.location.href = "/login"
      return Promise.reject('Unauthorized')
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching devices:', error)
    throw error
  }
}

const createDevice = async (deviceData: {
  tag_id: string
  name: string
  location: string
  status: string
  assigned_to: string[]
}): Promise<DeviceCreateResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify({
        ...deviceData,
        total_scans: 0
      })
    })
    if (response.status === 401) {
      window.location.href = "/login"
      return Promise.reject('Unauthorized')
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `Failed to create device: ${response.statusText}`)
    }
    
    return data
  } catch (error) {
    console.error('Error creating device:', error)
    throw error
  }
}

const updateDevice = async (deviceId: string, deviceData: Partial<NFCTag>): Promise<NFCTag> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify(deviceData)
    })
    if (response.status === 401) {
      window.location.href = "/login"
      return Promise.reject('Unauthorized')
    }
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || `Failed to update device: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    console.error('Error updating device:', error)
    throw error
  }
}

const deleteDevice = async (deviceId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}/`, { 
      method: 'DELETE',
      credentials: "include"
    })

    if (response.status === 401) {
      window.location.href = "/login"
      return Promise.reject('Unauthorized')
    }

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || `Failed to delete device: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting device:', error)
    throw error
  }
}





// Multi-select component for departments
const MultiSelect = ({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select items..." 
}: {
  value: string[]
  onValueChange: (value: string[]) => void
  options: string[]
  placeholder?: string
}) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onValueChange(value.filter(item => item !== selectedValue))
    } else {
      onValueChange([...value, selectedValue])
    }
  }

  const handleRemove = (itemToRemove: string) => {
    onValueChange(value.filter(item => item !== itemToRemove))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal min-h-10"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : value.length <= 3 ? (
              value.map(item => (
                <Badge key={item} variant="secondary" className="mr-1 text-xs">
                  {item}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(item)
                    }}
                  />
                </Badge>
              ))
            ) : (
              <>
                {value.slice(0, 2).map(item => (
                  <Badge key={item} variant="secondary" className="mr-1 text-xs">
                    {item}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(item)
                      }}
                    />
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  +{value.length - 2} more
                </Badge>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search departments..." />
          <CommandEmpty>No department found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => handleSelect(option)}
                className="cursor-pointer"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value.includes(option) ? "opacity-100" : "opacity-0"
                  }`}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const StatusBadge = ({ status }: { status: NFCTag["status"] }) => {
  const styles = {
    Active: "bg-green-100 text-green-800 border-green-200",
    Inactive: "bg-red-100 text-red-800 border-red-200",
    Maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
  
  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  )
}

const LastRestartIndicator = ({ lastRestart }: { lastRestart?: string }) => {
  return (
    <div className="flex items-center gap-1 text-sm">
      <RefreshCw className="h-3 w-3 text-gray-400" />
      {lastRestart || 'Never restarted'}
    </div>
  )
}

export function NFCTagsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<NFCTag["status"] | "All">("All")
  const [tags, setTags] = useState<NFCTag[]>([])
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([])
  const [isAddTagOpen, setIsAddTagOpen] = useState(false)
  const [isEditTagOpen, setIsEditTagOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<NFCTag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    tag_id: "",
    name: "",
    location: "",
    status: "Active" as NFCTag["status"],
    assigned_to: [] as string[]
  })

  // Load tags and access levels from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Load both tags and access levels in parallel
        const [tagsResponse, accessLevelsResponse] = await Promise.all([
          fetchDevices(),
          fetchAccessLevels()
        ])
        
        setTags(tagsResponse.devices)
        setAccessLevels(accessLevelsResponse.access_levels)
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load NFC tags and access levels. Please try again.')
        toast({
          title: "Error",
          description: "Failed to load NFC tags and access levels. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredTags = tags.filter(tag => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = (tag.name?.toLowerCase().includes(searchTermLower) || false) ||
                         (tag.tag_id?.toLowerCase().includes(searchTermLower) || false) ||
                         (tag.location?.toLowerCase().includes(searchTermLower) || false) ||
                         (tag.assigned_to && tag.assigned_to.some((accessLevel: string) => 
                           accessLevel?.toLowerCase().includes(searchTermLower)
                         ))
    const matchesStatus = statusFilter === "All" || tag.status === statusFilter
    
    if (!matchesSearch || !matchesStatus) {
      console.log('Tag filtered out:', {
        tagId: tag.tag_id,
        name: tag.name,
        status: tag.status,
        matchesSearch,
        matchesStatus,
        searchTerm,
        statusFilter
      })
    }
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tags.length,
    active: tags.filter(tag => tag.status === "Active").length,
    inactive: tags.filter(tag => tag.status === "Inactive").length,
    maintenance: tags.filter(tag => tag.status === "Maintenance").length
  }

  const resetForm = () => {
    setFormData({
      tag_id: "",
      name: "",
      location: "",
      status: "Active",
      assigned_to: []
    })
  }

  const generateTagId = () => {
    const prefix = "NFC"
    let number: string
    let newId: string
    
    do {
      number = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      newId = `${prefix}${number}`
    } while (tags.some(tag => tag.tag_id && tag.tag_id === newId))
    
    return newId
  }

  const handleAddTag = async () => {
    if (!formData.name || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    const tagId = formData.tag_id || generateTagId()
    if (tags.some(tag => tag.tag_id && tag.tag_id === tagId)) {
      toast({
        title: "Error",
        description: "A tag with this ID already exists. Please use a different ID.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const deviceData = {
        tag_id: tagId,
        name: formData.name,
        location: formData.location,
        status: formData.status,
        assigned_to: formData.assigned_to.length > 0 ? formData.assigned_to : []
      }

      const response = await createDevice(deviceData)
      setTags(prevTags => [...prevTags, response.device])
      setIsAddTagOpen(false)
      resetForm()
      
      toast({
        title: "Success",
        description: `NFC Tag "${formData.name}" has been created successfully.`
      })
    } catch (error) {
      console.error('Error creating tag:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tag. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTag = (tag: NFCTag) => {
    setSelectedTag(tag)
    setFormData({
      tag_id: tag.tag_id || '',
      name: tag.name || '',
      location: tag.location || '',
      status: tag.status,
      assigned_to: tag.assigned_to || []
    })
    setIsEditTagOpen(true)
  }

  const handleUpdateTag = async () => {
    if (!selectedTag) return

    try {
      setIsSubmitting(true)
      
      const updateData = {
        name: formData.name,
        location: formData.location,
        status: formData.status,
        assigned_to: formData.assigned_to
      }

      const updatedTag = await updateDevice(selectedTag._id, updateData)
      
      console.log('API Update Response:', updatedTag)

      setTags(prevTags => {
        const updatedTags = prevTags.map(tag => {
          if (tag._id === selectedTag._id) {
            if (updatedTag && typeof updatedTag === 'object') {
              const mergedTag = {
                ...tag, 
                ...updatedTag,  
                _id: selectedTag._id 
              }
              console.log('Updated tag (API response):', mergedTag)
              return mergedTag
            } else {
              const fallbackTag = {
                ...tag,
                name: formData.name,
                location: formData.location,
                status: formData.status,
                assigned_to: formData.assigned_to,
                updated_at: new Date().toISOString()
              }
              console.log('Updated tag (fallback):', fallbackTag)
              return fallbackTag
            }
          }
          return tag
        })
        
        console.log('All tags after update:', updatedTags)
        return updatedTags
      })

      setTimeout(async () => {
        try {
          const tagsResponse = await fetchDevices()
          setTags(tagsResponse.devices)
          console.log('Refreshed tags from server after update')
        } catch (error) {
          console.error('Failed to refresh tags after update:', error)
        }
      }, 500) // Small delay to ensure server has processed the update

      setIsEditTagOpen(false)
      setSelectedTag(null)
      resetForm()
      
      toast({
        title: "Success",
        description: `NFC Tag "${formData.name}" has been updated successfully.`
      })
    } catch (error) {
      console.error('Error updating tag:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tag. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    const tagToDelete = tags.find(tag => tag._id === tagId)
    if (!tagToDelete) return

    try {
      await deleteDevice(tagId)
      setTags(prevTags => prevTags.filter(tag => tag._id !== tagId))
      
      toast({
        title: "Success",
        description: `NFC Tag "${tagToDelete.name}" has been deleted successfully.`
      })
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete tag. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleExportTags = () => {
    const csvContent = [
      ['Tag ID', 'Name', 'Location', 'Status', 'Last Restart', 'Last Scanned', 'Total Scans', 'Access Levels'],
      ...filteredTags.map(tag => [
        tag.tag_id || '',
        tag.name || '',
        tag.location || '',
        tag.status || '',
        tag.last_restart || 'Never restarted',
        tag.last_scanned || 'Never',
        (tag.total_scans || 0).toString(),
        tag.assigned_to && tag.assigned_to.length > 0 ? tag.assigned_to.join('; ') : 'No Access Levels'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nfc-tags-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: `Exported ${filteredTags.length} NFC tags to CSV file.`
    })
  }

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [tagsResponse, accessLevelsResponse] = await Promise.all([
        fetchDevices(),
        fetchAccessLevels()
      ])
      
      setTags(tagsResponse.devices)
      setAccessLevels(accessLevelsResponse.access_levels)
      
      toast({
        title: "Success",
        description: "NFC tags and access levels refreshed successfully."
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      setError('Failed to refresh NFC tags and access levels. Please try again.')
      toast({
        title: "Error",
        description: "Failed to refresh NFC tags and access levels. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && tags.length === 0) {
    return (
      <div className="space-y-6 font-exo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading NFC tags and access levels...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && tags.length === 0) {
    return (
      <div className="space-y-6 font-exo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-exo">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-russone bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NFC Tags Management
          </h1>
          <p className="text-muted-foreground text-sm italic">
            Manage and monitor all NFC tags in your system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportTags}>
            <Download className="h-4 w-4" />
            Export Tags
          </Button>
          <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="h-4 w-4" />
                Add New Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New NFC Tag</DialogTitle>
                <DialogDescription>
                  Create a new NFC tag to be deployed in your system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tag-id">Tag ID</Label>
                    <Input 
                      id="tag-id" 
                      placeholder="Auto-generated if empty" 
                      value={formData.tag_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, tag_id: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag-name">Tag Name *</Label>
                    <Input 
                      id="tag-name" 
                      placeholder="Enter tag name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location" 
                    placeholder="Enter installation location" 
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: NFCTag["status"]) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigned-to">Assigned To</Label>
                  <MultiSelect
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                    options={accessLevels.filter(level => level.name).map(level => level.name)}
                    placeholder="Select access levels"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsAddTagOpen(false)
                    resetForm()
                  }} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTag} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Tag"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditTagOpen} onOpenChange={setIsEditTagOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit NFC Tag</DialogTitle>
            <DialogDescription>
              Update the NFC tag information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tag-id">Tag ID</Label>
                <Input 
                  id="edit-tag-id" 
                  value={formData.tag_id}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tag-name">Tag Name *</Label>
                <Input 
                  id="edit-tag-name" 
                  placeholder="Enter tag name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input 
                id="edit-location" 
                placeholder="Enter installation location" 
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: NFCTag["status"]) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-assigned-to">Assigned To</Label>
              <MultiSelect
                value={formData.assigned_to}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                options={accessLevels.filter(level => level.name).map(level => level.name)}
                placeholder="Select access levels"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsEditTagOpen(false)
                setSelectedTag(null)
                resetForm()
              }} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTag} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Tag"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tags</CardTitle>
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
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <NfcIcon className="h-5 w-5 text-blue-600" />
              NFC Tags ({filteredTags.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status: {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                    Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Maintenance")}>
                    Maintenance
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag ID</TableHead>
                <TableHead>Name & Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restart</TableHead>
                <TableHead>Last Scanned</TableHead>
                <TableHead>Total Scans</TableHead>
                <TableHead>Access Levels</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag._id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">{tag.tag_id || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{tag.name || 'Unnamed'}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {tag.location || 'No location'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tag.status} />
                  </TableCell>
                  <TableCell>
                    <LastRestartIndicator lastRestart={tag.last_restart} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {tag.last_scanned || 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Signal className="h-3 w-3 text-blue-500" />
                      {(tag.total_scans || 0).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tag.assigned_to && tag.assigned_to.length > 0 ? (
                        tag.assigned_to.map((accessLevel, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {accessLevel}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No Access Levels</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        onClick={() => handleEditTag(tag)}
                        title="Edit tag"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                            title="Delete tag"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the NFC tag "{tag.name}" and remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteTag(tag._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
