import Dataloader from "dataloader";

async function batchPosts(Post, keys) {
  const posts = await Post.find({_id: {$in: keys}}).toArray();
}

async function getCommentsUsingPostId(Comment, postId) {
  const comments = await Comment.find({postId: {$in: postId}}).toArray();
  return comments;
}

const buildDataLoaders = ({Post, Comment}) => ({
  postLoader: new Dataloader(
    keys => batchPosts(Post, keys),
    {cachedkeyFn: key => key.toString()}
  ),
  commentLoader: new Dataloader(
    postId => getCommentsUsingPostId(Comment, postId),
    {cachedkeyFn: postId => postId.toString()}
  )
})

export default buildDataLoaders;