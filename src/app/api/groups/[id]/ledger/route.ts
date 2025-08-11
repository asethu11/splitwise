import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get group with members
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      )
    }

    // Get all expenses for the group
    const expenses = await prisma.expense.findMany({
      where: { groupId: params.id },
      include: {
        paidBy: true,
        expenseSplits: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    // Get all settlements for the group
    const settlements = await prisma.settlement.findMany({
      where: { groupId: params.id },
      include: {
        fromUser: true,
        toUser: true,
      },
      orderBy: { date: 'desc' },
    })

    // Calculate balances for each member
    const ledgerEntries = group.memberships.map(membership => {
      const userId = membership.user.id
      let totalPaid = 0
      let totalOwed = 0

      // Calculate what they paid
      expenses.forEach(expense => {
        if (expense.paidById === userId) {
          totalPaid += expense.amount
        }
      })

      // Calculate what they owe
      expenses.forEach(expense => {
        const split = expense.expenseSplits.find(s => s.userId === userId)
        if (split) {
          totalOwed += split.amount
        }
      })

      // Calculate net amount (what they paid - what they owe)
      const netAmount = totalPaid - totalOwed

      return {
        userId: membership.user.id,
        userName: membership.user.name,
        netAmount: Math.round(netAmount * 100) / 100, // Round to 2 decimal places
        totalPaid: Math.round(totalPaid * 100) / 100, // Round to 2 decimal places
        totalOwed: Math.round(totalOwed * 100) / 100, // Round to 2 decimal places
      }
    })

    return NextResponse.json(ledgerEntries)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
