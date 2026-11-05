import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refreshTitles, cleanTitle } from './site-urls-06-lib.mjs';

const SITE = 'https://www.alanranger.com';
const rows = () => [
  [`${SITE}/blog-on-photography/photo-editing-software`, '2026 Photo Editing Software: Which One is Right for You', ''],
  [`${SITE}/blog-on-photography/best-cameras-for-beginners`, 'Best Cameras for Beginners: Top Picks &amp; Reviews for 2026', ''],
  [`${SITE}/about-alan-ranger`, 'About Alan Ranger', ''],
  [`${SITE}/not-checked-this-run`, 'Old title', '']
];
const live = new Map([
  [`${SITE}/blog-on-photography/photo-editing-software`, '2027 Photo Editing Software: Which One is Right for You'],
  [`${SITE}/blog-on-photography/best-cameras-for-beginners`, 'Best Cameras for Beginners: Top Picks & Reviews for 2026'],
  [`${SITE}/about-alan-ranger`, 'About Alan Ranger']
]);

test('a changed live title updates 06; an unchanged one and an unchecked row are left alone', () => {
  const r = rows();
  const changes = refreshTitles(r, 0, 1, live);
  assert.deepEqual(changes.map((c) => c.url.replace(SITE, '')), ['/blog-on-photography/photo-editing-software', '/blog-on-photography/best-cameras-for-beginners']);
  assert.equal(r[0][1], '2027 Photo Editing Software: Which One is Right for You');
  assert.equal(r[1][1], 'Best Cameras for Beginners: Top Picks & Reviews for 2026');
  assert.equal(r[2][1], 'About Alan Ranger');
  assert.equal(r[3][1], 'Old title');
});

test('a second run with the same live titles changes nothing', () => {
  const r = rows();
  refreshTitles(r, 0, 1, live);
  assert.deepEqual(refreshTitles(r, 0, 1, live), []);
});

test('titles are stored as plain text', () => {
  assert.equal(cleanTitle('Don&#39;t be wonky  -  Get it &amp; go &mdash; now'), "Don't be wonky - Get it & go \u2014 now");
});
