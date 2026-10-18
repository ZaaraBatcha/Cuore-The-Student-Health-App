// Speech helpers: voice input (Speech-to-Text) and read-aloud (Text-to-Speech)
// Both use the browser's built-in Web Speech API: no third-party services.

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
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

export function speak(text, { rate = 0.95, pitch = 1 } = {}) {
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

// Parse voice input like "140 glucose" or "blood pressure 130 over 85"
export function parseLogFromSpeech(text, condition) {
  const lowered = text.toLowerCase().trim();
  const result = { type: null, value: null, note: text };

  // Try to find a number (with optional slash or "over" for BP)
  const bpMatch = lowered.match(/(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/);
  const numMatch = lowered.match(/\b(\d{2,3})\b/);

  if (condition === 'diabetes') {
    if (lowered.includes('glucose') || lowered.includes('sugar') || lowered.includes('reading')) {
      result.type = 'glucose';
      result.value = numMatch ? numMatch[1] : null;
    } else if (lowered.includes('meal') || lowered.includes('ate') || lowered.includes('eat') || lowered.includes('had')) {
      result.type = 'meal';
      result.note = text;
    } else if (lowered.includes('feel') || lowered.includes('mood')) {
      result.type = 'mood';
      result.note = text.replace(/^(i feel|i'm|im)\s*/i, '');
    } else if (lowered.includes('walk') || lowered.includes('exercise') || lowered.includes('activity')) {
      result.type = 'activity';
      result.note = text;
    } else if (numMatch) {
      result.type = 'glucose';
      result.value = numMatch[1];
    }
  } else if (condition === 'hypertension') {
    if (bpMatch) {
      result.type = 'bp';
      result.value = `${bpMatch[1]}/${bpMatch[2]}`;
    } else if (lowered.includes('pressure') || lowered.includes('bp')) {
      result.type = 'bp';
      result.value = numMatch ? numMatch[1] : null;
    } else if (lowered.includes('meal') || lowered.includes('ate') || lowered.includes('eat') || lowered.includes('had')) {
      result.type = 'meal';
      result.note = text;
    } else if (lowered.includes('feel') || lowered.includes('mood')) {
      result.type = 'mood';
      result.note = text.replace(/^(i feel|i'm|im)\s*/i, '');
    } else if (lowered.includes('walk') || lowered.includes('exercise') || lowered.includes('activity')) {
      result.type = 'activity';
      result.note = text;
    }
  }

  return result;
}