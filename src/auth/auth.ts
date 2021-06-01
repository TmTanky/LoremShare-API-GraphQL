import {NextFunction, Request, RequestHandler, Response} from 'express'
import {verify} from 'jsonwebtoken'

export const auth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

    let token

    try {

        if (req.headers.login === 'true') {
            req.isAuth = false
            next()
        }

        if (req.headers.register === 'true') {
            req.isAuth = false
            next()
        }

        if (req.headers.reset === 'true') {
            req.isAuth = false
            next()
        }

        if (req.headers.confirm === 'true') {
            req.isAuth = false
            next()
        }

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(" ")[1]

            const decoded = verify(token, process.env.JWT_KEY as string)
    
            if (decoded) {
                req.isAuth = true
                next()
            } else {
                throw new Error ('Invalid Token')
            }
    
        }
    
        if (!token) {
            throw new Error ('Invalid')
        }
        
    } catch (err) {
        return err
    }

}