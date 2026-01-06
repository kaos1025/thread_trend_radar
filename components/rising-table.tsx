"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { TrendItem } from "@/types/trend";
import { Flame } from "lucide-react";

interface RisingTableProps {
    trends: TrendItem[];
}

export function RisingTable({ trends }: RisingTableProps) {
    const router = useRouter();

    const handleRowClick = (item: TrendItem) => {
        const url = `/trend/${encodeURIComponent(item.keyword)}?score=${item.velocity_score}&sentiment=${item.sentiment}&posts=${item.total_posts}`;
        router.push(url);
    };

    const getSentimentBadge = (sentiment: string) => {
        switch (sentiment) {
            case "positive": return <Badge className="bg-green-500 hover:bg-green-600">긍정적</Badge>;
            case "negative": return <Badge variant="destructive">부정적</Badge>;
            default: return <Badge variant="secondary">중립적</Badge>;
        }
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <span className="text-2xl">🥇</span>;
        if (index === 1) return <span className="text-2xl">🥈</span>;
        if (index === 2) return <span className="text-2xl">🥉</span>;
        return <span className="font-bold text-slate-500 ml-2">#{index + 1}</span>;
    };

    return (
        <div className="rounded-md border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-950">
                            <TableHead className="w-[80px] text-center">순위</TableHead>
                            <TableHead className="w-[200px]">키워드</TableHead>
                            <TableHead>요약</TableHead>
                            <TableHead className="w-[100px]">감정</TableHead>
                            <TableHead className="w-[150px]">속도</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trends.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    현재 집계된 급상승 트렌드가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            trends.map((item, index) => (
                                <TableRow
                                    key={item.id}
                                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => handleRowClick(item)}
                                >
                                    <TableCell className="text-center font-medium">
                                        {getRankIcon(index)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-base flex items-center gap-2">
                                            {item.keyword}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                                        {item.summary}
                                    </TableCell>
                                    <TableCell>
                                        {getSentimentBadge(item.sentiment)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span className="flex items-center"><Flame className="w-3 h-3 mr-1 text-orange-500" /> {item.velocity_score}</span>
                                            </div>
                                            <Progress value={item.velocity_score} className="h-2" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
