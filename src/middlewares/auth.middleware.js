// This will verify if user exists or not

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler1 } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../modules/user.model.js";


export const verifyJWT = asyncHandler1(async (req, _, next) => {

    try {
        //req.header because if token is set from Mobile

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            // TODO : Discuss about Frontend
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, "Error : ", error?.message || "Invalid Access Token")
    }
})

