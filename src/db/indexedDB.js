/**
 * indexedDB.js
 * IndexedDB implementation - opens the connection to the notes database.
 *
 *   Database     : NotesDB
 *   Object store : notes   (key path "id", auto-incremented)
 *
 * Every note is saved as { id: number, text: string }.
 */

export const DB_NAME = 'NotesDB'
export const DB_VERSION = 1
export const STORE_NAME = 'notes'

// Re-use one open connection for the whole app instead of opening a new one per call.
let dbPromise = null

/**
 * Open (and on the first run, create) the NotesDB database.
 * @returns {Promise<IDBDatabase>} resolves with the open database connection
 */
export function openDB() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    // Runs only when the database is created or DB_VERSION is increased:
    // this is the only place where object stores can be created.
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }

    request.onsuccess = () => resolve(request.result)

    request.onerror = () => {
      dbPromise = null // allow the next call to try again
      reject(request.error)
    }
  })

  return dbPromise
}
