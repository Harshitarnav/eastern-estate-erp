"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendCollectionsActivityPayload = appendCollectionsActivityPayload;
function appendCollectionsActivityPayload(metadata, entry) {
    const prev = metadata?.collectionsActivities || [];
    const activities = [...prev];
    activities.push({
        at: entry.at ?? new Date().toISOString(),
        kind: entry.kind,
        label: entry.label,
        detail: entry.detail ?? null,
        by: entry.by ?? null,
    });
    return { ...(metadata || {}), collectionsActivities: activities };
}
//# sourceMappingURL=collections-dd-activity.util.js.map