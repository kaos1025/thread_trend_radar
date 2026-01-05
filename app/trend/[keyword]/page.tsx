import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Target, User, Zap } from "lucide-react";
import Link from "next/link";
import { getTrendDetail } from "@/app/actions/getDetail";
import { DetailCharts } from "@/components/detail-charts";

interface PageProps {
    params: Promise<{ keyword: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function TrendDetailPage({ params, searchParams }: PageProps) {
    const { keyword } = await params;
    const resolvedSearchParams = await searchParams;

    const decodedKeyword = decodeURIComponent(keyword);

    // Quick Data from URL Query Params (No Fetching)
    const velocity_score = Number(resolvedSearchParams.score || 0);
    const sentiment = resolvedSearchParams.sentiment || "neutral";
    const total_posts = Number(resolvedSearchParams.posts || 0);

    // Fetch Detailed Insights (Gemini)
    const detailData = await getTrendDetail(decodedKeyword);

    const getSentimentColor = (s: string) => {
        switch (s) {
            case "positive": return "bg-green-100 text-green-700 border-green-200";
            case "negative": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation */}
                <Link href="/">
                    <Button variant="ghost" className="pl-0 gap-2 hover:pl-2 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        대시보드로 돌아가기
                    </Button>
                </Link>

                {/* Header (Instant Render) */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className={`text-sm px-3 py-1 ${getSentimentColor(sentiment)}`}>
                            {sentiment.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                            <Zap className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                            Score: {velocity_score}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            언급량: {total_posts.toLocaleString()}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                        {decodedKeyword}
                    </h1>
                </div>

                {/* Section 1: Insights (Gemini) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center gap-2 pb-2">
                            <Target className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">마케팅 활용 전략</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {detailData.marketing_strategies.map((strategy, idx) => (
                                    <li key={idx} className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                        <span className="font-bold text-primary">{idx + 1}.</span>
                                        {strategy}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center gap-2 pb-2">
                            <User className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg">주요 타겟 오디언스</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center h-[calc(100%-4rem)]">
                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 text-center w-full leading-relaxed">
                                "{detailData.target_audience}"
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 2: Graph (Client Component) */}
                <div className="w-full">
                    <DetailCharts />
                </div>

                {/* Section 3: VoC (Gemini) */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle className="h-6 w-6" />
                        실시간 베스트 반응
                    </h2>
                    <div className="grid gap-4">
                        {detailData.voc_comments.map((comment, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
                                <div className="absolute top-6 left-[-8px] w-4 h-4 bg-white dark:bg-slate-900 border-l border-b border-slate-200 dark:border-slate-800 transform rotate-45 hidden md:block"></div>
                                <p className="text-slate-700 dark:text-slate-300 italic">
                                    "{comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
