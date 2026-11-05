/**
 * The one shared rule for site pages no tool may track, generate, ingest or audit (config/url-exclusions.json).
 * PC tools import this file; Vercel apps read the same JSON from raw GitHub (EXCLUSIONS_RAW_URL).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EXCLUSIONS_FILE = join(dirname(dirname(fileURLToPath(import.meta.url))), 'config', 'url-exclusions.json');
export const EXCLUSIONS_RAW_URL = 'https://raw.githubusercontent.com/alanranger/alan-shared-resources/main/config/url-exclusions.json';

/** Lower-case path prefixes without a trailing slash. */
export function prefixesFrom(config) {
  return (Array.isArray(config?.pathPrefixes) ? config.pathPrefixes : [])
    .map((p) => String(typeof p === 'string' ? p : p?.prefix || '').trim().toLowerCase().replace(/\/+$/, ''))
    .filter((p) => p.startsWith('/') && p.length > 1);
}

let cached = null;
export function loadExclusionPrefixes(file = EXCLUSIONS_FILE) {
  if (file === EXCLUSIONS_FILE && cached) return cached;
  const prefixes = prefixesFrom(JSON.parse(readFileSync(file, 'utf8')));
  if (file === EXCLUSIONS_FILE) cached = prefixes;
  return prefixes;
}

/** Path of a full URL, a host-less URL or a bare path; query and hash ignored. */
export function pathOf(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  let full = raw;
  if (raw.startsWith('/')) full = `https://x${raw}`;
  else if (!/^[a-z]+:\/\//i.test(raw)) full = `https://${raw}`;
  try {
    return new URL(full).pathname.toLowerCase();
  } catch {
    return raw.split(/[?#]/)[0].toLowerCase();
  }
}

export function isExcludedUrl(url, prefixes = loadExclusionPrefixes()) {
  const p = pathOf(url).replace(/\/+$/, '');
  return prefixes.some((pre) => p === pre || p.startsWith(`${pre}/`));
}

export function withoutExcluded(urls, prefixes = loadExclusionPrefixes(), pick = (u) => u) {
  return (Array.isArray(urls) ? urls : []).filter((item) => !isExcludedUrl(pick(item), prefixes));
}
