
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

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const { priceId } = await req.json()
    
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log(`Creating checkout session for user: ${user.id} with price: ${priceId}`)

    // Check if customer already exists in Stripe
    let customerId: string | undefined
    const existingCustomers = await stripe.customers.search({
      query: `metadata['supabase_uid']:'${user.id}'`,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
      console.log(`Found existing customer: ${customerId}`)
    } else {
      console.log('No existing customer found, will create during checkout')
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      customer_creation: customerId ? undefined : 'always',
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?canceled=true`,
      metadata: {
        supabase_uid: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_uid: user.id,
        },
      },
      customer_update: {
        name: 'auto',
      },
    })

    // If we created a new customer, update their metadata
    if (session.customer && !customerId) {
      await stripe.customers.update(session.customer as string, {
        metadata: {
          supabase_uid: user.id,
        },
      })
      console.log(`Updated customer metadata for: ${session.customer}`)
    }

    console.log(`Checkout session created: ${session.id}`)

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
