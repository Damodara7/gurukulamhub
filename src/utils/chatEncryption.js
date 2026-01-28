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
 * @param {string} otherUserPublicKey - Other user's public key (base64) - kept for backward compatibility, not used in deterministic mode
 * @returns {Promise<boolean>} True if successful
 */
export async function setupIndividualChatEncryption(chatId, userEmail, otherUserPublicKey) {
  try {
    // Normalize chatId to ensure consistent format
    const normalizedChatId = normalizeChatId(chatId)
    
    // Always derive the same deterministic key from the normalized chatId.
    // This guarantees both participants end up with IDENTICAL keys for the
    // same chat, regardless of who created or joined first, and also
    // overwrites any old mismatched keys that may exist in IndexedDB.
    const derivedKey = await EncryptionUtils.deriveDeterministicKeyFromString(
      `individual:${normalizedChatId}`
    )

    const sharedKey = await EncryptionUtils.exportKey(derivedKey)
    await KeyManagement.storeIndividualChatKey(normalizedChatId, userEmail, sharedKey)
    console.log('[Encryption] Deterministic shared key stored for chatId:', normalizedChatId)

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
    // Derive a deterministic key from the groupId so that all members
    // independently arrive at the same encryption key.
    //
    // This replaces the old behaviour where each client generated its own
    // random key and stored it, which meant only the sender could decrypt
    // their own messages.
    const groupKey = await EncryptionUtils.deriveDeterministicKeyFromString(
      `group:${groupId}`
    )
    const sharedKey = await EncryptionUtils.exportKey(groupKey)
    await KeyManagement.storeGroupChatKey(groupId, sharedKey)
    console.log('[Encryption] Deterministic group key stored for groupId:', groupId)

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
    let sharedKeyBase64 = await KeyManagement.getIndividualChatKey(normalizedChatId)
    
    // Always derive and use the deterministic key (for new messages)
    // This ensures all clients use the same key
    console.log('[Encryption] Deriving deterministic key for chatId:', normalizedChatId)
    try {
      const derivedKey = await EncryptionUtils.deriveDeterministicKeyFromString(
        `individual:${normalizedChatId}`
      )
      const deterministicKeyBase64 = await EncryptionUtils.exportKey(derivedKey)
      
      // Try decrypting with deterministic key first (for new messages)
      try {
        const deterministicKey = await EncryptionUtils.importKey(deterministicKeyBase64)
        const decrypted = await EncryptionUtils.decryptMessage(encryptedMessage, deterministicKey)
        console.log('[Encryption] Successfully decrypted with deterministic key for chatId:', normalizedChatId)
        // Store the deterministic key for future use
        if (!sharedKeyBase64 || sharedKeyBase64 !== deterministicKeyBase64) {
          await KeyManagement.storeIndividualChatKey(normalizedChatId, 'system', deterministicKeyBase64)
        }
        return decrypted
      } catch (deterministicError) {
        console.log('[Encryption] Deterministic key decryption failed, trying stored key if available:', deterministicError.message)
        
        // If deterministic key fails and we have a stored key, try that (for old messages)
        if (sharedKeyBase64 && sharedKeyBase64 !== deterministicKeyBase64) {
          try {
            const storedKey = await EncryptionUtils.importKey(sharedKeyBase64)
            const decrypted = await EncryptionUtils.decryptMessage(encryptedMessage, storedKey)
            console.log('[Encryption] Successfully decrypted with stored key for chatId:', normalizedChatId)
            return decrypted
          } catch (storedError) {
            console.warn('[Encryption] Both deterministic and stored keys failed for chatId:', normalizedChatId)
            // Fall through to return original
          }
        }
        // If no stored key or stored key also failed, return original
        return encryptedMessage
      }
    } catch (setupError) {
      console.error('[Encryption] Failed to derive deterministic key:', setupError)
      // If we have a stored key, try that as fallback
      if (sharedKeyBase64) {
        try {
          const storedKey = await EncryptionUtils.importKey(sharedKeyBase64)
          const decrypted = await EncryptionUtils.decryptMessage(encryptedMessage, storedKey)
          return decrypted
        } catch (storedError) {
          console.warn('[Encryption] Stored key also failed:', storedError)
        }
      }
      return encryptedMessage
    }
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
    let sharedKeyBase64 = await KeyManagement.getGroupChatKey(groupId)
    
    // If no key exists, automatically derive the deterministic key
    if (!sharedKeyBase64) {
      console.log('[Encryption] No group key found, deriving deterministic key for groupId:', groupId)
      try {
        const groupKey = await EncryptionUtils.deriveDeterministicKeyFromString(
          `group:${groupId}`
        )
        sharedKeyBase64 = await EncryptionUtils.exportKey(groupKey)
        await KeyManagement.storeGroupChatKey(groupId, sharedKeyBase64)
      } catch (setupError) {
        console.error('[Encryption] Failed to derive deterministic group key:', setupError)
        return encryptedMessage
      }
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

