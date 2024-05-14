// app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { join } from 'path';

import { initChatBookDbExec } from './utils/db';
import { parseFilesAndWeb, vectorDdProcess } from './utils/llms';

//import { downloadVideoFromAPI } from './utils/Backup/stability';

import userRouter from './router/user'
import llmsRouter from './router/llms'
import utilsRouter from './router/utils'
import appRouter from './router/app'
import datasetRouter from './router/dataset'

//import stabilityRouter from './router/Backup/stability'
//import getimgRouter from './router/Backup/getimg'
//import seaartRouter from './router/seaart'

//Start Express Server
const app = express();
const port = 1988;
app.use(cors());
app.use(bodyParser.json());
dotenv.config();


//Initial Database and Folder
initChatBookDbExec()

//Schedule Task for Parse Upload Files
cron.schedule('*/10 * * * *', () => {
  console.log('Task Begin !');
  parseFilesAndWeb();
  vectorDdProcess();
  console.log('Task End !');
  //downloadVideoFromAPI();
});

app.use('/', userRouter);
app.use('/', llmsRouter);
app.use('/', utilsRouter);
app.use('/', appRouter);
app.use('/', datasetRouter);

//app.use('/', getimgRouter);
//app.use('/', stabilityRouter);
//app.use('/', seaartRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // 处理身份验证错误
  if (err.name === 'AuthenticationError') {
    console.error('AuthenticationError:', err.message);
    res.status(200).json({ error: 'Authentication failed' });
  } 
  else {
    // 处理其他错误
    console.error('Unexpected error:', err);
    res.status(200).json({ error: 'Internal Server Error' });
  }
});

app.use(express.static(join(__dirname, '../../out')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
