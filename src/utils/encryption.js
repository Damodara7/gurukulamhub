/**
 * End-to-End Encryption Utilities
 * Uses Web Crypto API for secure message encryption/decryption
 * Similar to WhatsApp's encryption approach
 */

/**
 * Generate a random encryption key for AES-GCM
 * @returns {Promise<CryptoKey>} The generated encryption key
 */
export async function generateEncryptionKey() {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256, // 256-bit key
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

/**
 * Derive a deterministic AES-GCM key from a string.
 *
 * This is used for chat keys so that all participants can independently
 * derive the same encryption key from a shared identifier (e.g. chatId
 * or groupId) without needing an additional key exchange.
 *
 * NOTE: This is a pragmatic solution for this app. In a production
 * system you would typically distribute a random key via a secure
 * channel rather than deriving it directly from an identifier.
 *
 * @param {string} source - String to derive the key from
 * @returns {Promise<CryptoKey>} Derived encryption key
 */
export async function deriveDeterministicKeyFromString(source) {
  const encoder = new TextEncoder()
  const salt = encoder.encode('gurukulamhub-chat-encryption-v1')
  const passwordData = encoder.encode(source || 'default')

  // Import the source string as key material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  // Derive a stable AES-GCM key from the key material
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Generate an ECDH key pair for key exchange
 * @returns {Promise<{publicKey: CryptoKey, privateKey: CryptoKey}>} Key pair
 */
export async function generateKeyPair() {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256', // Same as WhatsApp uses
    },
    true, // extractable
    ['deriveKey', 'deriveBits']
  )
}

/**
 * Derive a shared secret from ECDH key exchange
 * @param {CryptoKey} privateKey - Our private key
 * @param {CryptoKey} publicKey - Other party's public key
 * @returns {Promise<CryptoKey>} Shared encryption key
 */
export async function deriveSharedKey(privateKey, publicKey) {
  return await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

/**
 * Export a public key to send to other party
 * @param {CryptoKey} publicKey - The public key to export
 * @returns {Promise<string>} Base64-encoded public key
 */
export async function exportPublicKey(publicKey) {
  const exported = await crypto.subtle.exportKey('spki', publicKey)
  return arrayBufferToBase64(exported)
}

/**
 * Import a public key from base64 string
 * @param {string} base64Key - Base64-encoded public key
 * @returns {Promise<CryptoKey>} Imported public key
 */
export async function importPublicKey(base64Key) {
  const keyData = base64ToArrayBuffer(base64Key)
  return await crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, // extractable
    []
  )
}

/**
 * Export a private key for storage
 * @param {CryptoKey} privateKey - The private key to export
 * @returns {Promise<string>} Base64-encoded private key (encrypted with user's password in production)
 */
export async function exportPrivateKey(privateKey) {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey)
  return arrayBufferToBase64(exported)
}

/**
 * Import a private key from base64 string
 * @param {string} base64Key - Base64-encoded private key
 * @returns {Promise<CryptoKey>} Imported private key
 */
export async function importPrivateKey(base64Key) {
  const keyData = base64ToArrayBuffer(base64Key)
  return await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, // extractable
    ['deriveKey', 'deriveBits']
  )
}

/**
 * Encrypt a message using AES-GCM
 * @param {string} message - Plain text message to encrypt
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<string>} Base64-encoded encrypted message with IV
 */
export async function encryptMessage(message, key) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)

  // Generate a random IV (Initialization Vector) for each message
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV for AES-GCM

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // 128-bit authentication tag
    },
    key,
    data
  )

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return arrayBufferToBase64(combined.buffer)
}

/**
 * Decrypt a message using AES-GCM
 * @param {string} encryptedData - Base64-encoded encrypted message with IV
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<string>} Decrypted plain text message
 */
export async function decryptMessage(encryptedData, key) {
  const combined = base64ToArrayBuffer(encryptedData)
  const iv = combined.slice(0, 12) // First 12 bytes are IV
  const ciphertext = combined.slice(12) // Rest is encrypted data

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      ciphertext
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt message. The message may be corrupted or the key is incorrect.')
  }
}

/**
 * Export an AES key to base64 for storage
 * @param {CryptoKey} key - The key to export
 * @returns {Promise<string>} Base64-encoded key
 */
export async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

/**
 * Import an AES key from base64
 * @param {string} base64Key - Base64-encoded key
 * @returns {Promise<CryptoKey>} Imported key
 */
export async function importKey(base64Key) {
  const keyData = base64ToArrayBuffer(base64Key)
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} Base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to ArrayBuffer
 * @param {string} base64 - Base64 string to convert
 * @returns {ArrayBuffer} ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Check if Web Crypto API is available
 * @returns {boolean} True if available
 */
export function isCryptoAvailable() {
  return typeof crypto !== 'undefined' && crypto.subtle !== undefined
}

