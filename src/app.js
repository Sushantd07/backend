import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express();


// Middleware

app.use(cors({
    origin:process.env.CORS_ORIGIN
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public")) // Use Store Pdf img on the Server
app.use(cookieParser())

// Routes import
import userRouter from './routes/user.routes.js'

//app.get -> not use because everything is written in diff. file 
app.use('/api/v1/users',userRouter)  // https://localhost:3000/api/v1/user/register or user/login

export {app} 