import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Battery,
  MemoryStick,
  Network
} from "lucide-react"

export function SystemMetrics() {
  const metrics = [
    {
      label: "CPU Usage",
      value: 23,
      icon: Cpu,
      color: "bg-blue-500",
      status: "Normal"
    },
    {
      label: "Memory",
      value: 67,
      icon: MemoryStick,
      color: "bg-green-500",
      status: "Normal"
    },
    {
      label: "Storage",
      value: 45,
      icon: HardDrive,
      color: "bg-purple-500",
      status: "Normal"
    },
    {
      label: "Network",
      value: 89,
      icon: Network,
      color: "bg-orange-500",
      status: "High"
    }
  ]

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
            <Cpu className="h-4 w-4 text-gray-700" />
          </div>
          System Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{metric.value}%</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    metric.status === 'Normal' ? 'text-green-700 border-green-200 bg-green-50' :
                    metric.status === 'High' ? 'text-orange-700 border-orange-200 bg-orange-50' :
                    'text-red-700 border-red-200 bg-red-50'
                  }`}
                >
                  {metric.status}
                </Badge>
              </div>
            </div>
            <Progress 
              value={metric.value} 
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
