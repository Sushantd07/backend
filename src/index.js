import dotenv from 'dotenv';
dotenv.config();

// require('dotenv').config({path : './env'})

import connectDB from './db/index.js';


connectDB();
