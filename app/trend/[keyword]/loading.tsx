import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">

                {/* Header Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-32 rounded-full" /> {/* Badge */}
                        <Skeleton className="h-10 w-24 rounded-full" /> {/* Badge */}
                    </div>
                    <Skeleton className="h-12 w-3/4 rounded-lg" /> {/* Title */}
                </div>

                {/* Marketing & Target Section Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="h-full">
                        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </CardContent>
                    </Card>

                    <Card className="h-full">
                        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-24 w-full rounded-md" />
                        </CardContent>
                    </Card>
                </div>

                {/* Graph Section Skeleton */}
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full rounded-md" />
                    </CardContent>
                </Card>

                {/* VoC Section Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>

            </div>
        </div>
    );
}
