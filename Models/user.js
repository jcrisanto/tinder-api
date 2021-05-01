//nanoid is for generating a random id
const { nanoid } = require("nanoid");
//bcrypt is a library for encrypting plain text, it's used to hash passwords
const bcrypt = require('bcrypt');
class User {
    constructor (firstName, lastName, age, gender, email, password, height, city, favouriteAnimal, favouriteColour, musicGenre, genderLimit, ageLimit) {
        this.id = nanoid();
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.gender = gender;
        this.email = email;
        this.password = bcrypt.hashSync(password, 5);
        this.isAdmin = false;
        this.height = height;
        this.city = city;
        this.favouriteAnimal = favouriteAnimal;
        this.favouriteColour = favouriteColour;
        this.musicGenre = musicGenre;
        this.genderLimit = genderLimit;
        this.ageLimit = ageLimit;
    }

    passwordIsCorrect(password){
        return bcrypt.compareSync(password, this.password);
    }

    static fromRequest(req) {
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let age = parseInt(req.body.age);
        let gender = req.body.gender;
        let email = req.body.email;
        let password = req.body.password;
        let height = req.body.height;
        let city = req.body.city;
        let favouriteAnimal = req.body.favouriteAnimal;
        let favouriteColour = req.body.favouriteColour;
        let musicGenre = req.body.musicGenre;
        let genderLimit = req.body.genderLimit;
        let ageLimit = req.body.ageLimit;
        return new User(firstName, lastName, age, gender, email, password, height, city, favouriteAnimal, favouriteColour, musicGenre, genderLimit, ageLimit);
    }

    static fromDB(id, firstName, lastName, age, gender, email, password, isAdmin, height, city, favouriteAnimal, favouriteColour, musicGenre, genderLimit, ageLimit) {
        let user = new User(firstName, lastName, age, gender, email, password, height, city, favouriteAnimal, favouriteColour, musicGenre, genderLimit.split(','), ageLimit.split(','));
        user.id = id;
        user.password = password;
        user.isAdmin = isAdmin;
        return user;
    }

    static fromObject(object) {
        let user = new User(object.firstName, object.lastName, object.age, object.gender, object.email, object.password, object.height, object.city, object.favouriteAnimal, object.favouriteColour, object.musicGenre, object.genderLimit, object.ageLimit);
        user.id = object.id;
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