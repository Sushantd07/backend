import mongoose from 'mongoose'
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';

// 1. We are going with Sessions as well as Security    

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true, 
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String
        },
        // watchHistory: [
        //     // {
        //     //     type: Schema.Types.ObjectId,
        //     //     ref: "Video"
        //     // }
        // ],
        password: {
            type: String,
            required: [true, "Password is Required"]
        },
        refreshToken: {
            type: String
        }

    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {  // dont use arrow fnc bcz it uses arror fnc. This is Hook(so it chnages the whole whenever anything get change in userSchema)
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return  jwt.sign(   // this is used to generate Tokens
        {                            //payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIREY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
  return  jwt.sign(   // this is used to generate Tokens
        {                            //payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIREY
        }
    )
}


export const User = mongoose.model("User", userSchema) 