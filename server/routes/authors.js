const express = require('express');
const _ = require('lodash');
const router = express.Router();
const { ObjectID } = require('mongodb');

const mongoose = require('./../db/mongoose');
const { pagination } = require('../middleware/pagination');
const { adminAuthenticate } = require('./../middleware/adminAuthenticate');
const { Author } = require('./../models/author');

/*           *
 *  ADMIN    *
 *           */
router.post('/author', adminAuthenticate, (req, res)=>{

    const body = _.pick(req.body, ['name','dateOfBirth','dateOfDeath']);
    const author = new Author(body);

    author.save().then((doc)=>{
        res.send(doc);
    },(e)=>{
        res.status(400).send(e);
    });
});

router.patch('/author/:id', adminAuthenticate, (req, res)=>{
    const id = req.params.id;
    const body = _.pick(req.body, ['name','dateOfBirth','dateOfDeath']);

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Author.findOneAndUpdate({
        _id: id
    }, {$set: body}, {new: true} ).then((todo)=>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e)=>{
        res.status(400).send();
    });
});

router.delete('/author/:id', adminAuthenticate, (req, res)=>{
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Author.findOneAndRemove({
        _id: id
    }).then((author)=>{
        if(!author)
            return res.status(404).send();
    
        res.send({author});
    }).catch((e)=>{
        res.status(400).send();
    });
});

/*           *
 * ALL USERS *
 *           */
router.get('/author', pagination, (req, res)=>{

    Author.find({}).skip(req.skip).limit(req.limit).then((author)=>{
        res.send( { author } );
    },(e)=>{
        res.status(400).send(e);
    });
});

router.get('/author/:id', (req, res)=>{
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Author.findOne({
        _id: id
    }).then((author)=>{
        if(!author)
            return res.status(404).send();
        
        res.send({author});
    }).catch((e)=>{
        res.status(400).send();
    });
});

module.exports = router;