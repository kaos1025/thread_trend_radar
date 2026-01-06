const https = require('https');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function testSignal() {
    try {
        console.log("Fetching signal.bz...");
        const html = await fetchUrl('https://signal.bz/');

        // Signal.bz usually puts keywords in <span class="rank-text"> or similar.
        // Let's print a snippet or try to find keywords.
        // Looking for the structure.

        const pattern = /<span class="rank-text">([^<]+)<\/span>/g;
        let match;
        let count = 0;
        console.log("--- Extracting Keywords ---");
        while ((match = pattern.exec(html)) !== null) {
            console.log(`${++count}. ${match[1]}`);
            if (count >= 10) break;
        }

        if (count === 0) {
            console.log("No simple regex matches. HTML preview:");
            console.log(html.substring(0, 1000));
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testSignal();
