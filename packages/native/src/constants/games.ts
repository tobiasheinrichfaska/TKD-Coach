import { GameDefinition } from '../types';

// All built-in Übungen. `phase` = coarse colour band; `sessionPhase` = the 1–5 protocol
// heading; `techniques`/`bodyParts` drive the add-picker filters and info display.
export const BUILTIN_GAMES: GameDefinition[] = [
  // ===== Neuro warm-up games (Phase 2 · Dynamic) =====
  {
    id: 'W1', name: 'Farben-Chagi', shortName: 'Farben', phase: 'warmup', sessionPhase: 2,
    neuroTarget: 'Visual-Motor Coupling', defaultMinutes: 7, ageGroup: 'all', logMetricType: 'reaction_errors',
    techniques: ['ap-chagi', 'dollyo-chagi', 'yop-chagi'], bodyParts: ['hip', 'knee', 'ankle'],
    isBuiltIn: true, description: 'Visual cue to kick selection — select and fire a full motor program under uncertainty.',
  },
  {
    id: 'W2', name: 'Spiegel-Stand', shortName: 'Spiegel', phase: 'warmup', sessionPhase: 2,
    neuroTarget: 'Visual + Proprioceptive Integration', defaultMinutes: 5, ageGroup: 'all',
    techniques: ['ap-seogi', 'juchum-seogi', 'makki'], bodyParts: ['hip', 'knee', 'spine', 'shoulders'],
    isBuiltIn: true, description: 'Mirror stance — visual-proprioceptive mirroring suppresses prediction.',
  },
  {
    id: 'W3', name: 'Leiter-Stand-Exit', shortName: 'Leiter', phase: 'warmup', sessionPhase: 2,
    neuroTarget: 'Proprioceptive + Motor Chaining', defaultMinutes: 8, ageGroup: 'all',
    techniques: ['seogi', 'footwork'], bodyParts: ['ankle', 'knee', 'hip', 'calves'],
    isBuiltIn: true, description: 'Coordination ladder into a named stance; exit forces immediate recomposure.',
  },
  // ===== Neuro main games (Phase 3 · Main) =====
  {
    id: 'M1', name: 'Zahlen-Kombi', shortName: 'Zahlen', phase: 'main', sessionPhase: 3,
    neuroTarget: 'Working Memory + Sequencing', defaultMinutes: 11, ageGroup: 'all', logMetricType: 'combo_accuracy',
    techniques: ['ap-chagi', 'dollyo-chagi', 'dwit-chagi', 'jireugi'], bodyParts: ['hip', 'knee', 'core'],
    isBuiltIn: true, description: 'Working memory + kick combination sequencing under full technique.',
  },
  {
    id: 'M2', name: 'Vestibular Dollyo', shortName: 'Vestibular', phase: 'main', sessionPhase: 3,
    neuroTarget: 'Vestibular Recalibration', defaultMinutes: 12, ageGroup: 'youth-adults', logMetricType: 'vestibular_landing',
    techniques: ['dollyo-chagi'], bodyParts: ['ankle', 'knee', 'hip', 'core', 'neck'],
    isBuiltIn: true, description: 'Post-rotation balance → full Dollyo kick. Vestibular reflex for spinning-kick stability.',
  },
  {
    id: 'M3', name: 'Einbein-Poomsae', shortName: 'Einbein', phase: 'main', sessionPhase: 3,
    neuroTarget: 'Proprioceptive + Vestibular Load', defaultMinutes: 12, ageGroup: 'all', logMetricType: 'balance_poomsae',
    techniques: ['poomsae', 'seogi'], bodyParts: ['ankle', 'knee', 'hip', 'core'],
    isBuiltIn: true, description: 'Single-leg Poomsae — proprioceptive overload under cognitive load.',
  },
  {
    id: 'M4', name: 'Poomsae unter Störung', shortName: 'Störung', phase: 'main', sessionPhase: 3,
    neuroTarget: 'Attentional Filtering', defaultMinutes: 18, ageGroup: 'all', logMetricType: 'poomsae_distraction',
    techniques: ['poomsae'], bodyParts: ['full-body'],
    isBuiltIn: true, description: 'Motor-program persistence under visual distraction.',
  },
  {
    id: 'M5', name: 'Reaktions-Zahl-Kreis', shortName: 'Reaktion', phase: 'main', sessionPhase: 3,
    neuroTarget: 'Auditory Reaction + Attention', defaultMinutes: 8, ageGroup: 'all',
    techniques: ['arae-makki', 'momtong-makki', 'olgul-makki'], bodyParts: ['shoulders', 'arms', 'core'],
    isBuiltIn: true, description: 'Auditory cue → block selection. Group re-engagement tool.',
  },
  {
    id: 'M6', name: 'Vestibularer Gangpfad', shortName: 'Gangpfad', phase: 'main', sessionPhase: 3,
    neuroTarget: 'Vestibular + Gaze Stability', defaultMinutes: 10, ageGroup: 'all',
    techniques: ['footwork'], bodyParts: ['ankle', 'knee', 'hip', 'neck'],
    isBuiltIn: true, description: 'Gaze-fixed directional walk — VOR + gaze stabilization during movement.',
  },
  // ===== Neuro cool-down (Phase 4 · Static) =====
  {
    id: 'C1', name: 'Balance-Hold Challenge', shortName: 'Balance', phase: 'cooldown', sessionPhase: 4,
    neuroTarget: 'Proprioceptive Baseline', defaultMinutes: 8, ageGroup: 'all', logMetricType: 'balance_hold',
    techniques: ['seogi', 'poomsae'], bodyParts: ['ankle', 'knee', 'hip', 'core'],
    isBuiltIn: true, description: 'Single-leg timed hold — the PRIMARY progress metric for the program.',
  },
  // ===== Breathing / meditation (Phase 5) =====
  {
    id: 'C2', name: 'Atem-Augen-Fokus', shortName: 'Atem', phase: 'cooldown', sessionPhase: 5,
    neuroTarget: 'Parasympathetic + Gaze', defaultMinutes: 9, ageGroup: 'all',
    techniques: [], bodyParts: ['spine', 'core'],
    isBuiltIn: true, description: 'Breathing + gaze — parasympathetic cool-down (extended exhale, vagal).',
  },
  {
    id: 'C3', name: 'Atem-Fokus / Meditation', shortName: 'Meditation', phase: 'cooldown', sessionPhase: 5,
    neuroTarget: 'Parasympathetic Recovery', defaultMinutes: 5, ageGroup: 'all',
    techniques: [], bodyParts: ['spine', 'core'],
    isBuiltIn: true, description: 'Slow nasal breathing, exhale longer than inhale (in 4 → out 6–8); optional Klangschale pacer.',
  },

  // ===== Phase 1 · Mobility floor (from the protocol) =====
  { id: 'K-ankle-circles', name: 'Ankle Circles', shortName: 'Ankle', phase: 'warmup', sessionPhase: 1, neuroTarget: 'Joint mobility', defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['ankle', 'calves'], isBuiltIn: true, description: '2–3 circles each direction, both feet.' },
  { id: 'K-knee-circles', name: 'Knee Circles', shortName: 'Knee', phase: 'warmup', sessionPhase: 1, neuroTarget: 'Joint mobility', defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['knee'], isBuiltIn: true, description: 'Gentle, small amplitude — hinge, no cranking.' },
  { id: 'K-hip-cars', name: 'Hip CARs', shortName: 'Hip CARs', phase: 'warmup', sessionPhase: 1, neuroTarget: 'Joint mobility', defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['hip', 'core'], isBuiltIn: true, description: 'Quadruped hip controlled articular rotations, spine quiet.' },
  { id: 'K-scorpion', name: 'Scorpion', shortName: 'Scorpion', phase: 'warmup', sessionPhase: 1, neuroTarget: 'Spinal mobility', defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['hip', 'spine', 'core'], isBuiltIn: true, description: 'Dynamic, hip-led; build gradually (low-back load).' },
  { id: 'K-spinal-flow', name: 'Spinal Flow', shortName: 'Spinal', phase: 'warmup', sessionPhase: 1, neuroTarget: 'Spinal mobility', defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['spine', 'shoulders', 'core'], isBuiltIn: true, description: 'cat → puppy → cow → cobra → cat, then reverse.' },

  // ===== Phase 2 · Dynamic warm-up (from the protocol) =====
  { id: 'K-leg-swings-fb', name: 'Leg Swings — front/back', shortName: 'Swings FB', phase: 'warmup', sessionPhase: 2, neuroTarget: 'Dynamic warm-up', defaultMinutes: 2, ageGroup: 'all', techniques: ['ap-chagi'], bodyParts: ['hip', 'hamstrings', 'hip-flexors'], isBuiltIn: true, description: '10/leg, full relaxed range.' },
  { id: 'K-leg-swings-lat', name: 'Leg Swings — lateral', shortName: 'Swings Lat', phase: 'warmup', sessionPhase: 2, neuroTarget: 'Dynamic warm-up', defaultMinutes: 2, ageGroup: 'all', techniques: ['dollyo-chagi', 'yop-chagi'], bodyParts: ['hip', 'adductors', 'glutes'], isBuiltIn: true, description: '10/leg — direct roundhouse/side-kick prep.' },
  { id: 'K-march-knee-heel', name: 'Knee-to-Chest + Heel-to-Glute', shortName: 'March', phase: 'warmup', sessionPhase: 2, neuroTarget: 'Dynamic warm-up', defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['hip', 'knee', 'quads'], isBuiltIn: true, description: 'Walking or march in place.' },
  { id: 'K-footwork-skip', name: 'Footwork / Skip', shortName: 'Footwork', phase: 'warmup', sessionPhase: 2, neuroTarget: 'Dynamic warm-up', defaultMinutes: 1, ageGroup: 'all', techniques: ['footwork'], bodyParts: ['calves', 'ankle', 'full-body'], isBuiltIn: true, description: 'Skip/shuffle 30–60s — raises HR.' },
  { id: 'K-neck-refocus', name: 'Neck Rotations + Refocus', shortName: 'Neck', phase: 'warmup', sessionPhase: 2, neuroTarget: 'Vision + Vestibular', defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['neck', 'spine'], isBuiltIn: true, description: 'Gentle; mild dizziness = vestibular stimulus.' },
  { id: 'K-single-leg-balance', name: 'Single-Leg Balance', shortName: 'Balance', phase: 'warmup', sessionPhase: 2, neuroTarget: 'Proprioception + Vestibular', defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['ankle', 'hip', 'core'], isBuiltIn: true, description: '20–30s/side, eyes open → closed.' },

  // ===== Phase 4 · Static stretches (from the protocol) =====
  { id: 'D-standing-forward-fold', name: 'Standing Forward Fold', shortName: 'Fwd Fold', phase: 'cooldown', sessionPhase: 4, neuroTarget: 'Flexibility', defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['hamstrings', 'calves', 'spine'], isBuiltIn: true, description: 'Hinge & hang, 30–60s. Tracked: forward fold.' },
  { id: 'D-seated-forward-fold', name: 'Seated Forward Fold', shortName: 'Seated Fold', phase: 'cooldown', sessionPhase: 4, neuroTarget: 'Flexibility', defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['hamstrings', 'calves', 'spine'], isBuiltIn: true, description: 'Reach past toes, 30–60s. Tracked: sit-and-reach.' },
  { id: 'D-hip-flexor-lunge', name: 'Hip-Flexor Lunge', shortName: 'Hip Flexor', phase: 'cooldown', sessionPhase: 4, neuroTarget: 'Flexibility', defaultMinutes: 1, ageGroup: 'all', techniques: ['ap-chagi'], bodyParts: ['hip', 'quads', 'hip-flexors'], isBuiltIn: true, description: 'Half-kneeling, PNF. Tracked: front split.' },
  { id: 'D-straddle-pancake', name: 'Straddle / Pancake', shortName: 'Straddle', phase: 'cooldown', sessionPhase: 4, neuroTarget: 'Flexibility', defaultMinutes: 1, ageGroup: 'all', techniques: ['yop-chagi'], bodyParts: ['adductors', 'hamstrings', 'hip'], isBuiltIn: true, description: 'Back flat, hinge from hips, PNF. Tracked: side split.' },
  { id: 'D-butterfly', name: 'Butterfly', shortName: 'Butterfly', phase: 'cooldown', sessionPhase: 4, neuroTarget: 'Flexibility', defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['adductors', 'hip'], isBuiltIn: true, description: 'Soles together, knees out.' },
  { id: 'D-downward-dog', name: 'Downward Dog', shortName: 'Down Dog', phase: 'cooldown', sessionPhase: 4, neuroTarget: 'Flexibility', defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['calves', 'ankle', 'hamstrings', 'shoulders'], isBuiltIn: true, description: 'Pedaling — press heels, alternate bent/straight knee.' },
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

export function getGamesByPhase(games: GameDefinition[], phase: 'warmup' | 'main' | 'cooldown'): GameDefinition[] {
  return games.filter(g => g.phase === phase);
}
