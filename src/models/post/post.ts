import { model, Schema } from 'mongoose'

// Interfaces
import { Ipost } from '../../interfaces/post/post'

const postSchema = new Schema({
    content: String,
    postBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true })

export const Post = model<Ipost>('Post', postSchema)