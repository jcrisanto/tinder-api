const fs = require('fs');
const express = require("express");
const router = express.Router();
const user = require("../Models/user.js");
const { request } = require('http');

let usersTable = [];
loadChanges();
router.post('/register', function (req,res){ 
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let age = parseInt(req.body.age);
    let email = req.body.email;
    let password = req.body.password;
    let newUser = new user(firstName, lastName, age, email, password)
    const foundUser = usersTable.find((u) => u.email === newUser.email);
    if  (foundUser) {
        res.status(400).send("Email already in use, try with a different email");
        return;
    }
    usersTable.push(newUser);
    saveChanges();
    res.status(201).json(newUser);
});

router.get('/login', function (req, res) {
    const email = req.query.email;
    const password = req.query.password;
    const user = usersTable.find((u) => u.email === email && u.password === password);
    if (!user) {
        res.status(400).send("Incorrect username or password!");
        return;
    }
    res.status(200).send("You are logged in now!");
});

router.get("/", function (req, res) {
    const usersDTO = [...usersTable];
    usersDTO.forEach((u) => u.password = "n/a");
    res.status(200).send(usersTable);
});

router.get("/:id", function (req, res) {
    const foundUser = usersTable.find((u) => u.id === req.params.id);
    if  (foundUser) {
        let userDTO = {...foundUser};
        userDTO.password = "n/a";
        res.status(200).send(userDTO);
        return;
    }
    res.status(400).send("User was not found");
});

router.delete("/:id", function (req, res) {
    const foundIndex = usersTable.findIndex((u) => u.id === req.params.id);
    if (foundIndex === -1) {
        res.status(400).send("User was not found");
        return;
    }
    usersTable.splice(foundIndex, 1);
    saveChanges();
    res.status(200).send("User was deleted");
});

router.put("/", function (req, res) {
    const userFromRequest = req.body;
    let foundIndex = usersTable.findIndex((u) => u.id === userFromRequest.id);
    if (foundIndex !== -1) {
     usersTable[foundIndex] = userFromRequest;
        saveChanges();
        res.status(200).send("User was updated");
        return;
    }
    res.status(400).send("User was not found");
    console.log(req.body);
});

function saveChanges() {
    fs.writeFile("Database/users-table.json", JSON.stringify(usersTable, null, 2), (err) => { console.log(err) });
}

function loadChanges() {
    const data = fs.readFileSync("Database/users-table.json");
    usersTable = [...JSON.parse(data)];
}

module.exports = router;