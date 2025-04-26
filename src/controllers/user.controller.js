import { asyncHandler1 } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/claudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken

        // because of saving the passsword is again required therefore we use 
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generation Tokens")
    }
}

const registerUser = asyncHandler1(async (req, res) => {

    // Get user details from frontend  (Using )
    // validation - not empty
    // Check if user exists (using USERNAME or EMAIL)
    // check for images and avatar 
    // upload them to claudinary, check avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user Creation
    // return response

    const { username, email, fullname, password } = req.body;

    console.log(req.body)

    if (
        [fullname, username, email, password].some((field) =>
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All Fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }] // "Check if any one of the conditions is true."
    })


    if (existedUser) {
        throw new ApiError(409, "User already Exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    const user = await User.create({
        fullname,
        avatar: avatar.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(  // .select means This field i dont want in Response
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "User with this name already exists")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Succesfully")
    )
})


const loginUser = asyncHandler1(async (req, res) => {

    // req.body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies
    // response success

    const { username, email, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User Does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password) // this pass is req.body pass

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credentials")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user loggedIn Successfully"
            )
        )

})

const logoutUser = asyncHandler1(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true // becuase we got new 
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User LoggedOut Successfully"))
})

const refreshAccessToken = asyncHandler1(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }

})

const changeCurrentPassword = asyncHandler1(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler1(async (req, res) => {

    return res
        .status(200)
        .json(200, req.user, "Current user fetch successfully")
})

const updateAccountDetails = asyncHandler1(async (req, res) => {
    const { fullname, email } = req.body

    if (!(fullname || email)) {
        throw new ApiError(400, "Reuired")
    }

    User.findOneAndUpdate(
        req?.user._id,
        {
            $set: {
                fullname,
                email: email,
            }
        },
        { new: true }   // info after getting updated
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account detail Updated Successfully"))
});

const updateUserAvatar = (asyncHandler1(async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
       throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading Avatar ")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        { 
            $set : {
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated Successfully"))

}))

const updateUserCoverImage = (asyncHandler1(async (req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
       throw new ApiError(400,"Avatar file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading Avatar ")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        { 
            $set : {
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated Successfully"))

}))

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage
};