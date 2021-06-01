import {NextFunction, Request, RequestHandler, Response} from 'express'
import {verify} from 'jsonwebtoken'

export const auth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

    let token

    try {

        // if (!req.isAuth) {
        //     throw new Error ('Unauthorized')
        // }

        if (req.headers.login === 'true') {
            req.isAuth = false
            return next()
        }

        if (req.headers.register === 'true') {
            req.isAuth = false
            return next()
        }

        if (req.headers.reset === 'true') {
            req.isAuth = false
            return next()
        }

        if (req.headers.confirm === 'true') {
            req.isAuth = false
            return next()
        }

        // if (!req.isAuth) {
        //     throw new Error ('Unauthoasdadrized')
        // }

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(" ")[1]

            const decoded = verify(token, process.env.JWT_KEY as string)
    
            if (decoded) {
                // console.log(decoded)
                req.isAuth = true
                return next()
            }
    
        }
    
        // if (!token) {
        //     throw new Error ('Invalid')
        // }

        return next()
        
    } catch (err) {
        console.log(err)
        return err
    }

}