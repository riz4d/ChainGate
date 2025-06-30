"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, Clock, MapPin, Zap, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface VerificationLog {
  id: string
  tagId: string
  location: string
  timestamp: string
  status: "Verified" | "Blocked" | "Pending"
  user?: string
  duration?: number
}

interface LiveVerificationLogsProps {
  initialLogs?: VerificationLog[]
  disableAutoGenerate?: boolean
}

const StatusIcon = ({ status }: { status: VerificationLog["status"] }) => {
  switch (status) {
    case "Verified":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "Blocked":
      return <XCircle className="w-4 h-4 text-red-600" />
    case "Pending":
      return <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
  }
}

const LogItem = ({ log, isNew }: { log: VerificationLog; isNew?: boolean }) => {
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-xl border transition-all duration-500
      ${isNew ? 'bg-blue-50 border-blue-200 animate-pulse' : 'bg-white border-gray-100'}
      hover:shadow-md hover:border-blue-200 group
    `}>
      <div className="flex-shrink-0">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${log.status === 'Verified' ? 'bg-green-100' : 
            log.status === 'Blocked' ? 'bg-red-100' : 'bg-yellow-100'}
        `}>
          <StatusIcon status={log.status} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            {log.tagId}
          </span>
          <Badge
            variant={log.status === "Verified" ? "default" : log.status === "Blocked" ? "destructive" : "secondary"}
            className={`
              text-xs px-2 py-0.5
              ${log.status === "Verified" ? "bg-green-100 text-green-800 border-green-200" :
                log.status === "Blocked" ? "bg-red-100 text-red-800 border-red-200" :
                "bg-yellow-100 text-yellow-800 border-yellow-200"}
            `}
          >
            {log.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-sm font-medium text-gray-900 mb-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span>{log.location}</span>
        </div>
        
        {log.user && (
          <div className="text-xs text-gray-600 mb-1">
            User: {log.user}
          </div>
        )}
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{log.timestamp}</span>
          </div>
          {log.duration && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{log.duration}ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function LiveVerificationLogs({ initialLogs = [], disableAutoGenerate = false }: LiveVerificationLogsProps) {
  const [logs, setLogs] = useState<VerificationLog[]>(initialLogs)
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLogs(initialLogs)
  }, [initialLogs])

  const verifiedCount = logs.filter(log => log.status === 'Verified').length
  const blockedCount = logs.filter(log => log.status === 'Blocked').length
  const pendingCount = logs.filter(log => log.status === 'Pending').length

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30 overflow-hidden">

      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {logs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent verification logs</p>
              </div>
            ) : (
              logs.map((log) => (
                <LogItem 
                  key={log.id} 
                  log={log} 
                  isNew={newLogIds.has(log.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
