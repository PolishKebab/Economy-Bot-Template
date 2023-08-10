const {Client:cln,Partials,IntentsBitField,Collection,ClientOptions,SlashCommandBuilder,CommandInteraction} = require("discord.js")
const fs = require("fs");
const readline = require("readline").createInterface({input:process.stdin});
const functions = require("./functions");
/**
 * @typedef CommandData
 * @property {SlashCommandBuilder} data
 * @property {String} module
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
        /**
         * @type {CommandData}
         */
        const cmd = require(`./commands/${command}`);
        if(require("./config.json").modules[cmd.module]){
          this.commands.set(cmd.data.name,cmd);
        }
      }
    }
}
const client = new Client({intents:[IntentsBitField.Flags.Guilds,IntentsBitField.Flags.GuildMessages,IntentsBitField.Flags.MessageContent],partials:[Partials.Message]})
for(let event of fs.readdirSync("./events")){
    try{
        client.on(event.split(".")[0],async(...args)=>await require(`./events/${event}`)(client,...args))
    }catch(e){
        console.error(e)
    }
}
readline.on("line",async(line)=>{
  try{
    var dat=eval(line)
    if(dat instanceof Promise)dat=await dat
    console.log(dat)
  }catch(e){
    console.log(e)
  }

})
client.login(client.config.token);
module.exports=Client