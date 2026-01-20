import express from 'express';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import db_authenticate from './config/db_authenticate';
import userRoute from './routes/user.route';
import { errorHandler } from './middleware/errorHandler';
import taskRoute from './routes/task.route';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
app.use(json());
app.use(cookieParser());

db_authenticate();

app.use('/v1/api', userRoute);
app.use('/v1/api/task', taskRoute);

app.use(errorHandler)
app.listen(process.env.PORT, (): void => {
    console.log('Server is run on the 3008')
});