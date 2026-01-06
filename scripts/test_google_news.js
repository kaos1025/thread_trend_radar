const Parser = require('rss-parser');
const parser = new Parser();

async function testGoogleNews() {
    try {
        console.log("Fetching Google News RSS for KR...");
        const feed = await parser.parseURL('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko');

        console.log("Feed Title:", feed.title);
        console.log("Total Items:", feed.items.length);

        if (feed.items.length > 0) {
            console.log("First Item:", feed.items[0].title);
            console.log("First Item Date:", feed.items[0].pubDate);

            // Print top 10 titles for validation
            console.log("\n--- Top 10 Headlines ---");
            feed.items.slice(0, 10).forEach((item, i) => {
                console.log(`${i + 1}. ${item.title}`);
            });
        }
    } catch (e) {
        console.error("Error fetching Google News:", e);
    }
}

testGoogleNews();
