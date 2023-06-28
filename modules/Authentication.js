const {db} = require("../functions")
/**
 * @typedef User
 * @property {String} username
 * @property {Number} authlvl
 */
/**
 * **Plugin made by:**
 * 
 * [PolishKebab](https://github.com/PolishKebab) and  [Demon](https://github.com/Mikejunior277)
 * 
 * Authorization levels:
 * * 0 - view
 * * 1 - add user
 * * 2 - add/edit user
 * * 3 - add/edit/delete user
 */
class Authentication{
    constructor(){
        if(!require("../config.json").modules.Authentication){
            throw new Error(`[Modules:Authentication]: module is not enabled.`)
        }else{
            db.run(`CREATE TABLE IF NOT EXIST auth (user text, authlvl int)`)
        }
    }
    /**
     * **Function that gets all users same and lower than provided authorization level**
     * 
     * example:
     * ```js
     * await Authentication.getUsers(0)
     * ```
     * @param {Number} lvl Your authorization level
     * @returns {Promise.<{code:Number,message:User[]|Error}>}
     */
    static async getUsers(lvl){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM auth WHERE authlvl<=?`,[lvl],(err,rows)=>{
                if(err){
                    reject({code:500,message:err.message})
                }else{
                    resolve({code:200,message:rows})
                }
            })
        })
    }
    /**
     * **Function that get a user with the provided username**
     * 
     * example:
     * ```js
     * await Authentication.getUser("User")
     * ```
     * @param {String} username Username of the user you want to get
     * @returns {Promise.<{code:Number,message:User|Error}>}
     */
    static async getUser(username){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM auth WHERE user=?`,[username],(err,rows)=>{
                if(err){
                    reject({code:500,message:err.message})
                }else{
                    resolve({code:200,message:rows[0]})
                }
            })
        })
    }
    /**
     * **Function that adds a user with the provided username and authorization level to database**
     * 
     * example:
     * ```js
     * await Authentication.addUser("AnotherUser",0,1)
     * ```
     * @param {String} username Username of the user you want to add
     * @param {Number} authlvl  The users authorization level
     * @param {number} lvl Your authorization level
     */
    static async addUser(username,authlvl=0,lvl=0){
        return new Promise(async(resolve,reject)=>{
            if(lvl<=0){
                reject({code:401,message:"Unauthorized"})
            }
            if(!await Authentication.getUser(username)){
                db.run(`INSERT INTO auth (username,authlvl) values (?,?)`,[username,authlvl],async(err)=>{
                    if(err){
                        reject({code:500,message:err.message})
                    }else{
                        resolve({code:200,message:await Authentication.getUser(username)})
                    }
                })
            }else{
                reject({code:403,message:"User already exists"})
            }
        })
    }
    /**
     * **Function that deletes a user with the provided username from database**
     * 
     * example:
     * ```js
     * await Authentication.deleteUser("User",3)
     * ```
     * @param {String} username Username of the user you want to delete from database
     * @param {Number} authlvl Your authorization level
     */
    static async deleteUser(username,authlvl=0){
        return new Promise(async(resolve,reject)=>{
            const user = await Authentication.getUser(username)
            if(!user){
                reject({code:404,message:"User not found"})
            }else if(user.authlvl>=authlvl||authlvl<2){
                reject({code:401,message:"Unauthorized"})
            }else{
                db.run(`DELETE FROM auth WHERE username=?`,[username],(err)=>{
                    if(err){
                        reject({code:500,message:err.message})
                    }else{
                        resolve({code:200,message:"Success"})
                    }
                })
            }
        })
    }
    /**
     * **Function that edits a user with the provided username**
     * 
     * example:
     * ```js
     * await Authentication.editUser("Username",2,"authlvl=0")
     * ```
     * @param {String} username Username of the user you want to edit
     * @param {Number} authlvl Your authorization level
     * @param {String} data The data you want to set
     * @returns {Promise.<{code:Number,message:User|Error}>}
     */
    static async editUser(username,authlvl=0,data){ 
        return new Promise(async(resolve,reject)=>{
            const user = await Authentication.getUser(username)
            if(!user){
                reject({code:404,message:"User not found"})
            }else if(user.authlvl>=authlvl||authlvl<1){
                reject({code:401,message:"Unauthorized"})
            }else if(data.includes("username")){
                reject({code:403,message:"Forbidden"})
            }else{
                db.run(`UPDATE auth SET ? WHERE username = ?`,[data,username],async(err)=>{
                    if(err){
                        reject({code:500,message:err.message})
                    }else{
                        resolve({code:200,message:await Authentication.getUser(username)})
                    }
                })
            }
        })
    }
}
module.exports={Authentication}