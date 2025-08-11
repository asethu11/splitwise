import useSWR, { mutate, useSWRConfig } from 'swr'
import { Group, Member, Expense, LedgerEntry, CreateGroupInput, AddMemberInput, CreateExpenseInput, CreateSettlementInput } from './types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Groups
export function useGroups() {
  return useSWR<Group[]>('/api/groups', fetcher)
}

export function useGroup(id: string) {
  return useSWR<Group>(`/api/groups/${id}`, fetcher)
}

export function useCreateGroup() {
  const { mutate: globalMutate } = useSWRConfig()
  
  return async (data: CreateGroupInput) => {
    // Optimistic update
    const optimisticGroup: Group = {
      id: `temp-${Date.now()}`,
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberships: [],
      expenses: [],
    }
    
    const previousData = await globalMutate('/api/groups', (current: Group[] = []) => [optimisticGroup, ...current], false)
    
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create group')
      }
      
      const group = await response.json()
      
      // Update with real data
      await globalMutate('/api/groups', (current: Group[] = []) => 
        current.map(g => g.id === optimisticGroup.id ? group : g)
      )
      
      return group
    } catch (error) {
      // Rollback on error
      await globalMutate('/api/groups', previousData, false)
      throw error
    }
  }
}

// Members
export function useMembers(groupId: string) {
  return useSWR<Member[]>(`/api/groups/${groupId}/members`, fetcher)
}

export function useAddMember() {
  const { mutate: globalMutate } = useSWRConfig()
  
  return async (groupId: string, data: AddMemberInput) => {
    // Optimistic update
    const optimisticMember: Member = {
      id: `temp-${Date.now()}`,
      userId: `temp-user-${Date.now()}`,
      groupId,
      role: 'member',
      joinedAt: new Date().toISOString(),
      user: {
        id: `temp-user-${Date.now()}`,
        name: data.name,
        email: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
    
    const previousData = await globalMutate(
      `/api/groups/${groupId}/members`, 
      (current: Member[] = []) => [...current, optimisticMember], 
      false
    )
    
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add member')
      }
      
      const member = await response.json()
      
      // Update with real data
      await globalMutate(
        `/api/groups/${groupId}/members`, 
        (current: Member[] = []) => 
          current.map(m => m.id === optimisticMember.id ? member : m)
      )
      
      return member
    } catch (error) {
      // Rollback on error
      await globalMutate(`/api/groups/${groupId}/members`, previousData, false)
      throw error
    }
  }
}

// Expenses
export function useExpenses(groupId: string) {
  return useSWR<Expense[]>(`/api/groups/${groupId}/expenses`, fetcher)
}

export function useCreateExpense() {
  const { mutate: globalMutate } = useSWRConfig()
  
  return async (groupId: string, data: CreateExpenseInput) => {
    // Optimistic update
    const optimisticExpense: Expense = {
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
        percentage: split.percentage || null,
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
      
      const expense = await response.json()
      
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
      (current: any[] = []) => [optimisticSettlement, ...current], 
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
        (current: any[] = []) => 
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
