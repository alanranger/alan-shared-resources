import { test } from 'node:test';
import assert from 'node:assert/strict';
import { removeFromPagesMaster, rowsToRemove } from './pages-master-sync.mjs';

const S = 'https://www.alanranger.com';
const ROWS = [
  { id: 'a', url: `${S}/blog-on-photography/gone-post`, path: '/blog-on-photography/gone-post', tier: 'D_blog' },
  { id: 'b', url: `${S}/blog-on-photography/still-in-06`, path: '/blog-on-photography/still-in-06', tier: 'D_blog' },
  { id: 'c', url: `${S}/guest-blog-posts/a-post`, path: '/guest-blog-posts/a-post', tier: 'D_blog' },
  { id: 'd', url: `${S}/live-but-not-in-06`, path: '/live-but-not-in-06', tier: 'A_landing' },
  { id: 'e', url: `${S}/rate-limited`, path: '/rate-limited', tier: 'A_landing' }
];
// What the 06 prune reports this run: only confirmed drops have drop: true.
const DROPPED = [{ url: `${S}/blog-on-photography/gone-post/`, drop: true, reason: 'http_404' }, { url: `${S}/rate-limited`, drop: false, reason: 'keep_http_429' }];

function fakeSupabase() {
  const calls = [];
  const fetchFn = async (url, init = {}) => {
    calls.push({ method: init.method || 'GET', url, body: init.body });
    const ok = (body, status = 200) => ({ ok: true, status, json: async () => body });
    if (!init.method) return ok(ROWS);
    return ok(null, init.method === 'DELETE' ? 204 : 201);
  };
  return { calls, fetchFn, env: { url: 'https://example.supabase.co', key: 'k' } };
}

test('a URL dropped from 06 for a 404 loses its pages_master row; a URL still in 06 is untouched', () => {
  const ids = rowsToRemove(ROWS, DROPPED).map((x) => x.row.id);
  assert.ok(ids.includes('a'));
  assert.ok(!ids.includes('b'));
});

test('an excluded URL (shared url-exclusions) is removed too', () => {
  const hit = rowsToRemove(ROWS, DROPPED).find((x) => x.row.id === 'c');
  assert.equal(hit.reason, 'excluded');
});

test('a live page merely missing from 06, or one the check could not read (429), is never removed', () => {
  const ids = rowsToRemove(ROWS, DROPPED).map((x) => x.row.id);
  assert.ok(!ids.includes('d'));
  assert.ok(!ids.includes('e'));
});

test('removal deletes exactly those rows and logs them, full rows included, in master_table_mutations', async () => {
  const sb = fakeSupabase();
  const r = await removeFromPagesMaster(DROPPED, { env: sb.env, fetchFn: sb.fetchFn });
  assert.deepEqual(r.removed.map((x) => x.reason), ['http_404', 'excluded']);
  const del = sb.calls.find((c) => c.method === 'DELETE');
  assert.match(del.url, /pages_master\?id=in\.\(a,c\)$/);
  const log = JSON.parse(sb.calls.find((c) => c.method === 'POST').body);
  assert.equal(log.table_name, 'pages_master');
  assert.equal(log.row_count, 2);
  assert.equal(JSON.parse(log.notes)[0].row.id, 'a');
});

test('a dry run and a run without credentials change nothing', async () => {
  const sb = fakeSupabase();
  const dry = await removeFromPagesMaster(DROPPED, { env: sb.env, fetchFn: sb.fetchFn, dryRun: true });
  assert.equal(dry.removed.length, 2);
  assert.equal(sb.calls.filter((c) => c.method !== 'GET').length, 0);
  assert.match((await removeFromPagesMaster(DROPPED, { env: null })).skipped, /no Supabase credentials/);
});
