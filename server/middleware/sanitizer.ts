import { Request, Response, NextFunction } from 'express';

/**
 * Mask any sensitive external link strings into clean CDN stream URLs.
 * Replaces any occurrence of the term 'terabox' with high-speed CDN streaming domains or descriptors.
 */
export function sanitizeMaskValue(val: unknown): unknown {
  if (typeof val === 'string') {
    let cleaned = val;

    // Mask direct URLs containing 'terabox' into high-speed CDN stream aliases
    if (/terabox\.app\/s\//i.test(cleaned) || /terabox/i.test(cleaned)) {
      cleaned = cleaned.replace(/https?:\/\/[^/]*terabox[^/]*\/s\//gi, 'https://fastcdn.stream/v/');
      cleaned = cleaned.replace(/terabox\s*exclusive/gi, 'VIP Master');
      cleaned = cleaned.replace(/terabox\s*cloud/gi, 'VIP Cloud');
      cleaned = cleaned.replace(/terabox/gi, 'FastCDN');
    }

    return cleaned;
  }

  if (Array.isArray(val)) {
    return val.map(sanitizeMaskValue);
  }

  if (val !== null && typeof val === 'object') {
    const record = val as Record<string, unknown>;
    const sanitizedObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      // Map old targetLink to streamUrl if present
      if (key === 'targetLink' || key === 'targetUrl') {
        const masked = sanitizeMaskValue(value);
        sanitizedObj.streamUrl = masked;
        sanitizedObj.serverUrl = masked;
        sanitizedObj.hdSourceUrl = masked;
        continue;
      }

      if (key === 'targetType') {
        sanitizedObj.targetType = 'direct_stream';
        continue;
      }

      // If category has 'Terabox Cloud', rename to 'VIP Cloud'
      if (key === 'category' && typeof value === 'string' && /terabox/i.test(value)) {
        sanitizedObj.category = 'VIP Cloud';
        continue;
      }

      sanitizedObj[key] = sanitizeMaskValue(value);
    }

    // Ensure streamUrl, serverUrl, and hdSourceUrl are provided if streamUrl exists
    if (sanitizedObj.streamUrl) {
      sanitizedObj.serverUrl = sanitizedObj.streamUrl;
      sanitizedObj.hdSourceUrl = sanitizedObj.streamUrl;
    }

    return sanitizedObj;
  }

  return val;
}

/**
 * Express Middleware: Intercepts res.json to automatically enforce zero 'terabox' mentions
 * and guarantees streamUrl / serverUrl / hdSourceUrl link masking.
 */
export function responseMaskMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: unknown): Response {
    try {
      const sanitized = sanitizeMaskValue(body);
      return originalJson(sanitized);
    } catch {
      return originalJson(body);
    }
  };

  next();
}
