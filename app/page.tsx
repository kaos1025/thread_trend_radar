import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { TrendDashboard } from "@/components/trend-dashboard";

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
          {/* Deprecated Header Filters - Removed or kept as visual only? User didn't specify, but Sidebar handles nav now. 
               Let's keep the layout but maybe remove the buttons if they are redundant with sidebar. 
               Actually the user request focused on Sidebar. I will keep header mainly as is or empty div for layout balance.*/}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full opacity-50 pointer-events-none">
            {/* Visual placeholder or we can wire them up too. For now let's leave them as they seem to be 'quick filters' that might be confusing if not synced. 
                 Let's comment them out or leave as static. I'll leave them static to preserve layout integrity for now.*/}
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
        {/* Sidebar (Desktop) - Client Component */}
        <AppSidebar />

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
