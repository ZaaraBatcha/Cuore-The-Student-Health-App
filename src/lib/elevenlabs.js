// Optional ElevenLabs voice layer (speech-to-text and text-to-speech).
//
// Two ways a key can arrive:
//   1. A default key for this build, read from VITE_ELEVENLABS_API_KEY in .env
//      (gitignored). Handy for a demo: ElevenLabs works with no setup.
//   2. A key the person using the app pastes in Settings. It is kept only in
//      that browser and always wins over the build default.
//
// When neither is present, or a request fails, callers fall back to the
// browser's built-in Web Speech API, so the app still works offline.

const KEY_STORE = 'wisetrack.elevenlabsKey';
const VOICE_STORE = 'wisetrack.elevenlabsVoice';
const API_BASE = 'https://api.elevenlabs.io';

// Baked in at build time from .env. Never hardcode a key in source: the
// bundle is public, so a deployed build exposes whatever ends up here.
const BUILT_IN_KEY =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ELEVENLABS_API_KEY
    ? String(import.meta.env.VITE_ELEVENLABS_API_KEY).trim()
    : '';

// A clear default voice that free ElevenLabs plans can use (Sarah). Library
// voices such as Rachel return a payment error on the free tier.
export const FALLBACK_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

// Tried in order: the first one the account accepts is remembered for the session.
const TTS_MODELS = ['eleven_flash_v2_5', 'eleven_multilingual_v2'];
let workingModel = null;

// ElevenLabs API keys are "sk_" plus 48 characters, 51 in total. Their API
// rejects anything else with "API key must be exactly 51 characters", so we
// check the shape ourselves and never send a key that cannot work.
export const KEY_LENGTH = 51;

export function isKeyShape(key) {
  return typeof key === 'string' && key.length === KEY_LENGTH && key.startsWith('sk_');
}

// The key the person pasted in Settings, if any (raw, even if the shape is wrong).
export function getUserKey() {
  try {
    return localStorage.getItem(KEY_STORE) || '';
  } catch {
    return '';
  }
}

// The key actually used: your own key wins, the build default fills the gap.
// Anything that is not a valid key shape is ignored rather than sent.
export function getKey() {
  const user = getUserKey();
  if (isKeyShape(user)) return user;
  if (isKeyShape(BUILT_IN_KEY)) return BUILT_IN_KEY;
  return '';
}

export function saveKey(key) {
  try {
    localStorage.setItem(KEY_STORE, (key || '').trim());
  } catch {
    /* ignore */
  }
}

export function clearKey() {
  try {
    localStorage.removeItem(KEY_STORE);
  } catch {
    /* ignore */
  }
}

// True when this build ships with a usable default key.
export function hasBuiltInKey() {
  return isKeyShape(BUILT_IN_KEY);
}

// True when the person has pasted their own usable key.
export function hasUserKey() {
  return isKeyShape(getUserKey());
}

export function hasKey() {
  return getKey().length > 0;
}

export function getVoiceId() {
  try {
    return localStorage.getItem(VOICE_STORE) || FALLBACK_VOICE_ID;
  } catch {
    return FALLBACK_VOICE_ID;
  }
}

export function saveVoiceId(id) {
  try {
    localStorage.setItem(VOICE_STORE, id || FALLBACK_VOICE_ID);
  } catch {
    /* ignore */
  }
}

export function isRecordingSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  );
}

// Turn an API error into something a student can act on. ElevenLabs sends a
// detail object with a machine status, which distinguishes a bad key from a
// key that is simply missing one permission.
function friendlyError(status, detail = {}) {
  const message = detail.message || '';
  const state = detail.status || '';
  const code = detail.code || '';
  if (/exactly 51 characters/i.test(message)) {
    return 'That key is the wrong length. ElevenLabs API keys are 51 characters (sk_ plus 48). Copy the key again from the ElevenLabs dashboard.';
  }
  if (state === 'missing_permissions') {
    return `${message || 'This key is missing a permission.'} Enable it on the key in your ElevenLabs dashboard.`;
  }
  if (state === 'payment_required' || code === 'paid_plan_required') {
    return 'That voice needs paid credits on your ElevenLabs plan. Pick a voice your plan allows, such as Sarah, or add credits.';
  }
  if (status === 401 || status === 403) return 'ElevenLabs rejected the key. Check it in Settings.';
  if (status === 429) return 'ElevenLabs quota reached. The browser voice will be used instead.';
  if (status === 422) return `ElevenLabs could not process that request. ${message}`.trim();
  if (!status) return 'Could not reach ElevenLabs. Check your connection.';
  return `ElevenLabs error ${status}. ${message}`.trim();
}

