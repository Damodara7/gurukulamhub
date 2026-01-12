/**
 * Chat Encryption Helper
 * High-level functions for encrypting/decrypting chat messages
 */

import * as EncryptionUtils from './encryption'
import * as KeyManagement from './keyManagement'

/**
 * Normalize chatId to ensure consistent format for key storage/retrieval
 * @param {string} chatId - Chat ID (may be URL-encoded)
 * @returns {string} Normalized chatId
 */
function normalizeChatId(chatId) {
  if (!chatId) return chatId
  
  try {
    // Decode URL-encoded chatId
    let decoded = chatId
    for (let i = 0; i < 3; i++) {
      try {
        const testDecode = decodeURIComponent(decoded)
        if (testDecode === decoded) break
        decoded = testDecode
      } catch (e) {
        break
      }
    }
    
    // Split and normalize emails
    const [email1, email2] = decoded.split('_')
    if (!email1 || !email2) return chatId
    
    // Decode and normalize emails
    let normalizedEmail1 = email1
    let normalizedEmail2 = email2
    try {
      normalizedEmail1 = decodeURIComponent(email1).toLowerCase().trim()
      normalizedEmail2 = decodeURIComponent(email2).toLowerCase().trim()
    } catch (e) {
      normalizedEmail1 = email1.toLowerCase().trim()
      normalizedEmail2 = email2.toLowerCase().trim()
    }
    
    // Sort emails to ensure consistent format
    const sorted = [normalizedEmail1, normalizedEmail2].sort()
    return `${sorted[0]}_${sorted[1]}`
  } catch (e) {
    console.warn('[Encryption] Failed to normalize chatId:', e)
    return chatId
  }
}

/**
 * Initialize encryption for a user (generate key pair if not exists)
 * @param {string} userEmail - User email
 * @returns {Promise<{publicKey: string}>} Public key to share
 */
export async function initializeUserEncryption(userEmail) {
  try {
    // Check if keys already exist
    let keyPair = await KeyManagement.getUserKeyPair(userEmail)

    if (!keyPair) {
      // Generate new key pair
      const { publicKey, privateKey } = await EncryptionUtils.generateKeyPair()
      const publicKeyBase64 = await EncryptionUtils.exportPublicKey(publicKey)
      const privateKeyBase64 = await EncryptionUtils.exportPrivateKey(privateKey)

      // Store keys
      await KeyManagement.storeUserKeyPair(userEmail, publicKeyBase64, privateKeyBase64)

      keyPair = {
        publicKey: publicKeyBase64,
        privateKey: privateKeyBase64,
      }
    }

    return {
      publicKey: keyPair.publicKey,
    }
  } catch (error) {
    console.error('Error initializing user encryption:', error)
    throw error
  }
}

/**
 * Setup encryption for individual chat
 * @param {string} chatId - Chat ID (email1_email2)
 * @param {string} userEmail - Current user's email
 * @param {string} otherUserPublicKey - Other user's public key (base64)
 * @returns {Promise<boolean>} True if successful
 */
export async function setupIndividualChatEncryption(chatId, userEmail, otherUserPublicKey) {
  try {
    // Normalize chatId to ensure consistent format
    const normalizedChatId = normalizeChatId(chatId)
    
    // Check if we already have a shared key
    let sharedKey = await KeyManagement.getIndividualChatKey(normalizedChatId)

    if (!sharedKey) {
      // Get user's private key
      const keyPair = await KeyManagement.getUserKeyPair(userEmail)
      if (!keyPair) {
        throw new Error('User key pair not found. Please initialize encryption first.')
      }

      // Import keys
      const privateKey = await EncryptionUtils.importPrivateKey(keyPair.privateKey)
      const publicKey = await EncryptionUtils.importPublicKey(otherUserPublicKey)

      // Derive shared key
      const derivedKey = await EncryptionUtils.deriveSharedKey(privateKey, publicKey)

      // Export and store shared key
      sharedKey = await EncryptionUtils.exportKey(derivedKey)
      await KeyManagement.storeIndividualChatKey(normalizedChatId, userEmail, sharedKey)
      console.log('[Encryption] Shared key stored for chatId:', normalizedChatId)
    }

    return true
  } catch (error) {
    console.error('Error setting up individual chat encryption:', error)
    return false
  }
}

/**
 * Setup encryption for group chat (uses a shared group key)
 * @param {string} groupId - Group ID
 * @param {boolean} isCreator - Whether current user is group creator
 * @returns {Promise<boolean>} True if successful
 */
export async function setupGroupChatEncryption(groupId, isCreator = false) {
  try {
    // Check if we already have a group key
    let sharedKey = await KeyManagement.getGroupChatKey(groupId)

    if (!sharedKey) {
      if (isCreator) {
        // Creator generates a new group key
        const groupKey = await EncryptionUtils.generateEncryptionKey()
        sharedKey = await EncryptionUtils.exportKey(groupKey)
        await KeyManagement.storeGroupChatKey(groupId, sharedKey)
      } else {
        // Non-creator waits for key from creator
        // In production, this would be fetched from server or received via secure channel
        // For now, we'll generate a temporary key that will be replaced
        const groupKey = await EncryptionUtils.generateEncryptionKey()
        sharedKey = await EncryptionUtils.exportKey(groupKey)
        await KeyManagement.storeGroupChatKey(groupId, sharedKey)
        // TODO: In production, fetch actual group key from creator via secure channel
      }
    }

    return true
  } catch (error) {
    console.error('Error setting up group chat encryption:', error)
    return false
  }
}

