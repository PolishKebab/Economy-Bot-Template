/**
 * @param {String} string 
 * @returns {String}
 */
function encode(string){
    return Buffer.from(string,"utf-8").toString("base64")
}
/**
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
     * @returns {Promise.<Command[]>}
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
     * @param {String} name 
     * @returns {Promise.<Command>}
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
     * @param {String} name 
     * @param {String} data 
     * @returns {Promise.<Command>}
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
     * @param {String} name 
     * @returns {Promise.<void>}
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
     * @param {String} name 
     * @param {String} data 
     * @returns {Promise.<void>}
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
     * @returns {Promise.<User[]>}
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
     * @param {Snowflake} id 
     * @returns {Promise.<User>}
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
     * @param {String} id 
     * @param {Number} credits 
     * @returns {Promise.<User>}
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
     * 
     * @param {String} id 
     * @returns {Promise.<void>}
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
     * @param {Snowflake} id 
     * @param {Number} amount 
     * @returns {Promise.<User>}
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
    static async resetMoneyAll(){
        return new Promise(r=>{
            db.run(`UPDATE users set credits=0`,async(err)=>{
                if(err)throw err;
                r(await Bank.getUsers())
            })
        })
    }
    /** 
     * @param {Snowflake} id 
     * @param {Number} amount 
     * @returns {Promise.<User>}
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
 * @param {Client} client 
 * @returns {Promise.<Array.<{name:String,data:String,action:"insert"|"update"|"delete">>}}
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
        if (!dbCommands.some((row) => row.name === command.name)) {
          const encodedData = encode(JSON.stringify(command.data.toJSON()));
          changes.push({ name: command.data.name, data: encodedData, action: 'insert' });
        }
    }  
    for (const dbCommand of dbCommands) {
      if(!changes.some(r=>r.name==dbCommand.name)){
        const commandData = JSON.parse(decode(dbCommand.value));
        const clientCommand = clientCommandArray.find((command) => command.name === dbCommand.name);
        if (!clientCommand) {
          changes.push({ name: dbCommand.name, action: 'delete' });
        } else if (JSON.stringify(commandData) !== JSON.stringify(clientCommand)) {
          const encodedData = encode(JSON.stringify(clientCommand.data.toJSON()));
          changes.push({ name: dbCommand.name, data: encodedData, action: 'update' });
        }
      }
    }
    return changes;
  }
module.exports={Bank,checkSlashCommandUpdates,db,CommandDatabase,encode,decode}