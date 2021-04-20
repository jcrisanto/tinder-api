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
                console.log("User does not exist");
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

        request.on('requestCompleted', (row) => {
            console.log('User inserted', row);
            resolve('user inserted', row)
        });
        connection.execSql(request)
    });
}
module.exports.insertUser = insertUser;