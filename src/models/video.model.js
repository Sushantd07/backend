import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from 'bcrypt'
import { JsonWebTokenError } from "jsonwebtoken";


const videoSchema = new Schema({
    videoFile: {
        type: String,
        require: true
    },
    thumbnail: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    duration: {
        type: Number, // claudinary
        require: true
    },
    veiws: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)  // after this we can write mongodb aggregation Query

export const Video = mongoose.model("Video", videoSchema)