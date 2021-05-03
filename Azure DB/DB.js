const { Connection, Request, TYPES} = require('tedious');
const config = require('./config.json')
const User = require('../Models/user')
const Match = require("../Models/match");

var connection = new Connection(config)

function startDb(){
    return new Promise((resolve, reject) => {
        connection.on('connect', (err) => {
            if (err) {
                console.log("Connection failed")
                reject(err)
                throw err;
            } else {
                console.log("Connected")
                resolve();
            }
        })
        connection.connect();
    })
}

startDb();

function selectUserById(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = @id'
        let user = null;
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount == 0) {
                resolve(user);
            }
        });
        request.addParameter('id', TYPES.VarChar, id);

        request.on('row', (columns) => {

            var rowObject = {};
            columns.forEach(function(column) {
                rowObject[column.metadata.colName] = column.value;
            });

            user = User.fromDB(rowObject.id, rowObject.firstName, rowObject.lastName, rowObject.age, rowObject.gender, rowObject.email, rowObject.password, rowObject.isAdmin, rowObject.height, rowObject.city, rowObject.favouriteAnimals, rowObject.favouriteColours, rowObject.musicGenres, rowObject.genderLimits, rowObject.ageLimits);
        });

        request.on('requestCompleted', () => {
            resolve(user);
        });

        connection.execSql(request);
    });
}
module.exports.selectUserById = selectUserById;

function selectUserByEmail(email){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = @email';
        let user = null;
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount == 0) {
                resolve(user);
            }
        });
        request.addParameter('email', TYPES.VarChar, email);

        request.on('row', (columns) => {

            var rowObject = {};
            columns.forEach(function(column) {
                rowObject[column.metadata.colName] = column.value;
            });

            user = User.fromDB(rowObject.id, rowObject.firstName, rowObject.lastName, rowObject.age, rowObject.gender, rowObject.email, rowObject.password, rowObject.isAdmin, rowObject.height, rowObject.city, rowObject.favouriteAnimals, rowObject.favouriteColours, rowObject.musicGenres, rowObject.genderLimits, rowObject.ageLimits);
        });

        request.on('requestCompleted', () => {
            resolve(user);
        });
        connection.execSql(request);
    });
}
exports.selectUserByEmail = selectUserByEmail;

function insertUser(user){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (id, firstName, lastName, age, gender, email, password, isAdmin, height, city, favouriteAnimals, favouriteColours, musicGenres, genderLimits, ageLimits) VALUES (@id, @firstName, @lastName, @age, @gender, @email, @password, @isAdmin, @height, @city, @favouriteAnimals, @favouriteColours, @musicGenres, @genderLimits, @ageLimits)'
        const request = new Request(sql, (err) => {
            if (err){
                reject(err)
                console.log(err);
            }
        });
        request.addParameter('id', TYPES.VarChar, user.id);
        request.addParameter('firstName', TYPES.VarChar, user.firstName);
        request.addParameter('lastName', TYPES.VarChar, user.lastName);
        request.addParameter('age', TYPES.Int, user.age);
        request.addParameter('gender', TYPES.VarChar, user.gender);
        request.addParameter('email', TYPES.VarChar, user.email);
        request.addParameter('password', TYPES.VarChar, user.password);
        request.addParameter('isAdmin', TYPES.Bit, user.isAdmin);
        request.addParameter('height', TYPES.Int, user.height);
        request.addParameter('city', TYPES.VarChar, user.city);
        request.addParameter('favouriteAnimals', TYPES.VarChar, user.favouriteAnimals.join(','));
        request.addParameter('favouriteColours', TYPES.VarChar, user.favouriteColours.join(','));
        request.addParameter('musicGenres', TYPES.VarChar, user.musicGenres.join(','));
        request.addParameter('genderLimits', TYPES.VarChar, user.genderLimits.join(','));
        request.addParameter('ageLimits', TYPES.VarChar, user.ageLimits.join(','));


        request.on('requestCompleted', () => {
            resolve('User inserted');
        });
        connection.execSql(request);
    });
}
module.exports.insertUser = insertUser;

function getAllUsers(){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users'
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount == 0) {
                resolve([]);
            }
        });
        const users = [];
        request.on('row', (columns) => {
            var rowObject = {};
            columns.forEach(function(column) {
                rowObject[column.metadata.colName] = column.value;
            });

            const user = User.fromDB(rowObject.id, rowObject.firstName, rowObject.lastName, rowObject.age, rowObject.gender, rowObject.email, rowObject.password, rowObject.isAdmin, rowObject.height, rowObject.city, rowObject.favouriteAnimals, rowObject.favouriteColours, rowObject.musicGenres, rowObject.genderLimits, rowObject.ageLimits);
            users.push(user);
        });
        request.on('requestCompleted', () => {
            resolve(users);
        });
        connection.execSql(request);
    });
}
module.exports.getAllUsers = getAllUsers;

function deleteUser(id){
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM users WHERE id = @id'
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount === 0) {
                resolve(false);
            }
        });
        request.addParameter('id', TYPES.VarChar, id);

        request.on('requestCompleted', function() {
            resolve(true);
        });
        connection.execSql(request);
    });
}
module.exports.deleteUser = deleteUser;

