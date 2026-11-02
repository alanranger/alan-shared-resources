/**
 * Gentle live check for the 10-minute auto-sync (batch 8, 2 Nov 2026): it used to GET ~850 URLs every run and the
 * next requests from this PC got 429 (every pre-flight 429 on record fell 1–2 min after a sync started).
 *   node --test scripts/site-urls-06-lib.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { gentleClassify, pickDue } from './site-urls-06-lib.mjs';

const H = 3600 * 1000;
const NOW = Date.parse('2026-11-02T18:00:00Z');

test('pickDue: never-checked first, then the oldest past the recheck age; at most perRun; duplicates once', () => {
  const state = { a: NOW - 7 * H, b: NOW - 1 * H, c: NOW - 9 * H };
  const due = pickDue(['a', 'b', 'c', 'd', 'd', 'e'], state, { perRun: 3, recheckMs: 6 * H, now: NOW });
  assert.deepEqual(due, ['d', 'e', 'c']);
  assert.deepEqual(pickDue(['b'], state, { perRun: 3, recheckMs: 6 * H, now: NOW }), [], 'checked 1 h ago is not due');
});

test('gentleClassify: one at a time, records check times, stops at the first 429 without retrying', async () => {
  const calls = [];
  const replies = { u1: { drop: false, reason: 'live' }, u2: { drop: false, reason: 'keep_http_429' }, u3: { drop: true, reason: 'http_404' } };
  const classify = async (url) => { calls.push(url); return replies[url]; };
  const state = {};
  const out = await gentleClassify(['u1', 'u2', 'u3'], { state, classify, gapMs: 0, now: () => NOW });
  assert.deepEqual(calls, ['u1', 'u2'], 'u3 is not requested after the 429');
  assert.equal(out.rateLimited, true);
  assert.deepEqual([...out.results.keys()], ['u1']);
  assert.deepEqual(state, { u1: NOW }, 'the rate-limited URL stays due for the next run');
});

test('gentleClassify waits gapMs between requests', async () => {
  const t0 = Date.now();
  await gentleClassify(['x', 'y', 'z'], { state: {}, classify: async () => ({ drop: false, reason: 'live' }), gapMs: 60 });
  assert.ok(Date.now() - t0 >= 110, 'two gaps of 60 ms');
});
