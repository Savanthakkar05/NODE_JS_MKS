import { NextFunction, Request, Response } from "express"

export const asyncHandler = (fn: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await (fn(req, res).catch((err: any) => next(err)))
    }
};