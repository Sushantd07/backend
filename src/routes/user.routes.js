import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route('/register').post(        // means if someone click /register that go to registerUser
    upload.fields([
        {
            name: "avatar",   // file name is avatar use this only in frontend
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)



export default router