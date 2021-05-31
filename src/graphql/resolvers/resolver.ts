import {hash, compare} from 'bcrypt'
import {sign} from 'jsonwebtoken'
import {createTransport} from 'nodemailer'

// Interfaces
import { Iuser } from '../../interfaces/user/user'
// import { Ipost } from '../../interfaces/post/post'
// import { Icomment } from '../../interfaces/comment/comment'

// Models
import {User} from '../../models/user/user' 
import {Post} from '../../models/post/post'
import {Comment} from '../../models/comment/comment'
import { Request } from 'express'

export const rootValue = {

    // Nodemailer

    sendEmail: async (args: {email: string}) => {

        const {email} = args

        const usersEmail = await User.findOne({email})

        let WholeCode = ""
        let i = 0

        for (i; i < 6; i++) {
            const randomNum = Math.floor(Math.random() * 10)
            WholeCode+=randomNum
        }

        let transporter = createTransport({
            name: 'Social-Lorem-Vue',
            service: 'gmail',
            auth: {
                user: `${process.env.NODEMAILER_EMAIL}`,
                pass: `${process.env.NODEMAILER_PASS as string}`
            }
        })

        const mailOptions = {
            from: 'Social-Lorem-Vue',
            to: email,
            subject: 'Password Reset',
            text: `Here is your password reset code ${WholeCode}`
        }

        await transporter.sendMail(mailOptions);

        // console.log(info)

        // console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        // console.log("Preview URL: %s", getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        return {
            userID: usersEmail?._id,
            code: WholeCode
        }

    },

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

    getAllPosts: async (args: any, req: Request) => {

        try {

            const allPosts = await Post.find().
            populate('likes').
            populate('postBy').
            sort({_id: -1})

            return allPosts
            
        } catch (err) {
            return err
        }

    },

    getUsersPosts: async (args: {userID: Iuser}, req: Request) => {

        const {userID} = args

        try {

            const allUsersPosts = await Post.find().where('postBy', {_id: userID}).
                populate('postBy').
                populate('likes').
                populate('comments').
                populate({
                    path: 'comments',
                    populate: 'commentBy'
                }).
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

            const userFound = await User.findOne({username}).
            populate('following').
            populate('followers')

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
            const viewingUsersPosts = await Post.find().where('postBy', {_id: viewingUser!  ._id}).
            populate('postBy').
            populate('likes').
            populate('comments').
            populate({
                path: 'comments',
                populate: 'commentBy'
            }).
            sort({_id: -1})
            // console.log(username)
            return viewingUsersPosts

        } catch (err) {
            return err
        }

    },

    viewLikes: async (args: {postID: string}) => {

        const {postID} = args

        try {

            const viewedPost = await Post.findOne({_id: postID}).populate('likes')

            return viewedPost
            
        } catch (err) {
            return err
        }

    },

    viewPostComments: async (args: {postID: string}) => {

        const {postID} = args

        try {

            const foundPost = await Post.findOne({_id: postID}).
            populate('comments').
            populate({
                path: 'comments',
                populate: 'commentBy'
            })

            return foundPost!.comments
            
        } catch (err) {
            return err
        }

    },

    viewUserByID: async (args: {userID: string}) => {

        const {userID} = args

        try {

            const foundUser = await User.findById(userID).
            populate('following').
            populate('followers')

            return foundUser
            
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

    },

    createComment: async (args: {postID: string, content: string, userID: string}) => {

        const {postID, content, userID} = args

        try {

            const newComment = new Comment({
                content,
                commentBy: userID,
                commentedOn: postID
            })

            await newComment.save()

            await Post.findOneAndUpdate({_id: postID}, {
                $addToSet: {
                    comments: newComment._id
                }
            })

            return 'You commented on this post. '
            
        } catch (err) {
            return err
        }

    },

    changePassword: async (args: {userID: string, newPass: string}) => {

        const {userID, newPass} = args

        try {

            const hashedPassword = await hash(newPass, 10)

            await User.findOneAndUpdate({_id: userID}, {
                password: hashedPassword
            })

            return 'Password Changed Successfully'
            
        } catch (err) {
            return err
        }

    },

    changeUsername: async (args: {userID: string, newUsername: string}) => {

        const {userID, newUsername} = args

        try {

            await User.findOneAndUpdate({_id: userID}, {
                username: newUsername
            })

            return 'Username Successfully Changed.  '
            
        } catch (err) {
            return err
        }

    }

}