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

//Use of inheritence
class paidUser extends user {
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

module.exports = user;