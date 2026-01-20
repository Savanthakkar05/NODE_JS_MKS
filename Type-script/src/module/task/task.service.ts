import { StatusCodes } from "http-status-codes";
import db from "../../models";
import { ApiError } from "../../utils/ApiError";
import { CreateTask, task, UpdateTask } from "./task.interface";
import { createTaskSchema } from "./task.validation";

export const createTaskService = async (data: CreateTask): Promise<task> => {
    const validateData = createTaskSchema.parse(data);

    const task = await db.Task.create(validateData);

    return task;
};

export const updateTaskService = async (id: string, data: UpdateTask): Promise<task> => {
    const task = await db.Task.findOne({ where: { id: id } });

    if (!task) throw new ApiError('Task not found', StatusCodes.NOT_FOUND);

    await task.update(data);

    return task;
}

export const getTaskService = async (): Promise<task[]> => {
    const task = await db.Task.findAll();

    return task ? task : [];
}

export const deleteTaskService = async (id: string): Promise<void> => {
    const task = await db.Task.findOne({ where: { id: id } });

    if (!task) {
        throw new ApiError('Task not found', StatusCodes.NOT_FOUND);
    }

    task.destroy();
}