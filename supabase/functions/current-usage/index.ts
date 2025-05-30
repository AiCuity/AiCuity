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

    // Get current month usage from the new usage_tracking table
    const currentMonthYear = new Date().toISOString().slice(0, 7) // Format: "2024-01"
    
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('count')
      .eq('user_id', uid)
      .eq('month_year', currentMonthYear)
      .maybeSingle()

    if (error) {
      console.error('Error getting usage:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to get usage count' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const count = data?.count || 0
    console.log(`Current month usage count: ${count}`)

    return new Response(
      JSON.stringify({ 
        count,
        month_year: currentMonthYear 
      }),
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
