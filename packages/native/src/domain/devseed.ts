import { AppData, Person, Group, ContactLink, SessionPlan, SessionLog, Assessment, Belt } from '../types';
import { SESSION_TEMPLATES } from '../constants/games';
import { migrate } from './migration';

/**
 * DEV seed: the full factory data (catalogs via migrate) + a populated demo dataset
 * (athletes, a coach, a shared guardian, groups with training times, a session planned
 * today, a completed session + an assessment). Used only when DEV_RESEED is on.
 */

const athlete = (id: string, name: string, belt: Belt, birthYear: number): Person => ({
  id, name, phones: [], isCoach: false,
  athlete: { belt, birthYear, neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [] },
});

const DEMO_PERSONS: Person[] = [
  athlete('p-mia', 'Mia Park', 'kup-8', 2014),
  athlete('p-ana', 'Ana Park', 'poom-1', 2012),
  athlete('p-leo', 'Leo Schmidt', 'kup-5', 2011),
  athlete('p-tom', 'Tom Berg', 'dan-1', 2000),
  { id: 'p-coach', name: 'Coach Kim', email: 'kim@dojang.de', phones: ['0151 1234567'], isCoach: true },
  { id: 'p-mum', name: 'Mum Park', email: 'park@home.de', phones: ['0151 7654321', '030 111222'], isCoach: false },
];

const DEMO_GROUPS: Group[] = [
  { id: 'g-kids', name: 'Kids Mo/Mi', trainingTimes: [{ weekday: 1, start: '17:00', durationMin: 90 }, { weekday: 3, start: '17:00', durationMin: 90 }], athleteIds: ['p-mia', 'p-ana'] },
  { id: 'g-youth', name: 'Youth & Adults', trainingTimes: [{ weekday: 2, start: '18:30', durationMin: 90 }, { weekday: 4, start: '18:30', durationMin: 90 }], athleteIds: ['p-leo', 'p-tom'] },
];

// p-mum guards both Park siblings; Tom (himself an athlete) is an emergency contact for Leo.
const DEMO_CONTACT_LINKS: ContactLink[] = [
  { id: 'cl-mia', contactId: 'p-mum', athleteId: 'p-mia', guardian: true },
  { id: 'cl-ana', contactId: 'p-mum', athleteId: 'p-ana', guardian: true },
  { id: 'cl-leo', contactId: 'p-tom', athleteId: 'p-leo', guardian: false },
];

const DEMO_LOGS: SessionLog[] = [
  {
    id: 'log-demo-1', planId: 'plan-prev', groupId: 'g-youth',
    startedAt: '2026-05-29T18:30:00.000Z', endedAt: '2026-05-29T19:55:00.000Z', status: 'completed',
    gameLogs: [
      { gameId: 'W3', startedAt: '2026-05-29T18:30:00.000Z', endedAt: '2026-05-29T18:38:00.000Z', durationSeconds: 480 },
      { gameId: 'M2', startedAt: '2026-05-29T18:40:00.000Z', endedAt: '2026-05-29T18:52:00.000Z', durationSeconds: 700 },
      { gameId: 'C1', startedAt: '2026-05-29T19:45:00.000Z', endedAt: '2026-05-29T19:53:00.000Z', durationSeconds: 480 },
    ],
  },
];

const DEMO_ASSESSMENTS: Assessment[] = [
  { id: 'as-demo-1', athleteId: 'p-tom', gameId: 'C1', date: '2026-05-29', metric: { type: 'balance_hold', dominant: 18, nonDominant: 14 } },
];

export function devSeed(todayISO: string): AppData {
  const base = migrate({} as AppData); // factory catalogs seeded; people/groups/etc. empty
  const plans: SessionPlan[] = [
    {
      id: 'plan-today-kids', groupId: 'g-kids', name: 'Kids Training',
      plannedDate: todayISO, template: 'kids-2h', templateId: 'kids-2h',
      plannedGames: [...SESSION_TEMPLATES.KIDS_2H], createdAt: todayISO,
    },
  ];
  return {
    ...base,
    persons: DEMO_PERSONS,
    groups: DEMO_GROUPS,
    contactLinks: DEMO_CONTACT_LINKS,
    sessionPlans: plans,
    sessionLogs: DEMO_LOGS,
    assessments: DEMO_ASSESSMENTS,
  };
}
