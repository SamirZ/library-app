const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE is not a valid email}'
        }
    },
    password:{
        type: String,
        require: true,
        minlength: 6
    },
    name:{
        type: String,
        minlength: 1,
        trim: true
    },
    address:{
        type: String,
        require: true
    },
    phoneNumber:{
        type: String,
        require: true,
        minlength: 6
    },
    admin:{
        type: Boolean,
        default: false
    },
    tokens: [{
        access:{
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }]
});

UserSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject,['_id','email','name','address','phoneNumber']);
};

UserSchema.methods.generateAuthToken = function(){
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    user.tokens.push({access,token});

    return user.save().then(()=>{return token;});
};

UserSchema.statics.findByToken = function(token){
    const User = this;
    let decoded;

    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(e){
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findAdminByToken = function(token){
    const User = this;
    let decoded;

    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(e){
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'admin': true,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password){
    const User = this;

    // Timing attack
    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }

        return new Promise((resolve ,reject )=>{
            bcrypt.compare(password, user.password, (err, res)=>{
                if(res){
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

UserSchema.statics.findAdminByCredentials = function (email, password){
    const User = this;

    // Timing attack
    return User.findOne({email,'admin':true}).then((user)=>{
        if(!user){
            return Promise.reject();
        }

        return new Promise((resolve ,reject )=>{
            bcrypt.compare(password, user.password, (err, res)=>{
                if(res){
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

UserSchema.methods.removeToken = function (token){
    var user = this;

    return user.update({
        $pull: {
            tokens: { token }
        }
    });
};

UserSchema.pre('save', function(next){
    const user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(user.password,salt,(err, hash)=>{
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

const User = mongoose.model('User',UserSchema );

module.exports = { User };
