import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from "morgan";
import bodyParser from "body-parser";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./configs/connectDB.js";
import connectCloudinary from './configs/cloudinary.js';
import { clerkWebhook, stripeWebhook } from './controllers/webhooks.controller.js';
import educatorRouter from './routes/educator.route.js';
import courseRouter from './routes/course.route.js';
import userRouter from './routes/user.route.js';

const app = express();
app.use(morgan('tiny'));

app.use(clerkMiddleware());
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/clerk', bodyParser.raw({ type: "application/json" }), clerkWebhook);
app.post('/stripe', express.json({type: 'application/json'}), stripeWebhook);
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    connectCloudinary();
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
