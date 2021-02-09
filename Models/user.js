//nanoid is for generating a random id
const { nanoid } = require("nanoid");
//bcrypt is a library for encrypting plain text, it's used to hash passwords
const bcrypt = require('bcrypt');
class user {
    constructor (firstName, lastName, age, email, password) {
        this.id = nanoid();
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.email = email;
        this.password = bcrypt.hashSync(password, 5);
    }
    
}

module.exports = user;