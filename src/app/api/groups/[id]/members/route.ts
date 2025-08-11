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
      orderBy: {
        joinedAt: 'asc',
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
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

    // Check if user is already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: body.userId,
          groupId: id,
        },
      },
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      )
    }

    const membership = await prisma.membership.create({
      data: {
        userId: body.userId,
        groupId: id,
        role: body.role || 'member',
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({ success: true, data: membership }, { status: 201 })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
