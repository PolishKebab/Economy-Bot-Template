const { Client } = require("..");
const { checkSlashCommandUpdates } = require("../functions");
/**
 * @param {Client} client 
 */
module.exports=(client)=>{
    console.log(`Bot online on ${client.guilds.cache.size} guilds as ${client.user.username}`);
    const updates = checkSlashCommandUpdates(client);
    
}