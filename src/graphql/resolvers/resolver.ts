import {hash, compare} from 'bcrypt'
import {sign} from 'jsonwebtoken'

// Interfaces
import { Iuser } from '../../interfaces/user/user'
import { Ipost } from '../../interfaces/post/post'

// Models
import {User} from '../../models/user/user' 
import {Post} from '../../models/post/post'
import { IsessionData } from '../../interfaces/session/session'

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

    getAllPosts: async () => {

        try {

            const allPosts = await Post.find()

            return allPosts
            
        } catch (err) {
            return err
        }

    },

    getUsersPosts: async (args: {userID: Iuser}) => {

        const {userID} = args

        try {

            const allUsersPosts = await Post.find().where('postBy', {_id: userID}).
                populate('postBy').
                populate('likes').
                populate('comments').
                sort({_id: -1}).
                limit(5).
                skip(0)

            return allUsersPosts

            
        } catch (err) {
            return err
        }

    },

    paginate: async (args: {userID: Iuser, limitCount: number, skipCount: number}, req: Request) => {

        const {userID, limitCount, skipCount} = args

        try {

            // console.log(skipCount)

            // const currentUser = await User.findOne({_id: userID})
            // const postLength = currentUser!.myPosts.length
            const allUsersPosts = await Post.find().where('postBy', {_id: userID}).populate('postBy').sort({_id: -1}).limit(limitCount).skip(skipCount)
            // console.log(allUsersPosts)
            return allUsersPosts
            
        } catch (err) {
            console.log(err)
        }

    },

    reversePaginate: async (args: {userID: Iuser, limitCount: number, skipCount: number}, req: Request) => {

        const {userID, limitCount, skipCount} = args

        try {
            // const currentUser = await User.findOne({_id: userID})
            // const postLength = currentUser!.myPosts.length
            const allUsersPosts = await Post.find().where('postBy', {_id: userID}).populate('postBy').limit(limitCount).skip(skipCount)

            return allUsersPosts
            
        } catch (err) {
            console.log(err)
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

    getUserByUsername: async (args: {username: string}) => {

        const {username} = args

        try {

            const userFound = await User.find({username})

            return userFound
            
        } catch (err) {
            return err
        }

    },

    viewUser: async (args: {username: string}) => {

        const {username} = args

        try {

            const userFound = await User.findOne({username}).populate('following').populate('followers ')

            return userFound
            
        } catch (err) {
            return err
        }

    },

    viewUserPosts: async (args: {username: string}) => {

        const {username} = args

        try {

            // console.log(username)

            const viewingUser = await User.findOne({username})
            const viewingUsersPosts = await Post.find().where('postBy', {_id: viewingUser!  ._id}).populate('postBy')
            // console.log(username)
            return viewingUsersPosts

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
                password: hashedPassword,
                username: `${firstName}-${lastName}`
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

    },
    
    editPost: async (args: {postID: string, content: string}) => {

        const {content, postID} = args

        try {

            await Post.findOneAndUpdate({_id: postID}, {
                content
            })

            return 'Post updated.'
            
        } catch (err) {
            return err
        }

    },

    editUsername: async (args: {userID: string, firstName: string, lastName: string}) => {

        const {userID, firstName, lastName} = args

        try {

            await User.findOneAndUpdate({_id: userID}, {
                firstName,
                lastName
            })

            return 'Profile Updated!'
            
        } catch (err) {
            return err
        }

    }

}