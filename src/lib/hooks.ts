import useSWR, { useSWRConfig } from 'swr'
import { Group, Member, Expense, LedgerEntry, CreateGroupInput, AddMemberInput, CreateExpenseInput, CreateSettlementInput } from './types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Groups
export function useGroups() {
  return useSWR('/api/groups', fetcher)
}

export function useGroup(id: string) {
  return useSWR(`/api/groups/${id}`, fetcher)
}

export function useCreateGroup() {
  const { mutate: globalMutate } = useSWRConfig()
  
  return async (data: CreateGroupInput) => {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create group')
    }
    
    const result = await response.json()
    
    // Update groups list
    await globalMutate('/api/groups')
    
    return result
  }
}

// Members
export function useMembers(groupId: string) {
  return useSWR(`/api/groups/${groupId}/members`, fetcher)
}

export function useAddMember() {
  const { mutate: globalMutate } = useSWRConfig()
  
  return async (groupId: string, data: AddMemberInput) => {
    const response = await fetch(`/api/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to add member')
    }
    
    const result = await response.json()
    
    // Update members list
    await globalMutate(`/api/groups/${groupId}/members`)
    
    return result
  }
}

// Expenses
export function useExpenses(groupId: string) {
  return useSWR(`/api/groups/${groupId}/expenses`, fetcher)
}

export function useCreateExpense() {
  const { mutate: globalMutate } = useSWRConfig()
  
  return async (groupId: string, data: CreateExpenseInput) => {
    // Optimistic update
    const optimisticExpense = {
      id: `temp-${Date.now()}`,
      title: data.title,
      amount: data.amount,
      currency: data.currency,
      date: new Date(data.date).toISOString(),
      notes: data.notes || null,
      paidById: data.paidById,
      groupId,
      splitType: data.splitType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidBy: {
        id: data.paidById,
        name: 'Loading...',
        email: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      expenseSplits: data.splits.map(split => ({
        id: `temp-split-${Date.now()}-${split.userId}`,
        expenseId: `temp-${Date.now()}`,
        userId: split.userId,
        amount: split.amount,
        percentage: split.percentage,
        isPaid: false,
        user: {
          id: split.userId,
          name: 'Loading...',
          email: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })),
    }
    
    const previousExpenses = await globalMutate(
      `/api/groups/${groupId}/expenses`, 
      (current: Expense[] = []) => [optimisticExpense, ...current], 
      false
    )
    
    const previousLedger = await globalMutate(
      `/api/groups/${groupId}/ledger`, 
      undefined, 
      false
    )
    
    try {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create expense')
      }
      
      const result = await response.json()
      const expense = result.data
      
      // Update with real data
      await globalMutate(
        `/api/groups/${groupId}/expenses`, 
        (current: Expense[] = []) => 
          current.map(e => e.id === optimisticExpense.id ? expense : e)
      )
      
      // Revalidate ledger
      await globalMutate(`/api/groups/${groupId}/ledger`)
      
      return expense
    } catch (error) {
      // Rollback on error
      await globalMutate(`/api/groups/${groupId}/expenses`, previousExpenses, false)
      await globalMutate(`/api/groups/${groupId}/ledger`, previousLedger, false)
      throw error
    }
  }
}

// Ledger
export function useLedger(groupId: string) {
  return useSWR<LedgerEntry[]>(`/api/groups/${groupId}/ledger`, fetcher)
}

// Settlements
export function useSettlements(groupId: string) {
  return useSWR(`/api/groups/${groupId}/settlements`, fetcher)
}

export function useSettle() {
  const { mutate: globalMutate } = useSWRConfig()
  
  return async (groupId: string, data: CreateSettlementInput) => {
    // Optimistic update
    const optimisticSettlement = {
      id: `temp-${Date.now()}`,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      groupId,
      amount: data.amount,
      currency: data.currency,
      date: new Date(data.date).toISOString(),
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      fromUser: {
        id: data.fromUserId,
        name: 'Loading...',
        email: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      toUser: {
        id: data.toUserId,
        name: 'Loading...',
        email: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
    
    const previousSettlements = await globalMutate(
      `/api/groups/${groupId}/settlements`, 
      (current: Settlement[] = []) => [optimisticSettlement, ...current], 
      false
    )
    
    const previousLedger = await globalMutate(
      `/api/groups/${groupId}/ledger`, 
      undefined, 
      false
    )
    
    try {
      const response = await fetch(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to record settlement')
      }
      
      const settlement = await response.json()
      
      // Update with real data
      await globalMutate(
        `/api/groups/${groupId}/settlements`, 
        (current: Settlement[] = []) => 
          current.map(s => s.id === optimisticSettlement.id ? settlement : s)
      )
      
      // Revalidate ledger
      await globalMutate(`/api/groups/${groupId}/ledger`)
      
      return settlement
    } catch (error) {
      // Rollback on error
      await globalMutate(`/api/groups/${groupId}/settlements`, previousSettlements, false)
      await globalMutate(`/api/groups/${groupId}/ledger`, previousLedger, false)
      throw error
    }
  }
}
