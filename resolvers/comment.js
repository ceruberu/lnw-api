import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'apollo-server-express';
import { ObjectId } from 'mongodb';
import { validateToken } from '../helpers/authHelper';

const pubsub = new PubSub();

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
        
        // Publish to the pubsub channel;
        pubsub.publish('commentAdded', { commentAdded: newComment.ops[0], postId: postId});
        return newComment.ops[0];
      }
    }
  },
  Subscription: {
    commentAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('commentAdded'),(payload, variables) => {
        return payload.commentAdded.postId.toString() === variables.postId.toString();
      })
    }
  }
};