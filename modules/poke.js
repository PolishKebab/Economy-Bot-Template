const { Message, GuildMember } = require("discord.js");
const { Bank,User } = require("../functions");
class Poke{
    /**
     * @type {Number}
     */
    static chance=10; // chance to get points (%)
    /**
     * @type {Number}
     */
    static reward=1; // amount of points rewarded
    /**
     * @param {Message} message 
     * @returns {Boolean}
     */
    static checkValid(message){
        return message.author.id=="969658822962585641" && message.content.includes("caught a pokemon in");
    }
    /**
     * @param {Message} message 
     * @returns {Promise.<GuildMember|undefined>}
     */
    static async getUser(message){
        return (await message.guild.members.search({query:message.content.split("#")[0].replace("**","").replace("> ","")})).first()
    }
    /**
     * @returns {Boolean}
     */
    static check(){
        return Math.random()*100<=Poke.chance;
    }
    /**
     * @param {String} user 
     * @returns {Promise.<User>}
     */
    static async giveReward(user){
        return await Bank.addMoney(user,Poke.reward)
    }
}
module.exports={Poke}