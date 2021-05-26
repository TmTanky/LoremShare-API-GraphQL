import {Document} from 'mongoose'

// Interfaces
import { Iuser } from "../user/user";
import { Icomment } from '../comment/comment';

export interface Ipost extends Document {
    content: string
    postBy: Iuser
    likes: Iuser[]
    comments: Icomment[]
}