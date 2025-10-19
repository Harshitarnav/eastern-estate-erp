import { cacheManager, createCacheKey, CacheOptions } from '../utils/cache';
import api from './api';

/**
 * Base Service with Caching and Hash-based Update Detection
 * 
 * Strategy:
 * 1. First load: Fetch from API, cache data
 * 2. Subsequent loads: Return cached data immediately
 * 3. Background: Fetch fresh data, compare hash, update if changed
 */
export class BaseCachedService {
  protected readonly cacheOptions: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes
    storage: 'localStorage',
  };

  /**
   * Fetch data with caching strategy
   * Returns cached data immediately if available, then checks for updates in background
   */
  protected async fetchWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    options: { forceRefresh?: boolean; skipCache?: boolean } = {}
  ): Promise<T> {
    const { forceRefresh = false, skipCache = false } = options;

    // If force refresh or skip cache, just fetch
    if (forceRefresh || skipCache) {
      const data = await fetcher();
      if (!skipCache) {
        cacheManager.set(cacheKey, data, this.cacheOptions);
      }
      return data;
    }

    // Try to get cached data
    const cachedData = cacheManager.get<T>(cacheKey, this.cacheOptions);

    // If no cache, fetch and cache
    if (!cachedData) {
      const data = await fetcher();
      cacheManager.set(cacheKey, data, this.cacheOptions);
      return data;
    }

    // Return cached data immediately
    // Then fetch fresh data in background to check for updates
    this.checkForUpdates(cacheKey, fetcher).catch(error => {
      console.warn('Background update check failed:', error);
    });

    return cachedData;
  }

  /**
   * Check for updates in background
   * Fetches fresh data and updates cache if hash has changed
   */
  private async checkForUpdates<T>(
    cacheKey: string,
    fetcher: () => Promise<T>
  ): Promise<void> {
    try {
      const freshData = await fetcher();
      
      // Check if data has changed
      if (cacheManager.hasChanged(cacheKey, freshData, this.cacheOptions)) {
        // Update cache with new data
        cacheManager.set(cacheKey, freshData, this.cacheOptions);
        
        // Trigger a custom event to notify components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cache-updated', {
            detail: { cacheKey, data: freshData }
          }));
        }
      }
    } catch (error) {
      // Silently fail background updates
      console.debug('Background update failed:', error);
    }
  }

  /**
   * Invalidate cache for a specific key
   */
  protected invalidateCache(cacheKey: string): void {
    cacheManager.remove(cacheKey, this.cacheOptions);
  }

  /**
   * Invalidate cache for a pattern
   */
  protected invalidateCachePattern(pattern: string): void {
    cacheManager.clearPattern(pattern, this.cacheOptions);
  }

  /**
   * Clear all cache for this service
   */
  protected clearAllCache(): void {
    cacheManager.clearAll(this.cacheOptions);
  }

  /**
   * Make a GET request with error handling
   */
  protected async get<T>(url: string): Promise<T> {
    try {
      return await api.get<T>(url);
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request with error handling and cache invalidation
   */
  protected async post<T>(url: string, data?: any, cachePatternToInvalidate?: string): Promise<T> {
    try {
      const result = await api.post<T>(url, data);
      
      // Invalidate related cache
      if (cachePatternToInvalidate) {
        this.invalidateCachePattern(cachePatternToInvalidate);
      }
      
      return result;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PUT request with error handling and cache invalidation
   */
  protected async put<T>(url: string, data?: any, cachePatternToInvalidate?: string): Promise<T> {
    try {
      const result = await api.put<T>(url, data);
      
      // Invalidate related cache
      if (cachePatternToInvalidate) {
        this.invalidateCachePattern(cachePatternToInvalidate);
      }
      
      return result;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PATCH request with error handling and cache invalidation
   */
  protected async patch<T>(url: string, data?: any, cachePatternToInvalidate?: string): Promise<T> {
    try {
      const result = await api.patch<T>(url, data);
      
      // Invalidate related cache
      if (cachePatternToInvalidate) {
        this.invalidateCachePattern(cachePatternToInvalidate);
      }
      
      return result;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a DELETE request with error handling and cache invalidation
   */
  protected async delete<T>(url: string, cachePatternToInvalidate?: string): Promise<T> {
    try {
      const result = await api.delete<T>(url);
      
      // Invalidate related cache
      if (cachePatternToInvalidate) {
        this.invalidateCachePattern(cachePatternToInvalidate);
      }
      
      return result;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): void {
    // Log error for debugging
    console.error('API Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: error.config?.url,
    });

    // You can add additional error handling logic here
    // For example, showing toast notifications, etc.
  }

  /**
   * Create a standard cache key
   */
  protected createKey(prefix: string, ...parts: (string | number)[]): string {
    return createCacheKey(prefix, ...parts);
  }
}
