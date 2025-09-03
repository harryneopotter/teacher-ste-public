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

// Authorized users with roles
const AUTHORIZED_USERS = {
  '41661658': 'admin',     // You (Developer) - Full access
  // 'TANYA_USER_ID': 'content_manager', // Tanya - Content management only
};

let bot;
let geminiApiKey;

// Conversation state management
const conversationStates = new Map();

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

// Check user role
function getUserRole(userId) {
  return AUTHORIZED_USERS[userId.toString()] || null;
}

// Check if user has specific permission
function hasPermission(userId, requiredRole) {
  const userRole = getUserRole(userId);
  if (!userRole) return false;

  // Role hierarchy: admin > content_manager
  const roleLevels = {
    'content_manager': 1,
    'admin': 2
  };

  return roleLevels[userRole] >= roleLevels[requiredRole];
}

// Generate signed URL for private PDF access
async function generateSignedUrl(fileName) {
  try {
    console.log('Generating signed URL for file:', fileName);
    const file = storage.bucket(BUCKET_PDFS).file(fileName);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    console.log('Signed URL generated successfully');
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  }
}

// Upload file to Cloud Storage
async function uploadFile(buffer, fileName, bucket, contentType) {
  try {
    console.log(`Uploading file ${fileName} to bucket ${bucket} with content type ${contentType}`);
    console.log('Buffer size:', buffer.length);

    const file = storage.bucket(bucket).file(fileName);
    await file.save(buffer, {
      metadata: {
        contentType,
      },
    });

    console.log('File saved to Cloud Storage');

    if (bucket === BUCKET_THUMBNAILS) {
      // Make thumbnail public
      console.log('Making thumbnail public...');
      await file.makePublic();
      console.log('Thumbnail made public');
    }

    const gsUrl = `gs://${bucket}/${fileName}`;
    console.log('Upload complete, returning URL:', gsUrl);
    return gsUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
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

// Initialize conversation state for user
function initConversationState(userId, pdfFileName) {
  conversationStates.set(userId, {
    step: 'waiting_for_title',
    pdfFileName: pdfFileName,
    data: {}
  });
}

// Get conversation state for user
function getConversationState(userId) {
  return conversationStates.get(userId);
}

// Clear conversation state for user
function clearConversationState(userId) {
  conversationStates.delete(userId);
}

// Process conversation step
async function processConversationStep(userId, text, chatId) {
  const state = getConversationState(userId);
  if (!state) return false;

  switch (state.step) {
    case 'waiting_for_title':
      state.data.title = text.trim();
      state.step = 'waiting_for_author';
      await bot.sendMessage(chatId, '📝 Great! Now please provide the author name:');
      break;

    case 'waiting_for_author':
      state.data.author = text.trim();
      state.step = 'waiting_for_description';
      await bot.sendMessage(chatId, '📝 Perfect! Now please provide a description of the work:');
      break;

    case 'waiting_for_description':
      state.data.description = text.trim();
      state.step = 'waiting_for_thumbnail';

      // Generate signed URL for PDF
      const signedUrl = await generateSignedUrl(state.pdfFileName);

      // Save to Firestore
      const showcaseId = await saveShowcaseItem({
        title: state.data.title,
        author: state.data.author,
        description: state.data.description,
        pdfFileName: state.pdfFileName,
        pdfUrl: signedUrl,
        thumbnailUrl: '/thumbnails/test.jpg' // Default thumbnail
      });

      await bot.sendMessage(chatId, `✅ **${state.data.title}** has been published successfully!`);
      await bot.sendMessage(chatId, `🔗 PDF URL: ${signedUrl}`);
      await bot.sendMessage(chatId, '📸 Optionally, you can send a thumbnail image for this work, or send /done to finish.');

      state.step = 'waiting_for_thumbnail_or_done';
      break;

    case 'waiting_for_thumbnail_or_done':
      if (text.toLowerCase() === '/done') {
        clearConversationState(userId);
        await bot.sendMessage(chatId, '🎉 All done! Your student work is now live on the website.');
      } else {
        await bot.sendMessage(chatId, '📸 Please send a thumbnail image or type /done to finish.');
      }
      break;
  }

  return true;
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

**Your Role:** ${getUserRole(userId) || 'Not authorized'}

**Commands:**
📝 Send a PDF file to add a new student work
📋 /list - View all showcase items
🔍 /status - Check bot status and your role
👤 /userid - Get your Telegram user ID
❌ /cancel - Cancel current PDF upload process
❓ /help - Show this help message

**Admin Commands:**
👥 /adduser - Add new users (admin only)

**How to add content:**
1. Send a PDF file (max 20MB)
2. I'll ask for title, author, and description
3. Optionally send a thumbnail image
4. Content goes live automatically!

**Tips:**
• Use /cancel to stop the process anytime
• Processing may take up to 9 minutes for large files
• All PDFs are stored securely with signed URLs
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
🔍 /status - Check bot status and your role
👤 /userid - Get your Telegram user ID
❌ /cancel - Cancel current PDF upload process
❓ /help - Show this help

**PDF Upload Limits:**
📄 Max size: 20MB (Telegram limit)
⏱️  Processing timeout: 9 minutes
💾 Memory: 512MB available

**Admin Commands:**
👥 /adduser - Add new users (admin only)

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

👤 **Your Role:** ${getUserRole(userId) || 'Not authorized'}
👤 **Total Users:** ${Object.keys(AUTHORIZED_USERS).length}
👤 **Your User ID:** ${userId}
    `;

    await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    return;
  }

  if (text === '/userid') {
    await bot.sendMessage(chatId, `👤 **Your Telegram User ID:** \`${userId}\`\n\nUse this ID to update the AUTHORIZED_USERS list in the bot code.`, { parse_mode: 'Markdown' });
    return;
  }

  if (text === '/adduser') {
    if (!hasPermission(userId, 'admin')) {
      await bot.sendMessage(chatId, '❌ Only admins can add users.');
      return;
    }

    await bot.sendMessage(chatId, `👥 **Add User Command**\n\nTo add a new user, send their user ID in this format:\n\`adduser USER_ID ROLE\`\n\n**Roles:**\n• \`content_manager\` - Can manage content\n• \`admin\` - Full access\n\n**Example:**\n\`adduser 123456789 content_manager\``, { parse_mode: 'Markdown' });
    return;
  }

  if (text === '/cancel') {
    const state = getConversationState(userId);
    if (state) {
      clearConversationState(userId);
      await bot.sendMessage(chatId, '✅ **Process cancelled!**\n\nYour PDF upload has been cancelled. You can start over by sending a new PDF file.', { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, '📝 No active process to cancel. Send a PDF file to start uploading content.');
    }
    return;
  }

  // Handle adduser command with parameters
  if (text.startsWith('adduser ')) {
    if (!hasPermission(userId, 'admin')) {
      await bot.sendMessage(chatId, '❌ Only admins can add users.');
      return;
    }

    const parts = text.split(' ');
    if (parts.length !== 3) {
      await bot.sendMessage(chatId, '❌ Invalid format. Use: `adduser USER_ID ROLE`', { parse_mode: 'Markdown' });
      return;
    }

    const [command, newUserId, role] = parts;

    if (!['content_manager', 'admin'].includes(role)) {
      await bot.sendMessage(chatId, '❌ Invalid role. Use: `content_manager` or `admin`', { parse_mode: 'Markdown' });
      return;
    }

    // Note: This is a runtime addition - will be lost on redeploy
    // For permanent changes, update the code directly
    AUTHORIZED_USERS[newUserId] = role;
    await bot.sendMessage(chatId, `✅ User ${newUserId} added with role: ${role}\n\n⚠️ **Note:** This change is temporary. Update the code for permanent access.`, { parse_mode: 'Markdown' });
    return;
  }
  
  // Handle conversation steps first
  if (await processConversationStep(userId, text, chatId)) {
    return;
  }

  // Handle other text as potential responses to prompts
  await bot.sendMessage(chatId, '💡 Send a PDF file to add new student work, or use /help for commands.');
}

// Handle photo uploads (thumbnails)
async function handlePhoto(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    await bot.sendMessage(chatId, '❌ You are not authorized to use this bot.');
    return;
  }

  const state = getConversationState(userId);
  if (!state || state.step !== 'waiting_for_thumbnail_or_done') {
    await bot.sendMessage(chatId, '📸 Please send a PDF first, then I can accept thumbnail images.');
    return;
  }

  try {
    const photo = msg.photo[msg.photo.length - 1]; // Get the highest resolution photo
    const fileLink = await bot.getFileLink(photo.file_id);
    const response = await fetch(fileLink);

    if (!response.ok) {
      throw new Error(`Failed to download photo: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate thumbnail filename
    const thumbnailFileName = `${state.pdfFileName.replace('.pdf', '')}-thumbnail.jpg`;

    // Upload thumbnail to public bucket
    await uploadFile(buffer, thumbnailFileName, BUCKET_THUMBNAILS, 'image/jpeg');

    // Update Firestore with thumbnail URL
    const showcaseQuery = await firestore.collection('showcase')
      .where('pdfFileName', '==', state.pdfFileName)
      .limit(1)
      .get();

    if (!showcaseQuery.empty) {
      const docRef = showcaseQuery.docs[0].ref;
      await docRef.update({
        thumbnailUrl: `/thumbnails/${thumbnailFileName}`,
        updatedAt: Firestore.Timestamp.now()
      });
    }

    clearConversationState(userId);
    await bot.sendMessage(chatId, '✅ Thumbnail uploaded successfully!');
    await bot.sendMessage(chatId, '🎉 Your student work is now complete and live on the website!');

  } catch (error) {
    console.error('Error handling photo:', error);
    await bot.sendMessage(chatId, '❌ Error processing thumbnail. Please try again.');
  }
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
    console.log('📄 Processing PDF for user:', userId);
    console.log('Document info:', {
      file_name: document.file_name,
      mime_type: document.mime_type,
      file_size: document.file_size,
      file_id: document.file_id
    });

    await bot.sendMessage(chatId, '📄 Processing PDF... Please wait.');

    // Download the file
    console.log('Getting file link...');
    const fileLink = await bot.getFileLink(document.file_id);
    console.log('File link obtained:', fileLink);

    const response = await fetch(fileLink);

    if (!response.ok) {
      console.error('Failed to download file:', response.status, response.statusText);
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    console.log('File downloaded successfully, converting to buffer...');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer created, size:', buffer.length);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${document.file_name || 'document.pdf'}`;
    console.log('Generated filename:', fileName);

    // Upload to Cloud Storage
    console.log('Uploading to Cloud Storage...');
    const pdfUrl = await uploadFile(buffer, fileName, BUCKET_PDFS, 'application/pdf');
    console.log('Upload successful, URL:', pdfUrl);

    await bot.sendMessage(chatId, '✅ PDF uploaded successfully!');
    await bot.sendMessage(chatId, `📁 File: ${fileName}`);
    await bot.sendMessage(chatId, '📝 Now please provide the title of the work:');

    // Initialize conversation state
    initConversationState(userId, fileName);
    console.log('Conversation state initialized for user:', userId);

  } catch (error) {
    console.error('Error handling document:', error);
    console.error('Error stack:', error.stack);
    await bot.sendMessage(chatId, `❌ Error processing PDF: ${error.message}. Please try again.`);
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
      } else if (msg.photo) {
        await handlePhoto(msg);
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