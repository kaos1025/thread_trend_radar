"use server";

import { TrendItem } from "@/types/trend";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { unstable_cache } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Utility to parse traffic strings like "20K+", "1M+" into numbers.
 * Returns 0 on failure.
 */
function parseTraffic(trafficStr: string): number {
    try {
        if (!trafficStr) return 0;
        const normalized = trafficStr.toUpperCase().replace(/[^0-9KM]/g, "").trim();

        let multiplier = 1;
        if (normalized.endsWith("K")) {
            multiplier = 1000;
        } else if (normalized.endsWith("M")) {
            multiplier = 1000000;
        }

        const numPart = parseFloat(normalized.replace(/[KM]/, ""));
        return isNaN(numPart) ? 0 : numPart * multiplier;
    } catch (e) {
        console.error("Traffic parsing error:", e);
        return 0;
    }
}

const schema = {
    description: "Recommended trends and top trend graph data",
    type: SchemaType.OBJECT,
    properties: {
        trends: {
            type: SchemaType.ARRAY,
            description: "List of recommended trend keywords. MUST be from the provided list.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    keyword: { type: SchemaType.STRING, description: "Trend keyword" },
                    velocity_score: { type: SchemaType.NUMBER, description: "Velocity score 0-100 (Calculated from Search Volume)" },
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

/**
 * Fetch Real-time trends from SerpApi (Google Trends)
 * Returns a formatted string list of trends for Gemini context.
 */
async function getSerpApiTrends(): Promise<string> {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
        console.warn("SERPAPI_KEY is missing. Returning empty trend data.");
        return "";
    }

    try {
        const params = new URLSearchParams({
            engine: "google_trends_trending_now",
            geo: "KR",
            frequency: "daily",
            api_key: apiKey
        });

        // Using direct fetch to avoid package bundling issues
        // SerpApi returns JSON by default
        const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

        if (!response.ok) {
            // Try to read error body if possible
            const errorText = await response.text();
            console.error(`SerpApi failed: ${response.status} - ${errorText}`);
            throw new Error(`SerpApi failed with status ${response.status}`);
        }

        const data = await response.json();
        const dailySearches = data?.daily_searches || [];

        if (!dailySearches.length) return "";

        // Process top 15-20 items
        const topTrends = dailySearches.slice(0, 20).map((item: any, index: number) => {
            const query = item.query;
            const trafficStr = item.traffic || "0";
            const trafficVal = parseTraffic(trafficStr);
            return `${index + 1}. ${query} (Search Volume: ${trafficVal})`;
        }).join("\n");

        return topTrends;

    } catch (error) {
        console.error("Failed to fetch/parse SerpApi Trends:", error);
        return ""; // Safe fallback
    }
}

async function fetchRecommendedTrends(categoryKey: string, limit: number = 6): Promise<{ trends: TrendItem[]; topTrendGraphData: any[] }> {
    try {
        const categoryMap: { [key: string]: string } = {
            "all": "All",
            "fashion": "패션",
            "tech": "테크",
            "humor": "유머",
        };
        const category = categoryMap[categoryKey] || categoryKey;

        console.log(`[Gemini] Fetching recommendations for category: ${category} (Key: ${categoryKey}, Limit: ${limit})`);

        // 1. Fetch Real-time Data (RAG from SerpApi)
        const trendsContext = await getSerpApiTrends();
        const hasData = trendsContext.length > 0;

        console.log(`[RAG] SerpApi Trends Data Available: ${hasData}`);
        if (hasData) console.log("Top Trends Preview:\n" + trendsContext.slice(0, 200) + "...");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                // @ts-ignore
                responseSchema: schema,
            },
        });

        // 2. Construct Prompt with RAG (Strict Fact-Based Mode)
        const prompt = `
        Role: Social Media Trend Analyst.
        Current Date: ${new Date().toISOString()}
        Category: ${category}
        Target Quantity: Up to ${limit} items
        
        Context:
        The following is a list of REAL-TIME GOOGLE SEARCH TRENDS in Korea (via SerpApi), including search volume:
        [SERPAPI DATA START]
        ${hasData ? trendsContext : "No trend data available."}
        [SERPAPI DATA END]

        Task: Analyze the provided [SERPAPI DATA] and extract keywords relevant to the category '${category}'.
        
        **STRICT RULES (CRITICAL):**
        1. **SOURCE OF TRUTH**: You must ONLY return trend keywords that are EXPLICITLY listed in the [SERPAPI DATA] above.
        2. **NO HALLUCITATIONS**: Do NOT generate or invent any trends. If a topic is not in the list, exclude it.
        3. **QUANTITY**: Return up to ${limit} items. 
           - If there are fewer than ${limit} relevant items, return ONLY what exists.
           - If NO items match the category, return an empty list [].
           - Do NOT fill with fake data.
        
        Metadata Generation:
        - 'velocity_score': Scale based on 'Search Volume' passed in the text (e.g., 20000 -> 50, 100000 -> 90). logic: (volume / 2000) capped at 100.
        - 'total_posts': Estimate total posts count based on volume.
        - 'sentiment': Analyze potential user sentiment on Threads/Instagram.
        - 'summary': 3-line explanation in Korean.

        Graph Data:
        - Identify the #1 trend (if any) and generate 'topTrendGraphData' (simulated 24h curve). If no trends, return empty.
        
        Output:
        Strictly follow the JSON schema.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        console.log(`[Gemini] Successfully generated ${data.trends?.length || 0} trends.`);

        // Add IDs and dates
        const trends = (data.trends || []).map((t: any, idx: number) => ({
            ...t,
            id: `rec-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
        }));

        return {
            trends,
            topTrendGraphData: data.topTrendGraphData || []
        };

    } catch (error: any) {
        console.error("Recommended Trends Error:", error);
        // Fallback: return empty result so the UI doesn't crash
        return { trends: [], topTrendGraphData: [] };
    }
}

// Caching Strategy: Cache for 1 hour (3600 seconds) to save SerpApi credits
export const getRecommendedTrends = unstable_cache(
    fetchRecommendedTrends,
    ["recommended-trends"],
    { revalidate: 3600, tags: ["trends"] }
);
