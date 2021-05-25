import {Document} from 'mongoose'

// Interfaces
import { Ipost } from '../post/post';

export interface Iuser extends Document {
    firstName: string
    lastName: string
    email: string
    password: string
    myPosts: Ipost[]
    following: Iuser[]
    followers: Iuser[]
    username: string
}