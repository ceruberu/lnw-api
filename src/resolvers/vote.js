import { ObjectId } from "mongodb";
import { validateToken } from "../helpers/authHelper";

export default {
  Mutation: {
    addPostVote: async (_, { id, vote }, { mongo, req, res }) => {
      const user = await validateToken(mongo.User, req.cookies.token, res);

      const voteQuery = {
        postId: id,
        userId: ObjectId(user._id)
      };

      if (user) {
        const originalVote = await mongo.Vote.findOneAndUpdate(
          voteQuery,
          {
            $set: {
              ...voteQuery,
              vote
            }
          },
          {
            upsert: true
          }
        );
        
        let updateObject = {
          voteUpCount: 0,
          voteDownCount: 0
        };

        if (originalVote.value) {
          // Not the first time voting to this post
          if (originalVote.value.vote === 1) {
            updateObject.voteUpCount--;
            if (vote === -1) {
              updateObject.voteDownCount++;
            }
          } else if (originalVote.value.vote === -1) {
            updateObject.voteDownCount--;
            if (vote === 1) { 
              updateObject.voteUpCount++;
            }
          } else if (originalVote.value.vote === 0) {
            if (vote === 1){
              updateObject.voteUpCount++;
            } else if (vote === -1) {
              updateObject.voteDownCount++;
            }
          }
        } else {
          // First Time Voting to this post
          if (vote === 1) {
            updateObject.voteUpCount++;
          } else if (vote === -1) {
            updateObject.voteDownCount++;
          }
        }

        const updatePost = await mongo.Post.findOneAndUpdate(
          {
            _id: id
          },
          {
            $inc: updateObject
          },
          { returnOriginal: false }
        );

        updatePost.value.myVote = {
          vote
        };

        return updatePost.value;
      }
    },
    addCommentVote: async (_, { id, vote }, { mongo, res, req }) => {}
  }
};
