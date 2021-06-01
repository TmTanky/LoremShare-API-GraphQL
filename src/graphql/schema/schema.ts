import {buildSchema} from 'graphql'

export const schema = buildSchema(`

    type Query {
        loginUser(email: String, password: String): userInfo
        getAllPosts: [post]
        getUsersPosts(userID: ID): [post]
        getUsername(userID: ID): userInfo
        getFollow(userID: ID): userInfo
        paginate(userID: ID, limitCount: Int, skipCount: Int): [post]
        reversePaginate(userID: ID, limitCount: Int, skipCount: Int): [post]
        getUserByUsername(username: String): [userInfo]
        viewUser(username: String): userInfo
        viewUserPosts(username: String, limitCount: Int): [post]
        viewLikes(postID: ID): post
        viewPostComments(postID: ID): [comment]
        viewUserByID(userID: ID): userInfo
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
        username: String
    }

    type post {
        _id: ID
        content: String
        postBy: userInfo
        likes: [userInfo]
        createdAt: String
        comments: [comment]
    }
    
    type code {
        code: String
        userID: ID
    }
    
    type comment {
        _id: ID
        content: String
        commentBy: userInfo
        commentedOn: post
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

        editPost(
            postID: ID!
            content: String!
        ): String

        editUsername(
            userID: ID!
            firstName: String!
            lastName: String!
        ): String

        createComment(
            postID: ID!
            content: String!
            userID: ID!
        ): String

        sendEmail(
            email: String!
        ): code

        changePassword(
            userID: ID!
            newPass: String!
        ): String

        changeUsername(
            userID: ID!
            newUsername: String!
        ): String

    }

`)