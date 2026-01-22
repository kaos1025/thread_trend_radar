"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ViralVideo, ViralLevel, VIRAL_LEVEL_THRESHOLDS, VIRAL_CRITERIA } from "@/types/youtube";
import { getViralShorts } from "@/app/actions/youtube";
import {
    Youtube,
    Eye,
    Users,
    TrendingUp,
    ExternalLink,
    RefreshCw,
    Flame,
    Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 바이럴 레벨 판정
function getViralLevel(viralRatio: number): ViralLevel | null {
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.mega) return "mega";
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.super) return "super";
    if (viralRatio >= VIRAL_LEVEL_THRESHOLDS.viral) return "viral";
    return null;
}

// T025: 바이럴 레벨별 표시 정보
function getViralLevelInfo(level: ViralLevel | null): { emoji: string; label: string; bgColor: string; textColor: string } {
    switch (level) {
        case "mega":
            return { emoji: "🔥🔥🔥", label: "메가 바이럴", bgColor: "bg-red-500", textColor: "text-white" };
        case "super":
            return { emoji: "🔥🔥", label: "슈퍼 바이럴", bgColor: "bg-orange-500", textColor: "text-white" };
        case "viral":
            return { emoji: "🔥", label: "바이럴", bgColor: "bg-yellow-500", textColor: "text-black" };
        default:
            return { emoji: "", label: "", bgColor: "", textColor: "" };
    }
}

// 숫자 포맷팅 (K, M 단위)
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
}

export function ViralShorts() {
    const [videos, setVideos] = useState<ViralVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stats, setStats] = useState({ totalSearched: 0, viralCount: 0, analyzedAt: "" });
    const { toast } = useToast();

    // 바이럴 쇼츠 로드
    const loadViralShorts = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const result = await getViralShorts();
            setVideos(result.videos);
            setStats({
                totalSearched: result.totalSearched,
                viralCount: result.viralCount,
                analyzedAt: result.analyzedAt,
            });

            if (result.cached && showRefreshToast) {
                toast({
                    title: "캐시된 데이터",
                    description: "최근 분석 결과를 표시합니다. (30분 캐시)",
                });
            }
        } catch (error) {
            console.error("Failed to load viral shorts:", error);
            toast({
                title: "로딩 실패",
                description: (error as Error).message || "바이럴 쇼츠를 불러오는데 실패했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadViralShorts();
    }, []);

    // 영상 클릭 핸들러 (Shorts URL)
    const handleVideoClick = (videoId: string) => {
        window.open(`https://www.youtube.com/shorts/${videoId}`, "_blank");
    };

    // 채널 클릭 핸들러
    const handleChannelClick = (e: React.MouseEvent, channelId: string) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/channel/${channelId}`, "_blank");
    };

    // T024 & T025: 바이럴 뱃지 렌더링
    const renderViralBadge = (viralRatio: number) => {
        const level = getViralLevel(viralRatio);
        const info = getViralLevelInfo(level);

        if (!level) return null;

        return (
            <Badge className={`${info.bgColor} ${info.textColor} text-xs font-bold`}>
                {info.emoji} {info.label}
            </Badge>
        );
    };

    // 로딩 스켈레톤
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                        <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">바이럴 쇼츠</h2>
                        <p className="text-sm text-muted-foreground">
                            구독자 {formatNumber(VIRAL_CRITERIA.maxSubscribers)} 이하 / 조회수 {formatNumber(VIRAL_CRITERIA.minViews)} 이상
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                        {stats.totalSearched}개 검색 / {stats.viralCount}개 발견
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadViralShorts(true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        새로고침
                    </Button>
                </div>
            </div>

            {/* 영상 리스트 */}
            {videos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                    <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">바이럴 쇼츠를 찾지 못했습니다</p>
                    <p className="text-sm mt-1">
                        구독자 {formatNumber(VIRAL_CRITERIA.maxSubscribers)} 이하 채널의<br />
                        조회수 {formatNumber(VIRAL_CRITERIA.minViews)} 이상 영상이 없습니다.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video, index) => {
                        const level = getViralLevel(video.viralRatio);

                        return (
                            <Card
                                key={video.id}
                                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-red-500/50 overflow-hidden"
                                onClick={() => handleVideoClick(video.id)}
                            >
                                {/* 썸네일 */}
                                <div className="relative aspect-[9/16] bg-slate-100 dark:bg-slate-800">
                                    {video.thumbnailUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Youtube className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* 순위 배지 */}
                                    {index < 3 && (
                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-sm font-bold px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                    )}

                                    {/* Shorts 뱃지 */}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="text-xs bg-red-600 text-white">
                                            Shorts
                                        </Badge>
                                    </div>

                                    {/* 바이럴 비율 오버레이 */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                        <div className="flex items-center justify-between">
                                            {renderViralBadge(video.viralRatio)}
                                            <span className="text-white font-bold text-lg flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4" />
                                                {video.viralRatio}x
                                            </span>
                                        </div>
                                    </div>

                                    {/* 외부 링크 아이콘 */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black/60 rounded-full p-3">
                                            <ExternalLink className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* 영상 정보 */}
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                                        {video.title}
                                    </h3>

                                    {/* 채널 정보 */}
                                    <button
                                        className="text-xs text-muted-foreground hover:text-primary truncate block text-left w-full"
                                        onClick={(e) => handleChannelClick(e, video.channelId)}
                                    >
                                        {video.channelTitle}
                                    </button>

                                    {/* 통계 */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            <span>구독자 {formatNumber(video.subscriberCount)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Eye className="h-3 w-3" />
                                            <span>조회수 {formatNumber(video.viewCount)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{video.hoursAgo}시간 전</span>
                                        </div>
                                        <div className={`flex items-center gap-1 font-medium ${
                                            level === "mega" ? "text-red-500" :
                                            level === "super" ? "text-orange-500" :
                                            "text-yellow-500"
                                        }`}>
                                            <Flame className="h-3 w-3" />
                                            <span>{video.viralRatio}배 바이럴</span>
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
