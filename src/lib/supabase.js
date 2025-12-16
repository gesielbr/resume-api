const { createClient } = require('@supabase/supabase-js')

// Client com SERVICE ROLE (poder total - backend)
const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Client com ANON (respeita RLS)
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = {
  supabaseService,
  supabaseAnon
}
