# Telegram Showcase Bot Setup

## Prerequisites
- ✅ Bot token already stored in Secret Manager
- ✅ GCP project configured
- ✅ Firestore and Storage buckets ready

## Step 1: Get Your Telegram User ID

1. **Navigate to the bot directory:**
   ```bash
   cd functions/telegram-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the setup script to get your user ID:**
   ```bash
   npm run setup
   ```

4. **Open Telegram and find your bot**
5. **Send any message to the bot**
6. **Copy your user ID from the console output**

## Step 2: Add Your User ID to the Bot

1. **Edit `index.js`** and find the `AUTHORIZED_USERS` object
2. **Add your user ID:**
   ```javascript
   const AUTHORIZED_USERS = {
     'YOUR_USER_ID_HERE': 'admin',  // Replace with your actual user ID
   };
   ```

## Step 3: Deploy the Cloud Function

1. **Make the deploy script executable:**
   ```bash
   chmod +x deploy.sh
   ```

2. **Deploy the function:**
   ```bash
   npm run deploy
   ```

3. **Copy the function URL from the output**

## Step 4: Set Up the Webhook

1. **Set the webhook using the function URL:**
   ```bash
   npm run webhook <FUNCTION_URL>
   ```

## Step 5: Test the Bot

1. **Send `/start` to your bot on Telegram**
2. **Try uploading a PDF file**
3. **Check the bot responds correctly**

## Bot Commands

- `/start` - Welcome message and instructions
- `/help` - Show help information
- `/list` - List all published showcase items
- `/status` - Check bot status
- **Send PDF** - Upload new student work

## Troubleshooting

- **Bot not responding**: Check Cloud Function logs
- **Permission denied**: Verify your user ID is in AUTHORIZED_USERS
- **File upload fails**: Check Storage bucket permissions
- **Webhook issues**: Verify the webhook URL is set correctly

## Files Overview

- `index.js` - Main bot logic
- `package.json` - Dependencies and scripts
- `deploy.sh` - Deployment script
- `setup-telegram.js` - Get user ID helper
- `set-webhook.js` - Webhook setup helper