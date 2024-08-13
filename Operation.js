const { User, Post, Comment } = require('./models'); 

// Register User
async function registerUser(username, email, passwordHash, profilePicture, bio) {
  try {
    const user = new User({
      username,
      email,
      passwordHash,
      profilePicture,
      bio
    });
    await user.save();
    console.log('User registered:', user);
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

// Send Friend Request
async function sendFriendRequest(senderId, receiverId) {
  try {
    await User.updateOne(
      { _id: receiverId },
      { $addToSet: { 'friendRequests.incoming': senderId } }
    );
    await User.updateOne(
      { _id: senderId },
      { $addToSet: { 'friendRequests.outgoing': receiverId } }
    );
    console.log('Friend request sent');
  } catch (error) {
    console.error('Error sending friend request:', error);
  }
}

// Accept Friend Request
async function acceptFriendRequest(userId, friendId) {
  try {
    await User.updateOne(
      { _id: userId },
      { 
        $pull: { 'friendRequests.incoming': friendId },
        $addToSet: { friends: friendId }
      }
    );
    await User.updateOne(
      { _id: friendId },
      { 
        $pull: { 'friendRequests.outgoing': userId },
        $addToSet: { friends: userId }
      }
    );
    console.log('Friend request accepted');
  } catch (error) {
    console.error('Error accepting friend request:', error);
  }
}

// Reject Friend Request
async function rejectFriendRequest(userId, friendId) {
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { 'friendRequests.incoming': friendId } }
    );
    await User.updateOne(
      { _id: friendId },
      { $pull: { 'friendRequests.outgoing': userId } }
    );
    console.log('Friend request rejected');
  } catch (error) {
    console.error('Error rejecting friend request:', error);
  }
}

// Create Post
async function createPost(userId, content) {
  try {
    const post = new Post({
      userId,
      content
    });
    await post.save();
    console.log('Post created:', post);
  } catch (error) {
    console.error('Error creating post:', error);
  }
}

// Add Comment to Post
async function addComment(postId, userId, commentText) {
  try {
    await Post.updateOne(
      { _id: postId },
      { $push: { comments: { userId, comment: commentText } } }
    );
    console.log('Comment added');
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}

module.exports = { registerUser, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, createPost, addComment };
