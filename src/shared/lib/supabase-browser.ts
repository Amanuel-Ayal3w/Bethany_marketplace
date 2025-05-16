import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/database.types';

export function getSupabaseBrowserClient() {
    return createClientComponentClient<Database>();
} 