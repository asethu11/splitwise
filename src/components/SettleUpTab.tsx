'use client'

import { useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { useLedger, useSettle } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSettlementSchema, type CreateSettlementInput } from '@/lib/schemas'
import { minCashFlow, type Net, type Transfer } from '@/lib/settle'
import { toast } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface SettleUpTabProps {
  groupId: string
}

export function SettleUpTab({ groupId }: SettleUpTabProps) {
  const { data: ledger, isLoading } = useLedger(groupId)
  const settle = useSettle()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [suggestedTransfers, setSuggestedTransfers] = useState<Transfer[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateSettlementInput>({
    resolver: zodResolver(createSettlementSchema),
    defaultValues: {
      currency: 'USD',
      date: new Date().toISOString().split('T')[0]
    }
  })

  const generateSuggestions = () => {
    if (ledger && ledger.length > 0) {
      // Convert ledger entries to Net format for the settle utility
      const nets: Net[] = ledger.map(entry => ({
        userId: entry.userId,
        name: entry.userName,
        net: entry.balance
      }))
      
      const transfers = minCashFlow(nets)
      setSuggestedTransfers(transfers)
    }
  }

  const applySuggestion = (transfer: Transfer) => {
    // Find user names for display
    const fromUser = ledger?.find(entry => entry.userId === transfer.fromUserId)
    const toUser = ledger?.find(entry => entry.userId === transfer.toUserId)
    
    setValue('fromUserId', transfer.fromUserId)
    setValue('toUserId', transfer.toUserId)
    setValue('amount', transfer.amount)
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: CreateSettlementInput) => {
    try {
      await settle(groupId, data)
      toast.success('Settlement recorded successfully!')
      setIsDialogOpen(false)
      reset()
      setSuggestedTransfers([])
    } catch (error) {
      toast.error('Failed to record settlement')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!ledger || ledger.length === 0) {
    return (
      <div className="text-center py-12">
        <ArrowRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No settlements needed</h3>
        <p className="text-muted-foreground">
          Add expenses to see settlement suggestions
        </p>
      </div>
    )
  }

  const totalNet = ledger.reduce((sum, entry) => sum + entry.balance, 0)
  const hasUnsettledBalances = ledger.some(entry => Math.abs(entry.balance) > 0.01)

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Settle Up</h2>
          <p className="text-sm text-muted-foreground">
            {hasUnsettledBalances ? 'Record payments to settle balances' : 'All balances are settled!'}
          </p>
        </div>

        {hasUnsettledBalances && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Suggested Transfers</h3>
              <Button onClick={generateSuggestions} variant="outline">
                Generate Suggestions
              </Button>
            </div>

            {suggestedTransfers.length > 0 ? (
              <div className="space-y-2">
                {suggestedTransfers.map((transfer, index) => {
                  const fromUser = ledger.find(entry => entry.userId === transfer.fromUserId)
                  const toUser = ledger.find(entry => entry.userId === transfer.toUserId)
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{fromUser?.userName || 'Unknown'}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{toUser?.userName || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">${transfer.amount.toFixed(2)}</span>
                        <Button
                          size="sm"
                          onClick={() => applySuggestion(transfer)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Click &quot;Generate Suggestions&quot; to see optimal transfer amounts
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Record Settlement</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Record Settlement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Settlement</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fromUserId" className="block text-sm font-medium mb-2">
                            From
                          </label>
                          <Select onValueChange={(value) => setValue('fromUserId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payer" />
                            </SelectTrigger>
                            <SelectContent>
                              {ledger?.map((entry) => (
                                <SelectItem key={entry.userId} value={entry.userId}>
                                  {entry.userName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.fromUserId && (
                            <p className="text-sm text-destructive mt-1">{errors.fromUserId.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="toUserId" className="block text-sm font-medium mb-2">
                            To
                          </label>
                          <Select onValueChange={(value) => setValue('toUserId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select recipient" />
                            </SelectTrigger>
                            <SelectContent>
                              {ledger?.map((entry) => (
                                <SelectItem key={entry.userId} value={entry.userId}>
                                  {entry.userName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.toUserId && (
                            <p className="text-sm text-destructive mt-1">{errors.toUserId.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-2">
                          Amount
                        </label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          {...register('amount', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                        {errors.amount && (
                          <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-2">
                          Date
                        </label>
                        <Input
                          id="date"
                          type="date"
                          {...register('date')}
                        />
                        {errors.date && (
                          <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-2">
                          Notes (optional)
                        </label>
                        <Input
                          id="notes"
                          {...register('notes')}
                          placeholder="Payment method, etc."
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Recording...' : 'Record Settlement'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        {Math.abs(totalNet) > 0.01 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The total net amount should be $0.00. 
              Current total: ${totalNet.toFixed(2)}. This may be due to rounding errors or incomplete data.
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
