const express = require('express');
const PostController  = require('../controllers/posts');

const route = express.Router();
const checkAuth = require('../middlewares/check-auth');
const googleApiCheckAuth = require('../middlewares/google-drive-check-auth')

const ExtractFile = require('../middlewares/file');
const router = require('./user');
const multer = require('multer');

const upload = multer({ dest: 'uploads/mycontacts' });




// route.post("/test", checkAuth, ExtractFile, PostController.createPost); // placed /test to test drive upload in app.js, it was '' before changing to /test

// route.put("/:id", checkAuth, ExtractFile, PostController.editPost);

route.get("/oauth2callback", PostController.oauth2ClientController);

route.post("/", checkAuth, googleApiCheckAuth, upload.single('image'), PostController.createPostDrive);

route.put("/:id", checkAuth, googleApiCheckAuth, upload.single('image'), PostController.editPostWithDriveUpload)

route.get("", PostController.getAllPosts);

route.get("/:id", PostController.getPost)

route.delete("/:id", checkAuth, PostController.deletePost)




module.exports = route;