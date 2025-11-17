const { createClient } = require("@supabase/supabase-js");

/**
 * On the server we should use the service role key to bypass RLS for trusted actions
 * (like uploading on behalf of an authenticated app user). Fallback to anon key if
 * service key is not provided.
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

module.exports = supabase;
