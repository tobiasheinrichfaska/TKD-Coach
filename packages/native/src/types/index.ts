// Belt levels in order
export type Belt =
  | 'white'
  | 'yellow-tag'
  | 'yellow'
  | 'green-tag'
  | 'green'
  | 'blue-tag'
  | 'blue'
  | 'red-tag'
  | 'red'
  | 'black';

// Neuro assessment types
export type AssessmentMetricType =
  | 'balance_hold'
  | 'reaction_errors'
  | 'combo_accuracy'
  | 'vestibular_landing'
  | 'balance_poomsae'
  | 'poomsae_distraction';

export type AssessmentMetric =
  | { type: 'balance_hold'; dominant: number; nonDominant: number }
  | { type: 'reaction_errors'; errorsPerTen: number }
  | { type: 'combo_accuracy'; correct: number; total: number }
  | { type: 'vestibular_landing'; stable: number; stumble: number; fall: number }
  | { type: 'balance_poomsae'; holdSeconds: number; armErrors: number }
  | { type: 'poomsae_distraction'; errors: number; baseline: number };

export interface AthleteContact {
  phone?: string;
  email?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export interface Athlete {
  id: string;
  name: string;
  birthYear?: number;
  belt: Belt;
  groupId: string;
  contact?: AthleteContact;
  neuroProfile: {
    vestibular: 1 | 2 | 3 | 4 | 5;
    visual: 1 | 2 | 3 | 4 | 5;
    proprioceptive: 1 | 2 | 3 | 4 | 5;
  };
  poomsae: string[];
  techniques: { name: string; level: 1 | 2 | 3 }[];
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  ageCategory: 'kids' | 'youth' | 'adult' | 'mixed';
  athleteIds: string[];
}

/** Session phase headings (per the mobility/stretching protocol). */
export type SessionPhase = 1 | 2 | 3 | 4 | 5;
export const SESSION_PHASE_LABELS: Record<SessionPhase, string> = {
  1: 'Phase 1 · Warm-Up (Mobility)',
  2: 'Phase 2 · Warm-Up (Dynamic)',
  3: 'Phase 3 · Main',
  4: 'Phase 4 · Cool-Down (Static)',
  5: 'Phase 5 · Meditation',
};

export interface GameDefinition {
  id: string;
  name: string;
  shortName: string;
  /** Coarse training phase (kept for back-compat / colour coding). */
  phase: 'warmup' | 'main' | 'cooldown';
  /** Protocol session phase 1–5 (drives the session headings + add-by-phase). */
  sessionPhase?: SessionPhase;
  neuroTarget: string;
  defaultMinutes: number;
  ageGroup: 'all' | 'youth-adults';
  logMetricType?: AssessmentMetricType;
  /** Techniques this Übung trains (kebab ids, e.g. "ap-chagi"). */
  techniques?: string[];
  /** Joints/muscles this Übung loads (kebab ids, e.g. "knee"). */
  bodyParts?: string[];
  isBuiltIn: boolean;
  description?: string;
}

export interface SessionPlan {
  id: string;
  groupId: string;
  name: string;
  plannedDate: string;
  template: 'kids-2h' | 'youth-adult-1h30' | 'custom';
  plannedGames: string[];
  createdAt: string;
}

export interface GameLog {
  gameId: string;
  /** undefined for a game that was never started during the session */
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
}

export interface SessionLog {
  id: string;
  planId: string;
  groupId: string;
  startedAt: string;
  endedAt?: string;
  gameLogs: GameLog[];
  notes?: string;
  status: 'running' | 'completed' | 'cancelled';
}

export interface Assessment {
  id: string;
  athleteId: string;
  gameId: string;
  date: string;
  metric: AssessmentMetric;
  notes?: string;
}

export interface AppData {
  version: number;
  games: GameDefinition[];
  athletes: Athlete[];
  groups: Group[];
  sessionPlans: SessionPlan[];
  sessionLogs: SessionLog[];
  assessments: Assessment[];
  exportedAt?: string;
}

export interface AppState extends AppData {
  isLoaded: boolean;
}

export interface TransferSelection {
  groups: boolean;
  athletes: boolean;
  sessionPlans: boolean;
  sessionLogs: boolean;
  assessments: boolean;
}
