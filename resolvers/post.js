import { ObjectId } from 'mongodb';
import { validateToken } from '../helpers/authHelper';

export default {
  Query: {
    post: async (_, { _id }, { mongo }) => {
      const post = await mongo.Post.findOne({_id});
      return post;
    },
    postFeed: async (_, { limit, skip, filter }, { mongo }) => {
      const postFeed = await mongo.Post.find().limit(limit).skip(skip).toArray();
      return postFeed;
    }
  },
  Post: {
    author: ({authorId}, args, { loaders }) => 
      loaders.userLoader.load(authorId)
  },
  Mutation: {
    addPost: async (_, { type, title, content }, { mongo, req, res }) => {

      const user = await validateToken(mongo.User, req.cookies.token, res);

      if (user) {
        const newPost = await mongo.Post.insertOne({
          type,
          title,
          content,
          authorId: ObjectId(user._id),
          createdAt: Date.now()
        });

        return {
          _id: newPost.ops[0]._id.toString()
        }
      }
    }
  }
};