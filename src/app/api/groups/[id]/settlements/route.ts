import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const settlements = await prisma.settlement.findMany({
      where: { groupId: id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const settlement = await prisma.settlement.create({
      data: {
        fromUserId: body.fromUserId,
        toUserId: body.toUserId,
        groupId: id,
        amount: body.amount,
        currency: body.currency || 'USD',
        date: new Date(body.date),
        notes: body.notes,
      },
      include: {
        fromUser: true,
        toUser: true,
      },
    })

    return NextResponse.json({ success: true, data: settlement }, { status: 201 })
  } catch (error) {
    console.error('Error creating settlement:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
