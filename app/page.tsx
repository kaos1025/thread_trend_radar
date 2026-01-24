import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Radar, Github, Sparkles } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { TrendDashboard } from "@/components/trend-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

function SidebarFallback() {
  return (
    <aside className="w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl hidden lg:block">
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </aside>
  );
}

function DashboardFallback() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <Skeleton className="h-12 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-6 w-96 mx-auto rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header - 프리미엄 글래스모피즘 */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-white/5 bg-background/60 backdrop-blur-2xl px-4 md:px-6 supports-[backdrop-filter]:bg-background/40">
        <MobileNav />

        {/* 로고 */}
        <div className="flex items-center gap-3 font-bold text-xl mr-8 ml-2 lg:ml-0 group">
          <div className="relative p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-xl shadow-orange-500/30 transition-all duration-300 group-hover:shadow-orange-500/50 group-hover:scale-105">
            <Radar className="h-5 w-5 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
          </div>
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent font-black tracking-tight">
            TrendRadar
          </span>
        </div>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <a href="#" className="relative px-4 py-2 rounded-lg transition-all duration-300 text-foreground after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-orange-500 after:rounded-full">
            대시보드
          </a>
          <a href="#" className="px-4 py-2 rounded-lg transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-white/5">
            분석
          </a>
          <a href="#" className="px-4 py-2 rounded-lg transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-white/5">
            리포트
          </a>
        </nav>

        <div className="flex-1" />

        {/* 우측 액션 버튼 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <ThemeToggle />
          <Button size="sm" className="hidden sm:flex bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 rounded-xl transition-all duration-300 hover:-translate-y-0.5">
            <Sparkles className="h-4 w-4 mr-2" />
            Pro
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Suspense fallback={<SidebarFallback />}>
          <AppSidebar />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Suspense fallback={<DashboardFallback />}>
            <TrendDashboard />
          </Suspense>
        </main>
      </div>

      {/* Footer - 프리미엄 스타일 */}
      <footer className="border-t border-white/5 bg-background/40 backdrop-blur-2xl py-5 px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg shadow-orange-500/20">
              <Radar className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium text-foreground/80">Trend Radar</span>
            <span className="text-white/10">|</span>
            <span className="text-muted-foreground/70">Powered by Google Trends, YouTube Data API & Gemini AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-orange-500 transition-colors duration-300">이용약관</a>
            <a href="#" className="hover:text-orange-500 transition-colors duration-300">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
