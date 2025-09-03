# GCP Setup Location Guide

This guide shows where each step from the GCP Configuration Guide should be executed.

## Legend:
- 🔵 **CLOUD SHELL** = Must be done in Google Cloud Shell (requires gcloud SDK)
- 🟢 **LOCAL** = Done on your local machine
- 🟡 **WEB CONSOLE** = Done in Google Cloud Console (browser)
- 🟠 **GITHUB** = Done in your GitHub repository

---

## Section 1: Project Setup and Configuration

### 1.1 Create Project
🔵 **CLOUD SHELL** - All gcloud commands

### 1.2 Enable Billing  
🔵 **CLOUD SHELL** - gcloud billing commands
🟡 **WEB CONSOLE** - Alternative: Can be done via web interface

---

## Section 2: API Enablement

### 2.1 Enable Required APIs
🔵 **CLOUD SHELL** - All `gcloud services enable` commands

---

## Section 3: IAM and Service Accounts

### 3.1 Create Service Accounts
🔵 **CLOUD SHELL** - All `gcloud iam service-accounts create` commands

### 3.2 Assign IAM Roles
🔵 **CLOUD SHELL** - All `gcloud projects add-iam-policy-binding` commands

---

## Section 4: Cloud Storage Configuration

### 4.1 Create Storage Buckets
🔵 **CLOUD SHELL** - All `gsutil mb` commands

### 4.2 Configure Bucket Permissions
🔵 **CLOUD SHELL** - All `gsutil iam` commands

### 4.3 CORS Configuration File
🟢 **LOCAL** - Create `cors-config.json` file locally
🔵 **CLOUD SHELL** - Upload file and run `gsutil cors set` command

### 4.4 Lifecycle Management
🟢 **LOCAL** - Create `backup-lifecycle.json` file locally  
🔵 **CLOUD SHELL** - Upload file and run `gsutil lifecycle set` command

---

## Section 5: Firestore Database Setup

### 5.1 Create Firestore Database
🔵 **CLOUD SHELL** - `gcloud firestore databases create` command

### 5.2 Firestore Security Rules
🟢 **LOCAL** - Create `firestore.rules` file
🔵 **CLOUD SHELL** - Upload file and run `firebase deploy --only firestore:rules`

### 5.3 Create Initial Collections and Indexes
🔵 **CLOUD SHELL** - All `gcloud firestore indexes` commands

---

## Section 6: Secret Manager Configuration

### 6.1 Create Secrets
🔵 **CLOUD SHELL** - All `gcloud secrets create` commands

### 6.2 Set Secret Values
🔵 **CLOUD SHELL** - All `echo | gcloud secrets versions add` commands

### 6.3 Grant Secret Access
🔵 **CLOUD SHELL** - All `gcloud secrets add-iam-policy-binding` commands

---

## Section 7: Cloud Build Configuration

### 7.1 Connect GitHub Repository
🔵 **CLOUD SHELL** - `gcloud builds connections create` command
🟡 **WEB CONSOLE** - OAuth authorization via browser link

### 7.2 Create Build Triggers
🟡 **WEB CONSOLE** - Recommended (command line has syntax issues)
🔵 **CLOUD SHELL** - Alternative: `gcloud builds triggers create` (if syntax works)

### 7.3 Cloud Build Configuration File
🟢 **LOCAL** - Create `cloudbuild.yaml` in your project
🟠 **GITHUB** - Add to repository root (NOT Cloud Shell)

---

## Section 8: Cloud Run Configuration

### 8.1 Initial Deployment
🔵 **CLOUD SHELL** - `gcloud run deploy` command

### 8.2 Custom Domain Setup
🔵 **CLOUD SHELL** - `gcloud run domain-mappings create` command

---

## Section 9: Monitoring and Logging

### 9.1 Set Up Monitoring
🔵 **CLOUD SHELL** - All `gcloud monitoring` commands

### 9.2 Create Alert Policies
🟢 **LOCAL** - Create YAML policy files
🔵 **CLOUD SHELL** - Upload files and run `gcloud alpha monitoring policies create`

---

## Section 10: Backup and Disaster Recovery

### 10.1 Firestore Backup
🔵 **CLOUD SHELL** - All `gcloud firestore export` and `gcloud scheduler` commands

### 10.2 Storage Backup
🔵 **CLOUD SHELL** - All `gsutil rsync` commands

---

## Section 11: Security Configuration

### 11.1 Enable Security Features
🔵 **CLOUD SHELL** - All `gcloud services enable` commands

### 11.2 Set Up VPC Security
🔵 **CLOUD SHELL** - All `gcloud compute networks` commands

---

## Section 12: Cost Management

### 12.1 Set Up Billing Alerts
🔵 **CLOUD SHELL** - `gcloud billing budgets create` command

### 12.2 Resource Quotas
🔵 **CLOUD SHELL** - `gcloud compute project-info add-metadata` command

---

## Application Files (for GitHub Repository)

### Files to create locally and add to GitHub:
🟢 **LOCAL** → 🟠 **GITHUB**:
- `cloudbuild.yaml` - Build configuration
- `Dockerfile` - Container configuration
- `.dockerignore` - Build optimization
- `next.config.ts` - Updated Next.js config
- Updated application code

### Files to keep local only (already in .gitignore):
🟢 **LOCAL ONLY**:
- `cors-config.json` - Used only for gsutil command
- `backup-lifecycle.json` - Used only for gsutil command  
- `firestore.rules` - Used only for firebase deploy
- All migration documentation files

---

## Quick Reference:

**Most common pattern:**
1. 🟢 **LOCAL**: Create configuration files
2. 🔵 **CLOUD SHELL**: Upload files and run gcloud/gsutil commands
3. 🟠 **GITHUB**: Add application files to repository
4. 🟡 **WEB CONSOLE**: Use for complex UI tasks (OAuth, triggers)

**Never mix locations:**
- Don't put `cloudbuild.yaml` in Cloud Shell
- Don't run `gcloud` commands locally (you don't have SDK)
- Don't put migration docs in GitHub repository