import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { createTaskService, deleteTaskService, getTaskService, updateTaskService } from './task.service';
import { StatusCodes } from "http-status-codes";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await createTaskService(req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, message: 'Task created', data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await updateTaskService(req.params.id as string, req.body);
    return res.status(StatusCodes.OK).json({ success: true, message: 'Task updated', data: task });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await getTaskService();
    return res.status(StatusCodes.OK).json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    await deleteTaskService(req.params.id as string);
    return res.status(StatusCodes.OK).json({ success: true, message: 'Deleted task' });
});