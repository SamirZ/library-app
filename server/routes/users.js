const express = require('express');
const _ = require('lodash');
const router = express.Router();
const { ObjectID } = require('mongodb');

const mongoose = require('./../db/mongoose');
const { authenticate } = require('./../middleware/authenticate');
const { adminAuthenticate } = require('./../middleware/adminAuthenticate');
const { User } = require('./../models/user');

// Register
router.post('/users',(req, res)=>{
    var body = _.pick(req.body, ['email','password','name','address','phoneNumber']);
    var user = new User(body);

    user.save().then((user)=>{
        return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth',token).send(user);
    }).catch((e)=>{
        res.status(400).send(e);
    });
});

// TODO: Register Admin
// >>>>>>>>>>>>>>>>>>>> Nodemailer

router.get('/user',authenticate, (req, res)=>{
    res.send(req.user);
});

router.get('/admin',adminAuthenticate, (req, res)=>{
    res.send(req.user);
});

router.post('/users/login',(req, res)=>{
    var body = _.pick(req.body, ['email','password']);

    User.findByCredentials(body.email,body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user);
        });
    }).catch((e)=>{
        res.status(400).send();
    });
});

router.post('/admin/login',(req, res)=>{
    var body = _.pick(req.body, ['email','password']);

    User.findAdminByCredentials(body.email,body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user);
        });
    }).catch((e)=>{
        res.status(400).send();
    });
});

router.delete('/users/me/token',authenticate, (req, res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    });
});

module.exports = router;