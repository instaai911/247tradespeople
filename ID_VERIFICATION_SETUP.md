```markdown
# ID Verification Service Integration Setup

This guide will help you set up real ID verification using Yoti as the verification provider.

## Prerequisites

1.  **Yoti Account**: Sign up at [Yoti Hub](https://hub.yoti.com/)
2.  **Supabase Project**: Ensure your Supabase project is set up
3.  **Database Schema**: Make sure your users table has the verification fields

## Setup Steps

### Step 1: Get Yoti Credentials

1.  Sign up for a Yoti Hub account at [https://hub.yoti.com/](https://hub.yoti.com/)
2.  Create a new application within your Yoti Hub.
3.  Navigate to your application's settings to find:
    *   Your **Client SDK ID** (often referred to as Client ID)
    *   Generate and download your **Private Key** (a `.pem` file). Keep this file secure as it's essential for authenticating your API requests.
4.  Configure a webhook endpoint in your Yoti application settings. You will need a **Webhook Public Key** from Yoti for signature verification.

### Step 2: Configure Supabase Edge Functions Environment Variables

1.  In your Supabase Dashboard, go to **Edge Functions**.
2.  Set the following environment variables:
    ```
    YOTI_CLIENT_ID=your_yoti_client_id_here
    YOTI_PRIVATE_KEY=your_yoti_private_key_content_here # Paste the content of your .pem file here, including BEGIN/END markers
    YOTI_WEBHOOK_PUBLIC_KEY=your_yoti_webhook_public_key_here # Yoti's public key for webhook signature verification
    ```
    **Note**: For `YOTI_PRIVATE_KEY`, you need to copy the entire content of your downloaded `.pem` file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.

### Step 3: Deploy Edge Functions

The following Edge Functions have been created/updated for Yoti integration:

1.  **`yoti-id-verification`** - Handles verification submissions to Yoti
2.  **`yoti-id-verification-webhook`** - Processes Yoti webhooks

Deploy them using the Supabase CLI or through the dashboard.

### Step 4: Configure Webhook URL in Yoti Hub

In your Yoti Hub:

1.  Go to your application's **Webhooks** settings.
2.  Add a new webhook with URL: `https://your-project.supabase.co/functions/v1/yoti-id-verification-webhook`
3.  Configure the events you want to receive (e.g., `session.completion` for when a verification session is completed).
4.  Save the webhook.

### Step 5: Test the Integration

1.  Log in as a tradesperson in your app.
2.  Go to Profile > Verify Your ID.
3.  Upload test documents and selfie (use Yoti's test documents for sandbox/testing if available, or real documents for live testing).
4.  Submit the verification.
5.  Check the verification status updates in your app and in your Supabase `users` table.
6.  Monitor your Supabase Edge Function logs for `yoti-id-verification` and `yoti-id-verification-webhook` to ensure successful communication.

## Verification Flow

### Frontend Flow:
1.  User uploads documents and selfie within the app.
2.  Frontend calls `submitVerification()` function.
3.  Function sends data to the `yoti-id-verification` Edge Function.
4.  User sees "Verification Pending" status.

### Backend Flow (`yoti-id-verification`):
1.  Edge Function receives verification data.
2.  Authenticates with Yoti using the Client ID and Private Key.
3.  Sends document images and personal details to Yoti's API.
4.  Yoti processes the data and returns a session status.
5.  Edge Function updates user status to "pending" (or verified/rejected if Yoti provides immediate results).

### Webhook Flow (`yoti-id-verification-webhook`):
1.  Yoti processes documents (this can take time depending on the checks).
2.  Yoti sends a webhook to your configured endpoint when the session status changes (e.g., `session.completion`).
3.  Webhook function verifies the signature using Yoti's Public Key.
4.  Webhook function updates user verification status in your Supabase database.
5.  User sees updated status in their profile.

## Verification Statuses

-   **`pending`** - Documents submitted, awaiting Yoti review.
-   **`verified`** - Documents approved by Yoti, user is verified.
-   **`rejected`** - Documents rejected by Yoti, user needs to resubmit.

## Troubleshooting

### Common Issues:

1.  **"Yoti API credentials not configured"**
    *   Ensure environment variables are correctly set in Supabase Edge Functions.
    *   Double-check that the `YOTI_PRIVATE_KEY` content is copied exactly, including `BEGIN/END` markers.

2.  **"Yoti API call failed"**
    *   Verify your `YOTI_CLIENT_ID` and `YOTI_PRIVATE_KEY`.
    *   Check the Yoti API documentation for the exact endpoints and payload structure for the service you are using.
    *   Ensure your images are correctly base64 encoded and meet Yoti's size/format requirements.

3.  **"Webhook signature verification failed"**
    *   Ensure `YOTI_WEBHOOK_PUBLIC_KEY` is correctly set in your Supabase environment.
    *   Verify that the webhook secret in Yoti Hub matches the one used for verification.
    *   Check Yoti's documentation for precise webhook signature verification steps.

### Monitoring:

-   Monitor Supabase Edge Function logs for `yoti-id-verification` and `yoti-id-verification-webhook`.
-   Check your Yoti Hub dashboard for API usage and webhook delivery status.

## Support

-   **Yoti Developer Documentation**: [https://developer.yoti.com/](https://developer.yoti.com/)
-   **Yoti Support**: Available through their Hub.
-   **Supabase Support**: Available through their dashboard.
```