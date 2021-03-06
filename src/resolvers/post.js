import { ObjectId } from "mongodb";
import { validateToken } from "../helpers/authHelper";

const filters = {
  "newest" : {
    createdAt: -1
  }
};

export default {
  Query: {
    post: async (_, { _id }, { mongo }) => {
      const post = await mongo.Post.findOne({ _id });
      return post;
    },
    postFeed: async (_, { limit, skip, filter, type }, { mongo }) => {
    
    filter = filter || "newest";
    const sorter = filters[filter] || filters.newest;
    
    const finder = {};
    type = type || false;
    if(type) finder.type = type;


      const postFeed = await mongo.Post
        .find(finder)
        .limit(limit)
        .skip(skip)
        .sort(filters[filter])
        .toArray();
      return postFeed;
    }
  },
  Post: {
    author: ({ authorId }, args, { loaders }) =>
      loaders.userLoader.load(authorId),
    myVote: async ({ _id }, args, { mongo, req, res }) => {
      // user is not logged in
      if (!req.cookies.token) return { vote: 0 };

      const user = await validateToken(mongo.User, req.cookies.token, res);

      if (user) {
        const myVote = await mongo.Vote.findOne({
          userId: ObjectId(user._id),
          postId: _id
        });

        if (myVote) return myVote;
      }

      return { vote: 0 };
    }
  },
  Mutation: {
    addPost: async (_, { type, title, content }, { mongo, req, res }) => {
      const user = await validateToken(mongo.User, req.cookies.token, res);

      if (user) {
        const newPost = await mongo.Post.insertOne({
          type,
          title,
          content,
          voteUpCount: 0,
          voteDownCount: 0,
          authorId: ObjectId(user._id),
          createdAt: Date.now()
        });

        return {
          _id: newPost.ops[0]._id.toString()
        };
      }
    }
  }
};
