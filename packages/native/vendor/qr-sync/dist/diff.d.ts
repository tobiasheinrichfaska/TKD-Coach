/** Anything with a stable string `id` can be synced. */
export interface Identifiable {
    id: string;
}
/** The keys of `T` whose values are arrays of {@link Identifiable} ("collections"). */
export type CollectionKey<T> = {
    [K in keyof T]: T[K] extends Identifiable[] ? K : never;
}[keyof T];
/** A subset of `T` containing only its collection arrays. */
export type Buckets<T> = {
    [K in CollectionKey<T>]: T[K];
};
export interface ChangeDetection<T> {
    /** Imported items with ids not present locally. */
    new: Buckets<T>;
    /** Imported items whose id exists locally but content differs. */
    changed: Buckets<T>;
    /** Imported items identical to the local copy. */
    unchanged: Buckets<T>;
}
/** Which collections to include in an export. Include a collection when its flag is `true`. */
export type Selection<T> = Partial<Record<CollectionKey<T>, boolean>>;
export interface SyncEngineOptions<T> {
    /** The collection keys of `T` to sync (each must be an array of `{ id }`). */
    collections: ReadonlyArray<CollectionKey<T>>;
}
export interface SyncEngine<T> {
    exportSelected(data: T, selection: Selection<T>): T;
    detectChanges(local: T, imported: T): ChangeDetection<T>;
    applyChanges(local: T, changes: ChangeDetection<T>): T;
}
/**
 * Build a sync engine bound to a data shape `T` and its collection keys.
 *
 * The engine is schema-agnostic: it only knows that the named keys hold arrays of
 * `{ id }` items. Non-collection fields (e.g. a `version` number) are carried over
 * from the local data untouched.
 *
 * @example
 *   const engine = createSyncEngine<AppData>({
 *     collections: ['groups', 'athletes', 'games', 'sessionPlans', 'sessionLogs', 'assessments'],
 *   });
 */
export declare function createSyncEngine<T extends object>(options: SyncEngineOptions<T>): SyncEngine<T>;
//# sourceMappingURL=diff.d.ts.map