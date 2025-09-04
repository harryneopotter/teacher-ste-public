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

// Step 1: Add Markdown sanitization utility
// Escapes Telegram Markdown special characters
function sanitizeMarkdown(text) {
  if (!text) return '';
  // Escape Telegram MarkdownV2 special chars
  return text.replace(/[*_\[\]()~`>#+=|{}.!-]/g, match => '\\' + match);
}


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

  // Step 2: Use sanitized user input in all Markdown messages
  switch (state.step) {
    case 'waiting_for_title':
      state.data.title = text.trim();
      state.step = 'waiting_for_author';
      await safeSendMessage(chatId, '📝 Great! Now please provide the author name:', 'Markdown');
      break;

    case 'waiting_for_author':
      state.data.author = text.trim();
      state.step = 'waiting_for_description';
      await safeSendMessage(chatId, '📝 Perfect! Now please provide a description of the work:', 'Markdown');
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

      // Step 3: Sanitize user input in published message
      const safeTitle = sanitizeMarkdown(state.data.title);
      await safeSendMessage(chatId, `✅ *${safeTitle}* has been published successfully!`, 'MarkdownV2');
      await safeSendMessage(chatId, `🔗 PDF URL: ${signedUrl}`, 'Markdown');
      await safeSendMessage(chatId, '📸 Optionally, you can send a thumbnail image for this work, or send /done to finish.', 'Markdown');

      state.step = 'waiting_for_thumbnail_or_done';
      break;

    case 'waiting_for_thumbnail_or_done':
      if (text.toLowerCase() === '/done') {
        clearConversationState(userId);
        await safeSendMessage(chatId, '🎉 All done! Your student work is now live on the website.', 'Markdown');
      } else {
        await safeSendMessage(chatId, '📸 Please send a thumbnail image or type /done to finish.', 'Markdown');
      }
      break;
  }

  return true;

// Step 4: Add safeSendMessage wrapper for error handling
}

async function safeSendMessage(chatId, text, parseMode) {
  try {
    await bot.sendMessage(chatId, text, parseMode ? { parse_mode: parseMode } : undefined);
  } catch (err) {
    console.error('Error sending Telegram message:', err);
    // Optionally, send a fallback plain text message
    if (parseMode) {
      try {
        await bot.sendMessage(chatId, text);
      } catch (e) {
        console.error('Fallback plain text message also failed:', e);
      }
    }
  }
}

// Handle text messages
async function handleTextMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  if (!isAuthorized(userId)) {
    await safeSendMessage(chatId, '❌ You are not authorized to use this bot.');
    return;
  }

  // Command handling (unnested)
  if (text === '/start') {
    const welcomeMessage = `🎨 Tanya's Showcase Bot\n\nWelcome! This bot helps you manage student showcase content.\n\nYour Role: ${sanitizeMarkdown(getUserRole(userId) || 'Not authorized')}\n\nCommands:\n📝 Send a PDF file to add a new student work\n📋 /list - View all showcase items\n🔍 /status - Check bot status and your role\n👤 /userid - Get your Telegram user ID\n❌ /cancel - Cancel current PDF upload process\n❓ /help - Show this help message\n\nAdmin Commands:\n👥 /adduser - Add new users (admin only)\n\nHow to add content:\n1. Send a PDF file (max 20MB)\n2. I'll ask for title, author, and description\n3. Optionally send a thumbnail image\n4. Content goes live automatically!\n\nTips:\n• Use /cancel to stop the process anytime\n• Processing may take up to 9 minutes for large files\n• All PDFs are stored securely with signed URLs`;
    await safeSendMessage(chatId, welcomeMessage, 'Markdown');
    return;
  }
  if (text === '/help') {
    const helpMessage = `📚 Help - Tanya's Showcase Bot\n\nAdding Student Work:\n1. Send a PDF file of the student's work\n2. Follow the prompts to add details\n3. Optionally add a thumbnail image\n\nCommands:\n📋 /list - View all published works\n🔍 /status - Check bot status and your role\n👤 /userid - Get your Telegram user ID\n❌ /cancel - Cancel current PDF upload process\n❓ /help - Show this help\n\nPDF Upload Limits:\n📄 Max size: 20MB (Telegram limit)\n⏱️  Processing timeout: 9 minutes\n💾 Memory: 512MB available\n\nAdmin Commands:\n👥 /adduser - Add new users (admin only)\n\nTips:\n• Use voice messages for descriptions (accessibility feature)\n• AI will help improve descriptions\n• All PDFs are private with signed URLs\n• Thumbnails are public for fast loading`;
    await safeSendMessage(chatId, helpMessage, 'Markdown');
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
        await safeSendMessage(chatId, '📚 No showcase items found.');
        return;
      }
      let message = '📚 Published Showcase Items:\n\n';
      snapshot.forEach(doc => {
        const data = doc.data();
        message += `📖 ${sanitizeMarkdown(data.title)}\n`;
        message += `👤 Author: ${sanitizeMarkdown(data.author)}\n`;
        message += `📅 ${data.createdAt.toDate().toLocaleDateString()}\n\n`;
      });
      await safeSendMessage(chatId, message, 'Markdown');
    } catch (error) {
      console.error('Error listing items:', error);
      await safeSendMessage(chatId, '❌ Error retrieving showcase items.');
    }
    return;
  }
  if (text === '/status') {
    const statusMessage = `🤖 Bot Status\n\n✅ Bot is running\n✅ Connected to Firestore\n✅ Connected to Cloud Storage\n✅ Secrets loaded\n\n📊 Storage Buckets:\n• PDFs: ${sanitizeMarkdown(BUCKET_PDFS)}\n• Thumbnails: ${sanitizeMarkdown(BUCKET_THUMBNAILS)}\n\n👤 Your Role: ${sanitizeMarkdown(getUserRole(userId) || 'Not authorized')}\n👤 Total Users: ${Object.keys(AUTHORIZED_USERS).length}\n👤 Your User ID: ${userId}`;
    await safeSendMessage(chatId, statusMessage, 'Markdown');
    return;
  }
  if (text === '/userid') {
    await safeSendMessage(chatId, `👤 Your Telegram User ID: ${userId}\n\nUse this ID to update the AUTHORIZED_USERS list in the bot code.`);
    return;
  }
  if (text === '/adduser') {
    if (!hasPermission(userId, 'admin')) {
      await safeSendMessage(chatId, '❌ Only admins can add users.');
      return;
    }
    const addUserMsg = `👥 Add User Command\n\nTo add a new user, send their user ID in this format:\nadduser USER_ID ROLE\n\nRoles:\n• content_manager - Can manage content\n• admin - Full access\n\nExample:\nadduser 123456789 content_manager`;
    await safeSendMessage(chatId, addUserMsg, 'Markdown');
    return;
  }
  if (text === '/cancel') {
    const state = getConversationState(userId);
    if (state) {
      clearConversationState(userId);
      await safeSendMessage(chatId, '✅ Process cancelled!\n\nYour PDF upload has been cancelled. You can start over by sending a new PDF file.', 'Markdown');
    } else {
      await safeSendMessage(chatId, '📝 No active process to cancel. Send a PDF file to start uploading content.');
    }
    return;
  }
  if (text.startsWith('adduser ')) {
    if (!hasPermission(userId, 'admin')) {
      await safeSendMessage(chatId, '❌ Only admins can add users.');
      return;
    }
    const parts = text.split(' ');
    if (parts.length !== 3) {
      await safeSendMessage(chatId, '❌ Invalid format. Use: adduser USER_ID ROLE', 'Markdown');
      return;
    }
    const [command, newUserId, role] = parts;
    if (!['content_manager', 'admin'].includes(role)) {
      await safeSendMessage(chatId, '❌ Invalid role. Use: content_manager or admin', 'Markdown');
      return;
    }
    // Note: This is a runtime addition - will be lost on redeploy
    // For permanent changes, update the code directly
    AUTHORIZED_USERS[newUserId] = role;
    await safeSendMessage(chatId, `✅ User ${newUserId} added with role: ${role}\n\n⚠️ Note: This change is temporary. Update the code for permanent access.`, 'Markdown');
    return;
  }
  // Handle conversation steps first
  if (await processConversationStep(userId, text, chatId)) {
    return;
  }
  // Handle other text as potential responses to prompts
  await safeSendMessage(chatId, '� Send a PDF file to add new student work, or use /help for commands.');
}

// Handle document messages
// Handle photo messages
async function handlePhoto(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const photos = msg.photo;
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    await safeSendMessage(chatId, '❌ No photo found in the message.');
    return;
  }
  // Get the highest resolution photo
  const photo = photos[photos.length - 1];
  try {
    await safeSendMessage(chatId, '📸 Processing thumbnail image...');
    const fileLink = await bot.getFileLink(photo.file_id);
    const response = await fetch(fileLink);
    if (!response.ok) {
      throw new Error(`Failed to download photo: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const timestamp = Date.now();
    const fileName = `${timestamp}-thumbnail.jpg`;
    const thumbnailUrl = await uploadFile(buffer, fileName, BUCKET_THUMBNAILS, 'image/jpeg');
    // Update conversation state if active
    const state = getConversationState(userId);
    if (state) {
      state.data.thumbnailUrl = thumbnailUrl;
      await safeSendMessage(chatId, '✅ Thumbnail uploaded and linked to your showcase item!');
      await safeSendMessage(chatId, '🎉 All done! Your student work is now live on the website.', 'Markdown');
      clearConversationState(userId);
    } else {
      await safeSendMessage(chatId, '✅ Thumbnail uploaded!');
    }
  } catch (error) {
    console.error('Error handling photo:', error);
    await safeSendMessage(chatId, `❌ Error processing photo: ${sanitizeMarkdown(error.message)}. Please try again.`);
  }
}
async function handleDocument(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const document = msg.document;
  try {
    console.log('📄 Processing PDF for user:', userId);
    console.log('Document info:', {
      file_name: document.file_name,
      mime_type: document.mime_type,
      file_size: document.file_size,
      file_id: document.file_id
    });

    await safeSendMessage(chatId, '📄 Processing PDF... Please wait.');

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

    await safeSendMessage(chatId, '✅ PDF uploaded successfully!');
    await safeSendMessage(chatId, `📁 File: ${sanitizeMarkdown(fileName)}`);
    await safeSendMessage(chatId, '📝 Now please provide the title of the work:');

    // Initialize conversation state
    initConversationState(userId, fileName);
    console.log('Conversation state initialized for user:', userId);

  } catch (error) {
    console.error('Error handling document:', error);
    console.error('Error stack:', error.stack);
    await safeSendMessage(chatId, `❌ Error processing PDF: ${sanitizeMarkdown(error.message)}. Please try again.`);
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
    // When implementing voice-to-text, sanitize user-generated content before sending.
    await safeSendMessage(msg.chat.id, '🎤 Voice message received! Voice-to-text feature coming soon.');
      } else {
        await safeSendMessage(msg.chat.id, '🤖 Sorry, I did not recognize that message type. Please send a PDF file, photo, or use /help for commands.');
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
