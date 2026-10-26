# Offline Notes App

A Progressive Web App (PWA) built with **React + Vite 7 (SWC)** that lets you:

- **Add notes** using a simple text box
- **View all notes** in a list
- **Access notes offline** – notes are stored in **IndexedDB** and the app files are cached by a **service worker**

IA730001 Advanced Application Development – Weekly Checkpoint 2.

## Tech stack

| Part | Technology |
| --- | --- |
| UI | React 19 (function components + hooks) |
| Build tool | Vite 7 with `@vitejs/plugin-react-swc` |
| PWA | `vite-plugin-pwa` (injectManifest strategy) + custom service worker |
| Storage | IndexedDB – database `NotesDB`, object store `notes` |
| Offline caching | Cache Storage API (`offline-notes-static-v1`, `offline-notes-runtime-v1`) |

## Project setup (commands used)

```bash
npm create vite@7.1.3 offline-notes-app -- --template react-swc
cd offline-notes-app
npm install
npm install -D vite-plugin-pwa
```

## Run the app

```bash
npm install          # install dependencies
npm run dev          # development server  -> http://localhost:5173
npm run build        # production build (generates dist/service-worker.js)
npm run preview      # serve the production build -> http://localhost:4173
npm run lint         # check coding standards with ESLint
```

## Test offline access

1. `npm run build` then `npm run preview` and open http://localhost:4173
2. Add a few notes.
3. Open DevTools → **Application** → *Service workers* (status: activated and running),
   *Cache storage* (`offline-notes-static-v1`) and *IndexedDB → NotesDB → notes*.
4. DevTools → **Network** → tick **Offline** (or Application → Service workers → Offline), then reload.
   The app still loads and all notes are shown. New notes can be added while offline.

## Project structure

```
offline-notes-app/
├── index.html
├── vite.config.js            # Vite + PWA configuration
├── public/                   # icons (copied as-is to dist/)
└── src/
    ├── main.jsx              # renders <App /> and registers the service worker
    ├── App.jsx               # simple React UI (text box, Add button, notes list)
    ├── App.css / index.css   # styles
    ├── service-worker.js     # install / activate / fetch (caching)
    └── db/
        ├── indexedDB.js      # openDB() – creates NotesDB and the "notes" store
        ├── AddNotes.js       # addNote(text)
        └── GetNotes.js       # getAllNotes()
```
