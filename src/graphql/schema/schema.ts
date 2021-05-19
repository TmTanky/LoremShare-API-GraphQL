import {buildSchema} from 'graphql'

export const schema = buildSchema(`

    type Query {
        loginUser(email: String, password: String): userInfo
        getUsersPosts(userID: ID): [post]
        getUsername(userID: ID): userInfo
        getFollow(userID: ID): userInfo
    }

    type userInfo {
        _id: ID
        firstName: String
        lastName: String
        email: String
        password: String
        token: String
        myPosts: [post]
        following: [userInfo]
        followers: [userInfo]
    }

    type post {
        _id: ID
        content: String
        postBy: userInfo
        likes: [userInfo]
        createdAt: String
    }

    type Mutation {

        createUser(
            firstName: String!
            lastName: String!
            email: String!
            password: String!
        ): userInfo

        createPost(
            content: String!
            postBy: ID!
        ): post

        reactToPost(
            postID: ID!
            userID: ID!
        ): String

        followUser(
            userID: ID!
            toFollowID: ID!
        ): String

        deletePost(
            postID: ID!
        ): String

    }

`)