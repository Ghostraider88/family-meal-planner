import { validationResult } from 'express-validator';

/**
 * Express middleware that surfaces express-validator errors as a 400 response
 * without leaking field internals. Use after a chain of `body()`, `param()`,
 * `query()` validators in route definitions.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  return res.status(400).json({ error: 'Validation failed', details: formatted });
};
