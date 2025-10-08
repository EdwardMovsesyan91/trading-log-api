import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ZodError } from "zod";
import logger from "../utils/logger.js";

type ErrorResponse = {
  message: string;
  details?: unknown;
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
) {
  let status = 500;
  let message = "Internal Server Error";
  let details: unknown;

  if (createHttpError.isHttpError(err)) {
    status = err.statusCode ?? err.status ?? 500;
    message = err.message;
    details = err.errors ?? undefined;
  } else if (err instanceof ZodError) {
    status = 400;
    message = "Validation Error";
    details = err.flatten();
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  if (status >= 500) {
    logger.error({ err }, message);
  } else {
    logger.warn({ err }, message);
  }

  res.status(status).json({ message, ...(details ? { details } : {}) });
}

export default errorHandler;


