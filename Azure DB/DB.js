const { Connection, Request, TYPES} = require('tedious');
const config = require('./config.json')

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


function selectUserByEmail(email){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM [tinderUsers].[users] WHERE email = @email'
        const request = new Request(sql, (err, rowcount) => {
            if (err){
                reject(err)
                console.log(err)
            } else if (rowcount == 0) {
                reject({message: 'User does not exist'})
            }
        });
        request.addParameter('email', TYPES.int, email);

        request.on('row', (columns) =>{
            resolve(columns)
        });
    })
}

exports.selectUserByEmail = selectUserByEmail;


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