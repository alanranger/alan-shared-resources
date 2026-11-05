/**
 * When the 06 prune drops a URL (404 / 410 / redirect / noindex), its pages_master row goes too, so tier lists and the
 * integrity checks never list dead pages. Rows for URLs in the shared exclusions go as well. Each removal is logged in
 * master_table_mutations with the full row, so it can be put back; a URL that returns to 06 can be added again as usual.
 * Only confirmed drops remove a row: a live page that is merely missing from 06 is never touched here.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, urlKey } from './site-urls-06-lib.mjs';
import { isExcludedUrl } from './url-exclusions.mjs';

export const PROPERTY = 'https://www.alanranger.com';
const ENV_FILE = join(ROOT, '..', 'AI GEO Audit', '.env.local');

/** { url, key } for the AI GEO Supabase project, or null when the env file or keys are missing. */
export function supabaseEnv(file = ENV_FILE) {
  if (!existsSync(file)) return null;
  const vars = Object.fromEntries(readFileSync(file, 'utf8').split(/\r?\n/)
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')]));
  const url = vars.SUPABASE_URL || vars.NEXT_PUBLIC_SUPABASE_URL;
  return url && vars.SUPABASE_SERVICE_ROLE_KEY ? { url, key: vars.SUPABASE_SERVICE_ROLE_KEY } : null;
}

const rowUrl = (r) => r.url || `${PROPERTY}${r.path || ''}`;

/** pages_master rows to remove: those whose URL was dropped from 06 this run, and any excluded URL. */
export function rowsToRemove(rows, dropped) {
  const gone = new Map(dropped.filter((d) => d.drop === true).map((d) => [urlKey(d.url), d.reason]));
  return rows.map((r) => ({ row: r, reason: gone.get(urlKey(rowUrl(r))) || (isExcludedUrl(rowUrl(r)) ? 'excluded' : null) }))
    .filter((x) => x.reason);
}

async function rest(env, fetchFn, path, init = {}) {
  const res = await fetchFn(`${env.url}/rest/v1/${path}`, { ...init,
    headers: { apikey: env.key, Authorization: `Bearer ${env.key}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path.split('?')[0]} -> ${res.status}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}

export async function removeFromPagesMaster(dropped, { env = supabaseEnv(), fetchFn = fetch, dryRun = false } = {}) {
  if (!env) return { removed: [], skipped: 'no Supabase credentials (AI GEO Audit/.env.local)' };
  const rows = await rest(env, fetchFn, `pages_master?select=*&property_url=eq.${encodeURIComponent(PROPERTY)}`);
  const hits = rowsToRemove(rows || [], dropped);
  const removed = hits.map((h) => ({ url: rowUrl(h.row), tier: h.row.tier, reason: h.reason }));
  if (dryRun || !hits.length) return { removed, dryRun };
  await rest(env, fetchFn, `pages_master?id=in.(${hits.map((h) => h.row.id).join(',')})`, { method: 'DELETE' });
  await rest(env, fetchFn, 'master_table_mutations', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({
    table_name: 'pages_master', script_name: 'prune-06-dead-and-noindex.mjs', args: 'remove rows whose URL left 06', row_count: hits.length,
    notes: JSON.stringify(hits.map((h) => ({ reason: h.reason, row: h.row }))), property_url: PROPERTY }) });
  return { removed };
}
