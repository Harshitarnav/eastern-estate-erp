/**
 * Centralized Cache Manager with Hash-based Comparison
 * Implements three-step caching strategy:
 * 1. First load: Fetch from backend, cache data
 * 2. Subsequent loads: Show cached data immediately
 * 3. Background: Check hash, update if changed
 */

interface CacheEntry<T> {
  data: T;
  hash: string;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate hash for data to detect changes
   * Uses a simple but fast hash algorithm suitable for browser
   */
  private generateHash(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get storage instance based on type
   */
  private getStorage(storageType: 'localStorage' | 'sessionStorage' | 'memory') {
    if (typeof window === 'undefined' || storageType === 'memory') {
      return null;
    }
    return storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
  }

  /**
   * Set data in cache with hash
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = this.defaultTTL, storage = 'localStorage' } = options;
    const hash = this.generateHash(data);
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    const cacheEntry: CacheEntry<T> = {
      data,
      hash,
      timestamp,
      expiresAt,
    };

    // Store in memory cache
    this.memoryCache.set(key, cacheEntry);

    // Store in browser storage if available
    if (storage !== 'memory') {
      const storageInstance = this.getStorage(storage);
      if (storageInstance) {
        try {
          storageInstance.setItem(key, JSON.stringify(cacheEntry));
        } catch (error) {
          console.error('Cache storage error:', error);
        }
      }
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const { storage = 'localStorage' } = options;

    // Try memory cache first
    let cacheEntry = this.memoryCache.get(key);

    // If not in memory, try browser storage
    if (!cacheEntry && storage !== 'memory') {
      const storageInstance = this.getStorage(storage);
      if (storageInstance) {
        try {
          const stored = storageInstance.getItem(key);
          if (stored) {
            cacheEntry = JSON.parse(stored) as CacheEntry<T>;
            // Restore to memory cache
            this.memoryCache.set(key, cacheEntry);
          }
        } catch (error) {
          console.error('Cache retrieval error:', error);
        }
      }
    }

    if (!cacheEntry) {
      return null;
    }

    // Check if expired
    if (Date.now() > cacheEntry.expiresAt) {
      this.remove(key, options);
      return null;
    }

    return cacheEntry.data as T;
  }

  /**
   * Get cache entry with metadata
   */
  getEntry<T>(key: string, options: CacheOptions = {}): CacheEntry<T> | null {
    const { storage = 'localStorage' } = options;

    // Try memory cache first
    let cacheEntry = this.memoryCache.get(key);

    // If not in memory, try browser storage
    if (!cacheEntry && storage !== 'memory') {
      const storageInstance = this.getStorage(storage);
      if (storageInstance) {
        try {
          const stored = storageInstance.getItem(key);
          if (stored) {
            cacheEntry = JSON.parse(stored) as CacheEntry<T>;
          }
        } catch (error) {
          console.error('Cache entry retrieval error:', error);
        }
      }
    }

    return cacheEntry || null;
  }

  /**
   * Check if cached data hash matches new data hash
   */
  hasChanged<T>(key: string, newData: T, options: CacheOptions = {}): boolean {
    const entry = this.getEntry<T>(key, options);
    if (!entry) {
      return true; // No cache, consider it changed
    }

    const newHash = this.generateHash(newData);
    return entry.hash !== newHash;
  }

  /**
   * Get cached hash without retrieving full data
   */
  getHash(key: string, options: CacheOptions = {}): string | null {
    const entry = this.getEntry(key, options);
    return entry ? entry.hash : null;
  }

  /**
   * Check if cache exists and is valid
   */
  has(key: string, options: CacheOptions = {}): boolean {
    const entry = this.getEntry(key, options);
    if (!entry) {
      return false;
    }
    return Date.now() <= entry.expiresAt;
  }

  /**
   * Remove item from cache
   */
  remove(key: string, options: CacheOptions = {}): void {
    const { storage = 'localStorage' } = options;

    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from browser storage
    if (storage !== 'memory') {
      const storageInstance = this.getStorage(storage);
      if (storageInstance) {
        try {
          storageInstance.removeItem(key);
        } catch (error) {
          console.error('Cache removal error:', error);
        }
      }
    }
  }

  /**
   * Clear all cache for a pattern
   */
  clearPattern(pattern: string, options: CacheOptions = {}): void {
    const { storage = 'localStorage' } = options;
    const regex = new RegExp(pattern);

    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from browser storage
    if (storage !== 'memory') {
      const storageInstance = this.getStorage(storage);
      if (storageInstance) {
        try {
          const keys = Object.keys(storageInstance);
          for (const key of keys) {
            if (regex.test(key)) {
              storageInstance.removeItem(key);
            }
          }
        } catch (error) {
          console.error('Cache pattern clear error:', error);
        }
      }
    }
  }

  /**
   * Clear all cache
   */
  clearAll(options: CacheOptions = {}): void {
    const { storage = 'localStorage' } = options;

    // Clear memory cache
    this.memoryCache.clear();

    // Clear browser storage (only cache keys)
    if (storage !== 'memory') {
      const storageInstance = this.getStorage(storage);
      if (storageInstance) {
        try {
          const keys = Object.keys(storageInstance);
          for (const key of keys) {
            if (key.startsWith('cache_')) {
              storageInstance.removeItem(key);
            }
          }
        } catch (error) {
          console.error('Cache clear error:', error);
        }
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(options: CacheOptions = {}): {
    memorySize: number;
    storageSize: number;
  } {
    const { storage = 'localStorage' } = options;
    let storageSize = 0;

    if (storage !== 'memory') {
      const storageInstance = this.getStorage(storage);
      if (storageInstance) {
        try {
          const keys = Object.keys(storageInstance);
          storageSize = keys.filter(k => k.startsWith('cache_')).length;
        } catch (error) {
          console.error('Cache stats error:', error);
        }
      }
    }

    return {
      memorySize: this.memoryCache.size,
      storageSize,
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Helper function to create cache keys
export const createCacheKey = (prefix: string, ...parts: (string | number)[]): string => {
  return `cache_${prefix}_${parts.join('_')}`;
};

// Export types
export type { CacheEntry, CacheOptions };
