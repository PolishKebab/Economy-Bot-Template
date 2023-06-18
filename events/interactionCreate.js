const {Interaction}=require('discord.js')
const {Client} = require("../index")
/**
* @param {Client} client
* @param {Interaction} interaction
*/
module.exports=async(client,interaction)=>{
if(interaction.isCommand()){
try{
await interaction.deferReply()
    await bot.commands.get(interaction.commandName).execute(client,interaction)
}catch(e){
    console.log(e)
    await interaction.editReply({content:e.message.toString()})
        }
    }
}