import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Database types
export interface AnonUser {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface Expense {
  id: string;
  room_id: string;
  payer_id: string;
  description: string;
  amount_cents: number;
  splits_json: {
    method: 'equal' | 'shares' | 'exact';
    participants: Array<{
      user_id: string;
      shares?: number;
      cents?: number;
    }>;
  };
  created_at: string;
  updated_at: string;
}
