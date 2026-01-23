// YouTube Data API v3 관련 타입 정의

export interface YouTubeVideo {
    id: string;
    title: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnailUrl: string;
    description: string;
    // 통계 데이터
    viewCount: number;
    likeCount: number;
    commentCount: number;
    // 떡상 분석용 계산 필드
    velocityScore: number;      // 시간당 조회수 증가율
    engagementRate: number;     // (좋아요+댓글) / 조회수
    trendScore: number;         // 종합 점수
    hoursAgo: number;           // 업로드 후 경과 시간
}

export interface YouTubeTrendResult {
    keyword: string;
    videos: YouTubeVideo[];
    analyzedAt: string;
    cached: boolean;
}

// 떡상 레벨 분류
export type TrendLevel = "rising" | "watching" | "growing" | "normal";

// 떡상 레벨 판정 기준
export const TREND_LEVEL_THRESHOLDS = {
    rising: 10000,    // 🔥 급상승
    watching: 5000,   // ⚡ 주목
    growing: 1000,    // 📈 성장중
} as const;

// API 에러 타입
export interface YouTubeAPIError {
    code: number;
    message: string;
    isQuotaExceeded: boolean;
}

// ===== 바이럴 쇼츠 탐지 관련 타입 =====

// 바이럴 3단계 티어 시스템 (완화된 기준)
export type ViralTier = "mega" | "high" | "rising";

export interface ViralTierConfig {
    maxSubscribers: number;    // 최대 구독자 수
    minViews: number;          // 최소 조회수
    minRatio: number;          // 최소 바이럴 비율
    label: string;             // 표시 라벨
    emoji: string;             // 이모지
    color: string;             // 색상 (Tailwind)
    bgColor: string;           // 배경 색상
}

// 3단계 바이럴 티어 기준 (완화됨)
export const VIRAL_TIERS: Record<ViralTier, ViralTierConfig> = {
    mega: {      // 🔥🔥🔥 메가 바이럴
        maxSubscribers: 10000,
        minViews: 100000,
        minRatio: 10,
        label: "메가 바이럴",
        emoji: "🔥🔥🔥",
        color: "text-red-600",
        bgColor: "bg-red-500",
    },
    high: {      // 🔥🔥 바이럴
        maxSubscribers: 50000,
        minViews: 50000,
        minRatio: 5,
        label: "바이럴",
        emoji: "🔥🔥",
        color: "text-orange-500",
        bgColor: "bg-orange-500",
    },
    rising: {    // 🔥 떠오르는
        maxSubscribers: 100000,
        minViews: 10000,
        minRatio: 2,
        label: "떠오르는",
        emoji: "🔥",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
    },
} as const;

// 기본 검색 키워드
export const DEFAULT_SEARCH_KEYWORDS = [
    "브이로그", "일상", "먹방", "쇼핑", "룩북",
    "OOTD", "하울", "리뷰", "챌린지", "shorts",
    "틱톡", "릴스", "꿀팁", "추천",
] as const;

// 바이럴 비디오 인터페이스
export interface ViralVideo {
    id: string;
    title: string;
    channelId: string;
    channelTitle: string;
    subscriberCount: number;   // 구독자 수 (-1: 비공개)
    viewCount: number;         // 조회수
    likeCount: number;         // 좋아요 수
    commentCount: number;      // 댓글 수
    viralRatio: number;        // 조회수/구독자 비율
    viralTier: ViralTier | null; // 바이럴 등급 (null: 미달)
    publishedAt: string;       // 업로드 시간
    thumbnailUrl: string;
    hoursAgo: number;          // 업로드 후 경과 시간
    isShorts: boolean;         // Shorts 여부
    hiddenSubscriberCount?: boolean; // 구독자 비공개 여부
}

// 하위 호환성을 위한 기존 상수 유지 (deprecated)
// @deprecated - VIRAL_TIERS 사용 권장
export const VIRAL_CRITERIA = {
    maxSubscribers: 10000,
    minViews: 50000,
    minViralRatio: 10,
} as const;

// @deprecated - ViralTier 사용 권장
export type ViralLevel = "mega" | "super" | "viral";

// @deprecated - VIRAL_TIERS 사용 권장
export const VIRAL_LEVEL_THRESHOLDS = {
    mega: 100,
    super: 50,
    viral: 10,
} as const;

// 바이럴 쇼츠 탐지 결과
export interface ViralShortsResult {
    videos: ViralVideo[];
    analyzedAt: string;
    cached: boolean;
    totalSearched: number;     // 검색된 전체 영상 수
    viralCount: number;        // 바이럴 판정된 영상 수
}
