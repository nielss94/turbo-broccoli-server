const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    postId: {
        type: String,
        default: '-'
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
    }
}, {
    timestamps: true
});


module.exports = CommentSchema;