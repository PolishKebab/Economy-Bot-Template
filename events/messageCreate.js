const { Message } = require("discord.js");
const Client = require("../index");
const { messageEarn } = require("../modules/messageEarn");
const { Bank } = require("../functions");
/**
 * @param {Client} client 
 * @param {Message} message 
 */
module.exports=async(client,message)=>{
    if(client.config.module.messageEarn){
        if(await messageEarn.checkCooldown(message.author.id)){
            await Bank.addMoney(message.author.id,messageEarn.reward)
            await messageEarn.setCooldown(message.author.id,message.createdTimestamp)
        }
        if(!await messageEarn.getCooldown(message.author.id)){
            await messageEarn.addCooldown(message.author.id,message.createdTimestamp)
        }
    }
}