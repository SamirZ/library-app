const express = require('express');
const _ = require('lodash');
const router = express.Router();
const { ObjectID } = require('mongodb');

const mongoose = require('./../db/mongoose');
const { authenticate } = require('./../middleware/authenticate');
const { adminAuthenticate } = require('./../middleware/adminAuthenticate');
const { pagination } = require('./../middleware/pagination');
const { Book } = require('./../models/book');
const { Author } = require('./../models/author');

/*           *
 *  ADMIN    *
 *           */
router.post('/books', adminAuthenticate, (req, res)=>{

    const body = _.pick(req.body, ['title','subject','language','numOfPages','imageUrl','publisher','publicationDate','numberOfBooks','_author']);
    const book = new Book(body);
    // Check if author exists -->
    const id = body._author;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Author.findById(id).then((author)=>{
        if(!author)
            return res.status(404).send();

        book.save().then((doc)=>{
            res.send(doc);
        },(e)=>{
            res.status(400).send(e);
        });
    }).catch((e)=>{
        res.status(400).send();
    });
    // <--end
});

router.delete('/books/:id', adminAuthenticate, (req, res)=>{
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Book.findOneAndRemove({
        _id: id
    }).then((book)=>{
        if(!book)
            return res.status(404).send();
    
        res.send({book});
    }).catch((e)=>{
        res.status(400).send();
    });

});

/*           *
 *   AUTH    *
 *           */

// Lending books
router.patch('/books/lend/:id', authenticate, (req, res)=>{
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Book.findById(id).then((bookInDB)=>{
        if(!bookInDB){
            res.status(404).send();
        }
        if(bookInDB.numberOfBooks === 0){
            res.status(400).send('No more books');
        }

        Book.findOneAndUpdate(
            { _id: id }, 
            { $inc: { numberOfBooks: -1 }},
            { new: true }
        ).then((todo)=>{
            if(!todo){
                return res.status(404).send();
            }
            res.send({todo});
        }).catch((e)=>{
            res.status(400).send();
        });
    }).catch((e)=>{
        res.status(400).send();
    });
});

//Returning books
router.patch('/books/return/:id', authenticate, (req, res)=>{
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Book.findById(id).then((bookInDB)=>{
        if(!bookInDB){
            res.status(404).send();
        }
        if(bookInDB.numberOfBooks === 0){
            res.status(400).send('No more books');
        }

        Book.findOneAndUpdate(
            { _id: id }, 
            { $inc: { numberOfBooks: 1 }},
            { new: true }
        ).then((todo)=>{
            if(!todo){
                return res.status(404).send();
            }
            res.send({todo});
        }).catch((e)=>{
            res.status(400).send();
        });
    }).catch((e)=>{
        res.status(400).send();
    });
});

/*           *
 * ALL USERS *
 *           */
router.get('/books', pagination, (req, res)=>{

    Book.find({}).skip(req.skip).limit(req.limit).then((books)=>{
        res.send( { books } );
    },(e)=>{
        res.status(400).send(e);
    });
});

router.get('/books/:id', (req, res)=>{
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Book.findOne({
        _id: id
    }).then((book)=>{
        if(!book)
            return res.status(404).send();
        
        res.send({book});
    }).catch((e)=>{
        res.status(400).send();
    });

});

module.exports = router;