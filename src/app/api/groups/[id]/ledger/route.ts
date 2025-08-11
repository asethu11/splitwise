import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const members = await prisma.membership.findMany({
      where: { groupId: id },
      include: {
        user: true,
      },
    })

    const expenses = await prisma.expense.findMany({
      where: { groupId: id },
      include: {
        paidBy: true,
        expenseSplits: {
          include: {
            user: true,
          },
        },
      },
    })

    // Calculate balances for each member
    const balances = members.map(member => {
      let balance = 0

      // Add expenses paid by this member
      expenses.forEach(expense => {
        if (expense.paidById === member.userId) {
          balance += expense.amount
        }
      })

      // Subtract expenses owed by this member
      expenses.forEach(expense => {
        const split = expense.expenseSplits.find(s => s.userId === member.userId)
        if (split) {
          balance -= split.amount
        }
      })

      return {
        userId: member.userId,
        userName: member.user.name,
        balance: Math.round(balance * 100) / 100,
      }
    })

    return NextResponse.json(balances)
  } catch (error) {
    console.error('Error calculating ledger:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
