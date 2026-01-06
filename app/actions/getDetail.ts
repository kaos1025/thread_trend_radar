"use server";

import { TrendDetail } from "@/types/trend-detail";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const schema = {
    description: "Trend detail analysis data",
    type: SchemaType.OBJECT,
    properties: {
        marketing_strategies: {
            type: SchemaType.ARRAY,
            description: "3 specific actionable marketing strategies",
            items: { type: SchemaType.STRING },
            nullable: false,
        },
        target_audience: {
            type: SchemaType.STRING,
            description: "Description of the main target audience age and characteristics",
            nullable: false,
        },
        voc_comments: {
            type: SchemaType.ARRAY,
            description: "3 realistic user reactions/comments",
            items: { type: SchemaType.STRING },
            nullable: false,
        },
    },
    required: ["marketing_strategies", "target_audience", "voc_comments"],
};

export async function getTrendDetail(keyword: string): Promise<TrendDetail> {
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
        키워드: "${keyword}"
        
        이 트렌드 키워드에 대해 다음 정보를 분석하여 JSON으로 반환해라:
        1. marketing_strategies: 이 트렌드를 활용한 구체적인 마케팅 실행 전략 3가지.
        2. target_audience: 이 트렌드에 반응하는 주 타겟 연령대와 특징 (한 문장).
        3. voc_comments: 사람들이 이 트렌드에 대해 남길 법한 리얼한 반응/댓글 3가지.
        
        한국어로 작성할 것.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        return {
            keyword,
            marketing_strategies: data.marketing_strategies,
            target_audience: data.target_audience,
            voc_comments: data.voc_comments,
            generated_at: new Date().toISOString(),
        };
    } catch (error: unknown) {
        console.error("Detail Analysis Failed:", error);
        throw new Error(`상세 분석 실패: ${(error as Error).message || "Unknown error"}`);
    }
}
