import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NfcIcon, Users, ShieldCheck, ShieldX } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  title: string
  value: number
  description: string
  icon: LucideIcon
  iconColor: string
  trend?: string
}

function SummaryCard({ title, value, description, icon: Icon, iconColor, trend }: SummaryCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${iconColor}`}></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
        <div className="flex flex-col">
          <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wider group-hover:text-blue-700 transition-colors">
            {title}
          </CardTitle>
          <div className="text-2xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform">
            {value.toLocaleString()}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconColor} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span>{description}</span>
          {trend && (
            <span className="ml-auto font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
              {trend}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  )
}

interface SummaryCardsProps {
  data: {
    totalTags: number
    totalVisitors: number
    successfulVerifications: number
    blockedAttempts: number
  }
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total NFC Tags",
      value: data.totalTags,
      description: "from last month",
      icon: NfcIcon,
      iconColor: "from-blue-500 to-blue-600",
      trend: "+12%"
    },
    {
      title: "Total Visitors",
      value: data.totalVisitors,
      description: "from last month",
      icon: Users,
      iconColor: "from-green-500 to-green-600",
      trend: "+8%"
    },
    {
      title: "Successful Verifications",
      value: data.successfulVerifications,
      description: "97.6% success rate",
      icon: ShieldCheck,
      iconColor: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Blocked Attempts",
      value: data.blockedAttempts,
      description: "2.4% of total attempts",
      icon: ShieldX,
      iconColor: "from-red-500 to-red-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, index) => (
        <SummaryCard key={index} {...card} />
      ))}
    </div>
  )
}
