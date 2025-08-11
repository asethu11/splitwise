import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createExpenseSchema } from '@/lib/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = createExpenseSchema.parse(body)

    // Validate that the total splits match the expense amount
    const totalSplits = validatedData.splits.reduce((sum, split) => sum + split.amount, 0)
    if (Math.abs(totalSplits - validatedData.amount) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Total splits must equal expense amount' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        currency: validatedData.currency,
        date: new Date(validatedData.date),
        notes: validatedData.notes,
        paidById: validatedData.paidById,
        groupId: params.id,
        splitType: validatedData.splitType,
        expenseSplits: {
          create: validatedData.splits.map(split => ({
            userId: split.userId,
            amount: split.amount,
            percentage: split.percentage,
          })),
        },
      },
      include: {
        paidBy: true,
        expenseSplits: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: expense }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
