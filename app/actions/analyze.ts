"use server";

import { TrendItem } from "@/types/trend";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const schema = {
    description: "Trend analysis data",
    type: SchemaType.OBJECT,
    properties: {
        velocity_score: {
            type: SchemaType.NUMBER,
            description: "0-100 score indicating trend velocity",
            nullable: false,
        },
        total_posts: {
            type: SchemaType.NUMBER,
            description: "Estimated total number of posts (1000-50000)",
            nullable: false,
        },
        sentiment: {
            type: SchemaType.STRING,
            description: "Overall sentiment: positive, neutral, or negative",
            enum: ["positive", "neutral", "negative"],
            nullable: false,
        },
        summary: {
            type: SchemaType.STRING,
            description: "3-line summary of the trend in Korean",
            nullable: false,
        },
        related_hashtags: {
            type: SchemaType.ARRAY,
            description: "Top 5 related hashtags",
            items: { type: SchemaType.STRING },
            nullable: false,
        },
    },
    required: ["velocity_score", "total_posts", "sentiment", "summary", "related_hashtags"],
};

export async function analyzeKeyword(keyword: string): Promise<TrendItem> {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                responseSchema: schema as any,
            },
        });

        const prompt = `
    너는 SNS 트렌드 분석 전문가다. 
    사용자가 입력한 키워드 "${keyword}"에 대해 현재 시점의 가상 트렌드 리포트를 작성해라. 
    실제 데이터가 없으므로 너의 지식을 바탕으로 가장 그럴듯한 데이터를 생성해라.
    
    응답은 반드시 다음 규칙을 따라야 한다:
    1. velocity_score: 0~100 사이의 숫자 (랜덤성 부여).
    2. sentiment: "positive", "neutral", "negative" 중 하나.
    3. total_posts: 1000~50000 사이의 숫자.
    4. summary: 해당 트렌드에 대한 3줄 요약 (한국어).
    5. related_hashtags: 연관 해시태그 5개 배열.
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        return {
            id: Math.random().toString(36).substr(2, 9),
            keyword,
            velocity_score: data.velocity_score,
            total_posts: data.total_posts,
            sentiment: data.sentiment,
            summary: data.summary,
            related_hashtags: data.related_hashtags,
            created_at: new Date().toISOString(),
        };
    } catch (error: unknown) {
        console.error("AI Analysis Failed:", error);
        throw new Error(`AI 분석 실패: ${(error as Error).message || "Unknown error"}`);
    }
}
