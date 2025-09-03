# Remaining GCP Setup Tasks

## Current Status: ✅ Completed
- GitHub OAuth authorization
- Build trigger creation
- Project setup, APIs, IAM, Storage, Firestore basics

---

## 🔵 CLOUD SHELL TASKS (Do these next)

### 1. Add Gemini API Key to Secret Manager
```bash
# First, get your new Gemini API key from: https://aistudio.google.com/app/apikey

# Add the new API key (replace YOUR_NEW_API_KEY with actual key)
echo -n "YOUR_NEW_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:cloud-run-sa@driven-bison-470218-v3.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Verify the secret was created
gcloud secrets versions list gemini-api-key
```

### 2. Update CORS Configuration (with final domain)
```bash
# Apply the updated CORS config to your storage bucket
gsutil cors set cors-config.json gs://tanya-showcase-thumbnails-public

# Verify CORS was applied
gsutil cors get gs://tanya-showcase-thumbnails-public
```

### 3. Initial Cloud Run Deployment
```bash
# Deploy initial version (this will create the service)
gcloud run deploy tanya-showcase \
  --image=gcr.io/cloud-builders/gcloud \
  --region=us-central1 \
  --platform=managed \
  --service-account=cloud-run-sa@driven-bison-470218-v3.iam.gserviceaccount.com \
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=driven-bison-470218-v3" \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --timeout=300

# Note: This creates the service. The actual app will be deployed via Cloud Build later
```

### 4. Set Up Custom Domain
```bash
# Map your custom domain to Cloud Run
gcloud run domain-mappings create \
  --service=tanya-showcase \
  --domain=tanyasprogram.com \
  --region=us-central1

# This will give you DNS records to configure with your domain provider
gcloud run domain-mappings describe tanyasprogram.com --region=us-central1
```

### 5. Create Telegram Bot (Optional - if you want notifications)
```bash
# First, create a Telegram bot:
# 1. Message @BotFather on Telegram
# 2. Send: /newbot
# 3. Follow instructions to get bot token

# Then add the token to Secret Manager (replace YOUR_BOT_TOKEN)
echo -n "YOUR_BOT_TOKEN" | gcloud secrets versions add telegram-bot-token --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding telegram-bot-token \
  --member="serviceAccount:cloud-run-sa@driven-bison-470218-v3.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6. Set Up Basic Monitoring
```bash
# Create uptime check for your domain
gcloud monitoring uptime create \
  --display-name="Tanya's Program Website" \
  --http-check-path="/" \
  --http-check-port=443 \
  --http-check-use-ssl \
  --monitored-resource-type="uptime_url" \
  --monitored-resource-labels="host=tanyasprogram.com"
```

### 7. Set Up Billing Alert
```bash
# Create budget alert (adjust amount as needed)
gcloud billing budgets create \
  --billing-account=$(gcloud billing accounts list --format="value(name)" --limit=1) \
  --display-name="Tanya Program Budget" \
  --budget-amount=25USD \
  --threshold-rule=percent=50,basis=CURRENT_SPEND \
  --threshold-rule=percent=90,basis=CURRENT_SPEND \
  --threshold-rule=percent=100,basis=CURRENT_SPEND
```

---

## 🟢 LOCAL TASKS (Do these after Cloud Shell tasks)

### 1. Update Application Files for Production
Update your local `next.config.ts` to include the production domain:

```typescript
// In next.config.ts, update the images domains:
images: {
  domains: ['storage.googleapis.com', 'tanya-showcase-thumbnails-public.storage.googleapis.com'],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 60,
},
```

### 2. Test Local Build
```bash
# Test that your app builds correctly
npm run build
npm start

# Verify it works on http://localhost:3000
```

---

## 🟠 GITHUB TASKS (Final step)

### 1. Add Files to Repository
Add these files to your `harryneopotter/teacher-site` repository:
- `cloudbuild.yaml`
- `Dockerfile` 
- `.dockerignore`
- Updated `next.config.ts`
- Updated `.gitignore`

### 2. Commit and Push
```bash
git add cloudbuild.yaml Dockerfile .dockerignore next.config.ts .gitignore
git commit -m "Add Cloud Run deployment configuration"
git push origin main
```

**This will trigger Cloud Build automatically!**

---

## 🌐 DOMAIN SETUP (External)

### Configure DNS Records
After step 4 above, you'll get DNS records from Google. Configure these with your domain provider (wherever you bought `tanyasprogram.com`):

1. **A Record**: Point to the IP address Google provides
2. **AAAA Record**: Point to the IPv6 address Google provides  
3. **CNAME Record**: Point `www.tanyasprogram.com` to `tanyasprogram.com`

---

## ✅ Success Verification

After completing all steps:

1. **Visit your domain**: `https://tanyasprogram.com`
2. **Check Cloud Run**: Service should be running
3. **Check monitoring**: Uptime check should be green
4. **Test functionality**: Theme toggle, PDF links, mobile view

---

## 🚨 Troubleshooting

### If Cloud Build fails:
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### If domain doesn't work:
```bash
# Check domain mapping status
gcloud run domain-mappings list --region=us-central1
```

### If app doesn't load:
```bash
# Check Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50
```

---

## Estimated Time: 30-45 minutes
- Cloud Shell tasks: 15-20 minutes
- Local tasks: 5-10 minutes  
- GitHub push: 2-5 minutes
- DNS propagation: 5-30 minutes (varies by provider)

**You're almost there! 🚀**