'use client'

import React, { useState } from 'react'
import { Plus, DollarSign, User } from 'lucide-react'
import { useExpenses, useCreateExpense, useMembers } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createExpenseSchema, type CreateExpenseInput } from '@/lib/schemas'
import { toast } from 'sonner'
import dayjs from 'dayjs'

interface ExpensesTabProps {
  groupId: string
}

export function ExpensesTab({ groupId }: ExpensesTabProps) {
  const { data: expenses, isLoading } = useExpenses(groupId)
  const { data: members } = useMembers(groupId)
  const createExpense = useCreateExpense()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      splitType: 'equal',
      splits: []
    }
  })

  const splitType = watch('splitType')
  const amount = watch('amount') || 0

  // Update splits when members change or split type changes
  React.useEffect(() => {
    if (members && members.length > 0) {
      if (splitType === 'equal') {
        const equalAmount = amount / members.length
        const newSplits = members.map(member => ({
          userId: member.id,
          amount: equalAmount
        }))
        setValue('splits', newSplits)
      } else if (splitType === 'percentage') {
        const equalPercentage = 100 / members.length
        const newSplits = members.map(member => ({
          userId: member.id,
          amount: (amount * equalPercentage) / 100,
          percentage: equalPercentage
        }))
        setValue('splits', newSplits)
      } else if (splitType === 'fixed') {
        const newSplits = members.map(member => ({
          userId: member.id,
          amount: 0
        }))
        setValue('splits', newSplits)
      }
    }
  }, [members, splitType, amount, setValue])

  const onSubmit = async (data: CreateExpenseInput) => {
    try {
      await createExpense(groupId, data)
      toast.success('Expense added successfully!')
      setIsDialogOpen(false)
      reset()
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  const updateSplitAmount = (index: number, value: number) => {
    const newSplits = [...(watch('splits') || [])]
    newSplits[index].amount = value
    setValue('splits', newSplits)
  }

  const updateSplitPercentage = (index: number, value: number) => {
    const newSplits = [...(watch('splits') || [])]
    newSplits[index].percentage = value
    newSplits[index].amount = (amount * value) / 100
    setValue('splits', newSplits)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }



  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expenses ({expenses?.length || 0})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="What was this expense for?"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                  )}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label htmlFor="paidById" className="block text-sm font-medium mb-2">
                    Paid By
                  </label>
                  <Select onValueChange={(value) => setValue('paidById', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                      {members?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paidById && (
                    <p className="text-sm text-destructive mt-1">{errors.paidById.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes (optional)
                </label>
                <Input
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes"
                />
              </div>

              <div>
                <label htmlFor="splitType" className="block text-sm font-medium mb-2">
                  Split Type
                </label>
                <Select onValueChange={(value: 'equal' | 'percentage' | 'fixed') => setValue('splitType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select split type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                {errors.splitType && (
                  <p className="text-sm text-destructive mt-1">{errors.splitType.message}</p>
                )}
              </div>

              {members && members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Split Details
                  </label>
                  <div className="space-y-2">
                    {members.map((member, index) => {
                      const split = watch('splits')?.[index]
                      return (
                        <div key={member.id} className="flex items-center space-x-2 p-2 border rounded">
                          <div className="flex items-center space-x-2 flex-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{member.name}</span>
                          </div>
                          {splitType === 'percentage' ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={split?.percentage || 0}
                                onChange={(e) => updateSplitPercentage(index, parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                              <span className="text-sm font-medium">
                                ${((split?.amount || 0)).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={split?.amount || 0}
                                onChange={(e) => updateSplitAmount(index, parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {errors.splits && (
                    <p className="text-sm text-destructive mt-1">{errors.splits.message}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {expenses?.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
          <p className="text-muted-foreground mb-4">
            Add expenses to start tracking shared costs
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses?.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{expense.title}</p>
                  <p className="text-sm text-muted-foreground">
                    ${expense.amount.toFixed(2)} • {dayjs(expense.date).format('MMM D, YYYY')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  Paid by {members?.find(m => m.id === expense.paidById)?.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {expense.splitType} split
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
