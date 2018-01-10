const mongoose = require('mongoose');

const Author = mongoose.model('Author', {
    name:{
        type: String,
        required: true,
        minlength: 1
    },
    dateOfBirth:{
        type: String
    },
    dateOfDeath:{
        type: String
    }
});

module.exports = { Author };
