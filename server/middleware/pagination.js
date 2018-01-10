
const pagination = (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    num = 10;
    req.skip = num * (page - 1);
    req.limit = num * page;
    next();
};

module.exports = {pagination};

