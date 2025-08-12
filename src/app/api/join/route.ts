import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getMemberId, setMemberId } from '@/lib/cookies';

const Body = z.object({
  inviteCode: z.string().min(4),
  displayName: z.string().min(1).max(40)
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const { inviteCode, displayName } = Body.parse(json);

  const group = await prisma.group.findUnique({
    where: { inviteCode: inviteCode },
    select: { id: true }
  });

  if (!group) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });

  let memberId = await getMemberId();
  let newUserId: string | null = null;

  try {
    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // If no memberId exists or if the user doesn't exist, create a new user
      if (!memberId) {
        const user = await tx.user.create({
          data: { name: displayName },
          select: { id: true }
        });
        memberId = user.id;
        newUserId = user.id;
      } else {
        // Check if the user exists
        const existingUser = await tx.user.findUnique({
          where: { id: memberId },
          select: { id: true }
        });
        
        if (!existingUser) {
          // User doesn't exist, create a new one
          const user = await tx.user.create({
            data: { name: displayName },
            select: { id: true }
          });
          memberId = user.id;
          newUserId = user.id;
        }
      }

      // Check if membership already exists
      const existingMembership = await tx.membership.findUnique({
        where: {
          userId_groupId: {
            userId: memberId,
            groupId: group.id
          }
        }
      });

      // Create membership if it doesn't exist
      if (!existingMembership) {
        await tx.membership.create({
          data: {
            userId: memberId,
            groupId: group.id,
            role: 'member'
          }
        });
      }

      return { memberId, groupId: group.id };
    });

    // Set the member ID cookie outside the transaction if a new user was created
    if (newUserId) {
      await setMemberId(newUserId);
    }

    return NextResponse.json({ roomId: result.groupId });
  } catch (error) {
    console.error('Join transaction error:', error);
    return NextResponse.json({ error: 'Join failed' }, { status: 500 });
  }
}
