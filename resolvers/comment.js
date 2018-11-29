import { ObjectId } from 'mongodb';
import { validateToken } from '../helpers/authHelper';

export default {
  Query: {
    comments: async (_, { postId }, { mongo }) => {
      const comments = await mongo.Comment.find({postId}).toArray();
      return comments;
    }
  },
  Comment: {
    author: ({authorId}, args, { loaders }) => 
      loaders.userLoader.load(authorId)
  },
  Mutation: {
    addComment: async (_, { postId, content }, { req, res, mongo }) => {
      const user = await validateToken(mongo.User, req.cookies.token, res);

      if (user) {
        const newComment = await mongo.Comment.insertOne({
          postId,
          content,
          authorId: ObjectId(user._id),
          createdAt: Date.now()
        });

        return newComment.ops[0];
      }
    }
    // addPost: async (_, { type, title, content }, { mongo, req, res }) => {

      // const user = await validateToken(mongo.User, req.cookies.token, res);

    //   if (user) {
    //     const newPost = await mongo.Post.insertOne({
    //       type,
    //       title,
    //       content,
    //       authorId: ObjectId(user._id),
    //       createdAt: Date.now()
    //     });

    //     return {
    //       _id: newPost.ops[0]._id.toString()
    //     }
    //   }
    // }
  }
};