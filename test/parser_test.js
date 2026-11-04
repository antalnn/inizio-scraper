const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { ParseHTML } = require('../lib/parser');

const html = fs.readFileSync(path.join(__dirname, 'serp.html'), 'utf8');

test('returns one object per organic result', () => {
    const results = ParseHTML(html);

    assert.strictEqual(results.length, 10);
});

test('positions start at 1 and have no gaps', () => {
    const results = ParseHTML(html);

    for(let i = 0; i < results.length; i++)
    {
        assert.strictEqual(results[i].position, i + 1);
    }
});

test('every result has a title and a link', () => {
    const results = ParseHTML(html);

    for(const result of results)
    {
        assert.ok(result.title.length > 0);
        assert.ok(result.link.startsWith('https://'));
    }
});

test('leaves absolute links alone', () => {
    const html = '<div class="tF2Cxc"><h3>Play Store</h3><a href="https://play.google.com/store">x</a><div class="VwiC3b">snippet</div></div>';

    const results = ParseHTML(html);

    assert.strictEqual(results[0].link, 'https://play.google.com/store');
});

