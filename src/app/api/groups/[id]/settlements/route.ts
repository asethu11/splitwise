import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSettlementSchema } from '@/lib/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const settlements = await prisma.settlement.findMany({
      where: { groupId: params.id },
      include: {
        fromUser: true,
        toUser: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(settlements)
  } catch (error) {
    console.error('Error fetching settlements:', error)
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
    const validatedData = createSettlementSchema.parse(body)

    const settlement = await prisma.settlement.create({
      data: {
        fromUserId: validatedData.fromUserId,
        toUserId: validatedData.toUserId,
        groupId: params.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        date: new Date(validatedData.date),
        notes: validatedData.notes,
      },
      include: {
        fromUser: true,
        toUser: true,
      },
    })

    return NextResponse.json({ success: true, data: settlement }, { status: 201 })
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
