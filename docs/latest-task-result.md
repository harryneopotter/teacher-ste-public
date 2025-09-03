Summary of Changes:
Fixed: setup-webhook.sh script to work with Cloud Functions (2nd gen)
Change: Updated URL retrieval from value(httpsTrigger.url) to value(url)
Commit: 38bbb5c - "Fix setup-webhook.sh to work with Cloud Functions (2nd gen)"
Next Steps for Webhook Configuration:
Now that the fix is on GitHub, you can proceed with the webhook setup in Cloud Shell:

1. Pull the Latest Changes in Cloud Shell
# In your Cloud Shell, navigate to the bot directory
cd ~/tanya/functions/telegram-bot

# Pull the latest changes from GitHub
git pull origin main

bash


2. Run the Fixed Webhook Setup Script
# Make sure the script is executable
chmod +x setup-webhook.sh

# Run the webhook setup
./setup-webhook.sh

bash


3. Test the Bot
Once the webhook is configured successfully, you can test the bot by:

Finding your bot on Telegram (search for your bot username)
Sending /start command
Sending /help for available commands
Uploading a PDF file to test the showcase functionality
The webhook setup should now work correctly with the fixed URL retrieval method for 2nd generation Cloud Functions. Let me know when you've completed these steps and the outcome!