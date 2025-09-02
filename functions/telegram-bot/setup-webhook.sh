#!/bin/bash

# Setup Telegram webhook for the deployed Cloud Function
# Run this in Google Cloud Shell after deploying the function

PROJECT_ID="driven-bison-470218-v3"
FUNCTION_NAME="telegram-showcase-bot"
REGION="us-central1"

echo "🔗 Setting up Telegram webhook..."

# Get the function URL
FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(httpsTrigger.url)")

if [ -z "$FUNCTION_URL" ]; then
    echo "❌ Could not get function URL. Make sure the function is deployed."
    exit 1
fi

echo "📡 Function URL: $FUNCTION_URL"

# Get bot token from Secret Manager
echo "🔑 Getting bot token from Secret Manager..."
BOT_TOKEN=$(gcloud secrets versions access latest --secret="telegram-bot-token")

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Could not get bot token from Secret Manager."
    exit 1
fi

# Set the webhook
echo "🚀 Setting webhook..."
WEBHOOK_URL="https://api.telegram.org/bot${BOT_TOKEN}/setWebhook"

RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$FUNCTION_URL\"}")

echo "📋 Telegram API Response:"
echo "$RESPONSE"

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook set successfully!"
    echo "🎉 Your bot is now ready to receive messages!"
    echo ""
    echo "📱 Test it by:"
    echo "1. Finding your bot on Telegram"
    echo "2. Sending /start"
    echo "3. Uploading a PDF file"
else
    echo "❌ Failed to set webhook. Check the response above."
    exit 1
fi