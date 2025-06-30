import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Clock } from "lucide-react"

interface RecentLog {
  id: string
  name: string
  timestamp: string
  status: "Verified" | "Blocked"
}

interface RecentActivityProps {
  logs: RecentLog[]
}

export function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <Card className="col-span-3 shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Recent NFC Scans
          </span>
        </CardTitle>
        <CardDescription className="text-gray-600 font-medium">
          Last 5 verification attempts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 rounded-xl bg-white border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {log.id}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                    {log.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Badge
                  variant={log.status === "Verified" ? "default" : "destructive"}
                  className={`
                    px-3 py-1 font-medium shadow-sm
                    ${log.status === "Verified"
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200"
                      : "bg-gradient-to-r from-red-100 to-red-100 text-red-800 border-red-200 hover:from-red-200 hover:to-red-200"
                    }
                  `}
                >
                  {log.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
