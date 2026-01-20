// YouTube Data API v3 서비스
// 급상승 영상 탐지 및 떡상 점수 계산

import { google } from "googleapis";
import { YouTubeVideo, YouTubeTrendResult, TrendLevel, TREND_LEVEL_THRESHOLDS } from "@/types/youtube";
import { getCached, setCache } from "./cache";

// YouTube API 클라이언트 초기화
const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

// 캐시 키 생성
const getCacheKey = (keyword: string) => `youtube:${keyword.toLowerCase()}`;

/**
 * 키워드로 최근 영상 검색
 * 최근 48시간 내 업로드된 영상만 필터링
 */
async function searchVideos(keyword: string, maxResults = 15): Promise<string[]> {
    // 48시간 전 시간 계산
    const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const response = await youtube.search.list({
        part: ["id"],
        q: keyword,
        type: ["video"],
        order: "viewCount",
        publishedAfter,
        maxResults,
        regionCode: "KR",
        relevanceLanguage: "ko",
    });

    // 영상 ID 추출
    const videoIds = response.data.items
        ?.map((item) => item.id?.videoId)
        .filter((id): id is string => !!id) || [];

    return videoIds;
}

/**
 * 영상 상세 정보 및 통계 조회
 */
async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (videoIds.length === 0) return [];

    const response = await youtube.videos.list({
        part: ["snippet", "statistics"],
        id: videoIds,
    });

    const videos: YouTubeVideo[] = [];
    const now = Date.now();

    for (const item of response.data.items || []) {
        const snippet = item.snippet;
        const stats = item.statistics;

        if (!snippet || !stats || !item.id) continue;

        const publishedAt = snippet.publishedAt || new Date().toISOString();
        const hoursAgo = (now - new Date(publishedAt).getTime()) / (1000 * 60 * 60);

        const viewCount = parseInt(stats.viewCount || "0", 10);
        const likeCount = parseInt(stats.likeCount || "0", 10);
        const commentCount = parseInt(stats.commentCount || "0", 10);

        // 떡상 점수 계산
        const { velocityScore, engagementRate, trendScore } = calculateTrendScore(
            viewCount,
            likeCount,
            commentCount,
            hoursAgo
        );

        videos.push({
            id: item.id,
            title: snippet.title || "",
            channelId: snippet.channelId || "",
            channelTitle: snippet.channelTitle || "",
            publishedAt,
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
            description: snippet.description?.slice(0, 200) || "",
            viewCount,
            likeCount,
            commentCount,
            velocityScore,
            engagementRate,
            trendScore,
            hoursAgo: Math.round(hoursAgo * 10) / 10,
        });
    }

    return videos;
}

/**
 * 떡상 점수 계산 알고리즘
 * - velocityScore: 시간당 조회수 (빠른 성장 감지)
 * - engagementRate: 참여율 (좋아요+댓글 / 조회수)
 * - trendScore: 종합 점수 (가중치 적용)
 */
function calculateTrendScore(
    viewCount: number,
    likeCount: number,
    commentCount: number,
    hoursAgo: number
): { velocityScore: number; engagementRate: number; trendScore: number } {
    // 최소 1시간으로 설정 (0으로 나누기 방지)
    const hours = Math.max(hoursAgo, 1);

    // 시간당 조회수 (떡상의 핵심 지표)
    const velocityScore = Math.round(viewCount / hours);

    // 참여율 계산 (조회수 대비 상호작용)
    const engagementRate = viewCount > 0
        ? Math.round(((likeCount + commentCount) / viewCount) * 10000) / 100
        : 0;

    // 종합 점수 계산
    // - 속도(60%): 빠르게 조회수 올라가는 영상
    // - 참여율(40%): 시청자 반응이 좋은 영상
    const trendScore = Math.round(
        velocityScore * 0.6 + engagementRate * 1000 * 0.4
    );

    return { velocityScore, engagementRate, trendScore };
}

