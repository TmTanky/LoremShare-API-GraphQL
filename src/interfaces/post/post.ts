import {Document} from 'mongoose'

import { Iuser } from "../user/user";

export interface Ipost extends Document {
    content: string
    postBy: Iuser
    likes: Iuser[]
}