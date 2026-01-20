import { User } from "../../models";
import { InferAttributes } from 'sequelize';
export type userAttributes = InferAttributes<User>;

export type UserCreate = Omit<userAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export type UserResponse = Omit<userAttributes, 'password'>;

export type loginData = Omit<userAttributes, 'id' | 'createdAt' | 'updatedAt' | 'name'>