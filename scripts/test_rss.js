const Parser = require('rss-parser');
const parser = new Parser();

async function testRSS() {
    try {
        console.log("Fetching Realtime RSS for KR (p23)...");
        const feed = await parser.parseURL('https://trends.google.com/trends/hottrends/atom/feed?pn=p23');
        console.log("Feed Title:", feed.title);
        console.log("Item Count:", feed.items.length);

        if (feed.items.length > 0) {
            console.log("First Item:", JSON.stringify(feed.items[0], null, 2));
        }
    } catch (e) {
        console.error("Error fetching RSS:", e);
    }
}

testRSS();