/**
 * 떡상 레벨 판정
 */
export function getTrendLevel(trendScore: number): TrendLevel {
    if (trendScore >= TREND_LEVEL_THRESHOLDS.rising) return "rising";
    if (trendScore >= TREND_LEVEL_THRESHOLDS.watching) return "watching";
    if (trendScore >= TREND_LEVEL_THRESHOLDS.growing) return "growing";
    return "normal";
}

/**
 * 떡상 레벨별 표시 정보
 */
export function getTrendLevelInfo(level: TrendLevel): { emoji: string; label: string; color: string } {
    switch (level) {
        case "rising":
            return { emoji: "🔥", label: "급상승", color: "text-red-500" };
        case "watching":
            return { emoji: "⚡", label: "주목", color: "text-yellow-500" };
        case "growing":
            return { emoji: "📈", label: "성장중", color: "text-green-500" };
        default:
            return { emoji: "📊", label: "일반", color: "text-gray-500" };
    }
}

/**
 * 급상승 영상 탐지 (메인 함수)
 * 캐싱 적용으로 API 쿼터 절약
 */
export async function detectRisingVideos(keyword: string): Promise<YouTubeTrendResult> {
    const cacheKey = getCacheKey(keyword);

    // 캐시 확인 (30분 TTL)
    const cached = getCached<YouTubeTrendResult>(cacheKey);
    if (cached) {
        return { ...cached, cached: true };
    }

    // 1. 키워드로 최근 영상 검색
    const videoIds = await searchVideos(keyword);

    // 2. 영상 상세 정보 및 통계 조회
    const videos = await getVideoDetails(videoIds);

    // 3. 떡상 점수순 정렬
    videos.sort((a, b) => b.trendScore - a.trendScore);

    const result: YouTubeTrendResult = {
        keyword,
        videos,
        analyzedAt: new Date().toISOString(),
        cached: false,
    };

    // 캐시 저장 (30분)
    setCache(cacheKey, result, 30);

    return result;
}

/**
 * 인기 급상승 영상 조회 (카테고리별)
 * 한국 인기 동영상 차트 기반
 */
export async function getTrendingVideos(categoryId = "0", maxResults = 10): Promise<YouTubeVideo[]> {
    const cacheKey = `youtube:trending:${categoryId}`;

    // 캐시 확인
    const cached = getCached<YouTubeVideo[]>(cacheKey);
    if (cached) return cached;

    const response = await youtube.videos.list({
        part: ["snippet", "statistics"],
        chart: "mostPopular",
        regionCode: "KR",
        videoCategoryId: categoryId,
        maxResults,
    });

    const videos: YouTubeVideo[] = [];
    const now = Date.now();

    for (const item of response.data.items || []) {
        const snippet = item.snippet;
        const stats = item.statistics;

        if (!snippet || !stats || !item.id) continue;

        const publishedAt = snippet.publishedAt || new Date().toISOString();
        const hoursAgo = (now - new Date(publishedAt).getTime()) / (1000 * 60 * 60);

        const viewCount = parseInt(stats.viewCount || "0", 10);
        const likeCount = parseInt(stats.likeCount || "0", 10);
        const commentCount = parseInt(stats.commentCount || "0", 10);

        const { velocityScore, engagementRate, trendScore } = calculateTrendScore(
            viewCount,
            likeCount,
            commentCount,
            hoursAgo
        );

        videos.push({
            id: item.id,
            title: snippet.title || "",
            channelId: snippet.channelId || "",
            channelTitle: snippet.channelTitle || "",
            publishedAt,
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
            description: snippet.description?.slice(0, 200) || "",
            viewCount,
            likeCount,
            commentCount,
            velocityScore,
            engagementRate,
            trendScore,
            hoursAgo: Math.round(hoursAgo * 10) / 10,
        });
    }

    // 캐시 저장 (15분 - 인기 차트는 자주 변경됨)
    setCache(cacheKey, videos, 15);

    return videos;
}
