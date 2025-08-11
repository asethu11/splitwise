import { z } from 'zod'

// Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
})

export const addMemberSchema = z.object({
  name: z.string().min(1, 'Member name is required'),
})

// Expense schemas
export const expenseSplitSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().positive('Amount must be positive'),
  percentage: z.number().min(0).max(100).optional(),
})

export const createExpenseSchema = z.object({
  title: z.string().min(1, 'Expense title is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  date: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
  paidById: z.string().min(1, 'Paid by user ID is required'),
  splitType: z.enum(['equal', 'percentage', 'fixed']),
  splits: z.array(expenseSplitSchema).min(1, 'At least one split is required'),
})

// Settlement schema
export const createSettlementSchema = z.object({
  fromUserId: z.string().min(1, 'From user ID is required'),
  toUserId: z.string().min(1, 'To user ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  date: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
})

// Type exports
export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type AddMemberInput = z.infer<typeof addMemberSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>
