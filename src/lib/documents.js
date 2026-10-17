// Medical document vault — stores uploaded images in IndexedDB so they persist
// without needing a server. Images stay on the user's device only.

const DB_NAME = 'wisetrack.documents';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('type', 'type');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function saveDocument({ id, type, title, date, notes, blob, mimeType }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = {
      id,
      type,
      title: title || 'Untitled',
      date: date || new Date().toISOString().slice(0, 10),
      notes: notes || '',
      blob,
      mimeType: mimeType || 'image/jpeg',
      createdAt: new Date().toISOString(),
    };
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllDocuments() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const docs = (req.result || []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      // Strip the blob from the list to keep it light — fetch full blob on demand
      resolve(docs.map(({ blob, ...rest }) => rest));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getDocumentBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDocument(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Convert a File or Blob into a normalized Blob stored in IndexedDB.
// Returns { blob, mimeType } or throws if unsupported.
export function normalizeFile(file) {
  const mime = file.type || 'image/jpeg';
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
  if (!allowed.includes(mime)) {
    // Last resort — still accept, treat as octet-stream so we can store it
    return { blob: file, mimeType: 'application/octet-stream' };
  }
  return { blob: file, mimeType: mime };
}

// Build an object URL for a stored blob. Caller must revoke when done.
export async function loadDocumentURL(id) {
  const blob = await getDocumentBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}