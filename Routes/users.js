const fs = require('fs');
const express = require("express");
const router = express.Router();
const user = require("../Models/user.js");
const bcrypt = require("bcrypt");
const auth = require('../Services/auth');
const DB = require('..Azure DB/DB.js')

let usersTable = [];
loadChanges();

router.post('/register', function (req,res){ 
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let age = parseInt(req.body.age);
    let email = req.body.email;
    let password = req.body.password;
    let newUser = new user(firstName, lastName, age, email, password)
    //const foundUser = usersTable.find((u) => u.email === newUser.email);
    function selectUserById(id){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT users_id FROM [users].[id] WHERE id = @id'
            const request = new Request(sql, (err, rowcount) => {
                if (err){
                    reject(err)
                    console.log(err)
                } else if (rowcount == 0) {
                    reject({message: 'User does not exist'})
                }
            });
            request.addParameter('id', TYPES.int, id);

            request.on('row', (columns) =>{
                resolve(columns)
            });
        })
    }

    module.exports.selectUserById = selectUserById;

    if  (foundUser) {
        res.status(400).send("Email already in use, try with a different email");
        return;
    }
    function insertUser(user){
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO [users].[users] (firstName, lastName, email, gender) VALUES (@name, @email, @gender)'
            const request = new Request(sql, (err) => {
                if (err){
                    reject(err)
                    console.log(err)
                }
            });
            request.addParameter('name', TYPES.VarChar, user.name)
            request.addParameter('email', TYPES.VarChar, user.email)
            request.addParameter('gender', TYPES.VarChar, user.gender)
    
            request.on('requestCompleted', (row) => {
                console.log('User inserted', row);
                resolve('user inserted', row)
            });
            connection.execSql(request)
        });
    }
    module.exports.insertUser = insertUser;

    /*usersTable.push(newUser);
    saveChanges();
    const userDto = {...newUser};
    userDto.password = "n/a";
    res.status(201).json(userDto);*/
});

router.get('/login', function (req, res) {
    const email = req.query.email;
    const password = req.query.password;
    const user = usersTable.find((u) => u.email === email && bcrypt.compareSync(password, u.password));
        /*const user = usersTable.find((u) => 'jcrisanto0@gmail.com' === 'jcrisanto0@gmail.com' && bcrypt.compareSync('jorge123', 
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