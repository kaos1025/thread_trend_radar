"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { YouTubeVideo, TrendLevel, TREND_LEVEL_THRESHOLDS } from "@/types/youtube";
import { getYouTubeTrends, getYouTubeTrendingVideos } from "@/app/actions/youtube";
import {
    Youtube,
    Search,
    Loader2,
    Eye,
    ThumbsUp,
    MessageCircle,
    Clock,
    TrendingUp,
    ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 클라이언트에서 사용할 떡상 레벨 판정 함수
function getTrendLevel(trendScore: number): TrendLevel {
    if (trendScore >= TREND_LEVEL_THRESHOLDS.rising) return "rising";
    if (trendScore >= TREND_LEVEL_THRESHOLDS.watching) return "watching";
    if (trendScore >= TREND_LEVEL_THRESHOLDS.growing) return "growing";
    return "normal";
}

// 클라이언트에서 사용할 떡상 레벨 정보
function getTrendLevelInfo(level: TrendLevel): { emoji: string; label: string; color: string } {
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

interface YouTubeTrendsProps {
    initialKeyword?: string;
}

export function YouTubeTrends({ initialKeyword = "" }: YouTubeTrendsProps) {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [keyword, setKeyword] = useState(initialKeyword);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const { toast } = useToast();

    // 초기 인기 영상 로드
    useEffect(() => {
        async function loadTrending() {
            try {
                setIsLoading(true);
                const trendingVideos = await getYouTubeTrendingVideos("0", 10);
                setVideos(trendingVideos);
            } catch (error) {
                console.error("Failed to load trending videos:", error);
                toast({
                    title: "로딩 실패",
                    description: "인기 영상을 불러오는데 실패했습니다.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        if (!initialKeyword) {
            loadTrending();
        }
    }, [initialKeyword, toast]);

    // 키워드 검색
    const handleSearch = async () => {
        if (!searchKeyword.trim()) return;

        setIsSearching(true);
        try {
            const result = await getYouTubeTrends(searchKeyword);
            setVideos(result.videos);
            setKeyword(searchKeyword);

            if (result.cached) {
                toast({
                    title: "캐시된 데이터",
                    description: "최근 검색 결과를 표시합니다.",
                });
            }
        } catch (error) {
            console.error("Search failed:", error);
            toast({
                title: "검색 실패",
                description: (error as Error).message || "YouTube 검색 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // 떡상 레벨별 뱃지 렌더링
    const renderTrendBadge = (trendScore: number) => {
        const level: TrendLevel = getTrendLevel(trendScore);
        const info = getTrendLevelInfo(level);

        const badgeVariant = level === "rising"
            ? "destructive"
            : level === "watching"
                ? "default"
                : "secondary";

        return (
            <Badge variant={badgeVariant} className="text-xs">
                {info.emoji} {info.label}
            </Badge>
        );
    };

    // 숫자 포맷팅 (K, M 단위)
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    };

    // 영상 카드 클릭 핸들러
    const handleVideoClick = (videoId: string) => {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
    };

    // 로딩 스켈레톤
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 검색 바 */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="YouTube 키워드 검색 (예: 먹방, 브이로그)"
                        className="pl-10"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Youtube className="h-4 w-4 mr-2" />
                            검색
                        </>
                    )}
                </Button>
            </div>

            {/* 검색 결과 헤더 */}
            {keyword && (
                <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">&quot;{keyword}&quot; 급상승 영상</span>
                    <Badge variant="outline" className="ml-auto">
                        {videos.length}개 결과
                    </Badge>
                </div>
            )}

            {/* 영상 리스트 */}
            {videos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Youtube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>검색 결과가 없습니다.</p>
                    <p className="text-sm">다른 키워드로 검색해보세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video, index) => {
                        const maxScore = Math.max(...videos.map((v) => v.trendScore));

                        return (
                            <Card
                                key={video.id}
                                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-red-500/50 overflow-hidden"
                                onClick={() => handleVideoClick(video.id)}
                            >
                                <div className="flex gap-4 p-4">
                                    {/* 썸네일 */}
                                    <div className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        {video.thumbnailUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Youtube className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        {/* 순위 배지 */}
                                        {index < 3 && (
                                            <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                                #{index + 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* 영상 정보 */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                                                {video.title}
                                            </h3>
                                            <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <p className="text-xs text-muted-foreground truncate">
                                            {video.channelTitle}
                                        </p>

                                        {/* 통계 */}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {formatNumber(video.viewCount)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="h-3 w-3" />
                                                {formatNumber(video.likeCount)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="h-3 w-3" />
                                                {formatNumber(video.commentCount)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {video.hoursAgo}시간 전
                                            </span>
                                        </div>

                                        {/* 떡상 점수 */}
                                        <div className="flex items-center gap-2">
                                            {renderTrendBadge(video.trendScore)}
                                            <div className="flex-1">
                                                <Progress
                                                    value={(video.trendScore / maxScore) * 100}
                                                    className="h-1.5"
                                                />
                                            </div>
                                            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                {formatNumber(video.velocityScore)}/h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
