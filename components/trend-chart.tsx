"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    { time: "00:00", value: 400 },
    { time: "04:00", value: 300 },
    { time: "08:00", value: 550 },
    { time: "12:00", value: 800 },
    { time: "16:00", value: 650 },
    { time: "20:00", value: 950 },
    { time: "24:00", value: 1200 },
]

export function TrendChart() {
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
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                dataKey="value"
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
