// 메모리 캐시 유틸리티
// YouTube API 쿼터 절약을 위한 간단한 TTL 캐시

interface CacheItem<T> {
    data: T;
    expiry: number;
}

const cache = new Map<string, CacheItem<unknown>>();

/**
 * 캐시에서 데이터 조회
 * 만료된 경우 null 반환
 */
export function getCached<T>(key: string): T | null {
    const item = cache.get(key);
    if (!item) return null;

    if (item.expiry < Date.now()) {
        cache.delete(key);
        return null;
    }

    return item.data as T;
}

/**
 * 캐시에 데이터 저장
 * @param key 캐시 키
 * @param data 저장할 데이터
 * @param ttlMinutes TTL (분 단위, 기본 30분)
 */
export function setCache<T>(key: string, data: T, ttlMinutes = 30): void {
    cache.set(key, {
        data,
        expiry: Date.now() + ttlMinutes * 60 * 1000,
    });
}

/**
 * 특정 키의 캐시 삭제
 */
export function deleteCache(key: string): void {
    cache.delete(key);
}

/**
 * 전체 캐시 초기화
 */
export function clearCache(): void {
    cache.clear();
}

/**
 * 만료된 캐시 항목 정리
 */
export function cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
        if (item.expiry < now) {
            cache.delete(key);
        }
    }
}
