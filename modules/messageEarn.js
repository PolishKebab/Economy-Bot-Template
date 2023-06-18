const {db} = require("../functions")
/**
 * @typedef Cooldown
 * @property {String} id
 * @property {String} timestamp
 */
class messageEarn{
    /**
     * @type {Number}
     */
    static cooldown = 1; // cooldown in minutes
    constructor(){
        if(require("../config.json").modules.messageEarn){
            db.exec(`CREATE TABLE IF NOT EXIST msgEarnCooldown (id varchar(20),timestamp varchar(20))`)
        }
    }
    /**
     * @returns {Promise.<Cooldown[]>}
     */
    static async getCooldowns(){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM msgEarnCooldown`,(err,rows)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(rows)
                }
            })
        })
    }
    /**
     * @param {String} user 
     * @returns {Promise.<Cooldown>}
     */
    static async getCooldown(user){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM msgEarnCooldown WHERE id=?`,[user],(err,rows)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(rows[0])
                }
            })
        })
    }
    /**
     * @param {String} user 
     * @param {String} timestamp 
     * @returns {Promise.<Cooldown>}
     */
    static async addCooldown(user,timestamp){
        return new Promise((resolve,reject)=>{
            db.run(`INSERT INTO msgEarnCooldown (id,timestamp) values (?,?)`,[user,timestamp],async(err)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(await messageEarn.getCooldown(user))
                }
            })
        })
    }
    /**
     * @param {String} user 
     * @returns {Promise.<void>}
     */
    static async removeCooldown(user){
        return new Promise((resolve,reject)=>{
            db.run(`DETELE FROM msgEarnCooldown WHERE id=?`,[user],(err)=>{
                if(err){
                    reject(err)
                }else{
                    resolve()
                }
            })
        })
    }
    /**
     * @param {String} user 
     * @param {String} timestamp 
     * @returns {Promise.<Cooldown>}
     */
    static async setCooldown(user,timestamp){
        return new Promise((resolve,reject)=>{
            db.run(`UPDATE msgEarnCooldown SET timestamp=? WHERE id=?`,[timestamp,user],async(err)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(await messageEarn.getCooldown(user))
                }
            })
        })

    }
    /**
     * @param {String} user 
     * @returns {Promise.<Boolean>}
     */
    static async checkCooldown(user){
        return (Date.now()-(await messageEarn.getCooldown(user)).timestamp>messageEarn.cooldown*60000)
    }
}
module.exports={messageEarn}