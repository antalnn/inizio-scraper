// imports
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

// globals  
const SERVER_PORT = 3000;

// example search query: https://www.google.com/search?q=hello+world
async function SaveSearchHTML(searchParams) {
    const file = `google (${searchParams}).html`;
    const dir = 'SAVED_HTML';

    const response = await fetch('https://www.google.com/search?q=' + encodeURIComponent(searchParams) + '&num=10&hl=en');
    const data = await response.text();

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

        const result = await SaveSearchHTML(searchParams);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ bytes : result.bytes }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error : 'not found' }));
});

server.listen(SERVER_PORT, () => console.log('server started'));