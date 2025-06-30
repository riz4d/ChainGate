import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, TrendingUp } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"

interface HourlyChartProps {
  data: Array<{
    hour: string
    entries: number
  }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl shadow-xl p-3">
        <p className="text-sm font-semibold text-gray-900">{`Hour: ${label}:00`}</p>
        <p className="text-sm text-blue-600">
          <span className="font-medium">Entries: </span>
          <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function HourlyChart({ data }: HourlyChartProps) {
  const maxValue = Math.max(...data.map(d => d.entries))
  const avgValue = Math.round(data.reduce((sum, d) => sum + d.entries, 0) / data.length)
  
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Real-Time Activity
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Entries per hour • Today's verification activity
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Peak: {maxValue}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1.5">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-gray-600">Avg: {avgValue}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          config={{
            entries: {
              label: "Entries",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280" 
                fontSize={11}
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="entries"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#areaGradient)"
                filter="url(#glow)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
