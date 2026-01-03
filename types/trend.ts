export interface TrendItem {
    id: string;
    keyword: string;
    velocity_score: number;
    total_posts: number;
    sentiment: "positive" | "neutral" | "negative";
    summary: string;
    related_hashtags: string[];
    created_at: string;
}

export interface RawPost {
    id: string;
    content: string;
    created_at: string;
    likes: number;
    replies: number;
    author: string;
}
