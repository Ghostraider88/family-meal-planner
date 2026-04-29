// Tests env validator. Each case spawns a fresh node process so process.exit(1)
// from the validator does not abort the test runner.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, '..', 'src', 'config', 'env.js').replace(/\\/g, '/');

const STRONG = 'a'.repeat(48);
const STRONG_2 = 'b'.repeat(48);

// Use a cwd outside the backend folder so dotenv does not load the local
// development .env that may contain insecure defaults.
const ISOLATED_CWD = os.tmpdir();

const run = (env) =>
  spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import("${ENV_PATH}").then(m=>{ if(m.default.NODE_ENV) console.log("OK_"+m.default.NODE_ENV); }).catch(()=>process.exit(2));`,
    ],
    {
      cwd: ISOLATED_CWD,
      env: { PATH: process.env.PATH, ...env },
      encoding: 'utf8',
    }
  );

test('production: missing JWT_SECRET aborts', () => {
  const r = run({
    NODE_ENV: 'production',
    DB_PASSWORD: 'pw',
    CORS_ORIGIN: 'http://localhost:8087',
    JWT_REFRESH_SECRET: STRONG,
  });
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /JWT_SECRET is required/);
});

test('production: short secret aborts', () => {
  const r = run({
    NODE_ENV: 'production',
    DB_PASSWORD: 'pw',
    CORS_ORIGIN: 'http://localhost:8087',
    JWT_SECRET: 'short',
    JWT_REFRESH_SECRET: STRONG,
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /JWT_SECRET must be at least 32 characters/);
});

test('production: identical access and refresh secrets aborts', () => {
  const r = run({
    NODE_ENV: 'production',
    DB_PASSWORD: 'pw',
    CORS_ORIGIN: 'http://localhost:8087',
    JWT_SECRET: STRONG,
    JWT_REFRESH_SECRET: STRONG,
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /must differ/);
});

test('production: missing DB_PASSWORD aborts', () => {
  const r = run({
    NODE_ENV: 'production',
    CORS_ORIGIN: 'http://localhost:8087',
    JWT_SECRET: STRONG,
    JWT_REFRESH_SECRET: STRONG_2,
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /DB_PASSWORD is required/);
});

test('production: missing CORS_ORIGIN aborts', () => {
  const r = run({
    NODE_ENV: 'production',
    DB_PASSWORD: 'pw',
    JWT_SECRET: STRONG,
    JWT_REFRESH_SECRET: STRONG_2,
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /CORS_ORIGIN is required/);
});

test('production: wildcard CORS_ORIGIN aborts', () => {
  const r = run({
    NODE_ENV: 'production',
    DB_PASSWORD: 'pw',
    CORS_ORIGIN: '*',
    JWT_SECRET: STRONG,
    JWT_REFRESH_SECRET: STRONG_2,
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /CORS_ORIGIN must not be/);
});

test('production: known dev secret rejected', () => {
  const r = run({
    NODE_ENV: 'production',
    DB_PASSWORD: 'pw',
    CORS_ORIGIN: 'http://localhost:8087',
    JWT_SECRET: 'dev-jwt-secret-not-for-production-use-min-32-chars-x',
    JWT_REFRESH_SECRET: STRONG_2,
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /known insecure default/);
});

test('production: valid config loads', () => {
  const r = run({
    NODE_ENV: 'production',
    DB_PASSWORD: 'pw',
    CORS_ORIGIN: 'http://localhost:8087',
    JWT_SECRET: STRONG,
    JWT_REFRESH_SECRET: STRONG_2,
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /OK_production/);
});

test('development: weak secrets only warn', () => {
  const r = run({
    NODE_ENV: 'development',
    JWT_SECRET: 'short-dev-secret',
    JWT_REFRESH_SECRET: 'short-dev-refresh',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /OK_development/);
});
