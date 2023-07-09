const { SlashCommandBuilder, CommandInteraction, EmbedBuilder } = require("discord.js");
const Client = require("..");
const Store = require("../modules/store/store");

module.exports={
    module:"store",
    data:new SlashCommandBuilder().setName("store").setDescription("A marketplace").addSubcommand(subcommand=>
        subcommand.setName("buy").setDescription("Buy items from the marketplace")
    ).setDMPermission(false),
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async execute(client,interaction){
        const items = await Store.getItems();
        const embed = new EmbedBuilder()
        if(items.length==0){
            embed.setDescription("Looks like the store is empty")
            return await interaction.editReply({embeds:[embed]})
        }
        embed.setDescription(items.map(r=>`**${r.name}** $${r.price}`).join("\n"))
        return await interaction.editReply({embeds:[embed]})
    }
}