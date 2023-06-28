const {db} = require("../functions")
/**
 * @typedef Cooldown
 * @property {String} id
 * @property {String} timestamp
 */
/**
 * **Plugin made by:**
 * 
 * [PolishKebab](https://github.com/PolishKebab)
 */
class messageEarn{
    /**
     * **Amount of cooldown in minutes**
     * @type {Number}
     */
    static cooldown = 1;
    /**
     * **Amount of credits rewarded**
     * @type {Number}
     */
    static reward = 1;
    constructor(){
        if(require("../config.json").modules.messageEarn){
            db.run(`CREATE TABLE IF NOT EXIST msgEarnCooldown (id varchar(20),timestamp varchar(20))`)
        }else{
            throw new Error(`[Modules:messageEarn] Error: module is not enabled.`)
        }
    }
    /**
     * **Function that returns all cooldowns**
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
     * **Function that returns a cooldown with the provided name**
     * 
     * example:
     * ```js
     * const cooldown = await messageEarn.getCooldown("525791610794147842")
     * ```
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
     * **Function that creates a cooldown**
     * 
     * example:
     * ```js
     * await messageEarn.addCooldown("525791610794147842",Date.now())
     * ```
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
     * **Function that deletes a cooldown**
     * 
     * example:
     * ```js
     * await messageEarn.removeCooldown("525791610794147842")
     * ```
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
     * **Function that sets the cooldown to the provided one**
     * 
     * example
     * ```js
     * await messageEarn.setCooldown("525791610794147842",Date.now())
     * ```
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
        return (Date.now()-((await messageEarn.getCooldown(user))?.timestamp|0)>messageEarn.cooldown*60000)
    }
}
module.exports={messageEarn}