"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Loader2, Search, TrendingUp, Youtube, Zap } from "lucide-react";
import Link from "next/link";
import { TrendItem } from "@/types/trend";
import { analyzeKeyword } from "@/app/actions/analyze";
import { getRecommendedTrends } from "@/app/actions/getRecommendedTrends";
import { TrendChart } from "@/components/trend-chart";
import { YouTubeTrends } from "@/components/youtube-trends";
import { ViralShorts } from "@/components/viral-shorts";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function TrendDashboard() {
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [keyword, setKeyword] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [graphData, setGraphData] = useState<{ time: string; volume: number }[]>([]);
    const { toast } = useToast();

    // URL Sync
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get("category") || "all";
    const source = searchParams.get("source") || "trends"; // trends | youtube | viral
    const viralKeyword = searchParams.get("keyword") || ""; // B10: 바이럴 검색 키워드

    // Initial Data Fetching (AI Recommendations)
    useEffect(() => {
        let isMounted = true;

        async function fetchTrends() {
            try {
                setIsLoading(true);
                // Call Server Action with English Key (all, fashion, tech, humor)
                const data = await getRecommendedTrends(category);

                if (isMounted) {
                    setTrends(data.trends);
                    setGraphData(data.topTrendGraphData);
                }
            } catch (error) {
                console.error("Failed to fetch initial trends:", error);
                if (isMounted) {
                    toast({
                        title: "데이터 로딩 실패",
                        description: "최신 트렌드를 불러오는데 실패했습니다.",
                        variant: "destructive"
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchTrends();

        return () => { isMounted = false; };
    }, [category, toast]);

    const handleTabChange = (value: string) => {
        if (value === "all") {
            router.push("/");
        } else {
            router.push(`/?category=${value}`);
        }
    };

    // 소스 탭 변경 핸들러 (트렌드 vs YouTube vs 바이럴)
    const handleSourceChange = (value: string) => {
        if (value === "trends") {
            router.push("/");
        } else {
            router.push(`/?source=${value}`);
        }
    };

    // B10: 트렌드 키워드 클릭 → 바이럴 쇼츠 검색
    const handleKeywordToViral = (keywordText: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/?source=viral&keyword=${encodeURIComponent(keywordText)}`);
        toast({
            title: "바이럴 쇼츠 검색",
            description: `'${keywordText}' 키워드로 바이럴 쇼츠를 검색합니다.`,
        });
    };

    const handleAnalyze = async () => {
        if (!keyword.trim()) return;

        setIsAnalyzing(true);
        try {
            const result = await analyzeKeyword(keyword);
            setTrends((prev) => [result, ...prev]);
            setKeyword("");
            toast({
                title: "분석 완료",
                description: `'${result.keyword}' 키워드 분석이 완료되었습니다.`,
            });
        } catch (error: unknown) {
            console.error(error);
            toast({
                title: "분석 실패",
                description: (error as Error).message || "AI 분석 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    };

    const getSentimentBadge = (sentiment: string) => {
        switch (sentiment) {
            case "positive": return <Badge className="bg-green-500 hover:bg-green-600">긍정적</Badge>;
            case "negative": return <Badge variant="destructive">부정적</Badge>;
            default: return <Badge variant="secondary">중립적</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section - 모던 그라데이션 */}
            <div className="text-center space-y-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 text-sm text-orange-600 dark:text-orange-400 mb-2">
                    <Flame className="h-4 w-4" />
                    실시간 트렌드 분석
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                    Trend Radar
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    AI가 실시간 검색 데이터를 분석하여<br className="hidden sm:block" />
                    <span className="font-semibold text-foreground">바이럴 콘텐츠</span>와 <span className="font-semibold text-foreground">급상승 트렌드</span>를 발견합니다
                </p>

                {/* Search Bar - 글래스모피즘 */}
                <div className="flex w-full max-w-lg mx-auto items-center gap-3 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="관심 토픽 검색 (예: 안성재, 아이폰, 먹방)"
                            className="pl-12 h-14 text-base bg-background/80 backdrop-blur-sm border-border/50 focus:border-orange-500/50 focus:ring-orange-500/20 rounded-2xl shadow-lg shadow-black/5 transition-all"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className={`h-14 px-8 rounded-2xl font-bold transition-all duration-300 ${
                            isAnalyzing
                                ? 'bg-orange-400 cursor-wait'
                                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5'
                        }`}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                분석 중
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-5 w-5" />
                                분석
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Source Tabs - 프리미엄 스타일 */}
            <Tabs value={source} className="w-full" onValueChange={handleSourceChange}>
                <div className="flex justify-center mb-10">
                    <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-muted/40 dark:bg-white/5 p-1 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20">
                        <TabsTrigger
                            value="trends"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 text-muted-foreground hover:text-foreground"
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span>트렌드</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="youtube"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/25 text-muted-foreground hover:text-foreground"
                        >
                            <Youtube className="h-4 w-4" />
                            <span>YouTube</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="viral"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/25 text-muted-foreground hover:text-foreground"
                        >
                            <Zap className="h-4 w-4" />
                            <span>바이럴</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* 트렌드 콘텐츠 */}
                <TabsContent value="trends" className="mt-0">
                    {/* Category Tabs - 서브 탭 스타일 */}
                    <Tabs value={category} className="w-full" onValueChange={handleTabChange}>
                        <div className="flex justify-center mb-8">
                            <TabsList className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-muted/30 dark:bg-white/5 p-1 backdrop-blur-sm border border-border/30">
                                <TabsTrigger value="all" className="rounded-lg px-4 py-1.5 text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground hover:text-foreground">전체</TabsTrigger>
                                <TabsTrigger value="fashion" className="rounded-lg px-4 py-1.5 text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground hover:text-foreground">패션</TabsTrigger>
                                <TabsTrigger value="tech" className="rounded-lg px-4 py-1.5 text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground hover:text-foreground">테크</TabsTrigger>
                                <TabsTrigger value="humor" className="rounded-lg px-4 py-1.5 text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground hover:text-foreground">유머</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* Top Trend Chart (Dynamic) */}
                            <div className="md:col-span-2 xl:col-span-2">
                                <TrendChart data={graphData} />
                            </div>

                            {/* Trend Cards */}
                            {isLoading ? (
                                // Skeleton UI - 프리미엄 스타일
                                Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                                        <CardHeader className="space-y-3 pb-3">
                                            <div className="flex justify-between items-center">
                                                <Skeleton className="h-5 w-10 rounded-full" />
                                                <Skeleton className="h-5 w-16 rounded-lg" />
                                            </div>
                                            <Skeleton className="h-7 w-4/5 rounded-lg" />
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <Skeleton className="h-4 w-full rounded" />
                                            <Skeleton className="h-4 w-3/4 rounded" />
                                        </CardContent>
                                        <CardFooter className="pt-3">
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-16 rounded-full" />
                                                <Skeleton className="h-6 w-14 rounded-full" />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))
                            ) : (
                                trends.map((item, index) => (
                                    <Link
                                        href={`/trend/${encodeURIComponent(item.keyword)}?score=${item.velocity_score}&sentiment=${item.sentiment}&posts=${item.total_posts}`}
                                        key={item.id}
                                        className="group block h-full"
                                    >
                                        <Card
                                            className="h-full overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/30 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                                            style={{ animationDelay: `${index * 80}ms`, animationDuration: '500ms' }}
                                        >
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/30' :
                                                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                                                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <Badge variant="outline" className="font-mono text-xs border-orange-500/30 text-orange-500 bg-orange-500/10">
                                                    <Flame className="h-3 w-3 mr-1" />
                                                    {item.velocity_score}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-xl font-bold tracking-tight group-hover:text-orange-500 transition-colors duration-300">
                                                        {item.keyword}
                                                    </h3>
                                                    {getSentimentBadge(item.sentiment)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                                        <span>{item.total_posts.toLocaleString()}회</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {item.summary}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex flex-wrap items-center justify-between gap-1.5 pt-3 border-t border-border/30">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.related_hashtags.slice(0, 3).map((tag, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs font-normal text-muted-foreground bg-muted/50 hover:bg-muted transition-colors">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {/* B10: 바이럴 쇼츠 검색 버튼 */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                                                    onClick={(e) => handleKeywordToViral(item.keyword, e)}
                                                    title="이 키워드로 바이럴 쇼츠 검색"
                                                >
                                                    <Zap className="h-3 w-3 mr-1" />
                                                    쇼츠
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </Tabs>
                </TabsContent>

                {/* YouTube 콘텐츠 */}
                <TabsContent value="youtube" className="mt-0">
                    <YouTubeTrends />
                </TabsContent>

                {/* 바이럴 쇼츠 콘텐츠 */}
                <TabsContent value="viral" className="mt-0">
                    {/* key prop으로 키워드 변경 시 컴포넌트 재마운트 */}
                    <ViralShorts initialKeyword={viralKeyword} key={viralKeyword || "default"} />
                </TabsContent>
            </Tabs>

            <div className="text-center pt-8 pb-4 text-xs text-muted-foreground">
                Powered by Google Trends, YouTube Data API & Gemini AI
            </div>
        </div>
    );
}
