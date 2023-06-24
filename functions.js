/**
 * **Function that encodes utf-8 to base64
 * @param {String} string 
 * @returns {String}
 */
function encode(string){
    return Buffer.from(string,"utf-8").toString("base64")
}
/**
 * **Function that decodes base64 to utf-8**
 * @param {String} string 
 * @returns {String}
 */
function decode(string){
    return Buffer.from(string,"base64").toString("utf-8")
}
/**
 * @typedef User
 * @property {Snowflake} id
 * @property {Number} credits
 * @typedef Command
 * @property {String} name
 * @property {String} value
 */
const {Database} = require("sqlite3").verbose();
const fs = require("fs")
const {Snowflake} = require("discord.js");
const Client = require("./index.js"); 
const db = new Database("database.db");
if(!fs.existsSync("./database.db")){
    db.run(`CREATE TABLE users (id varchar(20), credits int)`);
    db.run(`CREATE TABLE cmd (name varchar(20), value text)`);
}
class CommandDatabase{
    /**
     * **Function that returns all commands in database**
     * @returns {Promise.<Command[]>} Array of commands in database (async)
     */
    static async getCommands(){
        return new Promise(r=>{
            db.all(`SELECT * FROM cmd`,(err,rows)=>{
                if(err)throw err;
                r(rows)
            })
        })
    }
    /**
     * **Function that returns a command with the provided name from database**
     * @param {String} name Command name
     * @returns {Promise.<Command>} Command from database (async)
     */
    static async getCommand(name){
        return new Promise(r=>{
            db.all(`SELECT * FROM cmd WHERE name=?`,[name],(err,rows)=>{
                if(err)throw err;
                r(rows[0])
            })
        })
    }
    /**
     * **Function that adds a command to database**
     * @param {String} name Command name
     * @param {String} data Command data
     * @returns {Promise.<Command>} Command from database (async)
     */
    static async addCommand(name, data) {
        return new Promise((resolve, reject) => {
          db.run('INSERT INTO cmd (name, value) VALUES (?, ?)',name, data, async function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(await CommandDatabase.getCommand(name));
            }
          });
        });
      }
    /**
     * **Function that removes a provided command from database**
     * @param {String} name Command name
     * @returns {Promise.<void>} Nothing (async)
     */
    static async removeCommand(name){
        return new Promise((resolve,reject)=>{
            db.run(`DELETE FROM cmd WHERE name=?`,[name],(err)=>{
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            })
        })
    }
    /**
     * **Function that edits a provided command from database**
     * @param {String} name Command name
     * @param {String} data Command data
     * @returns {Promise.<Command>} Command from database (async)
     */
    static async editCommand(name,data){
        return new Promise(r=>{
            db.run(`UPDATE cmd SET value=? WHERE name=?`,[data,name],async(err)=>{
                if(err)throw err;
                r(await CommandDatabase.getCommand(name))
            })
        })
    }
}
class Bank{
    /**
     * **Function that gives data about all users in the database**
     * @returns {Promise.<User[]>} Array of users (async)
     */
    static async getUsers(){
        return new Promise(r=>{
            db.all(`SELECT * FROM users`,(err,rows)=>{
                if(err)throw err;
                r(rows);
            })
        })
    }
    /**
     * **Function that gives user data from database**
     * @param {Snowflake} id User id
     * @returns {Promise.<User>} User from database (async)
     */
    static async getUser(id){
        return new Promise(r=>{
            db.all(`SELECT * FROM users WHERE id=?`,[id],(err,rows)=>{
                if(err)throw err;
                r(rows[0])
            })
        })
    }
    /**
     * **Function that adds a user to database**
     * @param {String} id User id
     * @param {Number} credits Amount of credits you want to create the account with
     * @returns {Promise.<User>} User from database (async)
     */
    static async addUser(id,credits){
        return new Promise(r=>{
            db.run(`INSERT INTO users (id,credits) values (?,?)`,[id,credits],async(err)=>{
                if(err)throw err;
                r(await Bank.getUser(id));
            })
        })
    }
    /**
     * **Function that deletes the provided user from database**
     * @param {String} id User id
     * @returns {Promise.<void>} Nothing (async)
     */
    static async deleteUser(id){
        return new Promise(r=>{
            db.run(`DELETE FROM users WHERE id=?`,[id],async(err)=>{
                if(err)throw err;
                r();
            })
        })
    }
    /**
     * **Function that gives credits to a provided user**
     * @param {Snowflake} id User id
     * @param {Number} amount Amound of credits to add to a user
     * @returns {Promise.<User>} User from database
     */
    static async addMoney(id,amount){
        return new Promise(async r=>{
            if(!await Bank.getUser(id)){
                r(await Bank.addUser(id,amount))
            }
            db.run(`UPDATE users SET credits=credits+? WHERE id=?`,[amount,id],async(err)=>{
                if(err)throw err;
                r(await Bank.getUser(id));
            })
        })
    }
    /**
     * **Function that resets the balance of all acounts to 0**
     * @returns {Promise.<User[]>} Array of users (async)
     */
    static async resetMoneyAll(){
        return new Promise(r=>{
            db.run(`UPDATE users set credits=0`,async(err)=>{
                if(err)throw err;
                r(await Bank.getUsers())
            })
        })
    }
    /** 
     * **Function that removes credits from a provided user**
     * @param {Snowflake} id User id
     * @param {Number} amount Amount of credits that you want removed from the user
     * @returns {Promise.<User>} User from database (async)
     */
    static async removeMoney(id,amount){
        return new Promise(async r=>{
            const user = await Bank.getUser(id)
            if(!user)return;
            if(user.credits<amount){
                amount = user.credits;
            }
            db.run(`UPDATE users SET credits=credits-? WHERE id=?`,[amount,id],async(err)=>{
                if(err)throw err;
                r(await Bank.getUser(id));
            })
        })
    }
    /**
     * **Function that sets the credits of a provided user**
     * @param {String} id 
     * @param {Number} amount 
     * @returns {Promise.<User>}
     */
    static async setMoney(id,amount){
        return new Promise(r=>{
            db.run(`UPDATE users SET credits=? WHERE id=?`,[amount,id],async(err)=>{
                if(err)throw err;
                r(await Bank.getUser(id));
            })
        })
    }
}
/**
 * **Function that checks whether any slash commands were update/deleted/added**
 * @param {Client} client Bot client
 * @returns {Promise.<Array.<{name:String,value:String,action:"insert"|"update"|"delete">>}} Array of commands to update/delete/add to database
 */
