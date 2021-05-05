const express = require('express');
const router = express.Router();
const User = require("../Models/user.js");
const auth = require('../Services/auth');
const DB = require('../Azure DB/DB');

router.post('/register', async (req, res) => {
    let newUser = User.fromRequest(req);
    const foundUser = await DB.selectUserByEmail(newUser.email);

    if (foundUser) {
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
    if (!userWasDeleted) {
        res.status(400).send({error: 'User not deleted'});
        return;
    }
    res.status(200).send("User was deleted");
});

router.put("/", async (req, res) => {
    const currentUser = User.fromObject(req.body);
    // if (currentUser.id !== req.userId) {
    //     res.status(401).send({error: 'Unauthorized'});
    //     return;
    // }
    const foundUserWithEmail = await DB.selectUserByEmail(currentUser.email);
    if (foundUserWithEmail && foundUserWithEmail.id !== req.userId) {
        res.status(400).send('Email already taken, please use another email');
        return;
    }
    await DB.updateUser(currentUser);
    res.status(200).send('User was updated');
});

router.get("/random", async (req, res) => {
    const allUsers = await DB.getAllUsers();
    const userDTO = getRandomUser(req.userId, allUsers);
    if (!userDTO) {
        res.status(400).send("No match was found");
        return;
    }
    res.status(200).send(userDTO);
});

const getRandomUser = (reqUserId, users) => {
    const myUser = users.find(u => u.id === reqUserId);

    const filteredUsers = users
        .filter(u => u.id !== myUser.id)
        .filter(u => u.city === myUser.city)
        .filter(u => myUser.genderLimits.includes(u.gender) && u.genderLimits.includes(myUser.gender))
        .filter(u => isInRange(u.age, myUser.ageLimits) && isInRange(myUser.age, u.ageLimits))
        .filter(u => u.favouriteAnimals.some(x => myUser.favouriteAnimals.includes(x))
            || u.favouriteColours.some(x => myUser.favouriteColours.includes(x))
            || u.musicGenres.some(x => myUser.musicGenres.includes(x)));


    if (filteredUsers.length === 0) {
        return null;
    }
    const userDTO = filteredUsers[Math.floor(Math.random() * filteredUsers.length)];
    delete userDTO.password;
    return userDTO;
};

const isInRange = (number, arr) => {
    if (arr.length !== 2) throw new Error('array must have  a length of two');
    return number >= arr[0] && number <= arr[1];
}


const userRouter = router;
module.exports = {getRandomUser, userRouter};