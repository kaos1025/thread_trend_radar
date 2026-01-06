const googleTrends = require('google-trends-api');

async function debugTrends() {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);

    console.log(`[Debug] Checking Today: ${today.toISOString()}`);
    try {
        const res = await googleTrends.dailyTrends({ geo: 'KR', trendDate: today });
        console.log("[Debug] Today Result Length:", res.length);
        const parsed = JSON.parse(res);
        const count = parsed?.default?.trendingSearchesDays?.[0]?.trendingSearches?.length || 0;
        console.log(`[Debug] Today Items Found: ${count}`);
    } catch (e) {
        console.error("[Debug] Today Failed:", e.message);
        if (e.response && e.response.status === 429) {
            console.error("[Debug] RATE LIMITED (429)");
        }
    }

    console.log(`[Debug] Checking Yesterday: ${yesterday.toISOString()}`);
    try {
        const res = await googleTrends.dailyTrends({ geo: 'KR', trendDate: yesterday });
        console.log("[Debug] Yesterday Result Length:", res.length);
        const parsed = JSON.parse(res);
        const count = parsed?.default?.trendingSearchesDays?.[0]?.trendingSearches?.length || 0;
        console.log(`[Debug] Yesterday Items Found: ${count}`);
    } catch (e) {
        console.error("[Debug] Yesterday Failed:", e.message);
    }
}

debugTrends();
