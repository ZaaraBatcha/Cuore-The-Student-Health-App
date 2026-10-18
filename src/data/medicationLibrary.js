// A small in-app library of common medications.
// Plain-English info: what it's for, common side effects, when to call your doctor.
// This avoids needing OCR or an AI API for the hackathon demo.

export const MEDICATION_LIBRARY = [
  {
    id: 'metformin',
    names: ['Metformin', 'Glucophage'],
    for: 'Type 2 diabetes. It lowers the amount of sugar your liver releases and helps your body use insulin better.',
    howToTake: 'Usually with meals, once or twice a day.',
    commonEffects: [
      'Upset stomach, nausea, or diarrhea (often improves after a few days)',
      'Less appetite',
      'Mild metallic taste',
    ],
    callDoctorIf: [
      'You feel very weak, dizzy, or unusually tired',
      'You have stomach pain that does not go away',
      'You have fast breathing or feel confused',
    ],
  },
  {
    id: 'lisinopril',
    names: ['Lisinopril', 'Prinivil', 'Zestril'],
    for: 'High blood pressure and heart protection. It relaxes your blood vessels so your heart does not have to work as hard.',
    howToTake: 'Once a day, with or without food. Try to take it at the same time each day.',
    commonEffects: [
      'Dry cough (very common: tell your doctor if it bothers you)',
      'Mild dizziness when standing up quickly',
      'Headache',
    ],
    callDoctorIf: [
      'You feel light-headed or faint often',
      'Your face, lips, or tongue swell',
      'You have trouble breathing',
    ],
  },
  {
    id: 'atorvastatin',
    names: ['Atorvastatin', 'Lipitor'],
    for: 'High cholesterol. It lowers the bad fats in your blood and lowers your risk of heart attack or stroke.',
    howToTake: 'Once a day, around the same time. Many people take it in the evening.',
    commonEffects: [
      'Muscle aches or mild joint pain',
      'Mild stomach upset',
      'Headache',
    ],
    callDoctorIf: [
      'You have unexplained muscle pain, especially with fever or weakness',
      'Your urine turns dark brown',
      'You have yellowing of skin or eyes',
    ],
  },
  {
    id: 'amlodipine',
    names: ['Amlodipine', 'Norvasc'],
    for: 'High blood pressure and chest pain (angina). It relaxes blood vessels so blood flows more easily.',
    howToTake: 'Once a day, with or without food.',
    commonEffects: [
      'Swelling in ankles or feet',
      'Flushing (feeling warm)',
      'Mild headache or dizziness',
    ],
    callDoctorIf: [
      'Your ankles swell a lot or suddenly',
      'You feel faint or your heart races',
      'You have chest pain that is new or worse',
    ],
  },
  {
    id: 'aspirin',
    names: ['Aspirin', 'Acetylsalicylic acid'],
    for: 'Preventing heart attacks and strokes. It stops blood platelets from clumping together.',
    howToTake: 'Once a day, with food. Never on an empty stomach.',
    commonEffects: [
      'Mild stomach upset',
      'Easy bruising',
      'Heartburn',
    ],
    callDoctorIf: [
      'You see blood in your stool or it looks black',
      'You have ringing in your ears',
      'You bruise or bleed more than usual',
    ],
  },
  {
    id: 'levothyroxine',
    names: ['Levothyroxine', 'Synthroid'],
    for: 'Underactive thyroid. It replaces the thyroid hormone your body is missing.',
    howToTake: 'Once a day in the morning, on an empty stomach. Wait 30 minutes before eating or drinking coffee.',
    commonEffects: [
      'Mild hair thinning in the first months',
      'Mild headache',
    ],
    callDoctorIf: [
      'You feel shaky, anxious, or your heart races',
      'You feel extremely tired or cold',
      'You are losing or gaining weight without trying',
    ],
  },
  {
    id: 'omeprazole',
    names: ['Omeprazole', 'Prilosec'],
    for: 'Acid reflux, heartburn, and stomach ulcers. It lowers the amount of acid your stomach makes.',
    howToTake: 'Once a day before breakfast. Swallow the capsule whole: do not crush.',
    commonEffects: [
      'Mild headache',
      'Stomach upset',
      'Nausea',
    ],
    callDoctorIf: [
      'You have severe diarrhea that does not stop',
      'You feel unusually weak or dizzy',
      'You have new stomach pain',
    ],
  },
  {
    id: 'hydrochlorothiazide',
    names: ['Hydrochlorothiazide', 'HCTZ', 'Microzide'],
    for: 'High blood pressure and water retention. It helps your body remove extra salt and water.',
    howToTake: 'Once a day, usually in the morning so you do not wake up at night to urinate.',
    commonEffects: [
      'Urinating more often',
      'Mild dizziness',
      'Muscle cramps',
    ],
    callDoctorIf: [
      'You feel very dizzy or faint',
      'You have severe muscle cramps or weakness',
      'Your skin or lips look very dry or you feel very thirsty',
    ],
  },
];

// Find an entry by name (case-insensitive, partial match)
export function findMedication(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;
  // Exact match first
  const exact = MEDICATION_LIBRARY.find((m) => m.names.some((n) => n.toLowerCase() === q));
  if (exact) return exact;
  // Partial match
  const partial = MEDICATION_LIBRARY.find((m) => m.names.some((n) => n.toLowerCase().includes(q) || q.includes(n.toLowerCase())));
  return partial || null;
}