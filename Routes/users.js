const express = require('express');
const router = express.Router();
const User = require("../Models/user.js");
const auth = require('../Services/auth');
const DB = require('../Azure DB/DB');

router.post('/register', async (req,res) => {
    let newUser = User.fromRequest(req);
    const foundUser = await DB.selectUserByEmail(newUser.email);

    if  (foundUser) {
        res.status(400).send("Email already in use, try with a different email");
        return;
    }
    await DB.insertUser(newUser);
    delete newUser.password;
    res.status(201).send(newUser);
});

router.get('/login', async (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    const user = await DB.selectUserByEmail(email);
    if (!user || !user.passwordIsCorrect(password)) {
        res.status(400).send("Incorrect username or password!");
        return;
    }
    const token = auth.generateToken({id: user.id});
    res.status(200).send(token);
});


router.get("/info", async (req, res) => {
    const foundUser = await DB.selectUserById(req.userId);
    delete foundUser.password;
    res.status(200).send(foundUser);
});

router.delete("/", async (req, res) => {
    const userWasDeleted = await DB.deleteUser(req.userId);
    if(!userWasDeleted) {
        res.status(400).send({error: 'User not deleted'});
        return;
    }
    res.status(200).send("User was deleted");
});

router.put("/", async (req, res) => {
    const currentUser = User.fromObject(req.body);
    if(currentUser.id !== req.userId) {
        res.status(401).send({error: 'Unauthorized'});
        return;
    }
    const foundUserWithEmail = await DB.selectUserByEmail(currentUser.email);
    if(foundUserWithEmail && foundUserWithEmail.id !== req.userId) {
        res.status(400).send('Email already taken, please use another email');
        return;
    }
    await DB.updateUser(currentUser);
    res.status(200).send('User was updated');
});

router.get("/random", async (req, res) => {
    const allUsers = await DB.getAllUsers();
    const userDTO = getRandomUser(req.userId, allUsers);
    if(!userDTO) {
        res.status(400).send("No match was found");
        return;
    }
    res.status(200).send(userDTO);
});

const getRandomUser = (reqUserId, users) => {
    const foundUsers = users.filter(u => u.id !== reqUserId);
    if(foundUsers.length === 0) {
        return null;
    }
    const userDTO = foundUsers[Math.floor(Math.random() * foundUsers.length)];
    delete userDTO.password;
    return userDTO;
};


const userRouter = router;
module.exports = {getRandomUser, userRouter};