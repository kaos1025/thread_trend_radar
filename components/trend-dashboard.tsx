"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Hash, Loader2, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TrendItem } from "@/types/trend";
import { analyzeKeyword } from "@/app/actions/analyze";
import { TrendChart } from "@/components/trend-chart";

// Initial Mock Data (Updated to match new schema)
const INITIAL_TRENDS: TrendItem[] = [
    {
        id: "1",
        keyword: "레트로 디카",
        velocity_score: 85,
        total_posts: 12000,
        sentiment: "positive",
        summary: "Z세대가 2000년대 초반 빈티지 디카 감성을 다시 찾고 있어요.",
        related_hashtags: ["#빈티지", "#디카"],
        created_at: new Date().toISOString()
    },
    {
        id: "2",
        keyword: "와이드 청바지",
        velocity_score: 72,
        total_posts: 45000,
        sentiment: "neutral",
        summary: "오버사이즈 데님이 다시 스트릿 패션을 지배하고 있습니다.",
        related_hashtags: ["#오버핏", "#데님"],
        created_at: new Date().toISOString()
    }
];

export function TrendDashboard() {
    const [trends, setTrends] = useState<TrendItem[]>(INITIAL_TRENDS);
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!keyword.trim()) return;

        setIsLoading(true);
        try {
            const newTrend = await analyzeKeyword(keyword);
            // Add new trend to the top of the list
            setTrends((prev) => [newTrend, ...prev]);
            setKeyword(""); // Clear input
        } catch (error) {
            console.error("Failed to analyze:", error);
            alert("AI 분석에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive": return "bg-green-100 text-green-700 border-green-200";
            case "negative": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getSentimentLabel = (sentiment: string) => {
        switch (sentiment) {
            case "positive": return "긍정적";
            case "negative": return "부정적";
            default: return "중립적";
        }
    };

    const formatNumber = (num: number) => {
        return num > 10000 ? `${(num / 10000).toFixed(1)}만` : num.toLocaleString();
    }

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div className="flex gap-2 max-w-lg mx-auto md:mx-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="관심 키워드 검색 (예: 흑백요리사)"
                        className="pl-9"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading || !keyword.trim()}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            분석 중...
                        </>
                    ) : (
                        "분석 시작"
                    )}
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <TrendChart />
                {trends.map((item, index) => (
                    <Link href={`/trend/${item.id}`} key={item.id} className="group block h-full">
                        <Card className={`h-full hover:shadow-lg transition-all duration-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border hover:border-primary/50 ${index === 0 && isLoading === false ? 'animate-in fade-in slide-in-from-top-4 duration-700' : ''}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    New
                                </span>
                                <Badge
                                    variant="outline"
                                    className=""
                                >
                                    General
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="text-xl font-bold truncate">{item.keyword}</div>
                                    {item.velocity_score > 70 && <Flame className="h-4 w-4 text-orange-500 animate-pulse" />}
                                </div>
                                <CardDescription className="line-clamp-2 h-10">
                                    {item.summary}
                                </CardDescription>

                                <div className="mt-4 flex items-center justify-between">
                                    {/* Sentiment Badge */}
                                    <Badge variant="outline" className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                                        {getSentimentLabel(item.sentiment)}
                                    </Badge>

                                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                                        <Hash className="h-3 w-3" />
                                        {formatNumber(item.total_posts)}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                                <Button variant="ghost" size="sm" className="w-full text-xs h-8">분석 보기</Button>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
