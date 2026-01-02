import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentChart } from "@/components/sentiment-chart";
import { ArrowLeft, MessageCircle, Share2, ThumbsUp, TrendingUp } from "lucide-react";
import Link from "next/link";

// Mock Data Utility
function getTrendDetail(id: string) {
    // In a real app, fetch data based on ID
    return {
        id,
        keyword: id === "1" ? "Retro Cameras" : "Baggy Jeans", // Simple mock mapping
        category: id === "1" ? "Tech" : "Fashion",
        growth: "+145%",
        volume: "12.5k",
        description: "Gen Z reviving vintage digital cameras from early 2000s.",
        sentimentData: [
            { name: 'Positive', value: 65 },
            { name: 'Neutral', value: 25 },
            { name: 'Negative', value: 10 },
        ],
        relatedPosts: [
            { id: 1, user: "@tech_enthusiast", time: "2h ago", content: "Just found my dad's old Canon IXY. The photos have such a vibe! 📸 #vintage", likes: 1240, comments: 45 },
            { id: 2, user: "@trends_daily", time: "5h ago", content: "Digital cameras are outselling the latest smartphones for casual photography.", likes: 890, comments: 120 },
            { id: 3, user: "@genz_life", time: "1d ago", content: "Why do we love low quality pics so much? It feels more real.", likes: 2300, comments: 340 },
        ]
    };
}

export default async function TrendPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = getTrendDetail(id);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Navigation */}
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-white dark:bg-slate-900">
                                #{data.id < "10" ? `0${data.id}` : data.id}
                            </Badge>
                            <Badge className="text-sm px-3 py-1">
                                {data.category}
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{data.keyword}</h1>
                        <p className="text-xl text-muted-foreground">{data.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Track This Trend
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Stats & Sentiment */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium text-muted-foreground">Growth Velocity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-green-600 mb-1">{data.growth}</div>
                                <div className="text-sm text-muted-foreground">increase in the last 24h</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium text-muted-foreground">Total Volume</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">{data.volume}</div>
                                <div className="text-sm text-muted-foreground">mentions across platforms</div>
                            </CardContent>
                        </Card>

                        <SentimentChart data={data.sentimentData} />
                    </div>

                    {/* Right Column: Content Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold">Top Discussions</h2>
                        <div className="space-y-4">
                            {data.relatedPosts.map((post) => (
                                <Card key={post.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                                                <div>
                                                    <div className="font-semibold text-sm">{post.user}</div>
                                                    <div className="text-xs text-muted-foreground">{post.time}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-800 dark:text-slate-200 mb-4 leading-relaxed">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center gap-6 text-muted-foreground text-sm">
                                            <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                                                <ThumbsUp className="h-4 w-4" />
                                                <span>{post.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>{post.comments}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
