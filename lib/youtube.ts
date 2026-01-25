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
    ViralTier,
    VIRAL_TIERS,
    DEFAULT_SEARCH_KEYWORDS,
    // deprecated - 하위 호환성
    ViralLevel,
    VIRAL_CRITERIA,
    VIRAL_LEVEL_THRESHOLDS,
} from "@/types/youtube";
import { getCached, setCache } from "./cache";

// 환경 변수 검증
if (!process.env.YOUTUBE_API_KEY) {
    console.warn("Warning: YOUTUBE_API_KEY is not set. YouTube API calls will fail.");
}

// YouTube API 클라이언트 초기화
const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

// 캐시 키 생성
const getCacheKey = (keyword: string) => `youtube:${keyword.toLowerCase()}`;

/**
 * API 키 검증 헬퍼 함수
 * API 키가 설정되지 않은 경우 에러 throw
 */
function validateApiKey(): void {
    if (!process.env.YOUTUBE_API_KEY) {
        throw new Error("YOUTUBE_API_KEY가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
    }
}

/**
 * 키워드로 최근 영상 검색
 * 최근 48시간 내 업로드된 영상만 필터링
 */
async function searchVideos(keyword: string, maxResults = 15): Promise<string[]> {
    validateApiKey();

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
    validateApiKey();

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

    validateApiKey();

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

// 채널 정보 타입 (구독자 비공개 여부 포함)
interface ChannelInfo {
    subscriberCount: number;  // -1: 비공개
    hiddenSubscriberCount: boolean;
}

/**
 * T021: 채널 구독자 수 일괄 조회
 * channels.list API 사용 (최대 50개 채널)
 * 구독자 비공개 채널 처리 포함
 */
async function getChannelSubscribers(channelIds: string[]): Promise<Map<string, ChannelInfo>> {
    const channelMap = new Map<string, ChannelInfo>();

    if (channelIds.length === 0) return channelMap;
    validateApiKey();

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
            if (!item.id || !item.statistics) continue;

            // 구독자 비공개 여부 확인
            const hiddenSubscriberCount = item.statistics.hiddenSubscriberCount === true;

            channelMap.set(item.id, {
                subscriberCount: hiddenSubscriberCount
                    ? -1  // 비공개인 경우 -1
                    : parseInt(item.statistics.subscriberCount || "0", 10),
                hiddenSubscriberCount,
            });
        }
    }

    return channelMap;
}

/**
 * T022: 바이럴 비율 계산
 * 구독자 비공개(-1) 또는 0인 경우 0 반환
 */
function calculateViralRatio(viewCount: number, subscriberCount: number): number {
    if (subscriberCount <= 0) return 0;
    return Math.round((viewCount / subscriberCount) * 10) / 10;
}

/**
 * 3단계 바이럴 티어 판정 (완화된 기준)
 * 높은 등급부터 체크하여 해당하는 첫 번째 티어 반환
 */
export function getViralTier(subscriberCount: number, viewCount: number): ViralTier | null {
    // 구독자 비공개인 경우 판정 불가
    if (subscriberCount <= 0) return null;

    const ratio = viewCount / subscriberCount;

    // MEGA: 구독자 1만 이하, 조회수 10만 이상, 10배 이상
    if (
        subscriberCount <= VIRAL_TIERS.mega.maxSubscribers &&
        viewCount >= VIRAL_TIERS.mega.minViews &&
        ratio >= VIRAL_TIERS.mega.minRatio
    ) {
        return "mega";
    }

    // HIGH: 구독자 5만 이하, 조회수 5만 이상, 5배 이상
    if (
        subscriberCount <= VIRAL_TIERS.high.maxSubscribers &&
        viewCount >= VIRAL_TIERS.high.minViews &&
        ratio >= VIRAL_TIERS.high.minRatio
    ) {
        return "high";
    }

    // RISING: 구독자 10만 이하, 조회수 1만 이상, 2배 이상
    if (
        subscriberCount <= VIRAL_TIERS.rising.maxSubscribers &&
        viewCount >= VIRAL_TIERS.rising.minViews &&
        ratio >= VIRAL_TIERS.rising.minRatio
    ) {
        return "rising";
    }

    return null;
}

/**
 * 바이럴 티어별 표시 정보 조회
 */
export function getViralTierInfo(tier: ViralTier | null): { emoji: string; label: string; color: string; bgColor: string } {
    if (!tier) {
        return { emoji: "", label: "", color: "", bgColor: "" };
    }
    return VIRAL_TIERS[tier];
}

// ===== 하위 호환성 함수 (deprecated) =====

/**
 * @deprecated - getViralTier 사용 권장
 */
export function isViralVideo(video: { subscriberCount: number; viewCount: number; viralRatio: number }): boolean {
    return (
        video.subscriberCount <= VIRAL_CRITERIA.maxSubscribers &&
        video.viewCount >= VIRAL_CRITERIA.minViews &&
        video.viralRatio >= VIRAL_CRITERIA.minViralRatio
    );
}

