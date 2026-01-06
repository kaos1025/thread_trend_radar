import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { getRecommendedTrends } from "@/app/actions/getRecommendedTrends";
import { RisingTable } from "@/components/rising-table";

export default async function RisingPage() {
    const { trends } = await getRecommendedTrends("all", 20);

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white dark:bg-slate-950 px-4 md:px-6 shadow-sm">
                <MobileNav />
                <div className="flex items-center gap-2 font-bold text-xl mr-8 text-primary ml-2 lg:ml-0">
                    <Activity className="h-6 w-6" />
                    <span>SocialTrend</span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <a href="/" className="transition-colors hover:text-primary">개요</a>
                    <a href="/rising" className="transition-colors hover:text-primary text-primary">급상승</a>
                    <a href="#" className="transition-colors hover:text-primary">분석</a>
                    <a href="#" className="transition-colors hover:text-primary">리포트</a>
                </nav>
                <div className="flex flex-1 justify-center">
                    {/* Filter buttons can be omitted here or kept static */}
                </div>
                <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Desktop) - Client Component */}
                <AppSidebar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-0">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold tracking-tight">급상승 트렌드 (Top 20)</h1>
                            <p className="text-muted-foreground mt-1">
                                현재 가장 빠르게 성장하는 트렌드 키워드를 한눈에 확인하세요.
                            </p>
                        </div>
                        <div className="hidden md:flex gap-2">
                            <Button>
                                리포트 다운로드
                            </Button>
                        </div>
                    </div>

                    <RisingTable trends={trends} />
                </main>
            </div>
        </div>
    );
}
