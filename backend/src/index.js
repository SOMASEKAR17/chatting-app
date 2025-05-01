import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './lib/db.js'
// to use this you will have to change the type in pakage.json to module , else you have to use const express = require('express');

dotenv.config()
import authRoutes from './routes/auth.route.js';
const app = express();

app.use('/api/auth',authRoutes);

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    connectDB()
})