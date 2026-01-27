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

// ViralShorts 컴포넌트 Props
interface ViralShortsProps {
    /** 외부에서 전달받은 검색 키워드 (트렌드 탭에서 클릭 시) */
    initialKeyword?: string;
}

export function ViralShorts({ initialKeyword }: ViralShortsProps) {
    const [videos, setVideos] = useState<ViralVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalSearched: 0, viralCount: 0, analyzedAt: "" });

    // 키워드 검색 상태 (hydration 이슈 방지: useEffect에서 초기화)
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

    // 초기 로드 및 외부 키워드 변경 처리 (B10: 키워드 → 쇼츠 연동)
    // loadViralShorts를 의존성에서 제거하여 무한 루프 방지
    useEffect(() => {
        // 외부에서 전달받은 키워드로 상태 업데이트
        if (initialKeyword) {
            setKeyword(initialKeyword);
            setSelectedKeyword(initialKeyword);
        }
        // API 호출
        loadViralShorts(initialKeyword || undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialKeyword]);

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
            {/* 헤더 - 프리미엄 글래스모피즘 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 dark:from-orange-500/5 dark:via-red-500/5 dark:to-pink-500/5 border border-white/10 backdrop-blur-xl p-6">
                {/* 배경 그라데이션 오브 */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl shadow-orange-500/30 ring-4 ring-white/10">
                            <Flame className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                                바이럴 쇼츠
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                구독자 대비 조회수 폭발 영상 탐지
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge className="text-xs bg-white/10 backdrop-blur-md border-white/20 text-foreground px-3 py-1.5">
                            <Eye className="h-3 w-3 mr-1.5" />
                            {stats.totalSearched}개 검색 / {filteredVideos.length}개 발견
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadViralShorts(selectedKeyword, true)}
                            disabled={isRefreshing}
                            className="border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-300"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                            새로고침
                        </Button>
                    </div>
                </div>
            </div>

            {/* 키워드 검색 - 프리미엄 스타일 */}
            <div className="space-y-4 p-5 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-sm">
                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                        <Input
                            placeholder="검색 키워드 (예: 브이로그, 먹방, ASMR)"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                // 한국어 IME 조합 중일 때는 Enter 무시 (중복 검색 방지)
                                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                                    handleSearch();
                                }
                            }}
                            className="pl-11 h-12 rounded-xl bg-background/50 border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        disabled={isRefreshing}
                        className="h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        검색
                    </Button>
                </div>

                {/* 추천 키워드 - 칩 스타일 */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium px-2">추천</span>
                    {DEFAULT_SEARCH_KEYWORDS.slice(0, 8).map((kw) => (
                        <Badge
                            key={kw}
                            variant={selectedKeyword === kw ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-300 px-3 py-1 ${
                                selectedKeyword === kw
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-transparent shadow-md shadow-orange-500/25"
                                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/30"
                            }`}
                            onClick={() => handleKeywordClick(kw)}
                        >
                            {kw}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* 티어 필터 - 프리미엄 스타일 */}
            <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl bg-card/20 border border-white/5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">등급 필터</span>
                </div>
                <div className="flex gap-2">
                    {TIER_OPTIONS.map(({ tier, config }) => (
                        <Badge
                            key={tier}
                            variant={selectedTiers.includes(tier) ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-300 px-3 py-1.5 text-sm ${
                                selectedTiers.includes(tier)
                                    ? config.bgColor + " text-white hover:opacity-90 shadow-lg ring-2 ring-white/20"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                            onClick={() => toggleTier(tier)}
                        >
                            {config.emoji} {config.label}
                            <span className="ml-1.5 text-xs opacity-70">
                                ({formatNumber(config.maxSubscribers)}↓)
                            </span>
                        </Badge>
                    ))}
                </div>
            </div>

            {/* 영상 리스트 */}
            {filteredVideos.length === 0 ? (
                <div className="text-center py-20 rounded-3xl bg-gradient-to-b from-card/50 to-transparent border border-white/5">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative p-5 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full mb-6">
                            <Flame className="h-14 w-14 text-orange-500/60" />
                        </div>
                    </div>
                    <p className="font-bold text-xl">바이럴 쇼츠를 찾지 못했습니다</p>
                    <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
                        선택한 필터 조건에 맞는 영상이 없습니다.<br />
                        다른 키워드나 필터를 시도해보세요.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map((video, index) => {
                        const tier = video.viralTier;

                        return (
                            <Card
                                key={video.id}
                                className="group cursor-pointer overflow-hidden rounded-3xl border-white/5 bg-card/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/20 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 60}ms`, animationDuration: '400ms' }}
                                onClick={() => handleVideoClick(video.id)}
                            >
                                {/* 썸네일 */}
                                <div className="relative aspect-[9/16] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                                    {video.thumbnailUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Youtube className="h-16 w-16 text-muted-foreground/20" />
                                        </div>
                                    )}

                                    {/* 순위 배지 - 상위 3개 강조 */}
                                    {index < 3 && (
                                        <div className={`absolute top-3 left-3 text-white text-sm font-black px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md ${
                                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-amber-500/40" :
                                            index === 1 ? "bg-gradient-to-r from-slate-300 to-slate-400 shadow-slate-400/40" :
                                            "bg-gradient-to-r from-amber-600 to-orange-600 shadow-orange-500/40"
                                        }`}>
                                            #{index + 1}
                                        </div>
                                    )}

                                    {/* Shorts 뱃지 */}
                                    <div className="absolute top-3 right-3">
                                        <Badge className="text-xs bg-red-600/90 backdrop-blur-md text-white border-0 shadow-lg px-2.5 py-1">
                                            <Youtube className="h-3 w-3 mr-1" />
                                            Shorts
                                        </Badge>
                                    </div>

                                    {/* 바이럴 비율 오버레이 - 프리미엄 글래스모피즘 */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 pt-16">
                                        <div className="flex items-center justify-between">
                                            {renderViralBadge(tier)}
                                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
                                                <TrendingUp className="h-4 w-4 text-green-400" />
                                                <span className="text-white font-bold text-base">
                                                    {video.viralRatio}x
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 호버 오버레이 */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-transparent transition-all duration-500 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                                            <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl rounded-full p-4 shadow-2xl shadow-black/30 ring-2 ring-white/20">
                                                <ExternalLink className="h-6 w-6 text-orange-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 영상 정보 */}
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-orange-500 transition-colors duration-300 leading-snug">
                                        {video.title}
                                    </h3>

                                    {/* 채널 정보 */}
                                    <button
                                        className="text-xs text-muted-foreground hover:text-orange-500 truncate block text-left w-full transition-colors duration-300"
                                        onClick={(e) => handleChannelClick(e, video.channelId)}
                                    >
                                        @{video.channelTitle}
                                    </button>

                                    {/* 통계 - 2x2 그리드 */}
                                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Users className="h-3.5 w-3.5 text-blue-400" />
                                            <span>{formatNumber(video.subscriberCount)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Eye className="h-3.5 w-3.5 text-purple-400" />
                                            <span>{formatNumber(video.viewCount)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>{video.hoursAgo}시간 전</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${
                                            tier ? VIRAL_TIERS[tier].color : "text-gray-500"
                                        }`}>
                                            <Flame className="h-3.5 w-3.5" />
                                            <span>{video.viralRatio}x</span>
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
