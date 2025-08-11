import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createGroupSchema } from '@/lib/schemas'
import { newInviteCode } from '@/lib/ids'

const createGroupWithUserSchema = createGroupSchema.extend({
  userName: z.string().min(1, 'User name is required'),
})

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
        expenses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createGroupWithUserSchema.parse(body)

    // Create user and group in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: validatedData.userName,
        },
      })

      // Create group with invite code
      const group = await tx.group.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          inviteCode: newInviteCode(),
        },
      })

      // Add user as member with admin role
      await tx.membership.create({
        data: {
          userId: user.id,
          groupId: group.id,
          role: 'admin',
        },
      })

      return { user, group }
    })

    return NextResponse.json({ 
      success: true, 
      data: result.group,
      user: result.user 
    }, { status: 201 })
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
