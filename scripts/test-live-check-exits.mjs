#!/usr/bin/env node
/**
 * 4 Nov 2026: the 06 prune script finished but its node process never exited, so auto-push waited 9+ hours and
 * every later sync was refused. Proof against a local server (no live site): a 404 / 301 / 429 whose body never
 * ends must not keep the process alive once classifyUrl has answered.
 *   node scripts/test-live-check-exits.mjs
 */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const LIB = pathToFileURL(process.env.LIVE_CHECK_LIB || path.join(path.dirname(fileURLToPath(import.meta.url)), 'site-urls-06-lib.mjs')).href;
const server = http.createServer((req, res) => {
  const code = { '/gone': 404, '/moved': 301, '/busy': 429 }[req.url] || 200;
  res.writeHead(code, code === 301 ? { Location: '/elsewhere' } : { 'Content-Type': 'text/html' });
  res.write('<html>');
  const drip = setInterval(() => res.write(' '), 500);
  res.on('close', () => clearInterval(drip));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

function childRun(url) {
  const code = `const { classifyUrl } = await import(${JSON.stringify(LIB)}); const r = await classifyUrl(${JSON.stringify(url)}); console.log(JSON.stringify(r));`;
  return new Promise((resolve) => {
    const started = Date.now();
    const p = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    const kill = setTimeout(() => p.kill(), 40000);
    p.on('exit', (c) => { clearTimeout(kill); resolve({ url, ms: Date.now() - started, exited: c === 0, out: out.trim() }); });
  });
}

const results = [];
for (const p of ['/gone', '/moved', '/busy']) results.push(await childRun(`${base}${p}`));
server.close();
server.closeAllConnections?.();
// 404 is re-checked after 5 s; anything near the 40 s kill means an unread body held the process.
const fails = results.filter((r) => !r.exited || r.ms > 25000);
for (const r of results) console.log(`${fails.includes(r) ? 'FAIL' : 'PASS'} ${r.url.replace(base, '')} exited in ${r.ms} ms ${r.out}`);
process.exit(fails.length ? 1 : 0);
