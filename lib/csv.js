function Escape(value)
{
    const text = String(value || '');
    return '"' + text.replace(/"/g, '""') + '"';
}

function ToCsv(results)
{
    const header = 'position,title,link,snippet';

    const rows = results.map((r) =>
        [r.position, r.title, r.link, r.snippet].map(Escape).join(',')
    );

    return [header, ...rows].join('\r\n');
}

module.exports = { ToCsv };