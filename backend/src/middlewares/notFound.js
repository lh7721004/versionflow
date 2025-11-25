export default function notFound(req, res, next) {
  res.status(404).json({ error: { status: 404, code: 'NOT_FOUND', message: 'Route not found' } });
}
