"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards"
import { LiveVerificationLogs } from "@/components/dashboard/LiveVerificationLogs"
import { NavigationProvider, useNavigation } from "@/components/navigation/NavigationContext"
import { RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

import { NFCTagsPage } from "@/components/sections/NFCTagsPage"
import { VerificationLogsPage } from "@/components/sections/VerificationLogsPage"
import { UserManagementPage } from "@/components/sections/UserManagementPage"
import { BlockchainStatusPage } from "@/components/sections/BlockchainStatusPage"
import SettingsPage from "@/components/sections/SettingsPage"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface DashboardApiResponse {
  message: string
  response_time_ms: number
  blockchain_sync: boolean
  blockchain_latency_ms: number
  total_devices: number
  active_devices: number
  total_users: number
  active_users: number
  total_visitors_count: number
  successful_verifications: number
  denied_verifications: number
  total_verifications: number
  verification_success_rate: number
  recent_access_logs: Array<{
    timestamp: string
    gate_name: string
    location: string
    nfc_id: string
    name: string
    access_status: "granted" | "denied"
  }>
}

function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/overview/`, {
        credentials: "include",
      })
      
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive"
        })
        router.push("/login")
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
      }
      
      const data: DashboardApiResponse = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading && !dashboardData) {
    return (
      <div className="space-y-6 font-exo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="space-y-6 font-exo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2 inline" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  const summaryData = {
    totalTags: dashboardData.total_devices,
    totalVisitors: dashboardData.total_visitors_count,
    successfulVerifications: dashboardData.successful_verifications,
    blockedAttempts: dashboardData.denied_verifications,
  }

  const initialLogs = dashboardData.recent_access_logs.map((log, index) => ({
    id: `${log.nfc_id}-${index}`,
    tagId: log.nfc_id,
    location: `${log.gate_name} - ${log.location}`,
    timestamp: log.timestamp,
    status: log.access_status === "granted" ? "Verified" as const : "Blocked" as const,
    user: log.name,
    duration: 0
  }))

  return (
    <div className="space-y-6 font-exo">
      <PageHeader />
      <SummaryCards data={summaryData} />
      <AnalyticsCards 
        responseTime={dashboardData.response_time_ms}
        blockchainSync={dashboardData.blockchain_sync}
        blockchainLatency={dashboardData.blockchain_latency_ms}
        successRate={dashboardData.verification_success_rate}
        totalVerifications={dashboardData.total_verifications}
        activeDevices={dashboardData.active_devices}
        activeUsers={dashboardData.active_users}
      />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <LiveVerificationLogs initialLogs={initialLogs} disableAutoGenerate={true} />
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { currentSection } = useNavigation()

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardOverview />
      case "nfc-tags":
        return <NFCTagsPage />
      case "verification-logs":
        return <VerificationLogsPage />
      case "user-management":
        return <UserManagementPage />
      case "blockchain-status":
        return <BlockchainStatusPage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-8 py-8 max-w-full">
        {renderSection()}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <NavigationProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50/20 via-white to-indigo-50/20">
        <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <DashboardHeader />
        </div>

        <div className="flex-1 pt-16">
          <DashboardContent />
        </div>
      </div>
    </NavigationProvider>
  )
}