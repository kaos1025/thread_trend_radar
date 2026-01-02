"use server";

import { TrendItem } from "@/types/trend";

// Mock Data Generators
const CATEGORIES = ["패션", "테크", "유머", "라이프스타일", "푸드", "여행"];
const DESCRIPTIONS = [
    "최근 소셜 미디어에서 급격히 확산되고 있는 트렌드입니다.",
    "Z세대를 중심으로 새로운 바이럴이 형성되고 있습니다.",
    "관련 해시태그 사용량이 지난주 대비 폭발적으로 증가했습니다.",
    "특정 커뮤니티에서 시작되어 메인스트림으로 넘어오고 있습니다.",
    "인플루언서들의 언급이 늘어나며 주목받고 있습니다."
];

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function analyzeKeyword(keyword: string): Promise<TrendItem> {
    // Simulate AI processing delay (1.5s - 2.5s)
    const delay = getRandomInt(1500, 2500);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Generate random data based on keyword
    const id = Math.random().toString(36).substr(2, 9);
    const velocityScore = getRandomInt(30, 98); // 0-100
    const isTrending = velocityScore > 70;

    // Random Sentiment Distribution (sum ~ 100)
    const positive = getRandomInt(20, 80);
    const neutral = getRandomInt(10, 100 - positive);
    const negative = 100 - positive - neutral;

    // Growth formatted string
    const growth = `+${getRandomInt(10, 500)}%`;

    // Volume formatted string
    const volumeRaw = getRandomInt(1000, 50000);
    const volume = volumeRaw > 10000
        ? `${(volumeRaw / 10000).toFixed(1)}만`
        : `${(volumeRaw / 1000).toFixed(1)}천`;

    return {
        id,
        keyword,
        velocity_score: velocityScore,
        total_posts: volumeRaw,
        sentiment: {
            positive,
            neutral,
            negative
        },
        summary: `${keyword}에 대한 ${getRandomInt(3, 10)}개의 주요 스레드 분석 결과: ${getRandomElement(DESCRIPTIONS)}`,
        related_hashtags: ["#트렌드", `#${keyword}`, "#인기글", "#이슈"],
        created_at: new Date().toISOString(),
        description: `${keyword}: ${getRandomElement(DESCRIPTIONS)}`,
        category: getRandomElement(CATEGORIES),
        growth,
        volume,
        trending: isTrending
    };
}
