import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from "morgan";

import connectDB from "./configs/connectDB.js";
import { clerkWebhook } from './controllers/webhooks.js';

const app = express();
app.use(morgan('tiny'));

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/clerk', express.json(), clerkWebhook);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
