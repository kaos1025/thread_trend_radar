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

// 바이럴 비디오 인터페이스
export interface ViralVideo {
    id: string;
    title: string;
    channelId: string;
    channelTitle: string;
    subscriberCount: number;   // 구독자 수
    viewCount: number;         // 조회수
    likeCount: number;         // 좋아요 수
    commentCount: number;      // 댓글 수
    viralRatio: number;        // 조회수/구독자 비율
    publishedAt: string;       // 업로드 시간
    thumbnailUrl: string;
    hoursAgo: number;          // 업로드 후 경과 시간
    isShorts: boolean;         // Shorts 여부
}

// 바이럴 판정 기준
export const VIRAL_CRITERIA = {
    maxSubscribers: 10000,     // 구독자 1만 이하
    minViews: 100000,          // 조회수 10만 이상
    minViralRatio: 10,         // 최소 10배 이상
} as const;

// 바이럴 레벨 타입
export type ViralLevel = "mega" | "super" | "viral";

// 바이럴 레벨 판정 기준
export const VIRAL_LEVEL_THRESHOLDS = {
    mega: 100,    // 🔥🔥🔥 메가 바이럴 (100x 이상)
    super: 50,    // 🔥🔥 슈퍼 바이럴 (50~99x)
    viral: 10,    // 🔥 바이럴 (10~49x)
} as const;

// 바이럴 쇼츠 탐지 결과
export interface ViralShortsResult {
    videos: ViralVideo[];
    analyzedAt: string;
    cached: boolean;
    totalSearched: number;     // 검색된 전체 영상 수
    viralCount: number;        // 바이럴 판정된 영상 수
}
