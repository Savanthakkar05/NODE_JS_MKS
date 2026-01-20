import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
dotenv.config();
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode: number = err.statusCode || 500;
    const message: string = err.message || "Internal Server Error";
    const success: boolean = err.success;
    const errors: any[] = err.errors || [];

    res.status(statusCode).json({
        success: success || false,
        statusCode: statusCode,
        message: message,
        errors: errors,
        stack: process.env.NODE_ENV ? err.stack : undefined,
    });
};

