"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Loader2, Search, TrendingUp, Youtube } from "lucide-react";
import Link from "next/link";
import { TrendItem } from "@/types/trend";
import { analyzeKeyword } from "@/app/actions/analyze";
import { getRecommendedTrends } from "@/app/actions/getRecommendedTrends";
import { TrendChart } from "@/components/trend-chart";
import { YouTubeTrends } from "@/components/youtube-trends";
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
    const source = searchParams.get("source") || "trends"; // trends | youtube

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

    // 소스 탭 변경 핸들러 (트렌드 vs YouTube)
    const handleSourceChange = (value: string) => {
        if (value === "trends") {
            router.push("/");
        } else {
            router.push(`/?source=${value}`);
        }
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
            {/* Header Section */}
            <div className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Social Trend Radar
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    AI가 실시간 검색 데이터를 기반으로 분석한 소셜 미디어 급상승 트렌드
                </p>

                {/* Search Bar */}
                <div className="flex w-full max-w-md mx-auto items-center space-x-2 pt-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="관심 토픽 검색 (예: 안성재, 아이폰)"
                            className="pl-10 h-12 text-base shadow-sm border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className={`h-12 px-6 rounded-xl font-bold transition-all duration-300 ${isAnalyzing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'}`}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                분석 중...
                            </>
                        ) : (
                            "분석 시작"
                        )}
                    </Button>
                </div>
            </div>

            {/* Source Tabs (Trends / YouTube) */}
            <Tabs value={source} className="w-full" onValueChange={handleSourceChange}>
                <div className="flex justify-center mb-6">
                    <TabsList className="grid w-full max-w-[300px] grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full h-10">
                        <TabsTrigger value="trends" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            트렌드
                        </TabsTrigger>
                        <TabsTrigger value="youtube" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <Youtube className="h-4 w-4 text-red-500" />
                            YouTube
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* 트렌드 콘텐츠 */}
                <TabsContent value="trends" className="mt-0">
                    {/* Category Tabs */}
                    <Tabs value={category} className="w-full" onValueChange={handleTabChange}>
                        <div className="flex justify-center mb-8">
                            <TabsList className="grid w-full max-w-[400px] grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-full h-12">
                                <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">전체</TabsTrigger>
                                <TabsTrigger value="fashion" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">패션</TabsTrigger>
                                <TabsTrigger value="tech" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">테크</TabsTrigger>
                                <TabsTrigger value="humor" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">유머</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* Top Trend Chart (Dynamic) */}
                            <div className="md:col-span-2 xl:col-span-2">
                                <TrendChart data={graphData} />
                            </div>

                            {/* Trend Cards */}
                            {isLoading ? (
                                // Skeleton UI for 6 cards
                                Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <CardHeader className="space-y-2">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-4 w-12 rounded-full" />
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                            <Skeleton className="h-6 w-3/4" />
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </CardContent>
                                        <CardFooter>
                                            <Skeleton className="h-6 w-full rounded-md" />
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
                                        <Card className={`h-full hover:shadow-lg transition-all duration-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border hover:border-primary/50 animate-in fade-in zoom-in-50 duration-500`} style={{ animationDelay: `${index * 100}ms` }}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    No.{index + 1}
                                                </span>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    <Flame className="h-3 w-3 mr-1 text-orange-500" />
                                                    {item.velocity_score}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                                        {item.keyword}
                                                    </h3>
                                                    {getSentimentBadge(item.sentiment)}
                                                </div>
                                                <div className="text-xs text-muted-foreground mb-4 font-medium flex items-center">
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    언급량 약 {item.total_posts.toLocaleString()}회
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                                    {item.summary}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex flex-wrap gap-2 pt-4">
                                                {item.related_hashtags.slice(0, 2).map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs font-normal text-muted-foreground bg-slate-100 dark:bg-slate-800">
                                                        {tag}
                                                    </Badge>
                                                ))}
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
            </Tabs>

            <div className="text-center pt-8 pb-4 text-xs text-muted-foreground">
                Powered by Google Trends, YouTube Data API & Gemini AI
            </div>
        </div>
    );
}
