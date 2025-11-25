import ApiError from '../utils/ApiError.js';

export default function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err instanceof ApiError ? err.status : 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Unexpected error';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: { status, code, message } });
}
