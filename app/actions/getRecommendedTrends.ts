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
                    velocity_score: { type: SchemaType.NUMBER, description: "Raw Search Volume (e.g. 20000)" },
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
// @ts-ignore
const googleTrends = require("google-trends-api");

/**
 * Fetch Daily trends from google-trends-api
 * Includes logic to handle "dawn time" (low data volume) by merging yesterday's data.
 */
async function getGoogleTrendsData(): Promise<string> {
    try {
        const today = new Date();
        const yesterday = new Date(Date.now() - 86400000);

        // Helper to fetch and safe-parse
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchTrends = async (date: Date): Promise<any[]> => {
            try {
                const response = await googleTrends.dailyTrends({
                    geo: "KR",
                    trendDate: date,
                });

                // Safe Parsing
                try {
                    const parsed = JSON.parse(response);
                    // Google Trends structure: default.trendingSearchesDays[0].trendingSearches
                    return parsed?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
                } catch (parseError) {
                    console.error(`[GoogleTrends] JSON Parse Error for ${date.toISOString().split("T")[0]}:`, parseError);
                    return [];
                }
            } catch (err) {
                console.error(`[GoogleTrends] API Call Error for ${date.toISOString().split("T")[0]}:`, err);
                return [];
            }
        };

        // 1. Fetch Today's Data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let trends: any[] = await fetchTrends(today);
        console.log(`[GoogleTrends] Today's items found: ${trends.length}`);

        // 2. Dawn Guard: If < 10 items, fetch Yesterday's data
        if (trends.length < 10) {
            console.log(`[GoogleTrends] Low data (Dawn Guard triggered). Fetching yesterday's data...`);
            const yesterdaysTrends = await fetchTrends(yesterday);
            trends = [...trends, ...yesterdaysTrends];
            console.log(`[GoogleTrends] Merged total items: ${trends.length}`);
        }

        // 3. Fallback Mock Data (If API is blocked/fails)
        if (trends.length === 0) {
            console.warn("[GoogleTrends] No data found. Returning empty list.");
            return "";
        }

        // 4. Format for Gemini
        // items have: query, formattedTraffic (e.g. "20K+"), articles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedList = trends.slice(0, 30).map((item: any, index: number) => {
            const query = item.title?.query || item.title || item.query;
            const traffic = item.formattedTraffic || "0";
            return `${index + 1}. ${query} (Search Volume: ${traffic})`;
        }).join("\n");

        return formattedList;

    } catch (error) {
        console.error("Failed to fetch/parse Google Trends:", error);
        return "";
    }
}

async function fetchRecommendedTrends(categoryKey: string, limit: number = 6): Promise<{ trends: TrendItem[]; topTrendGraphData: { time: string; volume: number }[] }> {
    try {
        const categoryMap: { [key: string]: string } = {
            "all": "All",
            "fashion": "패션",
            "tech": "테크",
            "humor": "유머",
        };
        const category = categoryMap[categoryKey] || categoryKey;

        console.log(`[Gemini] Fetching recommendations for category: ${category} (Key: ${categoryKey}, Limit: ${limit})`);

        // 1. Fetch Google Trends Data (Safe + Dawn Guard)
        const trendsContext = await getGoogleTrendsData();
        const hasData = trendsContext.length > 0;

        console.log(`[RAG] Google Trends Data Available: ${hasData}`);
        if (hasData) console.log("Top Trends Preview:\n" + trendsContext.slice(0, 200) + "...");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                responseSchema: schema as any,
            },
        });

        // 2. Construct Prompt with RAG (Strict Fact-Based Mode)
        const prompt = `
        Role: Social Media Trend Analyst.
        Current Date: ${new Date().toISOString()}
        Category: ${category}
        Target Quantity: Up to ${limit} items
        
        Context:
        The following is a list of REAL-TIME GOOGLE SEARCH TRENDS in Korea (via google-trends-api), including search volume:
        [GOOGLE TRENDS DATA START]
        ${hasData ? trendsContext : "No trend data available."}
        [GOOGLE TRENDS DATA END]

        Task: Analyze the provided [GOOGLE TRENDS DATA] and extract keywords relevant to the category '${category}'.
        
        **STRICT RULES (CRITICAL):**
        1. **SOURCE OF TRUTH**: You must ONLY return trend keywords that are EXPLICITLY listed in the [GOOGLE TRENDS DATA] above.
        2. **NO HALLUCITATIONS**: Do NOT generate or invent any trends. If a topic is not in the list, exclude it.
        3. **QUANTITY**: Return up to ${limit} items. 
           - If there are fewer than ${limit} relevant items, return ONLY what exists.
           - If NO items match the category, return an empty list [].
           - Do NOT fill with fake data.
        
        Metadata Generation:
        - 'velocity_score': Use the EXACT 'Search Volume' number parsed from the text (e.g., 20K+ -> 20000). DO NOT normalize to 0-100.
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trends = (data.trends || []).map((t: any, idx: number) => ({
            ...t,
            id: `rec-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
        }));

        return {
            trends,
            topTrendGraphData: data.topTrendGraphData || []
        };

    } catch (error: unknown) {
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
