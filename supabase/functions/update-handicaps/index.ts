
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Loading update-handicaps function')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fetching all users with rounds')

    // Get all users who have rounds
    const { data: usersWithRounds, error: usersError } = await supabaseClient
      .from('rounds')
      .select('user_id')
      .distinct()

    if (usersError) throw usersError

    console.log(`Found ${usersWithRounds.length} users with rounds`)

    const updates = []

    // Process each user
    for (const { user_id } of usersWithRounds) {
      // Get all rounds for this user
      const { data: userRounds, error: roundsError } = await supabaseClient
        .from('rounds')
        .select('gross_score, holes_played')
        .eq('user_id', user_id)
        .order('date', { ascending: false })

      if (roundsError) {
        console.error(`Error fetching rounds for user ${user_id}:`, roundsError)
        continue
      }

      // Extract scores and hole counts
      const scores = userRounds.map(r => r.gross_score)
      const holeCounts = userRounds.map(r => r.holes_played || 18)

      // Calculate new handicap
      const { data: { handicap_calculator: { calculateHandicapIndex } } } = await supabaseClient
        .rpc('calculate_handicap_index', {
          _scores: scores,
          _hole_counts: holeCounts
        })

      // Update user's handicap
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ handicap: calculateHandicapIndex })
        .eq('id', user_id)

      if (updateError) {
        console.error(`Error updating handicap for user ${user_id}:`, updateError)
        continue
      }

      updates.push({ user_id, oldScores: scores, newHandicap: calculateHandicapIndex })
    }

    console.log('Handicap updates complete:', updates)

    return new Response(
      JSON.stringify({ success: true, updates }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in update-handicaps function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
