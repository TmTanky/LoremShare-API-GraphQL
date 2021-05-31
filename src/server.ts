require('dotenv').config()
import express from 'express'
import {graphqlHTTP} from 'express-graphql'
import {connect} from 'mongoose'
import cors from 'cors'
import cookieSession from 'cookie-session'

import {schema} from './graphql/schema/schema'
import {rootValue} from './graphql/resolvers/resolver'

// Middleware
import {auth} from './auth/auth'

const PORT = process.env.PORT || 8000

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: [process.env.KEY_1 as string, process.env.KEY_2 as string]
}))

connect(`${process.env.MONGO}`, {useFindAndModify: false, useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true})

app.use(auth)
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})