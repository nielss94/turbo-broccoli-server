const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = require('./comment.model');

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    page: {
        type: String,
        required: true
    },
    upCoins: {
        type: Number,
        default: 0
    },
    user: {
        type: String,
        required: true
    },
    comments: {
        type: [CommentSchema],
        default: []
    },
    tags: [String]
}, {
    timestamps: true
});


const Post = mongoose.model('post', PostSchema);

module.exports = Post;