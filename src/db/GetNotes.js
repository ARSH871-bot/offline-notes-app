/**
 * GetNotes.js
 * Reads every note from the "notes" object store in IndexedDB.
 */
import { openDB, STORE_NAME } from './indexedDB.js'

/**
 * Get all saved notes.
 * @returns {Promise<Array<{id: number, text: string}>>} notes in the order they were added
 */
export async function getAllNotes() {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    // "readonly" because we are only reading data
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
