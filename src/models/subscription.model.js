import { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscribe: {
        type: Schema.Types.ObjectId,  // one who is subscribing
        ref: 'User'
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref:'User'
    }
},{timestamps : true})

export const Subcription = mongoose.model("Subscription", subscriptionSchema)