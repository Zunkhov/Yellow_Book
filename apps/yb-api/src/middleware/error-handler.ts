import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.issues,
    });
    return;
  }

  if (error.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      error: 'Database error',
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
}