import { GameDefinition } from '../types';

// The 11 built-in games from TKD-Coach markdown library
export const BUILTIN_GAMES: GameDefinition[] = [
  // Warm-up phase
  {
    id: 'W1',
    name: 'Farben-Chagi',
    shortName: 'Farben',
    phase: 'warmup',
    neuroTarget: 'Visual-Motor Coupling',
    defaultMinutes: 7,
    ageGroup: 'all',
    logMetricType: 'reaction_errors',
    isBuiltIn: true,
    description: 'Visual cue to kick selection. Forces the nervous system to select and fire a full motor program under uncertainty.',
  },
  {
    id: 'W2',
    name: 'Spiegel-Stand',
    shortName: 'Spiegel',
    phase: 'warmup',
    neuroTarget: 'Visual + Proprioceptive Integration',
    defaultMinutes: 5,
    ageGroup: 'all',
    logMetricType: undefined,
    isBuiltIn: true,
    description: 'Mirror stance — visual-proprioceptive mirroring suppresses prediction and forces continuous sensory processing.',
  },
  {
    id: 'W3',
    name: 'Leiter-Stand-Exit',
    shortName: 'Leiter',
    phase: 'warmup',
    neuroTarget: 'Proprioceptive + Motor Chaining',
    defaultMinutes: 8,
    ageGroup: 'all',
    logMetricType: undefined,
    isBuiltIn: true,
    description: 'Coordination ladder into named stance. The ladder demands conscious foot placement; exit forces immediate recomposure.',
  },

  // Main phase
  {
    id: 'M1',
    name: 'Zahlen-Kombi',
    shortName: 'Zahlen',
    phase: 'main',
    neuroTarget: 'Working Memory + Sequencing',
    defaultMinutes: 11,
    ageGroup: 'all',
    logMetricType: 'combo_accuracy',
    isBuiltIn: true,
    description: 'Working memory + kick combination sequencing. Holding a sequence while executing full-form techniques.',
  },
  {
    id: 'M2',
    name: 'Vestibular Dollyo',
    shortName: 'Vestibular',
    phase: 'main',
    neuroTarget: 'Vestibular Recalibration',
    defaultMinutes: 12,
    ageGroup: 'youth-adults',
    logMetricType: 'vestibular_landing',
    isBuiltIn: true,
    description: 'Post-rotation balance → full Dollyo kick. Training vestibular reflex for spinning kick stability.',
  },
  {
    id: 'M3',
    name: 'Einbein-Poomsae',
    shortName: 'Einbein',
    phase: 'main',
    neuroTarget: 'Proprioceptive + Vestibular Load',
    defaultMinutes: 12,
    ageGroup: 'all',
    logMetricType: 'balance_poomsae',
    isBuiltIn: true,
    description: 'Single-leg Poomsae — proprioceptive overload under cognitive load.',
  },
  {
    id: 'M4',
    name: 'Poomsae unter Störung',
    shortName: 'Störung',
    phase: 'main',
    neuroTarget: 'Attentional Filtering',
    defaultMinutes: 18,
    ageGroup: 'all',
    logMetricType: 'poomsae_distraction',
    isBuiltIn: true,
    description: 'Motor-program persistence under visual distraction. Training nervous system to maintain sequences under overload.',
  },
  {
    id: 'M5',
    name: 'Reaktions-Zahl-Kreis',
    shortName: 'Reaktion',
    phase: 'main',
    neuroTarget: 'Auditory Reaction + Attention',
    defaultMinutes: 8,
    ageGroup: 'all',
    logMetricType: undefined,
    isBuiltIn: true,
    description: 'Auditory cue → block selection. Trains auditory-motor pathway independently. Group re-engagement tool.',
  },
  {
    id: 'M6',
    name: 'Vestibularer Gangpfad',
    shortName: 'Gangpfad',
    phase: 'main',
    neuroTarget: 'Vestibular + Gaze Stability',
    defaultMinutes: 10,
    ageGroup: 'all',
    logMetricType: undefined,
    isBuiltIn: true,
    description: 'Gaze-fixed directional walk — VOR + gaze stabilization during movement.',
  },

  // Cool-down phase
  {
    id: 'C1',
    name: 'Balance-Hold Challenge',
    shortName: 'Balance',
    phase: 'cooldown',
    neuroTarget: 'Proprioceptive Baseline',
    defaultMinutes: 8,
    ageGroup: 'all',
    logMetricType: 'balance_hold',
    isBuiltIn: true,
    description: 'Single-leg timed hold — the PRIMARY progress metric for the whole program.',
  },
  {
    id: 'C2',
    name: 'Atem-Augen-Fokus',
    shortName: 'Atem',
    phase: 'cooldown',
    neuroTarget: 'Parasympathetic + Gaze',
    defaultMinutes: 9,
    ageGroup: 'all',
    logMetricType: undefined,
    isBuiltIn: true,
    description: 'Breathing + gaze — parasympathetic cool-down. Extended exhale activates vagus nerve.',
  },
];

// Session templates: arrays of game IDs
export const SESSION_TEMPLATES = {
  KIDS_2H: ['W1', 'W3', 'M1', 'M3', 'W2', 'M4', 'C1', 'C2'] as const,
  YOUTH_ADULT_1H30: ['W3', 'W1', 'M2', 'M3', 'W2', 'M4', 'C1', 'C2'] as const,
};

export function getGameById(games: GameDefinition[], id: string): GameDefinition | undefined {
  return games.find(g => g.id === id);
}

export function getGamesByPhase(games: GameDefinition[], phase: 'warmup' | 'main' | 'cooldown'): GameDefinition[] {
  return games.filter(g => g.phase === phase);
}
