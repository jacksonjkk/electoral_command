// Supabase Edge Function: Election Scheduler
// This function runs on a schedule to auto-transition election states
// Configure as: cron(0 * * * *) - runs every hour

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function handleScheduledElections() {
  try {
    const now = new Date()

    // 1. Activate scheduled elections that have reached their start time
    const { error: activateError } = await supabase
      .from('elections')
      .update({ status: 'active' })
      .eq('status', 'scheduled')
      .lte('start_time', now.toISOString())
      .gt('end_time', now.toISOString())

    if (activateError) {
      console.error('Error activating elections:', activateError)
    } else {
      console.log('✓ Activated scheduled elections')
    }

    // 2. Close elections that have passed their end time
    const { error: closeError } = await supabase
      .from('elections')
      .update({ status: 'closed' })
      .neq('status', 'closed')
      .lt('end_time', now.toISOString())

    if (closeError) {
      console.error('Error closing elections:', closeError)
    } else {
      console.log('✓ Closed ended elections')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Election scheduler completed successfully',
        timestamp: now.toISOString(),
      }),
    }
  } catch (error) {
    console.error('Scheduler error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

// Handle the edge function request
Deno.serve(handleScheduledElections)
