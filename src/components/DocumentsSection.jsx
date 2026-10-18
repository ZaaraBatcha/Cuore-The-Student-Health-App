import { useEffect, useRef, useState } from 'react';
import { saveDocument, getAllDocuments, loadDocumentURL, deleteDocument, normalizeFile } from '../lib/documents';

const DOC_TYPES = [
  { id: 'prescription', label: 'Prescription', icon: '💊' },
  { id: 'letter', label: 'Letter', icon: '✉️' },
  { id: 'lab_result', label: 'Lab result', icon: '🧪' },
  { id: 'imaging', label: 'Scan', icon: '🩻' },
  { id: 'other', label: 'Note', icon: '📄' },
];

export default function DocumentsSection() {
  const [docs, setDocs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [, setRefresh] = useState(0);

  useEffect(() => {
    getAllDocuments().then(setDocs).catch(console.error);
  }, []);

  function handleAdded() {
    setShowAdd(false);
    getAllDocuments().then(setDocs);
  }

  function handleDelete(id) {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    deleteDocument(id).then(() => {
      getAllDocuments().then(setDocs);
      setViewing(null);
    });
  }

  return (
    <div className="card-mint mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📁</span>
          <div>
            <div className="font-bold text-mint-900">My files</div>
            <div className="text-xs text-mint-700">
              {docs.length === 0
                ? 'GP letters, lab reports: all in one place.'
                : `${docs.length} document${docs.length === 1 ? '' : 's'} saved locally`}
            </div>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
          ＋ Add
        </button>
      </div>

      {docs.length === 0 && !showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-2 px-4 py-6 rounded-xl border-2 border-dashed border-mint-300 bg-white/60 text-mint-700 hover:bg-white transition-colors"
        >
          <div className="text-3xl mb-1">📷</div>
          <div className="font-medium">Scan or upload a document</div>
          <div className="text-xs mt-1 text-mint-600">
            GP letters (e.g. for uni extenuating-circumstances forms), lab reports, or PDFs
          </div>
        </button>
      )}

      {docs.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {docs.map((doc) => (
            <DocumentThumb key={doc.id} doc={doc} onOpen={() => setViewing(doc)} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddDocumentForm onClose={() => setShowAdd(false)} onSaved={handleAdded} />
      )}

      {viewing && (
        <DocumentViewer doc={viewing} onClose={() => setViewing(null)} onDelete={handleDelete} />
      )}
    </div>
  );
}

function DocumentThumb({ doc, onOpen }) {
  const [thumb, setThumb] = useState(null);

  useEffect(() => {
    let url = null;
    let cancelled = false;
    loadDocumentURL(doc.id).then((u) => {
      if (cancelled) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      url = u;
      setThumb(u);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [doc.id]);

  const typeMeta = DOC_TYPES.find((t) => t.id === doc.type) || DOC_TYPES[4];

  return (
    <button
      onClick={onOpen}
      className="aspect-square rounded-xl overflow-hidden bg-white border-2 border-mint-200 hover:border-mint-400 hover:shadow-md transition-all relative group"
    >
      {thumb && doc.mimeType !== 'application/pdf' ? (
        <img src={thumb} alt={doc.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-mint-700 bg-mint-50">
          <span className="text-3xl mb-1">{typeMeta.icon}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide">PDF</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
        <div className="text-white text-[10px] font-medium truncate text-left">{doc.title}</div>
      </div>
    </button>
  );
}

function AddDocumentForm({ onClose, onSaved }) {
  const [type, setType] = useState('prescription');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function save() {
    if (!file) {
      alert('Please choose a file (photo or PDF).');
      return;
    }
    setSaving(true);
    try {
      const { blob, mimeType } = normalizeFile(file);
      await saveDocument({
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        title: title.trim() || (file.name || 'Document').replace(/\.[^.]+$/, ''),
        date,
        notes: notes.trim(),
        blob,
        mimeType,
      });
      if (preview) URL.revokeObjectURL(preview);
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Could not save. Try a smaller file.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-mint-900">Add document</h3>
          <button onClick={onClose} className="text-mint-400 text-2xl px-2">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {DOC_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    type === t.id ? 'border-mint-500 bg-mint-50' : 'border-mint-100 hover:border-mint-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className="text-xs font-medium text-mint-800">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GP letter March 2026"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">File</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="btn-secondary flex flex-col items-center py-4 text-sm"
              >
                <span className="text-2xl mb-1">📷</span>
                Take photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex flex-col items-center py-4 text-sm"
              >
                <span className="text-2xl mb-1">📁</span>
                Upload file
              </button>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFile}
              className="hidden"
            />
            {file && (
              <div className="mt-3 p-3 rounded-xl bg-mint-50 border border-mint-200">
                <div className="flex items-center gap-3">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-mint-200 flex items-center justify-center text-2xl">📄</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-mint-900 truncate text-sm">{file.name}</div>
                    <div className="text-xs text-mint-600">
                      {(file.size / 1024).toFixed(0)} KB · {file.type || 'unknown'}
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); if (preview) URL.revokeObjectURL(preview); setPreview(null); }} className="text-mint-400 hover:text-clay-600 px-2">×</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything important about this document"
              className="input resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 mt-4 border-t border-mint-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={!file || saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentViewer({ doc, onClose, onDelete }) {
  const [url, setUrl] = useState(null);
  const typeMeta = DOC_TYPES.find((t) => t.id === doc.type) || DOC_TYPES[4];

  useEffect(() => {
    let createdUrl = null;
    let cancelled = false;
    loadDocumentURL(doc.id).then((u) => {
      if (cancelled) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      createdUrl = u;
      setUrl(u);
    });
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [doc.id]);

  const isPdf = doc.mimeType === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-mint-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{typeMeta.icon}</span>
            <div className="min-w-0">
              <div className="font-bold text-mint-900 truncate">{doc.title}</div>
              <div className="text-xs text-mint-600">{doc.date}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-mint-400 text-2xl px-2">×</button>
        </div>

        <div className="flex-1 overflow-auto bg-mint-50 flex items-center justify-center p-4">
          {url ? (
            isPdf ? (
              <iframe src={url} title={doc.title} className="w-full h-full min-h-[400px] bg-white rounded" />
            ) : (
              <img src={url} alt={doc.title} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
            )
          ) : (
            <div className="text-mint-500 text-sm">Loading…</div>
          )}
        </div>

        {doc.notes && (
          <div className="px-4 py-3 bg-mint-50 border-t border-mint-100 text-sm text-mint-800">
            <div className="font-medium text-mint-700 mb-1">Notes</div>
            <div>{doc.notes}</div>
          </div>
        )}

        <div className="p-4 border-t border-mint-100 flex gap-2">
          <button onClick={() => onDelete(doc.id)} className="btn-secondary flex-1 text-clay-600">
            🗑️ Delete
          </button>
          <button onClick={onClose} className="btn-primary flex-1">Close</button>
        </div>
      </div>
    </div>
  );
}