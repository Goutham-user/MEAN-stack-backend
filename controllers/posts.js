const Post = require('../models/posts');



exports.createPost = (req, res, next)=>{
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title : req.body.title,
        content : req.body.content,
        description: req.body.description,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    });
    // console.log(post);
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
};

exports.editPost = (req, res, next)=>{
    let imagePath =req.body.imagePath;
    if(req.file){
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
        _id : req.body.id,
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        imagePath: imagePath,
        creator: req.userData.userId
    })

    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then((result)=>{
        // console.log(result, 'update', req.params.id, post)
        // console.log(result)
        // if(result.modifiedCount)
        // console.log(result)
        if(result.acknowledged){
            res.status(200).json({
                message: "Post updated sucessfully!"
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
};

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