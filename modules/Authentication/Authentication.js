const {db} = require("../../functions")
/**
 * @typedef User
 * @property {String} id
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
    /**
     * **Discord authentication link**
     * @type {String}
     */
    static authLink = "https://discord.com/api/oauth2/authorize?client_id=935170846677422080&redirect_uri=http%3A%2F%2Flocalhost%3A100%2Fauth&response_type=token&scope=identify";
    constructor(){
        if(!require("../../config.json").modules.Authentication){
            throw new Error(`[Modules:Authentication]: module is not enabled.`)
        }else{
            db.run(`CREATE TABLE IF NOT EXISTS auth (id text, authlvl int)`)
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
     * **Function that get a user with the provided id**
     * 
     * example:
     * ```js
     * await Authentication.getUser("525791610794147842")
     * ```
     * @param {String} id id of the user you want to get
     * @returns {Promise.<{code:Number,message:User|Error}>}
     */
    static async getUser(id){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM auth WHERE id=?`,[id],(err,rows)=>{
                if(err){
                    reject({code:500,message:err.message})
                }else{
                    if(!rows[0]){
                        resolve({code:404,message:rows[0]})
                    }
                    resolve({code:200,message:rows[0]})
                }
            })
        })
    }
    /**
     * **Function that adds a user with the provided id and authorization level to database**
     * 
     * example:
     * ```js
     * await Authentication.addUser("525791610794147842",0,1)
     * ```
     * @param {String} id id of the user you want to add
     * @param {Number} authlvl  The users authorization level
     * @param {number} lvl Your authorization level
     * @returns {Promise.<{code:Number,message:User|Error}}
     */
    static async addUser(id,authlvl=0,lvl=0){
        return new Promise(async(resolve,reject)=>{
            if(lvl<=0){
                reject({code:401,message:"Unauthorized"})
            }
            if((await Authentication.getUser(id)).code==404){
                db.run(`INSERT INTO auth (id,authlvl) values (?,?)`,[id,authlvl],async(err)=>{
                    if(err){
                        reject({code:500,message:err.message})
                    }else{
                        resolve({code:200,message:await Authentication.getUser(id)})
                    }
                })
            }else{
                reject({code:403,message:"User already exists"})
            }
        })
    }
    /**
     * **Function that deletes a user with the provided id from database**
     * 
     * example:
     * ```js
     * await Authentication.deleteUser("525791610794147842",3)
     * ```
     * @param {String} id id of the user you want to delete from database
     * @param {Number} authlvl Your authorization level
     * @returns {Promise.<{code:Number,message:"Success"|Error}>}
     */
    static async deleteUser(id,authlvl=0){
        return new Promise(async(resolve,reject)=>{
            const user = await Authentication.getUser(id)
            if(!user){
                reject({code:404,message:"User not found"})
            }else if(user.authlvl>=authlvl||authlvl<2){
                reject({code:401,message:"Unauthorized"})
            }else{
                db.run(`DELETE FROM auth WHERE id=?`,[id],(err)=>{
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
     * **Function that edits a user with the provided id**
     * 
     * example:
     * ```js
     * await Authentication.editUser("525791610794147842",2,"authlvl=0")
     * ```
     * @param {String} id id of the user you want to edit
     * @param {Number} authlvl Your authorization level
     * @param {String} data The data you want to set
     * @returns {Promise.<{code:Number,message:User|Error}>}
     */
    static async editUser(id,authlvl=0,data){ 
        return new Promise(async(resolve,reject)=>{
            const user = await Authentication.getUser(id)
            if(!user){
                reject({code:404,message:"User not found"})
            }else if(user.authlvl>=authlvl||authlvl<1){
                reject({code:401,message:"Unauthorized"})
            }else if(data.includes("id")){
                reject({code:403,message:"Forbidden"})
            }else{
                db.run(`UPDATE auth SET ? WHERE id = ?`,[data,id],async(err)=>{
                    if(err){
                        reject({code:500,message:err.message})
                    }else{
                        resolve({code:200,message:await Authentication.getUser(id)})
                    }
                })
            }
        })
    }
}
module.exports=Authentication