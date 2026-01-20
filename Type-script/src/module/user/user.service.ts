import { StatusCodes } from "http-status-codes";
import db from "../../models";
import { ApiError } from "../../utils/ApiError";
import { loginData, UserCreate, UserResponse } from "./user.interface";
import { CreateUserSchema, loginSchema } from "./user.validation";
import { generateToken } from "../../utils/generateToken";

export const userCreate = async (data: UserCreate): Promise<{ user: UserResponse; token: string; }> => {

    const validateData: Record<keyof UserCreate, any> = CreateUserSchema.parse(data);

    const user = await db.User.findOne({ where: { email: validateData.email } });

    if (user) {
        throw new ApiError('User already exist', StatusCodes.BAD_REQUEST);
    }

    const createdUser = await db.User.create(validateData);

    const token = generateToken(createdUser);
    return { user: createdUser, token };
};

export const loginService = async (data: loginData): Promise<{ user: UserResponse; token: string; }> => {

    const validateData: Record<keyof loginData, any> = loginSchema.parse(data);
    const user = await db.User.findOne({ where: { email: validateData.email } });

    if (!user) {
        throw new ApiError('User not found', StatusCodes.NOT_FOUND)
    }

    const token = generateToken(user);
    return { user, token };
}

export const getProfile = async (id: string): Promise<UserResponse> => {
    const user = await db.User.findOne({ where: { id: id } });

    if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

    const { password, ...newUser } = user.toJSON();
    return newUser;
}