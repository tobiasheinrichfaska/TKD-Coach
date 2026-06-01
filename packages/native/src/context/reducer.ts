import {
  AppState,
  Person,
  Group,
  GameDefinition,
  SessionPlan,
  SessionLog,
  Assessment,
  SessionTemplate,
  ContactLink,
  AppData,
} from '../types';

export type Action =
  | { type: 'SET_LOADED'; payload: boolean }
  | { type: 'LOAD_ALL'; payload: AppData }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: { id: string } }
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'DELETE_PERSON'; payload: { id: string } }
  | { type: 'REMOVE_ATHLETE_ROLE'; payload: { id: string } }
  | { type: 'ADD_GAME'; payload: GameDefinition }
  | { type: 'UPDATE_GAME'; payload: GameDefinition }
  | { type: 'DELETE_GAME'; payload: { id: string } }
  | { type: 'ADD_SESSION_PLAN'; payload: SessionPlan }
  | { type: 'UPDATE_SESSION_PLAN'; payload: SessionPlan }
  | { type: 'DELETE_SESSION_PLAN'; payload: { id: string } }
  | { type: 'ADD_SESSION_LOG'; payload: SessionLog }
  | { type: 'UPDATE_SESSION_LOG'; payload: SessionLog }
  | { type: 'DELETE_SESSION_LOG'; payload: { id: string } }
  | { type: 'ADD_ASSESSMENT'; payload: Assessment }
  | { type: 'DELETE_ASSESSMENT'; payload: { id: string } }
  | { type: 'ADD_SESSION_TEMPLATE'; payload: SessionTemplate }
  | { type: 'UPDATE_SESSION_TEMPLATE'; payload: SessionTemplate }
  | { type: 'DELETE_SESSION_TEMPLATE'; payload: { id: string } }
  | { type: 'ADD_CONTACT_LINK'; payload: ContactLink }
  | { type: 'UPDATE_CONTACT_LINK'; payload: ContactLink }
  | { type: 'DELETE_CONTACT_LINK'; payload: { id: string } };

export const EMPTY_APP_DATA: AppData = {
  version: 1,
  games: [],
  persons: [],
  groups: [],
  sessionPlans: [],
  sessionLogs: [],
  assessments: [],
  sessionTemplates: [],
  contactLinks: [],
};

export const EMPTY_STATE: AppState = {
  ...EMPTY_APP_DATA,
  isLoaded: false,
};

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADED':
      return { ...state, isLoaded: action.payload };

    case 'LOAD_ALL':
      return {
        ...action.payload,
        isLoaded: true,
      };

    // Groups
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(g => (g.id === action.payload.id ? action.payload : g)),
      };

    case 'DELETE_GROUP':
      // Membership is many-to-many (Group.athleteIds), so deleting a group only removes
      // the group — its athletes (persons) persist.
      return {
        ...state,
        groups: state.groups.filter(g => g.id !== action.payload.id),
      };

    // Persons (the single human identity; athlete/coach are roles on top)
    case 'ADD_PERSON':
      return { ...state, persons: [...state.persons, action.payload] };

    case 'UPDATE_PERSON':
      return {
        ...state,
        persons: state.persons.map(p => (p.id === action.payload.id ? action.payload : p)),
      };

    case 'DELETE_PERSON': {
      const personId = action.payload.id;
      return {
        ...state,
        persons: state.persons.filter(p => p.id !== personId),
        groups: state.groups.map(g => ({
          ...g,
          athleteIds: g.athleteIds.filter(id => id !== personId),
        })),
        // Drop any contact edge that names this person on either side.
        contactLinks: state.contactLinks.filter(l => l.contactId !== personId && l.athleteId !== personId),
        assessments: state.assessments.filter(a => a.athleteId !== personId),
      };
    }

    case 'REMOVE_ATHLETE_ROLE': {
      // Demote a person from athlete while keeping the human (they may be a coach / a
      // contact for others). Drops the athlete profile, group memberships, their own
      // assessments, and the contact edges where they were the *athlete* — but keeps the
      // person and the edges where they are someone else's *contact*.
      const personId = action.payload.id;
      return {
        ...state,
        persons: state.persons.map(p => (p.id === personId ? { ...p, athlete: undefined } : p)),
        groups: state.groups.map(g => ({
          ...g,
          athleteIds: g.athleteIds.filter(id => id !== personId),
        })),
        contactLinks: state.contactLinks.filter(l => l.athleteId !== personId),
        assessments: state.assessments.filter(a => a.athleteId !== personId),
      };
    }

    // Games
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.payload] };

    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map(g => (g.id === action.payload.id ? action.payload : g)),
      };

    case 'DELETE_GAME':
      return { ...state, games: state.games.filter(g => g.id !== action.payload.id) };

    // Session Plans
    case 'ADD_SESSION_PLAN':
      return { ...state, sessionPlans: [...state.sessionPlans, action.payload] };

    case 'UPDATE_SESSION_PLAN':
      return {
        ...state,
        sessionPlans: state.sessionPlans.map(p => (p.id === action.payload.id ? action.payload : p)),
      };

    case 'DELETE_SESSION_PLAN':
      return { ...state, sessionPlans: state.sessionPlans.filter(p => p.id !== action.payload.id) };

    // Session Logs
    case 'ADD_SESSION_LOG':
      return { ...state, sessionLogs: [...state.sessionLogs, action.payload] };

    case 'UPDATE_SESSION_LOG':
      return {
        ...state,
        sessionLogs: state.sessionLogs.map(l => (l.id === action.payload.id ? action.payload : l)),
      };

    case 'DELETE_SESSION_LOG':
      return { ...state, sessionLogs: state.sessionLogs.filter(l => l.id !== action.payload.id) };

    // Assessments
    case 'ADD_ASSESSMENT':
      return { ...state, assessments: [...state.assessments, action.payload] };

    case 'DELETE_ASSESSMENT':
      return { ...state, assessments: state.assessments.filter(a => a.id !== action.payload.id) };

    // Session Templates
    case 'ADD_SESSION_TEMPLATE':
      return { ...state, sessionTemplates: [...state.sessionTemplates, action.payload] };

    case 'UPDATE_SESSION_TEMPLATE':
      return {
        ...state,
        sessionTemplates: state.sessionTemplates.map(t => (t.id === action.payload.id ? action.payload : t)),
      };

    case 'DELETE_SESSION_TEMPLATE':
      return {
        ...state,
        sessionTemplates: state.sessionTemplates.filter(t => t.id !== action.payload.id),
      };

    // Contact links (emergency-contact / guardian edges)
    case 'ADD_CONTACT_LINK':
      return { ...state, contactLinks: [...state.contactLinks, action.payload] };

    case 'UPDATE_CONTACT_LINK':
      return {
        ...state,
        contactLinks: state.contactLinks.map(l => (l.id === action.payload.id ? action.payload : l)),
      };

    case 'DELETE_CONTACT_LINK':
      return {
        ...state,
        contactLinks: state.contactLinks.filter(l => l.id !== action.payload.id),
      };

    default:
      return state;
  }
}
