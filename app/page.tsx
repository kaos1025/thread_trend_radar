import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Flame, Hash, Laugh, LayoutGrid, Monitor, Shirt, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TrendChart } from "@/components/trend-chart";
import { MobileNav } from "@/components/mobile-nav";

// Mock Data (Korean)
const TREND_ITEMS = [
  {
    id: 1,
    keyword: "레트로 디카",
    category: "테크",
    growth: "+145%",
    volume: "1.2만",
    description: "Z세대가 2000년대 초반 빈티지 디카 감성을 다시 찾고 있어요.",
    trending: true,
  },
  {
    id: 2,
    keyword: "와이드 청바지",
    category: "패션",
    growth: "+89%",
    volume: "4.5만",
    description: "오버사이즈 데님이 다시 스트릿 패션을 지배하고 있습니다.",
    trending: true,
  },
  {
    id: 3,
    keyword: "AI 코딩 어시스턴트",
    category: "테크",
    growth: "+320%",
    volume: "8천",
    description: "개발자들이 생산성을 위해 AI 도구로 대거 이동 중입니다.",
    trending: true,
  },
  {
    id: 4,
    keyword: "아재개그",
    category: "유머",
    growth: "+22%",
    volume: "10.5만",
    description: "클래식한 언어유희가 숏폼 비디오에서 다시 유행하고 있어요.",
    trending: false,
  },
  {
    id: 5,
    keyword: "고프코어",
    category: "패션",
    growth: "+67%",
    volume: "1.8만",
    description: "기능성 아웃도어 의류가 일상 럭셔리 패션으로 자리 잡았습니다.",
    trending: false,
  },
  {
    id: 6,
    keyword: "폴더블 폰",
    category: "테크",
    growth: "+55%",
    volume: "2.5만",
    description: "새로운 폼팩터 출시로 유연한 디스플레이에 대한 관심 급증.",
    trending: true,
  },
  {
    id: 7,
    keyword: "오피스 사이렌",
    category: "패션",
    growth: "+210%",
    volume: "3만",
    description: "90년대 기업 미니멀리즘 미학이 전 세계적으로 트렌드입니다.",
    trending: true,
  },
  {
    id: 8,
    keyword: "고양이 밈",
    category: "유머",
    growth: "+15%",
    volume: "210만",
    description: "인터넷의 근본 콘텐츠는 여전히 강력하고 건재합니다.",
    trending: false,
  },
  {
    id: 9,
    keyword: "스마트 링",
    category: "테크",
    growth: "+180%",
    volume: "9천",
    description: "웨어러블 테크가 손목에서 손가락으로 이동하고 있습니다.",
    trending: true,
  },
  {
    id: 10,
    keyword: "지속가능한 원단",
    category: "패션",
    growth: "+40%",
    volume: "1.5만",
    description: "패스트 패션에서도 친환경 소재가 주목받기 시작했습니다.",
    trending: false,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white dark:bg-slate-950 px-4 md:px-6 shadow-sm">
        <MobileNav />
        <div className="flex items-center gap-2 font-bold text-xl mr-8 text-primary ml-2 lg:ml-0">
          <Activity className="h-6 w-6" />
          <span>ThreadTrends</span>
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
                지금 스레드(Threads)에서 가장 핫한 키워드를 발견하세요.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button>
                리포트 내보내기
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <TrendChart />
            {TREND_ITEMS.map((item) => (
              <Link href={`/trend/${item.id}`} key={item.id} className="group block h-full">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border hover:border-primary/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{item.id < 10 ? `0${item.id}` : item.id}
                    </span>
                    <Badge
                      variant={item.category === '테크' ? 'default' : item.category === '패션' ? 'secondary' : 'outline'}
                      className={item.category === '유머' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200' : ''}
                    >
                      {item.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="text-xl font-bold">{item.keyword}</div>
                      {item.trending && <Flame className="h-4 w-4 text-orange-500 animate-pulse" />}
                    </div>
                    <CardDescription className="line-clamp-2 h-10">
                      {item.description}
                    </CardDescription>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                        <TrendingUp className="h-3 w-3" />
                        {item.growth}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Hash className="h-3 w-3" />
                        {item.volume}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8">분석 보기</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