/**
 * Encrypt a message for individual chat
 * @param {string} message - Plain text message
 * @param {string} chatId - Chat ID
 * @returns {Promise<string>} Encrypted message (base64)
 */
export async function encryptIndividualMessage(message, chatId) {
  try {
    // Normalize chatId to ensure consistent format
    const normalizedChatId = normalizeChatId(chatId)
    const sharedKeyBase64 = await KeyManagement.getIndividualChatKey(normalizedChatId)
    if (!sharedKeyBase64) {
      throw new Error('Chat encryption not set up. Shared key not found.')
    }

    const sharedKey = await EncryptionUtils.importKey(sharedKeyBase64)
    const encrypted = await EncryptionUtils.encryptMessage(message, sharedKey)

    return encrypted
  } catch (error) {
    console.error('Error encrypting individual message:', error)
    throw error
  }
}

/**
 * Decrypt a message from individual chat
 * @param {string} encryptedMessage - Encrypted message (base64)
 * @param {string} chatId - Chat ID
 * @returns {Promise<string>} Decrypted plain text message
 */
export async function decryptIndividualMessage(encryptedMessage, chatId) {
  try {
    // Normalize chatId to ensure consistent format
    const normalizedChatId = normalizeChatId(chatId)
    const sharedKeyBase64 = await KeyManagement.getIndividualChatKey(normalizedChatId)
    if (!sharedKeyBase64) {
      // If no key, try to set up encryption first (might not be initialized yet)
      console.log('[Encryption] No shared key found, attempting to set up encryption...')
      // Return original for now - will be retried when encryption is set up
      return encryptedMessage
    }

    const sharedKey = await EncryptionUtils.importKey(sharedKeyBase64)
    const decrypted = await EncryptionUtils.decryptMessage(encryptedMessage, sharedKey)

    return decrypted
  } catch (error) {
    console.error('[Encryption] Error decrypting individual message:', error)
    console.error('[Encryption] Error details:', {
      message: error?.message,
      chatId,
      encryptedMessageLength: encryptedMessage?.length
    })
    // Return original message if decryption fails (backward compatibility)
    return encryptedMessage
  }
}

/**
 * Encrypt a message for group chat
 * @param {string} message - Plain text message
 * @param {string} groupId - Group ID
 * @returns {Promise<string>} Encrypted message (base64)
 */
export async function encryptGroupMessage(message, groupId) {
  try {
    const sharedKeyBase64 = await KeyManagement.getGroupChatKey(groupId)
    if (!sharedKeyBase64) {
      throw new Error('Group encryption not set up. Shared key not found.')
    }

    const sharedKey = await EncryptionUtils.importKey(sharedKeyBase64)
    const encrypted = await EncryptionUtils.encryptMessage(message, sharedKey)

    return encrypted
  } catch (error) {
    console.error('Error encrypting group message:', error)
    throw error
  }
}

/**
 * Decrypt a message from group chat
 * @param {string} encryptedMessage - Encrypted message (base64)
 * @param {string} groupId - Group ID
 * @returns {Promise<string>} Decrypted plain text message
 */
export async function decryptGroupMessage(encryptedMessage, groupId) {
  try {
    const sharedKeyBase64 = await KeyManagement.getGroupChatKey(groupId)
    if (!sharedKeyBase64) {
      // If no key, return original (backward compatibility)
      return encryptedMessage
    }

    const sharedKey = await EncryptionUtils.importKey(sharedKeyBase64)
    const decrypted = await EncryptionUtils.decryptMessage(encryptedMessage, sharedKey)

    return decrypted
  } catch (error) {
    console.error('Error decrypting group message:', error)
    // Return original message if decryption fails (backward compatibility)
    return encryptedMessage
  }
}

/**
 * Check if a message is encrypted (heuristic check)
 * @param {string} message - Message to check
 * @returns {boolean} True if message appears to be encrypted
 */
export function isEncrypted(message) {
  if (!message || typeof message !== 'string') return false
  // Encrypted messages are base64, so they typically don't contain spaces
  // and have a specific length pattern
  try {
    // Try to decode base64
    atob(message)
    // If it's valid base64 and doesn't contain typical plain text patterns, it's likely encrypted
    return message.length > 20 && !message.includes(' ') && !message.includes('\n')
  } catch {
    return false
  }
}

/**
 * Handle backward compatibility - decrypt if encrypted, return as-is if not
 * @param {string} message - Potentially encrypted message
 * @param {Function} decryptFn - Decryption function to use
 * @returns {Promise<string>} Decrypted or original message
 */
export async function decryptIfEncrypted(message, decryptFn) {
  if (!message) return message
  if (isEncrypted(message)) {
    try {
      return await decryptFn(message)
    } catch (error) {
      console.warn('Failed to decrypt message, returning original:', error)
      return message
    }
  }
  return message
}

