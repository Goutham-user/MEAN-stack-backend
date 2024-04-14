const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {type: String},
    content: {type: String},
    description: {type: String},
    imagePath: {type: String},
    creator: { type : mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});
// creator: { type : mongoose.Schema.Types.ObjectId, ref: "User", required: true }


module.exports = mongoose.model('Post', postSchema)

