/**
 * Structured Logger Middleware
 * Emits JSON formatted logs with request context, response timing, and Telegram User ID
 */
const structuredLogger = (req, res, next) => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const responseTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    const logEntry = {
      level: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO',
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTimeMs: `${responseTimeMs}ms`,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      telegramUserId: req.telegramUser?.id ? String(req.telegramUser.id) : null,
      contentLength: res.get('content-length') || 0,
    };

    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify(logEntry));
    }
  });

  next();
};

module.exports = structuredLogger;
