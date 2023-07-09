const { Message } = require("discord.js");
const Client = require("../index");
const messageEarn = require("../modules/messageEarn/messageEarn");
const Poke = require("../modules/poke/poke")
const { Bank } = require("../functions");
/**
 * @param {Client} client 
 * @param {Message} message 
 */
module.exports=async(client,message)=>{
    if(client.config.modules.messageEarn){
        if(await messageEarn.checkCooldown(message.author.id)){
            await Bank.addMoney(message.author.id,messageEarn.reward)
            await messageEarn.setCooldown(message.author.id,message.createdTimestamp)
            console.log(`[Modules:messageEarn]${message.author.username} won ${messageEarn.reward}$`)
        }
        if(!await messageEarn.getCooldown(message.author.id)){
            await messageEarn.addCooldown(message.author.id,message.createdTimestamp)
        }
    }
    if(client.config.modules.poke){
        if(Poke.checkValid(message)&&Poke.check()){
            await Poke.giveReward((await Poke.getUser(message)).id)
            await message.channel.send({content:`Congratulations **${(await Poke.getUser(message)).user.username}**, you won a point.`})
            console.log(`[Modules:Poke]${(await Poke.getUser(message)).user.username} won ${Poke.reward}$`)
        }
    }
}