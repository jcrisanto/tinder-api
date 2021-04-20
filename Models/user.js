//nanoid is for generating a random id
const { nanoid } = require("nanoid");
//bcrypt is a library for encrypting plain text, it's used to hash passwords
const bcrypt = require('bcrypt');
class User {
    constructor (firstName, lastName, age, gender, email, password) {
        this.id = nanoid();
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.gender = gender;
        this.email = email;
        this.password = bcrypt.hashSync(password, 5);
    }

    static fromDB(id, firstName, lastName, age, gender, email, password) {
        let user = new User(firstName, lastName, age, gender, email, password);

        user.id = id;
        user.password = password;
        return user;
    }
}

//Use of inheritence
class paidUser extends User {
    constructor (firstName, lastName, age, email, password, creditCard = 0, subscriptionType = 'MONTHLY') {
       super(firstName, lastName, age, email, password);
       this.creditCard = creditCard;
       this.subscriptionType = subscriptionType;
    }
    paySubscription(creditCard){
        if(this.subscriptionType === 'MONTHLY'){
            //send payment to system for $5
        }else if (this.subscriptionType === 'YEARLY'){
            //send payment to system for $60
        }
    }
}

module.exports = User;