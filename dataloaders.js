import { keyBy } from "lodash";
import Dataloader from "dataloader";

async function batchPosts(Post, postIds) {
  const posts = await Post.find({_id: {$in: postIds}}).toArray();
  return posts;
}

async function getCommentsUsingPostId(Comment, postId) {
  const comments = await Comment.find({postId: {$in: postId}}).toArray();
  return comments;
}

async function batchUsers(User, userIds) {
  // userIds = [ 1, 3, 5, 9 ...., 1, 1, 1]
  const users = await User.find({_id: {$in: userIds}}).toArray();
  const groupUsers= keyBy(users, '_id');
  // groupUsers = {1: { ...}, 3: {...}}
  return userIds.map(userId => groupUsers[userId] || {});
}

const buildDataLoaders = ({User, Post, Comment}) => ({
  userLoader: new Dataloader(
    id => batchUsers(User, id),
    {cachedkeyFn: id => id.toString()}
  ),
  postLoader: new Dataloader(
    id => batchPosts(Post, id),
    {cachedkeyFn: id => id.toString()}
  ),
  commentLoader: new Dataloader(
    postId => getCommentsUsingPostId(Comment, postId),
    {cachedkeyFn: postId => postId.toString()}
  )
})

export default buildDataLoaders;