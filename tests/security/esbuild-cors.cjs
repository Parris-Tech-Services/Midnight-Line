// Defensive regression for GHSA-67mh-4wv8-2f99. Own temporary files only.
// No remote targets, browser exploitation, credentials, or application saves.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const esbuild = require('esbuild');

async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'autopatch-cors-'));
  let context;
  try {
    await fs.writeFile(path.join(root, 'canary.txt'), 'AUTOPATCH_PUBLIC_FIXTURE');
    context = await esbuild.context({});
    const server = await context.serve({ servedir: root, host: '127.0.0.1', port: 0 });
    const result = await new Promise((resolve, reject) => {
      const request = http.get({
        hostname: '127.0.0.1', port: server.port, path: '/canary.txt',
        headers: { Origin: 'https://untrusted.invalid' }, timeout: 5000,
      }, response => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => { body += chunk; });
        response.on('end', () => resolve({
          status: response.statusCode, body,
          allowOrigin: response.headers['access-control-allow-origin'] || null,
        }));
      });
      request.on('timeout', () => request.destroy(new Error('Loopback fixture timed out')));
      request.on('error', reject);
    });
    console.log(JSON.stringify({ advisory: 'GHSA-67mh-4wv8-2f99',
      esbuild: esbuild.version, scope: 'temporary-loopback-fixture', ...result }));
    // The file can be public; an unrelated browser origin must not get read permission.
    assert.equal(result.status, 200);
    assert.equal(result.body, 'AUTOPATCH_PUBLIC_FIXTURE');
    assert.ok(result.allowOrigin !== '*' && result.allowOrigin !== 'https://untrusted.invalid',
      'Development server grants an unrelated browser origin permission to read the fixture');
  } finally {
    if (context) await context.dispose();
    await fs.rm(root, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
