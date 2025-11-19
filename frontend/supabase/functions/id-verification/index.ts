import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.224.0/crypto/mod.ts';
import { encode } from 'https://deno.land/std@0.224.0/encoding/base64.ts';
import { SignJWT } from 'https://deno.land/x/jose@v4.15.5/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VerificationRequest {
  userId: string
  documentType: string
  frontImageBase64: string
  backImageBase64?: string
  selfieImageBase64: string
  personalDetails: {
    firstName: string
    lastName: string
    dateOfBirth: string
    address: string
    postcode: string
  }
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

    // Get Yoti API credentials from environment
    const yotiClientId = Deno.env.get('YOTI_CLIENT_ID')
    const yotiPrivateKey = Deno.env.get('YOTI_PRIVATE_KEY') // PEM formatted private key

    if (!yotiClientId || !yotiPrivateKey) {
      throw new Error('Yoti API credentials not configured')
    }

    const { userId, documentType, frontImageBase64, backImageBase64, selfieImageBase64, personalDetails }: VerificationRequest = await req.json()

    // --- Yoti API Integration (Conceptual) ---
    // This section demonstrates how you would interact with the Yoti API.
    // Yoti's primary Doc Scan flow often involves creating a session and redirecting the user.
    // For direct image submission, you would typically use their Document Capture API or similar.
    // The exact API endpoints and payload structure will depend on the specific Yoti product you are using.

    // Example: Prepare a signed request for Yoti (simplified for demonstration)
    // In a real scenario, you would use a Yoti SDK or implement their signing algorithm precisely.
    // Yoti's signing involves concatenating method, path, query, and body, then SHA256withRSA signing.
    // For Deno, you might need a more robust RSA signing library.
    
    const yotiApiBaseUrl = 'https://api.yoti.com/idv/v1'; // Example Yoti IDV API base URL
    const endpoint = '/sessions'; // Example endpoint for creating a session or submitting documents

    // This is a placeholder for actual Yoti API interaction.
    // You would typically create a session, then upload documents/selfies to that session.
    // The \`frontImageBase64`, `backImageBase64`, `selfieImageBase64\` would be sent as part of the session's media.

    // Mock Yoti API call for demonstration purposes
    console.log('Simulating Yoti API call...');
    const yotiResponse = {
      sessionId: 'yoti_session_' + Date.now(),
      status: 'PENDING', // Yoti might return PENDING, COMPLETED, FAILED etc.
      checks: [
        { type: 'DOCUMENT_AUTHENTICITY', result: 'PENDING' },
        { type: 'FACIAL_SIMILARITY', result: 'PENDING' }
      ]
    };

    // In a real integration, you would make actual fetch requests to Yoti here:
    /*
    const body = JSON.stringify({
      // Yoti specific payload for document and selfie submission
      // This would involve base64 images and personal details
      // Example:
      client_session_token_ttl: 600, // seconds
      resources_ttl: 86700, // seconds
      user_tracking_id: userId,
      // ... other Yoti specific parameters
      // You might need to upload images separately after session creation
    });

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      new TextEncoder().encode(yotiPrivateKey),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await sign(
      new TextEncoder().encode(body),
      privateKey,
      { alg: "RS256" }
    );

    const headers = {
      'X-Yoti-Auth-Id': yotiClientId,
      'X-Yoti-Auth-Digest': signature, // This is a simplified digest, Yoti's is more complex
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const response = await fetch(\`${yotiApiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(\`Yoti API call failed: ${response.status} ${response.statusText}`);
    }
    const yotiResponse = await response.json();
    */

    // --- End Yoti API Integration ---

    // Update user in database with verification data
    // Map Yoti's status to your internal verification_status
    let verificationStatus: 'pending' | 'verified' | 'rejected' = 'pending';
    let isVerified = false;

    if (yotiResponse.status === 'COMPLETED') {
      // You would analyze Yoti's check results here to determine final status
      // For example, if all required checks passed:
      const documentCheckPassed = yotiResponse.checks.some((c: any) => c.type === 'DOCUMENT_AUTHENTICITY' && c.result === 'PASS');
      const facialSimilarityPassed = yotiResponse.checks.some((c: any) => c.type === 'FACIAL_SIMILARITY' && c.result === 'PASS');

      if (documentCheckPassed && facialSimilarityPassed) {
        verificationStatus = 'verified';
        isVerified = true;
      } else {
        verificationStatus = 'rejected';
      }
    } else if (yotiResponse.status === 'FAILED') {
      verificationStatus = 'rejected';
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_status: verificationStatus,
        verified: isVerified,
        verification_data: {
          provider: 'yoti',
          sessionId: yotiResponse.sessionId,
          yotiStatus: yotiResponse.status,
          submittedAt: new Date().toISOString(),
          // Store more details from Yoti response if needed
        }
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Failed to update user verification status: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification submitted to Yoti successfully',
        sessionId: yotiResponse.sessionId,
        status: verificationStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Yoti ID Verification Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred during Yoti verification submission'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})