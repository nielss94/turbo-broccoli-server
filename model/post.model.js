const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    pageId: {
        type: Number,
        required: true
    },
    upCoins: {
        type: Number,
        default: 0
    },
    downCoins: {
        type: Number,
        default: 0
    },
    user: {
        type: String,
        required: true
    },
    tags: [String]
}, {
    timestamps: true
});


const Post = mongoose.model('post', PostSchema);

module.exports = Post;