"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const mockData = [
    { time: "00:00", volume: 400 },
    { time: "04:00", volume: 300 },
    { time: "08:00", volume: 550 },
    { time: "12:00", volume: 800 },
    { time: "16:00", value: 650 },
    { time: "20:00", volume: 950 },
    { time: "24:00", volume: 1200 },
]

interface TrendChartProps {
    data: { time: string; volume: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
    // Use fallback mock data only if data is empty (prevents empty chart on initial load if desired, or let it be empty)
    // Actually better to just use data, or if undefined use mockData for skeleton effect?
    // The parent handles loading state, so likely data is available when this component renders or it's empty array.

    // Let's use the passed data. If it's missing/empty, we can show an empty state or nothing.
    const chartData = (data && data.length > 0) ? data : mockData;

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle>Top Trend Velocity</CardTitle>
                <CardDescription>
                    Real-time growth of the #1 trending topic over the last 24 hours.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="time"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                labelStyle={{ color: '#333' }}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <Area
                                type="monotone"
                                dataKey="volume"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
