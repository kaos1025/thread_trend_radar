"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ['#22c55e', '#94a3b8', '#ef4444']; // Green, Slate, Red

interface SentimentChartProps {
    data: { name: string; value: number }[];
}

export function SentimentChart({ data }: SentimentChartProps) {
    return (
        <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>
                    Public reaction breakdown (Positive / Neutral / Negative)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: '#333' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
