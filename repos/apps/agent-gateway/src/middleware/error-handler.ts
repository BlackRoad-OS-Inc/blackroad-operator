import type { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  console.error(`[ERROR] ${req.method} ${req.path}:`, error);

  res.status(statusCode).json({
    error: message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
}
