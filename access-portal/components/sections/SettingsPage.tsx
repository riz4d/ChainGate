"use client"

import { useState, useEffect } from "react"
import {
  Database,
  Globe,
  Key,
  Save,
  Settings,
  Monitor,
  Lock,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
interface SettingsApiResponse {
  _id: string
  id: number
  organization: {
    name: string
    contact_email: string
  }
  blockchain: {
    enabled: boolean
    network_endpoint: string
  }
  system: {
    maintenance_mode: boolean
  }
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: "",
    contactEmail: "",
    
    blockchainEnabled: false,
    networkEndpoint: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    maintenanceMode: false,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/settings/`, {
        credentials: "include",
      })
      if (response.status === 401) {
        window.location.href = "/login"
        return Promise.reject('Unauthorized')
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`)
      }

      const data: SettingsApiResponse = await response.json()
      
      setSettings(prev => ({
        ...prev,
        organizationName: data.organization.name,
        contactEmail: data.organization.contact_email,
        blockchainEnabled: data.blockchain.enabled,
        networkEndpoint: data.blockchain.network_endpoint,
        maintenanceMode: data.system.maintenance_mode,
      }))
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      
      const payload = {
        organization: {
          name: settings.organizationName,
          contact_email: settings.contactEmail,
        },
        blockchain: {
          enabled: settings.blockchainEnabled,
          network_endpoint: settings.networkEndpoint,
        },
        system: {
          maintenance_mode: settings.maintenanceMode,
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/settings/`, {
        method: 'PUT',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.status === 401) {
        window.location.href = "/login"
        return Promise.reject('Unauthorized')
      }

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`)
      }
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = () => {
    saveSettings()
  }

  const handlePasswordSave = () => {
    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      })
      return
    }
    
    if (settings.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })
    
    setSettings(prev => ({ 
      ...prev, 
      currentPassword: "", 
      newPassword: "", 
      confirmPassword: "" 
    }))
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6 font-exo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-exo">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-russone tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm italic">
            Configure your ChainGate system preferences and security settings.
          </p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              Basic information about your organization and system preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={settings.organizationName}
                  onChange={(e) => handleSettingChange("organizationName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingChange("contactEmail", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Blockchain Configuration
            </CardTitle>
            <CardDescription>
              Configure blockchain network settings and transaction parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Blockchain</Label>
                <p className="text-sm text-muted-foreground">
                  Turn blockchain functionality on or off
                </p>
              </div>
              <Switch
                checked={settings.blockchainEnabled}
                onCheckedChange={(checked) => handleSettingChange("blockchainEnabled", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="networkEndpoint">Network Endpoint</Label>
              <Input
                id="networkEndpoint"
                value={settings.networkEndpoint}
                onChange={(e) => handleSettingChange("networkEndpoint", e.target.value)}
                disabled={!settings.blockchainEnabled}
              />
              <p className="text-sm text-muted-foreground">
                RPC endpoint for blockchain network connection
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password for enhanced security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={settings.currentPassword}
                onChange={(e) => handleSettingChange("currentPassword", e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={settings.newPassword}
                  onChange={(e) => handleSettingChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={settings.confirmPassword}
                  onChange={(e) => handleSettingChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Password should be at least 8 characters long and contain a mix of uppercase, lowercase, numbers, and special characters.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handlePasswordSave} className="bg-green-600 hover:bg-green-700">
                <Lock className="mr-2 h-4 w-4" />
                Save Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System Management
            </CardTitle>
            <CardDescription>
              Advanced system settings and maintenance options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable system access
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>System Information</Label>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium">Version:</span> v2.1.0
                </div>
                <div>
                  <span className="font-medium">Uptime:</span> 15d 8h 23m
                </div>
                <div>
                  <span className="font-medium">Database:</span> PostgreSQL 14.2
                </div>
                <div>
                  <span className="font-medium">Cache:</span> Redis 7.0.5
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
