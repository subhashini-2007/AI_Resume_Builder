import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMemoryStore = new Map<string, RateLimitStore>();
const aiLimitMemoryStore = new Map<string, RateLimitStore>();

export const apiRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxRequests = 100; // max requests per IP in this window

  let store = rateLimitMemoryStore.get(ip);

  if (!store || currentTime > store.resetTime) {
    store = {
      count: 1,
      resetTime: currentTime + windowMs
    };
    rateLimitMemoryStore.set(ip, store);
    return next();
  }

  store.count += 1;

  if (store.count > maxRequests) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the 100 requests per 15 minutes limit. Please try again later.'
    });
  }

  next();
};

export const aiRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAiRequests = 15; // max AI requests per IP in this window

  let store = aiLimitMemoryStore.get(ip);

  if (!store || currentTime > store.resetTime) {
    store = {
      count: 1,
      resetTime: currentTime + windowMs
    };
    aiLimitMemoryStore.set(ip, store);
    return next();
  }

  store.count += 1;

  if (store.count > maxAiRequests) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the 15 AI requests per 15 minutes limit. Please try again later.'
    });
  }

  next();
};
