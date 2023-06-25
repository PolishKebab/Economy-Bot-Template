const { Message, GuildMember } = require("discord.js");
const { Bank,User } = require("../functions");
class Poke{
    constructor(){
        if(!require("../config.json").modules.poke){
            throw new Error(`[Modules:Poke] Error: module is not enabled.`)
        }
    }
    /**
     * **Chance to get the reward in percents (%)**
     * @type {Number}
     */
    static chance=25;
    /**
     * **Amount of points rewarded**
     * @type {Number}
     */
    static reward=1;
    /**
     * **List of allowed channel ids**
     * @type {{id:String,type:"channel"|"parent"}[]}
     */
    static channelWhitelist=[
    ]
    /**
     * **Function that check whether the message provided is valid to receive the award**
     * 
     * example:
     * ```js
     * client.on("messageCreate",(message)=>{ Poke.checkValid(message)})
     * ```
     * @param {Message} message 
     * @returns {Boolean}
     */
    static checkValid(message){
        return message.author.id=="969658822962585641" && message.content.includes("caught a pokemon in") && (Poke.channelWhitelist.some(r=>r.id==message.channelId)||Poke.channelWhitelist.some(r=>r.id==message.channel.parentId));
    }
    /**
     * **Function that parses the user from message**
     * 
     * example:
     * ```js
     * client.on("messageCreate",(message)=>{ await Poke.getUser(message)})
     * ```
     * @param {Message} message 
     * @returns {Promise.<GuildMember|undefined>}
     */
    static async getUser(message){
        return (await message.guild.members.search({query:message.content.split("#")[0].replace("**","").replace("> ","")})).first()
    }
    /**
     * **Function for chance check**
     * 
     * example:
     * ```js
     * if(Poke.check()){
     *  //code
     * }
     * ```
     * @returns {Boolean}
     */
    static check(){
        return Math.random()*100<=Poke.chance;
    }
    /**
     * **Function for giving the user the award**
     * 
     * example:
     * ```js
     * await Poke.giveReward("525791610794147842")
     * ```
     * @param {String} user 
     * @returns {Promise.<User>}
     */
    static async giveReward(user){
        return await Bank.addMoney(user,Poke.reward)
    }
}
module.exports={Poke}