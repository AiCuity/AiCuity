
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
    console.log('Starting checkout session creation...')

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Authenticating user...')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Authentication failed:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    console.log(`User authenticated: ${user.id}, email: ${user.email}`)

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const { priceId } = requestBody
    
    if (!priceId) {
      console.error('Price ID is missing from request')
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
    try {
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
    } catch (customerError) {
      console.error('Error searching for existing customer:', customerError)
      // Continue without existing customer - will create new one
    }

    // Create checkout session configuration
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        supabase_uid: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_uid: user.id,
        },
      },
    }

    // Add customer information based on whether we have an existing customer
    if (customerId) {
      sessionConfig.customer = customerId
    } else {
      sessionConfig.customer_email = user.email || undefined
    }

    console.log('Creating Stripe checkout session...')
    
    let session
    try {
      session = await stripe.checkout.sessions.create(sessionConfig)
      console.log(`Checkout session created successfully: ${session.id}`)
    } catch (stripeError) {
      console.error('Stripe checkout session creation failed:', stripeError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create checkout session',
          details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Update customer metadata if we created a new customer
    if (session.customer && !customerId) {
      try {
        await stripe.customers.update(session.customer as string, {
          metadata: {
            supabase_uid: user.id,
          },
        })
        console.log(`Updated customer metadata for: ${session.customer}`)
      } catch (updateError) {
        console.error('Failed to update customer metadata:', updateError)
        // Don't fail the request for this, just log the error
      }
    }

    if (!session.url) {
      console.error('Checkout session created but no URL returned')
      return new Response(
        JSON.stringify({ error: 'Failed to generate checkout URL' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log('Checkout session completed successfully')
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Unexpected error in checkout function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