/*
if the command is in commands folder, then add to database, register command on discord (insert)
if the command in in database, but not in folder, delete from database, uregister on discord (delete)
if the command in database is different from the command in folder, update command in database and register command on discord (update)
*/
async function checkSlashCommandUpdates(client) { 
    const dbCommands = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM cmd', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    const changes = [];
    const clientCommandArray = [...client.commands.values()];
    for (const command of clientCommandArray) {
        if (!dbCommands.some((row) => row.name == command.data.name)) {
          const encodedData = encode(JSON.stringify(command.data.toJSON()));
          changes.push({ name: command.data.name, data: encodedData, action: 'insert' });
        }
    }  
    for (const dbCommand of dbCommands) {
      if(!changes.some(r=>r.name==dbCommand.name)){
        const commandData = JSON.parse(decode(`${dbCommand.value}`));
        const clientCommand = clientCommandArray.find((command) => command.data.name == dbCommand.name);
        if (!clientCommand) {
          changes.push({ name: dbCommand.name, action: 'delete' });
        } else if (JSON.stringify(commandData) != JSON.stringify(clientCommand)) {
          const encodedData = encode(JSON.stringify(clientCommand.data.toJSON()));
          changes.push({ name: dbCommand.name, data: encodedData, action: 'update' });
        }
      }
    }
    return changes;
  }
module.exports={Bank,checkSlashCommandUpdates,db,CommandDatabase,encode,decode}