const {Interaction}=require('discord.js')
const Client = require("../index")
/**
* @param {Client} client
* @param {Interaction} interaction
*/
module.exports=async(client,interaction)=>{
if(interaction.isCommand()){
try{
await interaction.deferReply()
    await client.commands.get(interaction.commandName).execute(client,interaction)
    console.log(`[${interaction.user.username}] execute /${interaction.commandName}`)
}catch(e){
    console.log(e)
    await interaction.editReply({content:e.message.toString()})
        }
    }
}