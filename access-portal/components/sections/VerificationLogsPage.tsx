"use client"

import { useState, useEffect, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Shield, 
  Search, 
  Filter, 
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  CreditCard,
  Hash,
  Eye
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
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"

interface VerificationLog {
  gate_name: ReactNode
  location: string
  _id: string
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
  access_method: string
  success: boolean
  name: string
  email: string
  position: string
  access_level: string
  access_status: "granted" | "denied"
}

interface LogsResponse {
  logs: VerificationLog[]
  pagination: {
    total_logs: number
    total_pages: number
    current_page: number
    per_page: number
    has_next: boolean
    has_prev: boolean
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

const fetchLogs = async (): Promise<LogsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/logs/`, {
      credentials: "include",
    })
    if (response.status === 401) {
      window.location.href = "/login"
      return Promise.reject('Unauthorized')
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching logs:', error)
    throw error
  }
}

const StatusIcon = ({ success }: { success: boolean }) => {
  if (success) {
    return <CheckCircle className="h-4 w-4 text-green-600" />
  } else {
    return <XCircle className="h-4 w-4 text-red-600" />
  }
}

const StatusBadge = ({ success, access_status }: { success: boolean, access_status: string }) => {
  const status = success ? 'Verified' : 'Failed'
  const styles = {
    Verified: "bg-green-100 text-green-800 border-green-200",
    Failed: "bg-red-100 text-red-800 border-red-200"
  }
  
  return (
    <Badge variant="outline" className={styles[status]}>
      <StatusIcon success={success} />
      <span className="ml-1">{success ? access_status : 'Failed'}</span>
    </Badge>
  )
}

export function VerificationLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | "granted" | "denied">("All")
  const [selectedLog, setSelectedLog] = useState<VerificationLog | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [logs, setLogs] = useState<VerificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total_logs: 0,
    total_pages: 1,
    current_page: 1,
    per_page: 5,
    has_next: false,
    has_prev: false
  })

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetchLogs()
        setLogs(response.logs)
        setPagination(response.pagination)
      } catch (error) {
        console.error('Error loading logs:', error)
        setError('Failed to load verification logs. Please try again.')
        toast({
          title: "Error",
          description: "Failed to load verification logs. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.nfc_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.access_level?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || log.access_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: logs.length,
    verified: logs.filter(log => log.success && log.access_status === "granted").length,
    denied: logs.filter(log => log.access_status === "denied").length,
    failed: logs.filter(log => !log.success).length,
    avgResponseTime: logs.length > 0 ? "< 1s" : "N/A"
  }

  const handleLogClick = (log: VerificationLog) => {
    setSelectedLog(log)
    setIsDetailModalOpen(true)
  }

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Name', 'Email', 'NFC ID', 'Access Level', 'Status', 'Position', 'TX Hash'],
      ...filteredLogs.map(log => [
        log.access_time.date + ' ' + log.access_time.time,
        log.name || 'Unknown',
        log.email || 'N/A',
        log.nfc_id || 'N/A',
        log.access_level || 'N/A',
        log.success ? log.access_status : 'Failed',
        log.position || 'N/A',
        log.blockchain_data?.tx_hash || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `verification-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: `Exported ${filteredLogs.length} verification logs to CSV file.`
    })
  }

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetchLogs()
      setLogs(response.logs)
      setPagination(response.pagination)
      
      toast({
        title: "Success",
        description: "Verification logs refreshed successfully."
      })
    } catch (error) {
      console.error('Error refreshing logs:', error)
      setError('Failed to refresh verification logs. Please try again.')
      toast({
        title: "Error",
        description: "Failed to refresh verification logs. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-6 font-exo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading verification logs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && logs.length === 0) {
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
            Verification Logs
          </h1>
          <p className="text-muted-foreground text-sm italic">
            Monitor and analyze all NFC verification attempts
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
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportLogs}>
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : 0}% success rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
            <p className="text-xs text-muted-foreground">Access denied</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Technical failures</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Response time
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Recent Verification Logs ({filteredLogs.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("granted")}>Granted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("denied")}>Denied</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>NFC ID / Method</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow 
                    key={log._id} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleLogClick(log)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <div>
                          <div>{log.access_time.date}</div>
                          <div className="text-xs text-muted-foreground">{log.access_time.time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{log.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{log.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-medium">{log.nfc_id}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CreditCard className="h-3 w-3" />
                          {log.access_method}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-medium">{log.gate_name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{log.location || 'Unknown'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.access_level || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge success={log.success} access_status={log.access_status} />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLogClick(log)
                        }}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl font-exo">
          <DialogHeader>
            <DialogTitle>Verification Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about the verification attempt
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Log ID: {selectedLog._id}</h3>
                <StatusBadge success={selectedLog.success} access_status={selectedLog.access_status} />
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <div className="font-medium">{selectedLog.name || 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <div className="font-medium">{selectedLog.email || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Position:</span>
                      <div className="font-medium">{selectedLog.position || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Access Level:</span>
                      <div className="font-medium">{selectedLog.access_level || 'N/A'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Access Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Timestamp:</span>
                      <div className="font-medium">{selectedLog.access_time.date} {selectedLog.access_time.time}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">NFC ID:</span>
                      <div className="font-mono">{selectedLog.nfc_id}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Access Method:</span>
                      <div className="font-medium">{selectedLog.access_method}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="font-medium">{selectedLog.success ? selectedLog.access_status : 'Failed'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Blockchain Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                    <div className="font-mono text-xs break-all">{selectedLog.blockchain_data?.tx_hash || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Block Time:</span>
                    <div className="font-medium">{selectedLog.blockchain_data?.block_time || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Stored Value:</span>
                    <div className="font-mono">{selectedLog.blockchain_data?.stored_value || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
