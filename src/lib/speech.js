// Speech helpers: voice input (Speech-to-Text) and read-aloud (Text-to-Speech)
//
// Two engines are available:
//   1. ElevenLabs (optional). Used when a key is saved in Settings.
//   2. The browser's built-in Web Speech API. The default, and the fallback
//      whenever no key is present or an ElevenLabs request fails.
//
// The day-agent stays entirely on-device either way; this file only handles
// voice in and voice out.

import { hasKey, elevenSpeak } from './elevenlabs';

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// True when the ElevenLabs layer should be preferred over the browser voice.
export function isElevenLabsVoiceActive() {
  return hasKey();
}

export function createSpeechRecognition({ onResult, onError, onEnd } = {}) {
  if (!isSpeechRecognitionSupported()) return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = 'en-US';
  rec.maxAlternatives = 1;

  rec.onresult = (e) => {
    const text = e.results[0][0].transcript;
    onResult?.(text);
  };
  rec.onerror = (e) => onError?.(e.error);
  rec.onend = () => onEnd?.();

  return rec;
}

// Read text aloud. Uses ElevenLabs when a key is saved, otherwise the
// browser's built-in voice. Returns nothing for callers to await; failures
// fall back silently so a dead network never blocks the app.
export function speak(text, { rate = 0.95, pitch = 1 } = {}) {
  if (!text) return;
  if (hasKey()) {
    elevenSpeak(text).then((played) => {
      if (!played) browserSpeak(text, { rate, pitch });
    });
    return;
  }
  browserSpeak(text, { rate, pitch });
}

function browserSpeak(text, { rate = 0.95, pitch = 1 } = {}) {
  if (!isSpeechSynthesisSupported() || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = pitch;
  utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

