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

  if (!memberId) {
    const user = await prisma.user.create({
      data: { name: displayName },
      select: { id: true }
    });
    memberId = user.id;
    await setMemberId(user.id);
  }

  try {
    await prisma.membership.upsert({
      where: {
        userId_groupId: {
          userId: memberId,
          groupId: group.id
        }
      },
      update: {},
      create: {
        userId: memberId,
        groupId: group.id,
        role: 'member'
      }
    });
  } catch (error) {
    console.error('Membership upsert error:', error);
    return NextResponse.json({ error: 'Join failed' }, { status: 500 });
  }

  return NextResponse.json({ roomId: group.id });
}
