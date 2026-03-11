/**
 * Injection token for the active storage service.
 * Resolves to LocalStorageService in development (no MINIO_ENDPOINT set)
 * Resolves to MinioStorageService in production (MINIO_ENDPOINT set)
 */
export const STORAGE_SERVICE = 'STORAGE_SERVICE';
