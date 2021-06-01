declare namespace Express {
    export interface Request {
        isAuth : boolean
        normalQuery: boolean
    }
}