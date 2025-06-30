import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wifi, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Server, 
  Users2,
  Target,
  Zap
} from "lucide-react"
import { LucideIcon } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  color: string
  trend?: {
    value: string
    isPositive: boolean
  }
  status?: "online" | "warning" | "error"
}

function AnalyticsCard({ title, value, subtitle, icon: Icon, color, trend, status }: AnalyticsCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "online": return "bg-green-100 text-green-700 border-green-200"
      case "warning": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "error": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
      <div className={`absolute top-0 left-0 w-full h-0.5 ${color}`}></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-1.5 rounded-lg ${color.replace('bg-', 'bg-').replace('-500', '-100')} group-hover:scale-110 transition-transform`}>
            <Icon className={`h-3.5 w-3.5 ${color.replace('bg-', 'text-').replace('-100', '-600')}`} />
          </div>
          {status && (
            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getStatusColor()}`}>
              {status.toUpperCase()}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <div className="text-lg font-bold text-gray-900 group-hover:scale-105 transition-transform">
            {value}
          </div>
          <p className="text-xs text-gray-500">{subtitle}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              <span className="font-medium">{trend.value}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalyticsCardsProps {
  responseTime?: number
  blockchainSync?: boolean
  blockchainLatency?: number
  successRate?: number
  totalVerifications?: number
  activeDevices?: number
  activeUsers?: number
}

export function AnalyticsCards({ 
  responseTime = 145,
  blockchainSync = true,
  blockchainLatency = 1.89,
  successRate = 97.6,
  totalVerifications = 0,
  activeDevices = 0,
  activeUsers = 0
}: AnalyticsCardsProps) {
  const cards = [
    {
      title: "System Status",
      value: "Online",
      subtitle: "All systems operational",
      icon: Server,
      color: "bg-blue-100",
      status: "online" as const
    },
    {
      title: "Response Time",
      value: `${Math.round(responseTime)}ms`,
      subtitle: "API latency",
      icon: Zap,
      color: "bg-green-100",
      status: responseTime < 500 ? "online" as const : "warning" as const
    },
    {
      title: "Active Devices",
      value: activeDevices.toString(),
      subtitle: "Currently online",
      icon: Wifi,
      color: "bg-purple-100",
      status: "online" as const
    },
    {
      title: "Blockchain Sync",
      value: blockchainSync ? "Synced" : "Syncing",
      subtitle: `${Math.round(blockchainLatency)}ms latency`,
      icon: Server,
      color: "bg-cyan-100",
      status: blockchainSync ? "online" as const : "warning" as const
    },
    {
      title: "Success Rate",
      value: `${Math.round(successRate)}%`,
      subtitle: "Verification accuracy",
      icon: Target,
      color: "bg-emerald-100",
      status: successRate > 90 ? "online" as const : "warning" as const
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      subtitle: "Currently active",
      icon: Users2,
      color: "bg-indigo-100"
    },
    {
      title: "Total Verifications",
      value: totalVerifications.toString(),
      subtitle: "All time",
      icon: Target,
      color: "bg-orange-100"
    },
    {
      title: "System Health",
      value: "Healthy",
      subtitle: "All components OK",
      icon: AlertTriangle,
      color: "bg-green-100",
      status: "online" as const
    }
  ]

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mb-6">
      {cards.map((card, index) => (
        <AnalyticsCard key={index} {...card} />
      ))}
    </div>
  )
}
