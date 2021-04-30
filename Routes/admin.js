const express = require('express');
const router = express.Router();
const DB = require('../Azure DB/DB');
const User = require("../Models/user");


router.get('/matches', async (req, res) => {
    const matches = await DB.getAllMatches();
    const response = {count: matches.length, items: matches};
    res.status(200).send(response);
});


router.delete("/", async (req, res) => {
    const userWasDeleted = await DB.deleteUser(req.body.id);
    if(!userWasDeleted) {
        res.status(400).send({error: 'User not deleted'});
        return;
    }
    res.status(200).send("User was deleted");
});


router.get("/users", async (req, res) => {
    const usersDTO = await DB.getAllUsers();
    usersDTO.forEach((u) => delete u.password);
    const response = {count: usersDTO.length, items: usersDTO};
    res.status(200).send(response);
});

router.put("/", async (req, res) => {
    const currentUser = User.fromObject(req.body);
    const foundUserWithEmail = await DB.selectUserByEmail(currentUser.email);
    if(foundUserWithEmail && foundUserWithEmail.id !== req.userId) {
        res.status(400).send('Email already taken, please use another email');
        return;
    }
    await DB.updateUser(currentUser);
    res.status(200).send('User was updated');
});

module.exports = router;