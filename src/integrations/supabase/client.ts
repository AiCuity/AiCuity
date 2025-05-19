
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://syykisxxasxonnhnusts.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWtpc3h4YXN4b25uaG51c3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MzU5MzcsImV4cCI6MjA2MzIxMTkzN30.qXgcUbTkAT-xR6zwJweTGwTEt56fd76PB0UCyuFS0UM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