/**
 * @deprecated - getViralTier 사용 권장
 */
export function getViralLevel(viralRatio: number): ViralLevel | null {
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.mega) return "mega";
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.super) return "super";
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.viral) return "viral";
    return null;
}

/**
 * @deprecated - getViralTierInfo 사용 권장
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
 * T026: Shorts 영상 검색 (키워드 필수)
 * videoDuration=short 파라미터 사용
 * 키워드 없이 검색 불가 → 기본 키워드 사용
 */
async function searchShortsVideos(
    keyword: string,
    maxResults = 50
): Promise<{ videoId: string; channelId: string }[]> {
    validateApiKey();

    // 최근 15일 내 업로드된 영상
    const publishedAfter = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

    const response = await youtube.search.list({
        part: ["id", "snippet"],
        q: keyword,  // 키워드 필수!
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

// Shorts 영상 상세 정보 타입
interface ShortsVideoDetails {
    title: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnailUrl: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}

/**
 * Shorts 영상 상세 정보 조회
 */
async function getShortsVideoDetails(videoIds: string[]): Promise<Map<string, ShortsVideoDetails>> {
    const detailsMap = new Map<string, ShortsVideoDetails>();

    if (videoIds.length === 0) return detailsMap;
    validateApiKey();

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
 * T021~T026 통합 + 3단계 티어 시스템
 *
 * @param keyword 검색 키워드 (없으면 기본 키워드 순환)
 * @param tierFilter 특정 티어만 필터링 (선택)
 */
export async function detectViralShorts(
    keyword?: string,
    tierFilter?: ViralTier[]
): Promise<ViralShortsResult> {
    // 키워드 설정 (없으면 기본 키워드 중 랜덤)
    const searchKeyword = keyword || DEFAULT_SEARCH_KEYWORDS[
        Math.floor(Math.random() * DEFAULT_SEARCH_KEYWORDS.length)
    ];

    const cacheKey = `youtube:viral-shorts:${searchKeyword}`;

    // 캐시 확인 (30분 TTL)
    const cached = getCached<ViralShortsResult>(cacheKey);
    if (cached) {
        // 캐시된 결과에 필터 적용
        const filteredVideos = tierFilter
            ? cached.videos.filter((v) => v.viralTier && tierFilter.includes(v.viralTier))
            : cached.videos;
        return {
            ...cached,
            videos: filteredVideos,
            viralCount: filteredVideos.length,
            cached: true,
        };
    }

    // 1. Shorts 영상 검색 (T026) - 키워드 필수
    const shortsVideos = await searchShortsVideos(searchKeyword, 50);

    if (shortsVideos.length === 0) {
        return {
            videos: [],
            analyzedAt: new Date().toISOString(),
            cached: false,
            totalSearched: 0,
            viralCount: 0,
        };
    }

    // 2 & 3. 영상 상세 정보 + 채널 구독자 수 병렬 조회 (성능 최적화)
    const videoIds = shortsVideos.map((v) => v.videoId);
    const channelIds = shortsVideos.map((v) => v.channelId);

    const [videoDetails, channelMap] = await Promise.all([
        getShortsVideoDetails(videoIds),
        getChannelSubscribers(channelIds),
    ]);

    // 4. 바이럴 비디오 데이터 조합 + 3단계 티어 판정
    const now = Date.now();
    const viralVideos: ViralVideo[] = [];

    for (const { videoId, channelId } of shortsVideos) {
        const details = videoDetails.get(videoId);
        const channelInfo = channelMap.get(channelId);

        if (!details) continue;

        const subscriberCount = channelInfo?.subscriberCount ?? 0;
        const hiddenSubscriberCount = channelInfo?.hiddenSubscriberCount ?? false;

        const hoursAgo = (now - new Date(details.publishedAt).getTime()) / (1000 * 60 * 60);

        // T022: 바이럴 비율 계산
        const viralRatio = calculateViralRatio(details.viewCount, subscriberCount);

        // 3단계 바이럴 티어 판정
        const viralTier = getViralTier(subscriberCount, details.viewCount);

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
            viralTier,
            publishedAt: details.publishedAt,
            thumbnailUrl: details.thumbnailUrl,
            hoursAgo: Math.round(hoursAgo * 10) / 10,
            isShorts: true,
            hiddenSubscriberCount,
        };

        // 바이럴 티어가 있는 경우만 추가 (3단계 중 하나라도 해당)
        if (viralTier) {
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

    // 필터 적용 (있는 경우)
    if (tierFilter) {
        const filteredVideos = result.videos.filter(
            (v) => v.viralTier && tierFilter.includes(v.viralTier)
        );
        return {
            ...result,
            videos: filteredVideos,
            viralCount: filteredVideos.length,
        };
    }

    return result;
}
