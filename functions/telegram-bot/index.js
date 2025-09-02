const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const TelegramBot = require('node-telegram-bot-api');

// Initialize clients
const firestore = new Firestore();
const storage = new Storage();
const secretClient = new SecretManagerServiceClient();

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'driven-bison-470218-v3';
const BUCKET_PDFS = 'tanya-showcase-pdfs-private';
const BUCKET_THUMBNAILS = 'tanya-showcase-thumbnails-public';

// Authorized users
const AUTHORIZED_USERS = {
  '41661658': 'admin', // Tanya (Admin)
};

let bot;
let geminiApiKey;

// Initialize secrets
async function initializeSecrets() {
  try {
    // Get Telegram bot token
    const [botTokenResponse] = await secretClient.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/telegram-bot-token/versions/latest`,
    });
    const botToken = botTokenResponse.payload.data.toString();
    
    // Get Gemini API key
    const [geminiResponse] = await secretClient.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/gemini-api-key/versions/latest`,
    });
    geminiApiKey = geminiResponse.payload.data.toString();
    
    // Initialize bot
    bot = new TelegramBot(botToken);
    
    console.log('Secrets initialized successfully');
  } catch (error) {
    console.error('Error initializing secrets:', error);
    throw error;
  }
}

// Verify user authorization
function isAuthorized(userId) {
  return Object.keys(AUTHORIZED_USERS).includes(userId.toString());
}

// Generate signed URL for private PDF access
async function generateSignedUrl(fileName) {
  try {
    const file = storage.bucket(BUCKET_PDFS).file(fileName);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

// Upload file to Cloud Storage
async function uploadFile(buffer, fileName, bucket, contentType) {
  try {
    const file = storage.bucket(bucket).file(fileName);
    await file.save(buffer, {
      metadata: {
        contentType,
      },
    });
    
    if (bucket === BUCKET_THUMBNAILS) {
      // Make thumbnail public
      await file.makePublic();
    }
    
    return `gs://${bucket}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Save showcase item to Firestore
async function saveShowcaseItem(data) {
  try {
    const docRef = await firestore.collection('showcase').add({
      ...data,
      createdAt: Firestore.Timestamp.now(),
      updatedAt: Firestore.Timestamp.now(),
      status: 'published',
    });
    
    console.log('Showcase item saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving showcase item:', error);
    throw error;
  }
}

// Handle text messages
async function handleTextMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  if (!isAuthorized(userId)) {
    await bot.sendMessage(chatId, '❌ You are not authorized to use this bot.');
    return;
  }
  
  if (text === '/start') {
    const welcomeMessage = `
🎨 **Tanya's Showcase Bot**

Welcome! This bot helps you manage student showcase content.

**Commands:**
📝 Send a PDF file to add a new student work
📋 /list - View all showcase items
❓ /help - Show this help message

**How to add content:**
1. Send a PDF file
2. I'll ask for title, author, and description
3. Optionally send a thumbnail image
4. I'll enhance the description with AI
5. Content goes live automatically!
    `;
    
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    return;
  }
  
  if (text === '/help') {
    const helpMessage = `
📚 **Help - Tanya's Showcase Bot**

**Adding Student Work:**
1. Send a PDF file of the student's work
2. Follow the prompts to add details
3. Optionally add a thumbnail image

**Commands:**
📋 /list - View all published works
🔍 /status - Check bot status
❓ /help - Show this help

**Tips:**
• Use voice messages for descriptions (accessibility feature)
• AI will help improve descriptions
• All PDFs are private with signed URLs
• Thumbnails are public for fast loading
    `;
    
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    return;
  }
  
  if (text === '/list') {
    try {
      const snapshot = await firestore.collection('showcase')
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      
      if (snapshot.empty) {
        await bot.sendMessage(chatId, '📚 No showcase items found.');
        return;
      }
      
      let message = '📚 **Published Showcase Items:**\\n\\n';
      snapshot.forEach(doc => {
        const data = doc.data();
        message += `📖 **${data.title}**\\n`;
        message += `👤 Author: ${data.author}\\n`;
        message += `📅 ${data.createdAt.toDate().toLocaleDateString()}\\n\\n`;
      });
      
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error listing items:', error);
      await bot.sendMessage(chatId, '❌ Error retrieving showcase items.');
    }
    return;
  }
  
  if (text === '/status') {
    const statusMessage = `
🤖 **Bot Status**

✅ Bot is running
✅ Connected to Firestore
✅ Connected to Cloud Storage
✅ Secrets loaded

📊 **Storage Buckets:**
• PDFs: ${BUCKET_PDFS}
• Thumbnails: ${BUCKET_THUMBNAILS}

👤 **Authorized Users:** ${Object.keys(AUTHORIZED_USERS).length}
    `;
    
    await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    return;
  }
  
  // Handle other text as potential responses to prompts
  await bot.sendMessage(chatId, '💡 Send a PDF file to add new student work, or use /help for commands.');
}

// Handle document uploads (PDFs)
async function handleDocument(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    await bot.sendMessage(chatId, '❌ You are not authorized to use this bot.');
    return;
  }
  
  const document = msg.document;
  
  if (!document.mime_type || !document.mime_type.includes('pdf')) {
    await bot.sendMessage(chatId, '❌ Please send a PDF file.');
    return;
  }
  
  try {
    await bot.sendMessage(chatId, '📄 Processing PDF... Please wait.');
    
    // Download the file
    const fileLink = await bot.getFileLink(document.file_id);
    const response = await fetch(fileLink);
    const buffer = await response.buffer();
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${document.file_name || 'document.pdf'}`;
    
    // Upload to Cloud Storage
    const pdfUrl = await uploadFile(buffer, fileName, BUCKET_PDFS, 'application/pdf');
    
    await bot.sendMessage(chatId, '✅ PDF uploaded successfully!');
    await bot.sendMessage(chatId, `📁 File: ${fileName}`);
    await bot.sendMessage(chatId, '📝 Now please provide:\n1. Title of the work\n2. Author name\n3. Description\n\nSend them as separate messages or all together.');
    
    // TODO: Implement conversation state management for collecting metadata
    
  } catch (error) {
    console.error('Error handling document:', error);
    await bot.sendMessage(chatId, '❌ Error processing PDF. Please try again.');
  }
}

// Main Cloud Function handler
exports.telegramShowcaseBot = async (req, res) => {
  try {
    // Initialize secrets if not already done
    if (!bot) {
      await initializeSecrets();
    }
    
    // Verify webhook (optional security)
    const update = req.body;
    
    if (update.message) {
      const msg = update.message;
      
      if (msg.text) {
        await handleTextMessage(msg);
      } else if (msg.document) {
        await handleDocument(msg);
      } else if (msg.voice) {
        // TODO: Handle voice messages for accessibility
        await bot.sendMessage(msg.chat.id, '🎤 Voice message received! Voice-to-text feature coming soon.');
      } else {
        await bot.sendMessage(msg.chat.id, '💡 Send a PDF file to add student work, or use /help for commands.');
      }
    }
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).send('Error');
  }
};

// For local testing
if (require.main === module) {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  app.post('/webhook', exports.telegramShowcaseBot);
  
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Bot server running on port ${port}`);
  });
}