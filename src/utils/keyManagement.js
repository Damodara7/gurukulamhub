/**
 * Key Management for End-to-End Encryption
 * Handles storage and retrieval of encryption keys using IndexedDB
 */

const DB_NAME = 'ChatEncryptionDB'
const DB_VERSION = 1
const STORE_KEYS = 'keys'
const STORE_KEYS_INDIVIDUAL = 'individualKeys'
const STORE_KEYS_GROUP = 'groupKeys'

let dbInstance = null

/**
 * Initialize IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
async function initDB() {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = (event) => {
      dbInstance = event.target.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_KEYS)) {
        const keyStore = db.createObjectStore(STORE_KEYS, { keyPath: 'id' })
        keyStore.createIndex('userId', 'userId', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_KEYS_INDIVIDUAL)) {
        const individualStore = db.createObjectStore(STORE_KEYS_INDIVIDUAL, {
          keyPath: 'chatId',
        })
        individualStore.createIndex('userEmail', 'userEmail', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_KEYS_GROUP)) {
        const groupStore = db.createObjectStore(STORE_KEYS_GROUP, {
          keyPath: 'groupId',
        })
        groupStore.createIndex('groupId', 'groupId', { unique: false })
      }
    }
  })
}

/**
 * Store user's own key pair
 * @param {string} userId - User email
 * @param {string} publicKey - Base64-encoded public key
 * @param {string} privateKey - Base64-encoded private key
 * @returns {Promise<void>}
 */
export async function storeUserKeyPair(userId, publicKey, privateKey) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS], 'readwrite')
  const store = transaction.objectStore(STORE_KEYS)

  return new Promise((resolve, reject) => {
    const request = store.put({
      id: userId,
      userId,
      publicKey,
      privateKey,
      createdAt: new Date().toISOString(),
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to store key pair'))
  })
}

/**
 * Get user's own key pair
 * @param {string} userId - User email
 * @returns {Promise<{publicKey: string, privateKey: string} | null>}
 */
export async function getUserKeyPair(userId) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS], 'readonly')
  const store = transaction.objectStore(STORE_KEYS)

  return new Promise((resolve, reject) => {
    const request = store.get(userId)

    request.onsuccess = () => {
      const result = request.result
      if (result) {
        resolve({
          publicKey: result.publicKey,
          privateKey: result.privateKey,
        })
      } else {
        resolve(null)
      }
    }

    request.onerror = () => reject(new Error('Failed to get key pair'))
  })
}

/**
 * Store shared key for individual chat
 * @param {string} chatId - Chat ID (email1_email2)
 * @param {string} userEmail - Current user's email
 * @param {string} sharedKey - Base64-encoded shared encryption key
 * @returns {Promise<void>}
 */
export async function storeIndividualChatKey(chatId, userEmail, sharedKey) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS_INDIVIDUAL], 'readwrite')
  const store = transaction.objectStore(STORE_KEYS_INDIVIDUAL)

  return new Promise((resolve, reject) => {
    const request = store.put({
      chatId,
      userEmail,
      sharedKey,
      updatedAt: new Date().toISOString(),
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to store individual chat key'))
  })
}

/**
 * Get shared key for individual chat
 * @param {string} chatId - Chat ID
 * @returns {Promise<string | null>} Base64-encoded shared key
 */
export async function getIndividualChatKey(chatId) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS_INDIVIDUAL], 'readonly')
  const store = transaction.objectStore(STORE_KEYS_INDIVIDUAL)

  return new Promise((resolve, reject) => {
    const request = store.get(chatId)

    request.onsuccess = () => {
      const result = request.result
      resolve(result ? result.sharedKey : null)
    }

    request.onerror = () => reject(new Error('Failed to get individual chat key'))
  })
}

/**
 * Store shared key for group chat
 * @param {string} groupId - Group ID
 * @param {string} sharedKey - Base64-encoded shared encryption key
 * @returns {Promise<void>}
 */
export async function storeGroupChatKey(groupId, sharedKey) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS_GROUP], 'readwrite')
  const store = transaction.objectStore(STORE_KEYS_GROUP)

  return new Promise((resolve, reject) => {
    const request = store.put({
      groupId,
      sharedKey,
      updatedAt: new Date().toISOString(),
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to store group chat key'))
  })
}

/**
 * Get shared key for group chat
 * @param {string} groupId - Group ID
 * @returns {Promise<string | null>} Base64-encoded shared key
 */
export async function getGroupChatKey(groupId) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS_GROUP], 'readonly')
  const store = transaction.objectStore(STORE_KEYS_GROUP)

  return new Promise((resolve, reject) => {
    const request = store.get(groupId)

    request.onsuccess = () => {
      const result = request.result
      resolve(result ? result.sharedKey : null)
    }

    request.onerror = () => reject(new Error('Failed to get group chat key'))
  })
}

/**
 * Delete key for individual chat (when chat is deleted)
 * @param {string} chatId - Chat ID
 * @returns {Promise<void>}
 */
export async function deleteIndividualChatKey(chatId) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS_INDIVIDUAL], 'readwrite')
  const store = transaction.objectStore(STORE_KEYS_INDIVIDUAL)

  return new Promise((resolve, reject) => {
    const request = store.delete(chatId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to delete individual chat key'))
  })
}

/**
 * Delete key for group chat (when group is deleted)
 * @param {string} groupId - Group ID
 * @returns {Promise<void>}
 */
export async function deleteGroupChatKey(groupId) {
  const db = await initDB()
  const transaction = db.transaction([STORE_KEYS_GROUP], 'readwrite')
  const store = transaction.objectStore(STORE_KEYS_GROUP)

  return new Promise((resolve, reject) => {
    const request = store.delete(groupId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to delete group chat key'))
  })
}

/**
 * Clear all keys (logout or reset)
 * @returns {Promise<void>}
 */
export async function clearAllKeys() {
  const db = await initDB()
  const transaction = db.transaction(
    [STORE_KEYS, STORE_KEYS_INDIVIDUAL, STORE_KEYS_GROUP],
    'readwrite'
  )

  return new Promise((resolve, reject) => {
    const clearKeys = transaction.objectStore(STORE_KEYS).clear()
    const clearIndividual = transaction.objectStore(STORE_KEYS_INDIVIDUAL).clear()
    const clearGroup = transaction.objectStore(STORE_KEYS_GROUP).clear()

    let completed = 0
    const onComplete = () => {
      completed++
      if (completed === 3) {
        resolve()
      }
    }

    clearKeys.onsuccess = onComplete
    clearIndividual.onsuccess = onComplete
    clearGroup.onsuccess = onComplete

    clearKeys.onerror = () => reject(new Error('Failed to clear keys'))
    clearIndividual.onerror = () => reject(new Error('Failed to clear individual keys'))
    clearGroup.onerror = () => reject(new Error('Failed to clear group keys'))
  })
}

/**
 * Check if IndexedDB is available
 * @returns {boolean} True if available
 */
export function isIndexedDBAvailable() {
  return typeof indexedDB !== 'undefined'
}

