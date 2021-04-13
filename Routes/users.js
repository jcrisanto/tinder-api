const fs = require('fs');
const express = require("express");
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());
const user = require("../Models/user.js");
const bcrypt = require("bcrypt");
const auth = require('../Services/auth');
const DB = require('../Azure DB/DB');


let usersTable = [];
loadChanges();

router.post('/register', async (req,res) => { 
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let age = parseInt(req.body.age);
    let email = req.body.email;
    let password = req.body.password;
    let newUser = new user(firstName, lastName, age, email, password);

    const foundUser = await DB.selectUserByEmail(newUser.email);

    if  (foundUser) {
        res.status(400).send("Email already in use, try with a different email");
        return;
    }
    const userDto = {...newUser};
    userDto.password = "n/a";
    res.status(201).json(userDto);
});

router.get('/login', function (req, res) {
    const email = req.query.email;
    const password = req.query.password;
    const user = usersTable.find((u) => u.email === email && bcrypt.compareSync(password, u.password));
        /*const user = usersTable.find((u) => 'marcushindsboel@gmail.com' === 'marcushindsboel@gmail.com' && bcrypt.compareSync('marcus123', 
    '$2b$05$JfGEAY6t6usnnMGS/7H7cOoMyOBsb/hD3oNm.ue5jrgZC07bowMOu')); */
    if (!user) {
        res.status(400).send("Incorrect username or password!");
        return;
    }
    const token = auth.generateToken({id: user.id});
    res.status(200).send(token);
});

router.get("/", function (req, res) {
    const usersDTO = [...usersTable];
    usersDTO.forEach((u) => u.password = "n/a");
    res.status(200).send(usersTable);
});

router.get("/info", function (req, res) {
    const foundUser = usersTable.find((u) => u.id === req.userId);
    if  (foundUser) {
        let userDTO = {...foundUser};
        userDTO.password = "n/a";
        res.status(200).send(userDTO);
        return;
    }
    res.status(401).send("Unauthorized");
});

router.delete("/", function (req, res) {
    const foundIndex = usersTable.findIndex((u) => u.id === req.userId);
    if (foundIndex === -1) {
        res.status(401).send("Unauthorized");
        return;
    }
    usersTable.splice(foundIndex, 1);
    saveChanges();
    res.status(200).send("User was deleted");
});

router.put("/", function (req, res) {
    const userFromRequest = req.body;
    let foundIndex = usersTable.findIndex((u) => u.id === req.userId);
    let anotherUserWithSameEmail = usersTable.find((u) => u.id !== req.userId && u.email === userFromRequest.email);
    if(anotherUserWithSameEmail) {
        res.status(400).send('Email already taken, please use another email');
        return;
    }
    if (foundIndex !== -1) {
        userFromRequest.id = req.userId;
        userFromRequest.password = usersTable[foundIndex].password;
     usersTable[foundIndex] = userFromRequest;
        saveChanges();
        res.status(200).send("User was updated");
        return;
    }
    res.status(400).send("User was not found");
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