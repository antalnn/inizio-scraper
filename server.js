// imports
const http = require('node:http');
const { SaveSearchHTML } = require('./lib/scraper');

const SERVER_PORT = process.env.PORT || 3000;

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