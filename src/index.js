import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); 
// require('dotenv').config({path : './env'})

import connectDB from './db/index.js';
import { app } from './app.js';


connectDB()
.then(()=>{
   app.listen(process.env.PORT || 4000,()=>{
    console.log(`Server is Running at port : ${process.env.PORT}`)
   })
})
.catch((err)=>{
    console.log("Connection Failed ",err);
})
