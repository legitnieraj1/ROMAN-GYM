import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
}

/**
 * Public (anon) client — safe to use on the browser / in Server Components
 * that only need RLS-protected access.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,   // we manage sessions ourselves via JWT cookies
        autoRefreshToken: false,
    },
});

/**
 * Service-role (admin) client — bypasses RLS.
 * Only use in server-side code (API routes / Server Actions).
 * NEVER expose this key to the browser.
 */
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    })
    : null;
