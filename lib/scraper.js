const fs = require('node:fs/promises');
const path = require('node:path');
const puppeteer = require('puppeteer');

// example search query: https://www.google.com/search?q=hello+world
async function SaveSearchHTML(searchParams) {
    const file = `google (${searchParams}).html`;
    const dir = 'SAVED_HTML';

    // headless + overriden UA necessary
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
    });

    let data;
    try {
        const page = await browser.newPage();

        await page.setUserAgent({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        });

        await page.goto(
            'https://www.google.com/search?q=' + encodeURIComponent(searchParams) + '&num=10&hl=en',
            { waitUntil: 'domcontentloaded', timeout: 60000 }
        );

        data = await page.content();
    } finally {
        await browser.close();
    }

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, file), data);

    const bytes = Buffer.byteLength(data, 'utf-8');
    return { bytes };
}

module.exports = { SaveSearchHTML };