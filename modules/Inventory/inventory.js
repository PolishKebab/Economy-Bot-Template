const {db} = require("../../functions")
/**
 * @typedef ItemData
 * @property {String} id
 * @property {Number} item_id
 * @property {Number} amount
 * **Plugin made by:**
 * 
 * [PolishKebab](https://github.com/PolishKebab)
 */
class Inventory{
    /**
     * **Amount of minutes between deleting deleting items with 0 count, set to** `0` **to disable**
     */
    static sweepInterval = 1;
    constructor(){
        if(require("../../config.json").modules.inventory){
            db.run(`CREATE TABLE IF NOT EXISTS inventory(id text, item_id int, amount int)`)
        }else{
            throw new Error(`[Modules:Inventory] Error: module is not enabled.`)
        }
    }
    /**
     * **Function that returns all user items with the specified (or not) item id**
     * @param {String} id
     * @param {Number} item 
     * @returns {Promise<ItemData[]>}
     */
    static async get(id,item){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM inventory WHERE id=? ${item?"AND item_id=?":""}`,[...arguments],(err,rows)=>{
                if(err){
                    reject(err)
                }
                resolve(rows)
            })
        })
    }
    /**
     * **Function that returns all items inside database**
     * @returns {Promise<ItemData[]>}
     */
    static async getAll(){
        return new Promise((resolve,reject)=>{
            db.all(`SELECT * FROM inventory`,(err,rows)=>{
                if(err){
                    reject(err)
                }
                resolve(rows)
            })
        })
    }
    /**
     * **Function that add items to user inventory**
     * @param {String} id 
     * @param {Number} item 
     * @param {Number} amount 
     * @returns {Promise.<ItemData>}
     */
    static giveItem(id,item,amount=1){
        return new Promise(async(resolve,reject)=>{
            if(amount<0){
                reject(new Error("Item amount must be higher than 0"))
            }
            const itm = await Inventory.get(id,item);
            let query;
            if(!itm){
                query = "INSERT INTO inventory (amount,id,item_id) values (?,?,?)"
            }else{
                query = "UPDATE inventory SET amount=amount+? WHERE id=? AND item_id=?"
            }
            db.run(query,[amount,id,item],async(err)=>{
                if(err){
                    reject(err)
                }
                resolve(await Inventory.get(id,item))
            })
        })
    }
    /**
     * **Function that removes items from user inventory**
     * @param {String} id 
     * @param {Number} item 
     * @param {Mumber} amount 
     * @returns {Promise<ItemData>}
     */
    static removeItem(id,item,amount=1){
        return new Promise(async(resolve,reject)=>{
            if(amount<0){
                reject(new Error("Item amount must be higher than 0"))
            }
            const itm = await Inventory.get(id,item);
            if(!itm){
                reject(new Error("User does not have item in inventory"))
            }
            db.run(`UPDATE inventory SET amount=amount-? WHERE id=? AND item_id=?`,[amount,id,item],async(err)=>{
                if(err){
                    reject(err)
                }
                resolve(await Inventory.get(id,item))
            })
        })
    }
}
module.exports=Inventory