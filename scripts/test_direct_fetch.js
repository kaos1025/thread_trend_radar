async function testDirect() {
    try {
        const url = "https://trends.google.com/trends/api/realtimetrends?hl=ko&tz=-540&cat=all&fi=0&fs=0&geo=KR&ri=300&rs=20&sort=0";
        console.log("Fetching:", url);
        const response = await fetch(url);
        const text = await response.text();
        console.log("Status:", response.status);

        // Google often prefixes JSON with )]}'
        const cleanText = text.replace(/^\)]\}'/, '').trim();
        try {
            const json = JSON.parse(cleanText);

            if (json.storySummaries && json.storySummaries.trendingStories) {
                console.log("Success! Found stories:", json.storySummaries.trendingStories.length);
                console.log("First Story:", JSON.stringify(json.storySummaries.trendingStories[0], null, 2));

                // Print titles to see if they match screenshot style
                json.storySummaries.trendingStories.slice(0, 5).forEach(s => {
                    console.log(`- ${s.title} (${s.entityNames.join(', ')})`);
                });
            } else {
                console.log("Structure unexpected:", cleanText.substring(0, 500));
            }
        } catch (e) {
            console.log("JSON Parse Error:", e);
            console.log("Raw Text preview:", text.substring(0, 500));
        }

    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testDirect();
