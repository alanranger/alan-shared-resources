import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isExcludedUrl, loadExclusionPrefixes, withoutExcluded } from './url-exclusions.mjs';
import { missingCandidates } from './add-06-new-urls.mjs';

const SITE = 'https://www.alanranger.com';

test('the shared file excludes the guest blog collection', () => {
  assert.deepEqual(loadExclusionPrefixes(), ['/guest-blog-posts']);
});

test('every form of a guest blog URL is excluded; the main blog is not', () => {
  for (const u of [
    `${SITE}/guest-blog-posts`,
    `${SITE}/guest-blog-posts/`,
    `${SITE}/guest-blog-posts/any-post`,
    `${SITE}/guest-blog-posts?format=json`,
    'https://alanranger.com/Guest-Blog-Posts/Any-Post',
    '/guest-blog-posts/any-post',
    'www.alanranger.com/guest-blog-posts'
  ]) assert.equal(isExcludedUrl(u), true, u);
  for (const u of [
    `${SITE}/blog-on-photography/some-post`,
    `${SITE}/guest-blog-postscript`,
    `${SITE}/`
  ]) assert.equal(isExcludedUrl(u), false, u);
});

test('withoutExcluded keeps order and works on rows', () => {
  const rows = [{ url: `${SITE}/a` }, { url: `${SITE}/guest-blog-posts/x` }, { url: `${SITE}/b` }];
  assert.deepEqual(withoutExcluded(rows, undefined, (r) => r.url).map((r) => r.url), [`${SITE}/a`, `${SITE}/b`]);
});

test('the auto-sync add step never offers a guest blog URL for 06', () => {
  const sitemap = [
    `${SITE}/guest-blog-posts`,
    `${SITE}/guest-blog-posts/photo-essay-planning`,
    `${SITE}/blog-on-photography/new-post`
  ];
  assert.deepEqual(missingCandidates(sitemap, []), [`${SITE}/blog-on-photography/new-post`]);
});
