# Debug Context for Telegram Bot Webhook Issue

## Error Details:
- **Issue**: Webhook setup script (`setup-webhook.sh`) failed to retrieve the Cloud Function URL.
- **Error Message**: `❌ Could not get function URL. Make sure the function is deployed.`
- **Observation**: The `gcloud functions describe` command output shows `state: ACTIVE` and a top-level `url` field, but the `setup-webhook.sh` script is attempting to extract `httpsTrigger.url`. This indicates a discrepancy in how the URL is exposed for 2nd generation Cloud Functions (GEN_2).

## Current Chat Context:
- **Task**: Deploying Telegram bot Cloud Function to GCP Cloud Shell.
- **File Location**: Bot files are located in `~/tanya/functions/telegram-bot/` in Cloud Shell.
- **Previous Fixes**:
    - Frontend thumbnail issue resolved by replacing Next.js Image component with standard `<img>` tag in `app/page.tsx`.
    - Deployment command corrected from `--trigger=http` to `--trigger-http`.
- **Next Step**: The immediate priority is to fix the `setup-webhook.sh` script to correctly retrieve the function URL for 2nd generation Cloud Functions.

## Proposed Solution:
Modify `setup-webhook.sh` to use `gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(url)"` instead of `value(httpsTrigger.url)` to correctly extract the function URL.