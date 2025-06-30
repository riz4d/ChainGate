import { Badge } from "@/components/ui/badge"

export function PageHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-4xl font-russone tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground">
          Welcome back! Here's what's happening with your ChainGate Corp.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge 
          variant="outline" 
          className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 px-4 py-2 text-xs font-medium shadow-sm"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          System Online
        </Badge>
      </div>
    </div>
  )
}
