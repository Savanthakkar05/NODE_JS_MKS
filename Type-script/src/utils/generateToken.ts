import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { userAttributes } from '../module/user/user.interface';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
const expire_time = process.env.EXPIRES_TIME_ACCESS_TOKEN;
export const generateToken = (user: userAttributes): string => {
    // 1. Declare the variable using 'const'
    const accessToken = jwt.sign(
        { id: user.id },
        // 2. Ensure SECRET_KEY exists (fallback or non-null assertion)
        SECRET_KEY!,
        {
            // 3. Fixed typo: TOEKN -> TOKEN
            expiresIn: expire_time as any
        }
    );

    return accessToken;
};