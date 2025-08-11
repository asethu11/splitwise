// API response types
export interface Group {
  id: string
  name: string
  description?: string
  inviteCode: string
  createdAt: string
  updatedAt: string
  memberships?: Membership[]
  expenses?: Expense[]
  settlements?: Settlement[]
}

export interface User {
  id: string
  name: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface Membership {
  id: string
  userId: string
  groupId: string
  role: string
  joinedAt: string
  user: User
}

export interface Expense {
  id: string
  title: string
  amount: number
  currency: string
  date: string
  notes?: string
  paidById: string
  groupId: string
  splitType: 'equal' | 'percentage' | 'fixed'
  createdAt: string
  updatedAt: string
  paidBy: User
  expenseSplits: ExpenseSplit[]
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  userId: string
  amount: number
  percentage?: number
  isPaid: boolean
  user: User
}

export interface Settlement {
  id: string
  fromUserId: string
  toUserId: string
  groupId: string
  amount: number
  currency: string
  date: string
  notes?: string
  createdAt: string
  fromUser: User
  toUser: User
}

export interface LedgerEntry {
  userId: string
  userName: string
  balance: number
}

export interface Transfer {
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  amount: number
}
