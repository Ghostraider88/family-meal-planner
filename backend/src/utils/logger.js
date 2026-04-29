import config from '../config/env.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };
const threshold = LEVELS[config.LOG_LEVEL] ?? LEVELS.info;

const REDACT_KEYS = new Set([
  'password',
  'password_hash',
  'token',
  'refreshtoken',
  'authorization',
  'jwt_secret',
  'jwt_refresh_secret',
  'cookie',
  'set-cookie',
]);

const safe = (obj) => {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(safe);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACT_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : safe(v);
  }
  return out;
};

const emit = (level, args) => {
  if (LEVELS[level] < threshold) return;
  const ts = new Date().toISOString();
  const payload = args.map((a) => (typeof a === 'object' ? JSON.stringify(safe(a)) : a)).join(' ');
  const line = `[${ts}] ${level.toUpperCase()} ${payload}`;
  // Choose stream by severity so containers can split logs
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

const logger = {
  debug: (...a) => emit('debug', a),
  info: (...a) => emit('info', a),
  warn: (...a) => emit('warn', a),
  error: (...a) => emit('error', a),
};

export default logger;
