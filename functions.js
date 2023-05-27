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
 */
const {Database} = require("sqlite3").verbose();
const db = new Database("database.db");
const fs = require("fs")
const {Snowflake} = require("discord.js");
const { Client } = require(".");
if(!fs.existsSync("./database.db")){
    db.exec(`CREATE TABLE users (id varchar(20), credits int)`);
    db.exec(`CREATE TABLE cmd (name varchar(20), value text)`);
}

class Bank{
    /**
     * @returns {User[]}
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
     * @returns {User}
     */
    static async getUser(id){
        return new Promise(r=>{
            db.all(`SELECT * FROM users WHERE id='?'`,[id],(err,rows)=>{
                if(err)throw err;
                r(rows[0])
            })
        })
    }
    /**
     * @param {String} id 
     * @param {Number} credits 
     */
    static async addUser(id,credits){
        return new Promise(r=>{
            db.exec(`INSERT INTO users (id,credits) values ('?',?)`,[id,credits],async(err)=>{
                if(err)throw err;
                r(await Bank.getUser(id));
            })
        })
    }
    static async deleteUser(id){
        return new Promise(r=>{
            db.exec(`DELETE FROM users WHERE id='?'`,[id],async(err)=>{
                if(err)throw err;
                r();
            })
        })
    }
    /**
     * @param {Snowflake} id 
     * @param {Number} amount 
     * @returns {User}
     */
    static async addMoney(id,amount){
        return new Promise(r=>{
            db.run(`UPDATE users SET credits+=? WHERE id='?'`,[amount,id],async(err)=>{
                if(err)throw err;
                r(await Bank.getUser(id));
            })
        })
    }
    /** 
     * @param {Snowflake} id 
     * @param {Number} amount 
     * @returns {User}
     */
    static async removeMoney(id,amount){
        return new Promise(async r=>{
            const user = await Bank.getUser(id)
            if(user.credits<amount){
                amount = user.credits;
            }
            db.exec(`UPDATE users SET credits-=? WHERE id='?'`,[amount,id],async(err)=>{
                if(err)throw err;
                r(await Bank.getUser(id));
            })
        })
    }
}
/**
 * @param {Client} client 
 * @returns {Array.<{name:String,value:String>}}
 */
async function checkSlashCommandUpdates(client){
    let changes = [];
    db.all(`SELECT * FROM cmd`,(err,rows)=>{
        if(err)throw err;
        client.commands.map(r=>{
            const cmd = rows.find(r1=>r.data.name==r1.name);
            if(!cmd){
                changes.push({name:r.data.name,value:encode(JSON.stringify(r.data.toJSON()))});
            }
            if(encode(JSON.stringify(r.data.toJSON()))!=cmd.value){
                changes.push({name:r.data.name,value:encode(JSON.stringify(r.data.toJSON()))});
            }
        })
    })
    return changes;
}
module.exports={Bank,checkSlashCommandUpdates}