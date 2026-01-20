import { Task } from "../../models";
import { InferAttributes } from "sequelize";

export type task = InferAttributes<Task>;

export type CreateTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTask = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;