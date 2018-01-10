var {User } = require('./../models/user');

var adminAuthenticate = (req, res, next) =>{
    var token = req.header('x-auth');
    console.log(token);

    User.findAdminByToken(token).then((user)=>{
        if(!user){
            return Promise.reject(); 
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        res.status(401).send();
    });
};

module.exports = {adminAuthenticate};