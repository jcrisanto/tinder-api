const { Connection, Request, TYPES} = require('tedious');
const config = require('./config.json')
const User = require('../Models/user')

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
        const sql = 'SELECT * FROM [tinderUsers].[users] WHERE id = @id'
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

                user = User.fromDB(rowObject.id, rowObject.firstName, rowObject.lastName, rowObject.age, rowObject.gender, rowObject.email, rowObject.password);
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
        const sql = 'SELECT * FROM [tinderUsers].[users] WHERE email = @email'
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount == 0) {
                resolve(null);
            }
        });
        request.addParameter('email', TYPES.VarChar, email);

        request.on('row', (columns) => {

            var rowObject = {};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });

                const user = User.fromDB(rowObject.id, rowObject.firstName, rowObject.lastName, rowObject.age, rowObject.gender, rowObject.email, rowObject.password);
                console.log(user)
            resolve(user);
        });
        connection.execSql(request);
    });
}

exports.selectUserByEmail = selectUserByEmail;


function insertUser(user){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO [tinderUsers].[users] (id, firstName, lastName, age, gender, email, password) VALUES (@id, @firstName, @lastName, @age, @gender, @email, @password)'
        const request = new Request(sql, (err) => {
            if (err){
                reject(err)
                console.log(err)
            }
        });
        request.addParameter('id', TYPES.VarChar, user.id)
        request.addParameter('firstName', TYPES.VarChar, user.firstName)
        request.addParameter('lastName', TYPES.VarChar, user.lastName)
        request.addParameter('age', TYPES.Int, user.age)
        request.addParameter('gender', TYPES.VarChar, user.gender)
        request.addParameter('email', TYPES.VarChar, user.email)
        request.addParameter('password', TYPES.Text, user.password)

        request.on('requestCompleted', () => {
            resolve('User inserted');
        });
        connection.execSql(request);
    });
}
module.exports.insertUser = insertUser;


function getAllUsers(){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM [tinderUsers].[users]'
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

                const user = User.fromDB(rowObject.id, rowObject.firstName, rowObject.lastName, rowObject.age, rowObject.gender, rowObject.email, rowObject.password);
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
        const sql = 'DELETE FROM [tinderUsers].[users] WHERE id = @id'
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err);
                console.log(err);
            } else if (rowcount == 0) {
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
        const sql = 'UPDATE [tinderUsers].[users] SET firstName = @firstName, lastName = @lastName, age = @age, gender = @gender, email = @email, password = @password WHERE id = @id'
        const request = new Request(sql, (err) => {
            if (err){
                reject(err)
                console.log(err)
            }
        });
        request.addParameter('id', TYPES.VarChar, user.id)
        request.addParameter('firstName', TYPES.VarChar, user.firstName)
        request.addParameter('lastName', TYPES.VarChar, user.lastName)
        request.addParameter('age', TYPES.Int, user.age)
        request.addParameter('gender', TYPES.VarChar, user.gender)
        request.addParameter('email', TYPES.VarChar, user.email)
        request.addParameter('password', TYPES.Text, user.password)

        request.on('requestCompleted', () => {
            resolve('User inserted');
        });
        connection.execSql(request);
    });
}
module.exports.updateUser = updateUser;