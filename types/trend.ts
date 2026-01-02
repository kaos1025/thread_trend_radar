export interface TrendItem {
    id: string;
    keyword: string;
    velocity_score: number;
    total_posts: number;
    sentiment: {
        positive: number;
        neutral: number;
        negative: number;
    };
    summary: string;
    related_hashtags: string[];
    created_at: string;
    description: string;
    category: string;
    growth: string;
    volume: string;
    trending: boolean;
}

export interface RawPost {
    id: string;
    content: string;
    created_at: string;
    likes: number;
    replies: number;
    author: string;
}
