import express, { Router } from 'express';
import { login, logout, profile, register } from '../module/user/user.controller';
import { auth } from '../middleware/auth';

const route: Router = express.Router();

route.post('/register', register);
route.post('/login', login);
route.get('/', auth, profile);
route.post('/logout', auth, logout);
export default route;