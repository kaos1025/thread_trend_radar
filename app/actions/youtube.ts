"use server";

import { detectRisingVideos, getTrendingVideos, detectViralShorts } from "@/lib/youtube";
import { YouTubeTrendResult, YouTubeVideo, ViralShortsResult, ViralTier, DEFAULT_SEARCH_KEYWORDS } from "@/types/youtube";
import { getCached } from "@/lib/cache";

/**
 * 키워드로 YouTube 급상승 영상 조회
 * 캐싱 및 에러 핸들링 적용
 */
export async function getYouTubeTrends(keyword: string): Promise<YouTubeTrendResult> {
    try {
        const result = await detectRisingVideos(keyword);
        return result;
    } catch (error: unknown) {
        console.error("YouTube API Error:", error);

        // API 에러 타입 체크
        const err = error as { code?: number; message?: string };

        // 쿼터 초과 시 캐시된 데이터 반환 시도
        if (err.code === 403) {
            const cached = getCached<YouTubeTrendResult>(`youtube:${keyword.toLowerCase()}`);
            if (cached) {
                console.log("Returning cached data due to quota exceeded");
                return { ...cached, cached: true };
            }
        }

        throw new Error(
            err.code === 403
                ? "YouTube API 일일 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요."
                : `YouTube 트렌드 조회 실패: ${err.message || "Unknown error"}`
        );
    }
}

/**
 * 카테고리별 인기 급상승 영상 조회
 * @param categoryId YouTube 카테고리 ID (기본값: 0 = 전체)
 *
 * 주요 카테고리 ID:
 * - 0: 전체
 * - 10: 음악
 * - 20: 게임
 * - 22: 사람 및 블로그
 * - 24: 엔터테인먼트
 * - 25: 뉴스 및 정치
 * - 28: 과학 기술
 */
export async function getYouTubeTrendingVideos(
    categoryId = "0",
    maxResults = 10
): Promise<YouTubeVideo[]> {
    try {
        const videos = await getTrendingVideos(categoryId, maxResults);
        return videos;
    } catch (error: unknown) {
        console.error("YouTube Trending API Error:", error);

        const err = error as { code?: number; message?: string };

        // 쿼터 초과 시 캐시된 데이터 반환
        if (err.code === 403) {
            const cached = getCached<YouTubeVideo[]>(`youtube:trending:${categoryId}`);
            if (cached) {
                console.log("Returning cached trending data due to quota exceeded");
                return cached;
            }
        }

        throw new Error(
            err.code === 403
                ? "YouTube API 일일 쿼터가 초과되었습니다."
                : `인기 영상 조회 실패: ${err.message || "Unknown error"}`
        );
    }
}

/**
 * 바이럴 쇼츠 탐지 (3단계 티어 시스템)
 * 구독자 대비 조회수 폭발 Shorts 영상 조회
 *
 * @param keyword 검색 키워드 (없으면 기본 키워드 순환)
 * @param tierFilter 특정 티어만 필터링 (선택)
 */
export async function getViralShorts(
    keyword?: string,
    tierFilter?: ViralTier[]
): Promise<ViralShortsResult> {
    // 키워드가 없으면 랜덤 선택 (캐시 키 일관성 확보)
    const searchKeyword = keyword || DEFAULT_SEARCH_KEYWORDS[
        Math.floor(Math.random() * DEFAULT_SEARCH_KEYWORDS.length)
    ];
    const cacheKey = `youtube:viral-shorts:${searchKeyword}`;

    try {
        const result = await detectViralShorts(searchKeyword, tierFilter);
        return result;
    } catch (error: unknown) {
        console.error("Viral Shorts API Error:", error);

        const err = error as { code?: number; message?: string };

        // 쿼터 초과 시 캐시된 데이터 반환
        if (err.code === 403) {
            const cached = getCached<ViralShortsResult>(cacheKey);
            if (cached) {
                console.log("Returning cached viral shorts data due to quota exceeded");
                return { ...cached, cached: true };
            }
        }

        throw new Error(
            err.code === 403
                ? "YouTube API 일일 쿼터가 초과되었습니다."
                : `바이럴 쇼츠 조회 실패: ${err.message || "Unknown error"}`
        );
    }
}
