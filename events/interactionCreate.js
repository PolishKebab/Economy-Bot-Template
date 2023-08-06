const {Interaction}=require('discord.js')
const Client = require("../index")
const Store = require('../modules/store/store')
/**
* @param {Client} client
* @param {Interaction} interaction
*/
module.exports=async(client,interaction)=>{
if(interaction.isAutocomplete()){
    if(client.config.modules.store){
        const value = await interaction.options.getFocused(true)
        if(interaction.options.getSubcommand()=="buy"){
            const items = await Store.getItems();
            await interaction.respond(items.filter(r=>r.name.includes(value.value)).map(r=>({name:r.name,value:r.name})).slice(0,24))
        }
    }
}
if(interaction.isCommand()){
try{
await interaction.deferReply()
    await client.commands.get(interaction.commandName).execute(client,interaction)
    console.log(`[${interaction.user.username}] executed /${interaction.commandName}`)
}catch(e){
    console.log(e)
    await interaction.editReply({content:e.message.toString()})
        }
    }
}