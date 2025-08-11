import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { inviteCode: true, name: true }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      inviteCode: group.inviteCode,
      groupName: group.name
    })
  } catch (error) {
    console.error('Error fetching invite code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
