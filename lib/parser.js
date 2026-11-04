const cheerio = require('cheerio');

function ParseHTML(html)
{
    const $ = cheerio.load(html);
    const results = [];

    $('div.tF2Cxc').each((i, el) => {
        const container = $(el);

        const title = container.find('h3').first().text().replace(/\s+/g, ' ').trim();
        let link = container.find('a').first().attr('href') || '';
        const snippet = container.find('div.VwiC3b').first().text().replace(/\s+/g, ' ').trim();

        if (!title || !link) return;

        if(link.startsWith('/'))
        {
            link = 'https://www.google.com' + link;
        }

        results.push({
            position: results.length + 1,
            title: title,
            link: link,
            snippet: snippet,
        });
    });
    
    return results;
}

module.exports = { ParseHTML };