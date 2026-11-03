// imports
const http = require('node:http');

// globals
const server_port = 3000;

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'https://localhost');

    if(url.pathname == '/api/health')
    {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok : true }));
    }
    else
    {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error : 'not found' }));
    }
});

server.listen(server_port, () => console.log('server started'));