const express = require('express');
const { User, Post } = require('./models'); 
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/',async(req,res)=>{
    res.json('Home page')
})

app.get('/feed', async (req, res) => {
  const { userId } = req.query;

  try {
   
    const user = await User.findById(userId).populate('friends');
    const friends = user.friends.map(friend => friend._id);

    const friendPosts = await Post.find({ userId: { $in: friends } });

    
    const friendCommentedPosts = await Post.find({
      'comments.userId': { $in: friends }
    });

    // Combine and deduplicate posts
    const posts = [...friendPosts, ...friendCommentedPosts];
    const uniquePosts = Array.from(new Set(posts.map(post => post._id)))
                              .map(id => {
                                return posts.find(post => post._id.equals(id));
                              });

    res.json(uniquePosts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/posts', async (req, res) => {
    const { userId, content, image } = req.body;
  
    try {
      const post = new Post({
        userId,
        content,
        image
      });
  
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/comments', async (req, res) => {
    const { postId, userId, comment } = req.body;
  
    try {
      const post = await Post.findById(postId);
      post.comments.push({ userId, comment });
      await post.save();
      
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/posts/user/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const posts = await Post.find({ userId });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
  
    try {
      const post = await Post.findById(postId);
      res.json(post.comments);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
//listening to port
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((err)=>console.log(err)
    );
