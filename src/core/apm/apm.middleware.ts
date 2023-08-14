import * as express from 'express';
import { apm } from './start';
import { v4 as uuidv4 } from 'uuid';

const version = process.env['npm_package_version'] ?? '0.0.0';

export const apmMiddleware = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  const transaction = apm && apm.currentTransaction;
  if (transaction) {
    _req.headers['X-Trace-Id'] = transaction.ids['trace.id'] ?? uuidv4();
    _req.headers['X-Transaction-Id'] = transaction.ids['transaction.id'] ?? uuidv4();
  } else {
    _req.headers['X-Trace-Id'] = uuidv4();
    _req.headers['X-Transaction-Id'] = uuidv4();
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  res.setHeader('X-Transaction-Id', _req.headers['X-Transaction-Id']!);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  res.setHeader('X-Trace-Id', _req.headers['X-Trace-Id']!);
  res.setHeader('X-Version', version);
  next();
};
