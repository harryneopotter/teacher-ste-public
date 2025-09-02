# Deployment Notes & Action Items

## Important Setup Information

**Admin Environment**: All `gcloud` commands must be run in **Google Cloud Shell**, not locally.

**Current Status**:
- ✅ TypeScript build errors fixed
- ✅ Docker build working
- ✅ Cloud Run deployment config fixed (removed PORT env var)
- 🔄 Waiting for current deployment to complete

## Cloud Shell Commands Needed

### 1. Monitor Current Deployment
```bash
# Check if current build succeeded
gcloud builds list --limit=3

# If successful, check domain mapping
gcloud beta run domain-mappings list --platform=managed
```

### 2. Set Up Firestore Security Rules (After deployment succeeds)
```bash
# Deploy Firestore rules
gcloud firestore deploy --rules=firestore.rules

# Initialize collections with sample data
# (Will provide specific commands once ready)
```

### 3. Create Cloud Function for Telegram Bot
```bash
# Deploy bot function (commands will be provided)
gcloud functions deploy telegram-showcase-bot \
  --runtime nodejs18 \
  --trigger http \
  --memory 512MB \
  --timeout 540s \
  --set-env-vars GOOGLE_CLOUD_PROJECT=driven-bison-470218-v3
```

### 4. Configure Storage Bucket CORS
```bash
# Apply CORS configuration for web access
gsutil cors set cors-config.json gs://tanya-showcase-thumbnails-public
```

## Files to Create (My Tasks)

1. `firestore.rules` - Database security rules ✅
2. `cors-config.json` - Storage bucket CORS configuration
3. `bot/index.js` - Telegram bot Cloud Function
4. `bot/package.json` - Bot dependencies
5. API endpoints for dynamic content

## Next Steps Workflow

1. **Wait for current deployment** to complete
2. **You run Cloud Shell commands** for infrastructure setup
3. **I create the bot code** and API endpoints
4. **You deploy the bot function** via Cloud Shell
5. **Test the complete system**

## Current Project Details

- **Project ID**: `driven-bison-470218-v3`
- **Region**: `us-central1`
- **Domain**: `tanyasprogram.com` (Cloudflare managed)
- **Secrets**: `gemini-api-key`, `telegram-bot-token` already configured
- **Buckets**: All storage buckets already created

## Telegram Bot Information Needed

- **Teacher Telegram User ID**: (Need to get this)
- **Admin Telegram User ID**: (Your Telegram user ID)
- **Bot Username**: (From @BotFather when bot was created)

Would you like me to proceed with creating the bot code and API endpoints while we wait for the deployment?