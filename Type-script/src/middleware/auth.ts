import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.cookies?.accessToken;
        if (!token) {
            throw new ApiError('Acess Token is required', StatusCodes.UNAUTHORIZED);
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };

        (req as any).user = decoded.id;
        next();
    } catch (error: any) {
        throw new ApiError('Invalid or Expired token', StatusCodes.UNAUTHORIZED);
    }
} 