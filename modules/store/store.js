const {db} = require("../../functions")
/**
 * @typedef Item
 * @property {Number} id
 * @property {String} name
 * @property {String} description
 * @property {String} image
 * @property {Number} price
 */
/**
 * **Plugin made by:**
 * 
 * [PolishKebab](https://github.com/PolishKebab)
 */
class Store{
    constructor(){
        if(require("../../config.json").modules.store){
            db.run(`CREATE TABLE IF NOT EXISTS store (id int primary key autoincrement, name text, description text, image text, price int)`)
        }else{
            throw new Error(`[Modules:Store] Error: module is not enabled.`)
        }
    }
    /**
     * **Function that returns all items in store**
     * 
     * example:
     * ```js
     * await Store.getItems()
     * ```
     * @returns {Promise.<Item[]>}
     */
    static async getItems(){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM store`,async(err,rows)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(rows)
                }
            })
        })
    }
    /**
     * **Function that returns a item with the provided name**
     * 
     * example:
     * ```js
     * await Store.getItem("Stick")
     * ```
     * @param {String} name 
     * @returns {Promise.<Item|undefined>}
     */
    static async getItem(name){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM store WHERE name=?`,[name],async(err,rows)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(rows[0])
                }
            })
        })
    }
    /**
     * **Function that returns a item with the provided id**
     * 
     * example:
     * ```js
     * await Store.getItem(1)
     * ```
     * @param {Number} id 
     * @returns {Promise.<Item|undefined>}
     */
    static async getItemById(id){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM store WHERE id=?`,[id],(err,rows)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(rows[0])
                }
            })
        })
    }
    /**
     * **Function that adds a item**
     * 
     * example:
     * ```js
     * await Store.addItem("Stick","A small stick","https://t3.ftcdn.net/jpg/00/91/11/18/240_F_91111889_465LQHNbUspA5KjpKbdx809PIyCfWRLR.jpg")
     * ```
     * @param {String} name 
     * @param {String} description 
     * @param {String} image 
     * @returns {Promise.<Item>}
     */
    static async addItem(name,description,image,price=0){
        return new Promise((resolve,reject)=>{
            db.run(`INSERT INTO store (name,description,image,price) values (?,?,?,?)`,[name,description,image,price],async(err)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(await Store.getItem(name))
                }
            })
        })
    }
    /**
     * **Function that removes a item**
     * 
     * example:
     * ```js
     * await Store.removeItem("Stick")
     * ```
     * @param {String} name 
     * @returns {Promise.<void>}
     */
    static async removeItem(name){
        return new Promise((resolve,reject)=>{
            db.run(`DELETE FROM store WHERE name=?`,[name],async(err)=>{
                if(err){
                    reject(err)
                }else{
                    resolve()
                }
            })
        })
    }
    /**
     * **Function that edits a item**
     * 
     * example:
     * ```js
     * await Store.editItem("Stick","name='Rock',description='A quite hard material'")
     * ```
     * @param {String} name name of item
     * @param {String} data data you want to edit
     * @returns {Promise.<Item>}
     */
    static async editItem(name,data){
        return new Promise(async(resolve,reject)=>{
            const item = await Store.getItem(name)
            db.run(`UPDATE store SET ? WHERE name=?`,[data,name],async(err)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(await Store.getItemById(item.id))
                }
            })
        })
    }
    static async giveItem(name,id){

    }
}
module.exports=Store