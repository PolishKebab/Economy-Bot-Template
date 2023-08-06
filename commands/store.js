const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Client = require("..");
const Store = require("../modules/store/store");
const Inventory = require("../modules/Inventory/inventory");
const { Bank } = require("../functions");
module.exports={
    module:"store",
    data:new SlashCommandBuilder().setName("store").setDescription("A marketplace").addSubcommand(subcommand=>
        subcommand.setName("buy").setDescription("Buy items from the marketplace").addStringOption(option=>
            option.setName("item").setDescription("The item you want to buy").setAutocomplete(true).setRequired(true)
        )
    ).addSubcommand(subcommand=>
        subcommand.setName("items").setDescription("List of items avalible in store")
    ).setDMPermission(false),
    /**
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(client,interaction){
        const embed = new EmbedBuilder()
        if(interaction.options.getSubcommand()=="buy"){
            const item = await Store.getItem(interaction.options.getString("item"))
            const user = await Bank.getUser(interaction.user.id)
            if(!item){
                embed.setDescription(`An item with the name \`${interaction.options.getString("item")}\` doesn't exist.`)
                return await interaction.editReply({embeds:[embed]})
            }
            if(user.credits>=item.price){
                await Bank.removeMoney(interaction.user.id,item.price)
                await Inventory.giveItem(interaction.user.id,item.id)
                embed.setDescription(`Added ${item.name} to your inventory.`)
            }else{
                embed.setDescription(`You don't have enough credits to buy ${item.name}`)
            }
            return await interaction.editReply({embeds:[embed]})
        }
        if(interaction.options.getSubcommand()=="items"){
            const items = (await Store.getItems()).slice(0,15);
            if(!items.length){
                embed.setDescription(`It seems like the store is empty.`)
                return await interaction.editReply({embeds:[embed]})
            }
            embed.setDescription(`${items.map(r=>`${r.name} \`${r.description}\` $${r.price}`).join("\n")}`)
            return await interaction.editReply({embeds:[embed]})
        }
    }
}