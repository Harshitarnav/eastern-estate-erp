export type CollectionsDdActivityEntry = {
    at: string;
    kind: string;
    label: string;
    detail?: string | null;
    by?: string | null;
};
export declare function appendCollectionsActivityPayload(metadata: Record<string, unknown> | null | undefined, entry: Omit<CollectionsDdActivityEntry, 'at'> & {
    at?: string;
}): Record<string, unknown>;
