// imports
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const { SaveSearchHTML } = require('./lib/scraper');
const { ParseHTML } = require('./lib/parser');
const { ToCsv } = require('./lib/csv');

const SERVER_PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'https://localhost');

    // index site
    if(url.pathname == '/')
    {
        try
        {
            const html = await fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf-8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        }
        catch (err)
        {
            console.error(err);

            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('index.html not found');
        }
        return;
    }

    // ping server
    if(url.pathname === '/api/health')
    {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok : true }));
        return;
    }

    // search path
    if(url.pathname === '/api/search')
    {
        // missing search params
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
            const results = ParseHTML(result.html);
            const csv = ToCsv(results);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({results, csv }, null, 2));
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