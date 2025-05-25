
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { uid } = await req.json()
    
    if (!uid) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log(`Getting current month usage for user: ${uid}`)

    // Count uploads from this month in reading_history table
    // Using created_at since that's when the upload/reading session was created
    const { data, error } = await supabase
      .from('reading_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString())

    if (error) {
      console.error('Error counting usage:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to get usage count' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const count = data?.length || 0
    console.log(`Current month usage count: ${count}`)

    return new Response(
      JSON.stringify({ count }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in current-usage function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
