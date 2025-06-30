"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Database, 
  Activity, 
  Zap,
  Globe,
  RefreshCw,
  Hash,
  Clock,
  ArrowRightLeft,
  Coins,
  Eye,
  Copy,
  ExternalLink,
  User,
  Fuel
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ChainInfo {
  status: string
  latency_ms: number
  chain_id: number
  latest_block: number
  blocks_mined_today: number
}

interface BlockchainTransaction {
  hash: string
  from: string
  to: string
  value: number
  block: number
  timestamp: string
  gas_used: number
  gas_price: string
}

interface TransactionsResponse {
  status: string
  message: string
  transactions: BlockchainTransaction[]
  pagination: {
    total_transactions: number
    total_pages: number
    current_page: number
    per_page: number
    has_next: boolean
    has_prev: boolean
  }
}

interface BlockchainMetric {
  label: string
  value: string | number
  change: string
  icon: any
  color: string
}

// API integration functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const fetchChainInfo = async (): Promise<ChainInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blockchain/chain-info/`)
    if (!response.ok) {
      throw new Error(`Failed to fetch chain info: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching chain info:', error)
    throw error
  }
}

const fetchTransactions = async (): Promise<TransactionsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blockchain/transactions/`)
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
}

export function BlockchainStatusPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null)
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<BlockchainTransaction | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const loadData = async () => {
    try {
      setError(null)
      
      const [chainResponse, transactionsResponse] = await Promise.all([
        fetchChainInfo(),
        fetchTransactions()
      ])
      
      setChainInfo(chainResponse)
      setTransactions(transactionsResponse.transactions)
    } catch (error) {
      console.error('Error loading blockchain data:', error)
      setError('Failed to load blockchain data. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load blockchain data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const transactionsResponse = await fetchTransactions()
        setTransactions(transactionsResponse.transactions)
      } catch (error) {
        console.error('Error refreshing transactions:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    
    toast({
      title: "Success",
      description: "Blockchain data refreshed successfully."
    })
  }

  const metrics: BlockchainMetric[] = chainInfo ? [
    {
      label: "Network Status",
      value: chainInfo.status,
      change: `Chain ID: ${chainInfo.chain_id}`,
      icon: Globe,
      color: "text-green-600"
    },
    {
      label: "Latest Block",
      value: chainInfo.latest_block.toLocaleString(),
      change: `${chainInfo.blocks_mined_today} blocks today`,
      icon: Database,
      color: "text-blue-600"
    },
    {
      label: "Total Transactions",
      value: transactions.length,
      change: "Live updates",
      icon: ArrowRightLeft,
      color: "text-purple-600"
    },
    {
      label: "Network Latency",
      value: `${chainInfo.latency_ms.toFixed(2)}ms`,
      change: "Response time",
      icon: Activity,
      color: "text-orange-600"
    }
  ] : []

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleTransactionClick = (transaction: BlockchainTransaction) => {
    setSelectedTransaction(transaction)
    setIsDetailModalOpen(true)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`
    })
  }

  const formatGasPrice = (gasPriceWei: string) => {
    const gwei = parseFloat(gasPriceWei) / 1e9
    return `${gwei.toFixed(2)} Gwei`
  }
  if (isLoading) {
    return (
      <div className="space-y-6 font-exo">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading blockchain data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !chainInfo) {
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
            Blockchain Status
          </h1>
          <p className="text-muted-foreground text-sm italic">
            Monitor blockchain network health and live transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            {chainInfo?.status || 'Unknown'}
          </Badge>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                Live Blockchain Transactions
              </CardTitle>
              <CardDescription>
                Real-time blockchain transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Gas Used</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow 
                    key={tx.hash} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleTransactionClick(tx)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="font-mono text-sm">{formatAddress(tx.hash)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{formatAddress(tx.from)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{formatAddress(tx.to)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        <span className="font-mono">{tx.value} ETH</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {tx.block}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{tx.gas_used.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Complete information for transaction {selectedTransaction?.hash.slice(0, 10)}...
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Transaction Hash</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm flex-1 break-all">{selectedTransaction.hash}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedTransaction.hash, "Transaction hash")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">From Address</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm flex-1 break-all">{selectedTransaction.from}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedTransaction.from, "From address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">To Address</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm flex-1 break-all">{selectedTransaction.to}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedTransaction.to, "To address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Value</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-mono text-sm">{selectedTransaction.value} ETH</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Block Number</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span className="font-mono text-sm">{selectedTransaction.block}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Gas Used</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Fuel className="h-4 w-4 text-orange-500" />
                    <span className="font-mono text-sm">{selectedTransaction.gas_used.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Gas Price</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span className="font-mono text-sm">{formatGasPrice(selectedTransaction.gas_price)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Timestamp</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-mono text-sm">{formatTimestamp(selectedTransaction.timestamp)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Transaction Fee</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Coins className="h-4 w-4 text-red-500" />
                  <span className="font-mono text-sm">
                    {((selectedTransaction.gas_used * parseFloat(selectedTransaction.gas_price)) / 1e18).toFixed(8)} ETH
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
