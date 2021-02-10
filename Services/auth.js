const {sign, verify} = require("jsonwebtoken");

exports.generateToken = payload => sign(payload, 'm-a-r-c-u-s-0-0');

exports.authorize = (req, res, next) => {
    if(req.originalUrl.includes('/users/login') || req.originalUrl.includes('/users/register')) {
        next();
        return;
    }

    if(!req.headers.authorization){
        res.status(401).send({error: 'Unauthorized'});
        return;
    }

    const token = req.headers.authorization.replace('Bearer ', '');
    verify(token, 'm-a-r-c-u-s-0-0', function(err, decoded) {
        if(err) {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }
        req.userId = decoded.id;
        next();
    });
}