/**
 * App.jsx
 * Simple React UI for the Offline Notes App.
 *  - A text box and an "Add" button to add a note (saved in IndexedDB).
 *  - A list that displays all saved notes (read from IndexedDB).
 *  - An online / offline badge so the user knows the app still works offline.
 */
import { useEffect, useState } from 'react'
import { addNote } from './db/AddNotes.js'
import { getAllNotes } from './db/GetNotes.js'
import './App.css'

function App() {
  const [noteText, setNoteText] = useState('') // value of the text box
  const [notes, setNotes] = useState([]) // notes loaded from IndexedDB
  const [error, setError] = useState('') // message shown if something fails
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Load all saved notes once, when the app first opens.
  useEffect(() => {
    let isActive = true

    getAllNotes()
      .then((savedNotes) => {
        if (isActive) setNotes(savedNotes)
      })
      .catch((err) => {
        if (isActive) setError(`Could not load notes: ${err.message}`)
      })

    // Ignore the result if the component is removed before it arrives.
    return () => {
      isActive = false
    }
  }, [])

  // Keep the online / offline badge up to date.
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  /**
   * Save the typed note, then refresh the list from IndexedDB.
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault() // stop the browser from reloading the page
    if (!noteText.trim()) return

    try {
      await addNote(noteText)
      setNotes(await getAllNotes()) // re-read so the list always matches the database
      setNoteText('')
      setError('')
    } catch (err) {
      setError(`Could not save the note: ${err.message}`)
    }
  }

  return (
    <main className="app">
      <h1>Offline Notes App</h1>

      <p className={`status ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? 'Online' : 'Offline - notes are loaded from IndexedDB'}
      </p>

      {/* Add-note form: simple text box + Add button */}
      <form className="note-form" onSubmit={handleSubmit}>
        <label htmlFor="note-input" className="visually-hidden">
          New note
        </label>
        <input
          id="note-input"
          type="text"
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          placeholder="Write a note..."
          autoComplete="off"
        />
        <button type="submit" disabled={!noteText.trim()}>
          Add
        </button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {/* List of all notes stored in IndexedDB */}
      {notes.length === 0 ? (
        <p className="empty">No notes yet. Add your first note above.</p>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
