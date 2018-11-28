import { ObjectId } from 'mongodb';
import { validateToken } from '../helpers/authHelper';

export default {
  Query: {
    
    post: async (_, { input }, { mongo, req, res, loaders }) => {

      // const User = db.collection('users');
      // return validateToken(User, req.cookies.token, res)
      // const Post = db.collection('posts');
      
      // const post = await Post.findOne({
        // _id: ObjectId(input.id)
      // });
    },
    postFeed: async (_, { limit, skip, filter }, { mongo, req, res, loaders}) => {
      const postFeed = await mongo.Post.find().limit(limit).skip(skip).toArray();
      return postFeed;
    }
  },
  Post: {
    author: async ({authorId}, args, { loaders }) => 
      loaders.userLoader.load(authorId)
    ,
    comments: async (_, args, context) => {
      // console.log("POST_COMMENTS::_",_);
      // console.log("POST_COMMENTS::args",args);
      // console.log("POST_COMMENTS::context",context);
    }
    

  },
  User: {
    _id: ({_id}) => _id,
    nickname: ({nickname}) => nickname
  },
  Mutation: {
    addPost: async (_, { input }, { mongo, req, res }) => {

      const user = await validateToken(mongo.User, req.cookies.token, res);

      if (user) {
        const newPost = await mongo.Post.insertOne({
          ...input,
          authorId: user._id,
          createdAt: Date.now()
        });

        return {
          _id: newPost.ops[0]._id.toString()
        }
      }
    }
  }
};