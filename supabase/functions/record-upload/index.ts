
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

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

    console.log(`Recording upload for user: ${uid}`)
    
    try {
      // 1️⃣ Map Supabase UID → Stripe customer
      const customers = await stripe.customers.search({
        query: `metadata['supabase_uid']:'${uid}'`,
      })

      const customer = customers.data[0]
      if (!customer) {
        console.log('Stripe customer not found. User may not have subscribed yet.')
        return new Response(
          JSON.stringify({ success: true, message: 'Upload recorded (no Stripe customer found)' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      // 2️⃣ Find active subscription & price
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      })

      const subscription = subscriptions.data[0]
      if (!subscription) {
        console.log('No active subscription found for customer')
        return new Response(
          JSON.stringify({ success: true, message: 'Upload recorded (no active subscription)' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      const subscriptionItem = subscription.items.data[0]
      if (!subscriptionItem) {
        throw new Error('No subscription item found')
      }

      // 3️⃣ Create usage record (+1 upload)
      await stripe.usageRecords.create(subscriptionItem.id, {
        quantity: 1,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      })

      console.log(`Usage record created for customer ${customer.id}`)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Upload recorded and usage tracked in Stripe' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      // Still return success for the upload, but log the Stripe issue
      return new Response(
        JSON.stringify({ success: true, message: 'Upload recorded (Stripe tracking failed)', error: stripeError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
  } catch (error) {
    console.error('Error recording upload:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