function updateUser(user){
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET firstName = @firstName, lastName = @lastName, age = @age, gender = @gender, email = @email, password = @password, height = @height, city = @city, favouriteAnimals = @favouriteAnimals, favouriteColours = @favouriteColours, musicGenres = @musicGenres, genderLimits = @genderLimits, ageLimits = @ageLimits WHERE id = @id'
        const request = new Request(sql, (err) => {
            if (err){
                reject(err)
                console.log(err)
            }
        });
        request.addParameter('id', TYPES.VarChar, user.id);
        request.addParameter('firstName', TYPES.VarChar, user.firstName);
        request.addParameter('lastName', TYPES.VarChar, user.lastName);
        request.addParameter('age', TYPES.Int, user.age);
        request.addParameter('gender', TYPES.VarChar, user.gender);
        request.addParameter('email', TYPES.VarChar, user.email);
        request.addParameter('password', TYPES.VarChar, user.password);
        request.addParameter('isAdmin', TYPES.Bit, user.isAdmin);
        request.addParameter('height', TYPES.Int, user.height);
        request.addParameter('city', TYPES.VarChar, user.city);
        request.addParameter('favouriteAnimals', TYPES.VarChar, user.favouriteAnimals.join(','));
        request.addParameter('favouriteColours', TYPES.VarChar, user.favouriteColours.join(','));
        request.addParameter('musicGenres', TYPES.VarChar, user.musicGenres.join(','));
        request.addParameter('genderLimits', TYPES.VarChar, user.genderLimits.join(','));
        request.addParameter('ageLimits', TYPES.VarChar, user.ageLimits.join(','));

        request.on('requestCompleted', () => {
            resolve('User inserted');
        });
        connection.execSql(request);
    });
}
module.exports.updateUser = updateUser;

function insertMatch(match){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO [tinderUsers].[matches] (id, sendingLikeId, receivingLikeId, isApproved) VALUES (@id, @sendingLikeId, @receivingLikeId, @isApproved)'
        const request = new Request(sql, (err) => {
            if (err){
                reject(err)
                console.log(err)
            }
        });
        request.addParameter('id', TYPES.VarChar, match.id)
        request.addParameter('sendingLikeId', TYPES.VarChar, match.sendingLikeId)
        request.addParameter('receivingLikeId', TYPES.VarChar, match.receivingLikeId)
        request.addParameter('isApproved', TYPES.Bit, match.isApproved)

        request.on('requestCompleted', () => {
            resolve('Match inserted');
        });
        connection.execSql(request);
    });
}
module.exports.insertMatch = insertMatch;

function selectMatchById(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM [tinderUsers].[matches] WHERE id = @id'
        let match = null;
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount == 0) {
                resolve(match);
            }
        });
        request.addParameter('id', TYPES.VarChar, id);

        request.on('row', (columns) => {

            var rowObject = {};
            columns.forEach(function(column) {
                rowObject[column.metadata.colName] = column.value;
            });

            match = Match.fromDB(rowObject.id, rowObject.sendingLikeId, rowObject.receivingLikeId, rowObject.isApproved);
        });

        request.on('requestCompleted', () => {
            resolve(match);
        });

        connection.execSql(request);
    });
}
module.exports.selectMatchById = selectMatchById;

function approveMatch(match){
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE [tinderUsers].[matches] SET isApproved = @isApproved WHERE id = @id'
        const request = new Request(sql, (err) => {
            if (err){
                reject(err)
            }
        });
        request.addParameter('id', TYPES.VarChar, match.id)
        request.addParameter('isApproved', TYPES.Bit, true)

        request.on('requestCompleted', () => {
            resolve('Match approved');
        });
        connection.execSql(request);
    });
}
module.exports.approveMatch = approveMatch;

function deleteMatch(id){
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM [tinderUsers].[matches] WHERE id = @id'
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount === 0) {
                resolve(false);
            }
        });
        request.addParameter('id', TYPES.VarChar, id);

        request.on('requestCompleted', function() {
            resolve(true);
        });
        connection.execSql(request);
    });
}
module.exports.deleteMatch = deleteMatch;

function findMatchesByUserId(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM matches WHERE sendingLikeId = @id OR receivingLikeId = @id';
        let matches = [];
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
            }
        });
        request.addParameter('id', TYPES.VarChar, id);

        request.on('row', (columns) => {
            var rowObject = {};
            columns.forEach(function(column) {
                rowObject[column.metadata.colName] = column.value;
            });

            const match = Match.fromDB(rowObject.id, rowObject.sendingLikeId, rowObject.receivingLikeId, rowObject.isApproved);
            matches.push(match);
        });

        request.on('requestCompleted', () => {
            resolve(matches);
        });

        connection.execSql(request);
    });
}
module.exports.findMatchesByUserId = findMatchesByUserId;

function getAllMatches(){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM matches'
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount == 0) {
                resolve([]);
            }
        });
        const matches = [];
        request.on('row', (columns) => {
            var rowObject = {};
            columns.forEach(function(column) {
                rowObject[column.metadata.colName] = column.value;
            });
            const match = Match.fromDB(rowObject.id, rowObject.sendingLikeId, rowObject.receivingLikeId, rowObject.isApproved);
            matches.push(match);
        });
        request.on('requestCompleted', () => {
            resolve(matches);
        });
        connection.execSql(request);
    });
}

module.exports.getAllMatches = getAllMatches;
