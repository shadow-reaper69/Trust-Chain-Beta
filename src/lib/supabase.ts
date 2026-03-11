import { createClient } from '@supabase/supabase-js'

// Default fallbacks injected for the hackathon / development purposes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgyyylfwzqlfezsqnxug.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neXl5bGZ3enFsZmV6c3FueHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTY4MjUsImV4cCI6MjA4ODczMjgyNX0.LmAhiKhO7UgmlrBsDmldxRRMoLZwGJOscxnR11JM7uw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
