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
