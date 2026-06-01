/**
 * Typed navigation param lists.
 *
 * One ParamList per navigator. Screens are typed with the *ScreenProps helpers
 * below, which compose the screen's own stack with the root tab navigator so
 * cross-tab navigation (e.g. Groups → Assessment) is fully type-checked.
 *
 * This is what makes wrong tab/route names a compile error instead of a silent
 * runtime no-op.
 */
import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TransferSelection } from './index';

// The "Humans" tab stack (kept named GroupsStack* for back-compat across screens).
export type GroupsStackParamList = {
  HumansHub: undefined;
  GroupsList: undefined;
  AllAthletes: undefined;
  GroupDetail: { groupId: string };
  EditGroup: { groupId?: string } | undefined;
  AthleteDetail: { athleteId: string };
  EditAthlete: { athleteId?: string; groupId?: string } | undefined;
  EmergencyContacts: undefined;
  EditEmergencyContact: { contactId?: string; athleteId?: string } | undefined;
  AddContact: { athleteId: string };
  // Assessment is nested under Humans (no longer a top-level tab).
  Assessment: NavigatorScreenParams<AssessmentStackParamList>;
};

export type OtherDataStackParamList = {
  OtherDataHub: undefined;
  GamesList: undefined;
  TechniquesList: undefined;
  BodyPartsList: undefined;
  TemplatesList: undefined;
  MetricSchemasList: undefined;
};

export type SessionsStackParamList = {
  SessionsList: undefined;
  PlanSession: { planId?: string; fromGroupId?: string; fromGameIds?: string[] } | undefined;
  RunSession: { planId: string };
  RecentSessions: undefined;
  SessionArchive: undefined;
};

export type AssessmentStackParamList = {
  AssessmentList: undefined;
  Progress: { athleteId?: string } | undefined;
};

export type TransferStackParamList = {
  TransferMain: undefined;
  SelectData: undefined;
  Sender: { selection: TransferSelection };
  Receiver: undefined;
};

export type SettingsStackParamList = {
  SettingsHub: undefined;
  Transfer: NavigatorScreenParams<TransferStackParamList>;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Sessions: NavigatorScreenParams<SessionsStackParamList>;
  Humans: NavigatorScreenParams<GroupsStackParamList>;
  OtherData: NavigatorScreenParams<OtherDataStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// --- Screen prop helpers -----------------------------------------------------

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

export type GroupsStackScreenProps<T extends keyof GroupsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<GroupsStackParamList, T>,
    RootTabScreenProps<keyof RootTabParamList>
  >;

export type SessionsStackScreenProps<T extends keyof SessionsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SessionsStackParamList, T>,
    RootTabScreenProps<keyof RootTabParamList>
  >;

export type AssessmentStackScreenProps<T extends keyof AssessmentStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AssessmentStackParamList, T>,
    RootTabScreenProps<keyof RootTabParamList>
  >;

export type TransferStackScreenProps<T extends keyof TransferStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<TransferStackParamList, T>,
    RootTabScreenProps<keyof RootTabParamList>
  >;

export type OtherDataStackScreenProps<T extends keyof OtherDataStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OtherDataStackParamList, T>,
    RootTabScreenProps<keyof RootTabParamList>
  >;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    RootTabScreenProps<keyof RootTabParamList>
  >;

/** Global type augmentation so useNavigation() etc. are typed app-wide. */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
