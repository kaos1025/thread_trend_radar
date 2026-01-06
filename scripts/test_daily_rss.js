const Parser = require('rss-parser');
const parser = new Parser();

async function testDailyRSS() {
    try {
        console.log("Fetching Daily RSS for KR...");
        // Daily Trends RSS for Korea
        const feed = await parser.parseURL('https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR');

        console.log("Feed Title:", feed.title);
        console.log("Total Items:", feed.items.length);

        if (feed.items.length > 0) {
            console.log("First Item Title:", feed.items[0].title);
            console.log("First Item Traffic:", feed.items[0].contentSnippet); // RSS often puts traffic here or in custom fields
            console.log("Full First Item:", JSON.stringify(feed.items[0], null, 2));
        }
    } catch (e) {
        console.error("Error fetching Daily RSS:", e);
    }
}

testDailyRSS();
