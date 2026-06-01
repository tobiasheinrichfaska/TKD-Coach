import { GameDefinition } from '../types';

// All built-in Übungen (factory defaults, seeded once). `sessionPhases` = the 1–5 protocol
// phases the Übung may be used in; `techniques`/`bodyParts` drive the add-picker filters + display.
export const BUILTIN_GAMES: GameDefinition[] = [
  // ===== Neuro warm-up games (Phase 2 · Dynamic) =====
  {
    id: 'W1', name: 'Farben-Chagi', shortName: 'Farben', sessionPhases: [2],
    defaultMinutes: 7, ageGroup: 'all', logMetricType: 'reaction_errors',
    techniques: ['ap-chagi', 'dollyo-chagi', 'yop-chagi', 'dwit-chagi'], bodyParts: ['visual', 'reaction', 'hip', 'knee', 'ankle', 'hip-flexors'],
    isBuiltIn: true, description: 'Visual cue to kick selection — select and fire a full motor program under uncertainty.',
  },
  {
    id: 'W2', name: 'Spiegel-Stand', shortName: 'Spiegel', sessionPhases: [2],
    defaultMinutes: 5, ageGroup: 'all',
    techniques: ['ap-seogi', 'juchum-seogi', 'ap-kubi', 'dwit-kubi', 'makki', 'momtong-makki'], bodyParts: ['visual', 'proprioception', 'hip', 'knee', 'spine', 'shoulders', 'core'],
    isBuiltIn: true, description: 'Mirror stance — visual-proprioceptive mirroring suppresses prediction.',
  },
  {
    id: 'W3', name: 'Leiter-Stand-Exit', shortName: 'Leiter', sessionPhases: [2],
    defaultMinutes: 8, ageGroup: 'all',
    techniques: ['seogi', 'footwork', 'ap-kubi', 'dwit-kubi', 'beom-seogi'], bodyParts: ['proprioception', 'coordination', 'ankle', 'knee', 'hip', 'calves', 'feet'],
    isBuiltIn: true, description: 'Coordination ladder into a named stance; exit forces immediate recomposure.',
  },
  // ===== Neuro main games (Phase 3 · Main) =====
  {
    id: 'M1', name: 'Zahlen-Kombi', shortName: 'Zahlen', sessionPhases: [3],
    defaultMinutes: 11, ageGroup: 'all', logMetricType: 'combo_accuracy',
    techniques: ['ap-chagi', 'dollyo-chagi', 'yop-chagi', 'dwit-chagi', 'bandal-chagi', 'huryeo-chagi', 'jireugi'], bodyParts: ['working-memory', 'coordination', 'hip', 'knee', 'core', 'hip-flexors', 'ankle'],
    isBuiltIn: true, description: 'Working memory + kick combination sequencing under full technique.',
  },
  {
    id: 'M2', name: 'Vestibular Dollyo', shortName: 'Vestibular', sessionPhases: [3],
    defaultMinutes: 12, ageGroup: 'youth-adults', logMetricType: 'vestibular_landing',
    techniques: ['dollyo-chagi', 'dwit-huryeo-chagi', 'momdollyo-chagi'], bodyParts: ['vestibular', 'balance', 'gaze-stability', 'ankle', 'knee', 'hip', 'core', 'neck', 'hip-rotators'],
    isBuiltIn: true, description: 'Post-rotation balance → full Dollyo kick. Vestibular reflex for spinning-kick stability.',
  },
  {
    id: 'M3', name: 'Einbein-Poomsae', shortName: 'Einbein', sessionPhases: [3],
    defaultMinutes: 12, ageGroup: 'all', logMetricType: 'balance_poomsae',
    techniques: ['poomsae', 'seogi'], bodyParts: ['proprioception', 'vestibular', 'balance', 'ankle', 'knee', 'hip', 'core', 'glutes', 'feet'],
    isBuiltIn: true, description: 'Single-leg Poomsae — proprioceptive overload under cognitive load.',
  },
  {
    id: 'M4', name: 'Poomsae unter Störung', shortName: 'Störung', sessionPhases: [3],
    defaultMinutes: 18, ageGroup: 'all', logMetricType: 'poomsae_distraction',
    techniques: ['poomsae'], bodyParts: ['attention', 'visual', 'full-body'],
    isBuiltIn: true, description: 'Motor-program persistence under visual distraction.',
  },
  {
    id: 'M5', name: 'Reaktions-Zahl-Kreis', shortName: 'Reaktion', sessionPhases: [3],
    defaultMinutes: 8, ageGroup: 'all',
    techniques: ['arae-makki', 'momtong-makki', 'olgul-makki', 'an-makki', 'bakkat-makki', 'sonnal-makki'], bodyParts: ['reaction', 'attention', 'shoulders', 'arms', 'core', 'wrist'],
    isBuiltIn: true, description: 'Auditory cue → block selection. Group re-engagement tool.',
  },
  {
    id: 'M6', name: 'Vestibularer Gangpfad', shortName: 'Gangpfad', sessionPhases: [3],
    defaultMinutes: 10, ageGroup: 'all',
    techniques: ['footwork'], bodyParts: ['vestibular', 'gaze-stability', 'visual', 'balance', 'ankle', 'knee', 'hip', 'neck', 'feet'],
    isBuiltIn: true, description: 'Gaze-fixed directional walk — VOR + gaze stabilization during movement.',
  },
  // ===== Neuro cool-down (Phase 4 · Static) =====
  {
    id: 'C1', name: 'Balance-Hold Challenge', shortName: 'Balance', sessionPhases: [4],
    defaultMinutes: 8, ageGroup: 'all', logMetricType: 'balance_hold',
    techniques: ['seogi', 'poomsae'], bodyParts: ['proprioception', 'balance', 'ankle', 'knee', 'hip', 'core', 'glutes', 'feet'],
    isBuiltIn: true, description: 'Single-leg timed hold — the PRIMARY progress metric for the program.',
  },
  // ===== Breathing / meditation (Phase 5) =====
  {
    id: 'C2', name: 'Atem-Augen-Fokus', shortName: 'Atem', sessionPhases: [5],
    defaultMinutes: 9, ageGroup: 'all',
    techniques: [], bodyParts: ['recovery', 'gaze-stability', 'spine', 'core'],
    isBuiltIn: true, description: 'Breathing + gaze — parasympathetic cool-down (extended exhale, vagal).',
  },
  {
    id: 'C3', name: 'Atem-Fokus / Meditation', shortName: 'Meditation', sessionPhases: [5],
    defaultMinutes: 5, ageGroup: 'all',
    techniques: [], bodyParts: ['recovery', 'spine', 'core'],
    isBuiltIn: true, description: 'Slow nasal breathing, exhale longer than inhale (in 4 → out 6–8); optional Klangschale pacer.',
  },

  // ===== Phase 1 · Mobility floor (from the protocol) =====
  { id: 'K-ankle-circles', name: 'Ankle Circles', shortName: 'Ankle', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['ankle', 'calves', 'feet'], isBuiltIn: true, description: '2–3 circles each direction, both feet.' },
  { id: 'K-knee-circles', name: 'Knee Circles', shortName: 'Knee', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['knee', 'quads'], isBuiltIn: true, description: 'Gentle, small amplitude — hinge, no cranking.' },
  { id: 'K-hip-cars', name: 'Hip CARs', shortName: 'Hip CARs', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['hip', 'core', 'hip-rotators'], isBuiltIn: true, description: 'Quadruped hip controlled articular rotations, spine quiet.' },
  { id: 'K-scorpion', name: 'Scorpion', shortName: 'Scorpion', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['hip', 'spine', 'core', 'lower-back', 'hip-flexors'], isBuiltIn: true, description: 'Dynamic, hip-led; build gradually (low-back load).' },
  { id: 'K-spinal-flow', name: 'Spinal Flow', shortName: 'Spinal', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['spine', 'shoulders', 'core', 'lower-back'], isBuiltIn: true, description: 'cat → puppy → cow → cobra → cat, then reverse.' },

  // ===== Phase 2 · Dynamic warm-up (from the protocol) =====
  { id: 'K-leg-swings-fb', name: 'Leg Swings — front/back', shortName: 'Swings FB', sessionPhases: [2], defaultMinutes: 2, ageGroup: 'all', techniques: ['ap-chagi', 'naeryo-chagi'], bodyParts: ['hip', 'hamstrings', 'hip-flexors', 'glutes'], isBuiltIn: true, description: '10/leg, full relaxed range.' },
  { id: 'K-leg-swings-lat', name: 'Leg Swings — lateral', shortName: 'Swings Lat', sessionPhases: [2], defaultMinutes: 2, ageGroup: 'all', techniques: ['dollyo-chagi', 'yop-chagi', 'bandal-chagi', 'huryeo-chagi'], bodyParts: ['hip', 'adductors', 'glutes', 'hip-rotators'], isBuiltIn: true, description: '10/leg — direct roundhouse/side-kick prep.' },
  { id: 'K-march-knee-heel', name: 'Knee-to-Chest + Heel-to-Glute', shortName: 'March', sessionPhases: [2], defaultMinutes: 2, ageGroup: 'all', techniques: ['ap-chagi'], bodyParts: ['hip', 'knee', 'quads', 'hip-flexors'], isBuiltIn: true, description: 'Walking or march in place.' },
  { id: 'K-footwork-skip', name: 'Footwork / Skip', shortName: 'Footwork', sessionPhases: [2], defaultMinutes: 1, ageGroup: 'all', techniques: ['footwork'], bodyParts: ['calves', 'ankle', 'full-body', 'feet', 'coordination'], isBuiltIn: true, description: 'Skip/shuffle 30–60s — raises HR.' },
  { id: 'K-neck-refocus', name: 'Neck Rotations + Refocus', shortName: 'Neck', sessionPhases: [2], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['visual', 'vestibular', 'gaze-stability', 'neck', 'spine'], isBuiltIn: true, description: 'Gentle; mild dizziness = vestibular stimulus.' },
  { id: 'K-single-leg-balance', name: 'Single-Leg Balance', shortName: 'Balance', sessionPhases: [2], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['proprioception', 'vestibular', 'balance', 'ankle', 'hip', 'core', 'feet'], isBuiltIn: true, description: '20–30s/side, eyes open → closed.' },

  // ===== Phase 4 · Static stretches (from the protocol) =====
  { id: 'D-standing-forward-fold', name: 'Standing Forward Fold', shortName: 'Fwd Fold', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['hamstrings', 'calves', 'spine', 'lower-back'], isBuiltIn: true, description: 'Hinge & hang, 30–60s. Tracked: forward fold.' },
  { id: 'D-seated-forward-fold', name: 'Seated Forward Fold', shortName: 'Seated Fold', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['hamstrings', 'calves', 'spine', 'lower-back'], isBuiltIn: true, description: 'Reach past toes, 30–60s. Tracked: sit-and-reach.' },
  { id: 'D-hip-flexor-lunge', name: 'Hip-Flexor Lunge', shortName: 'Hip Flexor', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: ['ap-chagi', 'naeryo-chagi'], bodyParts: ['hip', 'quads', 'hip-flexors', 'glutes'], isBuiltIn: true, description: 'Half-kneeling, PNF. Tracked: front split.' },
  { id: 'D-straddle-pancake', name: 'Straddle / Pancake', shortName: 'Straddle', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: ['yop-chagi', 'dollyo-chagi'], bodyParts: ['adductors', 'hamstrings', 'hip', 'hip-rotators'], isBuiltIn: true, description: 'Back flat, hinge from hips, PNF. Tracked: side split.' },
  { id: 'D-butterfly', name: 'Butterfly', shortName: 'Butterfly', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['adductors', 'hip', 'hip-rotators', 'glutes'], isBuiltIn: true, description: 'Soles together, knees out.' },
  { id: 'D-downward-dog', name: 'Downward Dog', shortName: 'Down Dog', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['calves', 'ankle', 'hamstrings', 'shoulders', 'achilles', 'spine'], isBuiltIn: true, description: 'Pedaling — press heels, alternate bent/straight knee.' },
];

// Session templates: ordered arrays of Übung ids.
export const SESSION_TEMPLATES = {
  KIDS_2H: ['W1', 'W3', 'M1', 'M3', 'W2', 'M4', 'C1', 'C2'] as const,
  YOUTH_ADULT_1H30: ['W3', 'W1', 'M2', 'M3', 'W2', 'M4', 'C1', 'C2'] as const,
  MOBILITY_WARMUP: [
    'K-ankle-circles', 'K-knee-circles', 'K-hip-cars', 'K-scorpion', 'K-spinal-flow',
    'K-leg-swings-fb', 'K-leg-swings-lat', 'K-march-knee-heel', 'K-footwork-skip', 'K-neck-refocus', 'K-single-leg-balance',
  ] as const,
  STATIC_BLOCK: [
    'D-standing-forward-fold', 'D-seated-forward-fold', 'D-hip-flexor-lunge', 'D-straddle-pancake', 'D-butterfly', 'D-downward-dog', 'C3',
  ] as const,
};

export function getGameById(games: GameDefinition[], id: string): GameDefinition | undefined {
  return games.find(g => g.id === id);
}
