"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Flame, LayoutGrid, Monitor, Shirt, Laugh, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function AppSidebar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { toast } = useToast()

    const currentCategory = searchParams.get("category") || "all"

    const handleNavigation = (category: string) => {
        if (category === "all") {
            router.push("/")
        } else {
            router.push(`/?category=${category}`)
        }
    }

    const handleComingSoon = () => {
        toast({
            title: "준비 중입니다",
            description: "데이터 수집 중입니다. 7일/30일 필터는 곧 오픈됩니다!",
        })
    }

    return (
        <aside className="w-64 border-r bg-white dark:bg-slate-950 hidden lg:block">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                            탐색 (Discover)
                        </h2>
                        <div className="space-y-1">
                            <Button
                                variant={currentCategory === "all" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => handleNavigation("all")}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                대시보드
                            </Button>
                            <Button
                                variant={pathname === "/rising" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => router.push("/rising")}
                            >
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
                            <Button
                                variant={currentCategory === "fashion" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => handleNavigation("fashion")}
                            >
                                <Shirt className="mr-2 h-4 w-4" />
                                패션 (Fashion)
                            </Button>
                            <Button
                                variant={currentCategory === "tech" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => handleNavigation("tech")}
                            >
                                <Monitor className="mr-2 h-4 w-4" />
                                테크 (Tech)
                            </Button>
                            <Button
                                variant={currentCategory === "humor" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => handleNavigation("humor")}
                            >
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
                                <Badge variant="outline" className="cursor-pointer" onClick={handleComingSoon}>7일</Badge>
                                <Badge variant="outline" className="cursor-pointer" onClick={handleComingSoon}>30일</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    )
}
