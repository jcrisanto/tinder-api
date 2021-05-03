//nanoid is for generating a random id
const { nanoid } = require("nanoid");
//bcrypt is a library for encrypting plain text, it's used to hash passwords
const bcrypt = require('bcrypt');
class User {
    constructor (firstName, lastName, age, gender, email, password, height, city, favouriteAnimals, favouriteColours, musicGenres, genderLimits, ageLimits) {
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
        this.favouriteAnimals = favouriteAnimals;
        this.favouriteColours = favouriteColours;
        this.musicGenres = musicGenres;
        this.genderLimits = genderLimits;
        this.ageLimits = ageLimits;
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
        let favouriteAnimals = req.body.favouriteAnimals;
        let favouriteColours = req.body.favouriteColours;
        let musicGenres = req.body.musicGenres;
        let genderLimits = req.body.genderLimits;
        let ageLimits = req.body.ageLimits;
        return new User(firstName, lastName, age, gender, email, password, height, city, favouriteAnimals, favouriteColours, musicGenres, genderLimits, ageLimits);
    }

    static fromDB(id, firstName, lastName, age, gender, email, password, isAdmin, height, city, favouriteAnimals, favouriteColours, musicGenres, genderLimits, ageLimits) {
        let user = new User(firstName, lastName, age, gender, email, password, height, city, favouriteAnimals.split(','), favouriteColours.split(','), musicGenres.split(','), genderLimits.split(','), ageLimits.split(',').map(x => parseInt(x)));
        user.id = id;
        user.password = password;
        user.isAdmin = isAdmin;
        return user;
    }

    static fromObject(object) {
        let user = new User(object.firstName, object.lastName, object.age, object.gender, object.email, object.password, object.height, object.city, object.favouriteAnimals, object.favouriteColours, object.musicGenres, object.genderLimits, object.ageLimits);
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