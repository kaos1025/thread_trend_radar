import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Flame, Laugh, LayoutGrid, Monitor, Shirt, TrendingUp } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { TrendDashboard } from "@/components/trend-dashboard";
import { Badge } from "@/components/ui/badge";

export default function Home() {
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
          <a href="#" className="transition-colors hover:text-primary text-primary">개요</a>
          <a href="#" className="transition-colors hover:text-primary">분석</a>
          <a href="#" className="transition-colors hover:text-primary">리포트</a>
        </nav>
        <div className="flex flex-1 justify-center">
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full">
            <Button variant="secondary" size="sm" className="rounded-full px-4 h-8 shadow-sm bg-white dark:bg-slate-800 text-primary">전체</Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">패션</Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">테크</Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">유머</Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="w-64 border-r bg-white dark:bg-slate-950 hidden lg:block">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                  탐색 (Discover)
                </h2>
                <div className="space-y-1">
                  <Button variant="secondary" className="w-full justify-start">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    대시보드
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    급상승 트렌드
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Flame className="mr-2 h-4 w-4" />
                    핫 토픽
                  </Button>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                  카테고리 (Categories)
                </h2>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <Shirt className="mr-2 h-4 w-4" />
                    패션 (Fashion)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Monitor className="mr-2 h-4 w-4" />
                    테크 (Tech)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Laugh className="mr-2 h-4 w-4" />
                    유머 (Humor)
                  </Button>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                  필터 (Filters)
                </h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-sm font-medium">기간 설정</div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="cursor-pointer bg-white">24시간</Badge>
                    <Badge variant="outline" className="cursor-pointer">7일</Badge>
                    <Badge variant="outline" className="cursor-pointer">30일</Badge>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-0">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">실시간 트렌드</h1>
              <p className="text-muted-foreground mt-1">
                지금 소셜 미디어에서 가장 핫한 키워드를 발견하세요.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button>
                리포트 내보내기
              </Button>
            </div>
          </div>

          <TrendDashboard />
        </main>
      </div>
    </div>
  );
}
