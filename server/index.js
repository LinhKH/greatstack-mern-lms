import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from "morgan";
import bodyParser from "body-parser";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./configs/connectDB.js";
import { clerkWebhook } from './controllers/webhooks.js';

const app = express();
app.use(morgan('tiny'));

app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/clerk', bodyParser.raw({ type: "application/json" }), clerkWebhook);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
