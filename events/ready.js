const Client = require("../index");
const { checkSlashCommandUpdates, CommandDatabase, decode } = require("../functions");
const { REST, Routes } = require("discord.js");
const { API } = require("../modules/API");
/**
 * @param {Client} client 
 */
module.exports=async(client)=>{
    console.log(`Bot online on ${client.guilds.cache.size} guilds as ${client.user.username}`);
    const updates = await checkSlashCommandUpdates(client);
    for(let {name,data,action} of updates){
        if(action=="insert"){
            await CommandDatabase.addCommand(name,data)
        }
        if(action=="update"){
            await CommandDatabase.editCommand(name,data)
        }
        if(action=="delete"){
            await CommandDatabase.removeCommand(name)
        }
    }
    const rest = new REST().setToken(client.config.token)
    await rest.put(
        Routes.applicationCommands(client.user.id),
        {body: updates.map(r=>JSON.parse(decode(r.data)))}
    )
    new API()
    console.log("Checking module status...")
    for(let module in client.config.modules){
        console.log(`[Modules:${module}] ${client.config.modules[module]?"on":"off"}.`)
    }
    console.log("Module status checked.")
}