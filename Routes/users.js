const fs = require('fs');
const express = require("express");
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());
const User = require("../Models/user.js");
const bcrypt = require("bcrypt");
const auth = require('../Services/auth');
const DB = require('../Azure DB/DB');


let usersTable = [];
loadChanges();

router.post('/register', async (req,res) => { 
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let age = parseInt(req.body.age);
    let gender = req.body.gender;
    let email = req.body.email;
    let password = req.body.password;
    let newUser = new User(firstName, lastName, age, gender, email, password);

    const foundUser = await DB.selectUserByEmail(newUser.email);

    if  (foundUser) {
        res.status(400).send("Email already in use, try with a different email");
        return;
    }
    const pushUser = await DB.insertUser(newUser);
    const userDto = {...newUser};
    delete userDto.password;
    res.status(201).json(userDto);
});

router.get('/login', async (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    const user = await DB.selectUserByEmail(email);
    if (!user) {
        res.status(400).send("Incorrect username or password!");
        return;
    }
    const passwordIsCorrect = bcrypt.compareSync(password, user.password);
    if (!passwordIsCorrect) {
        res.status(400).send("Incorrect username or password");
        return;
    }
    const token = auth.generateToken({id: user.id});
    res.status(200).send(token);
});

router.get("/", async (req, res) => {
    const foundUser = await DB.selectUserById(req.userId);
    if(!foundUser) {
        res.status(401).send({error: 'Unauthorized'});
        return;
    }
    const usersDTO = await DB.getAllUsers();
    usersDTO.forEach((u) => delete u.password);
    res.status(200).send(usersDTO);
});

router.get("/info", async (req, res) => {
    const foundUser = await DB.selectUserById(req.userId);
    if(!foundUser) {
        res.status(401).send({error: 'Unauthorized'});
        return;
    }
    delete foundUser.password;
    res.status(200).send(foundUser);
});

router.delete("/", async (req, res) => {
    const userWasDeleted = await DB.deleteUser(req.userId);
    if(!userWasDeleted) {
        res.status(400).send({error: 'User not deleted'});
        return;
    } else {
        res.status(200).send("User was deleted");
        return;
    }
});

router.put("/", async (req, res) => {
    const userFromRequest = req.body;
    const foundUserWithId = await DB.selectUserById(req.userId);
    if(!foundUserWithId) {
        res.status(401).send({error: 'Unauthorized'});
        return;
    }
    const foundUserWithEmail = await DB.selectUserByEmail(userFromRequest.email);
    if(foundUserWithEmail && foundUserWithEmail.id !== req.userId) {
        res.status(400).send('Email already taken, please use another email');
        return;
    }
    await DB.updateUser(userFromRequest);
    res.status(200).send('User was updated');
});

router.get("/random", (req, res) => {
    const userDTO = getRandomUser(req.userId, usersTable);
    if(!userDTO) {
        res.status(400).send("No match was found");
        return;
    }
    res.status(200).send(userDTO);
});

function saveChanges() {
    const fileExists = fs.existsSync("Database");
    if(!fileExists) {
        fs.mkdirSync("Database");
    }
    fs.writeFile("Database/users-table.json", JSON.stringify(usersTable, null, 2), (err) => { console.log(err) });
}

function loadChanges() {
    const fileExists = fs.existsSync("Database/users-table.json");
    if(!fileExists) {
        usersTable = [];
        return;
    }
    const data = fs.readFileSync("Database/users-table.json");
    usersTable = [...JSON.parse(data.toString())];
}

const getRandomUser = (reqUserId = "0", users = []) => {
    const foundUsers = users.filter(u => u.id !== reqUserId);
    if(foundUsers.length === 0) {
        return null;
    }
    const selectedUser = foundUsers[Math.floor(Math.random() * foundUsers.length)];
    let userDTO = {...selectedUser};
    userDTO.password = "n/a";
    return userDTO;
};

const userRouter = router;
module.exports = {getRandomUser, userRouter};