# Deployment Notes

## Environment Setup

**Google Cloud SDK is NOT installed locally. All GCP commands must be run from the Google Cloud Shell.**

This includes:
- Deploying Cloud Functions
- Managing Firestore, Storage, and Secret Manager
- Setting up credentials and service accounts
- Running `gcloud`, `gsutil`, and related CLI tools

If you attempt to run these commands locally without the SDK, you will encounter errors such as missing credentials or project ID. Always use the Cloud Shell for GCP operations.

For local testing, you may use Node.js scripts, but all cloud resource management must be done in the cloud shell.
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

---

## P1 Infrastructure Setup (Required for Production)

### Secret Manager Configuration
```bash
# Create secrets (if not already done)
gcloud secrets create telegram-bot-token --data-file=/dev/stdin <<< "YOUR_BOT_TOKEN"
gcloud secrets create gemini-api-key --data-file=/dev/stdin <<< "YOUR_GEMINI_KEY"

# Grant function service account access
gcloud secrets add-iam-policy-binding telegram-bot-token \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Cloud Run Environment Variables
Set these in Cloud Run service configuration:
- `TELEGRAM_BOT_TOKEN` → Secret Manager reference
- `TELEGRAM_ADMIN_USER_ID` → Your Telegram user ID
- `TELEGRAM_TEACHER_USER_ID` → Tanya's Telegram user ID
- `RECAPTCHA_SECRET_KEY` → reCAPTCHA secret key
- `GOOGLE_CLOUD_PROJECT` → `driven-bison-470218-v3`

### Storage Bucket Setup
```bash
# Create private PDFs bucket
gsutil mb -p driven-bison-470218-v3 gs://tanya-showcase-pdfs-private

# Create public thumbnails bucket
gsutil mb -p driven-bison-470218-v3 gs://tanya-showcase-thumbnails-public
gsutil iam ch allUsers:objectViewer gs://tanya-showcase-thumbnails-public

# Set CORS for thumbnails bucket
gsutil cors set cors-config.json gs://tanya-showcase-thumbnails-public
```

### IAM Roles for Function Service Account
```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe driven-bison-470218-v3 --format="value(projectNumber)")

# Grant necessary roles to function service account
gcloud projects add-iam-policy-binding driven-bison-470218-v3 \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding driven-bison-470218-v3 \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

### Webhook Setup
```bash
# Set webhook URL (replace with your actual function URL)
gcloud functions describe telegram-showcase-bot --format="value(httpsTrigger.url)"

# Set webhook with secret token
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "YOUR_FUNCTION_URL",
    "secret_token": "your_webhook_secret_token"
  }'
```

### Verification Steps
- ✅ Secrets created and accessible
- ✅ Environment variables configured
- ✅ Buckets created with correct permissions
- ✅ IAM roles assigned
- ✅ Webhook configured with secret token
- ✅ Function redeployed with new configuration