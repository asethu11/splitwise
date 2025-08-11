import { cookies } from 'next/headers';

export async function getMemberId() {
  const cookieStore = await cookies();
  return cookieStore.get('member_id')?.value ?? null;
}

export async function setMemberId(id: string) {
  const cookieStore = await cookies();
  cookieStore.set('member_id', id, {
    httpOnly: true, 
    sameSite: 'lax', 
    path: '/', 
    maxAge: 60 * 60 * 24 * 365
  });
}
