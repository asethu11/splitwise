import { v4 as uuidv4 } from 'uuid';

export function newInviteCode(len = 8) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => a[Math.floor(Math.random() * a.length)]).join('');
}

export function isUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function generateUuid(): string {
  return uuidv4();
}
