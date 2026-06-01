import { GameDefinition } from '../types';

// All built-in Übungen (factory defaults, seeded once). `sessionPhases` = the 1–5 protocol
// phases the Übung may be used in; `techniques`/`bodyParts` drive the add-picker filters + display.
export const BUILTIN_GAMES: GameDefinition[] = [
  // ===== Neuro warm-up games (Phase 2 · Dynamic) =====
  {
    id: 'W1', name: 'Farben-Chagi', shortName: 'Farben', sessionPhases: [2],
    defaultMinutes: 7, ageGroup: 'all', logMetricType: 'reaction_errors',
    techniques: ['ap-chagi', 'dollyo-chagi', 'yop-chagi', 'dwit-chagi'], bodyParts: ['visual', 'reaction', 'hip', 'knee', 'ankle', 'hip-flexors'],
    isBuiltIn: true, description: 'Visueller Reiz zur Kick-Auswahl — unter Unsicherheit ein komplettes Bewegungsprogramm wählen und ausführen.',
  },
  {
    id: 'W2', name: 'Spiegel-Stand', shortName: 'Spiegel', sessionPhases: [2],
    defaultMinutes: 5, ageGroup: 'all',
    techniques: ['ap-seogi', 'juchum-seogi', 'ap-kubi', 'dwit-kubi', 'makki', 'momtong-makki'], bodyParts: ['visual', 'proprioception', 'hip', 'knee', 'spine', 'shoulders', 'core'],
    isBuiltIn: true, description: 'Spiegel-Stand — visuell-propriozeptives Spiegeln unterdrückt die Vorhersage.',
  },
  {
    id: 'W3', name: 'Leiter-Stand-Exit', shortName: 'Leiter', sessionPhases: [2],
    defaultMinutes: 8, ageGroup: 'all',
    techniques: ['seogi', 'footwork', 'ap-kubi', 'dwit-kubi', 'beom-seogi'], bodyParts: ['proprioception', 'coordination', 'ankle', 'knee', 'hip', 'calves', 'feet'],
    isBuiltIn: true, description: 'Koordinationsleiter in einen benannten Stand; der Ausstieg erzwingt sofortiges Neuordnen.',
  },
  // ===== Neuro main games (Phase 3 · Main) =====
  {
    id: 'M1', name: 'Zahlen-Kombi', shortName: 'Zahlen', sessionPhases: [3],
    defaultMinutes: 11, ageGroup: 'all', logMetricType: 'combo_accuracy',
    techniques: ['ap-chagi', 'dollyo-chagi', 'yop-chagi', 'dwit-chagi', 'bandal-chagi', 'huryeo-chagi', 'jireugi'], bodyParts: ['working-memory', 'coordination', 'hip', 'knee', 'core', 'hip-flexors', 'ankle'],
    isBuiltIn: true, description: 'Arbeitsgedächtnis + Kick-Kombinationen in voller Technik.',
  },
  {
    id: 'M2', name: 'Vestibular Dollyo', shortName: 'Vestibular', sessionPhases: [3],
    defaultMinutes: 12, ageGroup: 'youth-adults', logMetricType: 'vestibular_landing',
    techniques: ['dollyo-chagi', 'dwit-huryeo-chagi', 'momdollyo-chagi'], bodyParts: ['vestibular', 'balance', 'gaze-stability', 'ankle', 'knee', 'hip', 'core', 'neck', 'hip-rotators'],
    isBuiltIn: true, description: 'Balance nach Drehung → voller Dollyo. Vestibulärer Reflex für Stabilität bei Drehkicks.',
  },
  {
    id: 'M3', name: 'Einbein-Poomsae', shortName: 'Einbein', sessionPhases: [3],
    defaultMinutes: 12, ageGroup: 'all', logMetricType: 'balance_poomsae',
    techniques: ['poomsae', 'seogi'], bodyParts: ['proprioception', 'vestibular', 'balance', 'ankle', 'knee', 'hip', 'core', 'glutes', 'feet'],
    isBuiltIn: true, description: 'Einbein-Poomsae — propriozeptive Überlastung unter kognitiver Last.',
  },
  {
    id: 'M4', name: 'Poomsae unter Störung', shortName: 'Störung', sessionPhases: [3],
    defaultMinutes: 18, ageGroup: 'all', logMetricType: 'poomsae_distraction',
    techniques: ['poomsae'], bodyParts: ['attention', 'visual', 'full-body'],
    isBuiltIn: true, description: 'Beständigkeit des Bewegungsprogramms unter visueller Ablenkung.',
  },
  {
    id: 'M5', name: 'Reaktions-Zahl-Kreis', shortName: 'Reaktion', sessionPhases: [3],
    defaultMinutes: 8, ageGroup: 'all',
    techniques: ['arae-makki', 'momtong-makki', 'olgul-makki', 'an-makki', 'bakkat-makki', 'sonnal-makki'], bodyParts: ['reaction', 'attention', 'shoulders', 'arms', 'core', 'wrist'],
    isBuiltIn: true, description: 'Akustischer Reiz → Block-Auswahl. Werkzeug zur Gruppen-Reaktivierung.',
  },
  {
    id: 'M6', name: 'Vestibularer Gangpfad', shortName: 'Gangpfad', sessionPhases: [3],
    defaultMinutes: 10, ageGroup: 'all',
    techniques: ['footwork'], bodyParts: ['vestibular', 'gaze-stability', 'visual', 'balance', 'ankle', 'knee', 'hip', 'neck', 'feet'],
    isBuiltIn: true, description: 'Blickfixierter Richtungsgang — VOR + Blickstabilisierung in Bewegung.',
  },
  // ===== Neuro cool-down (Phase 4 · Static) =====
  {
    id: 'C1', name: 'Balance-Halten Challenge', shortName: 'Balance', sessionPhases: [4],
    defaultMinutes: 8, ageGroup: 'all', logMetricType: 'balance_hold',
    techniques: ['seogi', 'poomsae'], bodyParts: ['proprioception', 'balance', 'ankle', 'knee', 'hip', 'core', 'glutes', 'feet'],
    isBuiltIn: true, description: 'Einbeiniges Halten auf Zeit — die PRIMÄRE Fortschrittsmetrik des Programms.',
  },
  // ===== Breathing / meditation (Phase 5) =====
  {
    id: 'C2', name: 'Atem-Augen-Fokus', shortName: 'Atem', sessionPhases: [5],
    defaultMinutes: 9, ageGroup: 'all',
    techniques: [], bodyParts: ['recovery', 'gaze-stability', 'spine', 'core'],
    isBuiltIn: true, description: 'Atmung + Blick — parasympathisches Cool-down (verlängerte Ausatmung, vagal).',
  },
  {
    id: 'C3', name: 'Atem-Fokus / Meditation', shortName: 'Meditation', sessionPhases: [5],
    defaultMinutes: 5, ageGroup: 'all',
    techniques: [], bodyParts: ['recovery', 'spine', 'core'],
    isBuiltIn: true, description: 'Langsame Nasenatmung, Ausatmung länger als Einatmung (4 ein → 6–8 aus); optional Klangschale als Taktgeber.',
  },

  // ===== Phase 1 · Mobility floor (from the protocol) =====
  { id: 'K-ankle-circles', name: 'Sprunggelenk-Kreise', shortName: 'Ankle', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['ankle', 'calves', 'feet'], isBuiltIn: true, description: '2–3 Kreise je Richtung, beide Füße.' },
  { id: 'K-knee-circles', name: 'Knie-Kreise', shortName: 'Knee', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['knee', 'quads'], isBuiltIn: true, description: 'Sanft, kleine Amplitude — scharnierartig, kein Reißen.' },
  { id: 'K-hip-cars', name: 'Hüft-CARs', shortName: 'Hip CARs', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['hip', 'core', 'hip-rotators'], isBuiltIn: true, description: 'Vierfüßler-Hüftrotationen (CARs), Wirbelsäule ruhig.' },
  { id: 'K-scorpion', name: 'Skorpion', shortName: 'Scorpion', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['hip', 'spine', 'core', 'lower-back', 'hip-flexors'], isBuiltIn: true, description: 'Dynamisch, hüftgeführt; langsam steigern (Belastung unterer Rücken).' },
  { id: 'K-spinal-flow', name: 'Wirbelsäulen-Flow', shortName: 'Spinal', sessionPhases: [1], defaultMinutes: 2, ageGroup: 'all', techniques: [], bodyParts: ['spine', 'shoulders', 'core', 'lower-back'], isBuiltIn: true, description: 'Katze → Welpe → Kuh → Kobra → Katze, dann rückwärts.' },

  // ===== Phase 2 · Dynamic warm-up (from the protocol) =====
  { id: 'K-leg-swings-fb', name: 'Beinschwünge — vor/zurück', shortName: 'Swings FB', sessionPhases: [2], defaultMinutes: 2, ageGroup: 'all', techniques: ['ap-chagi', 'naeryo-chagi'], bodyParts: ['hip', 'hamstrings', 'hip-flexors', 'glutes'], isBuiltIn: true, description: '10/Bein, voller entspannter Bewegungsumfang.' },
  { id: 'K-leg-swings-lat', name: 'Beinschwünge — seitlich', shortName: 'Swings Lat', sessionPhases: [2], defaultMinutes: 2, ageGroup: 'all', techniques: ['dollyo-chagi', 'yop-chagi', 'bandal-chagi', 'huryeo-chagi'], bodyParts: ['hip', 'adductors', 'glutes', 'hip-rotators'], isBuiltIn: true, description: '10/Bein — direkte Vorbereitung für Roundhouse/Seitkick.' },
  { id: 'K-march-knee-heel', name: 'Knie-zur-Brust + Ferse-zum-Gesäß', shortName: 'March', sessionPhases: [2], defaultMinutes: 2, ageGroup: 'all', techniques: ['ap-chagi'], bodyParts: ['hip', 'knee', 'quads', 'hip-flexors'], isBuiltIn: true, description: 'Gehend oder auf der Stelle marschieren.' },
  { id: 'K-footwork-skip', name: 'Beinarbeit / Hüpfen', shortName: 'Footwork', sessionPhases: [2], defaultMinutes: 1, ageGroup: 'all', techniques: ['footwork'], bodyParts: ['calves', 'ankle', 'full-body', 'feet', 'coordination'], isBuiltIn: true, description: 'Hüpfen/Wechselschritt 30–60s — bringt den Puls hoch.' },
  { id: 'K-neck-refocus', name: 'Nacken-Rotation + Refokus', shortName: 'Neck', sessionPhases: [2], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['visual', 'vestibular', 'gaze-stability', 'neck', 'spine'], isBuiltIn: true, description: 'Sanft; leichter Schwindel = vestibulärer Reiz.' },
  { id: 'K-single-leg-balance', name: 'Einbein-Balance', shortName: 'Balance', sessionPhases: [2], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['proprioception', 'vestibular', 'balance', 'ankle', 'hip', 'core', 'feet'], isBuiltIn: true, description: '20–30s/Seite, Augen auf → zu.' },

  // ===== Phase 4 · Static stretches (from the protocol) =====
  { id: 'D-standing-forward-fold', name: 'Stehende Vorbeuge', shortName: 'Fwd Fold', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['hamstrings', 'calves', 'spine', 'lower-back'], isBuiltIn: true, description: 'Hüftbeuge & Hängen, 30–60s. Gemessen: Vorbeuge.' },
  { id: 'D-seated-forward-fold', name: 'Sitzende Vorbeuge', shortName: 'Seated Fold', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['hamstrings', 'calves', 'spine', 'lower-back'], isBuiltIn: true, description: 'Über die Zehen greifen, 30–60s. Gemessen: Sit-and-Reach.' },
  { id: 'D-hip-flexor-lunge', name: 'Hüftbeuger-Ausfallschritt', shortName: 'Hip Flexor', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: ['ap-chagi', 'naeryo-chagi'], bodyParts: ['hip', 'quads', 'hip-flexors', 'glutes'], isBuiltIn: true, description: 'Halbkniend, PNF. Gemessen: Frontspagat.' },
  { id: 'D-straddle-pancake', name: 'Grätsche / Pancake', shortName: 'Straddle', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: ['yop-chagi', 'dollyo-chagi'], bodyParts: ['adductors', 'hamstrings', 'hip', 'hip-rotators'], isBuiltIn: true, description: 'Rücken flach, aus der Hüfte beugen, PNF. Gemessen: Seitspagat.' },
  { id: 'D-butterfly', name: 'Schmetterling', shortName: 'Butterfly', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['adductors', 'hip', 'hip-rotators', 'glutes'], isBuiltIn: true, description: 'Fußsohlen zusammen, Knie nach außen.' },
  { id: 'D-downward-dog', name: 'Herabschauender Hund', shortName: 'Down Dog', sessionPhases: [4], defaultMinutes: 1, ageGroup: 'all', techniques: [], bodyParts: ['calves', 'ankle', 'hamstrings', 'shoulders', 'achilles', 'spine'], isBuiltIn: true, description: 'Treten — Fersen drücken, Knie abwechselnd beugen/strecken.' },
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
