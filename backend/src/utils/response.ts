import { Response } from 'express';

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  INTERNAL_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
};

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
  timestamp: string;
}

export class ApiResponseHandler {
  // Успешный ответ
  static success<T>(
    res: Response,
    data: T,
    message: string = MESSAGES.SUCCESS,
    statusCode: number = HTTP_STATUS.OK
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = MESSAGES.CREATED
  ): void {
    this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static noContent(res: Response): void {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.DELETED,
      timestamp: new Date().toISOString(),
    });
  }

  static validationError(res: Response, errors: any[]): void {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: MESSAGES.BAD_REQUEST,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static unauthorized(res: Response, message: string = MESSAGES.UNAUTHORIZED): void {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  static forbidden(res: Response, message: string = MESSAGES.FORBIDDEN): void {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  static notFound(res: Response, message: string = MESSAGES.NOT_FOUND): void {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  static internalError(res: Response, message: string = MESSAGES.INTERNAL_ERROR): void {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res: Response, statusCode: number, message: string): void {
    res.status(statusCode).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}
