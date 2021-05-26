import { Ipost } from "../post/post";
import { Iuser } from "../user/user";

export interface Icomment {
    content: string
    commentBy: Iuser
    commentedOn: Ipost
}