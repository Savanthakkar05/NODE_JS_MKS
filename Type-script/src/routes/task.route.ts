import express, { Router } from 'express';
import { auth } from '../middleware/auth';
import { createTask, deleteTask, getTask, updateTask } from '../module/task/task.controller';

const route: Router = express.Router();

route.post('/add', auth, createTask);
route.patch('/:id', auth, updateTask);
route.get('/', auth, getTask);
route.delete('/:id', auth, deleteTask);
export default route;