const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    subject:{
        type: String,
        minlength: 1,
        required: true
    },
    language:{
        type: String,
        required: true,
        minlength: 1
    },
    numOfPages:{
        type: Number,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    publisher:{
        type: String,
        minlength: 1,
        trim: true
    },
    publicationDate:{
        type: String
    },  
    numberOfBooks:{
        type: Number,
        required: true,
        default: 1
    },
    _author:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    }
});

const Book = mongoose.model('Book',BookSchema );

module.exports = { Book };
