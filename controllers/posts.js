const Post = require('../models/posts');
const { google } = require('googleapis');
const fs = require('fs');

const config = require('../config/config')

const folderName = "myContactsImages"; // Name of the folder in Google Drive


const oauth2Client = new google.auth.OAuth2(
  config.environmentVariables.CLIENT_ID,
  config.environmentVariables.CLIENT_SECRET,
  config.environmentVariables.REDIRECT_URI
);


// Set refresh token if available
if (config.environmentVariables.REFRESH_TOKEN) {
    oauth2Client.setCredentials({ refresh_token: config.environmentVariables.REFRESH_TOKEN });
}




exports.oauth2ClientController = (req, res, next) => {
    const { code } = req.query;
    if (code) {
      oauth2Client.getToken(code, (err, tokens) => {
        if (err) {
          console.error('Error getting access token:', err);
          res.status(500).send('Error getting access token');
          return;
        }
        oauth2Client.setCredentials(tokens);
        res.redirect(REDIRECT_URI);
      });
    }
  };


// Function to get or create folder
async function getOrCreateFolder(folderName) {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    try {
      const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        fields: 'files(id)',
      });
      if (response.data.files.length > 0) {
        return response.data.files[0].id; // Return the ID of the first matching folder
      } else {
        // Folder not found, create it
        const folderMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        };
        const res = await drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });
        return res.data.id;
      }
    } catch (error) {
      throw error;
    }
  }

exports.createPostDrive= async (req, res, next)=>{
    try {
        const folderId = await getOrCreateFolder(folderName);
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const fileMetadata = {
          name: req.file.originalname,
          parents: [folderId] // Specify the parent folder ID here
        };
        const media = {
          mimeType: req.file.mimetype,
          body: fs.createReadStream(req.file.path),
        };
        drive.files.create(
          {
            resource: fileMetadata,
            media: media,
            fields: 'id',
          },
          async (err, file) => {
            if (err) {
              console.error('Error uploading file:', err);
              res.status(500).send('Error uploading file');
              return;
            }
            const fileId = file.data.id;
            const fileUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
    
    
            
            // Prepare additional fields
            const additionalFields = {
              title: req.body.title,
              content: req.body.content,
              description: req.body.description,
              imagePath: fileUrl,
              creator: req.userData.userId
            };
    
            const post = new Post({
              ...additionalFields
          });
          post.save().then((result)=>{
              res.status(201).json({
                  message:"Post added Sucessfully!",
                  post : {
                      ...result,
                      id: result._id,
                      }
              })
          }).catch((err)=>{
              res.status(500).json({
                  message: 'Invalid details',
                  error: err
              })
          });
            
            // res.json({ message: 'File uploaded successfully', ...additionalFields });
          }
        );
      } catch (error) {
        console.error('Error handling folder:', error);
        res.status(500).send('Error handling folder');
      }
}

exports.editPostWithDriveUpload = async (req, res, next)=>{
    console.log("11111 from drive upload")

    try {
        const folderId = await getOrCreateFolder(folderName);
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const fileMetadata = {
          name: req.file.originalname,
          parents: [folderId] // Specify the parent folder ID here
        };
        const media = {
          mimeType: req.file.mimetype,
          body: fs.createReadStream(req.file.path),
        };
        drive.files.create(
          {
            resource: fileMetadata,
            media: media,
            fields: 'id',
          },
          async (err, file) => {
            if (err) {
              console.error('Error uploading file:', err);
              res.status(500).send('Error uploading file');
              return;
            }
            const fileId = file.data.id;
            const fileUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
    
    
            
            // Prepare additional fields
           
        //     const postEdit = new Post({
        //       ...additionalFields
        //   });

     

          
        
            const additionalFields = new Post({
                _id : req.body.id,
                title: req.body.title,
                content: req.body.content,
                description: req.body.description,
                imagePath: fileUrl,
                creator: req.userData.userId
            })
    
            // console.log(additionalFields, req.userData, req.params.id )

            Post.updateOne({ _id: req.params.id, creator: req.userData.userId  }, additionalFields).then((result)=>{
                // console.log(result,"result")
                  if(result.acknowledged){
                      res.status(200).json({
                          message: "Post updated sucessfully!!!!"
                      })
                  }else{
                      res.status(401).json({message: "This user is not entitled, creator of the post is only entitled to perform operations"})
                  }
              }).catch((error)=>{
                  res.status(500).json({
                      message: "Updating failed",
                      error: error
                  })
              })  
          

            
            // res.json({ message: 'File uploaded successfully', ...additionalFields });
          }
        );
      } catch (error) {
        console.error('Error handling folder:', error);
        res.status(500).send('Error handling folder');
      }


  
}

// exports.createPost = (req, res, next)=>{
//     const url = req.protocol + '://' + req.get('host');
//     const post = new Post({
//         title : req.body.title,
//         content : req.body.content,
//         description: req.body.description,
//         imagePath: url + "/images/" + req.file.filename,
//         creator: req.userData.userId
//     });
//     post.save().then((result)=>{
//         res.status(201).json({
//             message:"Post added Sucessfully!",
//             post : {
//                 ...result,
//                 id: result._id,
//                 }
//         })
//     }).catch((err)=>{
//         res.status(500).json({
//             message: 'Invalid details',
//             error: err
//         })
//     });
// };

// exports.editPost = (req, res, next)=>{
//     let imagePath =req.body.imagePath;
//     if(req.file){
//         const url = req.protocol + '://' + req.get('host');
//         imagePath = url + "/images/" + req.file.filename
//     }
//     const post = new Post({
//         _id : req.body.id,
//         title: req.body.title,
//         content: req.body.content,
//         description: req.body.description,
//         imagePath: imagePath,
//         creator: req.userData.userId
//     })

//     Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then((result)=>{
//         // console.log(result, 'update', req.params.id, post)
//         // console.log(result)
//         // if(result.modifiedCount)
//         // console.log(result)
//         if(result.acknowledged){
//             res.status(200).json({
//                 message: "Post updated sucessfully!"
//             })
//         }else{
//             res.status(401).json({message: "This user is not entitled, creator of the post is only entitled to perform operations"})
//         }
//     }).catch((error)=>{
//         res.status(500).json({
//             message: "Updating failed",
//             error: error
//         })
//     })  
// };

exports.getAllPosts = (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetcheedPosts;    
    if(pageSize && currentPage){
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.find().then((documents)=>{
        // console.log(document)
        fetcheedPosts = documents;
        return Post.count();
        }).then(count =>{
            console.log(count)
            res.status(200).json({
                message: "Posts fetched Sucessfully!",
                posts: fetcheedPosts,
                maxPosts: count
        })
    }).catch((error)=>{
        res.status(500).json({
            message: "Unable to Fetch data",
            error: error
        })
    })   
};

exports.getPost = (req, res, next)=>{
    Post.findById(req.params.id).then((postData)=>{
        if(postData){
            res.status(200).json(postData)
        }else{
            res.status(404).json({message: "Post not Found."})
        }
    }).catch((error)=>{
        res.status(500).json({
            message:"Unable to fetch",
            error: error
        })
    })
};

exports.deletePost = (req, res, next)=>{
    Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then((result)=>{
        // console.log(result)
        if(result.deletedCount){
            res.status(200).json({message: "Deleted Sucessfully!"})
        }else{
            res.status(401).json({ message: "This user is not entitled, creator of the post is only entitled to perform operations" })
        }
    }).catch((error)=>{
        res.status(500).json({
            message:"Unable to delete",
            error: error
        })
    })
}