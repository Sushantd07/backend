import { asyncHandler1 } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../modules/user.model.js";
import { uploadOnCloudinary } from "../utils/claudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };