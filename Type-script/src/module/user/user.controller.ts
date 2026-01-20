import { StatusCodes } from "http-status-codes";
import { Request, Response } from 'express';
import { getProfile, loginService, userCreate } from "./user.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await userCreate(req.body);
    res.cookie('accessToken', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: false,
    });

    return res.status(StatusCodes.CREATED).json({ success: true, message: 'User created', data: user, token })
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await loginService(req.body);

    res.cookie('accessToken', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: false,
    })

    return res.status(StatusCodes.OK).json({ success: true, message: 'Login success', data: user, token })
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
    const user = await getProfile((req as any).user);
    return res.status(StatusCodes.OK).json({ success: true, data: user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: false,
    });

    return res
        .status(StatusCodes.OK)
        .json({ success: true, message: "Logout Successfully.." });
})