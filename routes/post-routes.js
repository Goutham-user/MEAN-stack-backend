const express = require('express');
const PostController  = require('../controllers/posts');

const route = express.Router();
const checkAuth = require('../middlewares/check-auth');
const ExtractFile = require('../middlewares/file')






route.post("", checkAuth, ExtractFile, PostController.createPost);

route.put("/:id", checkAuth, ExtractFile, PostController.editPost)

route.get("", PostController.getAllPosts);

route.get("/:id", PostController.getPost)

route.delete("/:id", checkAuth, PostController.deletePost)





module.exports = route;