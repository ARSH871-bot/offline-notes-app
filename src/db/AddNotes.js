/**
 * AddNotes.js
 * Adds a new note to the "notes" object store in IndexedDB.
 */
import { openDB, STORE_NAME } from './indexedDB.js'

/**
 * Save a note in IndexedDB.
 * @param {string} text - the note typed by the user
 * @returns {Promise<number>} the auto-generated id of the saved note
 */
export async function addNote(text) {
  const noteText = text.trim()
  if (!noteText) {
    throw new Error('A note cannot be empty.')
  }

  const db = await openDB()

  return new Promise((resolve, reject) => {
    // "readwrite" because we are changing the data
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const request = transaction.objectStore(STORE_NAME).add({ text: noteText })

    // Resolve only after the transaction has committed, so the note is really saved.
    transaction.oncomplete = () => resolve(request.result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}
