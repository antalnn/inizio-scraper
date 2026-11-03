// imports
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const puppeteer = require('puppeteer');

// globals  
const SERVER_PORT = 3000;

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
            { waitUntil: 'domcontentloaded', timeout: 30000 }
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

// server
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'https://localhost');

    // get health status
    if(url.pathname === '/api/health')
    {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok : true }));
        return;
    }

    if(url.pathname === '/api/search')
    {
        const searchParams = url.searchParams.get('q');
        if(!searchParams)
        {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error : 'missing q parameter' }));
            return;
        }

        try
        {
            const result = await SaveSearchHTML(searchParams);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ bytes : result.bytes }));
        }
        catch(err)
        {
            console.error(err);

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error : 'search failed' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error : 'not found' }));
});

server.listen(SERVER_PORT, () => console.log('server started'));