"use client";

import { useEffect, useState } from "react";
import { getRecommendedTrends } from "@/app/actions/getRecommendedTrends";
import { RisingTable } from "@/components/rising-table";
import { TrendItem } from "@/types/trend";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function RisingPage() {
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch top 20 trends
            const data = await getRecommendedTrends("all", 20);
            setTrends(data.trends);
        } catch (error) {
            console.error("Failed to fetch rising trends:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">오늘의 급상승</h1>
                    <p className="text-muted-foreground mt-1">
                        대한민국에서 지금 가장 뜨거운 이슈 Top 20 (Daily Trends)
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchData}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    새로고침
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="rounded-md border p-4">
                        <div className="space-y-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <RisingTable trends={trends} />
            )}
        </div>
    );
}
