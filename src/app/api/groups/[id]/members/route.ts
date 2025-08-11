import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMemberSchema } from '@/lib/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberships = await prisma.membership.findMany({
      where: { groupId: params.id },
      include: {
        user: true,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    })

    return NextResponse.json(memberships)
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = addMemberSchema.parse(body)

    // First create the user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
      },
    })

    // Then add them to the group
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        groupId: params.id,
        role: 'member',
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({ success: true, data: membership }, { status: 201 })
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
