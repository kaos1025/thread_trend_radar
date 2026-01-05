"use server";

import { TrendItem } from "@/types/trend";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { unstable_cache } from "next/cache";
import Parser from "rss-parser";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// CORRECT Google Trends RSS URL provided by user
const GOOGLE_TRENDS_RSS_URL = "https://trends.google.com/trending/rss?geo=KR";

// Configure Parser to handle custom fields from Google Trends RSS
const parser = new Parser({
    customFields: {
        item: [
            ['ht:approx_traffic', 'traffic'], // Parse <ht:approx_traffic> as 'traffic'
        ]
    }
});

const schema = {
    description: "Recommended trends and top trend graph data",
    type: SchemaType.OBJECT,
    properties: {
        trends: {
            type: SchemaType.ARRAY,
            description: "List of 6 recommended trend keywords",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    keyword: { type: SchemaType.STRING, description: "Trend keyword" },
                    velocity_score: { type: SchemaType.NUMBER, description: "Velocity score 0-100 (Based on Search Volume)" },
                    total_posts: { type: SchemaType.NUMBER, description: "Estimated total posts" },
                    sentiment: { type: SchemaType.STRING, enum: ["positive", "neutral", "negative"], description: "Sentiment" },
                    summary: { type: SchemaType.STRING, description: "Short summary in Korean" },
                    related_hashtags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "5 hashtags" },
                },
                required: ["keyword", "velocity_score", "total_posts", "sentiment", "summary", "related_hashtags"]
            },
            nullable: false,
        },
        topTrendGraphData: {
            type: SchemaType.ARRAY,
            description: "24h volume data for the #1 trend",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    time: { type: SchemaType.STRING, description: "Time label e.g. 13:00" },
                    volume: { type: SchemaType.NUMBER, description: "Volume count" },
                },
                required: ["time", "volume"]
            },
            nullable: false,
        }
    },
    required: ["trends", "topTrendGraphData"],
};

async function getGoogleTrendsData(): Promise<string> {
    try {
        const feed = await parser.parseURL(GOOGLE_TRENDS_RSS_URL);

        // Map items to a string format: "1. [Keyword] (Traffic: 20,000+)"
        const trends = feed.items.slice(0, 20).map((item: any, index: number) => {
            const title = item.title;
            const traffic = item.traffic || "N/A";
            return `${index + 1}. ${title} (Search Volume: ${traffic})`;
        }).join("\n");

        return trends;
    } catch (error) {
        console.error("Failed to fetch/parse Google Trends RSS:", error);
        return ""; // Fallback
    }
}

async function fetchRecommendedTrends(category: string): Promise<{ trends: TrendItem[]; topTrendGraphData: any[] }> {
    try {
        console.log(`[Gemini] Fetching recommendations for category: ${category}`);

        // 1. Fetch Real-time Data (RAG from Google Trends)
        const rssData = await getGoogleTrendsData();
        const hasRssData = rssData.length > 0;

        console.log(`[RAG] Google Trends Data Available: ${hasRssData}`);
        if (hasRssData) console.log("Top Trends Preview:\n" + rssData.slice(0, 200) + "...");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema as any,
            },
        });

        // 2. Construct Prompt with RAG (Filter & Fill Strategy)
        const prompt = `
        Role: Social Media Trend Analyst.
        Current Date: ${new Date().toISOString()}
        Category: ${category}
        
        Context:
        The following is a list of REAL-TIME GOOGLE SEARCH TRENDS in Korea, including search volume:
        [RSS DATA START]
        ${hasRssData ? rssData : "No RSS data available."}
        [RSS DATA END]

        Task: Return a list of exact 6 trend keywords for the category '${category}'.
        
        Execution Logic (Filter & Fill):
        1. **Step 1 (Filter)**: First, extract keywords from [RSS DATA] that are relevant to '${category}'.
           - Example: If category is 'Tech', look for 'Samsung', 'iPhone', 'Crypto', etc. in the RSS.
           - Prioritize high 'Search Volume' items.
        
        2. **Step 2 (Fill)**: If valid RSS matches are fewer than 6, generate the remaining keywords based on your **internal knowledge of CURRENT trending topics (2025-2026)** in Korea for this category.
           - ENSURE the final list has exactly 6 items.
           - DO NOT return an empty list.
        
        3. **Metadata Generation**:
           - 'velocity_score': 
              - If from RSS: Scale based on 'Search Volume' (e.g., 50k+ -> 90-100).
              - If generated: Estimate typically high engagement (70-90).
           - 'total_posts': Estimate total posts count.
           - 'sentiment': Analyze typical user sentiment on Threads/Instagram.
           - 'summary': 3-line explanation in Korean.

        4. **Graph Data**: Identify the #1 trend (preferably from RSS) and generate 'topTrendGraphData' (24h volume curve).
        
        Output:
        Strictly follow the JSON schema.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        console.log(`[Gemini] Successfully generated ${data.trends.length} trends.`);

        // Add IDs and dates
        const trends = data.trends.map((t: any, idx: number) => ({
            ...t,
            id: `rec-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
        }));

        return {
            trends,
            topTrendGraphData: data.topTrendGraphData
        };

    } catch (error: any) {
        console.error("Recommended Trends Error:", error);
        throw new Error(`추천 트렌드 로딩 실패: ${error.message}`);
    }
}

// Caching Strategy: Cache for 1 hour (3600 seconds)
export const getRecommendedTrends = unstable_cache(
    fetchRecommendedTrends,
    ["recommended-trends"],
    { revalidate: 3600, tags: ["trends"] }
);
