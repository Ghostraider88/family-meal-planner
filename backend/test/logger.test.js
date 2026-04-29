// Verifies that logger redacts secret keys before writing to stdout/stderr.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGGER_PATH = path.resolve(__dirname, '..', 'src', 'utils', 'logger.js').replace(/\\/g, '/');
const ISOLATED_CWD = os.tmpdir();

const run = (script) =>
  spawnSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd: ISOLATED_CWD,
      env: {
        PATH: process.env.PATH,
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
        JWT_SECRET: 'a'.repeat(48),
        JWT_REFRESH_SECRET: 'b'.repeat(48),
      },
      encoding: 'utf8',
    }
  );

test('logger redacts password and token keys', () => {
  const r = run(`
    import logger from "${LOGGER_PATH}";
    logger.info({ user: 'alice', password: 'p4ssw0rd', token: 'abc.def.ghi' });
  `);
  assert.equal(r.status, 0, r.stderr);
  const out = r.stdout + r.stderr;
  assert.ok(!out.includes('p4ssw0rd'), 'password leaked: ' + out);
  assert.ok(!out.includes('abc.def.ghi'), 'token leaked: ' + out);
  assert.match(out, /\[REDACTED\]/);
  assert.match(out, /alice/);
});

test('logger respects level threshold', () => {
  const r = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import logger from "${LOGGER_PATH}"; logger.debug('hidden'); logger.warn('shown');`,
    ],
    {
      cwd: ISOLATED_CWD,
      env: {
        PATH: process.env.PATH,
        NODE_ENV: 'production',
        LOG_LEVEL: 'warn',
        JWT_SECRET: 'a'.repeat(48),
        JWT_REFRESH_SECRET: 'b'.repeat(48),
        DB_PASSWORD: 'pw',
        CORS_ORIGIN: 'http://localhost:8087',
      },
      encoding: 'utf8',
    }
  );
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!(r.stdout + r.stderr).includes('hidden'));
  assert.match(r.stdout + r.stderr, /shown/);
});
