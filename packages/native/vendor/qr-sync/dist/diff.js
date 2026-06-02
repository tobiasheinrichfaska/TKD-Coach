"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSyncEngine = createSyncEngine;
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
function createSyncEngine(options) {
    const { collections } = options;
    const arr = (data, key) => { var _a; return (_a = data[key]) !== null && _a !== void 0 ? _a : []; };
    const emptyBuckets = () => {
        const buckets = {};
        for (const key of collections) {
            buckets[key] = [];
        }
        return buckets;
    };
    function exportSelected(data, selection) {
        const out = { ...data };
        for (const key of collections) {
            out[key] = selection[key] ? arr(data, key) : [];
        }
        return out;
    }
    function detectChanges(local, imported) {
        const result = {
            new: emptyBuckets(),
            changed: emptyBuckets(),
            unchanged: emptyBuckets(),
        };
        for (const key of collections) {
            const localById = new Map(arr(local, key).map((e) => [e.id, e]));
            for (const item of arr(imported, key)) {
                const existing = localById.get(item.id);
                const bucket = !existing
                    ? result.new
                    : JSON.stringify(existing) !== JSON.stringify(item)
                        ? result.changed
                        : result.unchanged;
                bucket[key].push(item);
            }
        }
        return result;
    }
    function applyChanges(local, changes) {
        const out = { ...local };
        for (const key of collections) {
            const changedById = new Map(changes.changed[key].map((e) => [e.id, e]));
            const added = changes.new[key];
            out[key] = [
                ...arr(local, key).map((e) => { var _a; return (_a = changedById.get(e.id)) !== null && _a !== void 0 ? _a : e; }),
                ...added,
            ];
        }
        return out;
    }
    return { exportSelected, detectChanges, applyChanges };
}
//# sourceMappingURL=diff.js.map