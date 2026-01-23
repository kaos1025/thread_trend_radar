"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    ViralVideo,
    ViralTier,
    VIRAL_TIERS,
    DEFAULT_SEARCH_KEYWORDS,
} from "@/types/youtube";
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
    AlertCircle,
    Search,
    Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 바이럴 티어 목록 (필터용)
const TIER_OPTIONS: { tier: ViralTier; config: typeof VIRAL_TIERS.mega }[] = [
    { tier: "mega", config: VIRAL_TIERS.mega },
    { tier: "high", config: VIRAL_TIERS.high },
    { tier: "rising", config: VIRAL_TIERS.rising },
];

// 숫자 포맷팅 (K, M 단위)
function formatNumber(num: number): string {
    if (num < 0) return "비공개";
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
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalSearched: 0, viralCount: 0, analyzedAt: "" });

    // 키워드 검색 상태
    const [keyword, setKeyword] = useState<string>("");
    const [selectedKeyword, setSelectedKeyword] = useState<string>("");

    // 티어 필터 상태 (기본: 모든 티어 선택)
    const [selectedTiers, setSelectedTiers] = useState<ViralTier[]>(["mega", "high", "rising"]);

    const { toast } = useToast();

    // 바이럴 쇼츠 로드 (API에서는 전체 조회, 필터링은 클라이언트에서 처리)
    const loadViralShorts = useCallback(async (searchKeyword?: string, showRefreshToast = false) => {
        try {
            setError(null);
            if (showRefreshToast) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            // API에서는 전체 조회 (필터링은 클라이언트에서 useMemo로 처리)
            const result = await getViralShorts(searchKeyword || undefined);

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
        } catch (err) {
            const errorMessage = (err as Error).message || "바이럴 쇼츠를 불러오는데 실패했습니다.";
            console.error("Failed to load viral shorts:", err);
            setError(errorMessage);
            if (showRefreshToast) {
                toast({
                    title: "로딩 실패",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [toast]);

    // 초기 로드
    useEffect(() => {
        loadViralShorts();
    }, [loadViralShorts]);

    // 키워드 검색 핸들러
    const handleSearch = () => {
        const searchKeyword = keyword.trim();
        setSelectedKeyword(searchKeyword);
        loadViralShorts(searchKeyword, true);
    };

    // 추천 키워드 클릭 핸들러
    const handleKeywordClick = (kw: string) => {
        setKeyword(kw);
        setSelectedKeyword(kw);
        loadViralShorts(kw, true);
    };

    // 티어 필터 토글
    const toggleTier = (tier: ViralTier) => {
        setSelectedTiers((prev) => {
            if (prev.includes(tier)) {
                // 최소 1개는 선택되어 있어야 함
                if (prev.length === 1) return prev;
                return prev.filter((t) => t !== tier);
            }
            return [...prev, tier];
        });
    };

    // 필터된 비디오 (useMemo로 메모이제이션)
    const filteredVideos = useMemo(
        () => videos.filter((v) => v.viralTier && selectedTiers.includes(v.viralTier)),
        [videos, selectedTiers]
    );

    // 영상 클릭 핸들러 (Shorts URL)
    const handleVideoClick = (videoId: string) => {
        window.open(`https://www.youtube.com/shorts/${videoId}`, "_blank");
    };

    // 채널 클릭 핸들러
    const handleChannelClick = (e: React.MouseEvent, channelId: string) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/channel/${channelId}`, "_blank");
    };

    // T024 & T025: 바이럴 뱃지 렌더링 (3단계 티어)
    const renderViralBadge = (tier: ViralTier | null) => {
        if (!tier) return null;

        const config = VIRAL_TIERS[tier];

        return (
            <Badge className={`${config.bgColor} text-white text-xs font-bold`}>
                {config.emoji} {config.label}
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

    // T035: 에러 상태 UI
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        데이터를 불러올 수 없습니다
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        {error}
                    </p>
                    <Button onClick={() => loadViralShorts()} variant="default">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        다시 시도
                    </Button>
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
                            3단계 기준: 메가/바이럴/떠오르는
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                        {stats.totalSearched}개 검색 / {filteredVideos.length}개 발견
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadViralShorts(selectedKeyword, true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        새로고침
                    </Button>
                </div>
            </div>

            {/* 키워드 검색 */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="검색 키워드 (예: 브이로그, 먹방)"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={isRefreshing}>
                        검색
                    </Button>
                </div>

                {/* 추천 키워드 */}
                <div className="flex flex-wrap gap-2">
                    {DEFAULT_SEARCH_KEYWORDS.slice(0, 8).map((kw) => (
                        <Badge
                            key={kw}
                            variant={selectedKeyword === kw ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleKeywordClick(kw)}
                        >
                            {kw}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* 티어 필터 */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span>필터:</span>
                </div>
                {TIER_OPTIONS.map(({ tier, config }) => (
                    <Badge
                        key={tier}
                        variant={selectedTiers.includes(tier) ? "default" : "outline"}
                        className={`cursor-pointer ${
                            selectedTiers.includes(tier)
                                ? config.bgColor + " text-white hover:opacity-80"
                                : "hover:bg-primary/10"
                        }`}
                        onClick={() => toggleTier(tier)}
                    >
                        {config.emoji} {config.label}
                        <span className="ml-1 text-xs opacity-75">
                            (구독 {formatNumber(config.maxSubscribers)}↓)
                        </span>
                    </Badge>
                ))}
            </div>

            {/* 영상 리스트 */}
            {filteredVideos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                    <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">바이럴 쇼츠를 찾지 못했습니다</p>
                    <p className="text-sm mt-1">
                        선택한 필터 조건에 맞는 영상이 없습니다.<br />
                        다른 키워드나 필터를 시도해보세요.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVideos.map((video, index) => {
                        const tier = video.viralTier;

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
                                            {renderViralBadge(tier)}
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
                                            tier ? VIRAL_TIERS[tier].color : "text-gray-500"
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
