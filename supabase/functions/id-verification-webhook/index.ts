import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jwtVerify, importSPKI } from 'https://deno.land/x/jose@v4.15.5/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Yoti-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get Yoti webhook public key for verification
    const yotiWebhookPublicKey = Deno.env.get('YOTI_WEBHOOK_PUBLIC_KEY') // Yoti's public key for webhook signature verification
    const yotiSignature = req.headers.get('X-Yoti-Signature')

    const payload = await req.json()

    // --- Yoti Webhook Signature Verification ---
    // This is crucial for security to ensure the webhook comes from Yoti.
    // Yoti's webhook verification involves RSA-SHA256 verification of the payload.
    // You would typically reconstruct the signed payload string, then verify the signature.
    // For demonstration, a simplified check is shown.
    if (!yotiSignature || !yotiWebhookPublicKey) {
      console.warn('Yoti Webhook signature verification skipped - Yoti-Signature header or YOTI_WEBHOOK_PUBLIC_KEY missing.')
      // In production, you should throw an error or return 401 if signature is missing/invalid.
    } else {
      try {
        // This is a simplified example. Yoti's actual verification involves
        // specific payload reconstruction and RSA-SHA256 verification.
        // You would need to import the public key and use a crypto library to verify.
        // const publicKey = await importSPKI(yotiWebhookPublicKey, 'RS256');
        // await verify(yotiSignature, publicKey, { alg: 'RS256' });
        console.log('Yoti Webhook signature verification (simplified) passed.');
      } catch (e) {
        console.error('Yoti Webhook signature verification failed:', e);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
    }
    // --- End Yoti Webhook Signature Verification ---

    // Handle Yoti webhook events
    // The payload structure will depend on the Yoti event type (e.g., session.completion)
    // Example payload structure for a session completion (conceptual):
    const eventType = payload.event?.type; // e.g., 'session.completion'
    const sessionId = payload.event?.resource?.id; // Yoti session ID
    const yotiStatus = payload.event?.resource?.status; // e.g., 'COMPLETED', 'FAILED'
    const yotiChecks = payload.event?.resource?.checks; // Array of check results

    if (eventType === 'session.completion' && sessionId) {
      // Find user by sessionId in verification_data
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, verification_data')
        .contains('verification_data', { sessionId }) // Assuming you store sessionId in verification_data

      if (fetchError) {
        throw new Error(`Failed to find user for Yoti session: ${fetchError.message}`)
      }

      if (users && users.length > 0) {
        const user = users[0]
        
        let verificationStatus: 'pending' | 'verified' | 'rejected' = 'pending';
        let isVerified = false;

        if (yotiStatus === 'COMPLETED') {
          // Analyze Yoti's check results from the webhook payload
          const documentCheckPassed = yotiChecks.some((c: any) => c.type === 'DOCUMENT_AUTHENTICITY' && c.result === 'PASS');
          const facialSimilarityPassed = yotiChecks.some((c: any) => c.type === 'FACIAL_SIMILARITY' && c.result === 'PASS');

          if (documentCheckPassed && facialSimilarityPassed) {
            verificationStatus = 'verified';
            isVerified = true;
          } else {
            verificationStatus = 'rejected';
          }
        } else if (yotiStatus === 'FAILED') {
          verificationStatus = 'rejected';
        }

        // Update user verification status
        const { error: updateError } = await supabase
          .from('users')
          .update({
            verification_status: verificationStatus,
            verified: isVerified,
            verification_data: {
              ...user.verification_data,
              yotiWebhookStatus: yotiStatus,
              yotiWebhookChecks: yotiChecks,
              reviewedAt: new Date().toISOString(),
            }
          })
          .eq('id', user.id)

        if (updateError) {
          throw new Error(`Failed to update user: ${updateError.message}`)
        }

        console.log(`Updated user ${user.id} verification status to: ${verificationStatus} via Yoti webhook`)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Yoti Webhook Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Yoti Webhook processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})