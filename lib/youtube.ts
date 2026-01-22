// YouTube Data API v3 서비스
// 급상승 영상 탐지 및 떡상 점수 계산

import { google } from "googleapis";
import {
    YouTubeVideo,
    YouTubeTrendResult,
    TrendLevel,
    TREND_LEVEL_THRESHOLDS,
    ViralVideo,
    ViralShortsResult,
    ViralLevel,
    VIRAL_CRITERIA,
    VIRAL_LEVEL_THRESHOLDS,
} from "@/types/youtube";
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

// ===== 바이럴 쇼츠 탐지 기능 (T021~T026) =====

/**
 * T021: 채널 구독자 수 일괄 조회
 * channels.list API 사용 (최대 50개 채널)
 */
async function getChannelSubscribers(channelIds: string[]): Promise<Map<string, number>> {
    const subscriberMap = new Map<string, number>();

    if (channelIds.length === 0) return subscriberMap;

    // 중복 제거
    const uniqueIds = [...new Set(channelIds)];

    // 50개씩 나눠서 조회 (API 제한)
    for (let i = 0; i < uniqueIds.length; i += 50) {
        const batch = uniqueIds.slice(i, i + 50);

        const response = await youtube.channels.list({
            part: ["statistics"],
            id: batch,
        });

        for (const item of response.data.items || []) {
            if (item.id && item.statistics?.subscriberCount) {
                subscriberMap.set(
                    item.id,
                    parseInt(item.statistics.subscriberCount, 10)
                );
            }
        }
    }

    return subscriberMap;
}

/**
 * T022: 바이럴 비율 계산
 */
function calculateViralRatio(viewCount: number, subscriberCount: number): number {
    if (subscriberCount <= 0) return 0;
    return Math.round((viewCount / subscriberCount) * 10) / 10;
}

/**
 * T023: 바이럴 판정
 */
export function isViralVideo(video: { subscriberCount: number; viewCount: number; viralRatio: number }): boolean {
    return (
        video.subscriberCount <= VIRAL_CRITERIA.maxSubscribers &&
        video.viewCount >= VIRAL_CRITERIA.minViews &&
        video.viralRatio >= VIRAL_CRITERIA.minViralRatio
    );
}

/**
 * T025: 바이럴 레벨 판정
 */
export function getViralLevel(viralRatio: number): ViralLevel | null {
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.mega) return "mega";
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.super) return "super";
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.viral) return "viral";
    return null;
}

/**
 * T025: 바이럴 레벨별 표시 정보
 */
export function getViralLevelInfo(level: ViralLevel | null): { emoji: string; label: string; color: string } {
    switch (level) {
        case "mega":
            return { emoji: "🔥🔥🔥", label: "메가 바이럴", color: "text-red-600" };
        case "super":
            return { emoji: "🔥🔥", label: "슈퍼 바이럴", color: "text-orange-500" };
        case "viral":
            return { emoji: "🔥", label: "바이럴", color: "text-yellow-500" };
        default:
            return { emoji: "", label: "", color: "" };
    }
}

/**
 * T026: Shorts 영상 검색
 * videoDuration=short 파라미터 사용
 */
async function searchShortsVideos(maxResults = 50): Promise<{ videoId: string; channelId: string }[]> {
    // 최근 15일 내 업로드된 영상
    const publishedAfter = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

    const response = await youtube.search.list({
        part: ["id", "snippet"],
        type: ["video"],
        videoDuration: "short",  // Shorts 필터
        order: "viewCount",
        publishedAfter,
        maxResults,
        regionCode: "KR",
        relevanceLanguage: "ko",
    });

    return (response.data.items || [])
        .filter((item) => item.id?.videoId && item.snippet?.channelId)
        .map((item) => ({
            videoId: item.id!.videoId!,
            channelId: item.snippet!.channelId!,
        }));
}

/**
 * Shorts 영상 상세 정보 조회
 */
async function getShortsVideoDetails(videoIds: string[]): Promise<Map<string, {
    title: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnailUrl: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}>> {
    const detailsMap = new Map();

    if (videoIds.length === 0) return detailsMap;

    const response = await youtube.videos.list({
        part: ["snippet", "statistics"],
        id: videoIds,
    });

    for (const item of response.data.items || []) {
        if (!item.id || !item.snippet || !item.statistics) continue;

        detailsMap.set(item.id, {
            title: item.snippet.title || "",
            channelId: item.snippet.channelId || "",
            channelTitle: item.snippet.channelTitle || "",
            publishedAt: item.snippet.publishedAt || new Date().toISOString(),
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
            viewCount: parseInt(item.statistics.viewCount || "0", 10),
            likeCount: parseInt(item.statistics.likeCount || "0", 10),
            commentCount: parseInt(item.statistics.commentCount || "0", 10),
        });
    }

    return detailsMap;
}

/**
 * 바이럴 쇼츠 탐지 (메인 함수)
 * T021~T026 통합
 */
export async function detectViralShorts(): Promise<ViralShortsResult> {
    const cacheKey = "youtube:viral-shorts";

    // 캐시 확인 (30분 TTL)
    const cached = getCached<ViralShortsResult>(cacheKey);
    if (cached) {
        return { ...cached, cached: true };
    }

    // 1. Shorts 영상 검색 (T026)
    const shortsVideos = await searchShortsVideos(50);

    if (shortsVideos.length === 0) {
        return {
            videos: [],
            analyzedAt: new Date().toISOString(),
            cached: false,
            totalSearched: 0,
            viralCount: 0,
        };
    }

    // 2. 영상 상세 정보 조회
    const videoIds = shortsVideos.map((v) => v.videoId);
    const videoDetails = await getShortsVideoDetails(videoIds);

    // 3. 채널 구독자 수 조회 (T021)
    const channelIds = shortsVideos.map((v) => v.channelId);
    const subscriberMap = await getChannelSubscribers(channelIds);

    // 4. 바이럴 비디오 데이터 조합
    const now = Date.now();
    const viralVideos: ViralVideo[] = [];

    for (const { videoId, channelId } of shortsVideos) {
        const details = videoDetails.get(videoId);
        const subscriberCount = subscriberMap.get(channelId) || 0;

        if (!details) continue;

        const hoursAgo = (now - new Date(details.publishedAt).getTime()) / (1000 * 60 * 60);

        // T022: 바이럴 비율 계산
        const viralRatio = calculateViralRatio(details.viewCount, subscriberCount);

        const video: ViralVideo = {
            id: videoId,
            title: details.title,
            channelId,
            channelTitle: details.channelTitle,
            subscriberCount,
            viewCount: details.viewCount,
            likeCount: details.likeCount,
            commentCount: details.commentCount,
            viralRatio,
            publishedAt: details.publishedAt,
            thumbnailUrl: details.thumbnailUrl,
            hoursAgo: Math.round(hoursAgo * 10) / 10,
            isShorts: true,
        };

        // T023: 바이럴 판정 기준 적용
        if (isViralVideo(video)) {
            viralVideos.push(video);
        }
    }

    // 바이럴 비율 순으로 정렬
    viralVideos.sort((a, b) => b.viralRatio - a.viralRatio);

    const result: ViralShortsResult = {
        videos: viralVideos,
        analyzedAt: new Date().toISOString(),
        cached: false,
        totalSearched: shortsVideos.length,
        viralCount: viralVideos.length,
    };

    // 캐시 저장 (30분)
    setCache(cacheKey, result, 30);

    return result;
}
