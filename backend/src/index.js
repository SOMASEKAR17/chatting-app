import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './lib/db.js'
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
// to use this you will have to change the type in pakage.json to module , else you have to use const express = require('express');
const app = express();
dotenv.config()

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());


app.use('/api/auth',authRoutes);

const PORT=process.env.PORT;

app.listen(PORT,()=>{
console.log(`server is running on port ${PORT}`);
    connectDB()
})