import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again later.',
    errors: {
      _general: ['Rate limit exceeded. Please try again in 15 minutes.'],
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for notification polling endpoints
    const path = req.path || req.url || '';
    return path.includes('/notifications/unread-count') || path.includes('/notifications');
  },
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs (login/register attempts)
  message: {
    message: 'Too many authentication attempts, please try again later.',
    errors: {
      _general: ['Too many login/register attempts. Please try again in 15 minutes.'],
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    message: 'Too many file uploads, please try again later.',
    errors: {
      _general: ['Too many file uploads. Please try again in 1 hour.'],
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for comment creation
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 comments per 15 minutes
  message: {
    message: 'Too many comments, please try again later.',
    errors: {
      _general: ['Too many comments. Please try again in 15 minutes.'],
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

