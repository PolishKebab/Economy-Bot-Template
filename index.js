const {Client:cln,Partials,IntentsBitField,Collection,ClientOptions,SlashCommandBuilder,CommandInteraction} = require("discord.js")
const fs = require("fs")
/**
 * @typedef CommandData
 * @property {SlashCommandBuilder} data
 * @property {(client:Client,interaction:CommandInteraction)=>Promise<void>} execute
 */
class Client extends cln{
    /**
     * @type {Collection<String,CommandData>}
     */
    commands = new Collection();
    config = require("./config.json")
    /**
     * @param {ClientOptions} options 
     */
    constructor(options){
      super(options);
      for(let command of fs.readdirSync("./commands")){
        const cmd = require(`./commands/${command}`);
        this.commands.set(cmd.data.name,cmd);
      }
    }
}
const client = new Client({intents:[IntentsBitField.Flags.Guilds,IntentsBitField.Flags.GuildMessages],partials:[Partials.Message]})
for(let event of fs.readdirSync("./events")){
    try{
        client.on(event.split(".")[0],async(...args)=>await require(`./events/${event}`)(client,...args))
    }catch(e){
        console.error(e)
    }
}
client.login(client.config.token);
module.exports=Client