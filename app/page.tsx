import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Flame, Hash, Laugh, LayoutGrid, Monitor, Shirt, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TrendChart } from "@/components/trend-chart";
const TREND_ITEMS = [
  {
    id: 1,
    keyword: "Retro Cameras",
    category: "Tech",
    growth: "+145%",
    volume: "12.5k",
    description: "Gen Z reviving vintage digital cameras from early 2000s.",
    trending: true,
  },
  {
    id: 2,
    keyword: "Baggy Jeans",
    category: "Fashion",
    growth: "+89%",
    volume: "45.2k",
    description: "Oversized denim is dominating street style trends again.",
    trending: true,
  },
  {
    id: 3,
    keyword: "AI Coding Assistant",
    category: "Tech",
    growth: "+320%",
    volume: "8.1k",
    description: "Developers shifting to AI-first workflows for speed.",
    trending: true,
  },
  {
    id: 4,
    keyword: "Dad Jokes",
    category: "Humor",
    growth: "+22%",
    volume: "105k",
    description: "Classic puns making a comeback on short-form video.",
    trending: false,
  },
  {
    id: 5,
    keyword: "Gorpcore",
    category: "Fashion",
    growth: "+67%",
    volume: "18.3k",
    description: "Functional outdoor wear becoming everyday luxury fashion.",
    trending: false,
  },
  {
    id: 6,
    keyword: "Foldable Phones",
    category: "Tech",
    growth: "+55%",
    volume: "25.6k",
    description: "New releases sparking interest in flexible displays.",
    trending: true,
  },
  {
    id: 7,
    keyword: "office Siren",
    category: "Fashion",
    growth: "+210%",
    volume: "30.1k",
    description: "The 90s corporate minimalist aesthetic is trending globally.",
    trending: true,
  },
  {
    id: 8,
    keyword: "Cat Memes",
    category: "Humor",
    growth: "+15%",
    volume: "2.1M",
    description: "The internet's backbone remains strong and steady.",
    trending: false,
  },
  {
    id: 9,
    keyword: "Smart Rings",
    category: "Tech",
    growth: "+180%",
    volume: "9.2k",
    description: "Wearable tech moving from wrists to fingers.",
    trending: true,
  },
  {
    id: 10,
    keyword: "Sustainable Fabrics",
    category: "Fashion",
    growth: "+40%",
    volume: "15.8k",
    description: "Eco-friendly materials gaining traction in fast fashion.",
    trending: false,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white dark:bg-slate-950 px-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl mr-8 text-primary">
          <Activity className="h-6 w-6" />
          <span>ThreadTrends</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hidden md:block transition-colors hover:text-primary text-primary">Overview</a>
          <a href="#" className="hidden md:block transition-colors hover:text-primary">Analytics</a>
          <a href="#" className="hidden md:block transition-colors hover:text-primary">Reports</a>
        </nav>
        <div className="flex flex-1 justify-center">
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full">
            <Button variant="secondary" size="sm" className="rounded-full px-4 h-8 shadow-sm bg-white dark:bg-slate-800 text-primary">All</Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">Fashion</Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">Tech</Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">Humor</Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white dark:bg-slate-950 hidden lg:block">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                  Discover
                </h2>
                <div className="space-y-1">
                  <Button variant="secondary" className="w-full justify-start">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Rising Trends
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Flame className="mr-2 h-4 w-4" />
                    Hot Topics
                  </Button>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                  Categories
                </h2>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <Shirt className="mr-2 h-4 w-4" />
                    Fashion
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Monitor className="mr-2 h-4 w-4" />
                    Tech
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Laugh className="mr-2 h-4 w-4" />
                    Humor
                  </Button>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                  Filters
                </h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-sm font-medium">Time Range</div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="cursor-pointer bg-white">24h</Badge>
                    <Badge variant="outline" className="cursor-pointer">7d</Badge>
                    <Badge variant="outline" className="cursor-pointer">30d</Badge>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Real-time Trends</h1>
              <p className="text-muted-foreground mt-1">
                Discover what's buzzing across threads right now.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button>
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <TrendChart />
            {TREND_ITEMS.map((item) => (
              <Link href={`/trend/${item.id}`} key={item.id} className="group block h-full">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border hover:border-primary/50">
                  {/* ... Card content remains the same ... */}
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{item.id < 10 ? `0${item.id}` : item.id}
                    </span>
                    <Badge
                      variant={item.category === 'Tech' ? 'default' : item.category === 'Fashion' ? 'secondary' : 'outline'}
                      className={item.category === 'Humor' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200' : ''}
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
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8">View Analysis</Button>
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
