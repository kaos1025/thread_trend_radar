"use client"

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Flame, LayoutGrid, Menu, Shirt, Monitor, Laugh, TrendingUp } from "lucide-react";
import { useState } from "react";

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-left flex items-center gap-2 font-bold text-primary">
                        <TrendingUp className="h-5 w-5" />
                        <span>ThreadTrends</span>
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="space-y-6">
                        <div className="px-1">
                            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                                탐색 (Discover)
                            </h2>
                            <div className="space-y-1">
                                <Button variant="secondary" className="w-full justify-start" onClick={() => setOpen(false)}>
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    대시보드
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    급상승 트렌드
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                                    <Flame className="mr-2 h-4 w-4" />
                                    핫 토픽
                                </Button>
                            </div>
                        </div>
                        <div className="px-1">
                            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                                카테고리 (Categories)
                            </h2>
                            <div className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                                    <Shirt className="mr-2 h-4 w-4" />
                                    패션 (Fashion)
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                                    <Monitor className="mr-2 h-4 w-4" />
                                    테크 (Tech)
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                                    <Laugh className="mr-2 h-4 w-4" />
                                    유머 (Humor)
                                </Button>
                            </div>
                        </div>
                        <div className="px-1">
                            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
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
            </SheetContent>
        </Sheet>
    );
}
