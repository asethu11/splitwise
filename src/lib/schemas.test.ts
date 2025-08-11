import { describe, it, expect } from 'vitest'
import { createGroupSchema, createExpenseSchema } from './schemas'

describe('Zod Schemas', () => {
  describe('createGroupSchema', () => {
    it('should validate valid group data', () => {
      const validData = {
        name: 'Test Group',
        description: 'A test group',
      }

      const result = createGroupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        description: 'A test group',
      }

      const result = createGroupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createExpenseSchema', () => {
    it('should validate valid expense data', () => {
      const validData = {
        title: 'Dinner',
        amount: 100,
        currency: 'USD',
        date: new Date().toISOString(),
        paidById: 'user123',
        splitType: 'equal' as const,
        splits: [
          { userId: 'user1', amount: 50 },
          { userId: 'user2', amount: 50 },
        ],
      }

      const result = createExpenseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject negative amount', () => {
      const invalidData = {
        title: 'Dinner',
        amount: -100,
        currency: 'USD',
        date: new Date().toISOString(),
        paidById: 'user123',
        splitType: 'equal' as const,
        splits: [
          { userId: 'user1', amount: 50 },
          { userId: 'user2', amount: 50 },
        ],
      }

      const result = createExpenseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
