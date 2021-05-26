import { Schema, model } from "mongoose";

// Interfaces
import { Icomment } from "../../interfaces/comment/comment";

const commentSchema = new Schema({
    content: String,
    commentBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    commentedOn: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }
})
// dummyonly123098
// 123098dummyonly
export const Comment = model<Icomment>('Comment', commentSchema)