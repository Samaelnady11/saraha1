

import express from 'express';
import { PORT } from './config/config.service.js';
import connectDB from './DB/connection.js';
import authcontroller from './modules/auth/auth.controller.js';
import { globalErrorHandler } from './common/middleware/errorhandler.js';
  //import usercontroller from './modules/user/user.controller.js';
import {  validateConfig } from './config/config.service.js';
import { userController } from './modules/user/user.controller.js';
validateConfig();
const app = express();
app.use(express.json());

app.use('/auth', authcontroller);
app.use('/user', userController);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(globalErrorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

});