async function readDetail(res) {
  try {
    const data = await res.json();
    const d = data && data.detail;
    if (!d) return {};
    if (typeof d === 'string') return { message: d };
    return { message: d.message || '', code: d.code || '', status: d.status || '' };
  } catch {
    return {};
  }
}

// List the account's voices for the Settings picker.
export async function listVoices() {
  const key = getKey();
  if (!hasKey()) throw new Error('No ElevenLabs key saved yet.');
  const res = await fetch(`${API_BASE}/v1/voices`, {
    headers: { 'xi-api-key': key },
  });
  if (!res.ok) throw new Error(friendlyError(res.status, await readDetail(res)));
  const data = await res.json();
  return (data.voices || []).map((v) => ({
    id: v.voice_id,
    name: v.name,
    category: v.category,
  }));
}

// Speak text through ElevenLabs. Resolves true when audio played, false when
// the caller should fall back to the browser voice. Pass { silent: false } to
// have real failures thrown so a caller can show the reason.
export async function elevenSpeak(text, { silent = true } = {}) {
  if (!hasKey() || !text) return false;
  const voiceId = getVoiceId();
  const models = workingModel ? [workingModel] : TTS_MODELS;
  let lastError = null;

  for (const model of models) {
    try {
      const res = await fetch(
        `${API_BASE}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': getKey(),
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: model,
            voice_settings: { stability: 0.5, similarity_boost: 0.7 },
          }),
        }
      );
      if (!res.ok) {
        lastError = new Error(friendlyError(res.status, await readDetail(res)));
        // A model-name problem is the one failure worth retrying with the next model.
        if (res.status === 422 || res.status === 400) continue;
        break;
      }
      workingModel = model;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      try {
        await new Promise((resolve, reject) => {
          const audio = new Audio(url);
          audio.onended = resolve;
          audio.onerror = () => reject(new Error('Audio playback failed.'));
          audio.play().catch(reject);
        });
      } finally {
        URL.revokeObjectURL(url);
      }
      return true;
    } catch (e) {
      lastError = e;
      break;
    }
  }

  if (lastError) {
    console.warn('ElevenLabs speak failed, using browser voice:', lastError.message);
    if (!silent) throw lastError;
  }
  return false;
}

// Record from the microphone. Returns a handle with stop() and cancel().
export async function startRecording() {
  if (!isRecordingSupported()) throw new Error('Recording is not supported in this browser.');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  const mimeType = preferred.find((t) => window.MediaRecorder.isTypeSupported?.(t)) || '';
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  const releaseTracks = () => stream.getTracks().forEach((t) => t.stop());

  return {
    stop() {
      return new Promise((resolve) => {
        recorder.onstop = () => {
          releaseTracks();
          resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
        };
        try {
          recorder.stop();
        } catch {
          releaseTracks();
          resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
        }
      });
    },
    cancel() {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
      releaseTracks();
    },
  };
}

// Transcribe a recorded clip with Scribe.
export async function transcribe(blob) {
  if (!hasKey()) throw new Error('No ElevenLabs key saved yet.');
  if (!blob || blob.size === 0) throw new Error('Nothing was recorded. Try again.');
  const form = new FormData();
  form.append('file', blob, 'cuore-note.webm');
  form.append('model_id', 'scribe_v2');
  const res = await fetch(`${API_BASE}/v1/speech-to-text`, {
    method: 'POST',
    headers: { 'xi-api-key': getKey() },
    body: form,
  });
  if (!res.ok) throw new Error(friendlyError(res.status, await readDetail(res)));
  const data = await res.json();
  const text = (data.text || '').trim();
  if (!text) throw new Error('No speech found in that recording. Try again.');
  return text;
}
