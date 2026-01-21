const googleTrends = require('google-trends-api');

async function testRealTime() {
    try {
        console.log("Fetching Realtime Trends for KR...");
        const results = await googleTrends.realTimeTrends({
            geo: 'KR',
            category: 'all'
        });
        console.log("Raw Result Length:", results.length);
        const parsed = JSON.parse(results);
        console.log("Parsed Keys:", Object.keys(parsed));

        if (parsed.storySummaries && parsed.storySummaries.trendingStories) {
            console.log("Found trendingStories:", parsed.storySummaries.trendingStories.length);
            console.log("First Item:", JSON.stringify(parsed.storySummaries.trendingStories[0], null, 2));
        } else {
            console.log("Structure unpredictable:", JSON.stringify(parsed, null, 2).substring(0, 500));
        }

    } catch (e) {
        console.error("Error fetching realtime trends:", e);
    }
}

testRealTime();
