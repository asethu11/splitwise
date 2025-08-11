'use client'

import { useLedger } from '@/lib/hooks'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface BalancesTabProps {
  groupId: string
}

export function BalancesTab({ groupId }: BalancesTabProps) {
  const { data: ledger, isLoading, error } = useLedger(groupId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load balances</p>
      </div>
    )
  }

  if (!ledger || ledger.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No balances yet</h3>
        <p className="text-muted-foreground">
          Add expenses to see balances
        </p>
      </div>
    )
  }

  const totalNet = ledger.reduce((sum, entry) => sum + (entry.netAmount || 0), 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Balances</h2>
        <p className="text-sm text-muted-foreground">
          {totalNet === 0 ? 'All balances are settled!' : 'Some balances need to be settled'}
        </p>
      </div>

      <div className="space-y-2">
        {ledger.map((entry) => {
          const netAmount = entry.netAmount || 0
          const totalPaid = entry.totalPaid || 0
          const totalOwed = entry.totalOwed || 0
          
          return (
            <div
              key={entry.userId}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  netAmount > 0 
                    ? 'bg-green-100 text-green-600' 
                    : netAmount < 0 
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {netAmount > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : netAmount < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{entry.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    Paid: ${totalPaid.toFixed(2)} • Owed: ${totalOwed.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  netAmount > 0 
                    ? 'text-green-600' 
                    : netAmount < 0 
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  {netAmount > 0 ? '+' : ''}${netAmount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {netAmount > 0 ? 'Gets back' : netAmount < 0 ? 'Owes' : 'Settled'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {totalNet !== 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> The total net amount should be $0.00. 
            If it&apos;s not, there may be rounding errors or incomplete data.
          </p>
        </div>
      )}
    </div>
  )
}
