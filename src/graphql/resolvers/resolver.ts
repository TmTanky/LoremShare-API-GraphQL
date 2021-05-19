import {hash, compare} from 'bcrypt'
import {sign} from 'jsonwebtoken'

// Interfaces
import { Iuser } from '../../interfaces/user/user'
import { Ipost } from '../../interfaces/post/post'

// Models
import {User} from '../../models/user/user' 
import {Post} from '../../models/post/post'

export const rootValue = {

    // Queries

    loginUser: async (args: {email: string, password: string}) => {

        const {email, password} = args

        try {

            const foundUser = await User.findOne({email}).populate('myPosts').populate({
                path: 'myPosts',
                populate: 'postBy'
            })

            if (email === "" || password === "") {
                throw new Error ('Please input all fields.')
            }

            if (foundUser === null || undefined) {
                throw new Error (`User doesn't exist.`)
            }

            const isTrue = await compare(password, foundUser!.password)

            if (!isTrue) {
                throw new Error ('Invalid Email or Password.')
            }

            const token = sign({ id: foundUser._id}, process.env.JWT_KEY as string)
            const {firstName, lastName, _id, myPosts } = foundUser as Iuser

            return {firstName, token, lastName, email, _id, myPosts}
            
        } catch (err) {
            return err
        }

    },

    getUsersPosts: async (args: {userID: string}) => {

        const {userID} = args

        try {

            const allUsersPosts = await User.findOne({_id: userID}).populate('myPosts').populate({
                path: 'myPosts',
                populate: 'postBy'
            })

            const {myPosts} = allUsersPosts as Iuser

            return myPosts
            
        } catch (err) {
            return err
        }

    },

    getUsername: async (args: {userID: string}) => {

        const {userID} = args

        try {

            const username = await User.findOne({_id: userID})

            return username

            
        } catch (err) {
            return err
        }

    },

    getFollow: async (args: {userID: string}) => {

        const {userID} = args

        try {

            const follow = await User.findOne({_id: userID}).populate('followers').populate('following')

            return follow
            
        } catch (err) {
            return err
        }

    },

    // Mutations

    createUser: async (args: {firstName: string, lastName: string, email: string, password: string}) => {

        const {firstName, lastName, email, password} = args

        try {

            if (firstName === "" || lastName === "" || email === "" || password === "") {
                throw new Error ('Please fill all inputs.')
            }

            if (password.length < 5) {
                throw new Error ('Password must be 5 characters long.')
            }

            const hashedPassword = await hash(password, 10)

            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword
            })

            await newUser.save()

            const token = sign({ id: newUser._id}, process.env.JWT_KEY as string)
            const {_id} = newUser as Iuser

            return {firstName, token, lastName, email, _id}
            
        } catch (err) {
            
            if (err.code === 11000) {
                throw new Error ('Email already taken.')
            }

            throw err
        }

    },

    createPost: async (args: {content: string, postBy: string}) => {

        const {content, postBy} = args

        try {

            if (content === "") {
                throw new Error ('Content cannot be empty.')
            }

            const newPost = new Post({
                content,
                postBy
            })

            await User.findOneAndUpdate({_id: postBy}, {
                $addToSet: {
                    myPosts: newPost
                }
            })

            await newPost.save()

            return newPost
            
        } catch (err) {
            return err
        }

    },

    reactToPost: async (args: {postID: string, userID: Iuser}) => {

        const {postID, userID} = args

        try {

            const foundPost = await Post.findOne({_id: postID})

            const isTrue = foundPost?.likes.includes(userID)

            if (isTrue) {
                await Post.findOneAndUpdate({_id: postID}, {
                    $pull: {
                        likes: userID
                    }
                }) 

                return 'You unliked this post.'
            }

            await Post.findOneAndUpdate({_id: postID}, {
                $addToSet: {
                    likes: userID
                }
            }) 

            return 'You liked this post.'
            
        } catch (err) {
            return err
        }

    },

    followUser: async (args: {userID: Iuser, toFollowID: Iuser}) => {

        const {toFollowID, userID} = args

        try {

            const toFollowUser = await User.findOne({_id: toFollowID})

            const isFollowed = toFollowUser?.followers.includes(userID)

            if (isFollowed) {
                await User.findOneAndUpdate({_id: toFollowID}, {
                    $pull: {
                        followers: userID
                    }
                })

                await User.findOneAndUpdate({_id: userID}, {
                    $pull: {
                        following: toFollowID
                    }
                })

                return 'You unfollowed this user.'
            }

            await User.findOneAndUpdate({_id: toFollowID}, {
                $addToSet: {
                    followers: userID
                }
            })

            await User.findOneAndUpdate({_id: userID}, {
                $addToSet: {
                    following: toFollowID
                }
            })

            return 'You followed this user.'
            
        } catch (err) {
            return err
        }

    },

    deletePost: async (args: {postID: string}) => {

        const {postID} = args

        try {

            await Post.findByIdAndRemove({_id: postID})

            return 'Post deleted.'
            
        } catch (err) {
            return err
        }

    }

}