const { nanoid } = require("nanoid");
class user {
    constructor (firstName, lastName, age, email, password) {
        this.id = nanoid();
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.email = email;
        this.password = password;
    }
    
}

module.exports = user;