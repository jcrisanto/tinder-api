const {sign, verify} = require("jsonwebtoken");
const DB = require('../Azure DB/DB');


exports.generateToken = payload => sign(payload, 'm-a-r-c-u-s-0-0');

exports.authenticate = (req, res, next) => {
    if(req.originalUrl.includes('/users/login') || req.originalUrl.includes('/users/register')) {
        next();
        return;
    }

    if(!req.headers.authorization){
        res.status(401).send({error: 'Unauthorized'});
        return;
    }

    const token = req.headers.authorization.replace('Bearer ', '');
    verify(token, 'm-a-r-c-u-s-0-0', async (err, decoded) => {
        if(err) {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }
        req.userId = decoded.id;

        const foundUser = await DB.selectUserById(req.userId);
        if(!foundUser) {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }
        next();
    });
}

exports.adminAuthorize = async (req, res, next) => {
    const foundUser = await DB.selectUserById(req.userId);
    if(!foundUser || !foundUser.isAdmin) {
        res.status(401).send({error: 'Unauthorized'});
        return;
    }
    next();
}